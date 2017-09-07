import {assert, expect} from 'chai';
import * as moment from 'moment';
import Chance = require('chance');
import * as _ from 'underscore';

import {GeoUtil} from "../util/geoUtil";
import {UserPool, Exercises, Locations, Memberships} from "../collections";
import {aggregateUserPool, findInUserPool, findNearestLocation} from "./publications";
import {GeoPoint} from "../../models/GeoPoint";
import {DATE_TIME_FORMAT} from "../constants/constants.test";

declare let Random;

function getUserPoolEntryBase() {
    return {
        userId: Random.id(),
        name: {firstName: 'firstName', lastName: 'name'},
        age: 20,
        picture: null,
        otherPictures: [],
        about: 'about',
        gender: 'male',
        activityStartFrom: new Date(0),
        activityStartTo: new Date(0),
        locationId: 'HJ5bAoLrGRkc4nwqH',
        locAddress: {street:'street',postalCode: 'code',city: 'city',country: 'country'},
        locGeometry: GeoUtil.createGeoPointJSON(0, 0),
        membership: {name: 'membership', icon: {publicId:'id',cloudName:'cloudName'}},
        membershipId: Random.id(),
        exercises: [],
        exercisesCount: 0
    }
}

function getUserSearchParamsBase() {
    return {
        activityStart: {
            from: new Date(0),
            to: new Date(0)
        },
        position: null,
        membership: [{locId: 'HJ5bAoLrGRkc4nwqH'}],
        gender: 'male',
        ageRange: {lower: 18, upper: 50},
        exercises: []
    }
}

//this function compares two arrays on _id of objects
function areSameIds(array1, array2) {
    array1 = array1.map((val) => {
        return val._id;
    });
    array2 = array2.map((val) => {
        return val._id;
    });
    return _.isEmpty(_.difference(array1, array2));
}

function generateExercises() {
    let exercise = {
        name: 'Brust',
        icon: 'http://wwww.test.com'
    }
    Exercises.insert(exercise);

    exercise.name = 'Schulter';
    Exercises.insert(exercise);

    exercise.name = 'Bizeps';
    Exercises.insert(exercise);

    exercise.name = 'Bauch';
    Exercises.insert(exercise);

    exercise.name = 'Trizeps';
    Exercises.insert(exercise);

    exercise.name = 'Cardio';
    Exercises.insert(exercise);
}

