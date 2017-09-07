import {Credentials} from "../models/credentials";
import {Observable} from "rxjs/Observable";
/**
 * Created by msio on 10/27/16.
 */


export class UserDataServiceMock {


    login(credentials: Credentials): Observable<any> {
        return Observable.create(observer => {
            observer.next();
        });
    }
}

export class FacebookMock{

}

export class ViewInterfaceMock{

}

export class SubscriptionServiceMock{

    init(nav, toastCtrl) {
    }
}