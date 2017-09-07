import {Component, NgZone, ViewChild} from '@angular/core';
import {
    NavController, ModalController, AlertController, Platform, ToastController, Events, NavParams, Content
} from 'ionic-angular';
import * as moment from 'moment';
import {Moment} from 'moment';

import {ActivityStartPage} from "../activity-start/activity-start";
import {DateUtil} from "../../util/date-time-util";
import {MembershipSelectorPage} from "../membership-selector/membership-selector";
import {GenderSelectorPage} from "../gender-selector/gender-selector";
import {GENDER} from "../../constants/translate-constants";
import {UserPoolPage} from "../user-pool/user-pool";
import {isDefined} from "ionic-angular/util/util";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {UserSearchParams, Position, MembershipParam} from "../../models/user-search-params";
import {Storage} from "@ionic/storage";
import {ActivityStartFormatPipe} from "../../pipes/actvity-start-format/activity-start-format";
import {Observable, Subscription} from "rxjs";
import {CHECK_INTERVAL_ACTIVITY_START} from "../../constants/constants";
import {UserPoolService} from "../../providers/user-pool-service";
import {MeteorObservable} from "meteor-rxjs";
import {WorkoutSelectorPage} from "../workout-selector/workout-selector";
import {METHOD} from "../../constants/api-points";

declare let _;

@Component({
    selector: 'page-fitness',
    templateUrl: 'fitness.html',
    providers: [ActivityStartFormatPipe, UserPoolService]
})
export class FitnessPage {

    GENDER = GENDER;

    isDefined = isDefined;
    isUndefined = isUndefined;

    @ViewChild(Content) content: Content;
    hidePosition: boolean = false;
    isSearchingPosition: boolean;
    isCurrentPosition: boolean;
    showConnectivityStatus: boolean;
    connectivityStatus: string;
    positionDescription: string = '';
    // TODO dont allow same lower and upper ageRange
    userSearchParams: UserSearchParams;
    activityStartIntervalSub: Subscription;

    constructor(public platform: Platform, public zone: NgZone, public params: NavParams, public events: Events, public storage: Storage, public toastCtrl: ToastController, public navCtrl: NavController, public modalCtrl: ModalController, public alertCtrl: AlertController, public activityStartFormatPipe: ActivityStartFormatPipe, public userPoolService: UserPoolService) {
        this.userSearchParams = {
            activityStart: this.setInitActivityStart(moment()),
            membership: undefined,
            position: new Position(),
            gender: GENDER.WOMEN_AND_MEN.value,
            //TODO default will be set based on user's age
            ageRange: {lower: 18, upper: 50},
            exercises: []
        };
    }

    setInitActivityStart(currentDate: Moment) {
        const from = DateUtil.roundToNearest15Minutes(currentDate);
        return {
            from: from,
            to: from.hours() === 23 && from.minutes() === 45 ? moment(from) : moment(from).add(15, 'minutes')
        };
    }

    search() {
        this.stopCheckValidityOfActivityStart();
        const nearestStartTime = DateUtil.checkValidityOfActivityStart(this.userSearchParams.activityStart);
        if (!nearestStartTime.valid) {
            let alert = this.alertCtrl.create({
                title: 'Invalid start time',
                message: 'Your set start time becomes invalid. Nearest valid start time is <strong>' + this.activityStartFormatPipe.transform(nearestStartTime) + '</strong>. Do you want to set it?',
                buttons: [
                    {
                        text: 'No, I want to set other time',
                        handler: () => {
                            this.userSearchParams.activityStart = nearestStartTime.activityStartTime;
                            this.goToStartActivitySelector();
                        }
                    },
                    {
                        text: 'Yes, I want to set this one',
                        handler: () => {
                            this.userSearchParams.activityStart = nearestStartTime.activityStartTime;
                        }
                    }
                ]
            });
            alert.present();
            return;
        } else if (isUndefined(this.userSearchParams.membership)) {
            let alert = this.alertCtrl.create({
                title: 'No Gym selected',
                message: 'Please select your Gym!',
                buttons: ['OK']
            });
            alert.present();
            return;
        } else {
            //object has to be cloned because moment is mutable and it messed up with meteor subscribe in some way
            const userSearchParams = this.userPoolService.prepareUserSearchParams(_.clone(this.userSearchParams));
            console.log(userSearchParams);
            MeteorObservable.call(METHOD.CREATE_USERPOOL, userSearchParams).subscribe(() => {
                //TODO user loader
                const oneLocation = this.userSearchParams.membership.locations.length === 1 ? {
                    membership: this.userSearchParams.membership.membership,
                    location: this.userSearchParams.membership.locations[0]
                } : undefined;
                this.navCtrl.push(UserPoolPage, {userSearchParams: userSearchParams, oneLocation: oneLocation});
            }, error => {
                console.log(error);
            });
        }
    }

    goToWorkoutSelector() {
        new Promise((resolve) => {
            this.navCtrl.push(WorkoutSelectorPage, {resolve: resolve, selected: this.userSearchParams.exercises});
        }).then(data => {
            this.userSearchParams.exercises = <any>data;
        });
    }

    gotToGenderSelector() {
        new Promise((resolve) => {
            this.navCtrl.push(GenderSelectorPage, {resolve: resolve, gender: this.userSearchParams.gender});
        }).then((data: any) => {
            this.userSearchParams.gender = data;
        });
    }

    goToMembershipSelector() {
        new Promise((resolve) => {
            this.navCtrl.push(MembershipSelectorPage, {resolve: resolve, membership: this.userSearchParams.membership});
        }).then((data: any) => {
            if (isDefined(data)) {
                console.log('membership',data);
                this.userSearchParams.position = data.position;
                this.zone.run(() => {
                    this.userSearchParams.membership = data.selected;
                });
            }
        });
    }

    goToStartActivitySelector() {
        new Promise((resolve) => {
            this.navCtrl.push(ActivityStartPage, {
                resolve: resolve,
                activityStart: this.userSearchParams.activityStart
            });
        }).then((data: any) => {
            this.userSearchParams.activityStart = data;
        });
    }

    startCheckValidityOfActivityStart() {
        this.activityStartIntervalSub = Observable.interval(CHECK_INTERVAL_ACTIVITY_START).subscribe(() => {
            this.userSearchParams.activityStart = DateUtil.checkValidityOfActivityStart(this.userSearchParams.activityStart, {toastCtrl: this.toastCtrl}).activityStartTime;
        });
    }

    stopCheckValidityOfActivityStart() {
        this.activityStartIntervalSub.unsubscribe();
    }


    ionViewDidEnter() {
        this.startCheckValidityOfActivityStart();
    }

    ionViewWillLeave() {
        this.stopCheckValidityOfActivityStart();
    }

}