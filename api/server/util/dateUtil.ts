import * as moment from 'moment';
import {Moment} from 'moment';

export class DateUtil {

    static calcUserAge(birthday: Moment| Date): number {

        return moment().diff(birthday, 'years');
    }
}
