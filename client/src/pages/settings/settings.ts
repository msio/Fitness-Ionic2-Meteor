import {Component} from '@angular/core';
import {LoadingController, AlertController, Nav, NavController} from 'ionic-angular';
import {UserDataService} from "../../providers/user-data-service";
import {LoginTypePage} from "../login-type/login-type";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {Storage} from "@ionic/storage";
import {LOGIN_TOKEN} from "../../constants/constants";
import {UserDetailsPage} from "../user-details/user-details";
import {DataComponentSharing} from "../../providers/data-component-sharing";

declare let Meteor;

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
//TODO can do no action that requires internet connection
export class SettingsPage {

    user;
    isCurrentPosition: boolean = true;

    constructor(public storage: Storage, public nav: Nav, public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public userDataService: UserDataService, public dataSharing: DataComponentSharing) {
        this.user = Meteor.user();
    }

    goToUserDetails() {
        this.navCtrl.push(UserDetailsPage, {user: this.user});
    }

    logout() {
        let loading = this.loadingCtrl.create({
            content: 'Logging out...'
        });
        loading.present();
        this.userDataService.logout().subscribe(() => {
            this.storage.clear().then(() => {
                // CollectionCache.clearCollectionCaches();
                loading.dismiss();
                this.nav.setRoot(LoginTypePage, {}, {animate: true, direction: 'back'});
            });
        }, (error) => {
            loading.dismiss();
            this.alertCtrl.create({
                title: 'Log Out Error',
                message: 'Try again!',
                buttons: ['Ok']
            }).present();
        });
    }

    goToPositionSelector() {

    }

    ionViewWillEnter() {
        this.user = Meteor.user();
    }
}
