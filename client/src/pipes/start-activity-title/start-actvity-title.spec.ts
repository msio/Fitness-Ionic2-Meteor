import {StartActivityTitlePipe} from './start-activity-title'

describe('StartActivityTitlePipe',()=>{

    describe("transform",()=>{
        let pipe:StartActivityTitlePipe;
        beforeEach(()=>{
            pipe = new StartActivityTitlePipe()
        })

        it("should be title based on duration 0 or > 0",()=>{
            expect("Start Activity").toEqual(pipe.transform(0))
            expect("Start Activity between").toEqual(pipe.transform(5))
            expect("Start Activity between").toEqual(pipe.transform(1))
        })
    })
})