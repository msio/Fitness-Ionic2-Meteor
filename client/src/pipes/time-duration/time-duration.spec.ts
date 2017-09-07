import {TimeDurationPipe} from "./time-duration";

describe('TimeDurationPipe', ()=> {

    describe('transform', ()=> {
        let pipe: TimeDurationPipe;

        beforeEach(()=>{
             pipe = new TimeDurationPipe()
        })

        it('should properly format minutes under 60', ()=> {
            for (let m = 0; m < 60; m++) {
                expect(m + ' min').toEqual(pipe.transform(m));
            }
        });

        it('should properly format multiples of 60 minutes', ()=> {
            for (let m = 60; m < 300; m += 60) {
                expect(m / 60 + ' h').toEqual(pipe.transform(m));
            }
        });

        it('should properly format other minutes (minutes / 60) and to scale of 2 (with toFixed())', ()=> {
            expect('1 h 15 min').toEqual(pipe.transform(75));
            expect('1 h 30 min').toEqual(pipe.transform(90));
            expect('1 h 45 min').toEqual(pipe.transform(105));
            expect('3 h 20 min').toEqual(pipe.transform(200));
            expect('4 h 30 min').toEqual(pipe.transform(270));
        });

    });
});