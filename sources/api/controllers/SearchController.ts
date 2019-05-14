import { Request, Response } from "express";

import { getRequestingUser } from "../middleware/loggedOnly";
import { ApiException } from "../../utils/apiException";
import { DbConnection } from "../../utils/DbConnection";
import { User } from "../../model/entity/User";
import { UserView } from "../views/UserView";

export async function searchUser(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const query: string = req.query.q || "";
    const limit: number = req.query.limit || 10;

    if (limit <= 0 || limit > 10) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    const users = await User.searchByPseudo(conn, query, limit);

    return res.status(200).json({
        message: "OK",
        users: UserView.formatPublicUserList(users)
    });
}
