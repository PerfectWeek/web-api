import {Group} from "../../model/entity/Group";


export class GroupView {

    public static formatGroup(group: Group): any {
        return {
            id: group.id,
            name: group.name,
            nb_members: group.nbMembers
        };
    }

    public static formatGroupRecap(group: Group): any {
        return {
            id: group.id,
            name: group.name
        }
    }
}
