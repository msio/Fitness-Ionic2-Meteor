declare let Meteor, HTTP;

export enum NOTIFICATION_TYPE_ENUM {
    MSG, POKE, MATCH
}

//TODO add more languages
export class Notifications {

    static url;
    static headers;
    static appId;

    static init() {
        Notifications.url = Meteor.settings['oneSignal'].urlNotifications
        Notifications.headers = {
            'Content-Type': "application/json; charset=utf-8",
            Authorization: "Basic " + Meteor.settings['oneSignal'].apiKey
        }
        Notifications.appId = Meteor.settings['oneSignal'].appId;

        //firebase
        /*Notifications.url = Meteor.settings['fireBase'].urlNotifications;
         Notifications.headers = {
         'Content-Type': "application/json",
         Authorization: "key=" + Meteor.settings['fireBase'].serverKey
         }*/
    }


    static pushToAllDevices(devices: Array<string>, type: NOTIFICATION_TYPE_ENUM, user: { firstName: string }, optionalData?) {
        devices.forEach((device: any) => {
            //TODO for browser
            if (device.id !== 'deviceId') {
                Notifications.push(device.id, type, user, optionalData);
            }
        });
    }

    static push(deviceId: string, type: NOTIFICATION_TYPE_ENUM, user: { firstName: string }, optionalData?) {
        let body;
        let data: any = {type: type};
        switch (type) {
            case NOTIFICATION_TYPE_ENUM.MSG:
                body = user.firstName + ' sent you new message';
                data.chatId = optionalData.chatId;
                break;
            case NOTIFICATION_TYPE_ENUM.POKE:
                body = 'New potential training partner';
                break;
        }

        try {
            const result = HTTP.post(Notifications.url, {
                headers: Notifications.headers,
                data: {
                    app_id: Notifications.appId,
                    contents: {"en": body},
                    data: data,
                    include_player_ids: [deviceId],
                    ios_badgeType: 'Increase',
                    ios_badgeCount: 1
                }
            });
        } catch (error) {
            throw new Meteor.Error('Notification.send', error);
        }

        //firebase
        /*try {
         //TODO result can be used for statistics
         const result = HTTP.post(Notifications.url, {
         headers: Notifications.headers,
         data: {
         notification: {
         body: body
         },
         data: {type: type, data},
         content_available: true,
         priority: 'high',
         to: deviceId
         }
         });
         } catch (error) {
         throw new Meteor.Error('Notification.send', error);
         }*/

    }

}