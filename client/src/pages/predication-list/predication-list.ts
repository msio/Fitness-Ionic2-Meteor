import {Component, NgZone, OnDestroy, OnInit, Renderer} from '@angular/core';
import {Events, NavController, Platform, ViewController} from 'ionic-angular';
import {isDefined, isUndefined} from "ionic-angular/util/util";
import {MapsAPILoader} from "angular2-google-maps/core";
import {GOOGLE_PLACES_INPUT_EVENT} from "../../constants/events";

declare let google;

@Component({
    selector: 'page-predication-list',
    templateUrl: 'predication-list.html',
})

export class PredicationList implements OnDestroy, OnInit {

    places;
    placeSub;
    placesService;
    autoCompleteService;
    isInit: boolean;
    noResults: boolean = false;

    constructor(public renderer: Renderer, public viewCtrl: ViewController, public mapsApiLoader: MapsAPILoader, public events: Events, public zone: NgZone, public platform: Platform, public navCtrl: NavController) {
        this.isInit = true;
        this.placeSub = this.events.subscribe(GOOGLE_PLACES_INPUT_EVENT, (input) => {
            this.getAutoCompleteResults(input);
        });
    }

    ngOnInit() {
        this.mapsApiLoader.load().then(() => {
            this.autoCompleteService = new google.maps.places.AutocompleteService();
        }, error => {
            //TODO it can happen if no internet connection
            console.log('mapsApiLoader: ', error);
        });
    }

    ngOnDestroy() {
        if (isDefined(this.placeSub)) {
            this.placeSub.unsubscribe();
        }
    }

    selectPlace(place) {
        this.viewCtrl.dismiss(place);
    }

    getAutoCompleteResults(input: string) {
        this.isInit = false;
        this.noResults = false;
        if (isDefined(this.autoCompleteService)) {
            // this.showNoResults = false;
            if (input !== '') {
                this.autoCompleteService.getPlacePredictions({
                    input: input,
                    componentRestrictions: {country: 'AT'}
                }, (result: Array<any>, status) => {
                    this.zone.run(() => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            this.places = result;
                        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                            this.noResults = true;
                        }
                    });
                });
            } else {
                this.places = [];
                this.isInit = true;
            }
        } else {
            // this.loadMapsApi();
        }
    }

    ngAfterContentInit() {
        const modal = document.querySelector('ion-modal');
        const height = this.platform.height();
        // height of top is addition of heights of two toolbars
        const fromTop = 56 + 56;
        this.renderer.setElementStyle(modal, 'top', fromTop + 'px');
        this.renderer.setElementStyle(modal, 'height', height - fromTop + 'px');

    }

}
