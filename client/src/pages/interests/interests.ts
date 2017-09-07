import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Interest} from "../../models/interest";
import {FitnessPage} from "../fitness/fitness";
import {MeteorObservable} from "meteor-rxjs";

declare let Meteor;

@Component({
    selector: 'page-interests',
    templateUrl: 'interests.html'
})
export class InterestsPage {

    interests: Array<Interest>;
    notConnected: boolean = false;

    constructor(public navCtrl: NavController) {
        MeteorObservable.autorun().subscribe(() => {
            this.notConnected = !Meteor.status().connected
        });


    }

    goToInterest() {
        this.navCtrl.push(FitnessPage);
    }

}
