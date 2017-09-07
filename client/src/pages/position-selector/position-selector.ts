import {Component, ViewChild, ElementRef, OnInit, NgZone, OnDestroy, Renderer} from '@angular/core';
import {
    Platform, AlertController, NavParams, Events, NavController, ViewController, ModalController, Modal, Content, Alert
} from 'ionic-angular';
import {MapsAPILoader} from "angular2-google-maps/core";
import {isDefined, isUndefined} from "ionic-angular/util/util";
import {Keyboard} from "@ionic-native/keyboard";
import {TabsService} from "../../providers/tabs-service";
import {NativeGeocoder, NativeGeocoderReverseResult} from "@ionic-native/native-geocoder";
import {GeoUtil} from "../../util/geoUtil";
import {Geolocation} from "@ionic-native/geolocation";
import {MeteorObservable} from "meteor-rxjs";
import {ImageLoader} from "ionic-image-loader";
import {ImageUtil} from "../../util/image-util";
import {METHOD} from "../../constants/api-points";
import {CURRENT_POSITION_TIMEOUT, MAX_LOCATION_RADIUS, POSITION_BAR_TIMEOUT_HIDE} from "../../constants/constants";
import {LocationsList} from "../locations-list/locations-list";
import {LocationDetails} from "../location-details/location-details";
import {GOOGLE_PLACES_INPUT_EVENT, LOCATION_DETAILS_EVENT} from "../../constants/events";
import {Observable} from "rxjs/Observable";
import {PredicationList} from "../predication-list/predication-list";
import {MembershipParam} from "../../models/user-search-params";
import {ViewInterface} from "../view-interface/view-interface";

declare let google, plugin, _;

@Component({
    selector: 'page-position-selector',
    templateUrl: 'position-selector.html',
    providers: [ViewInterface]
})
export class PositionSelectorPage implements OnInit, OnDestroy {

    POSITION_ERROR = {
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
    }

    MAX_LOCATION_RADIUS = MAX_LOCATION_RADIUS;
    isUndefined = isUndefined;
    isDefined = isDefined;
    DEFAULT_MAP_ICON = 'assets/default-map-icon.png';
    CURRENT_POSITION_ICON = 'assets/android-current-icon.png';

    @ViewChild('map') mapElemRef: ElementRef;
    @ViewChild('inputSearchbar') searchbarElemRef: ElementRef;
    @ViewChild(Content) content: Content;
    mapViewHeight: string;
    input: string = '';
    radius: number;
    map;
    locations: Array<any>;
    placesService;
    selectedPosition: { position: { lat: number, lng: number, timestamp?: number }, description: string };
    selectedLocation: any;
    defaultMapZoom: number = 17;
    isLoadingSelectedPosition: boolean = true;
    hidePositionBar: boolean = false;
    areLoadingLocations: boolean = false;
    locationsModal: Modal;
    selLocationModal: Modal;
    predicationListModal: Modal;
    markers: Array<any>;
    selectedMarker;
    lastSelectedMarker: { marker: any, lastIcon: any };
    areLoadingMarkers: boolean = false;
    hideFooter: boolean = false;
    currentPositionMode: boolean = true;
    currentPositionAlert: Alert;
    isLeavingPage: boolean = false;
    membershipId: string;


    constructor(private keyboard: Keyboard, public viewInterface: ViewInterface, private geolocation: Geolocation, private nativeGeocoder: NativeGeocoder, public imageLoader: ImageLoader, public modalCtrl: ModalController, public params: NavParams, public events: Events, public platform: Platform, public alertCtrl: AlertController, public navCtrl: NavController, public viewCtrl: ViewController, public mapsApiLoader: MapsAPILoader, public zone: NgZone, public tabsService: TabsService) {
        this.markers = [];
        this.membershipId = params.get('membershipId');

    }


    _openLocationDetails(location, selectedIcon) {
        this.selLocationModal = this.modalCtrl.create(LocationDetails, {location: location}, {enableBackdropDismiss: false});
        this.selLocationModal.onDidDismiss((data) => {
            this.selLocationModal = this.lastSelectedMarker = undefined;
            if (isDefined(data)) {
                this.selectedLocation = data;
                //go to FitnessPage directly
                this.navCtrl.popToRoot();
            } else {
                if (isDefined(this.selectedMarker)) {
                    this.selectedMarker.setZIndex(1);
                    this.selectedMarker.setIcon(selectedIcon);
                }
            }
        });
        this.selLocationModal.present();
    }

