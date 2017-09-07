import {Component, ViewChild, OnInit} from '@angular/core';
import {Platform, Nav, LoadingController, ToastController} from 'ionic-angular';
import * as moment from 'moment';
import 'moment/min/locales';

import {LoginTypePage} from "../pages/login-type/login-type";
import {Storage} from "@ionic/storage";
import {CollectionCache} from "../meteor-client/collections-cache";
import {isDefined} from "ionic-angular/util/util";
import {SubscriptionService} from "../providers/subscription-service";
import {MeteorObservable} from "meteor-rxjs";
import {LOGIN_TOKEN} from "../constants/constants";
import {PushNotificationService} from "../providers/push-notification-service";
import {ApplicationUtil} from "../util/application-util";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {ImageLoaderConfig} from "ionic-image-loader";
import {UserPoolPage} from "../pages/user-pool/user-pool";
import {TabsPage} from "../pages/tabs/tabs";

declare let Meteor, Accounts;

@Component({
    template: `
        <ion-nav></ion-nav>`,
    providers: [SubscriptionService, PushNotificationService]
})

export class Main implements OnInit {

    @ViewChild(Nav) nav: Nav;
    loggedUserId;
//
    constructor(public toastCtrl: ToastController, private statusBar: StatusBar, private splashScreen: SplashScreen, public imageLoaderConfig: ImageLoaderConfig, public platform: Platform, public storage: Storage, public loadingCtrl: LoadingController, public subscriptionService: SubscriptionService, public pushNotificationService: PushNotificationService) {
        this.configMomentLocales();
        this.imageLoaderConfig.useImageTag(true);
        // this.imageLoaderConfig.setImageReturnType('base64');

        if (platform.is('cordova')) {
            this.initializeNative();
        }
        this.loggedUserId = Meteor.userId();
    }

    ngOnInit() {
        //on every startup
        Accounts.onLogin(() => {
            const loginToken = Accounts._storedLoginToken();
            if (loginToken != null) {
                this.storage.ready().then(() => {
                    this.storage.set('loginToken', loginToken);
                });
            }
        });
        this.pushNotificationService.initOneSignal();
        CollectionCache.init().then(() => {
            //check if Meteor.user() and token is saved
            this.checkLoginStatus().then(() => {
                this.startCheckingLoginStatus();
                this.nav.setRoot(TabsPage, {selected: ApplicationUtil.getTabIndex()});
                // this.nav.setRoot(UserPoolPage, {userSearchParams: {membership: []}});
            }, () => {
                this.nav.setRoot(LoginTypePage);
            });
        });
    }

    /**
     * checks login status (if user is logged in) constantly
     */
    startCheckingLoginStatus() {
        MeteorObservable.autorun().subscribe(() => {
            if (Meteor.user() === null) {
                this.storage.ready().then(() => {
                    this.storage.get(LOGIN_TOKEN).then((token) => {
                        if (token !== null) {
                            let loading = this.loadingCtrl.create({
                                content: 'Logging...'
                            });
                            loading.present();
                            Meteor.loginWithToken(token, (error) => {
                                if (isDefined(error)) {
                                    console.log(error);
                                    loading.dismiss();
                                    this.nav.setRoot(LoginTypePage);
                                } else {
                                    loading.dismiss()
                                }
                            });
                        } else {
                            this.nav.setRoot(LoginTypePage);
                        }
                    });
                });
            }
        });
    }

    /**
     * checks login status only one once
     *
     * @returns {Promise<any>}
     */
    checkLoginStatus() {
        return new Promise((resolve, reject) => {
            if (Meteor.user() === null) {
                this.storage.ready().then(() => {
                    this.storage.get(LOGIN_TOKEN).then((token) => {
                        if (token !== null) {
                            Meteor.loginWithToken(token, (error) => {
                                if (isDefined(error)) {
                                    console.log(error);
                                    reject();
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            reject();
                        }
                    });
                });
            } else {
                resolve();
                this.subscriptionService.init(this.nav, this.toastCtrl);
            }
        });
    }

    private initializeNative(): void {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    configMomentLocales() {
        //TODO create own moment pipe
        moment.updateLocale('en', {
            calendar: {
                sameDay: '[Today]',
                nextDay: '[Tomorrow]',
                nextWeek: 'DD.MM',
                sameElse: 'DD.MM'
            }
        });
    }


}
