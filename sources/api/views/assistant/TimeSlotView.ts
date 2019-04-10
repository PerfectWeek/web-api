import { TimeSlot } from "../../../utils/TimeSlot";

export class TimeSlotView {

    public static formatTimeSlot(slot: TimeSlot): any {
        return {
            start_time: slot.start_time,
            end_time: slot.end_time,
            score: slot.score.toFixed(2)
        };
    }
}
