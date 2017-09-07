import {Injectable, Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';

@Pipe({
    name: 'todayOrTomorrow'
})
@Injectable()
export class TodayOrTomorrowPipe implements PipeTransform {

    transform(value: Moment, args?: any[]): string {
        const today = moment();
        if (value.isSame(today,'day')) {
            return 'Today';
        }
        if (value.subtract(1, 'days').isSame(today,'day')) {
            return 'Tomorrow';
        }
        return 'No Tomorrow or Today';
    }
}
