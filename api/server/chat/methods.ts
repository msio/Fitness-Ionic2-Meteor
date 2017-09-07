import SimpleSchema from "simpl-schema";
import {Chats, Messages} from "../collections";
import * as _ from 'underscore';
import {METHOD} from "../api-points-constants/api-points-constants";
import {Notifications, NOTIFICATION_TYPE_ENUM} from "../notifications/notifications";

function insertAndNotifyMessage(senderId: string, receiverId: string, content: string, chatId: string, matchMsg: boolean): string {
    let newMessage: any = {
        senderId: senderId,
        chatId: chatId,
        memberIds: [senderId, receiverId],
        content: content,
        createdAt: new Date(),
        matchMsg: matchMsg
    };
    newMessage._id = Messages.insert(newMessage);

    const receiver: any = Meteor.users.findOne(receiverId);
    const sender: any = Meteor.users.findOne(senderId);

    Notifications.pushToAllDevices(receiver.devices, NOTIFICATION_TYPE_ENUM.MSG, {firstName: sender.profile.firstName}, {chatId: chatId});
    return chatId;
}

export const writeMatchMessage = new ValidatedMethod({
    name: METHOD.WRITE_MATCH_MESSAGES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        receiverId: {type: SimpleSchema.RegEx.Id},
        content: String
    }).validator(),
    run({receiverId, content}) {
        if (receiverId === this.userId) {
            throw new Meteor.Error(METHOD.WRITE_MATCH_MESSAGES, 'Receiver can not be the same like logged user');
        }
        //TODO if user are already match they don't have to match again by another training. There is only one writeMatchMessage for the same users

        let chat: any = Chats.findOne({
            memberIds: {$all: [this.userId, receiverId]}
        });


        if (_.isUndefined(chat)) {
            chat = {
                memberIds: [this.userId, receiverId]
            };
            chat._id = Chats.insert(chat);
        } else {
            if (chat.memberIds[0] === this.userId) {
                throw new Meteor.Error(METHOD.WRITE_MATCH_MESSAGES, 'Same sender can write match only once per chat');
            }
        }
        return insertAndNotifyMessage(this.userId, receiverId, content, chat._id, true);
    }
});


export const writeMessage = new ValidatedMethod({
    name: METHOD.WRITE_MESSAGE,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        chatId: {type: SimpleSchema.RegEx.Id},
        content: {type: String}
    }).validator(),
    run({chatId, content}) {
        const chat: any = Chats.findOne(chatId);
        if (_.isUndefined(chat)) {
            throw new Meteor.Error('write.messages', 'No selected Chat find by that ID');
        }

        let senderId;
        let receiverId;

        //there are just 2 memberIds
        chat.memberIds.forEach((memId) => {
            if (memId === this.userId) {
                senderId = this.userId;
            } else {
                receiverId = memId;
            }
        });

        if (_.isUndefined(senderId)) {
            throw new Meteor.Error('write.messages', 'Logged User is not a member of that selected Chat');
        }

        return insertAndNotifyMessage(senderId, receiverId, content, chat._id, false);
    }
});


export const findChats = new ValidatedMethod({
    name: METHOD.FIND_CHATS,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: null,
    run() {
        let chats = Chats.find({memberIds: this.userId}).fetch();
        let messages = [];
        chats = chats.map((chat: any) => {
            messages = messages.concat(Messages.find({chatId: chat._id}, {
                sort: {createdAt: -1},
                limit: 10
            }).fetch());

            const receiverId = chat.memberIds[0] === this.userId ? chat.memberIds[1] : chat.memberIds[0];
            const user = Meteor.users.findOne(receiverId);
            chat.receiver = {_id: user._id, firstName: user.profile.firstName, picture: user.profile.picture};
            return chat
        });
        return {
            chats: chats,
            messages: messages
        }
    }
});

export const findChatId = new ValidatedMethod({
    name: METHOD.FIND_ID_CHAT,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        receiverId: {type: SimpleSchema.RegEx.Id}
    }).validator(),
    run({receiverId}) {
        const chat: any = Chats.findOne({
            memberIds: receiverId
        });
        return !_.isUndefined(chat) ? chat._id : null;
    }
});

export const findMessages = new ValidatedMethod({
    name: 'find.messages',
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: null,
    run() {
        //TODO tou can also use chatId, add limit
        return Messages.find({memberIds: this.userId}, {
            sort: {createdAt: -1},
            limit: 30
        }).fetch();
    }
});

export const findChatUser = new ValidatedMethod({
    name: METHOD.FIND_CHAT_USER,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: new SimpleSchema({
        chatId: {type: String},
    }).validator(),
    run({chatId}) {
        let chat: any = Chats.findOne(chatId);
        const receiverId = chat.memberIds[0] === this.userId ? chat.memberIds[1] : chat.memberIds[0];
        const user = Meteor.users.findOne(receiverId);
        chat.receiver = {_id: user._id, firstName: user.profile.firstName, picture: user.profile.picture};
        return chat;
    }
});
