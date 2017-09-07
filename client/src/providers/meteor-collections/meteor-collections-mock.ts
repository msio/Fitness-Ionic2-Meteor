import {Injectable} from '@angular/core';
import {MongoObservable} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";


@Injectable()
export class UserPoolCollectionMock {

    subscribe(name: string, param: any): Observable<any> {
        return Observable.create(observer => {
            observer.next();
        });
    }

    get(): MongoObservable.Collection<any> {
        const userPool = new MongoObservable.Collection(null);

        const newEntry = {
            "userId": "urSrhBTFHo6LyxLe8",
            "name": {
                "firstName": "Elsie",
                "lastName": "Romero"
            },
            "age": 43,
            "picture": {
                "url": "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/114.png",
                "_id": "Yk4cKMhXup3CTrv9m"
            },
            "otherPictures": [
                {
                    "url": "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/35.png",
                    "_id": "LWDrrNHqFTrJTxjXj",
                    "createdAt": "2017-06-06T14:03:20.262Z"
                },
                {
                    "url": "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/73.png",
                    "_id": "WbZirFD7G89K3zyAQ",
                    "createdAt": "2017-06-06T14:03:20.262Z"
                },
                {
                    "url": "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/50.png",
                    "_id": "2uih22JmDJzf6nYqG",
                    "createdAt": "2017-06-06T14:03:20.262Z"
                }
            ],
            "about": "Had jesaveke gahbukva mehul wumduluh.",
            "gender": "female",
            "activityStartFrom": "2017-06-06T14:20:00.000Z",
            "activityStartTo": "2017-06-06T15:20:00.000Z",
            "locationId": "zDWGvGc3pNczkYkZe",
            "locGeometry": {
                "type": "Point",
                "coordinates": [
                    16.3041005,
                    48.246991
                ]
            },
            "locAddress": {
                "street": "Praterstraße 62-64",
                "postalCode": "1020",
                "city": "Vienna",
                "country": "Austria"
            },
            "membership": {
                "name": "McFit",
                "icon": {
                    "publicId": "mcfit_yc5sug",
                    "cloudName": "passionizer"
                }
            },
            "membershipId": "r9k5a452xS9fThtfQ",
            "exercises": [
                {
                    "_id": "DGCXWxmzNkun99wEi",
                    "name": "Brust",
                    "icon": "http://wwww.test.com"
                },
                {
                    "_id": "y9gCbviZEbrnE8W3Q",
                    "name": "Schulter",
                    "icon": "http://wwww.test.com"
                }
            ],
            "exercisesCount": 2,
            "poked": false,
            "_id": "Z7dkesMhGHu7AZKq9"
        }

        userPool.insert(newEntry);

        return userPool;
    }

}
