import * as _ from 'underscore';

export class UserUtil {

    static createUserObject(userPoolEntry) {
        let user = _.pick(userPoolEntry, 'picture', 'otherPictures', 'age', 'name', 'gender', 'about');
        user._id = userPoolEntry.userId;
        return user;
    }
}