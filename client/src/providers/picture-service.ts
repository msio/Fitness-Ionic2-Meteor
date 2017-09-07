import {Injectable, NgZone} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {USER_PICTURES_STORAGE} from "../constants/constants";
import {Storage} from "@ionic/storage";
import {isDefined} from "ionic-angular/util/util";
import {Http, ResponseContentType} from "@angular/http";
import {File} from "@ionic-native/file";

declare let _;

@Injectable()
export class PictureService {

    constructor(private file: File, public zone: NgZone, public http: Http, public sanitizer: DomSanitizer, public storage: Storage) {
    }

    fileToBase64(imagePath: string, runZone: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            this.file.resolveLocalFilesystemUrl(imagePath).then((fileEntry: any) => {
                fileEntry.file((file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (runZone) {
                            this.zone.run(() => {
                                resolve(this.sanitizer.bypassSecurityTrustUrl(e.target['result']));
                            });
                        } else {
                            resolve(this.sanitizer.bypassSecurityTrustUrl(e.target['result']));
                        }
                    };
                    reader.onerror = (e) => {
                        reject(e);
                    };
                    reader.readAsDataURL(file);
                });
            }, (error) => {
                reject(error);
            });
        });
    }

    prepareForStoring(picture: { _id: string, url: string, createdAt: string }) {
        return this.urlToBase64(picture.url).then((data) => {
            return {_id: picture._id, data: data, profile: false}
        });
    }

    urlToBase64(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(url, {responseType: ResponseContentType.Blob}).subscribe((resp) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // here you'll call what to do with the base64 string result
                    resolve(e.target['result']);
                };
                reader.onerror = (e) => {
                    reject(e);
                };
                reader.readAsDataURL(resp.blob());
            });
        });

    }

    getPictures() {
        return this.storage.get(USER_PICTURES_STORAGE);
    }

    getProfilePicture(): Promise<any> {
        return this.storage.get(USER_PICTURES_STORAGE).then((pictures: Array<any>) => {
            if (pictures === null) {
                return null;
            } else {
                return _.findWhere(pictures, {profile: true});
            }
        });
    }

    changeProfilePicture(id: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.storage.get(USER_PICTURES_STORAGE).then((pictures: Array<any>) => {
                let oldProfile: any = _.findWhere(pictures, {profile: true});
                let newProfile: any = _.findWhere(pictures, {_id: id});
                if (isDefined(oldProfile)) {
                    pictures.splice(pictures.indexOf(oldProfile), 1);
                    oldProfile.profile = false;
                    pictures.push(oldProfile);

                    pictures.splice(pictures.indexOf(newProfile), 1);
                    newProfile.profile = true;
                    pictures.unshift(newProfile);
                    resolve(pictures);
                }
            }, (error) => {
                reject(error);
            });
        });
    }

    addPictures(pictures: Array<any>) {
        return this.storage.set(USER_PICTURES_STORAGE, pictures);
    }

    addPicture(id: string, imageUrl: string, profile: boolean): Promise<any> {
        return this.storage.get(USER_PICTURES_STORAGE).then((pictures: Array<any>) => {
            pictures = pictures === null ? [] : pictures;
            return this.urlToBase64(imageUrl).then((imageBase64) => {
                const picture = {_id: id, data: imageBase64, profile: profile}
                pictures.unshift(picture);
                return this.storage.set(USER_PICTURES_STORAGE, pictures);
            });
        });
    }

    removePicture(id: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            this.storage.get(USER_PICTURES_STORAGE).then((pictures: Array<any>) => {
                const found = _.findWhere(pictures, {_id: id});
                if (isDefined(found)) {
                    pictures.splice(pictures.indexOf(found), 1);
                }
                this.storage.set(USER_PICTURES_STORAGE, pictures).then(() => {
                    resolve(pictures);
                }, (error) => {
                    reject(error);
                });
            }, (error) => {
                reject(error);
            });
        });
    }

}
