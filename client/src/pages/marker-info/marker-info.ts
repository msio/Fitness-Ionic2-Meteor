import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {PIPE_DISTANCE_FORMAT} from "../../constants/constants";

@Component({
    selector: 'page-marker-info',
    templateUrl: 'marker-info.html',
})
export class MarkerInfo {
    PIPE_DISTANCE_FORMAT = PIPE_DISTANCE_FORMAT;

    data;

    constructor(public navCtrl: NavController, public viewCtrl: ViewController, public params: NavParams) {
        this.data = params.get('data');
    }

    selectLocation() {
        this.viewCtrl.dismiss('select');
    }

    close() {
        this.viewCtrl.dismiss();
    }
}
