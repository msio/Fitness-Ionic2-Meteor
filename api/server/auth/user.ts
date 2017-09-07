// import {Accounts} from "meteor/accounts-base";
import SimpleSchema from "simpl-schema";
import * as moment from  'moment';
import {BIRTHDAY_TRANSFER_FORMAT} from "../constants/date-time-formats";
import * as _ from 'underscore';
import {UserDataPasswordSchema, UserDataFacebookSchema} from "../schemas/register-login/user-register-schema";
import {METHOD} from "../api-points-constants/api-points-constants";
import {Pictures} from "../collections";

declare let Accounts;

export enum LOGIN_STATUS{
    LOGGED_IN = <any>'LOGGED_IN', LOGGED_OUT = <any>'LOGGED_OUT'
}

export function prepareProfileForStoring(profile, user) {
    profile.birthday = moment.utc(profile.birthday, BIRTHDAY_TRANSFER_FORMAT).toDate();
    if (!_.isNull(profile.picture) && !_.isUndefined(profile.picture)) {
        const pictureId = Pictures.insert({
            userId: user._id,
            url: profile.picture.url,
            createdAt: new Date(),
        });
        profile.picture = {url: profile.picture.url, _id: pictureId};
    } else {
        profile.picture = null;
    }
    if (!_.isUndefined(profile.email)) {
        profile = _.omit(profile, 'email');
    }
    //add about field
    profile.about = '';
    return profile;
}


Accounts.onCreateUser((options, user) => {
    if (user.services.password) {
        UserDataPasswordSchema.validate(options);
    } else if (user.services.facebook) {
        UserDataFacebookSchema.validate(options);
        //TODO add email from fb but it there no email in fb profile email can be typed by user and is not verified
        //TODO add property from fb or not if email is verified or not

        //TODO check it the email already exists
        user.emails = [{address: options.profile.email.value, verified: true}];
    }
    user.profile = prepareProfileForStoring(options.profile, user);
    user.devices = [{id: options.deviceId, status: LOGIN_STATUS.LOGGED_IN}];
    return user;
});


export function LoggedInCheck(thisContext: any) {
    if (thisContext.userId === null) {
        console.log('Not Logged in');
        return thisContext.ready();
    }
}

//TODO use mongo query instead
export function updateDeviceStatus(userId: string, deviceId: string, status: LOGIN_STATUS) {
    const user: any = Meteor.users.findOne(userId);
    let updated = false;
    console.log(deviceId);
    let devices = user.devices.map((device) => {
        if (device.id === deviceId) {
            device.status = status
            updated = true;
        }
        return device;
    });
    if (devices.length === 0) {
        devices = [{id: deviceId, status: status}];
    }
    if (!updated) {
        devices.push({id: deviceId, status: status});
    }
    Meteor.users.update({
        _id: userId,
    }, {$set: {devices: devices}});
}

export const setDeviceIDLogout = new ValidatedMethod({
    name: METHOD.SET_DEVICE_ID_LOGOUT,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        deviceId: {type: String},
    }).validator(),
    run({deviceId}) {
        updateDeviceStatus(this.userId, deviceId, LOGIN_STATUS.LOGGED_OUT);
    }
});