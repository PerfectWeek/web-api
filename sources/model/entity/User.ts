//
// Created by benard-g on 2018/09/03
//

import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";
import {Encrypt} from "../../utils/encrypt";
import {ApiException} from "../../utils/apiException";

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 31})
    @Index({unique: true})
    pseudo: string;

    @Column()
    @Index({unique: true})
    email: string;

    @Column({name: "ciphered_password"})
    cipheredPassword: string;

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;

    @Column({name: "updated_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    updatedAt: Date;


    public constructor(pseudo: string, email: string, ciphered_password: string) {
        this.pseudo = pseudo;
        this.email = email;
        this.cipheredPassword = ciphered_password;
    }

    // Validators
    private static pseudo_regex = new RegExp(/^[a-zA-Z0-9_-]{2,42}$/);
    private static email_regex = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_.]*@[a-zA-Z][a-zA-Z0-9-_]*(?:\.[a-zA-Z]{2,4})+$/);

    //
    // Check if a User satisfies the basic rules (pseudo format, email format, ...)
    //
    public isValid() : boolean {
        return User.pseudo_regex.test(this.pseudo)
            && User.email_regex.test(this.email);
    }

    //
    // Check if the given password is valid for this User
    //
    public async checkPassword(password: string): Promise<boolean> {
        return await Encrypt.matchPassword(password, this.cipheredPassword);
    }

    //
    // Cipher the given password
    //
    public static async cipherPassword(password: string) : Promise<string> {
        if (password.length < 8)
            throw new ApiException(403, "Password must be at least 8 characters long");
        return Encrypt.hashPassword(password);
    }
}
