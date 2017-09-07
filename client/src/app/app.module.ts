import {ErrorHandler, NgModule, Provider} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {ReactiveFormsModule} from "@angular/forms";
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {IonicStorageModule, Storage, StorageConfig} from '@ionic/storage';

import {WorkoutSelectorPage} from "../pages/workout-selector/workout-selector";
import {Main} from './app.component';
import {TabsPage} from '../pages/tabs/tabs';
import {InterestsPage} from "../pages/interests/interests";
import {CreateOrSearchPage} from "../pages/create-or-search/create-or-search";
import {FitnessPage} from "../pages/fitness/fitness";
import {ActivityStartPage} from "../pages/activity-start/activity-start";
import {MomentModule} from "angular2-moment";
import {TimeDurationPipe} from "../pipes/time-duration/time-duration";
import {StartActivityTitlePipe} from "../pipes/start-activity-title/start-activity-title";
import {ActivityStartFormatPipe} from "../pipes/actvity-start-format/activity-start-format";
import {PositionSelectorPage} from "../pages/position-selector/position-selector";
import {RadiusPipe} from "../pipes/radius/radius";
import {MembershipSelectorPage} from "../pages/membership-selector/membership-selector";
import {GenderSelectorPage} from "../pages/gender-selector/gender-selector";
import {ConstantTitlePipe} from "../pipes/constant-title/constant-title";
import {UserPoolPage} from "../pages/user-pool/user-pool";
import {ListViewComponent} from "../components/list-view/list-view";
import {FoundUserDetailsPage} from "../pages/found-user-details/found-user-details";
import {LocationDetails} from "../pages/location-details/location-details";
import {MatchesPage} from "../pages/matches/matches";
import {ChatsPage} from "../pages/chats/chats";
import {SettingsPage} from "../pages/settings/settings";
import {LoginTypePage} from "../pages/login-type/login-type";
import {UserSignUpPersonalDataPage} from "../pages/user-sign-up-personal-data/user-sign-up-personal-data";
import {UserSignUpOtherDataPage} from "../pages/user-sign-up-other-data/user-sign-up-other-data";
import {CropUserPicturePage} from "../pages/crop-user-picture/crop-user-picture";
import {TodayOrTomorrowPipe} from "../pipes/today-or-tomorrow/today-or-tomorrow";
import {UserProfilePicturePipe} from "../pipes/user-profile-picture/user-profile-picture";
import {MembershipDetailsPage} from "../pages/membership-details/membership-details";
import {SelectedMemLocComponent} from "../components/selected-mem-loc/selected-mem-loc";
import {AgmCoreModule} from "angular2-google-maps/core";
import {MySearchbar} from "../components/my-searchbar/my-searchbar";
import {MessagesPage} from "../pages/messages/messages";
import {UserDetailsPage} from "../pages/user-details/user-details";
import {AboutYouPage} from "../pages/about-you/about-you";
import {UserPicturesSliderComponent} from "../components/user-pictures-slider/user-pictures-slider";
import {MarkerInfo} from "../pages/marker-info/marker-info";
import {CustomIconsModule} from "ionic2-custom-icons";
import {IonicImageLoader} from "ionic-image-loader";
import {IconUrlPipe} from "../pipes/icon-url/icon-url";
import {UserDataService} from "../providers/user-data-service";
import {PictureService} from "../providers/picture-service";
import {DataComponentSharing} from "../providers/data-component-sharing";
import {TabsService} from "../providers/tabs-service";
import {isUndefined} from "ionic-angular/util/util";
import {Crop} from "@ionic-native/crop";
import {Camera} from "@ionic-native/camera";
import {Transfer} from "@ionic-native/transfer";
import {OneSignal} from "@ionic-native/onesignal";
import {SplashScreen} from "@ionic-native/splash-screen";
import {StatusBar} from "@ionic-native/status-bar";
import {Facebook} from "@ionic-native/facebook";
import {Keyboard} from "@ionic-native/keyboard";
import {NativeGeocoder} from "@ionic-native/native-geocoder";
import {Geolocation} from "@ionic-native/geolocation";
import {File} from "@ionic-native/file";
import {LocationsList} from "../pages/locations-list/locations-list";
import {ProvidersModule} from "./app.providers";
import {PredicationList} from "../pages/predication-list/predication-list";
import {ContentSpinnerComponent} from '../components/content-spinner/content-spinner';
import {LocationAddressPipe} from "../pipes/location-address/location-address";
import {PositionBarComponent} from '../components/position-bar/position-bar';

const driverOrder = ['sqlite', 'websql', 'indexeddb', 'localstorage'];

export function createStorage(name: string): any {
    const storageConfig: StorageConfig = {
        name: name,
        driverOrder: driverOrder
    }
    return new Storage(storageConfig);
}

@NgModule({
    declarations: [
        Main,
        TabsPage,
        InterestsPage,
        CreateOrSearchPage,
        FitnessPage,
        ActivityStartPage,
        TimeDurationPipe,
        StartActivityTitlePipe,
        ActivityStartPage,
        ActivityStartFormatPipe,
        PositionSelectorPage,
        RadiusPipe,
        MembershipSelectorPage,
        GenderSelectorPage,
        ConstantTitlePipe,
        UserPoolPage,
        ListViewComponent,
        FoundUserDetailsPage,
        LocationDetails,
        MatchesPage,
        ChatsPage,
        SettingsPage,
        LoginTypePage,
        UserSignUpPersonalDataPage,
        UserSignUpOtherDataPage,
        CropUserPicturePage,
        TodayOrTomorrowPipe,
        UserProfilePicturePipe,
        MembershipDetailsPage,
        SelectedMemLocComponent,
        MySearchbar,
        MessagesPage,
        UserDetailsPage,
        AboutYouPage,
        UserPicturesSliderComponent,
        WorkoutSelectorPage,
        MarkerInfo,
        IconUrlPipe,
        LocationsList,
        PredicationList,
        ContentSpinnerComponent,
        LocationAddressPipe,
        PositionBarComponent
    ],
    imports: [
        ProvidersModule,
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(Main, {scrollAssist: false, autoFocusAssist: false}, {
            links: []
        }),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyA8srazDFepuJtXYsDKIrvKvmgIFNRnkZA',
            libraries: ["places"]
        }),
        IonicStorageModule.forRoot({
            name: '_ionicstorage',
            driverOrder: driverOrder
        }),
        MomentModule,
        ReactiveFormsModule,
        CustomIconsModule,
        IonicImageLoader.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        Main,
        TabsPage,
        InterestsPage,
        CreateOrSearchPage,
        FitnessPage,
        ActivityStartPage,
        PositionSelectorPage,
        MembershipSelectorPage,
        GenderSelectorPage,
        UserPoolPage,
        FoundUserDetailsPage,
        LocationDetails,
        MatchesPage,
        ChatsPage,
        SettingsPage,
        LoginTypePage,
        UserSignUpPersonalDataPage,
        UserSignUpOtherDataPage,
        CropUserPicturePage,
        MembershipDetailsPage,
        MessagesPage,
        UserDetailsPage,
        AboutYouPage,
        WorkoutSelectorPage,
        MarkerInfo,
        LocationsList,
        PredicationList
    ]
})
export class AppModule {
}
