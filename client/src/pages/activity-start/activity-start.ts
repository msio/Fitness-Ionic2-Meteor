import {Component} from '@angular/core';
import {Moment} from 'moment';
import * as moment from 'moment';

import {APP_TIME_FORMAT, APP_DATE_FORMAT, APP_DATE_DAY_FORMAT} from "../../constants/date-time-formats";
import {ViewController, NavParams, ToastController} from "ionic-angular";
import {NUMBER_OF_GENERATED_DAYS, CHECK_INTERVAL_ACTIVITY_START} from "../../constants/constants";
import {DateUtil} from "../../util/date-time-util";
import {Subscription, Observable} from "rxjs";
import {SelectorBase} from "../fitness/selector-base";
import {isUndefined} from "ionic-angular/util/util";


@Component({
    selector: 'page-activity-start',
    templateUrl: 'activity-start.html'
})
export class ActivityStartPage extends SelectorBase {

    isUndefined = isUndefined;

    APP_TIME_FORMAT = APP_TIME_FORMAT;
    APP_DATE_FORMAT = APP_DATE_FORMAT;
    APP_DATE_DAY_FORMAT = APP_DATE_DAY_FORMAT;
    DATETIME_PARSE_FORMAT = 'YYYY-MM-DDTHH:mmZ';

    activityStart: { from: Moment, to: Moment };
    activityStartFrom: string;
    minActivityStartFrom: string;

    date: Moment;
    duration: number;
    days: Array<string> = [];
    day: string;
    maxTimeDurationInit: number = 60;
    timeDurationStep: number = 15;
    maxTimeDuration: number = this.maxTimeDurationInit;
    showTimeDurationRange: boolean = true;
    activityStartIntervalSub: Subscription;

    constructor(public params: NavParams, public viewCtrl: ViewController, public toastCtrl: ToastController) {
        super(viewCtrl);
        this.generateDaysList(moment({hours: 0, minutes: 0}));
        this.updateTimeAndDay(params.get('activityStart'), false);
    }

    onChangeDateTime() {
        this.activityStart.from = moment(new Date(this.activityStartFrom));
        this.adaptTimeDurationRange();
        this.activityStart.to = moment(this.activityStart.from).add(this.duration, 'minutes');
    }

    generateDaysList(startPoint: Moment) {
        let current = moment(startPoint)
        for (let m = 0; m < NUMBER_OF_GENERATED_DAYS; m++) {
            this.days.push('' + current.unix());
            current = moment(current.add(1, 'day'));
        }
    }


    onChangeDay() {
        const date = moment.unix(parseInt(this.day));
        this.activityStart.from = moment(this.activityStart.from).set({
            date: date.date(),
            month: date.month(),
            year: date.year()
        });
        this.activityStartFrom = this.activityStart.from.format(this.DATETIME_PARSE_FORMAT);
        this.activityStart.to = moment(this.activityStart.to).set({
            date: date.date(),
            month: date.month(),
            year: date.year()
        });
        this.updateMinActivityStartFrom();
    }

    adaptTimeDurationRange() {
        this.duration = 15;
        this.showTimeDurationRange = true;
        if (this.activityStart.from.hours() === 23) {
            switch (this.activityStart.from.minutes()) {
                case 0:
                    this.maxTimeDuration = 45;
                    break;
                case 15:
                    this.maxTimeDuration = 30;
                    break;
                case 30:
                    this.maxTimeDuration = 15;
                    break;
                case 45:
                    this.maxTimeDuration = 0;
                    this.duration = 0;
                    this.showTimeDurationRange = false;
                    break;
            }
        } else {
            this.maxTimeDuration = 45
        }
    }

    updateMinActivityStartFrom() {
        const next15Minutes = DateUtil.roundToNearest15Minutes(moment());
        this.minActivityStartFrom = next15Minutes.isSame(this.activityStart.from, 'day') ? next15Minutes.format(this.DATETIME_PARSE_FORMAT) : undefined;
    }

    onChangeTimeDuration() {
        this.activityStart.to = moment(this.activityStart.from).add(this.duration, 'minutes');
    }

    updateTimeAndDay(activityStart: { from: Moment, to: Moment }, onInterval: boolean) {
        const validity = DateUtil.checkValidityOfActivityStart(activityStart);
        if (!onInterval || (onInterval && !validity.valid)) {
            this.activityStart = validity.activityStartTime;
            this.updateMinActivityStartFrom();
            this.activityStartFrom = this.activityStart.from.format(this.DATETIME_PARSE_FORMAT);
            this.adaptTimeDurationRange();
            this.day = '' + moment(this.activityStart.from).set({hours: 0, minutes: 0}).unix();
        }
    }

    ionViewCanLeave() {
        this.params.get('resolve')(this.activityStart);
        return true;
    }

    ionViewWillLeave() {
        this.activityStartIntervalSub.unsubscribe();
    }

    ionViewDidEnter() {
        this.activityStartIntervalSub = Observable.interval(CHECK_INTERVAL_ACTIVITY_START).subscribe(() => {
            this.updateTimeAndDay(this.activityStart, true);
        });
    }

}
