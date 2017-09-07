/*
import {assert, expect} from 'chai';
import  {resetDatabase}  from 'meteor/xolvio:cleaner';
import * as moment from 'moment';
import Chance = require('chance');

import {GeoUtil} from "../util/geoUtil";
import {Locations, UserPool, Memberships} from "../collections";
import {findLocations, findInUserPool} from "./publications";
import {GeoPoint} from "../../models/GeoPoint.ts";
import {BIRTHDAY_TRANSFER_FORMAT} from "../constants/date-time-formats";
import {DATE_FORMAT, DATE_TIME_FORMAT} from "../constants/constants.test";


const PublicationCollector = Package['publication-collector'].PublicationCollector;

describe('find.users - publication', () => {
    let userId: string;
    let locId: string;

    before(() => {
        resetDatabase();
        Locations['_ensureIndex']({'geometry': '2dsphere'});
        UserPool._ensureIndex({'location': '2dsphere'});

        userId = Meteor.users.insert({
            profile: {
                firstName: 'Mark',
                lastName: 'Test',
                gender: 'male',
                birthday: moment('20.05.1988', DATE_FORMAT).toDate(),
                picture: null,
                about: 'about'
            }
        });


        locId = Locations.insert({
            membershipId: Random.id(),
            geometry: new GeoPoint(0, 0),
            address: 'address',
            membership: {name: 'test', icon: 'http://www.test.com'}
        });


        UserPool.insert({
            userId: Random.id(),
            userPicture: 'http://www.test.com',
            userAge: 24,
            userName: {firstName: 'Mark', lastName: 'Test'},
            userGender: 'both',
            activityStartFrom: moment('20.12.2016, 18:00', DATE_TIME_FORMAT).toDate(),
            activityStartTo: moment('20.12.2016, 18:30', DATE_TIME_FORMAT).toDate(),
            locationId: locId,
            membership: {name: 'test', icon: 'http://www.test.com'},
            userAbout: 'about'
        });
    });

    it('collector', () => {
        // const collector = new PublicationCollector({userId: userId});
        const params = {
            activityStart: {
                from: moment('20.12.2016, 18:00', DATE_TIME_FORMAT).toDate(),
                to: moment('20.12.2016, 18:30', DATE_TIME_FORMAT).toDate()
            },
            membership: {locId: locId},
            gender: 'both',
            ageRange: {lower: 18, upper: 50}
        }
        // collector.collect('find.users', params, (collections) => {
        //     console.log('collections: ', collections.usersPool);
        //     done();
        // });
    });
});
*/
