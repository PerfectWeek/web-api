//
// Created by benard_g on 2018/06/03
//

import {Request, Response} from 'express';
import * as jwt from 'jsonwebtoken'

import {User} from "../../model/entity/User";
import {ApiException} from "../../utils/apiException";
import {UserView} from "../views/UserView";
import {DbConnection} from "../../utils/DbConnection";
import { getRequestingUser } from '../middleware/loggedOnly';


//
// Delete user
//
export async function deleteUser(req: Request, res: Response) {
    let user: User = getRequestingUser(req);

    if (user.pseudo != req.params.pseudo) {
        return res.status(403).json({
            message: "Action not allowed"
        });
    }
    const conn = await DbConnection.getConnection();
    await conn.manager.remove(user);


    return res.status(200).json({
        message: "User deleted"
    });
}

//
// Edit a user's informations
//
export async function editUser(req: Request, res: Response) {
    let user: User = getRequestingUser(req);
    const old_pseudo = user.pseudo;

    if (user.pseudo !== req.params.pseudo) {
        throw new ApiException(403, "Action forbidden");
    }

    user.pseudo = req.body.pseudo || user.pseudo;
    user.email = req.body.email || user.email;

    if (!user.isValid()) {
        throw new ApiException(400, "Invalid fields in User");
    }

    const conn = await DbConnection.getConnection();

    if (old_pseudo !== user.pseudo
        && await conn.getRepository(User).findOne({where: {pseudo: user.pseudo}})) {
        throw new ApiException(400, "Invalid pseudo: already taken");
    }

    await conn.manager.save(user);

    return res.status(200).json({
        message: "User updated",
        user: UserView.formatUser(user)
    });
}

//
// Log a user in and return a session token
//
export async function login(req: Request, res: Response) {
    const conn = await DbConnection.getConnection();
    const userRepository = conn.getRepository(User);

    const email = req.body.email;
    const user = await userRepository.findOne({where: {email: email}});

    const password = req.body.password;
    if (!user || !await user.checkPassword(password))
        throw new ApiException(403, "Bad user or password");

    const token_payload = {id: user.id};
    const token = jwt.sign(token_payload, process.env.JWT_ENCODE_KEY);

    res.status(200).json({
        message: 'Authentication successful',
        access_token: token,
        user: UserView.formatUser(user)
    });
}

//
// Create a new User and save it in the DataBase
//
export async function createUser(req: Request, res: Response) {
    if (!req.body.pseudo || !req.body.password || !req.body.email)
        throw new ApiException(400, "Invalid request");

    const user: User = new User(
        req.body.pseudo,
        req.body.email,
        await User.cipherPassword(req.body.password)
    );
    if (!user.isValid())
        throw new ApiException(400, "Invalid fields in User");

    // Save the created User
    const conn = await DbConnection.getConnection();
    await conn.manager.save(user);

    return res.status(201).json({
        message: "User created",
        user: UserView.formatUser(user)
    });
}

//
// Get information about a specific User
//
export async function getUser(req: Request, res: Response) {
    const conn = await DbConnection.getConnection();
    const userRepository = conn.getRepository(User);
    const user = await userRepository.findOne({where: {pseudo: req.params.pseudo}});

    if (!user)
        throw new ApiException(404, "User not found");

    return res.status(200).json({
        message: "OK",
        user: UserView.formatUser(user)
    });
}
