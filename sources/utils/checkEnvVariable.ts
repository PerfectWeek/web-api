//
// Created by benard_g on 2018/06/08
//

export function checkEnvVariable(name: string): void {
    if (!process.env[name])
        throw new Error("You must set the environment variable \""
            + name
            + "\" to a valid value");
}
