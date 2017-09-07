import SimpleSchema from "simpl-schema";

declare let Mongo;

export const Memberships = new Mongo.Collection('memberships');

export const Locations = new Mongo.Collection('locations');

//Poke will be deleted if active user pool entry is also invalid,delete
export const Pokes = new Mongo.Collection('pokes');

//User pool entry will be stored until it is valid but will not be deleted even if user pool entry (in UserPool) was deleted
export const Matches = new Mongo.Collection('matches');

//every user can have just only one userPool entry. This entry is active
export const UserPool = new Mongo.Collection('userPool');

export const Chats = new Mongo.Collection('chats');

export const Messages = new Mongo.Collection('messages');

export const Pictures = new Mongo.Collection('pictures');

export const Exercises = new Mongo.Collection('exercises');

const ImageSchema = new SimpleSchema({
    publicId: {
        type: String,
    },
    cloudName: {
        type: String
    }
});

Exercises.attachSchema({
    name: {
        type: String
    },
    icon: {
        type: SimpleSchema.RegEx.Url
    }
});

Pictures.attachSchema({
    userId: {
        type: SimpleSchema.RegEx.Id
    },
    url: {
        type: SimpleSchema.RegEx.Url
    },
    createdAt: {
        type: Date
    }
});

const MembershipSchema = new SimpleSchema({
    name: {
        type: String
    },
    icon: {
        type: ImageSchema
    }
});

const UserProfileSchema = new SimpleSchema({
    userId: {
        type: SimpleSchema.RegEx.Id
    },
    picture: {
        type: new SimpleSchema({
            url: {
                type: SimpleSchema.RegEx.Url
            },
            '_id': {
                type: SimpleSchema.RegEx.Id
            }
        }),
        optional: true
    },
    otherPictures: {
        type: Array
    },
    'otherPictures.$': {
        type: new SimpleSchema({
            url: {
                type: SimpleSchema.RegEx.Url
            },
            '_id': {
                type: SimpleSchema.RegEx.Id
            },
            createdAt: {
                type: Date
            }
        })
    },
    age: {
        type: Number
    },
    name: {
        type: new SimpleSchema({
            firstName: {
                type: String
            },
            lastName: {
                type: String,
            }
        })
    },
    gender: {
        type: String,
        allowedValues: ['male', 'female']
    },
    about: {
        type: String,
        optional: true
    }
});

const ChatsSchema = new SimpleSchema({
    memberIds: {
        type: Array,
        minCount: 1
    },
    'memberIds.$': {
        type: SimpleSchema.RegEx.Id
    }
});

Chats.attachSchema(ChatsSchema);

const MessagesSchema = new SimpleSchema({
    senderId: {
        type: SimpleSchema.RegEx.Id
    },
    chatId: {
        type: SimpleSchema.RegEx.Id
    },
    content: {
        type: String
    },
    createdAt: {
        type: Date
    },
    matchMsg: {
        type: Boolean
    }
});

const LocationGeometrySchema = new SimpleSchema({
    type: {
        type: String,
        allowedValues: ['Point']
    },
    coordinates: {
        type: Array,
        minCount: 2,
        maxCount: 2
    },
    'coordinates.$': {type: Number}
});

const LocationAddressSchema = new SimpleSchema({
    street: {type: String},
    postalCode: {type: String},
    city: {type: String},
    country: {type: String},
});

MessagesSchema.extend(ChatsSchema);

Messages.attachSchema(MessagesSchema);


Matches.attachSchema(new SimpleSchema({
    forUserId: {
        type: SimpleSchema.RegEx.Id
    },
    matchedUser: {
        type: UserProfileSchema
    },
    timestamp: {
        type: Date
    },
    activityStartFrom: {
        type: Date
    },
    activityStartTo: {
        type: Date
    },
    locAddress: {
        type: LocationAddressSchema
    },
    locationId: {
        type: SimpleSchema.RegEx.Id
    },
    membership: MembershipSchema,
    exercises: {
        type: Array
    },
    'exercises.$': {
        type: new SimpleSchema({
            _id: {
                type: SimpleSchema.RegEx.Id
            },
            name: {
                type: String
            },
            icon: {
                type: SimpleSchema.RegEx.Url
            }
        })
    },
}));


Locations.attachSchema(new SimpleSchema({
    membershipId: {
        type: SimpleSchema.RegEx.Id
    },
    geometry: {
        type: LocationGeometrySchema
    },
    address: {
        type: LocationAddressSchema
    }
}));

Pokes.attachSchema(new SimpleSchema({
    timestamp: {
        type: Date
    },
    forUserId: {
        type: SimpleSchema.RegEx.Id
    },
    createdByUser: {
        type: UserProfileSchema
    },
    userPoolEntryId: {
        type: SimpleSchema.RegEx.Id
    },
    activityStartFrom: {
        type: Date
    },
    activityStartTo: {
        type: Date
    },
    locAddress: {
        type: LocationAddressSchema
    },
    locationId: {
        type: SimpleSchema.RegEx.Id
    },
    membership: MembershipSchema,
    exercises: {
        type: Array
    },
    'exercises.$': {
        type: new SimpleSchema({
            _id: {
                type: SimpleSchema.RegEx.Id
            },
            name: {
                type: String
            },
            icon: {
                type: SimpleSchema.RegEx.Url
            }
        })
    },
}));

UserPool.attachSchema(UserProfileSchema.extend({
    activityStartFrom: {
        type: Date
    },
    activityStartTo: {
        type: Date
    },
    locationId: {
        type: SimpleSchema.RegEx.Id
    },
    locGeometry: {
        type: LocationGeometrySchema
    },
    locAddress: {
        type: LocationAddressSchema
    },
    locDistance: {
        type: Number,
        optional: true
    },
    membership: MembershipSchema,
    membershipId: {
        type: SimpleSchema.RegEx.Id
    },
    exercises: {
        type: Array
    },
    'exercises.$': {
        type: new SimpleSchema({
            _id: {
                type: SimpleSchema.RegEx.Id
            },
            name: {
                type: String
            },
            icon: {
                type: SimpleSchema.RegEx.Url
            }
        })
    },
    exercisesCount: {
        type: Number
    },
    matchedBy: {
        type: Array,
        optional: true
    },
    'matchedBy.$': {
        type: String
    }
}));
