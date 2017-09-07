import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'constantTitle'
})
@Injectable()
export class ConstantTitlePipe implements PipeTransform {

    transform(value: string, args?: any): string {
        const constantType = args;
        for (let p in constantType) {
            if (constantType[p].value === value) {
                return constantType[p].title;
            }
        }
        return 'NO MAPPING FOUND';
    }
}
