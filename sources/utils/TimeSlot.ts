export class TimeSlot {
    start_time: Date;
    end_time: Date;
    score: number;

    constructor(start_time: Date, end_time: Date, score: number) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.score = score;
    }
}
