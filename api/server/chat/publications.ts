import {Chats, Messages} from "../collections";
import SimpleSchema from "simpl-schema";
import {LoggedInCheck} from "../auth/user";
import * as _ from 'underscore';
import {PUBLICATION} from "../api-points-constants/api-points-constants";

declare let Meteor;

Meteor.publishComposite('find.chats', function () {
    LoggedInCheck(this);
    return {
        find: () => {
            return Chats.find({memberIds: this.userId});
        },

        children: [
            {
                find: (chat) => {
                    return Messages.find({chatId: chat._id}, {
                        sort: {createdAt: -1},
                        limit: 1
                    });
                }
            },
            {
                //TODO do not return logged user
                find: (chat) => {
                    return Meteor.users.find({
                        _id: {$in: chat.memberIds}
                    }, {
                        fields: {
                            createdAt: 0,
                            services: 0,
                            emails: 0,
                            'profile.lastName': 0
                        }
                    });
                }
            }
        ]
    };
});

/*Meteor.publish('find.messages', function (chat) {
 LoggedInCheck(this);

 new SimpleSchema({
 chatId: {
 type: SimpleSchema.RegEx.Id,
 },
 counter: {
 type: Number
 },
 lastCreatedAt: {
 type: Date,
 optional: true
 }
 }).validate(chat);
 /!*console.log('messages', Messages.find({chatId: chat.chatId}, {
 sort: {createdAt: -1},
 limit: 30 * chat.counter
 }).count());*!/
 let query: any = {chatId: chat.chatId};
 if (_.isDate(chat.lastCreatedAt)) {
 query.createdAt = {$gt: chat.lastCreatedAt};
 }
 console.log(query);
 console.log(Messages.find(query, {sort: {createdAt: -1}, limit: 30 * chat.counter}).count());
 return Messages.find(query, {sort: {createdAt: -1}, limit: 30 * chat.counter});
 });*/


Meteor.publish(PUBLICATION.FIND.OTHER_MESSAGES, function (params) {
    LoggedInCheck(this);
    new SimpleSchema({
        counter: {
            type: Number,
            optional: true,
        },
        //TODO validate timestamp, check undefined
        lastCreatedAt: {
            type: Number,
            optional: true
        }
    }).validate(params);
    //TODO user memberIds instead of senderId because of more users in chat for future
    //let query: any = {'memberIds.0': {$ne: this.userId}};
    console.log(new Date(params.lastCreatedAt));
    let query: any = {memberIds: this.userId};
    if (!_.isUndefined(params) && params.lastCreatedAt > 0 && _.isDate(new Date(params.lastCreatedAt))) {
        query.createdAt = {$gt: new Date(params.lastCreatedAt)};
    }
    params.counter = _.isUndefined(params.counter) ? 30 : params.counter;
    console.log(Messages.find(query, {sort: {createdAt: -1}, limit: 30}).count());

    const self = this;
    const messages = Messages.find(query, {sort: {createdAt: -1}, limit: 30}).observeChanges({
        added: function (id, fields: any) {
            if (fields.matchMsg) {
                const senderId = fields.memberIds[0] === self.userId ? fields.memberIds[1] : fields.memberIds[0];
                //TODO use picture from last match => instead of matchMSG boolean use match id to get match record to obtain picture image from that
                const user = Meteor.users.findOne(senderId);
                fields.receiver = {_id: user._id, firstName: user.profile.firstName, picture: user.profile.picture}
            }
            self.added('messages', id, fields);
        }
    });

    self.ready();

    self.onStop(() => {
        messages.stop();
    });

});