    openLocationsList() {
        this.locationsModal = this.modalCtrl.create(LocationsList, {locations: this.locations});
        this.locationsModal.onDidDismiss((location) => {
            if (isDefined(location)) {
                this.selectedMarker = this.markers.find((marker) => {
                    return marker.get('location')._id === location._id;
                });
                const selectedIcon = this.selectedMarker.get('icon');
                this.selectedMarker.setZIndex(2);
                this.selectedMarker.setIcon({
                    url: this.DEFAULT_MAP_ICON
                });
                this.map.moveCamera({
                    target: new plugin.google.maps.LatLng(location.geometry.coordinates[1], location.geometry.coordinates[0]),
                    zoom: this.defaultMapZoom
                }, () => {
                    this._openLocationDetails(location, selectedIcon);
                });
                this.lastSelectedMarker = {marker: this.selectedMarker, lastIcon: selectedIcon};
            }
        });
        this.locationsModal.present();
    }

    _findNearestLocations(isWithoutRadius: boolean) {
        this.areLoadingLocations = true;
        let params = {
            position: {
                lat: this.selectedPosition.position.lat,
                lng: this.selectedPosition.position.lng,
                radius: isWithoutRadius ? undefined : this.radius
            },
            membershipId: this.membershipId
        }
        MeteorObservable.call(METHOD.FIND_NEAREST_LOCATIONS, params).subscribe((memLoc: any) => {
            if (memLoc.locations.length === 0) {
                this.locations = [];
                const subTitle = isUndefined(this.radius) ? 'Search for your Gym!' : 'Try to change radius!';
                this.radius = isUndefined(this.radius) ? MAX_LOCATION_RADIUS : this.radius;
                let alert = this.alertCtrl.create({
                    title: 'No Gym found',
                    subTitle: subTitle,
                    buttons: ['Ok']
                });
                alert.present();
            } else {
                this.zone.run(() => {
                    this.radius = isUndefined(this.radius) ? Math.ceil(memLoc.locations[0].locDistance) : this.radius;
                });

                this.locations = memLoc.locations.map((loc) => {
                    loc.membership = memLoc.memberships.find(m => m._id === loc.membershipId);
                    return loc;
                });
            }
            this.areLoadingLocations = false;
            this._createBoundOfPositionAndNearestLocation();
        }, (error) => {
            console.log(error);
        });
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.keyboard.onKeyboardHide().subscribe(() => {
                this.hideFooter = false;
                if (isDefined(this.mapElemRef)) {
                    this.mapElemRef.nativeElement.style.height = this.mapViewHeight;
                }
            });
            this.keyboard.onKeyboardShow().subscribe(() => {
                if (isDefined(this.mapElemRef)) {
                    this.mapElemRef.nativeElement.style.height = this.mapViewHeight;
                }
            });
        });
    }

    ngOnDestroy() {
        if (isDefined(this.map)) {
            this.map.remove();
        }
    }

    _createBoundOfPositionAndNearestLocation() {
        this.map.clear();
        //clear markers if new locations are loaded
        this.markers = [];
        this.lastSelectedMarker = undefined;
        this.areLoadingMarkers = true;
        let bounds = [];
        const myPosition = new plugin.google.maps.LatLng(this.selectedPosition.position.lat, this.selectedPosition.position.lng);
        if (this.locations.length === 0) {
            this.map.addMarker({
                position: myPosition,
                icon: {
                    url: this.CURRENT_POSITION_ICON
                }
            }, () => {
                this.map.moveCamera({
                    target: myPosition,
                    zoom: this.defaultMapZoom,
                });
                this.areLoadingMarkers = false;
            });
        } else {
            for (let l of this.locations) {
                bounds.push(new plugin.google.maps.LatLng(l.geometry.coordinates[1], l.geometry.coordinates[0]));
            }
            let latLngBounds = new plugin.google.maps.LatLngBounds(bounds);
            latLngBounds.extend(myPosition);
            this.map.animateCamera({
                target: latLngBounds,
                duration: 500
            }, () => {
                this.map.setCameraZoom(this.map.getCameraZoom() - 1);
                this.map.setCameraTarget(myPosition);
                this.map.addMarker({
                    position: myPosition,
                    icon: {
                        url: this.CURRENT_POSITION_ICON
                    },
                    zIndex: 3
                });
                for (let location of this.locations) {
                    this.imageLoader.getImagePath(ImageUtil.getIconUrl(location.membership.icon)).then((url) => {
                        this.map.addMarker({
                            position: new plugin.google.maps.LatLng(location.geometry.coordinates[1], location.geometry.coordinates[0]),
                            icon: {
                                url: url,
                                size: {
                                    height: 35,
                                    width: 35
                                }
                            },
                            location: location,
                            zIndex: 1
                        }, (marker) => {
                            this.markers.push(marker);
                            if (this.markers.length === this.locations.length) {
                                this.areLoadingMarkers = false;
                                /*if (isUndefined(this.predicationListModal)) {
                                 this.openLocationsList();
                                 }*/
                            }
                            marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, () => {
                                this.selectedMarker = marker;
                                if (isUndefined(this.lastSelectedMarker) || (isDefined(this.lastSelectedMarker) && this.lastSelectedMarker.marker.get('location')._id !== this.selectedMarker.get('location')._id)) {
                                    if (isDefined(this.lastSelectedMarker)) {
                                        this.lastSelectedMarker.marker.setZIndex(1);
                                        this.lastSelectedMarker.marker.setIcon(this.lastSelectedMarker.lastIcon);
                                    }
                                    const selectedIcon = marker.get('icon');
                                    marker.setZIndex(2);
                                    marker.setIcon({
                                        url: this.DEFAULT_MAP_ICON
                                    });
                                    if (isUndefined(this.selLocationModal)) {
                                        this._openLocationDetails(this.selectedMarker.get('location'), selectedIcon);
                                    } else {
                                        this.events.publish(LOCATION_DETAILS_EVENT, this.selectedMarker.get('location'));
                                    }
                                    this.lastSelectedMarker = {
                                        marker: marker,
                                        lastIcon: selectedIcon
                                    };
                                }
                            });
                        });
                    });
                }
            });
        }
    }

    onCancel() {
        if (isDefined(this.predicationListModal)) {
            this.predicationListModal.dismiss();
            this.predicationListModal = undefined;
            this.hideFooter = false;
        }
    }

    _openPredicationList() {
        this.predicationListModal = this.modalCtrl.create(PredicationList);
        this.predicationListModal.onDidDismiss((data) => {
            if (isDefined(data)) {
                if (isUndefined(this.placesService)) {
                    this.placesService = new google.maps.places.PlacesService(document.getElementById('map'));
                }
                this.placesService.getDetails({placeId: data.place_id}, (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        /*this.zone.run(() => {
                         this.selectedPosition = {
                         position: {
                         lat: result.geometry.location.lat(),
                         lng: result.geometry.location.lng()
                         },
                         //TODO is there any difference between place.description vs. result.formated..
                         description: place.description,
                         isCurrentPosition: false
                         }
                         this.isLoadingSelectedPosition = false;
                         });*/
                        /*if (this.platform.is(DEVICE.CORDOVA)) {
                         //TODO createLocation marker
                         //this.createPositionMarker();
                         }*/
                    }
                });
            }
        });
        this.predicationListModal.present();
    }

    onFocus() {
        this.hideFooter = true;
        let promise;
        if (isDefined(this.selLocationModal)) {
            promise = this.selLocationModal.dismiss({}, '', {animate: false, duration: 0});
        }
        if (isDefined(this.locationsModal)) {
            promise = this.locationsModal.dismiss({}, '', {animate: false, duration: 0});
        }
        if (isUndefined(this.predicationListModal)) {
            if (isDefined(promise)) {
                promise.then(() => {
                    this._openPredicationList();
                });
            } else {
                this._openPredicationList();
            }
        }
    }

    onInput() {
        this.events.publish(GOOGLE_PLACES_INPUT_EVENT, this.input);
    }

    onChangeRadius() {
        this._findNearestLocations(false);
    }

    _dismissModalOrAlert(modal: Modal | Alert): Promise<any> {
        return modal.dismiss({}, '', {animate: false, duration: 0});
    }


    //TODO perhaps destroy map but don't if it should load native again in user pool page
    getCurrentPosition(isInit: boolean) {
        this.hidePositionBar = false;
        if (isDefined(this.selLocationModal)) {
            this._dismissModalOrAlert(this.selLocationModal);
        }
        if (isDefined(this.locationsModal)) {
            this._dismissModalOrAlert(this.locationsModal);
        }
        this.input = '';
        this.isLoadingSelectedPosition = true;
        this.currentPositionMode = true;
        this.geolocation.getCurrentPosition({
            timeout: CURRENT_POSITION_TIMEOUT,
            enableHighAccuracy: true
        }).then((resp) => {
            this.selectedPosition = {
                position: {
                    lat: resp.coords.latitude,
                    lng: resp.coords.longitude
                },
                description: ''
            }
            this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude).then((result: NativeGeocoderReverseResult) => {
                this.selectedPosition.description = GeoUtil.concatGeocodeResult(result);
                this.isLoadingSelectedPosition = false;
                Observable.timer(POSITION_BAR_TIMEOUT_HIDE).subscribe(() => {
                    this.zone.run(() => {
                        this.hidePositionBar = true;
                    });
                });
                this._findNearestLocations(isInit);
            }, (error) => {
                //TODO translate that
                this._findNearestLocations(isInit);
                this.selectedPosition.description = 'Current Position';
                this.isLoadingSelectedPosition = false;
                console.log(error);
            });
        }, (error) => {
            this.hidePositionBar = true;
            console.log(error);
            if (isUndefined(this.currentPositionAlert) && !this.isLeavingPage) {
                this.currentPositionAlert = this.viewInterface.currentLocationErrorAlert();
                this.currentPositionAlert.onDidDismiss(() => {
                    this.currentPositionAlert = undefined;
                });
                this.currentPositionAlert.present();
            }
        });
    }


    _removeHTMLElement(htmlElem: string) {
        let elem: any = document.getElementsByClassName(htmlElem);
        if (elem.length !== 0) {
            elem = elem[0];
            elem.parentNode.removeChild(elem);
        }
    }

    _initMap() {
        let options: any = {
            backgroundColor: 'white',
            controls: {
                compass: true,
                indoorPicker: true,
                zoom: true,
                mapToolbar: false
            },
            gestures: {
                scroll: true,
                tilt: false,
                rotate: true,
                zoom: true
            }
        }

        this.map = plugin.google.maps.Map.getMap(document.getElementById('map'), options);
        this.map.one(plugin.google.maps.event.MAP_READY, () => {
            this.getCurrentPosition(true);
        });

        //workaround to prevent black map on init
        //ionic
        this._removeHTMLElement('click-block');
        this._removeHTMLElement('loading-portal');
        this._removeHTMLElement('toast-portal');

        this.mapViewHeight = (this.mapElemRef.nativeElement.clientHeight) + 'px';
    }


    ionViewCanLeave(): Promise<any> {
        return new Promise((resolve) => {
            this.isLeavingPage = true;
            let promise;
            if (isDefined(this.locationsModal)) {
                promise = this._dismissModalOrAlert(this.locationsModal);
            }
            if (isDefined(this.selLocationModal)) {
                promise = this._dismissModalOrAlert(this.selLocationModal);
            }
            if (isDefined(this.predicationListModal)) {
                promise = this._dismissModalOrAlert(this.predicationListModal);
            }
            if (isDefined(this.currentPositionAlert)) {
                promise = this._dismissModalOrAlert(this.currentPositionAlert);
            }
            if (isDefined(this.selectedLocation)) {
                const selected: MembershipParam = {
                    locations: [_.pick(this.selectedLocation, 'address', '_id')],
                    membership: _.omit(this.selectedLocation.membership, 'id')
                };
                this.params.get('resolve')({selected: selected});
            } else {
                this.params.get('resolve')(undefined);
            }
            if (isDefined(promise)) {
                promise.then(() => {
                    resolve();
                });

            } else {
                resolve();
            }
        });
    }

    ionViewWillEnter() {
        this.tabsService.hide();

    }

    ionViewWillLeave() {
        this.tabsService.show();
    }


    ionViewDidEnter() {
        //decrease map height because of footer
        this.mapElemRef.nativeElement.style.height = 'calc(100% - 66px)';
        this._initMap();
    }

    ngAfterViewInit() {
        this.viewCtrl.setBackButtonText('Memberships');
    }


}
