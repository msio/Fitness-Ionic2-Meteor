import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {FitnessPage} from "../fitness/fitness";

/*
 Generated class for the CreateOrSearch page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-create-or-search',
    templateUrl: 'create-or-search.html'
})
export class CreateOrSearchPage {

    constructor(public navCtrl: NavController) {
    }

    goToSearchCriteria() {
        this.navCtrl.push(FitnessPage);
    }

    ionViewDidLoad() {
        console.log('Hello CreateOrSearchPage Page');
    }

}
