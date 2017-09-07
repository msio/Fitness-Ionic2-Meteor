import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {UserDataService} from "../../providers/user-data-service";
import {EmailValidators} from "ng2-validators";
import {TabsPage} from "../tabs/tabs";

declare let _;

@Component({
    selector: 'page-user-sign-up-other-data',
    templateUrl: 'user-sign-up-other-data.html'
})
export class UserSignUpOtherDataPage {

    LABELS = {email: 'Email', password: 'Password'}

    otherDataForm: FormGroup;
    isEmail: boolean;
    isPassword: boolean;

    constructor(public params: NavParams, private loadingCtrl: LoadingController, public alertCtrl: AlertController, public navCtrl: NavController, public formBuilder: FormBuilder, public userDataService: UserDataService) {
        this.isPassword = !(params.get('authFacebook') ? true : false);
        this.isEmail = !(params.get('userData') && params.get('userData').email ? true : false);
        this.initForm();
    }

    /**
     * email is either get from user facebook's account or set by him
     *
     * @param userDataEmail
     * @param formEmail
     * @returns {{email: any, type: 'facebook'}|{email: any, type: 'set-by-user'}}
     */
    completeEmail(userDataEmail, formEmail) {
        return userDataEmail === null ? {value: formEmail, type: 'set-by-user',} : {
                value: userDataEmail,
                type: 'facebook'
            };
    }

    private createLoginErrorAlert() {
        this.alertCtrl.create({
            title: 'Sign Up Error',
            message: 'Try again or choose another login type',
            buttons: ['Ok']
        }).present();
    }

    signUp() {
        if (this.validateForm()) {
            let userData = this.params.get('userData');
            userData.email = this.completeEmail(userData.email, this.otherDataForm.value.email);
            let loading = this.loadingCtrl.create({
                content: 'Please wait...'
            });
            loading.present();
            if (this.params.get('authFacebook')) {
                this.userDataService.loginWithFacebook(this.params.get('authFacebook'), userData
                ).subscribe(() => {
                    loading.dismiss();
                    this.navCtrl.push(TabsPage);
                }, (error) => {
                    loading.dismiss();
                    this.createLoginErrorAlert();
                });
            } else {
                userData.password = this.otherDataForm.value.password;
                this.userDataService.signUp(userData).subscribe(() => {
                    loading.dismiss();
                    this.navCtrl.push(TabsPage);
                }, (error) => {
                    loading.dismiss();
                    this.createLoginErrorAlert();
                });
            }
        }
    }

    initForm() {
        let formGroup: any = {};
        if (this.isEmail) {
            //TODO use own regex validation https://www.w3.org/TR/html5/forms.html#valid-e-mail-address
            formGroup.email = ['', Validators.compose([Validators.required, EmailValidators.normal])];
        }
        if (this.isPassword) {
            formGroup.password = ['', Validators.compose([Validators.required, Validators.minLength(8)])];
        }
        this.otherDataForm = this.formBuilder.group(formGroup);
    }

    validateForm() {
        if (this.otherDataForm.invalid) {
            const fields: any = this.otherDataForm.controls;
            let msg = '';
            let count = 0;
            if (fields.email._errors && fields.email._errors.required || fields.password._errors && fields.password._errors.required) {
                if (fields.email._errors && fields.email._errors.required) {
                    msg += '<strong>' + this.LABELS.email + '</strong>' + ','
                    count++;
                }
                if (fields.password._errors && fields.password._errors.required) {
                    msg += '<strong>' + this.LABELS.password + '</strong>' + ','
                    count++;
                }
                let isOrAre = count === 1 ? ' is' : ' are';
                //remove last comma
                msg = msg.slice(0, msg.length - 1) + isOrAre + ' required';
                this.alertCtrl.create({
                    title: 'Required',
                    message: msg,
                    buttons: ['OK']
                }).present();
                return false;
            }
            if (fields.email._errors && fields.email._errors.simpleEmailRule) {
                msg += '<strong>' + this.LABELS.email + '</strong>' + ' is invalid';
                this.alertCtrl.create({
                    title: 'Invalid Email',
                    message: msg,
                    buttons: ['OK']
                }).present();
                return false;
            }
            if (fields.password._errors && fields.password._errors.minlength) {
                msg += '<strong>' + this.LABELS.password + '</strong>' + ' has to be min 8 characters long';
                this.alertCtrl.create({
                    title: 'Password too short',
                    message: msg,
                    buttons: ['OK']
                }).present();
                return false;
            }
        }
        return true;
    }
}
