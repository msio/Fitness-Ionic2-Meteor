import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {LoginTypePage} from "./login-type";
import {
    AlertController, App, Config, DomController, Form, IonicModule, Keyboard, LoadingController, NavController,
    Platform, ToastController
} from "ionic-angular";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {DebugElement} from "@angular/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AlertControllerMock, ConfigMock,PlatformMock} from "ionic-mocks";
import {Observable} from "rxjs/Observable";
import {UserDataService} from "../../providers/user-data-service";
import {SubscriptionServiceMock} from "../../test-mocks/mocks";
import {Facebook} from "@ionic-native/facebook";
import {SubscriptionService} from "../../providers/subscription-service";
import {ViewInterface} from "../view-interface/view-interface";
import {TabsPage} from "../tabs/tabs";
import {UserSignUpPersonalDataPage} from "../user-sign-up-personal-data/user-sign-up-personal-data";


class UserDataServiceMock {
    public static instance(): any {

        let instance = jasmine.createSpyObj('UserDataService', ['login']);
        return instance;
    }
}

class NavControllerMock {
    public static instance(): any {
        let instance = jasmine.createSpyObj('NavController', ['setRoot','push']);
        return instance;
    }

}

class LoadingMock {
    public static instance(): any {
        let instance = jasmine.createSpyObj('Loading', ['present', 'dismiss', 'setContent', 'setSpinner','onDidDismiss']);
        instance.present.and.returnValue(Promise.resolve());

        return instance;
    }
}

class LoadingControllerMock {
    public static instance(loading?: LoadingMock): any {

        let instance = jasmine.createSpyObj('LoadingController', ['create']);
        instance.create.and.returnValue(loading || LoadingMock.instance());

        return instance;
    }
}

describe("LoginTypePage", () => {

    let de: DebugElement;
    let comp: LoginTypePage;
    let fixture: ComponentFixture<LoginTypePage>;
    let userDataServiceInstance;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LoginTypePage],
            providers: [
                App, DomController, Form, Keyboard, ToastController, Facebook, ViewInterface, FormBuilder,
                {provide: Config, useFactory: () => ConfigMock.instance()},
                {provide: Platform, useFactory: () => PlatformMock.instance()},
                {provide: LoadingController, useFactory: () => LoadingControllerMock.instance()},
                {provide: AlertController, useFactory: () => AlertControllerMock.instance()},
                {provide: SubscriptionService, useClass: SubscriptionServiceMock},
                {provide: UserDataService, useFactory: () => UserDataServiceMock.instance()},
                {provide: NavController, useFactory: () => NavControllerMock.instance()}
            ],
            imports: [
                FormsModule,
                IonicModule,
                ReactiveFormsModule,
            ],
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(LoginTypePage);
            comp = fixture.componentInstance;
            userDataServiceInstance = comp.userDataService;
        })
    }));

    it('should create LoginTypePage', () => {
        expect(fixture).toBeTruthy()
    })

    it('should not fire any functions in if scope', () => {
        comp.loginForm.setValue({email: '', password: ''});
        comp.login();
        expect(comp.loadingCtrl.create).not.toHaveBeenCalled();
        expect(comp.userDataService.login).not.toHaveBeenCalled();
    })

    it('should fire functions in next scope of userDateService.login', () => {
        comp.loginForm.setValue({email: 'email', password: 'password'});
        userDataServiceInstance.login.and.returnValue(Observable.create(observer => {
            observer.next()
        }));
        comp.login();
        expect(comp.loadingCtrl.create).toHaveBeenCalled();
        expect(comp.userDataService.login).toHaveBeenCalled();
        const loadingMock = comp.loadingCtrl.create();
        expect(loadingMock.dismiss).toHaveBeenCalled()
    })

    it('should fire if error.reason is Incorrect password of userDateService.login', () => {
        comp.loginForm.setValue({email: 'email', password: 'password'});
        userDataServiceInstance.login.and.returnValue(Observable.create(observer => {
            observer.error({reason:'Incorrect password'})
        }));
        comp.login();
        expect(comp.loadingCtrl.create).toHaveBeenCalled();
        expect(comp.alertCtrl.create).toHaveBeenCalledWith({
            title: 'Login Error',
            message: 'Please check your email and password and try again!',
            buttons: ['Ok']
        });
    })

    it('should go to UserSignUpPersonalDataPage',()=>{
        comp.goToSignUpPage();
        expect(comp.navCtrl.push).toHaveBeenCalledWith(UserSignUpPersonalDataPage)
    })
})
