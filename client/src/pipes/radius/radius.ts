import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'radius'
})

@Injectable()
export class RadiusPipe implements PipeTransform {

    transform(value: number, args?: any[]): string {
        return value + ' km';
    }
}
