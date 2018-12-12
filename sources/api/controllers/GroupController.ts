import { Request, Response } from "express";
import { Connection }        from "typeorm";

import { getRequestingUser } from "../middleware/loggedOnly";
import { removeDuplicates }  from "../../utils/removeDuplicates";
import { removeIfExists }    from "../../utils/removeIfExists";
import { DbConnection }      from "../../utils/DbConnection";
import { Group }             from "../../model/entity/Group";
import { User }              from "../../model/entity/User";
import { ApiException }      from "../../utils/apiException";
import { GroupView }         from "../views/GroupView";
import { Calendar }          from "../../model/entity/Calendar";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";


//
// Create a new Group and its associated Calendar
//
export async function createGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupName: string = req.body.name;
    const groupDescription: string = req.body.description || "";
    if (!groupName) {
        throw new ApiException(400, "Bad request");
    }

    const groupMembersPseudos = makeGroupMemberNamesList(
        req.body.members || [],
        requestingUser.pseudo
    );

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
    const requestingUser = getRequestingUser(req);

    const groupId: number = req.params.group_id;

    const conn = await DbConnection.getConnection();

    // Get the requested Group
    const group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner = await CalendarsToOwners.findCalendarRelation(conn, group.calendar.id, requestingUser.id);
    if (!calendarToOwner) {
        throw new ApiException(403, "Group not accessible");
    }

    return res.status(200).json({
        message: "OK",
        group: GroupView.formatGroup(group)
    });
}


//
// Edit a Group
//
export async function editGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupId: number = req.params.group_id;
    // Get Group fields to edit
    const newGroupName: string = req.body.name;
    const newGroupDescription: string = req.body.description;
    if (!newGroupName || !newGroupDescription) {
        throw new ApiException(400, "Bad request");
    }

    const conn = await DbConnection.getConnection();

    // Check if the Group exists
    const group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User has the rights to edit this Group
    const userInGroup = await CalendarsToOwners.findCalendarRelation(conn, group.calendar.id, requestingUser.id);
    if (!userInGroup) {
        throw new ApiException(403, "Group not accessible");
    }

    // Apply modifications
    group.calendar.name = newGroupName;
    group.description = newGroupDescription;
    if (!group.calendar.isValid()) {
        throw new ApiException(400, "Invalid fields in group");
    }

    // Update the group
    const updatedGroup = await conn.manager.save(group);
    updatedGroup.calendar = await conn.manager.save(group.calendar);

    return res.status(200).json({
        message: "OK",
        group: GroupView.formatGroup(updatedGroup)
    });
}


//
// Delete a Group
//
export async function deleteGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupId: number = req.params.group_id;

    const conn = await DbConnection.getConnection();

    // Check if the Group exists and if the requesting User belongs to it
    const calendarToOwner = await CalendarsToOwners.findGroupRelation(conn, groupId, requestingUser.id);
    if (!calendarToOwner) {
        throw new ApiException(403, "Action not allowed");
    }

    await Group.deleteById(conn, groupId);

    return res.status(200).json({
        message: "Group successfully deleted"
    });
}


//
// Get members of a Group
//
export async function getMembers(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    const groupId: number = req.params.group_id;

    const conn = await DbConnection.getConnection();

    // Check if the Group exists and if the requesting User belongs to it
    const calendarToOwner = await CalendarsToOwners.findGroupRelation(conn, groupId, requestingUser.id);
    if (!calendarToOwner) {
        throw new ApiException(403, "Action not allowed");
    }

    // TODO: Put this in the View once we manage roles
    const members: any[] = (await Calendar.getCalendarOwners(conn, calendarToOwner.calendar_id))
        .map((calToOwn: CalendarsToOwners) => {
            return {
                pseudo: calToOwn.owner.pseudo,
                role: "Admin"
            };
        });

    return res.status(200).json({
        message: "OK",
        members
    });
}


//
// Add a User to a Group
//
export async function addUsersToGroup(req: Request, res: Response) {

    const requestingUser = getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;
    const newUserPseudos: string[] = req.body.users;

    // Check if user lists is properly defined
    if (!newUserPseudos || !Array.isArray(newUserPseudos) || newUserPseudos.length == 0) {
        throw new ApiException(400, "Invalid users argument");
    }

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Recover User instances for all pseudos
    const newUsers: User[] = await Promise.all<User>(newUserPseudos.map((pseudo: string) => {
        return User.findByPseudo(conn, pseudo);
    }));

    if (newUsers.indexOf(undefined) !== -1) {
        throw new ApiException(404, `User ${newUserPseudos[newUsers.indexOf(undefined)]} not found`);
    }

    // Get the requested Group
    const group: Group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(conn, group.calendar.id, requestingUser.id);
    if (!calendarToOwner) {
        throw new ApiException(403, "Group not accessible");
    }

    const ctos: CalendarsToOwners[] = await CalendarsToOwners.findUsersPresence(conn, group.calendar.id, newUsers);
    if (ctos.length != 0) {
        throw new ApiException(409, `Users [${
            ctos.map((cto: CalendarsToOwners) => newUsers[
                newUsers.findIndex((val: User) => val.id === cto.owner_id)
                ].pseudo)
            }] are already members of the group`);
    }

    await Calendar.addUsers(conn, group.calendar.id, newUsers);

    // TODO: Put this in the View once we manage roles
    const members: any[] = (await Calendar.getCalendarOwners(conn, group.calendar.id))
        .map((calToOwn: CalendarsToOwners) => {
            return {
                pseudo: calToOwn.owner.pseudo,
                role: "Admin"
            };
        });

    return res.status(200).json({
        message: "OK",
        members
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
// Remove a User from a Group
//
export async function kickUserFromGroup(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;
    const userPseudo: string = req.params.user_pseudo;

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Get the requested Group
    const group: Group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(conn, group.calendar.id, requestingUser.id);
    if (!calendarToOwner) {
        throw new ApiException(403, "Group not accessible");
    }

    // Recover user to remove
    const rm_user: User = await User.findByPseudo(conn, userPseudo);

    // Check if user is a member of specified group
    const rm_cto: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(conn, group.calendar.id, rm_user.id);
    if (!rm_cto) {
        throw new ApiException(404, `User ${rm_user.pseudo} is not a member of the group`);
    }

    // Remove user from calendar
    await Calendar.removeUser(conn, group.calendar.id, rm_user);

    // TODO: Put this in the View once we manage roles
    const members: any[] = (await Calendar.getCalendarOwners(conn, group.calendar.id))
        .map((calToOwn: CalendarsToOwners) => {
            return {
                pseudo: calToOwn.owner.pseudo,
                role: "Admin"
            };
        });

    return res.status(200).json({
        message: "OK",
        members
    });
}
