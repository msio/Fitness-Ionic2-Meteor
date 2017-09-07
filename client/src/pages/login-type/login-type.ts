import {Component,} from '@angular/core';
import {NavController, Platform, LoadingController, AlertController, ToastController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import * as moment from 'moment';


import {DEVICE} from "../../constants/platforms";
import {FB_LOGIN_STATUS} from "../../constants/constants";
import {UserSignUpPersonalDataPage} from "../user-sign-up-personal-data/user-sign-up-personal-data";
import {UserSignUpOtherDataPage} from "../user-sign-up-other-data/user-sign-up-other-data";
import {BIRTHDAY_TRANSFER_FORMAT} from "../../constants/date-time-formats";
import {UserDataService} from "../../providers/user-data-service";
import {ViewInterface} from "../view-interface/view-interface";
import {Credentials} from "../../models/credentials";
import {TabsPage} from "../tabs/tabs";
import {SubscriptionService} from "../../providers/subscription-service";
import {Facebook, FacebookLoginResponse} from "@ionic-native/facebook";

// TODO you can write typings or declare it here
declare let _;

@Component({
    selector: 'page-login-type',
    templateUrl: 'login-type.html',
    providers: [ViewInterface]
})
export class LoginTypePage {

    FB_GRAPH_QUERY = '/me?fields=firstName,lastName,gender,birthday,email,picture.width(250)';
    FB_ACCESS_PERMISSIONS = ['public_profile', 'user_birthday', 'email'];
    FB_LOGIN_METHOD_NAME = 'native-facebook';
    FB_USER_BIRTHDAY_FORMAT = 'MM/DD/YYYY';
    FB_AUTH_RESP = {ACCESS_TOKEN: 'accessToken', EXPIRES_IN: 'expiresIn', USER_ID: 'userID'};

    loginForm: FormGroup;

    constructor(private facebook: Facebook, public toastCtrl: ToastController, public platform: Platform, public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public formBuilder: FormBuilder, public userDataService: UserDataService, public viewInterface: ViewInterface, public subscriptionService: SubscriptionService) {
        this.initLoginForm();
    }

    login() {
        if (this.loginForm.valid) {
            let loading = this.loadingCtrl.create({
                content: 'Logging in...'
            });
            loading.present();
            loading.onDidDismiss(() => {
                this.subscriptionService.init(this.navCtrl, this.toastCtrl);
                this.navCtrl.setRoot(TabsPage);
            });
            this.userDataService.login(new Credentials(this.loginForm.value)).subscribe(() => {
                loading.dismiss();
            }, error => {
                loading.dismiss();
                if (error.reason === 'Incorrect password' || error.reason === 'User not found') {
                    this.alertCtrl.create({
                        title: 'Login Error',
                        message: 'Please check your email and password and try again!',
                        buttons: ['Ok']
                    }).present();
                } else {
                    this.alertCtrl.create({
                        title: 'Login Error',
                        message: 'Try again or choose another login type',
                        buttons: ['Ok']
                    }).present();
                }
            });
        }
    }

    initLoginForm() {
        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    goToSignUpPage() {
        this.navCtrl.push(UserSignUpPersonalDataPage);
    }

    /**
     * The person's birthday. This is a fixed format string, like MM/DD/YYYY. However, people can control who can see the year they were born separately from the month and day so this string can be only the year (YYYY) or the month + day (MM/DD)
     // * used first time in code on 23.11.20016
     *
     * @param birthday
     * @returns {ISO String}
     */
    parseFBBirthday(birthday: string) {
        const parsed = moment(birthday, this.FB_USER_BIRTHDAY_FORMAT, true);
        return parsed.isValid() ? parsed.format(BIRTHDAY_TRANSFER_FORMAT) : null;
    }

    validateFBFields(graphRes: any) {
        let userData = {
            firstName: null,
            lastName: null,
            gender: null,
            birthday: null,
            email: null,
            picture: {data: {}, type: 'none'}
        };
        userData.firstName = graphRes.firstName;
        userData.lastName = graphRes.lastName;
        userData.birthday = this.parseFBBirthday(graphRes.birthday);
        userData.gender = graphRes.hasOwnProperty('gender') ? graphRes.gender : null;
        //TODO confirmation of email is necessary but only if user signs up directly without phone verification. it has to be confirmed before user searches for fitness partners, if email is not confirmed, it will be noted in db like not confirmed
        userData.email = graphRes.hasOwnProperty('email') ? graphRes.email : null;
        //if silhouette is true, no fb picture is set
        userData.picture = graphRes.picture.data && !graphRes.picture.data.is_silhouette ? {
            data: graphRes.picture.data.url,
            type: 'url'
        } : userData.picture;

        const personalMissing = _.every(_.without(userData, 'email'), (value, prop) => {
            return value !== null;
        });
        return {
            userData: userData,
            personalMissing: personalMissing,
            otherMissing: userData.email === null ? false : true
        }
    }

//TODO save token in secure storage to not request fb server every time
    checkFBLoginStatus(): Promise<any> {
        const promise = new Promise((resolve: Function, reject: Function) => {
            this.facebook.getLoginStatus().then(res => {
                if (res.status === FB_LOGIN_STATUS.CONNECTED) {
                    resolve(res.authResponse);
                } else {
                    //FB_LOGIN_STATUS.NOT_AUTHORIZED or FB_LOGIN_STATUS.UNKNOWN
                    resolve(null);
                }
            }, error => {
                reject(error);
            });
        });
        return promise;
    }

    continueFBLoginToServer(authRes: any, graphRes: any) {
        authRes = _.pick(authRes.authResponse, this.FB_AUTH_RESP.ACCESS_TOKEN, this.FB_AUTH_RESP.EXPIRES_IN, this.FB_AUTH_RESP.USER_ID);
        const validRes: any = this.validateFBFields(graphRes);
        if (validRes.personalMissing) {
            return this.navCtrl.push(UserSignUpPersonalDataPage, {userData: validRes.userData, authFacebook: authRes});
        } else if (validRes.otherMissing) {
            return this.navCtrl.push(UserSignUpOtherDataPage, {userData: validRes.userData, authFacebook: authRes});
        }
        this.viewInterface.loginWithFacebook(authRes, validRes.userData);
    }

    //TODO no facebook app is installed, use this cordova plugin inappbrowser
    loginWithFacebook() {
        if (this.platform.is(DEVICE.CORDOVA)) {
            this.platform.ready().then(() => {
                this.checkFBLoginStatus().then((loginStatusRes) => {
                    //user authenticated
                    if (loginStatusRes) {
                        //Get these fields firstName,lastName,gender,birthday,email,picture
                        this.facebook.api(this.FB_GRAPH_QUERY, []).then(graphRes => {
                            this.continueFBLoginToServer(loginStatusRes, graphRes);
                        }, graphError => {
                            //TODO user is authorized but cant get graph data, go to first,last... page
                            console.error('graphError', graphError);
                        });
                        //user not authenticated
                    } else {
                        this.facebook.login(this.FB_ACCESS_PERMISSIONS).then((loginRes: FacebookLoginResponse) => {
                            //Get these fields firstName,lastName,gender,birthday,email,picture
                            this.facebook.api(this.FB_GRAPH_QUERY, []).then(graphRes => {
                                this.continueFBLoginToServer(loginRes, graphRes);
                            }, graphError => {
                                //TODO user is authorized but cant get graph data, go to first,last... page
                                console.error('graphError', graphError);
                            });
                        }, loginError => {
                            // TODO stay on login type page or go to sign up directly
                            console.error('loginError', JSON.stringify(loginError));
                        });
                    }
                }, loginStatusError => {
                    // TODO stay on login type page or go to sign up directly
                    console.error('loginStatusError', loginStatusError);
                });
            });
        } else {
            const userData = {
                firstName: 'Michal',
                lastName: 'Test',
                gender: 'male',
                birthday: '1950-10-25',
                email: {value: 'test@gmail.com', type: 'facebook'},
                picture: null
            };
            const authFacebook = {
                // accessToken: 'dsfdsfdsfdsfsfdf',
                accessToken: 'EAAYWefBPgJUBAOeMKmafgQnolE7XvXfAeuKKI8Wt1UztrN1HeSo0Np1dEarmZBRLHEGGQtRcpWm8Gs9h0GTSZBfZCBV16BpVGTdgU0ZCtHmylI1DWWOk2FBcTbtlc4jSG2phxZCRuQOQtV7e3EtZC9IaZC8ymXTJaqAySNOPZAjSmCk830JKw3rYs7XDYuEywkQReUWSBIRXk7JvgEB3HbbMx3MUQ1IdzlcZD',
                expiresIn: 45435435345345345,
                userID: 'dfsd4543refrevefg'
            }
            this.viewInterface.loginWithFacebook(authFacebook, userData);
        }
    }
}
