import {Injectable, Pipe, PipeTransform} from "@angular/core";
import {isDefined} from "ionic-angular/util/util";
import {ImageUtil} from "../../util/image-util";

@Pipe({
    name: 'iconUrl'
})

@Injectable()
export class IconUrlPipe implements PipeTransform {

    transform(icon: { publicId: string, cloudName: string }, args?: any[]): string {
        if (isDefined(icon)) {
            return ImageUtil.buildIconUrl(icon.cloudName, icon.publicId);
        }
        return '';
    }
}