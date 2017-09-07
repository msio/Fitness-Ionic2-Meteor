import {Moment} from 'moment';
import {isDefined} from "ionic-angular/util/util";


export interface UserSearchParams {
    activityStart: ActivityStart;
    position?: Position;
    membership: MembershipParam;
    gender: string;
    ageRange: { lower: number, upper: number };
    exercises: Array<any>
}

export interface MembershipParam {
    membership: Membership, locations: Array<Location>
}

export interface ActivityStart {
    from: Moment;
    to: Moment;
}

export interface Membership {
    icon: { publicId: string, cloudName: string },
    name: string
}

export interface Location {
    address: { street: string, postalCode: number, city: string, country: string }
    _id: string,
}

export class Position {
    lat: number;
    lng: number;
    timestamp?: number;
    radius: number;

    constructor(position?: any) {
        this.lat = this.lng = this.timestamp = undefined;
        this.radius = isDefined(position) && isDefined(position.radius) ? position.radius : 20;
    }
}