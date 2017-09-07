import SimpleSchema from 'simpl-schema';
import * as _ from 'underscore';

export const UserSearchParamsSchema = new SimpleSchema({
    activityStart: {
        type: new SimpleSchema({
            from: {type: Date},
            to: {type: Date}
        })
    },
    position: {
        type: new SimpleSchema({
            lat: {type: Number},
            lng: {type: Number},
            timestamp: {optional: true, type: Number}
        }),
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['male', 'female', 'both']
    },
    ageRange: {
        type: new SimpleSchema({
            lower: {type: Number},
            upper: {type: Number}
        })
    },
    exercises: {
        type: Array
    },
    'exercises.$': {
        type: new SimpleSchema({
            id: SimpleSchema.RegEx.Id
        })
    },
    membership: {
        type: Array,
        minCount: 1
    },
    'membership.$': {
        type: new SimpleSchema({
            locId: SimpleSchema.RegEx.Id
        })
    }
    /*membership: {
     type: Object,
     blackbox: true,
     optional: true,
     custom: function () {
     if (this.isSet) {
     //TODO add custom error messages with https://github.com/aldeed/node-message-box
     if (_.isArray(this.value)) {
     if (_.isEmpty(this.value)) {
     return 'array cannot be empty';
     }
     let error = this.value.every(item => {
     return SimpleSchema.RegEx.Id.test(item);

     });
     if (!error) {
     return 'must be array of ids if array';
     }
     } else if (this.value.locId) {
     if (!SimpleSchema.RegEx.Id.test(this.value.locId)) {
     return 'must be id if locId in object'
     }
     } else {
     return 'must be array of ids or object with locId'
     }
     }
     }
     }*/
});

