//
// Created by benard_g on 2018/06/03
//

import { Request, Response } from 'express';

import { UserModel, User } from "../models/User";

//
// Create a new User and save it in the DataBase
//
export async function createUser(req: Request, res: Response) {
    const user: User = new User(
        req.body.pseudo,
        req.body.email,
        User.hashPassword(req.body.password)
    );
    if (!user.isValid())
        return res.status(400).json({
            message: "Invalid fields in User"
        });

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

    return res.status(200).json({
        message: "OK",
        user: { // TODO: Create a view
            id: user.id,

            pseudo: user.object.pseudo,
            email: user.object.email,

            created_at: user.created_at,
            updated_at: user.updated_at
        }
    });
}
