//
// Created by benard-g on 2018/10/08
//

import {Group} from "../../model/entity/Group";
import {UserView} from "./UserView";

export class GroupView {

    public static formatGroup(group: Group): any {
        const ownerIdx = group.members.findIndex(member => member.id == group.owner.id);
        return {
            id: group.id,
            name: group.name,
            owner: UserView.formatPublicUser(group.members[ownerIdx]),
            members: group.members.map(UserView.formatPublicUser)
        };
    }

    public static formatGroupRecap(group: Group): any {
        return {
            id: group.id,
            name: group.name
        }
    }
}
