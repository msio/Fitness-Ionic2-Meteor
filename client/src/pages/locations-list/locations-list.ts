import {Component, Renderer} from '@angular/core';
import {NavParams, Platform, ViewController} from 'ionic-angular';

@Component({
    selector: 'page-locations-list',
    templateUrl: 'locations-list.html',
})
export class LocationsList {

    locations: Array<any>

    constructor(public platform: Platform, public renderer: Renderer, public viewCtrl: ViewController, public params: NavParams) {
        this.locations = params.get('locations');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    setLocation(location) {
        this.viewCtrl.dismiss(location);
    }

    ngAfterContentInit() {
        const modal = document.querySelector('ion-modal');
        const height = this.platform.height();
        this.renderer.setElementStyle(modal, 'top', height * 0.6 + 'px');
        this.renderer.setElementStyle(modal, 'height', height * 0.4 + 'px');
    }

}
