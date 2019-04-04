import { TimeSlot } from "../../../utils/TimeSlot";
import { TimeSlotView } from "./TimeSlotView";

export class TimeSlotListView {

    public static formatTimeSlotList(slotList: TimeSlot[]): any {
        return slotList.map(TimeSlotView.formatTimeSlot);
    }
}
