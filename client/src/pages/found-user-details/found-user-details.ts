import {Component, ElementRef, ViewChild} from '@angular/core';
import {
    NavController, NavParams, Slides, LoadingController, AlertController, Events,
    ViewController, Alert
} from 'ionic-angular';
import lineClamp from 'line-clamp';


import {UserPoolService} from "../../providers/user-pool-service";
import {LocationDetails} from "../location-details/location-details";
import {MeteorObservable} from "meteor-rxjs";
import {FOUND_USER_DETAILS_TYPE_ENUM, POKE_TYPE, PAGE_ENUM} from "../../enums/enums";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {FOUND_USER_DETAILS_EVENT, REMOVED_USERS_POOL_ENTRY_EVENT} from "../../constants/events";
import {isUndefined} from "ionic-angular/util/util";
import {MessagesPage} from "../messages/messages";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {TabsService} from "../../providers/tabs-service";
import {ApplicationUtil} from "../../util/application-util";
import {METHOD} from "../../constants/api-points";

declare let Meteor;

@Component({
    selector: 'page-found-user-details',
    templateUrl: 'found-user-details.html',
    providers: [UserPoolService]
})
export class FoundUserDetailsPage {

    FOUND_USER_DETAILS_TYPE = FOUND_USER_DETAILS_TYPE_ENUM;
    REMOVE_USERPOOL_TIME_EXPIRATION = 2000;//ms
    FOOTER_BUTTON_HEIGHT = '4.6rem';

    @ViewChild('slider') slider: Slides;
    @ViewChild('bio') bioElemRef: ElementRef;

    foundUser;
    type: FOUND_USER_DETAILS_TYPE_ENUM;
    alert: Alert;
    bioText: string;
    showAllBioButton: boolean = true;

    constructor(public navParams: NavParams, public alertCtrl: AlertController, public viewCtrl: ViewController, public events: Events, public navCtrl: NavController, public loadingCtrl: LoadingController, public dataSharing: DataComponentSharing, public tabsService: TabsService) {
        this.foundUser = navParams.get('foundUser');
        console.log(this.foundUser);
        this.type = navParams.get('type');
        this.init();
    }


    poke() {
        let loading = this.loadingCtrl.create({
            content: 'Poking...'
        });
        loading.present();
        MeteorObservable.call(METHOD.CREATE_POKES, {
            userPoolEntryId: this.foundUser._id
        }).subscribe(() => {
            loading.dismiss();
            this.foundUser.poked = true;
        }, (error) => {
            loading.dismiss();
            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Try poking again!',
                buttons: ['OK']
            }).present();
        });
    }

    confirmPoke() {
        let loading = this.loadingCtrl.create({
            content: 'Matching...'
        });
        loading.present();
        MeteorObservable.call(METHOD.CREATE_MATCHES, {pokeId: this.foundUser.pokeId}).subscribe(() => {
            loading.dismiss();
            this.dataSharing.setValue(FOUND_USER_DETAILS_EVENT, POKE_TYPE.MATCHES);
            this.navCtrl.pop();
        }, (error) => {
            loading.dismiss();
            this.alertCtrl.create({
                title: 'Confirm Poke Error',
                message: 'Confirmation was not done, try again please!',
                buttons: ['OK']
            }).present();
            console.log(error);
        });
    }

    showAllBio() {
        this.showAllBioButton = false;
        this.bioElemRef.nativeElement.innerText = this.bioText;
    }

    goToMessagePage() {
        //TODO save loaded id to Chats so that next time won't be called this method
        let chat = CollectionCache.Chats.findOne({'receiver._id': this.foundUser.userId});
        if (isUndefined(chat)) {
            chat = {
                _id: undefined,
                receiver: {
                    _id: this.foundUser.userId,
                    picture: this.foundUser.picture,
                    firstName: this.foundUser.name.firstName
                }
            }
        }
        this.navCtrl.push(MessagesPage, {chat: chat});
    }

    init() {
        this.events.subscribe(REMOVED_USERS_POOL_ENTRY_EVENT, (doc) => {
            if (doc._id === this.foundUser._id && isUndefined(this.alert)) {
                this.alert = this.alertCtrl.create({
                    title: 'Expiration',
                    subTitle: 'Activity Start is about the expire',
                    enableBackdropDismiss: false
                });
                this.alert.present();
                setTimeout(() => {
                    this.viewCtrl.dismiss({}, '', {animate: false}).then(() => {
                        this.alert.dismiss();
                    });
                }, this.REMOVE_USERPOOL_TIME_EXPIRATION);
            }
        });
    }

    ionViewWillEnter() {
        ApplicationUtil.setCurrentPage(PAGE_ENUM.FOUND_USER_DETAILS);
        this.tabsService.hide(this.FOOTER_BUTTON_HEIGHT);
    }

    ngAfterViewInit() {
        this.bioText = this.bioElemRef.nativeElement.innerText;
        lineClamp(this.bioElemRef.nativeElement, {lineCount: 2});
        //show All button if there is more than 1 line
        this.showAllBioButton = this.getLinesCount(this.bioElemRef.nativeElement) > 1;
    }

    getLinesCount(element): number {
        const prevLH = element.style.lineHeight;
        const factor = 1000;
        element.style.lineHeight = factor + 'px';
        const height = element.getBoundingClientRect().height;
        element.style.lineHeight = prevLH;
        return Math.floor(height / factor);
    }

    ionViewWillLeave() {
        ApplicationUtil.setCurrentPage(undefined);
        this.tabsService.show();
        this.events.unsubscribe(REMOVED_USERS_POOL_ENTRY_EVENT);
    }


}
