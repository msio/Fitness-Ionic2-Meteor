import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {isDefined} from "ionic-angular/util/util";

@Pipe({
    name: 'userProfilePicture'
})

@Injectable()
export class UserProfilePicturePipe implements PipeTransform {

    transform(value: any, args?: any[]): string {
        if (isDefined(value) && value !== null) {
            if (value.picture === null) {
                return value.gender === 'male' ? 'assets/avatar-male.svg' : 'assets/avatar-female.svg';
            }
            return value.picture.url;
        }
        return '';
    }
}
