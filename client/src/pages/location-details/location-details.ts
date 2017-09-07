import {Component, NgZone, OnDestroy, Renderer, ViewChild} from '@angular/core';
import {Content, Events, NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import {LOCATION_DETAILS_EVENT} from "../../constants/events";
import {isDefined} from "ionic-angular/util/util";


@Component({
    selector: 'location-details',
    templateUrl: 'location-details.html'
})
export class LocationDetails implements OnDestroy {

    location;
    locationDetailsSub;
    @ViewChild(Content) content: Content;

    constructor(public platform: Platform, public zone: NgZone, public events: Events, public renderer: Renderer, public navCtrl: NavController, public viewCtrl: ViewController, public params: NavParams) {
        this.location = params.get('location');
        this.locationDetailsSub = this.events.subscribe(LOCATION_DETAILS_EVENT, (location) => {
            this.zone.run(() => {
                this.location = location;
            });
        });
    }

    ngOnDestroy() {
        if (isDefined(this.locationDetailsSub)) {
            this.locationDetailsSub.unsubscribe();
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    selectLocation(location) {
        this.viewCtrl.dismiss(location);
    }

    ngAfterContentInit() {
        const modal = document.querySelector('ion-modal');
        const height = this.platform.height();
        // height - (height of content + height of footer)
        const modalHeight = 105 + 56;
        this.renderer.setElementStyle(modal, 'top', height - modalHeight + 'px');
        //height of content + height of footer
        this.renderer.setElementStyle(modal, 'height', modalHeight + 'px');

    }
}
