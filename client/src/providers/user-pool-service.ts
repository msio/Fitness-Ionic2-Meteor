import {Injectable} from '@angular/core';
import {isDefined, isArray, isUndefined} from "ionic-angular/util/util";
import {UserSearchParams} from "../models/user-search-params";

@Injectable()
export class UserPoolService {

    constructor() {
    }

    /**
     * convert moment to js date in property activityStart
     *
     * @param userSearchParams
     * @returns {UserSearchParams}
     */
    prepareUserSearchParams(userSearchParams: UserSearchParams) {
        //convert moment to date
        userSearchParams.activityStart = <any>{
            from: userSearchParams.activityStart.from.clone().toDate(),
            to: userSearchParams.activityStart.to.clone().toDate(),
        }
        userSearchParams.membership = <any>userSearchParams.membership.locations.map((loc) => {
            return {locId: loc._id}
        })
        if (isDefined(userSearchParams.position) && isUndefined(userSearchParams.position.lng)) {
            userSearchParams.position = undefined;
        }
        userSearchParams.exercises = userSearchParams.exercises.map((exercise) => {
            return {id: exercise._id};
        });
        return userSearchParams;
    }

    prepareMembership(mapArray): Array<string> | { locId: string } {
        if (isDefined(mapArray)) {
            let onlyMems: Array<string> = [];
            for (let [key, value] of mapArray) {
                if (isDefined(value.location)) {
                    return {locId: value.location._id};
                } else {
                    onlyMems.push(key);
                }
            }
            return onlyMems.length !== 0 ? onlyMems : undefined;
        }
        return undefined;
    }
}
