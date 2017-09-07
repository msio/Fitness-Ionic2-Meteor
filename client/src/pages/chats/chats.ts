import {Component, NgZone} from '@angular/core';
import {NavController, Events} from 'ionic-angular';
import {isDefined} from "ionic-angular/util/util";
import {MessagesPage} from "../messages/messages";
import {CollectionCache} from "../../meteor-client/collections-cache";
import {NEW_MESSAGE_EVENT} from "../../constants/events";

declare let Meteor,_;

@Component({
    selector: 'page-chats',
    templateUrl: 'chats.html'
})
export class ChatsPage {

    isDefined = isDefined;
    chats;
    loggedUserId: string;
    chatsSub;

    constructor(public events: Events, public zone: NgZone, public navCtrl: NavController) {
        this.loggedUserId = Meteor.userId();
        this.init();
    }

    init() {
        this.chatsSub = this.events.subscribe(NEW_MESSAGE_EVENT, () => {
            this.loadChats();
        });
    }


    loadChats() {
            this.chats = this.findChats();
    }

    findChats() {
        //TODO check if every message has a chat
        /*const messages = CollectionCache.Messages.find().fetch();
         const groupsByChat = _.groupBy(messages, 'chatId');
         groupsByChat.forEach((key:string, value) => {
         /!* if key in const messages = CollectionCache.Chats
         get it else get from server
         *!/

         // const lastMessage
         });*/

        let chats = CollectionCache.Chats.find().map((chat) => {
            if(!_.has(chat,'receiver')){
                console.error('Inconsistent Data','There is chat without receiver property');
                return;
            }
            const messages = CollectionCache.Messages.find({chatId: chat._id}, {
                sort: {createdAt: -1}
            }).fetch();
            if (messages.length === 0) {
                console.error('Inconsistent Data','This Char has no messages');
                return;
            } else {
                chat.lastMessage = messages[0];
            }
            return chat;
        });
        return _.filter(chats,(chat)=>{ return isDefined(chat)});
    }

    goToMessages(chat) {
        this.navCtrl.push(MessagesPage, {chat: chat});
    }

    ionViewWillEnter() {
        this.loadChats();
    }

    ionViewWillLeave() {
        if (isDefined(this.chatsSub)) {
            this.chatsSub.unsubscribe();
        }
    }
}
