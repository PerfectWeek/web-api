import {Group} from "../../model/entity/Group";


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

    public static formatGroupRecap(group: Group): any {
        return {
            id: group.id,
            name: group.calendar.name,
            nb_members: group.calendar.nbOwners
        }
    }
}
