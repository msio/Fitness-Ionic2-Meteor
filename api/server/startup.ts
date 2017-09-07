import {ServiceConfiguration} from "meteor/service-configuration";
import * as cloudinary from 'cloudinary';
import {Locations} from "./collections";
import {ApplicationUtil} from "./util/applicationUtil";
import {Notifications, NOTIFICATION_TYPE_ENUM} from "./notifications/notifications";
import CloudinaryURl = require('cloudinary-url');

Meteor.startup(() => {
    if (Meteor.settings['cloudinary']) {
        const urlGenerator: any = new CloudinaryURl(Meteor.settings['cloudinary'].apiKey, Meteor.settings['cloudinary'].apiSecret, 'bucketName');
        // console.log(new Date('2017-03-14T13:12:05Z'));
        const res = urlGenerator.sign({
            public_id: 'k25935am6qx6bxemnl0j',
            timestamp: new Date('2017-03-14T13:12:05Z').getTime()
        });
        // console.log(res.params);
        //index for geo data
        Locations._ensureIndex({'geometry': '2dsphere'});

        cloudinary.config({
            cloud_name: Meteor.settings['cloudinary'].cloudName,
            api_key: Meteor.settings['cloudinary'].apiKey,
            api_secret: Meteor.settings['cloudinary'].apiSecret
        });
    } else {
        console.log("Settings for Cloudinary was not set");
    }

    if (Meteor.settings['oneSignal']) {
        //setup notifications
        Notifications.init();
    } else {
        console.log("Settings for OneSignal was not set");
    }

    if (Meteor.settings['facebook']) {
        //get facebook application access token
        try {
            const resp = HTTP.get(Meteor.settings['facebook'].graphApiUrl + 'oauth/access_token', {
                params: {
                    grant_type: 'client_credentials',
                    client_id: Meteor.settings['facebook'].appId,
                    client_secret: Meteor.settings['facebook'].secret
                }
            });
            ApplicationUtil.setFacebookAccesToken(resp.data.access_token);
        } catch (error) {
            throw new Meteor.Error('facebook application access token', error);
        }

        //set facebook application credentials for user authentication
        ServiceConfiguration.configurations.upsert({
            service: "facebook"
        }, {
            $set: {
                appId: Meteor.settings['facebook'].appId,
                secret: Meteor.settings['facebook'].secret
            }
        });
    } else {
        console.log("Settings for Facebook was not set");
    }
});
