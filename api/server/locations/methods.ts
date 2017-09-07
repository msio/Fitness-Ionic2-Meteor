import SimpleSchema from "simpl-schema";
import * as _ from 'underscore';

import {Locations, Memberships} from "../collections";
import {METHOD} from "../api-points-constants/api-points-constants";
import {GeoPoint} from "../../models/GeoPoint";
import {GeoUtil} from "../util/geoUtil";
import {MAX_LOCATION_RADIUS} from "../constants/constants";

export const findLocations = new ValidatedMethod({
    name: METHOD.FIND_LOCATIONS,
    validate: new SimpleSchema({
        membershipId: {type: SimpleSchema.RegEx.Id},
        position: {
            type: new SimpleSchema({
                lat: {type: Number},
                lng: {type: Number},
                timestamp: {optional: true, type: Number},
            }),
            optional:true
        }
    }).validator(),
    run({membershipId, position}) {
        if (!_.isUndefined(position) && position !== null) {
            return Locations.aggregate({
                $geoNear: {
                    near: GeoUtil.createGeoPointJSON(position.lng, position.lat),
                    distanceField: 'locDistance',
                    //to km
                    distanceMultiplier: 0.001,
                    spherical: true,
                    query: {membershipId: membershipId}
                }
            });
        }
        return Locations.find({membershipId: membershipId}).fetch();
    }
});

export const findNearestLocations = new ValidatedMethod({
    name: METHOD.FIND_NEAREST_LOCATIONS,
    validate: new SimpleSchema({
        membershipId: {type: SimpleSchema.RegEx.Id, optional: true},
        position: {
            type: new SimpleSchema({
                lat: {type: Number},
                lng: {type: Number},
                timestamp: {optional: true, type: Number},
                radius: {optional: true, type: SimpleSchema.Integer}
            }),
        }
    }).validator(),
    run({position, membershipId}) {
        let find: any = {
            $geoNear: {
                near: GeoUtil.createGeoPointJSON(position.lng, position.lat),
                distanceField: 'locDistance',
                //to km
                distanceMultiplier: 0.001,
                spherical: true,
                query: _.isUndefined(membershipId) || membershipId === null ? undefined : {membershipId: membershipId},
                maxDistance: _.isNumber(position.radius) ? GeoUtil.maxDistance(position.radius) : GeoUtil.maxDistance(MAX_LOCATION_RADIUS)
            }
        }
        let locations: any = Locations.aggregate(find);

        if (locations.length === 0) {
            console.log(locations.length);
            return {locations: [], memberships: []};
        }
        if (!_.isNumber(position.radius)) {
            let nereast = [];
            const nearestDistanceRounded = Math.ceil(locations[0].locDistance);
            for (let l of locations) {
                if (l.locDistance <= nearestDistanceRounded) {
                    nereast.push(l);
                } else {
                    locations = nereast;
                    break;
                }
            }

        }
        console.log(locations.length);
        let memberships: any = [];
        const mems = Memberships.find().fetch();
        locations.forEach((loc) => {
            const mem: any = mems.find((m: any) => loc.membershipId === m._id);
            const found = memberships.find((m: any) => m._id === mem._id);
            if (!found) {
                memberships.push(mem);
            }
        });
        return {locations: locations, memberships: memberships};
    }
});