//
// Created by alif_m on 2018/06/02
//

import {error} from "util";

export class ApiException extends Error {
    public code: number;

    constructor(errorCode: number, m: string) {
        super(m);
        this.code = errorCode;
    }
};
