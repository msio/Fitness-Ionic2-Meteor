import {Component, NgZone, ViewChild} from '@angular/core';
import {NavParams, Events, NavController, Tabs} from "ionic-angular";
import {MatchesPage} from "../matches/matches";
import {ChatsPage} from "../chats/chats";
import {SettingsPage} from "../settings/settings";
import {UserPoolPage} from "../user-pool/user-pool";
import {
    CHANGE_TAB_EVENT,
    CHAT_TAB_BADGE_INC_EVENT, MATCHES_BADGE_INC_EVENT, MESSAGE_PAGE_ACTIVE_EVENT,
    POKES_BADGE_INC_EVENT
} from "../../constants/events";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {isDefined, isUndefined} from "ionic-angular/util/util";
import {FitnessPage} from "../fitness/fitness";

declare let _;

@Component({
    templateUrl: 'tabs.html'
})

export class TabsPage {

    @ViewChild('tabs') tabs: Tabs;

    tabIndex: number = 0;
    chatsBadgeNumber: number = 0;
    matchesBadgeNumber: number = 0;

    tab1Root: any = FitnessPage;
    tab2Root: any = MatchesPage;
    tab3Root: any = ChatsPage;
    tab4Root: any = SettingsPage;
    tab5Root: any = UserPoolPage;

    constructor(public nav: NavController, public zone: NgZone, public events: Events, public params: NavParams, public dataSharing: DataComponentSharing) {
        this.tabIndex = _.isUndefined(params.get('selected')) ? 0 : params.get('selected');
        this.init();
    }

    init() {
        this.loadMatchesTabBadges();
        this.events.subscribe(CHAT_TAB_BADGE_INC_EVENT, (params: { badgeTabCount: number, chatId: string, unseen: number }) => {
            const messageChatId = this.dataSharing.getValue(MESSAGE_PAGE_ACTIVE_EVENT);
            if (isUndefined(messageChatId) || (isDefined(messageChatId) && messageChatId !== params.chatId)) {
                let update = params.unseen === 0 ? {$set: {unseen: 0}} : {$inc: {unseen: params.unseen}};
                CollectionCache.Chats.update({_id: params.chatId}, update, (error) => {
                    if (error) console.log(error);
                    this.zone.run(() => {
                        const tempCalc = this.chatsBadgeNumber + params.badgeTabCount;
                        this.chatsBadgeNumber = tempCalc > 0 ? tempCalc : 0;
                    });
                });
            }
        });

        this.events.subscribe(POKES_BADGE_INC_EVENT, (params: { badgeTabCount: number }) => {
            const tempCalc = this.matchesBadgeNumber + params.badgeTabCount;
            this.zone.run(() => {
                this.matchesBadgeNumber = tempCalc > 0 ? tempCalc : 0;
            });
        });

        this.events.subscribe(MATCHES_BADGE_INC_EVENT, (params: { badgeTabCount: number }) => {
            const tempCalc = this.matchesBadgeNumber + params.badgeTabCount;
            this.zone.run(() => {
                this.matchesBadgeNumber = tempCalc > 0 ? tempCalc : 0;
            });
        });

        this.events.subscribe(CHANGE_TAB_EVENT, (tabIndex: number, data?: any) => {
            this.tabs.select(tabIndex);
        });

    }

    loadMatchesTabBadges() {
        const pokesUnseenCount = CollectionCache.Pokes.find({unseen: true}).count();
        const matchesUnseenCount = CollectionCache.Matches.find({unseen: true}).count();
        this.zone.run(() => {
            this.matchesBadgeNumber = this.matchesBadgeNumber === 0 ? pokesUnseenCount + matchesUnseenCount : this.matchesBadgeNumber;
        });
    }
}
