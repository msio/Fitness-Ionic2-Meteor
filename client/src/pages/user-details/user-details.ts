import {Component} from '@angular/core';
import {
    NavController, NavParams
} from 'ionic-angular';
import {AboutYouPage} from "../about-you/about-you";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {isDefined} from "ionic-angular/util/util";
import {ABOUT_BACK} from "../../constants/constants";


@Component({
    selector: 'page-user-details',
    templateUrl: 'user-details.html'
})
export class UserDetailsPage {

    user;

    constructor(public navCtrl: NavController, public params: NavParams, public dataSharing: DataComponentSharing) {
        this.user = params.get('user');
    }

    goToAboutYou() {
        new Promise((resolve) => {
            this.navCtrl.push(AboutYouPage, {resolve: resolve, about: this.user.profile.about});
        }).then((data) => {
            this.user.profile.about = data;
        });
    }
}