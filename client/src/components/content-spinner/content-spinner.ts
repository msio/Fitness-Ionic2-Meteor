import {Component, Input} from '@angular/core';

@Component({
    selector: 'content-spinner',
    templateUrl: 'content-spinner.html'
})
export class ContentSpinnerComponent {

    @Input() isLoading: boolean = false;

    constructor() {
    }

}
