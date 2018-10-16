export class UserValidator {
    static pseudo_regex = new RegExp(/^[a-zA-Z0-9_-]{2,31}$/);
    static email_regex = new RegExp(/\w+(?:\.\w+)*@\w+(?:\.\w+)+/);
}