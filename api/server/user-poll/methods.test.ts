import {assert, expect} from 'chai';
import  {resetDatabase}  from 'meteor/xolvio:cleaner';
import {Locations, Memberships, Pictures, UserPool} from "../collections";
import {createNewUserSearch} from "./methods";
import {GeoPoint} from "../../models/GeoPoint";
import {DateUtil} from "../util/dateUtil";
import * as _ from 'underscore';

declare let Factory,Random,Meteor;

describe.only('createNewUserSearch', () => {

    let userId1, user2, user3;
    let profilePic1Id, profilePic2Id;

    before(() => {
        resetDatabase();
        let user: any = {
            profile: {
                firstName: 'firstName',
                lastName: 'lastName',
                gender: 'male',
                birthday: new Date(),
                picture: null,
                about: 'about'
            }
        }
        userId1 = Meteor.users.insert(user);

        user.profile.picture = {_id: Random.id(), url: 'http://www.test.com'};
        user2 = Meteor.users.findOne(Meteor.users.insert(user));
        Pictures.insert({
            _id: user2.profile.picture._id,
            userId: user2._id,
            url: 'http://www.test.com',
            createdAt: new Date()
        });


        user.profile.picture = {_id: Random.id(), url: 'http://www.test.com'};
        user3 = Meteor.users.findOne(Meteor.users.insert(user));
        Pictures.insert({
            _id: user3.profile.picture._id,
            userId: user3._id,
            url: 'http://www.test.com',
            createdAt: new Date()
        });
        Pictures.insert({
            userId: user3._id,
            url: 'http://www.test.com',
            createdAt: new Date()
        });
    });

    it('create new user pool entry, passed only one location', () => {
        const locId = Random.id();
        const memId = Random.id();
        Locations.findOne = () => {
            return {_id: locId, geometry: new GeoPoint(1, 1), membershipId: memId}
        }

        Memberships.findOne = () => {
            return {_id: memId, name: 'membershipName', icon: 'http://wwww.test.com'}
        }

        const args = {
            activityStart: {
                from: new Date(),
                to: new Date()
            },
            gender: 'male',
            ageRange: {lower: 18, upper: 50},
            exercises: [],
            membership: [{locId: Random.id()}]
        };
        createNewUserSearch._execute({userId: user3._id}, args);
        const userPool = UserPool.findOne({userId: user3._id});
        const expectedUserPool = {
            userId: user3._id,
            name: {firstName: user3.profile.firstName, lastName: user3.profile.lastName},
            age: DateUtil.calcUserAge(<any>user3.profile.birthday),
            picture: user3.profile.picture,
            otherPictures: Pictures.find({
                userId: user3._id,
                _id: {$ne: user3.profile.picture._id}
            }, {fields: {userId: 0}}).fetch(),
            gender: user3.profile.gender,
            about: user3.profile.about,
            activityStartFrom: args.activityStart.from,
            activityStartTo: args.activityStart.to,
            exercises: args.exercises,
            exercisesCount: args.exercises.length,
            locationId: Locations.findOne()._id,
            locGeometry: Locations.findOne().geometry,
            membership: _.omit(Memberships.findOne(), '_id'),
            membershipId: Locations.findOne().membershipId

        }
        expect(expectedUserPool).to.deep.equal(_.omit(userPool, '_id'));
    });

});