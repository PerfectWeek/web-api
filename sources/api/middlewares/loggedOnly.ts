//
// Created by alif_m on 2018/06/02
//

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

import {User, UserModel} from "../models/UserModel";
import {ApiException} from "../../utils/apiException";
import {DbObject} from "../../utils/db";

export function getRequestingUser(req: Request): DbObject<User> {
    return (<any>req).user;
}

export async function loggedOnly(req: Request, res: Response, next: Function) {
    const token = <string>req.headers["access-token"];
    if (!token)
        throw new ApiException(400, "You need to provide access-token");

    const decoded = <any>jwt.verify(token, process.env.JWT_ENCODE_KEY);
    const user = await UserModel.getOneById(decoded.id);

    if (!user)
        throw new ApiException(401, "Authentication failed");
    (<any>req).user = user;
    next();
}
