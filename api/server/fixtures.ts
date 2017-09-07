import {Memberships, UserPool, Locations, Pokes, Chats, Messages, Matches, Exercises} from "./collections";
import Chance = require('chance');
import toonavatar = require('cartoon-avatar');
import * as moment from 'moment';
import * as _ from 'underscore';
import {Moment} from 'moment';

import {GeoUtil} from "./util/geoUtil";
import {NumberUtil} from "./util/numberUtil";
import {DateUtil} from "./util/dateUtil";
import {BIRTHDAY_TRANSFER_FORMAT} from "./constants/date-time-formats";


declare let Factory, toonavatar, Accounts;

const chance = Chance();

function roundToNearestMinutes(date: Moment, minutes: number) {
    const duration = moment.duration(minutes, 'minutes');
    return moment(Math.ceil((+date) / (+duration)) * (+duration));
}

export function generateDataExercises() {
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

    exercise.name = 'Legs';
    Exercises.insert(exercise);

    exercise.name = 'Pull';
    Exercises.insert(exercise);
}

Meteor.startup(() => {
    let loc1, loc2, loc3, loc4, loc5;

    Pokes.remove({});
    Memberships.remove({});
    Locations.remove({});
    Locations._ensureIndex({'geometry': '2dsphere'});


    if (Memberships.find().count() === 0) {
        const mem1Id = Memberships.insert({
            name: 'Fitness 1',
            icon: {
                publicId: 'publicID',
                cloudName: 'cloudName'
            }
        });
        const mem2Id = Memberships.insert({
            name: 'Fitness 2',
            icon: {
                publicId: 'publicID',
                cloudName: 'cloudName'
            }
        });

        //vienna
        loc1 = Locations.insert({
            membershipId: mem1Id,
            geometry: GeoUtil.createGeoPointJSON(16.3041005, 48.246991),
            address: {
                street: 'Street 1',
                postalCode: '1234',
                city: 'City',
                country: 'Country'
            }
        });

        loc2 = Locations.insert({
            membershipId: mem2Id,
            geometry: GeoUtil.createGeoPointJSON(16.3041004, 48.2469484),
            address: {
                street: 'Street 2',
                postalCode: '1234',
                city: 'City',
                country: 'Country'
            }
        });

    }

    if (Exercises.find().count() === 0) {
        generateDataExercises();
    }


    const users = Meteor.users.find({$and: [{'createdAt': {$exists: true}}, {'profile.firstName': {$ne: 'admin'}}]}).fetch();
    Meteor.users.remove({});
    //test user
    if (users.length === 0) {
        const user = {
            profile: {
                firstName: 'John',
                lastName: 'Test',
                gender: 'male',
                birthday: moment('1989-05-01', BIRTHDAY_TRANSFER_FORMAT).toDate(),
                picture: null,
                about: 'About me'
            },
            devices: [{id: 'deviceId', status: 'LOGGED_IN'}]
        };
        const userId = Meteor.users.insert(user);
        Accounts.setPassword(userId, 'test1234');
        Accounts.addEmail(userId, 'john@test.com');
    }
    UserPool.remove({});
    UserPool._ensureIndex({'locGeometry': '2dsphere'});

    let userIds = [];
    users.forEach((user) => {
        userIds.push(user._id);
        Meteor.users.insert(user);
        /*UserPool.insert({
         userId: user._id,
         userName: {firstName: user.profile.firstName, lastName: user.profile.lastName},
         userAge: DateUtil.calcUserAge(<Date>user.profile.birthday),
         userPicture: user.profile.picture,
         userOtherPictures: [],
         userAbout: user.profile.about,
         userGender: user.profile.gender,
         activityStartFrom: new Date(),
         activityStartTo: new Date(),
         locationId: loc1,
         userLocDistance: loc1Distance,
         membership: (<any>Locations.findOne(loc1)).membership
         });*/
    });


    const numberMessages = new NumberUtil();
    // Chats.remove({});
    // Messages.remove({});
    if (Chats.find().count() === 0 && users.length !== 0) {
        const chatId = Chats.insert({
            memberIds: userIds,
            createdBy: new Date()
        });
        Factory.define('messages', Messages, {
            senderId: () => chance.pickone(userIds),
            chatId: chatId,
            content: () => chance.sentence(),
            createdAt: () => moment().subtract(numberMessages.generate(), 'days').toDate(),
            memberIds: userIds,
            matchMsg: false
        });
        _.times(5, () => {
            Factory.create('messages');
        });
    }

    Pokes.remove({});
    Matches.remove({});

    const numberUserPool = new NumberUtil();
    const numberPoke = new NumberUtil();

    function createPictures() {
        let pictures = [];
        _.times(3, () => {
            pictures.push({url: toonavatar.generate_avatar(), _id: Random.id(), createdAt: new Date()});
        });
        return pictures;
    }

    const exercises: any = Exercises.find().fetch();
// let startFrom;
    let startTo;
    for (let i = 0; i < 20; i++) {
        let loc;
        if (i < 1) {
            loc = loc5;
            // startFrom = moment('16:00', 'HH:mm');
            // startTo = moment('17:00', 'HH:mm');
        } else if (i >= 1 && i < 2) {
            loc = loc1;
            // startFrom = moment('17:00', 'HH:mm');
            // startTo = moment('17:30', 'HH:mm');
        } else {
            loc = loc3;
            // startFrom = moment('16:45', 'HH:mm');
            // startTo = moment('17:15', 'HH:mm');
        }
        const user = {
            profile: {
                firstName: chance.first(),
                lastName: chance.last(),
                gender: chance.gender().toLowerCase(),
                birthday: chance.birthday({year: chance.year({min: 1950, max: 1995})}),
                picture: {url: toonavatar.generate_avatar(), _id: Random.id()},
                about: chance.sentence({words: 5})
            },
            devices: [{id: 'deviceId', status: 'LOGGED_IN'}]
        };
        const userId = Meteor.users.insert(user);
        /* const startFrom = roundToNearestMinutes(moment().add('minutes'), numberUserPool.generate());
         UserPool.insert({
          userId: userId,
          name: {firstName: user.profile.firstName, lastName: user.profile.lastName},
          age: DateUtil.calcUserAge(<Date>user.profile.birthday),
          picture: user.profile.picture,
          otherPictures: createPictures(),
          about: user.profile.about,
          gender: user.profile.gender,
          activityStartFrom: startFrom.toDate(),
          activityStartTo: startFrom.add(1, 'hours').toDate(),
          locationId: loc1,
          locGeometry: (<any>Locations.findOne(loc1)).geometry,
          locAddress: (<any>Locations.findOne(loc1)).address,
          membership: _.omit(Memberships.findOne((<any>Locations.findOne(loc1)).membershipId), '_id'),
          membershipId: mem2Id,
          exercises: _.first(exercises, 2),
          exercisesCount: 2
          });*/
    }

    /* Factory.define('user', Meteor.users, {
     profile: {
     firstName: () => chance.first(),
     lastName: () => chance.last(),
     gender: () => chance.gender().toLowerCase(),
     birthday: () => chance.birthday({year: chance.year({min: 1950, max: 1995})}),
     picture: () => {
     return {url: toonavatar.generate_avatar(), pictureId: Random.id()}
     },
     about: () => chance.sentence({words: 5})
     },
     devices: [{id: 'deviceId', status: 'LOGGED_IN'}]
     }).after(user => {
     const startFrom = roundToNearestMinutes(moment().add('minutes'), numberUserPool.generate());
     // const startFrom = roundToNearestMinutes(moment(), 15);
     Factory.define('userPoolEntry',UserPool,{
     userId: user._id,
     name: {firstName: user.profile.firstName, lastName: user.profile.lastName},
     age: DateUtil.calcUserAge(<Date>user.profile.birthday),
     picture: user.profile.picture,
     otherPictures: createPictures(),
     about: user.profile.about,
     gender: user.profile.gender,
     activityStartFrom: startFrom.toDate(),
     activityStartTo: startFrom.add({hours: 1}).toDate(),
     locationId: loc5,
     locGeometry: (<any>Locations.findOne(loc5)).geometry,
     locDistance: loc1Distance,
     membership: (<any>Locations.findOne(loc5)).membership,
     exercises: _.first(exercises, 2)
     });

     const userPoolEntry = Factory.create('userPoolEntry');

     /!*Factory.define('poke', Pokes, {
     createdByUserId: () => user._id,
     forUserId: userIds[1],
     createdByUser: UserUtil.createUserObject(user.profile),
     // activityStartFrom: () => roundToNearestMinutes(moment().add(1, 'minutes'), 15).toDate(),
     activityStartFrom: () => roundToNearestMinutes(moment().add(1, 'minutes'), numberPoke.generate()).toDate(),
     userPoolEntryId: userPoolEntry._id,
     activityStartTo: userPoolEntry.activityStartTo,
     locationId: userPoolEntry.locationId,
     membership: userPoolEntry.membership,
     timestamp: new Date()
     });*!/
     // Factory.create('poke');
     });

     _.times(10, () => {
     Factory.create('user');
     })*/

    /*const pool: any = UserPool.aggregate(
     {$match: {exercises: {$all: _.first(exercises, 1)}}},
     {$addFields: {exercisesCount: {$size: '$exercises'}}},
     {$sort: {exercisesCount: 1}}
     // {$group: {_id: '$exercises',count: { $sum: 1 }}}
     );*/
    /*const pool: any = UserPool.aggregate(
     {
     $geoNear: {
     near: {type: 'Point', coordinates: [17.2684752, 48.2595475]},
     distanceField: 'locDistance',
     spherical: true,
     maxDistance: 1000000
     }
     }, {$sort: {}}
     )*/

// const from = moment('17:00', 'HH:mm').toDate();
// const to = moment('17:30', 'HH:mm').toDate();
// // const fromComputed = ;
// // const ToComputed = ;
//
// const pool: any = UserPool.aggregate([
//     {$match: {activityStartFrom: {$lte: to}, activityStartTo: {$gte: from}}},
//
// ]);
    /*pool.forEach((val, index) => {
     // val.exercises.forEach((exer) => {
     //     console.log(exer.name);
     // });
     console.log(val.exercises);
     });
     console.log(pool.length);*/
})
;

