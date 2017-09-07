import {TodayOrTomorrowPipe} from "./today-or-tomorrow";
import * as moment from 'moment';


describe("TodayOrTomorrowPipe", () => {

    describe("transform", () => {
        let pipe: TodayOrTomorrowPipe;

        beforeEach(() => {
            pipe = new TodayOrTomorrowPipe();
        })

        it("should be right title based on moment day",()=>{
            expect("Today").toEqual(pipe.transform(moment()));
            expect("Tomorrow").toEqual(pipe.transform(moment().add(1,'day')));
            expect("No Tomorrow or Today").toEqual(pipe.transform(moment().add(2,'day')));
        })
    })
})