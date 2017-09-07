import {Injectable} from '@angular/core';
import {Storage} from "@ionic/storage";
import {Nav} from "ionic-angular";
import {LoginTypePage} from "../pages/login-type/login-type";
import {isDefined} from "ionic-angular/util/util";

declare let Accounts, Meteor;

@Injectable()
export class LoginCheck {

    nav: Nav;

    constructor(public storage: Storage) {
    }

    init(nav) {
        this.nav = nav;
        //TODO add to resume
        /* this.platform.resume.subscribe(() => {
         this.loginWithToken();
         });*/
    }

}
