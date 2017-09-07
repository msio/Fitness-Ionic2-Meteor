import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {Credentials} from "../models/credentials";
import {Observable} from 'rxjs/Rx';
import {UserDataPassword, UserData, AuthFacebook} from "../models/user-data";
import {Platform} from "ionic-angular";
import {DEVICE} from "../constants/platforms";
import {ApplicationUtil} from "../util/application-util";
import {MeteorObservable} from "meteor-rxjs";
import {isUndefined} from "ionic-angular/util/util";
import {Transfer, TransferObject} from "@ionic-native/transfer";
import {METHOD} from "../constants/api-points";

declare let _;
declare let Accounts;
declare let Meteor;

@Injectable()
export class UserDataService {

    constructor(private transfer: Transfer,public platform: Platform, public http: Http, public storage: Storage) {

    }

    login(credentials: Credentials): Observable<any> {
        return Observable.create(observer => {
            Accounts.callLoginMethod({
                methodArguments: [{
                    user: {email: credentials.email},
                    pass: Accounts._hashPassword(credentials.password),
                    //TODO device id will change if app will be updated
                    deviceId: !this.platform.is(DEVICE.CORDOVA) || isUndefined(ApplicationUtil.DeviceId) ? 'deviceId' : ApplicationUtil.DeviceId
                }],
                userCallback: (error) => {
                    if (error) {
                        console.log(error);
                        observer.error(error);
                    } else {
                        observer.next();
                    }
                }
            });
        });
    }

    uploadToCloudinary(imagePath: string): Observable<any> {
        return Observable.create(observer => {
            const fileTransfer: TransferObject = this.transfer.create();
            fileTransfer.upload(imagePath, 'https://api.cloudinary.com/v1_1/passionizer/image/upload', {
                params: {
                    'upload_preset': 'lsah3gdb'
                }
            }).then((data) => {
                let response = JSON.parse(data.response);
                console.log(response);
                response = _.pick(response, 'public_id', 'signature', 'url');
                observer.next(response);
            }, (error) => {
                observer.error(error);
            });
        });
    }

    uploadImage(imagePath: string): Observable<any> {
        return this.uploadToCloudinary(imagePath).flatMap((imgResp) => {
            return MeteorObservable.call(METHOD.ADD_PICTURE, imgResp);
        }, (imgResp, id) => {
            return {url: imgResp.url, _id: id}
        });
    }

    //TODO upload image if blob is set
    loginWithFacebook(authFacebook: AuthFacebook, userData: UserData): Observable<any> {
        return Observable.create(observer => {
            Accounts.callLoginMethod({
                methodArguments: [{
                    authFacebook: authFacebook,
                    userData: userData
                }], userCallback: (error) => {
                    if (error) {
                        console.log(error);
                        observer.error(error);
                    } else {
                        observer.next();
                    }
                }
            });
        });
    }


    createNewUser(userData: UserDataPassword): Observable<any> {
        return Observable.create(observer => {
            Accounts.createUser({
                email: userData.email.value,
                password: userData.password,
                profile: _.omit(userData, 'password', 'email'),
                deviceId: ApplicationUtil.DeviceId
            }, (error) => {
                console.log(error);
                if (error) {
                    observer.error(error);
                } else {
                    observer.next();
                }
            });
        });
    }

    signUp(userData: UserDataPassword): Observable<any> {
        if (userData.picture !== null) {
            return this.uploadToCloudinary(userData.picture).flatMap((imgData: any) => {
                let data = userData;
                data.picture = imgData;
                return this.createNewUser(data);
            });
        }
        userData.picture = null;
        return this.createNewUser(userData);
    }

    logout(): Observable<any> {
        return Observable.create(observer => {
            MeteorObservable.call(METHOD.SET_DEVICE_ID_LOGOUT, {deviceId: ApplicationUtil.DeviceId}).subscribe(() => {
                Meteor.logout(error => {
                    if (error) {
                        observer.error(error);
                    } else {
                        observer.next();
                    }
                });
            }, (error) => {
                observer.error(error);
            });
        });
    }

}
