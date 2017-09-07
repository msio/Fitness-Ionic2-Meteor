import * as _ from "underscore";

import {UserSearchParamsSchema} from "../schemas/find-users/find-users";
import {GeoPoint} from "../../models/GeoPoint";
import {findNearestLocation} from "./publications";
import {DateUtil} from "../util/dateUtil";
import {Locations, Memberships, Pictures, UserPool} from "../collections";
import {METHOD} from "../api-points-constants/api-points-constants";


export const createNewUserSearch = new ValidatedMethod({
    name: METHOD.CREATE_USERPOOL,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: "notLoggedIn"
    },
    validate: UserSearchParamsSchema.validator(),
    run({activityStart, position, gender, ageRange, membership, exercises}) {
        const user = Meteor.users.findOne(this.userId);
        const pictureId = user.profile.picture === null ? null : user.profile.picture["_id"];

        let otherPictures = [];
        if (pictureId !== null) {
            otherPictures = Pictures.find({
                userId: this.userId,
                _id: {$ne: pictureId}
            }, {fields: {userId: 0}}).fetch();
        }

        let newUserPoolEntry: any = {
            userId: this.userId,
            name: {firstName: user.profile.firstName, lastName: user.profile.lastName},
            age: DateUtil.calcUserAge(<any>user.profile.birthday),
            picture: user.profile.picture,
            otherPictures: otherPictures,
            gender: user.profile.gender,
            about: user.profile.about,
            activityStartFrom: activityStart.from,
            activityStartTo: activityStart.to,
            exercises: exercises,
            exercisesCount: exercises.length
        }

        let location;

        if (membership.length === 1) {
            location = Locations.findOne(membership[0].locId);
            if (_.isUndefined(location)) {
                throw new Meteor.Error(METHOD.CREATE_USERPOOL, "Location not found by that ID");
            }
        } else {
            // TODO perhaps you dont' have to check this because it wil be checked with simple schema
            if (!_.isObject(position)) {
                throw new Meteor.Error(METHOD.CREATE_USERPOOL, "There is no position defined");
            }
            const userPosition: GeoPoint = new GeoPoint(position.lng, position.lat);
            // there is also timestamp
            location = findNearestLocation(userPosition, membership);
            if (location === null) {
                throw new Meteor.Error(METHOD.CREATE_USERPOOL, "No nearest location found");
            }
        }
        newUserPoolEntry.locationId = location._id;
        newUserPoolEntry.locAddress = location.address;
        newUserPoolEntry.locGeometry = location.geometry;
        newUserPoolEntry.membership = _.omit(Memberships.findOne(location.membershipId), "_id");
        newUserPoolEntry.membershipId = location.membershipId;

        UserPool.remove({userId: this.userId});

        UserPool.insert(newUserPoolEntry);
    }
});