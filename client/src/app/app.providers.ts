import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {OneSignal} from "@ionic-native/onesignal";
import {Transfer} from "@ionic-native/transfer";
import {Camera} from "@ionic-native/camera";
import {Crop} from "@ionic-native/crop";
import {Keyboard} from "@ionic-native/keyboard";
import {Facebook} from "@ionic-native/facebook";
import {Geolocation, GeolocationOptions, Geoposition} from "@ionic-native/geolocation";
import {IonicErrorHandler} from "ionic-angular";
import {ErrorHandler, NgModule} from "@angular/core";
import {File} from "@ionic-native/file";
import {NativeGeocoder, NativeGeocoderReverseResult} from "@ionic-native/native-geocoder";

import {UserDataService} from "../providers/user-data-service";
import {PictureService} from "../providers/picture-service";
import {TabsService} from "../providers/tabs-service";
import {DataComponentSharing} from "../providers/data-component-sharing";
import {isDefined} from "ionic-angular/util/util";
import {UserPoolCollection} from "../providers/meteor-collections/meteor-collections";
import {UserPoolCollectionMock} from "../providers/meteor-collections/meteor-collections-mock";

export class NativeGeocoderMock extends NativeGeocoder {

    reverseGeocode(latitude: number, longitude: number): Promise<NativeGeocoderReverseResult> {
        return new Promise((resolve) => {
            resolve({
                street: 'TestStreet',
                houseNumber: '0',
                city: 'TestCity',
                postalCode: '0000',
                countryName: 'TestCountry',
                countryCode: 'TestCCode'
            });
        });
    }
}

function nativeGeocoderFactory() {
    if (!isDefined(window['cordova'])) {
        return new NativeGeocoderMock()
    }
    return new NativeGeocoder();
}

class GeolocationMock extends Geolocation {

    getCurrentPosition(options?: GeolocationOptions): Promise<Geoposition> {
        return new Promise((resolve) => {
            //vienna
            resolve({coords: {latitude: 48.2446705, longitude: 16.3602467}});
        });
    }
}

function geolocationFactory() {
    if (isDefined(window['cordova']) && !window['device'].isVirtual) {
        return new Geolocation();
    }
    return new GeolocationMock();
}


/*class MarkerMock extends Marker {
 addEventListener(eventName: string): Observable<any> {
 return Observable.create(observer => {
 observer.next();
 });
 }
 }

 class GoogleMapMock extends GoogleMap {

 constructor() {
 super('', '');
 }

 clear(): void {
 }

 remove(): void {
 }

 addMarker(options: MarkerOptions): Promise<Marker | any> {
 return Promise.resolve(MarkerMock);
 }

 setClickable(isClickable: boolean): void {
 }

 getCameraPosition(): Promise<any> {
 return Promise.resolve({zoom: 0});
 }

 setZoom(zoomLevel: number): void {
 }

 setCenter(latLng: LatLng): void {
 }

 animateCamera(animateCameraOptions: AnimateCameraOptions): Promise<any> {
 return Promise.resolve();
 }
 }

 export class GoogleMapsMock extends GoogleMaps {
 isAvailable(): Promise<boolean> {
 return Promise.resolve(true);
 }

 create(element: string | HTMLElement, options?: any): GoogleMap {
 return new GoogleMapMock();
 }
 }*/


@NgModule({
    providers: [{
        provide: ErrorHandler,
        useClass: IonicErrorHandler
    }, UserDataService, PictureService, DataComponentSharing, TabsService, StatusBar, SplashScreen, OneSignal, Transfer, Camera, Crop, File, Keyboard, Facebook, {
        provide: Geolocation,
        useFactory: geolocationFactory
    }, {
        provide: NativeGeocoder,
        useFactory: nativeGeocoderFactory
    }, {
        provide: UserPoolCollection,
        useClass: UserPoolCollection
    }]
})
export class ProvidersModule {
}
