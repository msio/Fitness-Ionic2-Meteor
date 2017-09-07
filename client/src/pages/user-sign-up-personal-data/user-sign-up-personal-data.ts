import {Component} from '@angular/core';
import {
    NavController, NavParams, Platform,
    AlertController
} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import * as moment from 'moment';
import {UserSignUpOtherDataPage} from "../user-sign-up-other-data/user-sign-up-other-data";
import {APP_DATE_FORMAT} from "../../constants/date-time-formats";
import {DomSanitizer} from "@angular/platform-browser";
import {PictureHandler} from "../view-interface/picture-handler";
import {PictureService} from "../../providers/picture-service";

declare let _;

@Component({
    selector: 'page-user-sign-up-personal-data',
    templateUrl: 'user-sign-up-personal-data.html',
    providers: [PictureHandler]
})
export class UserSignUpPersonalDataPage {

    APP_DATE_FORMAT = APP_DATE_FORMAT;

    //TODO translate
    LABELS = {
        firstName: 'First Name',
        lastName: 'Last Name',
        gender: 'Gender',
        birthday: 'Birthday'
    }

    MIN_AGE: number = 18;
    MAX_AGE: number = 120;

    personalDataForm: FormGroup;
    // picture type is blob or url
    userData: {firstName: string, lastName: string, gender: string, birthday: string, picture: any, email: string};
    pictureUrl: any;
    showNoPictureSetAlert: boolean = true;
    minDate: string;
    maxDate: string;

    constructor(public platform: Platform, public alertCtrl: AlertController, public pictureService: PictureService, public sanitizer: DomSanitizer, public pictureHandler: PictureHandler, public params: NavParams, public navCtrl: NavController, public formBuilder: FormBuilder) {
        this.userData = params.get('userData') ? params.get('userData') : {
                firstName: null,
                lastName: null,
                gender: null,
                birthday: null,
                email: null,
                picture: null
            };
        const today = moment();
        this.minDate = moment(today).subtract(this.MAX_AGE, 'years').toISOString();
        this.maxDate = moment(today).subtract(this.MIN_AGE, 'years').toISOString();
        this.initForm();
    }

    /*  handleImgUrlFromBlob(blob?: any) {
     if (blob) {
     //bypass error that angular throws
     this.pictureUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob));
     } else {
     if (this.pictureUrl) {
     window.URL.revokeObjectURL(this.pictureUrl);
     }
     }
     }*/

    initForm() {
        let formGroup: any = {};
        if (!this.userData.firstName) {
            //TODO define max length of string , impl in backend
            formGroup.firstName = ['', Validators.required];
        }
        if (!this.userData.lastName) {
            formGroup.lastName = ['', Validators.required];
        }
        if (!this.userData.gender) {
            formGroup.gender = ['', Validators.required];
        }
        if (!this.userData.birthday) {
            formGroup.birthday = ['', Validators.required];
        }
        this.personalDataForm = this.formBuilder.group(formGroup);
    }

    setUserPicture() {
        this.pictureHandler.getCroppedPicture().then((imagePath) => {
            this.userData.picture = imagePath;
            this.pictureService.fileToBase64(imagePath, true).then((base64) => {
                this.pictureUrl = base64;
            },(error)=>{
                console.log('setUserPicture',error);
            });
        });
    }

    completePersonalData(userData: any, personalData: any) {
        let personal: any = {};

        _.each(_.omit(userData, 'email', 'picture'), (value, prop) => {
            if (value) {
                personal[prop] = value
            } else {
                personal[prop] = personalData[prop];
            }
        });
        //if no picture is set no will be passed
        personal.picture = userData.picture;
        return personal
    }

    next() {
        if (this.personalDataForm.valid) {
            /* if (!this.userData.picture && this.showNoPictureSetAlert) {
             this.alertCtrl.create({
             title: 'No Photo',
             message: 'Without your photo, your changes to be discovered will be lower',
             buttons: [
             {
             text: 'Set your Photo',
             handler: () => {
             this.setUserPicture();
             }
             },
             {
             text: 'No Photo set',
             role: 'cancel',
             handler: ()=>{

             }
             }
             ]
             }).present();
             this.showNoPictureSetAlert = false;
             return;
             }*/
            let userData: any = this.completePersonalData(this.userData, this.personalDataForm.value);
            userData.email = this.userData.email;
            if (!userData.email) {
                let nextObj: any = {userData: userData};
                if (this.params.get('authFacebook')) {
                    nextObj.authFacebook = this.params.get('authFacebook');
                }
                this.navCtrl.push(UserSignUpOtherDataPage, nextObj);
            } else {
                //TODO continue login to server
            }
        } else {
            const fields = this.personalDataForm.controls;
            let msg = '';
            let count = 0;
            _.each(fields, (value, prop) => {
                if (value._errors && value._errors.required) {
                    msg += '<strong>' + this.LABELS[prop] + '</strong>' + ',';
                    count++;
                }
            });
            let isOrAre = count === 1 ? ' is' : ' are';
            //remove last comma
            msg = msg.slice(0, msg.length - 1) + isOrAre + ' required';
            this.alertCtrl.create({
                title: 'Required',
                message: msg,
                buttons: ['OK']
            }).present();
        }
    }

}
