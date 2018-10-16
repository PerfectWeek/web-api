import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";
import { Encrypt } from "../../utils/encrypt";
import { ApiException } from "../../utils/apiException";
import { UserValidator } from "../../utils/validator/UserValidator"

@Entity("pending_users")
export class PendingUser {

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

    @Column({name: "validation_uuid"})
    @Index({unique: true})
    validationUuid: string;

    @Column({name: "created_at", type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Date;


    public constructor(pseudo: string, email: string, ciphered_password: string, validation_uuid: string) {
        this.pseudo = pseudo;
        this.email = email;
        this.cipheredPassword = ciphered_password
        this.validationUuid = validation_uuid;
    }

    //
    // Check if a User satisfies the basic rules (pseudo format, email format, ...)
    //
    public isValid() : boolean {
        return UserValidator.pseudo_regex.test(this.pseudo)
            && UserValidator.email_regex.test(this.email);
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
