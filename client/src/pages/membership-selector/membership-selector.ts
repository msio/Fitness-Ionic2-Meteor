import {Component, OnInit} from '@angular/core';
import {NavController, ViewController, NavParams, ModalController} from 'ionic-angular';

import {MeteorObservable} from "meteor-rxjs";
import {Storage} from "@ionic/storage";
import {MembershipDetailsPage} from "../membership-details/membership-details";
import {isDefined} from "ionic-angular/util/util";
import {SelectorBase} from "../fitness/selector-base";
import {PositionSelectorPage} from "../position-selector/position-selector";
import {METHOD} from "../../constants/api-points";

declare let _;

@Component({
    selector: 'page-membership-selector',
    templateUrl: 'membership-selector.html'
})
//TODO cache images, consider it if you are at implementing  backend connection
export class MembershipSelectorPage extends SelectorBase implements OnInit {

    isContentLoading: boolean = false;
    memberships: Array<any> = [];
    selectedLocations: Array<any> = [];
    selectedMembership: any;
    goingToNextPage: boolean = false;
    //position is set in member details if more locations will be selected
    position;

    constructor(public params: NavParams, public modalCtrl: ModalController, public viewCtrl: ViewController, public storage: Storage, public navCtrl: NavController) {
        super(viewCtrl);
    }

    setSelectedMemberships() {
        if (isDefined(this.params.get('membership'))) {
            this.selectedMembership = this.params.get('membership').membership;
            this.selectedLocations = this.params.get('membership').locations;
            this.selectMembership(this.selectedMembership);
        }
    }

    ngOnInit() {
        this.isContentLoading = true;
        MeteorObservable.call(METHOD.LIST_MEMBERSHIPS).subscribe((res: Array<any>) => {
            this.memberships = res;
            this.setSelectedMemberships();
            this.isContentLoading = false;
        }, (error) => {
            console.log(error);
        });
    }


    goToMembershipDetails(membership) {
        this.goingToNextPage = true;
        new Promise((resolve) => {
            this.navCtrl.push(MembershipDetailsPage, {
                resolveMembershipSel: resolve,
                resolve: this.params.get('resolve'),
                membership: membership,
                selectedLocations: this.selectedLocations
            });
        }).then((data: any) => {
            this.goingToNextPage = false;
            this.selectedLocations = data.selected;
            this.position = data.position;
            this.selectMembership(data.length === 0 ? undefined : membership);
        });
    }

    findGymNextToYou() {
        this.goingToNextPage = true;
        new Promise((resolve) => {
            this.navCtrl.push(PositionSelectorPage, {resolve: resolve});
        }).then((data: any) => {
            if (isDefined(data)) {
                this.params.get('resolve')(data);
            }
        });
    }

    ionViewCanLeave() {
        if (!this.goingToNextPage) {
            if (this.selectedLocations.length === 0) {
                this.params.get('resolve')(undefined);
            } else {
                const selected = {
                    locations: this.selectedLocations,
                    membership: this.selectedMembership
                }
                this.params.get('resolve')({selected: selected, position: this.position});
            }
        }
        return true;
    }

    selectMembership(membership) {
        this.selectedMembership = membership;
        this.memberships = this.memberships.map((mem: any) => {
            mem.selected = isDefined(membership) && membership._id === mem._id;
            return mem;
        });
    }
}
