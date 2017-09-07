import {Pokes, Matches} from "../collections";
import {LoggedInCheck} from "../auth/user";
import {PUBLICATION} from "../api-points-constants/api-points-constants";
import {CHECKING_INTERVAL} from "../constants/constants";

declare let Meteor;

//TODO use perhaps only one Meteor.setInterval -> in user-pool
Meteor.setInterval(() => {
    Pokes.find({activityStartFrom: {$lte: new Date()}}).forEach((doc) => {
        //TODO insert to history collection
        Pokes.remove(doc._id);
    });
    Matches.find({activityStartFrom: {$lte: new Date()}}).forEach((doc) => {
        //TODO insert to history collection
        Matches.remove(doc._id);
    });
}, CHECKING_INTERVAL);

Meteor.publish(PUBLICATION.FIND.POKES, function () {
    LoggedInCheck(this);
    return Pokes.find({forUserId: this.userId});
});


Meteor.publish(PUBLICATION.FIND.MATCHES, function () {
    LoggedInCheck(this);
    return Matches.find({forUserId: this.userId}, {
        fields: {
            forUserId: 0
        }
    });
});

//TODO DEVELOPMENT
Meteor.publish('pokes', function (userId) {
    return Pokes.find({forUserId: userId});
});

Meteor.publish('matches', function (userId) {
    return Matches.find({forUserId: userId});
});
