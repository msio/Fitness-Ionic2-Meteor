import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavParams, Platform, ViewController} from 'ionic-angular';
import 'croppie';
import {UserDataService} from "../../providers/user-data-service";

//TODO create typing
declare let Croppie;

@Component({
    selector: 'page-crop-user-picture',
    templateUrl: 'crop-user-picture.html'
})
export class CropUserPicturePage {

    @ViewChild('croppie') divElem: ElementRef;
    private imgUri;
    private croppie: any;
    private viewportRadius: number;

    constructor(public platform: Platform, public params: NavParams, public viewCtrl: ViewController, public userDataService: UserDataService) {
        this.imgUri = params.get('imgUri');
        this.viewportRadius = platform.width();
    }

    dismiss() {
        // this.croppie.destroy();
        this.viewCtrl.dismiss(null);
    }

    crop() {


        /*this.croppie.result({
         type: 'blob',
         size: {width: 500, height: 500},
         format: 'jpeg',
         quality: 1,
         circle: false
         }).then(res => {
         this.croppie.destroy();
         this.viewCtrl.dismiss(res);
         });*/
    }

    ionViewDidLoad() {
        /*this.croppie = new Croppie(this.divElem.nativeElement, {
         viewport: {
         width: this.viewportRadius,
         height: this.viewportRadius,
         type: 'square',
         }
         });
         this.croppie.bind({
         url: this.imgUri
         });*/
    }

    ionViewWillUnload() {
        //TODO croppie will not destroy, it should because destroy was called
        // console.log('croppie: ', this.croppie);
    }
}
