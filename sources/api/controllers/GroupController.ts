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
import {GroupsToUsers} from "../../model/entity/GroupsToUsers";


//
// Create a new Group
//
export async function createGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupName = (req.body.name || "").trim();
    let groupMemberNames = req.body.members || [];
    groupMemberNames = removeDuplicates(groupMemberNames);
    groupMemberNames = removeIfExists(groupMemberNames, requestingUser.pseudo);

    const conn = await DbConnection.getConnection();
    const userRepository = conn.getRepository(User);

    const userPromises = groupMemberNames.map((memberPseudo: string) => {
        return getUser(userRepository, memberPseudo);
    });

    let groupMembers: User[] = <any[]>(await Promise.all(userPromises));
    groupMembers.push(requestingUser);

    const group = new Group(groupName, requestingUser, groupMembers);
    if (!group.isValid()) {
        throw new ApiException(400, "Invalid fields in Group");
    }

    const groupRepository = conn.getRepository(Group);
    const groupsToUsersRepository = conn.getRepository(GroupsToUsers);
    const createdGroup = await Group.createGroup(groupRepository, groupsToUsersRepository, group);

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


//
// Get information about a Group
//
export async function groupInfo(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);
    const groupId = req.params.group_id;

    const conn = await DbConnection.getConnection();
    const groupRepository = conn.getRepository(Group);
    const userRepository = conn.getRepository(User);
    const group = await Group.getGroupAndMembers(groupRepository, userRepository, groupId);

    if (!group
        || group.members.findIndex(member => member.id === requestingUser.id) < 0) {
        throw new ApiException(403, "Group not accessible");
    }

    res.status(200).json({
        message: "OK",
        group: GroupView.formatGroup(group)
    });
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
            owner: "Michel"
        }
    });
}


//
// Delete a Group
//
export async function deleteGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);
    const groupId = req.params.group_id;

    const conn = await DbConnection.getConnection();
    const groupRepository = conn.getRepository(Group);
    const group = await Group.getGroupInfo(groupRepository, groupId);

    if (!group
        || group.owner.id !== requestingUser.id) {
        throw new ApiException(403, "You are not allowed to delete this Group");
    }

    const groupsToUsersRepository = conn.getRepository(GroupsToUsers);
    await Group.deleteGroup(groupRepository, groupsToUsersRepository, group.id);

    res.status(200).json({
        message: "Group successfully deleted"
    });
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
export async function kickUsersFromGroup(req: Request, res: Response) {
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