describe.only('findInUserPool,aggregateUserPool', () => {

    describe('activityStart', () => {

        it('finds activityStartFrom and activityStartTo have to be valid', () => {
            UserPool.remove({});
            let userPoolEntry = getUserPoolEntryBase();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 15:15', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 16:15', DATE_TIME_FORMAT).toDate();
            UserPool.insert(userPoolEntry);

            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            UserPool.insert(userPoolEntry);

            userPoolEntry.activityStartFrom = moment('22.10.2016, 18:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 19:00', DATE_TIME_FORMAT).toDate();
            UserPool.insert(userPoolEntry);


            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.activityStart = {
                from: moment('22.10.2016, 15:00', DATE_TIME_FORMAT).toDate(),
                to: moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate()
            }

            const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 2);
            expect(moment('22.10.2016, 15:15', DATE_TIME_FORMAT).toDate().getTime()).to.equal(found[0].activityStartFrom.getTime());
            expect(moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate().getTime()).to.equal(found[1].activityStartFrom.getTime());

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 2);
            assert.isTrue(areSameIds(found, found2));
        });
    });

    describe('exercises', () => {
        Exercises.remove({});
        generateExercises();
        const exercises: any = Exercises.find().fetch();

        it('finds without defined exercises in user search', () => {
            UserPool.remove({});
            let userPoolEntry = getUserPoolEntryBase();

            userPoolEntry.exercises = _.first(exercises, 2);
            UserPool.insert(userPoolEntry);

            userPoolEntry.exercises = _.first(exercises, 3);
            UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();

            const found = aggregateUserPool(Random.id(),userSearchParams);
            assert.lengthOf(found, 2);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 2);
            assert.isTrue(areSameIds(found, found2));
        });

        it('finds with defined exercises in userSearchParams and inclusion in db', () => {
            UserPool.remove({});
            let userPoolEntry = getUserPoolEntryBase();

            userPoolEntry.exercises = _.first(exercises, 2);
            UserPool.insert(userPoolEntry);

            userPoolEntry.exercises = _.first(exercises, 3);
            UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.exercises = _.first(exercises, 2);

            const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 2);
            expect(2).to.equal(found[0].exercises.length);
            expect(3).to.equal(found[1].exercises.length);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 2);
            assert.isTrue(areSameIds(found, found2));
        });

        it('finds with defined exercises in userSearchParams and no inclusion in db', () => {
            UserPool.remove({});
            let userPoolEntry = getUserPoolEntryBase();

            userPoolEntry.exercises = _.last(exercises, 2);
            UserPool.insert(userPoolEntry);

            userPoolEntry.exercises = _.last(exercises, 3);
            UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.exercises = _.first(exercises, 2);

            const found = aggregateUserPool(Random.id(),userSearchParams);
            assert.lengthOf(found, 0);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 0);
            assert.isTrue(areSameIds(found, found2));
        });

    });

    describe('locations', () => {
        const currentPoint: GeoPoint = GeoUtil.createGeoPointJSON(0, 0);

        it('finds userpool entries with position', () => {
            UserPool.remove({});
            UserPool._ensureIndex({'locGeometry': '2dsphere'});

            let userPoolEntry = getUserPoolEntryBase();
            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 1);
            const locId1 = userPoolEntry.locationId = Random.id();
            const uP1 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 2);
            const locId2 = userPoolEntry.locationId = Random.id();
            const uP2 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 3);
            const locId3 = userPoolEntry.locationId = Random.id();
            const uP3 = UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.position = {lng: currentPoint.coordinates[0], lat: currentPoint.coordinates[1], radius: 2}

           /* const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 2);
            expect(uP1).to.equal(found[0]._id);
            expect(uP2).to.equal(found[1]._id);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 2);

            assert.isTrue(areSameIds(found, found2));*/
        });

        it('finds userpool entries with defined location', () => {
            UserPool.remove({});
            UserPool._ensureIndex({'locGeometry': '2dsphere'});

            let userPoolEntry = getUserPoolEntryBase();
            const locId1 = userPoolEntry.locationId = Random.id();
            const uP1 = UserPool.insert(userPoolEntry);

            const locId2 = userPoolEntry.locationId = Random.id();
            const uP2 = UserPool.insert(userPoolEntry);

            const uP3 = UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.membership.locId = locId2;

            /*const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 2);
            expect(uP2).to.equal(found[0]._id);
            expect(uP3).to.equal(found[1]._id);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 2);

            assert.isTrue(areSameIds(found, found2));*/
        });
    });

    describe('sorting', () => {
        it('sorts location distances ascending', () => {
            const currentPoint: GeoPoint = GeoUtil.createGeoPointJSON(0, 0);
            UserPool.remove({});
            UserPool._ensureIndex({'locGeometry': '2dsphere'});

            let userPoolEntry = getUserPoolEntryBase();
            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 10);
            const locId1 = userPoolEntry.locationId = Random.id();
            const uP1 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 2);
            const locId2 = userPoolEntry.locationId = Random.id();
            const uP2 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 5);
            const locId3 = userPoolEntry.locationId = Random.id();
            const uP3 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 15);
            const locId4 = userPoolEntry.locationId = Random.id();
            const uP4 = UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.position = {lng: currentPoint.coordinates[0], lat: currentPoint.coordinates[1], radius: 15}

            /*const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 4);
            expect(uP2).to.equal(found[0]._id);
            expect(uP3).to.equal(found[1]._id);
            expect(uP1).to.equal(found[2]._id);
            expect(uP4).to.equal(found[3]._id);

            const found2 = findInUserPool(Random.id(),userSearchParams).fetch();
            assert.lengthOf(found2, 4);

            assert.isTrue(areSameIds(found, found2));*/
        });

        it('sorts activityStartFrom ascending', () => {
            UserPool.remove({});
            UserPool._ensureIndex({'locGeometry': '2dsphere'});

            let userPoolEntry = getUserPoolEntryBase();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:45', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            const uP1 = UserPool.insert(userPoolEntry);

            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 16:30', DATE_TIME_FORMAT).toDate();
            const uP2 = UserPool.insert(userPoolEntry);

            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            const uP3 = UserPool.insert(userPoolEntry);

            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            const uP4 = UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.activityStart = {
                from: moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate(),
                to: moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate()
            }

            /*const found = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 4);
            expect(uP4).to.equal(found[0]._id);
            expect(uP2).to.equal(found[1]._id);
            expect(uP1).to.equal(found[2]._id);
            expect(uP3).to.equal(found[3]._id);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 4);

            assert.isTrue(areSameIds(found, found2));*/
        });

        it('sorts activityStartFrom -> locDistance -> exercisesCount ascending', () => {
            Exercises.remove({});
            generateExercises();
            const exercises: any = Exercises.find().fetch();

            const currentPoint: GeoPoint = GeoUtil.createGeoPointJSON(0, 0);
            UserPool.remove({});
            UserPool._ensureIndex({'locGeometry': '2dsphere'});

            let userPoolEntry = getUserPoolEntryBase();
            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 2);
            const locId1 = userPoolEntry.locationId = Random.id();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:45', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.exercises = _.first(exercises, 5);
            const uP1 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 10);
            const locId2 = userPoolEntry.locationId = Random.id();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.exercises = _.first(exercises, 4);
            const uP2 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 5);
            const locId3 = userPoolEntry.locationId = Random.id();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:45', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.exercises = _.first(exercises, 3);
            const uP3 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 15);
            const locId4 = userPoolEntry.locationId = Random.id();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.exercises = _.first(exercises, 3);
            const uP4 = UserPool.insert(userPoolEntry);

            userPoolEntry.locGeometry = GeoUtil.createEndPointByKm(currentPoint, 5);
            const locId5 = userPoolEntry.locationId = Random.id();
            userPoolEntry.activityStartFrom = moment('22.10.2016, 16:45', DATE_TIME_FORMAT).toDate();
            userPoolEntry.activityStartTo = moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate();
            userPoolEntry.exercises = _.first(exercises, 4);
            const uP5 = UserPool.insert(userPoolEntry);

            let userSearchParams = getUserSearchParamsBase();
            userSearchParams.position = {
                lng: currentPoint.coordinates[0],
                lat: currentPoint.coordinates[1],
                radius: 15
            };
            userSearchParams.activityStart = {
                from: moment('22.10.2016, 16:00', DATE_TIME_FORMAT).toDate(),
                to: moment('22.10.2016, 17:00', DATE_TIME_FORMAT).toDate()
            };
            userSearchParams.exercises = _.first(exercises, 3);

            /*const found: any = aggregateUserPool(Random.id(), userSearchParams);
            assert.lengthOf(found, 5);
            expect(uP2).to.equal(found[0]._id);
            expect(uP4).to.equal(found[1]._id);
            expect(uP1).to.equal(found[2]._id);
            expect(uP3).to.equal(found[3]._id);
            expect(uP5).to.equal(found[4]._id);

            const found2 = findInUserPool(Random.id(), userSearchParams).fetch();
            assert.lengthOf(found2, 5);

            assert.isTrue(areSameIds(found, found2));*/
        });
    });
});
