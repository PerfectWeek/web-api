//
// Created by benard_g on 2018/06/09
//

import { User } from "../../model/entity/User";
import { PendingUser } from "../../model/entity/PendingUser";

export class UserView {
    //
    // Format user information
    //
    public static formatUser(user: User): any {
        return {
            pseudo: user.pseudo,
            email: user.email
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
}
