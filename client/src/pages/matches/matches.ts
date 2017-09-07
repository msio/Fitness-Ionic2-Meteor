import {Component, NgZone} from '@angular/core';
import {NavController, Events} from 'ionic-angular';
import {MeteorObservable} from "meteor-rxjs";
import {Pokes, Matches} from "../../meteor-client/collections";
import {FoundUserDetailsPage} from "../found-user-details/found-user-details";
import {FOUND_USER_DETAILS_TYPE_ENUM, PAGE_ENUM, POKE_TYPE} from "../../enums/enums";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {FOUND_USER_DETAILS_EVENT, POKES_BADGE_INC_EVENT, MATCHES_BADGE_INC_EVENT} from "../../constants/events";
import {isDefined} from "ionic-angular/util/util";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {ApplicationUtil} from "../../util/application-util";

declare let _;

@Component({
    selector: 'page-matches',
    templateUrl: 'matches.html'
})
export class MatchesPage {

    POKE_TYPE = POKE_TYPE;
    pokes: Array<any>;
    matches: Array<any>;
    pokeType: POKE_TYPE;
    pokesBadgeCount: number = 0;
    matchesBadgeCount: number = 0;

    pokesBadgeIncSub;
    matchesBadgeIncSub;
    pokesAutorunSub;
    matchesAutorunSub;

    constructor(public zone: NgZone, public events: Events, public navCtrl: NavController, public dataSharing: DataComponentSharing) {
        this.pokeType = POKE_TYPE.POKES;
        this.init();
    }

    init() {
        this.pokesBadgeIncSub = this.events.subscribe(POKES_BADGE_INC_EVENT, (params: { badgeTabCount: number }) => {
            const tempCalc = this.pokesBadgeCount + params.badgeTabCount;
            if (!ApplicationUtil.isCurrentPage(PAGE_ENUM.MATCHES)) {
                this.pokeType = POKE_TYPE.POKES;
            }
            this.zone.run(() => {
                this.pokesBadgeCount = tempCalc > 0 ? tempCalc : 0;
            });
        });
        this.matchesBadgeIncSub = this.events.subscribe(MATCHES_BADGE_INC_EVENT, (params: { badgeTabCount: number }) => {
            const tempCalc = this.matchesBadgeCount + params.badgeTabCount;
            if (!ApplicationUtil.isCurrentPage(PAGE_ENUM.MATCHES)) {
                this.pokeType = POKE_TYPE.MATCHES;
            }
            this.zone.run(() => {
                this.matchesBadgeCount = tempCalc > 0 ? tempCalc : 0;
            });
        });
    }

    subscribeMatches() {
        this.getMatches();
        this.matchesAutorunSub = MeteorObservable.autorun().subscribe(() => {
            this.getMatches();
        });
    }

    subscribePokes() {
        this.getPokes();
        this.pokesAutorunSub = MeteorObservable.autorun().subscribe(() => {
            this.getPokes();
        });
    }

    getMatches() {
        Matches.find().startWith([]).map((res) => {
            return res.map((match: any) => {
                let item = _.omit(match, 'matchedUser');
                item.foundUser = match.matchedUser;
                const matchesSeenStatus = CollectionCache.Matches.findOne(match._id);
                if (isDefined(matchesSeenStatus) && matchesSeenStatus.unseen === true) {
                    item.unseen = true;
                }
                return item;
            });
        }).subscribe((res) => {
            this.matches = res;
        });
    }

    getPokes() {
        Pokes.find().startWith([]).map((res) => {
            return res.map((poke: any) => {
                let item = _.omit(poke, 'createdByUser');
                item.foundUser = poke.createdByUser;
                const pokeSeenStatus = CollectionCache.Pokes.findOne(poke._id);
                if (isDefined(pokeSeenStatus) && pokeSeenStatus.unseen === true) {
                    item.unseen = true;
                }
                return item;
            });
        }).subscribe((res) => {
            this.pokes = res;
            this.pokes = res;
        });
    }

    goToFoundUserDetails(poke) {
        if (this.pokeType === POKE_TYPE.POKES) {
            poke.foundUser.pokeId = poke._id;
        }
        poke.foundUser.matched = this.pokeType === POKE_TYPE.MATCHES;
        if (this.pokeType === POKE_TYPE.POKES) {
            CollectionCache.Pokes.update({_id: poke._id}, {$set: {unseen: false}}, (error) => {
                if (error) console.log(error);
                this.events.publish(POKES_BADGE_INC_EVENT, {badgeTabCount: -1});
                poke.unseen = false;
                if (this.pokesBadgeCount > 0) {
                    this.pokesBadgeCount--;
                }
            });
        } else {
            CollectionCache.Matches.update({_id: poke._id}, {$set: {unseen: false}}, (error) => {
                if (error) console.log(error);
                this.events.publish(MATCHES_BADGE_INC_EVENT, {badgeTabCount: -1});
                poke.unseen = false;
                if (this.matchesBadgeCount > 0) {
                    this.matchesBadgeCount--;
                }
            });
        }
        poke.foundUser.membership = poke.membership;
        poke.foundUser.exercises = poke.exercises;
        poke.foundUser.locAddress = poke.locAddress;
        this.navCtrl.push(FoundUserDetailsPage, {foundUser: poke.foundUser, type: FOUND_USER_DETAILS_TYPE_ENUM.MATCH});
    }

    ionViewWillEnter() {
        this.subscribePokes();
        this.subscribeMatches();
        ApplicationUtil.setCurrentPage(PAGE_ENUM.MATCHES);
        this.pokesBadgeCount = CollectionCache.Pokes.find({unseen: true}).count();
        this.matchesBadgeCount = CollectionCache.Matches.find({unseen: true}).count();
        const value = this.dataSharing.getValue(FOUND_USER_DETAILS_EVENT);
        if (isDefined(value)) {
            this.dataSharing.delete(FOUND_USER_DETAILS_EVENT);
            this.pokeType = value;
            if (this.pokeType === POKE_TYPE.MATCHES) {
                this.getMatches();
            } else {
                this.getPokes();
            }
        }
    }

    ionViewWillLeave() {
        ApplicationUtil.setCurrentPage(undefined);
        if (isDefined(this.pokesBadgeIncSub)) {
            this.pokesBadgeIncSub.unsubscribe();
        }
        if (isDefined(this.matchesBadgeIncSub)) {
            this.matchesBadgeIncSub.unsubscribe();
        }
        if (isDefined(this.pokesAutorunSub)) {
            this.pokesAutorunSub.unsubscribe();
        }
        if (isDefined(this.matchesAutorunSub)) {
            this.matchesAutorunSub.unsubscribe();
        }
    }

}
