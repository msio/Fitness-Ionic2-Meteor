import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {

    transform(value: number, args?: any[]): string {
        if (isNaN(value)) {
            return '';
        }
        //input minutes
        if (value < 60) {
            return value + ' min';
        } else if (value % 60 == 0) {
            return value / 60 + ' h';
        }

        const h = Math.floor(value / 60);
        const m = value % 60;

        return h + ' h ' + m + ' min';
    }
}
