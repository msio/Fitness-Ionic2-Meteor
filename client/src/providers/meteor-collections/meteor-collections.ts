import {Injectable} from '@angular/core';
import {MeteorObservable, MongoObservable} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";

const UserPool = new MongoObservable.Collection('userPool');

@Injectable()
export class UserPoolCollection {

    get(): MongoObservable.Collection<any> {
        return UserPool;
    }

    subscribe(name: string, param: any): Observable<any> {
        return MeteorObservable.subscribe(name, param);
    }
}
