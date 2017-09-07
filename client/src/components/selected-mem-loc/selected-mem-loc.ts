import {Component, Input} from '@angular/core';
import {isDefined} from "ionic-angular/util/util";

@Component({
    selector: 'selected-mem-loc',
    templateUrl: 'selected-mem-loc.html'
})
export class SelectedMemLocComponent {

    isDefined = isDefined;

    @Input() membership;

    constructor() {
    }
}
