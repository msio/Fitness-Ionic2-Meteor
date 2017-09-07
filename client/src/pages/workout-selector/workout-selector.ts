import {Component, OnInit} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {isDefined} from "ionic-angular/util/util";
import {MeteorObservable} from "meteor-rxjs";
import {SelectorBase} from "../fitness/selector-base";
import {METHOD} from "../../constants/api-points";

declare let _;

@Component({
    selector: 'page-workout-selector',
    templateUrl: 'workout-selector.html'
})
export class WorkoutSelectorPage extends SelectorBase implements OnInit {

    exercises: Array<any> = [];

    constructor(public navCtrl: NavController, public viewCtrl: ViewController, public params: NavParams) {
        super(viewCtrl);
    }

    ngOnInit() {
        MeteorObservable.call(METHOD.FIND_EXERCISES).subscribe((result: Array<any>) => {
            const allExercises = result.map((exer) => {
                exer.selected = false;
                return exer;
            });
            this.selectSelectedExercises(allExercises, this.params.get('selected'));
        }, (error) => {
            console.log(error);
        });
    }

    selectSelectedExercises(data: Array<any>, selectedExercises: Array<any>) {
        data = data.map((value) => {
            value.selected = isDefined(selectedExercises.find((sel) => {
                return sel._id === value._id
            })) ? true : false;
            return value;
        });
        this.exercises = _.chain(data).groupBy((elem, index) => {
            return Math.floor(index / 3);
        }).toArray().value();
    }

    ionViewCanLeave() {
        const selected = _.flatten(this.exercises).filter((val) => {
            return val.selected;
        });
        this.params.get('resolve')(selected);
        return true;
    }
}
