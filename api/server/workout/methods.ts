import {METHOD} from "../api-points-constants/api-points-constants";
import {Exercises} from "../collections";

declare let SimpleSchema;

export const findExercises = new ValidatedMethod({
    name: METHOD.FIND_EXERCISES,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: null,
    run() {
        return Exercises.find().fetch();
    }
});