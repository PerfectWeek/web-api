import { v4 } from 'uuid'

export class AccountVerification {
    public static generateLink(): string {
        return v4();
    }
}
