//
// Created by benard-g on 2018/10/08
//

import {Group} from "../../model/entity/Group";

export class GroupView {

    public static formatGroup(group: Group): any {
        const ownerIdx = group.members.findIndex(member => member.id == group.owner.id);
        return {
            id: group.id,
            name: group.name,
            owner: group.members[ownerIdx].pseudo
        };
    }

    public static formatGroupRecap(group: Group): any {
        return {
            id: group.id,
            name: group.name
        }
    }
}
