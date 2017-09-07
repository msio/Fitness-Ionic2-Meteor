import {Component} from '@angular/core';
import {ViewController, NavParams} from 'ionic-angular';
import {GENDER} from "../../constants/translate-constants";
import {SelectorBase} from "../fitness/selector-base";

@Component({
    selector: 'page-gender-selector',
    templateUrl: 'gender-selector.html'
})
export class GenderSelectorPage extends SelectorBase {

    GENDER = GENDER;
    gender: string;

    constructor(public params: NavParams, public viewCtrl: ViewController) {
        super(viewCtrl);
        this.gender = params.get('gender');
    }

    ionViewCanLeave() {
        this.params.get('resolve')(this.gender);
        return true;
    }
}
