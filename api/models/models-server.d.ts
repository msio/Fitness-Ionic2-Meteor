import {LOGIN_STATUS} from "../server/auth/user";

export interface UserSearchParams {
    activityStart: { from: any, to: any };
    position?: { lat: number, lng: number, timestamp: number, radius: number; };
    //{locId: string} | Array<string>
    membership?: any;
    gender: string;
    ageRange: { lower: number, upper: number };
    exercises: Array<string>;
}

export interface Location {
    membershipId: string;
    //use GeoPoint
    geometry: { type: string, coordinates: Array<number> };
}

export interface UserPool {
    userId: string;
    userAge: number;
    activityStartFrom: Date;
    activityStartTo: Date;
    locationId: string;
}


export interface UserProfile {
    firstName: string;
    lastName: string;
    gender: 'male' | 'female';
    birthday: Date;
    picture: Object;
    about: string;
}
/*export interface User extends Meteor.User{
 profile: UserProfile;
 devices: Array<{id: string, status: LOGIN_STATUS}>
 }*/


