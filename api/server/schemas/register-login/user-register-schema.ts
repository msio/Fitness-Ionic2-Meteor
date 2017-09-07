import * as moment from 'moment';
import SimpleSchema from "simpl-schema";

import {BIRTHDAY_TRANSFER_FORMAT} from "../../constants/date-time-formats";

export const AuthFacebookSchema = new SimpleSchema({
    accessToken: {type: String}, expiresIn: {type: Number}, userID: {type: String}
});


export const UserDataBaseSchema = new SimpleSchema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String, allowedValues: ['female', 'male']
    },
    birthday: {
        type: String,
        custom: function () {
            return moment(this.value, BIRTHDAY_TRANSFER_FORMAT).isValid() ? true : 'birthday must be valid date';
        }
    }
});

export const UserDataFacebookSchema = new SimpleSchema({
    deviceId: {
        type: String
    },
    profile: {
        type: UserDataBaseSchema
    },
    'profile.email': {
        //TODO impl just like regex string
        type: Object,
        blackbox: true
    },
    'profile.picture': {
        //TODO it can be facebook url or cloudinary
        type: Object,
        blackbox: true,
        optional: true
    }
});

export const UserDataPasswordSchema = new SimpleSchema({
    email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    password: {
        type: Object
    },
    'password.digest': {
        type: String
    },
    'password.algorithm': {
        type: String
    },
    profile: {
        type: UserDataBaseSchema
    },
    deviceId: {
        type: String
    },
    'profile.picture': {
        optional: true,
        type: new SimpleSchema({
            //TODO must be cloudinary url
            url: {type: String, regEx: SimpleSchema.RegEx.Url},
            public_id: {type: String},
            //TODO validate signature of cloudinary
            signature: {type: String}
        }),
    }
});

/*
 export const UserRegisterSchema = new SimpleSchema({
 authFacebook: {type: AuthFacebookSchema},
 userData: {type: UserDataSchema}
 });*/
