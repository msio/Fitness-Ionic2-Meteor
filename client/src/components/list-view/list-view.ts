import {Component, Input} from '@angular/core';
import {NavController, NavParams} from "ionic-angular";
import {FoundUserDetailsPage} from "../../pages/found-user-details/found-user-details";
import {FOUND_USER_DETAILS_TYPE_ENUM} from "../../enums/enums";

@Component({
    selector: 'list-view',
    templateUrl: 'list-view.html'
})
export class ListViewComponent {

    @Input() userPool: Array<any> = [];

    @Input('isLoading') isContentLoading: boolean = false;

    @Input() isOneLocation: boolean = false;

    constructor(public navCtrl: NavController) {
    }

    goToFoundUserDetails(foundUser) {
        this.navCtrl.push(FoundUserDetailsPage, {foundUser: foundUser, type: FOUND_USER_DETAILS_TYPE_ENUM.POKE});
    }

}
