export class ArrayUtil {

    static move(targetArray: Array<any>, indexFrom:number, indexTo:number) {
        let targetElement: any = targetArray[indexFrom];
        let magicIncrement: any = (indexTo - indexFrom) / Math.abs(indexTo - indexFrom);
        for (let elem = indexFrom; elem != indexTo; elem += magicIncrement) {
            targetArray[elem] = targetArray[elem + magicIncrement];
        }
        targetArray[indexTo] = targetElement;
    }
}