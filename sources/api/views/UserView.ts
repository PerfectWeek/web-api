import { User } from "../../model/entity/User";
import { PendingUser } from "../../model/entity/PendingUser";
import {Group} from "../../model/entity/Group";
import {GroupView} from "./GroupView";

export class UserView {
    //
    // Format user information
    //
    public static formatUser(user: User): any {
        return {
            pseudo: user.pseudo,
            email: user.email,
            providers: {
                facebook: user.facebookProviderPayload !== null,
                google: user.googleProviderPayload !== null
            }
        };
    }

    public static formatPendingUser(user: PendingUser): any {
        return {
            pseudo: user.pseudo,
            email: user.email
        };
    }

    //
    // Format user information for someone else
    //
    public static formatPublicUser(user: User): any {
        return {
            pseudo: user.pseudo
        }
    }

    public static formatPublicUserList(userList: User[]): any {
        return userList.map(this.formatPublicUser);
    }

    public static formatUserGroupList(groups: Group[]) : any {
        return groups.map(GroupView.formatGroupRecap);
    }
}
