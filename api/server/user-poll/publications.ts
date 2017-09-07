import {Locations, UserPool, Pokes, Matches} from "../collections";
import {UserSearchParamsSchema} from "../schemas/find-users/find-users";
import {Meteor} from "meteor/meteor";

import {GeoPoint} from "../../models/GeoPoint";
import {LoggedInCheck} from "../auth/user";
import {PUBLICATION} from "../api-points-constants/api-points-constants";
import {UserSearchParams} from "../../models/models-server";
import * as _ from 'underscore';
import {GeoUtil} from "../util/geoUtil";
import {CHECKING_INTERVAL} from "../constants/constants";

const maxResults: number = 100;

let initializing = true;


/**
 *  finds locations based on a position and maximum defined distance,
 *
 * @param {GeoPoint} userPosition position of user in coordinates
 * @param {number} distance distance in km
 * @param {Array<string>} membershipIds ids of memberships
 * @returns {Array<{_id,geometry}>} found locations sorted ascending
 */
export function findLocations(userPosition: GeoPoint, distance: number, membershipIds?: Array<string>): any {
    let geometry: any = {
        geometry: {
            $near: {
                $geometry: userPosition,
                // distance of two points is calculated on high precision but with divergence
                $maxDistance: GeoUtil.maxDistance(distance)
            }
        }
    }
    geometry = _.isUndefined(membershipIds) || _.isEmpty(membershipIds) ? geometry : {$and: [{membershipId: {$in: membershipIds}}, geometry]};
    return Locations.find(geometry, {
        // implement Pagination
        limit: _.isNumber(distance) ? maxResults : 1,
        fields: {
            _id: 1
        }
    }).fetch();
}

export function findNearestLocation(userPosition: GeoPoint, locations: Array<{ locId: string }>): Object
    | null {
    const find = {
        _id: {$in: locations.map(e => e.locId)},
        geometry: {
            $near: {
                $geometry: userPosition
            }
        }
    }
    const result = Locations.find(find, {limit: 1}).fetch();
    return result.length !== 0 ? result[0] : null;
}

//check for invalid documents and remove it
Meteor.setInterval(() => {
    UserPool.find({activityStartFrom: {$lte: new Date()}}).forEach((doc) => {
        //TODO insert to history collection
        UserPool.remove(doc._id);
    });
}, CHECKING_INTERVAL);


export function findInUserPool(userId: string, userSearchParams: UserSearchParams) {
    return UserPool.find(userPoolQueries(userId, userSearchParams), {
        fields: {"name.lastName": 0}
        // sort: {activityStartFrom: 1, exercisesCount: 1}
    });
}

function userPoolQueries(userId: string, userSearchParams: UserSearchParams) {
    let find: any = {
        userId: {$ne: userId},
        age: {$gte: userSearchParams.ageRange.lower, $lte: userSearchParams.ageRange.upper},
        activityStartFrom: {$lte: userSearchParams.activityStart.to},
        activityStartTo: {$gte: userSearchParams.activityStart.from},
        locationId: {$in: userSearchParams.membership.map(e => e.locId)}
    }
    if (userSearchParams.exercises.length !== 0) {
        find.exercises = {$all: userSearchParams.exercises};
    }
    if (userSearchParams.gender !== "both") {
        find.gender = userSearchParams.gender;
    }
    return find;
}

export function aggregateUserPool(userId: string, userSearchParams: UserSearchParams): Array<any> {
    const queries = userPoolQueries(userId, userSearchParams);
    let aggregate: Array<any> = [];
    if (_.isObject(userSearchParams.position)) {
        aggregate.push({
            $geoNear: {
                near: GeoUtil.createGeoPointJSON(userSearchParams.position.lng, userSearchParams.position.lat),
                distanceField: 'locDistance',
                //to km
                distanceMultiplier: 0.001,
                spherical: true,
                query: queries
            }
        });
    } else {
        aggregate.push({
            $match: queries
        });
    }

    aggregate.push({$sort: {activityStartFrom: 1, locDistance: 1, exercisesCount: 1}});
    return UserPool.aggregate(aggregate);
}

Meteor.publish(PUBLICATION.FIND.USERS, function (userSearchParams: UserSearchParams) {
    LoggedInCheck(this);
    console.log('find.users');

    UserSearchParamsSchema.validate(userSearchParams);

    const self = this;
    self._ids = {};
    self._iteration = 1;

    let userPoolCursor;

    function updateDataToClient() {
        if (initializing) return;
        aggregateUserPool(self.userId, userSearchParams).forEach(function (doc) {
            if (!self._ids[doc._id]) {
                if (Pokes.find({userPoolEntryId: doc._id, createdByUserId: self.userId}).count() === 0) {
                    doc.poked = false;
                } else {
                    doc.poked = true;
                }
                self.added('userPool', doc._id, doc);
            } else {
                self.changed('userPool', doc._id, doc);
            }
            self._ids[doc._id] = self._iteration;
        });
        // remove documents not in the result anymore
        _.forEach(self._ids, function (v, k) {
            if (v != self._iteration) {
                delete self._ids[k];
                self.removed('userPool', k);
            }
        });
        self._iteration++;

    }

    userPoolCursor = findInUserPool(self.userId, userSearchParams);
    const userPool = userPoolCursor.observeChanges({
        added: updateDataToClient,
        changed: updateDataToClient,
        removed: updateDataToClient
    });

    initializing = false;
    updateDataToClient();

    self.ready();

    self.onStop(() => {
        userPool.stop();
    });
});


// TODO just for DEVELOPMENT
Meteor.publish('userPool', function () {
    return UserPool.find();
});