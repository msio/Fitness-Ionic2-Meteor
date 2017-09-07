import {Injectable, NgZone} from '@angular/core';
import {App, Events, Platform} from "ionic-angular";
import {DEVICE} from "../constants/platforms";
import {ApplicationUtil} from "../util/application-util";
import {Storage} from "@ionic/storage";
import {SubscriptionService} from "./subscription-service";
import {TAB} from "../constants/constants";
import {CHANGE_TAB_EVENT} from "../constants/events";
import {OneSignal, OSDisplayType} from "@ionic-native/onesignal";
import {NOTIFICATION_TYPE_ENUM} from "../enums/enums";

@Injectable()
export class PushNotificationService {

    constructor(private oneSignal: OneSignal,public events: Events, public zone: NgZone, public platform: Platform, public app: App, public storage: Storage, public subscriptionService: SubscriptionService) {
    }


    initOneSignal() {
        if (this.platform.is(DEVICE.CORDOVA)) {
            this.platform.ready().then(() => {
                this.oneSignal.startInit('a76d81a0-7e09-4a3b-b951-f04778f5336c', '');
                this.oneSignal.handleNotificationOpened().subscribe((notif: any) => {
                    switch (notif.notification.payload.additionalData.type) {
                        case NOTIFICATION_TYPE_ENUM.POKE:
                        case NOTIFICATION_TYPE_ENUM.MATCH:
                            ApplicationUtil.setTabIndex(TAB.MATCHES);
                            this.events.publish(CHANGE_TAB_EVENT, TAB.MATCHES);
                            break;
                        case NOTIFICATION_TYPE_ENUM.MSG:
                            ApplicationUtil.setTabIndex(TAB.CHATS);
                            this.events.publish(CHANGE_TAB_EVENT, TAB.CHATS, notif.notification.payload.additionalData.chatId);
                            break;
                    }
                });
                this.oneSignal.inFocusDisplaying(OSDisplayType.None);
                this.oneSignal.endInit();
                this.oneSignal.getIds().then((ids) => {
                    ApplicationUtil.setDeviceId(ids.userId);
                }, (error) => {
                    console.log(error);
                });
            });
        } else {
            //browser testing
            ApplicationUtil.setDeviceId('deviceId');
        }
    }
}
