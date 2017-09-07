import {Messages} from "./collections";
import {createStorage} from "../app/app.module";
import {isUndefined} from "../../node_modules/ionic-angular/util/util";

declare let Ground;

export class CollectionCache {

    static Chats;
    static ChatsDb;
    static Messages;
    static MessagesDb;
    static Pokes
    static Matches;

    static init(): Promise<any> {
        let chatsP, messagesP, unseenPokesP, unseenMatchesP;

        if (isUndefined(CollectionCache.Chats)) {
            const chatsDbName = 'chats-cached';
            chatsP = new Promise(resolve => {
                createStorage(chatsDbName)._dbPromise.then(db => {
                    CollectionCache.ChatsDb = db;
                    CollectionCache.Chats = new Ground.Collection(chatsDbName, {storageAdapter: db});
                    CollectionCache.Chats.once('loaded', () => {
                        resolve();
                    });
                });
            });
        }

        if (isUndefined(CollectionCache.Messages)) {
            const messagesDbName = 'messages-cached';
            messagesP = new Promise(resolve => {
                createStorage(messagesDbName)._dbPromise.then(db => {
                    CollectionCache.MessagesDb = db;
                    CollectionCache.Messages = new Ground.Collection(messagesDbName, {storageAdapter: db});
                    CollectionCache.Messages.observeSource(Messages.find());
                    CollectionCache.Messages.once('loaded', () => {
                        resolve();
                    });
                });
            });
        }

        //there are just ids and unseen status in object
        if (isUndefined(CollectionCache.Pokes)) {
            const usersDbName = 'pokes-cached';
            unseenPokesP = new Promise(resolve => {
                createStorage(usersDbName)._dbPromise.then(db => {
                    CollectionCache.Pokes = new Ground.Collection(usersDbName, {storageAdapter: db});
                    CollectionCache.Pokes.once('loaded', () => {
                        resolve();
                    }, (error) => {
                        console.log(error);
                    });
                });
            });
        }
        if (isUndefined(CollectionCache.Matches)) {
            const usersDbName = 'matches-cached';
            unseenMatchesP = new Promise(resolve => {
                createStorage(usersDbName)._dbPromise.then(db => {
                    CollectionCache.Matches = new Ground.Collection(usersDbName, {storageAdapter: db});
                    CollectionCache.Matches.once('loaded', () => {
                        resolve();
                    });
                });
            });
        }

        return Promise.all([chatsP, messagesP, unseenPokesP, unseenMatchesP]);
    }

    static clearCollectionCaches() {
        CollectionCache.Pokes.clear();
        CollectionCache.Matches.clear();
    }
}