import {GroupsToUsers} from "../../model/entity/GroupsToUsers";


export class GroupsToUsersView {
    public static formatGroupInfo(groupToUser: GroupsToUsers) {
        return {
            group_id: groupToUser.group_id,
            role: groupToUser.role
        };
    }

    public static formatGroupInfoList(groupToUserList: GroupsToUsers[]) {
        return groupToUserList.map(g => this.formatGroupInfo(g));
    }
}
