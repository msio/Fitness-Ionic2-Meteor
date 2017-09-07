import {Injectable, Pipe, PipeTransform} from "@angular/core";
import {LocationAddress} from "../../models/models";

@Pipe({
    name: 'locationAddress'
})

@Injectable()
export class LocationAddressPipe implements PipeTransform {

    transform(value: LocationAddress, args?: any): string {
        return value.postalCode + ' ' + value.street + ', ' + value.city
    }
}