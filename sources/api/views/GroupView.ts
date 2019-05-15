import { Group } from "../../model/entity/Group";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarRole } from "../../utils/types/CalendarRole";


export class GroupView {

    public static formatGroup(group: Group): any {
        return {
            id: group.id,
            name: group.calendar.name,
            description: group.description,
            nb_members: group.calendar.nbOwners,
            calendar_id: group.calendar.id
        };
    }

    public static formatGroupWithRole(group: Group, role: CalendarRole): any {
        return {
            ...GroupView.formatGroup(group),
            role: role
        };
    }

    public static formatGroupWithMembers(group: Group, members: CalendarsToOwners[]): any {
        return {
            ...GroupView.formatGroup(group),
            members: members.map(GroupView.formatGroupMember)
        };
    }

    public static formatGroupRecap(group: Group): any {
        return {
            id: group.id,
            name: group.calendar.name,
            nb_members: group.calendar.nbOwners
        };
    }

    public static formatGroupMember(cto: CalendarsToOwners): any {
        return {
            pseudo: cto.owner.pseudo,
            role: cto.role,
            confirmed: cto.confirmed
        };
    }
}
