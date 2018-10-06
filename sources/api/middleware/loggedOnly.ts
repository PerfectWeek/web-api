//
// Created by alif_m on 2018/06/02
//

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

import {User} from "../../model/entity/User";
import {ApiException} from "../../utils/apiException";
import {DbConnection} from "../../utils/DbConnection";


//
// Check if the requesting user is authenticated
//
export async function loggedOnly(req: Request, res: Response, next: Function) {

    // Check token presence
    const token = <string>req.headers["access-token"];
    if (!token)
        throw new ApiException(401, "You need to be authenticated to perform this action");

    // Verify token
    let decoded;
    try {
        decoded = <any>jwt.verify(token, process.env.JWT_ENCODE_KEY);
    } catch (error) {
        throw new ApiException(401, "Invalid authentication token");
    }

    // Find the corresponding User
    const conn = await DbConnection.getConnection();
    const userRepository = conn.getRepository(User);
    const user: User = await userRepository.findOne(decoded.id);
    if (!user)
        throw new ApiException(401, "Authentication failed");

    // Add the user to the Request and continue the pipeline
    (<any>req).user = user;
    next();
}


//
// Helper
//
export function getRequestingUser(req: Request): User {
    return (<any>req).user;
}
