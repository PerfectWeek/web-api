import {Request, Response} from "express";
import {Connection} from "typeorm";

import {getRequestingUser} from "../middleware/loggedOnly";
import {removeDuplicates} from "../../utils/removeDuplicates";
import {removeIfExists} from "../../utils/removeIfExists";
import {DbConnection} from "../../utils/DbConnection";
import {Group} from "../../model/entity/Group";
import {User} from "../../model/entity/User";
import {ApiException} from "../../utils/apiException";
import {GroupView} from "../views/GroupView";
import {Calendar} from "../../model/entity/Calendar";


//
// Create a new Group and its associated Calendar
//
export async function createGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupName: string = req.body.name;
    const groupDescription = req.body.description || "";
    if (!groupName) {
        throw new ApiException(400, "Bad request");
    }

    const groupMembersPseudos = makeGroupMemberNamesList(req.body.members || [], requestingUser.pseudo);

    const conn = await DbConnection.getConnection();

    // Make sure all members exist
    const groupMembers = await getAllUsers(conn, groupMembersPseudos);
    groupMembers.push(requestingUser);

    // Create Calendar
    const calendar = new Calendar(groupName);
    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields for Calendar");
    }
    const createdCalendar = await Calendar.createCalendar(conn, calendar, groupMembers);

    // Create Group
    const group = new Group(groupDescription, createdCalendar);
    const createdGroup = await conn.manager.save(group);

    return res.status(201).json({
        message: "Group created",
        group: GroupView.formatGroup(createdGroup)
    });
}

function makeGroupMemberNamesList(members: string[], requestingUserPseudo: string): string[] {
    members = removeDuplicates(members);
    members = removeIfExists(members, requestingUserPseudo);
    return members;
}

async function getAllUsers(conn: Connection, memberPseudo: string[]): Promise<User[]> {
    const userPromises = memberPseudo.map(memberPseudo => getOneUser(conn, memberPseudo));
    return Promise.all(userPromises);
}

async function getOneUser(conn: Connection, pseudo: string): Promise<User> {
    const user = await User.findByPseudo(conn, pseudo);

    if (!user) {
        throw new ApiException(404, `User "${pseudo}" not found`);
    }

    return user;
}


//
// Get information about a Group
//
export async function groupInfo(req: Request, res: Response) {
    return res.status(200);
    // const requestingUser = getRequestingUser(req);
    // const groupId = req.params.group_id;
    //
    // const conn = await DbConnection.getConnection();
    // const groupToUserRepository = conn.getRepository(GroupsToUsers);
    // const groupMember = await GroupsToUsers.getRelation(groupToUserRepository, groupId, requestingUser.id);
    // if (!groupMember) {
    //     throw new ApiException(403, "Group not accessible");
    // }
    //
    // const groupRepository = conn.getRepository(Group);
    // const group = await Group.getGroupInfo(groupRepository, groupId);
    // if (!group) {
    //     throw new ApiException(404, "Group not found");
    // }
    //
    // res.status(200).json({
    //     message: "OK",
    //     group: GroupView.formatGroup(group)
    // });
}


//
// Edit a Group
//
export async function editGroup(req: Request, res: Response) {
    // TODO
    return res.status(200).json({
        message: "OK",
        group: {
            id: 12,
            name: "Perfect Group",
            nb_members: 4
        }
    });
}


//
// Delete a Group
//
export async function deleteGroup(req: Request, res: Response) {
    return res.status(200);
    // const requestingUser = getRequestingUser(req);
    // const groupId = req.params.group_id;
    //
    // const conn = await DbConnection.getConnection();
    // const groupToUserRepository = conn.getRepository(GroupsToUsers);
    // const groupMember = await GroupsToUsers.getRelation(groupToUserRepository, groupId, requestingUser.id);
    //
    // if (!groupMember
    //     || groupMember.role !== Role.Admin) {
    //     throw new ApiException(403, "You are not allowed to delete this Group");
    // }
    //
    // const groupRepository = conn.getRepository(Group);
    // await Group.deleteGroup(groupRepository, groupToUserRepository, groupId);
    //
    // res.status(200).json({
    //     message: "Group successfully deleted"
    // });
}


//
// Get members of a Group
//
export async function getMembers(req: Request, res: Response) {
    // TODO
    return res.status(200).json({
        message: "OK",
        members: [
            {
                pseudo: "Michel",
                role: "Admin"
            },
            {
                pseudo: "Nicolas",
                role: "Admin"
            },
            {
                pseudo: "Damien",
                role: "Spectator"
            },
            {
                pseudo: "Henri",
                role: "Spectator"
            }
        ]
    });
}


//
// Add a User to a Group
//
export async function addUsersToGroup(req: Request, res: Response) {
    // TODO
    return res.status(200).json({
        message: "OK",
        members: [
            {
                pseudo: "Michel",
                role: "Admin"
            },
            {
                pseudo: "Corentin",
                role: "Spectator"
            },
            {
                pseudo: "Nicolas",
                role: "Admin"
            },
            {
                pseudo: "Damien",
                role: "Spectator"
            },
            {
                pseudo: "Henri",
                role: "Spectator"
            }
        ]
    });
}


//
// Edit User status in a Group
//
export async function editUserStatus(req: Request, res: Response) {
    // TODO
    return res.status(200).json({
        message: "OK",
        member: {
            pseudo: "Damien",
            role: "Admin"
        }
    });
}


//
// Remove Users from a Group
//
export async function kickUserFromGroup(req: Request, res: Response) {
    // TODO
    return res.status(200).json({
        message: "OK",
        members: [
            {
                pseudo: "Michel",
                role: "Admin"
            },
            {
                pseudo: "Damien",
                role: "Spectator"
            },
            {
                pseudo: "Henri",
                role: "Spectator"
            }
        ]
    });
}

// TODO See if we keep this route
export async function getGroupCalendar(req: Request, res: Response) {
    return res.status(200).json({
        message: "OK",
        calendar: {
            id: 4,
            name: "Groupe Travail"
        }
    });
}