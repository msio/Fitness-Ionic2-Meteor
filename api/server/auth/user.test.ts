import {prepareProfileForStoring} from "./user";
import {expect, assert} from 'chai';
import * as moment from  'moment';
import {BIRTHDAY_TRANSFER_FORMAT} from "../constants/date-time-formats";

declare let Accounts;

describe('User', () => {
    describe('prepareProfileForStoring()', () => {

        it('validate parsing birthday', () => {
            const profile = {birthday: '1989-09-27'};
            const res = prepareProfileForStoring(profile);
            const expected = moment.utc(profile.birthday, BIRTHDAY_TRANSFER_FORMAT).toDate();

            assert.isTrue(res.birthday instanceof Date);
            assert.isTrue(moment(expected).isSame(res.birthday));
        });
    });

    describe('onCreateUser', () => {
        before(() => {
            Meteor.users.remove({});
        })

        it('validates creating new user', () => {
            Accounts.createUser({
                email: 'test@test.com',
                password: {digest: '12345678', algorithm: 'sha-256'},
                profile: {firstName: 'John', lastName: 'Test', gender: 'male', birthday: '1989-09-11', picture: null}
            });
        });
    });
});
