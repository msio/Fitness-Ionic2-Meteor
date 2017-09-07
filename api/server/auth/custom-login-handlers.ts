import {ApplicationUtil} from "../util/applicationUtil";
import * as _ from 'underscore';
import {LOGIN_STATUS, updateDeviceStatus} from "./user";

declare let SRP, Accounts, Match;

Accounts.registerLoginHandler((options: any) => {
    if (!options.authFacebook) {
        return undefined;
    }

    //validates access token if it is still valid
    try {
        const token = HTTP.get(Meteor.settings['facebook'].graphApiUrl + 'debug_token', {
            params: {
                input_token: options.authFacebook.accessToken,
                access_token: ApplicationUtil.getFacebookAccesToken()
            }
        });
        if (!token.data.data.is_valid) {
            throw new Meteor.Error('Access Token is invalid');
        }
    } catch (error) {
        throw new Meteor.Error('Access Token is invalid', error);
    }

    const serviceData = {
        accessToken: options.authFacebook.accessToken,
        //meteor package accounts-facebook converts expiresAt to expiresIn too
        expiresAt: (+new Date) + (1000 * options.authFacebook.expiresIn),
        id: options.authFacebook.userID
    }

    //TODO check it the email already exists although it comes from fb!!!

    const profile = {
        profile: options.userData
    }
    const user = Accounts.updateOrCreateUserFromExternalService('facebook', serviceData, profile);
    return {userId: user.userId};
});

const NonEmptyString = Match.Where(function (x) {
    check(x, String);
    return x.length > 0;
});

const userQueryValidator = Match.Where(function (user) {
    check(user, {
        id: Match.Optional(NonEmptyString),
        username: Match.Optional(NonEmptyString),
        email: Match.Optional(NonEmptyString)
    });
    if (_.keys(user).length !== 1)
        throw new Match.Error("User property must have exactly one field");
    return true;
});

const passwordValidator = Match.OneOf(
    String,
    {digest: String, algorithm: String}
);


// copy the code from release 1.4.3
Accounts.registerLoginHandler((options) => {
    //srp will not handled
    //pass is password, There is already register login handler for password
    if (!options.pass && !options.deviceId)
        return undefined; // don't handle

    check(options, {
        user: userQueryValidator,
        pass: passwordValidator,
        deviceId: String
    });

    var user = Accounts._findUserByQuery(options.user);
    if (!user)
        throw new Meteor.Error(403, "User not found");

    if (!user.services || !user.services.password || !(user.services.password.bcrypt || user.services.password.srp))
        throw new Meteor.Error(403, "User has no password set");

    if (!user.services.password.bcrypt) {
        if (typeof options.pass === "string") {
            // The client has presented a plaintext password, and the user is
            // not upgraded to bcrypt yet. We don't attempt to tell the client
            // to upgrade to bcrypt, because it might be a standalone DDP
            // client doesn't know how to do such a thing.
            var verifier = user.services.password.srp;
            var newVerifier = SRP.generateVerifier(options.pass, {
                identity: verifier.identity, salt: verifier.salt
            });

            if (verifier.verifier !== newVerifier.verifier) {
                return {
                    userId: user._id,
                    error: new Meteor.Error(403, "Incorrect password")
                };
            }

            return {userId: user._id};
        } else {
            // Tell the client to use the SRP upgrade process.
            throw new Meteor.Error(400, "old password format", EJSON.stringify({
                format: 'srp',
                identity: user.services.password.srp.identity
            }));
        }
    }
    const result = Accounts._checkPassword(
        user,
        options.pass
    );
    if (!result.error) {
        updateDeviceStatus(user._id,options.deviceId,LOGIN_STATUS.LOGGED_IN);
    }
    return result;
});