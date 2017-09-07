import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'startActivityTitle'
})
export class StartActivityTitlePipe implements PipeTransform {

    transform(value: number, args?: any[]): string {
        if (value === 0) {
            return 'Start Activity';
        }
        return 'Start Activity between';
    }
}
