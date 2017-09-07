import {Injectable} from '@angular/core';
import {Alert, AlertController, NavController, Platform} from "ionic-angular";
import {TabsPage} from "../tabs/tabs";
import {UserDataService} from "../../providers/user-data-service";
import {AuthFacebook, UserData} from "../../models/user-data";
import {PLATFORM} from "../../constants/platforms";


@Injectable()
export class ViewInterface {
    constructor(public  navCtrl: NavController, public platform: Platform, public alertCtrl: AlertController, public userDataService: UserDataService) {

    }

    loginWithFacebook(authFacebook: AuthFacebook, userData: UserData) {
        this.userDataService.loginWithFacebook(authFacebook, userData).subscribe(() => {
            this.navCtrl.push(TabsPage);
        }, (error) => {
            this.alertCtrl.create({
                title: 'Login Error',
                message: 'Try again or choose another login type',
                buttons: ['Ok']
            }).present();
        });
    }

    currentLocationErrorAlert(): Alert {
        let message;
        if (this.platform.is(PLATFORM.ANDROID)) {
            message = 'Access to your Current Location can\'t be made,Please Try again or Turn on Location Mode on High Accuracy in Settings!';
        } else {
            message = 'Access to your Current Location can\'t be made, Please Turn on Locations Services in Settings';
        }
        return this.alertCtrl.create({
            title: 'Can\'t get Current location',
            message: message,
            buttons: ['OK'],
            enableBackdropDismiss: false
        });
    }

}
