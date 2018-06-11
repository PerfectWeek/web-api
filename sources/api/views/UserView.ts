//
// Created by benard_g on 2018/06/09
//

import { User } from "../models/UserModel";

export class UserView {
    public static formatUser(user: User): any {
        return {
            pseudo: user.pseudo,
            email: user.email
        };
    }
}
