import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import {NavController, Platform, NavParams, ViewController, Events} from 'ionic-angular';
import {VIEW_TYPE_ENUM} from "../../enums/enums";
import {UserPoolService} from "../../providers/user-pool-service";
import {Subscription} from "rxjs";
import {REMOVED_USERS_POOL_ENTRY_EVENT} from "../../constants/events";
import {PUBLICATION} from "../../constants/api-points";
import {UserPoolCollection} from "../../providers/meteor-collections/meteor-collections";

declare let _;

@Component({
    selector: 'page-user-pool',
    templateUrl: 'user-pool.html',
    providers: [UserPoolService]
})
export class UserPoolPage implements OnInit, OnDestroy {

    VIEW_TYPE_ENUM = VIEW_TYPE_ENUM;
    viewType: VIEW_TYPE_ENUM;
    map;
    userPool: Array<any>;
    userSearchParams;
    usersSubs: Subscription;
    isUserPoolLoading: boolean = false;
    isOneLocation: boolean = false;
    oneLocation;

    constructor(private navParams: NavParams, public zone: NgZone, public events: Events, public platform: Platform, public viewCtrl: ViewController, public navCtrl: NavController, public userPoolCollection: UserPoolCollection) {
        this.viewType = VIEW_TYPE_ENUM.LIST_VIEW;
        this.userSearchParams = navParams.get('userSearchParams');
        this.oneLocation = navParams.get('oneLocation');
        this.isOneLocation = this.userSearchParams.membership.length === 1;
        this.userPool = [];
    }

    ngOnInit() {
        this.isUserPoolLoading = true;
        this.usersSubs = this.userPoolCollection.subscribe(PUBLICATION.FIND.USERS, this.userSearchParams).subscribe(() => {
            this.isUserPoolLoading = false;
            this.userPoolCollection.get().find().observe({
                added: (doc) => {
                    this.zone.run(() => {
                        this.userPool.push(doc);
                    });
                },
                removed: (doc) => {
                    this.events.publish(REMOVED_USERS_POOL_ENTRY_EVENT, doc);
                    this.zone.run(() => {
                        const index = this.userPool.findIndex(entry => entry._id === doc._id);
                        this.userPool.splice(index, 1);
                    });
                }, changed: (doc) => {
                    //if already matched by another user or matched by me => remove entry
                    console.log('Changed', doc);
                }
            });
        });
    }


    ngOnDestroy() {
        if (this.usersSubs) {
            this.usersSubs.unsubscribe();
        }
    }
}
