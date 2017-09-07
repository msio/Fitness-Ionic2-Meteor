import {Component, Input} from '@angular/core';

@Component({
    selector: 'position-bar',
    templateUrl: 'position-bar.html'
})
export class PositionBarComponent {

    @Input() currentPositionMode: boolean;
    @Input() positionDescription: string;
    @Input() isLoadingPosition:boolean;


    constructor() {
    }



}
