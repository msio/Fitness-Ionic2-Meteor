import {UserDataPasswordSchema} from "./user-register-schema";
import {assert, expect} from 'chai';
import {SimpleSchemaUtil}  from  '../util';

describe('UserRegisterSchema', () => {

    describe('UserDataSchema', () => {

        describe('PictureUserDataSchema', () => {

            it('should validate no picture', () => {
                // schema.isTrue(PictureUserDataForPasswordSchema.validate({picture: {data: {}, type: 'none'}}));
            });

            it('should validate valid url', () => {
                // schema.isTrue(PictureUserDataForPasswordSchema.validate({
                //     picture: {
                //         data: {value: 'http://www.facebook.com'},
                //         type: 'url'
                //     }
                // }));
            });

        });

        it('should pass user data password schema validation', () => {
            const userDataPassword = {
                email: 'test@gmail.com',
                password: {
                    digest: 'sdf4ff4dfdsfdsf',
                    algorithm: 'passAlgo'
                },
                profile: {
                    firstName: 'Michal',
                    lastName: 'Test',
                    gender: 'male',
                    birthday: '1950-10-25',
                    picture: {url: 'http://www.cloudinary.com/test', publicId: '43fdgfdgfdg', signature: 'dsfsdsdfdsf'}
                }
            }

            SimpleSchemaUtil.isTrue(UserDataPasswordSchema.validate(userDataPassword));
        });
    });

});
