import {ViewController} from "ionic-angular";
export class SelectorBase {

    constructor(public viewCtrl: ViewController) {

    }

    ngAfterViewInit() {
        this.viewCtrl.setBackButtonText('Fitness');
    }
}