import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {NavController, NavParams, Platform, Content, Events} from 'ionic-angular';
import {MeteorObservable} from "meteor-rxjs";
import * as moment from 'moment';

import {DEVICE} from "../../constants/platforms";
import {Message} from "../../models/models";
import {APP_DATE_TIME_FORMAT} from "../../constants/date-time-formats";
import {isDefined} from "ionic-angular/es2015/util/util";
import {TabsService} from "../../providers/tabs-service";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {DataComponentSharing} from "../../providers/data-component-sharing";
import {CHAT_TAB_BADGE_INC_EVENT, MESSAGE_PAGE_ACTIVE_EVENT, NEW_MESSAGE_EVENT} from "../../constants/events";
import {DIRECTION_LEFT, DIRECTION_RIGHT} from "ionic-angular/gestures/hammer";
import {Keyboard} from "@ionic-native/keyboard";
import {ApplicationUtil} from "../../util/application-util";
import {PAGE_ENUM} from "../../enums/enums";
import {ChatUtil} from "../../util/chatUtil";
import {METHOD} from "../../constants/api-points";

declare let Meteor, _;

enum MSG_DELIVERY_STATUS {
    DELIVERED, NOT_DELIVERED, SENDING
}

@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage implements OnInit {

    APP_DATETIME_FORMAT = APP_DATE_TIME_FORMAT;
    MSG_DELIVERY_STATUS = MSG_DELIVERY_STATUS;
    FOOTER_HEIGHT = '56px';

    @ViewChild(Content) content: Content;
    @ViewChild('footer') footer;

    input: string = '';
    messagesDayGroups;
    selectedChat;
    loggedUserId: string;
    //this is only visible for browser
    hideIonicTypeField: boolean = true;
    messagesBatchCounter: number = 0;
    msgDeliveryStatus: MSG_DELIVERY_STATUS = MSG_DELIVERY_STATUS.DELIVERED;
    chatCreated: boolean = false;
    scrollContent;
    createdAtHidden: boolean = true;
    sendButtonDisabled: boolean = true;

    //local subscriptions
    keyboardShowSub;
    keyboardHideSub;
    newMessageSub;

    constructor(private keyboard: Keyboard, public events: Events, public zone: NgZone, public platform: Platform, public navCtrl: NavController, public params: NavParams, public tabsService: TabsService, public dataSharing: DataComponentSharing) {
        this.chatCreated = isDefined(params.get('chat')._id) ? true : false;
        ChatUtil.setCurrentChatId(params.get('chat')._id);
        this.selectedChat = params.get('chat');
        this.loggedUserId = Meteor.userId();
        this.hideIonicTypeField = this.platform.is(DEVICE.CORDOVA);
        this.init();
    }

    init() {
        this.newMessageSub = this.events.subscribe(NEW_MESSAGE_EVENT, () => {
            this.loadMessages();
        });
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.keyboard.disableScroll(true);
            this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e: any) => {
                window.setTimeout(() => {
                    this.footer.nativeElement.style.bottom = this.scrollContent.style.bottom = e.keyboardHeight + 'px';
                    this.content.scrollToBottom(0);
                }, 200);
            });
            this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe(() => {
                this.footer.nativeElement.style.bottom = this.scrollContent.style.bottom = '0px';
            });
        });
    }

    showCreatedAt(event) {
        if (event.direction === DIRECTION_LEFT) {
            this.createdAtHidden = false;
        } else if (event.direction === DIRECTION_RIGHT) {
            this.createdAtHidden = true;
        }
    }

    goToMore(message) {
        if (message.notDelivered) {
            //try to send message again
        }
    }


    loadMessages() {
        this.zone.run(() => {
            if (this.selectedChat && this.selectedChat._id) {
                this.messagesDayGroups = this.findMessagesDayGroups();
                this.scrollToBottom();
            }
        });
    }

    findMessagesDayGroups() {
        const messages = CollectionCache.Messages.find({chatId: this.selectedChat._id}, {sort: {createdAt: 1}}).fetch();
        const compareDateFormat = 'DD.MM.YYYY';
        // Group by creation day
        const groupedMessages = _.groupBy(messages, (message) => {
            return moment(message.createdAt).format(compareDateFormat);
        });
        let result = Object.keys(groupedMessages).map((timestamp: string, keyIdx, keysArray) => {
            let lastOneOwnership = '';
            const messages = groupedMessages[timestamp].map((message: Message, index, array: Array<any>) => {
                lastOneOwnership = message.ownership = this.loggedUserId == message.senderId ? 'mine' : 'other';
                if (index + 1 < array.length) {
                    message.nextOne = this.loggedUserId == array[index + 1].senderId ? 'mine' : 'other';
                }
                return message;
            });
            return {
                isLastMine: (lastOneOwnership === 'mine') && (keyIdx + 1 === keysArray.length),
                timestamp: messages[0].createdAt,
                messages: messages,
                today: moment().format(compareDateFormat) === timestamp
            };
        });
        return result;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.content.scrollToBottom(0);
        }, 0);
    }

    onInputKeypress({keyCode}: KeyboardEvent): void {
        this.zone.run(() => {
            this.sendButtonDisabled = this.input === '';
        });
        if (keyCode === 13) {
            //TODO test it
            //this.send();
        }
    }

    send() {
        let newMessage: any = {
            content: this.input,
            createdAt: new Date(),
            ownership: 'mine',
            senderId: this.loggedUserId,
            status: MSG_DELIVERY_STATUS.SENDING
        };
        if (isDefined(this.messagesDayGroups) && this.messagesDayGroups.length > 0) {
            const lastDayGroup = this.messagesDayGroups[this.messagesDayGroups.length - 1];
            if (lastDayGroup.today) {
                lastDayGroup.isLastMine = true;
                lastDayGroup.messages.push(newMessage);
            } else {
                this.messagesDayGroups.push({
                    isLastMine: false,
                    timestamp: newMessage.createdAt,
                    messages: [newMessage],
                    today: false
                });
            }
        } else {
            this.messagesDayGroups = [{
                isLastMine: false,
                timestamp: newMessage.createdAt,
                messages: [newMessage],
                today: true
            }]
        }
        const content = this.input;
        this.input = '';
        this.sendButtonDisabled = true;
        this.scrollToBottom();
        this.msgDeliveryStatus = MSG_DELIVERY_STATUS.SENDING;
        if (this.chatCreated) {
            MeteorObservable.call(METHOD.WRITE_MESSAGE, {
                chatId: this.selectedChat._id,
                content: content
            }).subscribe(() => {
                this.msgDeliveryStatus = MSG_DELIVERY_STATUS.DELIVERED;
            }, (error) => {
                if (error) console.log(error);
                if (error.error = 'Notification.send') {
                    this.msgDeliveryStatus = MSG_DELIVERY_STATUS.DELIVERED;
                } else {
                    this.msgDeliveryStatus = MSG_DELIVERY_STATUS.NOT_DELIVERED;
                    newMessage.status = MSG_DELIVERY_STATUS.NOT_DELIVERED;
                }
            });
        } else {
            MeteorObservable.call(METHOD.WRITE_MATCH_MESSAGES, {
                receiverId: this.selectedChat.receiver._id,
                content: content
            }).subscribe((chatId: string) => {
                //TODO dont return whole message from server just id
                this.msgDeliveryStatus = MSG_DELIVERY_STATUS.DELIVERED;
                this.selectedChat._id = chatId;
                this.loadMessages();
                this.chatCreated = true;
                ChatUtil.setCurrentChatId(chatId);
            }, (error) => {
                console.log(error);
                if (error.error = 'Notification.send') {
                    this.msgDeliveryStatus = MSG_DELIVERY_STATUS.DELIVERED;
                } else {
                    this.msgDeliveryStatus = MSG_DELIVERY_STATUS.NOT_DELIVERED;
                }
            });
        }
    }

    ngAfterViewInit() {
        this.scrollContent = document.getElementById('page-messages-content').children[1];
    }

    ionViewWillEnter() {
        this.tabsService.hide(this.FOOTER_HEIGHT);
        ApplicationUtil.setCurrentPage(PAGE_ENUM.MESSAGE);
        this.loadMessages();
        if (this.chatCreated) {
            if (isDefined(this.selectedChat.unseen) && this.selectedChat.unseen !== 0) {
                this.events.publish(CHAT_TAB_BADGE_INC_EVENT, {
                    badgeTabCount: this.selectedChat.unseen === 0 ? 0 : -1 * this.selectedChat.unseen,
                    chatId: this.selectedChat._id,
                    unseen: 0
                });
                this.selectedChat.unseen = 0;
            }
            this.dataSharing.setValue(MESSAGE_PAGE_ACTIVE_EVENT, this.params.get('chat')._id);
        }
    }

    ionViewWillLeave() {
        if (isDefined(this.keyboardShowSub)) {
            this.keyboardShowSub.unsubscribe();
        }
        if (isDefined(this.keyboardHideSub)) {
            this.keyboardHideSub.unsubscribe();
        }
        if (isDefined(this.newMessageSub)) {
            this.newMessageSub.unsubscribe();
        }

        this.tabsService.show();
        ApplicationUtil.setCurrentPage(undefined);
        ChatUtil.setCurrentChatId(undefined);
        this.dataSharing.setValue(MESSAGE_PAGE_ACTIVE_EVENT, undefined);
    }
}
