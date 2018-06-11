//
// Created by benard_g on 2018/06/03
//

import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken'

import { UserModel, User } from "../models/UserModel";
import {ApiException} from "../../utils/apiException";
import { UserView } from "../views/UserView";

//
// Log a user in and return token
//
export async function login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;
    const user = await UserModel.getOneByEmail(email);

    if (!user || !user.object.checkPassword(password))
        throw new ApiException(403, "Bad user or password");

    const token_payload = {id: user.id};
    const token = jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

    res.status(200).json({
        message: 'Authentication successful',
        access_token: token,
        user: UserView.formatUser(user.object)
    });
}

//
// Create a new User and save it in the DataBase
//
export async function createUser(req: Request, res: Response) {
    if (!req.body.pseudo || !req.body.password || !req.body.email) {
        throw new ApiException(400, "Invalid request");
    }
    const user: User = new User(
        req.body.pseudo,
        req.body.email,
        await User.hashPassword(req.body.password)
    );
    if (!user.isValid())
        throw new ApiException(400, "Invalid fields in User");

    await UserModel.createOne(user);

    return res.status(201).json({
        message: "User created"
    });
}

//
// Get information about a specific User
//
export async function getUser(req: Request, res: Response) {
    const user = await UserModel.getOneByPseudo(req.params.pseudo);

    if (!user)
        throw new ApiException(404, "User not found");

    return res.status(200).json({
        message: "OK",
        user: UserView.formatUser(user.object)
    });
}
