import {Injectable} from '@angular/core';
import {CollectionCache} from "../meteor-client/collections-cache";
import {MeteorObservable} from "meteor-rxjs";
import {Messages, Pokes, Matches} from "../meteor-client/collections";
import {isUndefined, isDefined} from "ionic-angular/util/util";
import {Events} from "ionic-angular";
import {
    CHAT_TAB_BADGE_INC_EVENT, POKES_BADGE_INC_EVENT, MATCHES_BADGE_INC_EVENT,
    NEW_MESSAGE_EVENT
} from "../constants/events";
import {ApplicationUtil} from "../util/application-util";
import {PAGE_ENUM, POKE_TYPE} from "../enums/enums";
import {ChatUtil} from "../util/chatUtil";
import {METHOD, PUBLICATION} from "../constants/api-points";

declare let Meteor;

@Injectable()
export class SubscriptionService {

    nav;
    toastCtrl;

    constructor(public events: Events) {
    }

    init(nav, toastCtrl) {
        this.nav = nav;
        this.toastCtrl = toastCtrl;
        this.loadInitChatsAndMessages();
        this.initPokesSubscription();
        this.initMatchesSubscription();
    }

    loadInitChatsAndMessages() {
        const lastMessage = CollectionCache.Messages.find({}, {sort: {createdAt: -1}, limit: 1}).fetch();
        if (lastMessage.length === 0) {
            //all last messages (per limit) and all chats
            MeteorObservable.call(METHOD.FIND_CHATS).subscribe((collections: any) => {
                // TODO inserts are asynchronous
                collections.chats.forEach((chat) => {
                    CollectionCache.Chats.insert(chat);
                });
                collections.messages.forEach((message) => {
                    CollectionCache.Messages.insert(message);
                });
                const lastMessageAfter = CollectionCache.Messages.find({}, {sort: {createdAt: -1}, limit: 1}).fetch();
                this.initChatSubscription(lastMessageAfter);
            });
        } else {
            this.initChatSubscription(lastMessage);
        }
    }


    initMatchesSubscription() {
        MeteorObservable.subscribe(PUBLICATION.FIND.MATCHES).subscribe(() => {
            Matches.find().observe({
                added: doc => {
                    //TODO check if in db is more than x number of entries else not insert
                    console.log('new Match', doc);
                    if (isUndefined(CollectionCache.Matches.findOne(doc._id))) {
                        CollectionCache.Matches.insert({_id: doc._id, unseen: true}, (error) => {
                            if (error) {
                                console.log(error);
                            } else {
                                this.events.publish(MATCHES_BADGE_INC_EVENT, {badgeTabCount: 1});
                                this.handleNewPokeOrMatchToast(doc, POKE_TYPE.MATCHES);
                            }
                        });
                    }
                },
                removed: doc => {
                    CollectionCache.Matches.remove({_id: doc._id}, (error, removed) => {
                        if (removed > 0) {
                            this.events.publish(MATCHES_BADGE_INC_EVENT, {badgeTabCount: -1});
                        }
                    });
                }
            });
        });
    }

    initPokesSubscription() {
        MeteorObservable.subscribe(PUBLICATION.FIND.POKES).subscribe(() => {
            Pokes.find().observe({
                added: doc => {
                    //TODO check if in db is more than x number of entries else not insert
                    if (isUndefined(CollectionCache.Pokes.findOne(doc._id))) {
                        CollectionCache.Pokes.insert({_id: doc._id, unseen: true}, (error) => {
                            if (error) {
                                console.log(error);
                            } else {
                                this.events.publish(POKES_BADGE_INC_EVENT, {badgeTabCount: 1});
                                this.handleNewPokeOrMatchToast(doc, POKE_TYPE.POKES);
                            }
                        });
                    }
                },
                removed: doc => {
                    CollectionCache.Pokes.remove({_id: doc._id}, (error, removed) => {
                        if (removed > 0) {
                            this.events.publish(POKES_BADGE_INC_EVENT, {badgeTabCount: -1});
                        }
                    });
                }
            });
        });
    }


    initChatSubscription(lastMessage) {
        const lastCreatedAt = lastMessage.length === 0 ? -1 : lastMessage[0].createdAt.getTime();
        MeteorObservable.subscribe(PUBLICATION.FIND.OTHER_MESSAGES, {lastCreatedAt: lastCreatedAt}).subscribe(() => {
            Messages.find().observe({
                added: doc => {
                    //TODO local notification
                    console.log('newMessage',doc);
                    if (isDefined(doc.receiver)) {
                        const chat = {
                            _id: doc.chatId,
                            receiver: doc.receiver
                        }
                        CollectionCache.Chats.insert(chat, (error) => {
                            this.events.publish(NEW_MESSAGE_EVENT);
                            if (error) console.log(error);
                            if (doc.senderId !== Meteor.userId() && !ApplicationUtil.isCurrentPage(PAGE_ENUM.MESSAGE)) {
                                this.updateMessageCounterInChatHelper(doc.chatId);
                            }
                            this.handleNewMessageToast(doc);
                        });
                    } else {
                        this.events.publish(NEW_MESSAGE_EVENT);
                        if (doc.senderId !== Meteor.userId() && !ApplicationUtil.isCurrentPage(PAGE_ENUM.MESSAGE)) {
                            this.updateMessageCounterInChatHelper(doc.chatId);
                        }
                        this.handleNewMessageToast(doc);
                    }
                }
            });
        });
    }

    private handleNewPokeOrMatchToast(doc, pokeType: POKE_TYPE) {
        let msg;
        if (pokeType === POKE_TYPE.POKES) {
            msg = 'You have new potential fitness partner';
        } else {
            msg = 'You found your fitness partner';
        }
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 3000,
            position: 'top'
        });

        toast.onDidDismiss(() => {
            console.log('go to pokes');
        });

        toast.present();
    }

    private handleNewMessageToast(doc) {
        //new message from other chatId than that what it's currently open
        const onMessagePage = doc.senderId !== Meteor.userId() && ApplicationUtil.isCurrentPage(PAGE_ENUM.MESSAGE) && !ChatUtil.isCurrentChatId(doc.chatId);
        // new message on FoundDetailsPage
        const onFoundDetailsPage = ApplicationUtil.isCurrentPage(PAGE_ENUM.FOUND_USER_DETAILS);
        if (onMessagePage || onFoundDetailsPage) {
            let toast = this.toastCtrl.create({
                message: 'You have new Message',
                duration: 3000,
                position: 'top'
            });

            toast.onDidDismiss(() => {
                //TODO implement go to tapped message
                console.log('go to messsage');
            });

            toast.present();
        }

    }

    private updateMessageCounterInChatHelper(chatId) {
        this.events.publish(CHAT_TAB_BADGE_INC_EVENT, {badgeTabCount: 1, chatId: chatId, unseen: 1});
    }

}
