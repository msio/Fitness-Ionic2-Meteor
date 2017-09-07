import {browser, by, element} from "protractor";
import {LOGIN_TOKEN} from "../src/constants/constants";

describe('Main',()=>{

    describe('LoginPage',()=>{

        beforeEach(()=>{
            browser.get('')
            browser.executeScript("window.localStorage.clear();");
        })

        it('should be on LoginPage',()=>{
            expect(element(by.tagName('page-login-type')).isPresent()).toBeTruthy()
        })
    })

})