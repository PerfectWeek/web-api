//
// Created by alif_m on 2018/06/02
//

export class ApiException extends Error {
    public code: number;

    constructor(errorCode: number, m: string) {
        super(m);
        this.code = errorCode;
    }
}
