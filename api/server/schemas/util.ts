import {assert} from 'chai';

export class SimpleSchemaUtil {

    static isTrue(object: any, msg?: string) {
        assert.isUndefined(object, msg);
    }
}
