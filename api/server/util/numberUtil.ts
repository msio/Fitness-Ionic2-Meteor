export class NumberUtil {
    current: number;

    constructor() {
        this.current = 1;
    }

    generate() {
        return this.current++;
    }
}