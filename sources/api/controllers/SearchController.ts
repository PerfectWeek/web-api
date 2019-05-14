import { Request, Response } from "express";

import { ApiException } from "../../utils/apiException";
import { DbConnection } from "../../utils/DbConnection";
import { User } from "../../model/entity/User";
import { UserView } from "../views/UserView";

export async function searchUser(req: Request, res: Response) {

    const query: string = req.query.q || "";
    const page_size: number = req.query.page_size || 10;
    const page_number: number = req.query.page_number || 1;

    if (page_size <= 0 || page_size > 20 || page_number <= 0) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    const users = await User.searchByPseudo(conn, query, page_size, page_number);

    return res.status(200).json({
        message: "OK",
        users: UserView.formatPublicUserList(users)
    });
}
