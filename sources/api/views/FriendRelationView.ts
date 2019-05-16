import { FriendRelation } from "../../model/entity/FriendRelation";
import { FriendRequestStatus } from "../../utils/types/FriendRequestStatus";

import { UserView } from "./UserView";


export class FriendRelationView {

    public static formatFriendRequest(fr: FriendRelation, status: FriendRequestStatus): any {
        return {
            from_user: UserView.formatPublicUser(fr.requestingUser),
            status: status
        };
    }
}
