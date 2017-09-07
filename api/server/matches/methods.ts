import SimpleSchema from "simpl-schema";
import {UserPool, Pokes, Matches, Pictures} from "../collections";
import {UserUtil} from "../util/userUtil";
import * as _ from 'underscore';
import {METHOD} from "../api-points-constants/api-points-constants";
import {UserProfile} from "../../models/models-server";
import {NOTIFICATION_TYPE_ENUM, Notifications} from "../notifications/notifications";
import {DateUtil} from "../util/dateUtil";

//time distance until activity starts. it means, that poke can be accepted only if current time + time distance <= activityStartFrom
const timeDistanceBeforeActvityStart = 5;

export const createPoke = new ValidatedMethod({
    name: METHOD.CREATE_POKES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        userPoolEntryId: {type: SimpleSchema.RegEx.Id},
    }).validator(),
    run({userPoolEntryId}) {
        const createdByUserProfile = Meteor.users.findOne(this.userId).profile;

        const userPoolEntryForUser: any = UserPool.findOne(userPoolEntryId);

        if (_.isUndefined(userPoolEntryForUser)) {
            throw new Meteor.Error('create.pokes', 'UserPool entry (forUser) does not exist by that ID');
        }

        const pictureId = createdByUserProfile.picture === null ? null : createdByUserProfile.picture._id;
        const createdByUser = {
            userId: this.userId,
            name: {firstName: createdByUserProfile.firstName, lastName: createdByUserProfile.lastName},
            otherPictures: Pictures.find({$and: [{userId: this.userId}, {_id: {$ne: pictureId}}]}, {fields: {userId: 0}}).fetch(),
            picture: createdByUserProfile.picture,
            age: DateUtil.calcUserAge(createdByUserProfile.birthday),
            gender: createdByUserProfile.gender,
            about: createdByUserProfile.about

        }

        console.log(userPoolEntryForUser);

        Pokes.insert({
            createdByUser: createdByUser,
            forUserId: userPoolEntryForUser.userId,
            timestamp: new Date(),
            userPoolEntryId: userPoolEntryId,
            activityStartFrom: userPoolEntryForUser.activityStartFrom,
            activityStartTo: userPoolEntryForUser.activityStartTo,
            locationId: userPoolEntryForUser.locationId,
            locAddress: userPoolEntryForUser.locAddress,
            membership: userPoolEntryForUser.membership,
            exercises: userPoolEntryForUser.exercises
        });

        const forUserDevices = Meteor.users.findOne(userPoolEntryForUser.userId)['devices'];

        Notifications.pushToAllDevices(forUserDevices, NOTIFICATION_TYPE_ENUM.POKE, {firstName: userPoolEntryForUser.name.firstName});
    }
});


export const createMatch = new ValidatedMethod({
    name: METHOD.CREATE_MATCHES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        pokeId: {type: SimpleSchema.RegEx.Id},
    }).validator(),
    run({pokeId}) {
        const poke: any = Pokes.findOne(pokeId);
        if (_.isUndefined(poke)) {
            throw new Meteor.Error('confirm.pokes', 'Poke entry does not exist by that ID');
        }
        if (poke.forUserId !== this.userId) {
            throw new Meteor.Error('confirm.pokes', 'Poke forUserId is not the same than logged user id');
        }

        const userPoolEntryForUser = UserPool.findOne(poke.userPoolEntryId);

        let newMatch: any = {
            timestamp: new Date(),
            activityStartFrom: poke.activityStartFrom,
            activityStartTo: poke.activityStartTo,
            locationId: poke.locationId,
            membership: poke.membership,
            exercises: poke.exercises,
            locAddress: poke.locAddress
        }
        Pokes.remove({_id: poke._id});

        //confirmed poke (created match) by this user
        newMatch.forUserId = this.userId;
        newMatch.matchedUser = poke.createdByUser;
        Matches.insert(newMatch);

        //created poke by this user
        newMatch.forUserId = poke.createdByUser.userId;
        newMatch.matchedUser = _.extend(_.pick(userPoolEntryForUser, 'picture', 'otherPictures', 'age', 'name', 'gender', 'about'), {userId: this.userId});
        Matches.insert(newMatch);


        //TODO error find out what is the problem
        //update user pool entry that comes from confirmed poke (created match) user
        UserPool.update({_id: poke.userPoolEntryId}, {$set: {matchedBy: [this.userId, poke.createdByUser.userId]}});

        //update user pool entry that comes from created poke user
        UserPool.update({userId: poke.createdByUser.userId}, {$set: {matchedBy: [this.userId, poke.createdByUser.userId]}});
    }
});