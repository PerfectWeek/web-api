//
// Created by benard_g on 2018/06/09
//

import { User } from "../../model/entity/User";
import { PendingUser } from "../../model/entity/PendingUser";

export class UserView {
    // TODO Remplace with generic types, but i don't know how
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
}
