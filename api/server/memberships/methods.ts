import {METHOD} from "../api-points-constants/api-points-constants";
import {Memberships} from "../collections";

export const listMemberships = new ValidatedMethod({
    name: METHOD.LIST_MEMBERSHIPS,
    mixins: [LoggedInMixin],
    checkLoggedInError: {
        error: 'notLoggedIn'
    },
    validate: null,
    run() {
        return Memberships.find().fetch();
    }
});
