import {NativeGeocoderReverseResult} from "@ionic-native/native-geocoder";
import {isDefined} from "ionic-angular/util/util";
export class GeoUtil {

    static concatGeocodeResult(result: NativeGeocoderReverseResult) {
        if (isDefined(result.street)) {
            const houseNumber = isDefined(result.houseNumber) ? result.houseNumber + ', ' : '';
            const city = isDefined(result.city) ? result.city : '';
            return result.street + ' ' + houseNumber + city;
        }
        return '';
    }
}