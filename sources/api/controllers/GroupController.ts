//
// Created by benard-g on 2018/10/08
//

import {Response, Request} from "express";
import {Repository} from "typeorm";
import {getRequestingUser} from "../middleware/loggedOnly";
import {removeDuplicates} from "../../utils/removeDuplicates";
import {removeIfExists} from "../../utils/removeIfExists";
import {DbConnection} from "../../utils/DbConnection";
import {Group} from "../../model/entity/Group";
import {User} from "../../model/entity/User";
import {ApiException} from "../../utils/apiException";
import {GroupView} from "../views/GroupView";

export async function createGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupName = (req.body.name || "").trim();
    let groupMemberNames = req.body.members;
    groupMemberNames = removeDuplicates(groupMemberNames);
    groupMemberNames = removeIfExists(groupMemberNames, requestingUser.pseudo);

    const conn = await DbConnection.getConnection();
    const userRepository = conn.getRepository(User);

    const userPromises = groupMemberNames.map((memberPseudo: string) => {
        return getUser(userRepository, memberPseudo);
    });

    let groupMembers: User[] = <any[]>(await Promise.all(userPromises));
    groupMembers.push(requestingUser);

    const group = new Group(groupName, requestingUser.id, groupMembers);
    if (!group.isValid()) {
        throw new ApiException(400, "Invalid fields in Group");
    }

    const createdGroup = await conn.manager.save(group);

    return res.status(201).json({
        message: "Group created",
        group: GroupView.formatGroup(createdGroup)
    });
}

async function getUser(userRepository: Repository<User>, pseudo: string) : Promise<User> {
    const user = await userRepository.findOne({pseudo: pseudo});

    if (!user) {
        throw new ApiException(404, "User '" + pseudo + "' not found");
    }

    return user;
}
