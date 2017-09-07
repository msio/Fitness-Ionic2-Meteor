import {assert, expect} from 'chai';
import  {resetDatabase}  from 'meteor/xolvio:cleaner';
import {changeUserAbout, setProfilePicture} from "./methods";


describe('changeUserAbout', () => {

    let userId;

    before(() => {
        resetDatabase();
        userId = Meteor.users.insert({
            profile: {
                firstName: 'firstName',
                lastName: 'lastName',
                gender: 'male',
                birthday: new Date(),
                picture: null,
                about: ''
            }
        });
    });

    it('changes profile.about field in logged user', () => {
        const args = {content: 'What\'s up'};
        changeUserAbout._execute({userId: userId}, args);

        const updated = Meteor.users.findOne(userId);
        expect(updated.profile.about).to.equal(args.content);
    });

});

describe('setProfilePicture', () => {

    let userId;

    before(() => {
        resetDatabase();
        userId = Meteor.users.insert({
            profile: {
                firstName: 'firstName',
                lastName: 'lastName',
                gender: 'male',
                birthday: new Date(),
                picture: null,
                about: ''
            }
        });
    });

    it('sets profile picture', () => {
        const args = {pictureId: Random.id()};
        setProfilePicture._execute({userId: userId}, args);

    });

});