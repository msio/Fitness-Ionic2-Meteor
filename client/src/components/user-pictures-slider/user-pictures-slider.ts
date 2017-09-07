import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
    ActionSheetController, AlertController, LoadingController, NavController, NavParams, Platform,
    Slides
} from "ionic-angular";
import {UserDataService} from "../../providers/user-data-service";
import {PictureHandler} from "../../pages/view-interface/picture-handler";
import {MeteorObservable} from "meteor-rxjs";
import {isDefined} from "ionic-angular/util/util";
import {ArrayUtil} from "../../util/array-util";
import {METHOD} from "../../constants/api-points";
import {MAX_NUMBER_OF_UPLOAD_PICTURES} from "../../constants/constants";


@Component({
    selector: 'user-pictures-slider',
    templateUrl: 'user-pictures-slider.html',
    providers: [PictureHandler]
})
export class UserPicturesSliderComponent implements OnInit {

    @ViewChild(Slides) slides: Slides;

    @Input() user;
    @Input() readonly: boolean;

    userProfile;
    pictures: Array<any> = [];
    pictureCounter = 0;
    height;
    slidingSpeed = 150;
    backButtonShown:boolean = false;

    constructor(public platform: Platform, public loadingCtrl: LoadingController, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController, public navCtrl: NavController, public params: NavParams, public pictureHandler: PictureHandler, public userDataService: UserDataService) {
        this.height = this.platform.width();
    }

    ngOnInit() {
        this.userProfile = isDefined(this.user.profile) ? this.user.profile : this.user;
        const userPicture = isDefined(this.user.profile) ? this.user.profile.picture : this.user.picture;
        this.pictures = [{
            picture: userPicture,
            loaded: false,
            set: true
        }];
        if (isDefined(this.user.profile)) {
            if (userPicture !== null) {
                MeteorObservable.call(METHOD.FIND_OWN_PICTURES).subscribe((pictures: Array<any>) => {
                    if (pictures.length > 0) {
                        pictures.forEach((picture) => {
                            this.pictures.push({picture: picture, loaded: false, set: false});
                        });
                        this.pictures[this.pictureCounter++].set = true;
                    }
                }, (error) => {
                    console.log(error);
                });
            }
        } else {
            this.user.otherPictures.forEach((picture) => {
                this.pictures.push({picture: picture, loaded: false, set: false});
            });
            this.pictures[this.pictureCounter++].set = true;
        }
    }

    onSlideTap(){
        this.backButtonShown = true;
    }

    onSlideChange() {
        this.backButtonShown = false;
        if (this.pictures.length > 1 && this.pictureCounter < this.pictures.length) {
            this.pictures[this.pictureCounter++].set = true;
        }
    }

    addPicture() {
        if (this.pictures.length === MAX_NUMBER_OF_UPLOAD_PICTURES) {
            let alert = this.alertCtrl.create({
                title: 'Maximal number of photo uploads',
                subTitle: 'You can upload maximal 5 photos, please remove a photo before uploading new one',
                buttons: ['Ok']
            });
            alert.present();
            return;
        }
        this.pictureHandler.getCroppedPicture().then((imgPath) => {
            let loading = this.loadingCtrl.create({
                content: 'Uploading...'
            });
            loading.present();
            this.userDataService.uploadImage(imgPath).subscribe((picture) => {
                this.setToFirstPosition(picture, true);
                loading.dismiss();
            }, (error) => {
                loading.dismiss();
                console.log(error);
            });
        }, (error) => {
            console.log(error);
        });
    }

    showImageOptions(pic) {
        this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Remove Photo',
                    handler: () => {
                        this.alertCtrl.create({
                            title: 'Remove Photo',
                            message: 'Do you really want to remove Photo?',
                            buttons: [
                                {
                                    text: 'No, I don\'t',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Yes, I do',
                                    handler: () => {
                                        this.removePicture(pic);
                                    }
                                }
                            ]
                        }).present();
                    }
                },
                {
                    text: 'Set Profile Photo',
                    handler: () => {
                        this.setToProfilePicture(pic);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        }).present();

    }

    removePicture(pic) {
        let loading = this.loadingCtrl.create({
            content: 'Removing...'
        });
        loading.present();
        MeteorObservable.call(METHOD.REMOVE_PICTURE, {pictureId: pic.picture._id}).subscribe(() => {
            // this.pictures = _.reject(this.pictures);
            const index = this.pictures.indexOf(pic);
            if (index > -1) {
                this.pictures.splice(index, 1);
                this.slides.update();
                this.pictureCounter = 0;
                this.slides.slideTo(0, this.slidingSpeed, false);
            }
            loading.dismiss();
        }, (error) => {
            loading.dismiss();
            console.log(error);
        });
    }

    setToProfilePicture(pic) {
        MeteorObservable.call(METHOD.SET_PROFILE_PICTURE, {pictureId: pic.picture._id}).subscribe(() => {
            this.setToFirstPosition(pic, false);
        });
    }

    //first position is always profile photo
    setToFirstPosition(picture: any, afterUpload: boolean) {
        if (afterUpload) {
            //no user picture just avatar
            if (this.pictures.length === 1 && this.pictures[0].picture === null) {
                this.pictures = [];
            }
            this.pictures.unshift({picture: picture, loaded: false, set: true});
        } else {
            //this is pic not picture
            ArrayUtil.move(this.pictures, this.pictures.indexOf(picture), 0);
        }
        this.pictureCounter = 0;
        this.slides.update();
        this.slides.slideTo(0, this.slidingSpeed, false);
    }
}
