import {MongoObservable} from "meteor-rxjs";

declare let Meteor;

export const Pokes = new MongoObservable.Collection('pokes');

export const Matches = new MongoObservable.Collection('matches');

export const Messages = new MongoObservable.Collection('messages');
