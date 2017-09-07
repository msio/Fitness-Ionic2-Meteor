import {Component, NgZone} from '@angular/core';
import {NavController, NavParams, AlertController, ViewController, Platform} from 'ionic-angular';
import {MeteorObservable} from "meteor-rxjs";
import {isDefined} from "ionic-angular/util/util";
import {Membership, Location} from "../../models/models";
import {METHOD} from "../../constants/api-points";
import {PositionSelectorPage} from "../position-selector/position-selector";
import {Geolocation} from "@ionic-native/geolocation";
import {Storage} from "@ionic/storage";
import {
    CURRENT_POSITION_TIMEOUT,
    MEMBERSHIP_DETAILS_CURRENT_LOCATION_PERMISSION_STATE, PIPE_DISTANCE_FORMAT, POSITION_BAR_TIMEOUT_HIDE
} from "../../constants/constants";
import {ViewInterface} from "../view-interface/view-interface";
import {noUndefined} from "@angular/compiler/src/util";
import {NativeGeocoder, NativeGeocoderReverseResult} from "@ionic-native/native-geocoder";
import {GeoUtil} from "../../util/geoUtil";
import {CURRENT_POSITION_DESCRIPTION} from "../../constants/translate-constants";
import {Observable} from "rxjs/Observable";

declare let _;

@Component({
    selector: 'page-membership-details',
    templateUrl: 'membership-details.html',
    providers: [ViewInterface]
})
export class MembershipDetailsPage {

    PIPE_DISTANCE_FORMAT = PIPE_DISTANCE_FORMAT;

    isContentLoading: boolean = false;

    membership: Membership;
    locations: Array<Location> = [];
    goingToNextPage: boolean = false;
    position: { lat: number, lng: number, timestamp?: number };
    positionDescription: string;
    positionAllowed: boolean = false;
    numOfChecked: number = 0;
    isLoadingPosition: boolean = false;
    hidePositionBar: boolean = false;
    currentPositionMode:boolean = true;


    constructor(public params: NavParams,public zone: NgZone, public nativeGeocoder: NativeGeocoder, public viewInterface: ViewInterface, public platform: Platform, public storage: Storage, public geolocation: Geolocation, public navCtrl: NavController, public viewCtrl: ViewController, public alertCtrl: AlertController) {
        this.membership = params.get('membership');
    }

    loadLocations() {
        this.isContentLoading = true;
        MeteorObservable.call(METHOD.FIND_LOCATIONS, {
            membershipId: this.membership._id,
            position: this.position
        }).subscribe((locs: Array<Location>) => {
            this.locations = this.groupLocations(locs, this.params.get('selectedLocations'));
            this.isContentLoading = false;
        }, error => {
            console.log(error);
        });
    }

    groupLocations(locations: Array<any>, selectedLocations: Array<any>): Array<any> {
        const group = _.groupBy(locations, (attr) => attr.address.city);
        return Object.keys(group).map((key) => {
            group[key] = group[key].map((loc) => {
                loc.selected = isDefined(selectedLocations.find(val => val._id === loc._id));
                return loc;
            });
            return {city: key, locations: group[key]};
        });
    }

    findGymMembershipNextToYou() {
        this.goingToNextPage = true;
        new Promise((resolve) => {
            this.navCtrl.push(PositionSelectorPage, {resolve: resolve, membershipId: this.membership._id});
        }).then((data: any) => {
            if (isDefined(data)) {
                this.params.get('resolve')(data);
            }
        });
    }

    check(location, group) {
        if (location.selected) {
            this.numOfChecked++
        } else {
            if (this.numOfChecked > 0) {
                this.numOfChecked--;
            }
        }
        if (!this.positionAllowed && this.numOfChecked > 1) {
            this.showAllowCurrentLocationAlert();
            setTimeout(() => {
                for (let loc of group) {
                    if (loc._id === location._id) {
                        loc.selected = false;
                        break;
                    }
                }
            });
        }
    }

    takeSelectedLocations(locations: Array<any>) {
        let selected = [];
        locations.forEach((group: any) => {
            group.locations.forEach((loc) => {
                if (loc.selected) {
                    selected.push(loc);
                }
            });
        });
        return selected;
    }

    ionViewCanLeave() {
        if (!this.goingToNextPage) {
            const selected = this.takeSelectedLocations(this.locations);
            const position = selected.length > 1 ? this.position : undefined;
            this.params.get('resolveMembershipSel')({selected: selected, position: position});
        }
        return true;
    }

    showAllowCurrentLocationAlert() {
        let alert = this.alertCtrl.create({
            title: 'Allow Current Location',
            message: 'To select more than one locations,current location is used and you see distance to all locations ',
            buttons: [
                {
                    text: 'Disallow',
                    handler: () => {
                        this.position = undefined;
                        this.positionAllowed = false;
                        this.storage.set(MEMBERSHIP_DETAILS_CURRENT_LOCATION_PERMISSION_STATE, this.positionAllowed).then(() => {
                            if (this.locations.length === 0) {
                                this.loadLocations();
                            }
                        });
                    }
                },
                {
                    text: 'Allow',
                    handler: () => {
                        this.positionAllowed = true;
                        this.isContentLoading = true;
                        this.locations = [];
                        this.storage.set(MEMBERSHIP_DETAILS_CURRENT_LOCATION_PERMISSION_STATE, this.positionAllowed).then(() => {
                            this.getCurrentPosition();
                        });
                    }
                }
            ],
            enableBackdropDismiss: false
        });
        alert.onDidDismiss(() => {
        });
        alert.present();
    }

    ionViewDidEnter() {
        this.storage.get(MEMBERSHIP_DETAILS_CURRENT_LOCATION_PERMISSION_STATE).then((allowed) => {
            this.positionAllowed = allowed == null || !allowed ? false : true;
            if (allowed === null) {
                this.showAllowCurrentLocationAlert();
            } else if (allowed) {
                this.getCurrentPosition();
            } else {
                this.loadLocations();
            }
        });
    }

    //TODO show current position address
    getCurrentPosition() {
        this.hidePositionBar = false;
        this.isLoadingPosition = true;
        this.geolocation.getCurrentPosition({
            timeout: CURRENT_POSITION_TIMEOUT,
            enableHighAccuracy: true
        }).then((resp) => {
            this.position = {
                lat: resp.coords.latitude,
                lng: resp.coords.longitude
            }
            this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude).then((result: NativeGeocoderReverseResult) => {
                this.positionDescription = GeoUtil.concatGeocodeResult(result);
                this.isLoadingPosition = false;
                Observable.timer(POSITION_BAR_TIMEOUT_HIDE).subscribe(() => {
                    this.zone.run(() => {
                        this.hidePositionBar = true;
                    });
                });
                this.loadLocations();
            }, (error) => {
                this.loadLocations();
                this.positionDescription = CURRENT_POSITION_DESCRIPTION;
                this.isLoadingPosition = false;
                console.log(error);
            });
        }, (error) => {
            this.isLoadingPosition = false;
            console.log(error);
            let alert = this.viewInterface.currentLocationErrorAlert();
            alert.onDidDismiss(() => {
                // although current position failed, locations will be loaded but without distances
                this.loadLocations();
            });
            alert.present();
        });
    }

    ngAfterViewInit() {
        this.viewCtrl.setBackButtonText('Memberships');
    }

}
