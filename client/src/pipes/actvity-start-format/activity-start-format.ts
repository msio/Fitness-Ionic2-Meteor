import {Injectable, Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {APP_TIME_FORMAT} from "../../constants/date-time-formats";

@Pipe({
    name: 'activityStartFormat'
})
@Injectable()
export class ActivityStartFormatPipe implements PipeTransform {

    transform(value: any, args?: any): string {
        const date = moment();
        const from: Moment = args === 'user' ? moment(value.activityStartFrom) : moment(value.from);
        const to: Moment = args === 'user' ? moment(value.activityStartTo) : moment(value.to);
        let dateName;
        if (from.isSame(date, 'day')) {
            dateName = 'Today';
        } else {
            dateName = 'Tomorrow';
        }
        let res = dateName + ', ' + from.format(APP_TIME_FORMAT);

        if (!from.isSame(to)) {
            res += ' - ' + to.format(APP_TIME_FORMAT);
        }
        return res;
    }
}
