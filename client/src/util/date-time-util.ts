import * as moment from 'moment';
import {Moment} from 'moment';
import {isDefined, isUndefined} from "ionic-angular/util/util";
import {ToastController} from "ionic-angular";
import {ActivityStart} from "../models/user-search-params";

//TODO REMOVE IT just for testing purposes, add it to this.checkValidityOfActivityStartHelper moment() to test it with browser console
window['globalCurrentTime'] = moment();

export class DateUtil {

    /**
     * round date to nearest 15 minutes boundary
     *
     * @param date
     * @param minutes
     * @returns {moment.Moment}
     */
    static roundToNearest15Minutes(date: Moment) {
        const minutes = 15;
        const duration = moment.duration(minutes, 'minutes');
        return moment(Math.ceil((+date) / (+duration)) * (+duration));
    }

    static checkValidityOfActivityStart(activityStartTime: ActivityStart, params?: { toastCtrl: ToastController }) {
        return this.checkValidityOfActivityStartHelper(activityStartTime, moment(), params);
    }

    //TODO test it with custom date
    private static checkValidityOfActivityStartHelper(activityStartTime: ActivityStart, currentTime: Moment, params?: { toastCtrl: ToastController }): { activityStartTime: ActivityStart, valid: boolean } {
        let valid: boolean = true;
        if (currentTime.isAfter(activityStartTime.from)) {
            const nearestStartTimeFrom = DateUtil.roundToNearest15Minutes(currentTime);
            const nearestStartTime = {
                from: nearestStartTimeFrom,
                to: moment(nearestStartTimeFrom).add(15, 'minutes')
            };
            //TODO withput toaster
            /*if (isDefined(params)) {
             let toast = params.toastCtrl.create({
             message: 'Your start time was updated',
             duration: 2000,
             position: 'top'
             });
             toast.present();
             }*/
            activityStartTime = nearestStartTime;
            valid = false;
        }
        return {
            activityStartTime: {
                from: moment(activityStartTime.from),
                to: moment(activityStartTime.to)
            }, valid: valid
        };
    }

}
