/// <reference types="meteor-typings" />
/// <reference types="@types/mocha" />
/// <reference types="@types/chai" />
/// <reference types="@types/chai-string" />
/// <reference types="@types/underscore" />
/// <reference types="@types/turf" />
/// <reference path="chance.d.ts" />


declare let LoggedInMixin, ValidatedMethod;

declare module "meteor/service-configuration" {
    module ServiceConfiguration {
        var configurations: any;
    }
}

declare module "meteor/accounts-base" {
    module Accounts {
        function registerLoginHandler(callback: Function): void;

        function updateOrCreateUserFromExternalService(serviceName: string, serviceData: Object, profile: Object): { type: string, userId: string };

        function onCreateUser(callback: Function): Object;
    }
}


declare module 'cloudinary' {
    function config(credentials: {
        cloud_name: string,
        api_key: string,
        api_secret: string
    });

    var uploader: {
        upload(file: any, options?: Object, callback?: Function): any
    };
}
;

declare module 'meteor/xolvio:cleaner' {
    function resetDatabase(): void;
}


declare module 'simpl-schema' {
    export default class SimpleSchema {
        static Integer;
        static RegEx: {
            Id: any,
            Email: any,
            EmailWithTLD: any,
            Domain: any,
            IP: any,
            IPv4: any,
            IPv6: any,
            Url: any,
            ZipCode: any,
            Phone: any
        }

        constructor(obj: any);

        extend(obj: any);

        validate(obj: any);

        validator();

        newContext();
    };
}

declare namespace Mongo {
    interface Collection<T> {
        attachSchema(obj: any): void;
        _ensureIndex(obj: any): void;
        aggregate(...obj): Array<any>
    }
}

