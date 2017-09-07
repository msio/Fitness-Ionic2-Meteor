import {assert, expect} from 'chai';
import  {resetDatabase}  from 'meteor/xolvio:cleaner';
import {Chats} from "../collections";
import {writeMessage} from "./methods";
import {Notifications} from "../notifications/notifications";
import {LOGIN_STATUS} from "../auth/user";


describe('write message method', () => {
    let userId;
    let chatId;
    let receiverId;

    before(() => {
        Notifications.init();
        resetDatabase();
        let user = {
            profile: {
                firstName: 'firstNameR',
                lastName: 'lastNameR',
                gender: 'male',
                birthday: new Date(),
                picture: null,
                about: '',
            },
            devices: [{
                id: 'cq8_f5MmWzQ:APA91bFTqRVlOfUe4q8oxl9xwVDVrOfCHwdCy8-WN_q6mrYm2UbIPLDjcx4-Xn3CA9FyFzMhMFjZ7WsK2y6G0T1PbSyww0zPNyuZrz8kU2x2p--qBlMVtBScIdY_XcV6oxd1Tn-EBL9W',
                status: LOGIN_STATUS.LOGGED_IN
            }]
        };

        receiverId = Meteor.users.insert(user);
        user = {
            profile: {
                firstName: 'firstName',
                lastName: 'lastName',
                gender: 'male',
                birthday: new Date(),
                picture: null,
                about: '',
            },
            devices: [{id: 'deviceId', status: LOGIN_STATUS.LOGGED_IN}]
        };
        userId = Meteor.users.insert(user);
        chatId = Chats.insert({
            memberIds: [userId, receiverId]
        })
    });

    it('writes a new message', () => {
        const args = {chatId: chatId, content: 'What\'s up'};
        writeMessage._execute({userId: userId}, args);
    });

});
