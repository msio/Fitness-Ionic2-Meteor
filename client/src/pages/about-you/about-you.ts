import {Component, OnInit, OnDestroy, NgZone, ViewChild,} from '@angular/core';
import {NavController, NavParams, LoadingController, Platform} from 'ionic-angular';
import {MeteorObservable} from "meteor-rxjs";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {isDefined} from "ionic-angular/util/util";
import {Keyboard} from "@ionic-native/keyboard";
import {METHOD} from "../../constants/api-points";

@Component({
    selector: 'page-about-you',
    templateUrl: 'about-you.html'
})
export class AboutYouPage implements OnInit, OnDestroy {

    @ViewChild('textArea') textAreaElemRef;

    about: string;
    oldAbout: string;
    keyboardSub;
    hideDoneButton: boolean = true;
    changed: boolean = false;

    constructor(private keyboard: Keyboard, public zone: NgZone, public platform: Platform, public navCtrl: NavController, public params: NavParams, public loadingCtrl: LoadingController) {
        this.about = params.get('about');
        this.oldAbout = this.about;
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.keyboardSub = this.keyboard.onKeyboardShow().subscribe(() => {
                this.zone.run(() => {
                    this.onFocus();
                });
            });
        });
    }

    ngOnDestroy() {
        if (isDefined(this.keyboardSub)) {
            this.keyboardSub.unsubscribe;
        }
    }

    done() {
        if (this.oldAbout !== this.about) {
            let loading = this.loadingCtrl.create({
                content: 'Updating...'
            });
            loading.present();
            MeteorObservable.call(METHOD.CHANGE_ABOUT_USER, {content: this.about}).subscribe(() => {
                this.hideDoneButton = true;
                loading.dismiss();
                this.changed = true;
            }, (error) => {
                this.changed = false;
                loading.dismiss();
                this.about = this.oldAbout;
                //TODO cant update about
            });
        }
    }

    onFocus() {
        this.hideDoneButton = false;
        this.oldAbout = this.about;
    }

    ionViewDidEnter() {
        setTimeout(() => {
            this.textAreaElemRef.setFocus();
            this.keyboard.show();
        });
    }


    ionViewCanLeave(): boolean {
        this.params.get('resolve')(this.changed ? this.about : this.oldAbout);
        return true;
    }


}
