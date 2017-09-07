import SimpleSchema from "simpl-schema";
import {METHOD} from "../api-points-constants/api-points-constants";
import {Pictures} from "../collections";
import {MAX_NUMBER_OF_UPLOAD_PICTURES} from "../constants/constants";
import * as _ from 'underscore';

export const changeUserAbout = new ValidatedMethod({
    name: METHOD.CHANGE_ABOUT_USER,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        content: {type: String},
    }).validator(),
    run({content}) {
        //TODO Sanitize content to prevent XSS scripting, validate first on client
        Meteor.users.update({_id: this.userId}, {$set: {'profile.about': content}});
    }
});

export const addPicture = new ValidatedMethod({
    name: METHOD.ADD_PICTURE,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        //TODO check cloudinary url
        url: {type: SimpleSchema.RegEx.Url},
        public_id: {type: String},
        signature: {type: String}
    }).validator(),
    run({url, public_id, signature}) {
        if (Pictures.find({userId: this.userId}).count() >= MAX_NUMBER_OF_UPLOAD_PICTURES) {
            throw new Meteor.Error(METHOD.ADD_PICTURE, 'You cannot upload more than ' + MAX_NUMBER_OF_UPLOAD_PICTURES + ' pictures');
        }
        //TODO verify signature
        const pictureId = Pictures.insert({
            userId: this.userId,
            url: url,
            createdAt: new Date(),
        });

        //set new profile picture on user profile
        Meteor.users.update(this.userId, {$set: {'profile.picture': {url: url, _id: pictureId}}});
        return pictureId;
    }
});


export const removePicture = new ValidatedMethod({
    name: METHOD.REMOVE_PICTURE,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        pictureId: {
            type: SimpleSchema.RegEx.Id
        }
    }).validator(),
    run({pictureId}) {
        const picture: any = Pictures.findOne(pictureId);
        if (!_.isUndefined(picture) && picture.profile) {
            throw new Meteor.Error(METHOD.REMOVE_PICTURE, 'Cannot remove profile picture');
        }
        Pictures.remove(pictureId);
    }
});

export const setProfilePicture = new ValidatedMethod({
    name: METHOD.SET_PROFILE_PICTURE,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        pictureId: {
            type: SimpleSchema.RegEx.Id
        }
    }).validator(),
    run({pictureId}) {
        const picture: any = Pictures.findOne(pictureId);
        //set new profile picture on user profile
        Meteor.users.update(this.userId, {$set: {'profile.picture': {url: picture.url, _id: picture._id}}});
    }
});


export const findOwnPictures = new ValidatedMethod({
    name: METHOD.FIND_OWN_PICTURES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: null,
    run() {
        const user = Meteor.users.findOne(this.userId);
        const pictureId = user.profile.picture === null ? null : user.profile.picture['_id'];
        return Pictures.find({$and: [{userId: this.userId}, {_id: {$ne: pictureId}}]}, {fields: {userId: 0}}).fetch();
    }
});

/*
export const findOtherPictures = new ValidatedMethod({
    name: METHOD.FIND__OTHER_PICTURES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        userId: {
            type: SimpleSchema.RegEx.Id
        }
    }).validator(),
    run({userId}) {
        return Pictures.find({$and: [{userId: userId}, {profile: {$exists: false}}]}, {fields: {userId: 0}}).fetch();
    }
});*/
