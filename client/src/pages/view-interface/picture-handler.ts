import {Injectable} from "@angular/core";
import {NavController, ActionSheetController, Platform} from "ionic-angular";
import {DEVICE} from "../../constants/platforms";
import {Camera} from "@ionic-native/camera";
import {Crop} from "@ionic-native/crop";

@Injectable()
export class PictureHandler {
    constructor(private crop:Crop,private camera:Camera,public platform: Platform, public  navCtrl: NavController, public actionSheetCtrl: ActionSheetController) {
    }

    private cropPicture(imgPath: string): Promise<any> {
        return this.crop.crop(imgPath, {quality: 75}).then((result) => {
            console.log('Crop-result',result);
            return result;
        }, (error) => {
            console.log('crop', error);
        });
    }

    private getPictureFrom(): Promise<any> {
        return this.platform.ready().then(() => {
            if (this.platform.is(DEVICE.CORDOVA)) {
                const options = {
                    quality: 75,
                    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                    destinationType: this.camera.DestinationType.FILE_URI,
                    encodingType: this.camera.EncodingType.JPEG,
                    mediaType: this.camera.MediaType.PICTURE,
                    //picture will be shrunk to max 1024 px in width or height
                    targetWidth: 600,
                    targetHeight: 600
                }
                return this.camera.getPicture(options).then(imgPath => {
                    console.log('GET-PICTURE', imgPath);
                    return this.cropPicture(imgPath);
                }, (error) => {
                    console.log('camera', error);
                    return Promise.reject(error);
                });
            } else {
                //TODO just for Development in Browser
                return 'assets/avatar.png';
            }
        });
    }

    getCroppedPicture(): Promise<any> {
        return new Promise((resolve, reject) => {
            let actionSheet = this.actionSheetCtrl.create({
                title: 'Change profile photo',
                buttons: [
                    {
                        text: 'Choose from Library',
                        handler: () => {
                            this.getPictureFrom().then((imgPath) => {
                                resolve(imgPath);
                            }, (error) => {
                                reject(error);
                            });
                        }
                    }, {
                        text: 'Cancel',
                        role: 'cancel'
                    }
                ]
            });
            actionSheet.present();
        });
    }
}
