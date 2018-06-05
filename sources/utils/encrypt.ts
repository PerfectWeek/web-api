//
// Created by alif_m on 2018/06/02
//

import * as Bcrypt from 'bcrypt';

export class Encrypt {

    public static hashPassword(password: string): Promise<string> {
        return Bcrypt.hash(password, 10);
    }

    public static matchPassword(password: string, hash: string): Promise<boolean> {
        return Bcrypt.compare(password, hash);
    }
}
