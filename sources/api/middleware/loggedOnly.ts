//
// Created by alif_m on 2018/06/02
//

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

import {User, UserModel} from "../models/UserModel";
import {ApiException} from "../../utils/apiException";
import {DbObject} from "../../utils/db";

//
// Check if the requesting user is authenticated
//
export async function loggedOnly(req: Request, res: Response, next: Function) {
    // Check token presence
    const token = <string>req.headers["access-token"];
    if (!token)
        throw new ApiException(400, "You need to be authenticated to access this resource");

    // Verify token
    let decoded;
    try {
        decoded = <any>jwt.verify(token, process.env.JWT_ENCODE_KEY);
    } catch (error) {
        throw new ApiException(400, error.message);
    }

    // Retrieve requesting User
    const user = await UserModel.getOneById(decoded.id);
    if (!user)
        throw new ApiException(401, "Authentication failed");

    // Continue the request
    (<any>req).user = user;
    next();
}

//
// Helper
//
export function getRequestingUser(req: Request): DbObject<User> {
    return (<any>req).user;
}
