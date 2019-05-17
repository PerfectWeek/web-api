import { Request, Response } from "express";
import { Connection } from "typeorm";
import * as B64 from "base64-img";
import * as Fs from "fs";

import { getRequestingUser } from "../middleware/loggedOnly";
import { removeDuplicatesWithGetter } from "../../utils/removeDuplicates";
import { removeIfExistsWithGetter } from "../../utils/removeIfExists";
import { DbConnection } from "../../utils/DbConnection";
import { Group } from "../../model/entity/Group";
import { User } from "../../model/entity/User";
import { ApiException } from "../../utils/apiException";
import { GroupView } from "../views/GroupView";
import { Calendar } from "../../model/entity/Calendar";
import { CalendarsToOwners } from "../../model/entity/CalendarsToOwners";
import { CalendarRole, calendarRoleFromString } from "../../utils/types/CalendarRole";

import { image as DEFAULT_IMAGE } from "../../../resources/images/group_default.json";
import { CalendarsToOwnersView } from "../views/CalendarsToOwnersView";


const MAX_FILE_SIZE: number = 2000000;


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

    const groupMembersPseudos: MemberDesc[] = makeGroupMemberNamesList(
        req.body.members || [],
        requestingUser.pseudo
    );

    const conn = await DbConnection.getConnection();

    // Make sure all members exist
    const groupMembers = await getAllUsers(conn, groupMembersPseudos);
    groupMembers.push({ user: requestingUser, role: CalendarRole.Admin });

    // Create Calendar
    const calendar = new Calendar(groupName);
    if (!calendar.isValid()) {
        throw new ApiException(400, "Invalid fields for Calendar");
    }
    const createdCalendar = await Calendar.createCalendar(conn, calendar, groupMembers, requestingUser.id);

    // Create Group
    const group = new Group(groupDescription, createdCalendar);
    const createdGroup = await conn.manager.save(group);

    return res.status(201).json({
        message: "Group created",
        group: GroupView.formatGroupWithMembers(createdGroup, createdCalendar.owners)
    });
}

type MemberDesc = {
    name: string,
    role: string
};

function makeGroupMemberNamesList(
    members: MemberDesc[],
    requestingUserPseudo: string
): MemberDesc[] {
    members = removeDuplicatesWithGetter(members, m => m.name);
    members = removeIfExistsWithGetter(members, requestingUserPseudo, m => m.name);
    return members;
}

type UserWithRole = {
    user: User,
    role: CalendarRole
}

async function getAllUsers(conn: Connection, members: MemberDesc[]): Promise<UserWithRole[]> {
    const userPromises = members.map(member => getOneUser(conn, member));
    return Promise.all(userPromises);
}

async function getOneUser(conn: Connection, member: MemberDesc): Promise<UserWithRole> {
    const user = await User.findByPseudo(conn, member.name);
    if (!user) {
        throw new ApiException(404, `User "${member.name}" not found`);
    }
    const role = calendarRoleFromString(member.role);
    if (!role) {
        throw new ApiException(400, `Invalid role "${member.role}"`);
    }

    return { user: user, role: role };
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
    const calendarToOwner = await CalendarsToOwners.findCalendarRelation(
        conn,
        group.calendar.id,
        requestingUser.id
    );
    if (!calendarToOwner) {
        throw new ApiException(403, "Group not accessible");
    }

    return res.status(200).json({
        message: "OK",
        group: GroupView.formatGroupWithRole(group, calendarToOwner.role)
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
    if (!userInGroup || userInGroup.role !== CalendarRole.Admin) {
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
        group: GroupView.formatGroupWithRole(updatedGroup, userInGroup.role)
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
    if (!calendarToOwner || calendarToOwner.role !== CalendarRole.Admin) {
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

    const members: CalendarsToOwners[] = await Calendar.getCalendarOwners(conn, calendarToOwner.calendar_id);

    return res.status(200).json({
        message: "OK",
        members: members.map(GroupView.formatGroupMember)
    });
}


//
// Add a User to a Group
//
export async function addUsersToGroup(req: Request, res: Response) {

    const requestingUser = getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;
    const newUsersToAdd: MemberDesc[] = req.body.users;

    // Check if user lists is properly defined
    if (!newUsersToAdd || !Array.isArray(newUsersToAdd) || newUsersToAdd.length == 0) {
        throw new ApiException(400, "Invalid users argument");
    }


    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Get the requested Group
    const group: Group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(
        conn, group.calendar.id, requestingUser.id
    );
    if (!calendarToOwner || calendarToOwner.role !== CalendarRole.Admin) {
        throw new ApiException(403, "Group not accessible");
    }

    // Make sure all users exist
    const newUsers = await fetchUsersToInvite(conn, newUsersToAdd);
    const missingUserIdx = newUsers.findIndex(u => !u.user);
    if (missingUserIdx !== -1) {
        throw new ApiException(404, `User ${newUsersToAdd[missingUserIdx].name} not found`);
    }

    // Check if some users are already in Group
    const ctos: CalendarsToOwners[] = await CalendarsToOwners.findUsersPresence(
        conn, group.calendar.id, newUsers.map(m => m.user)
    );
    if (ctos.length != 0) {
        const alreadyInPseudos: string[] = ctos.map(cto => {
            const idx = newUsers.findIndex(m => m.user.id === cto.owner_id);
            return newUsers[idx].user.pseudo;
        });
        throw new ApiException(409, `Users [${alreadyInPseudos}] are already members of the group`);
    }

    // Add users
    await Calendar.addUsers(
        conn,
        group.calendar.id,
        newUsers
    );

    const members = await Calendar.getCalendarOwners(conn, group.calendar.id);

    return res.status(200).json({
        message: "OK",
        group: GroupView.formatGroupWithMembers(group, members)
    });
}


async function fetchUsersToInvite(conn: Connection, members: MemberDesc[]): Promise<UserWithRole[]> {
    return Promise.all(members.map(m => fecthOneUser(conn, m)));
}

async function fecthOneUser(conn: Connection, member: MemberDesc): Promise<UserWithRole> {
    const user = await User.findByPseudo(conn, member.name);
    const role = calendarRoleFromString(member.role);
    if (!role) {
        throw new ApiException(400, `Invalid role "${role}"`);
    }

    return {
        user: user,
        role: role
    };
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
// Recover group image
//
export async function getGroupImage(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Get the requested Group
    const group: Group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(
        conn, group.calendar.id, requestingUser.id
    );
    if (!calendarToOwner) {
        throw new ApiException(403, "Group not accessible");
    }

    return res.status(200).json({
        message: "OK",
        image: group.image ? group.image.toString() : DEFAULT_IMAGE
    });
}

//
// Upload a form-data image and sets it as group image
//
export async function uploadGroupImage(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;
    const file: any = req.file;

    if (!file) {
        throw new ApiException(400, "File not found");
    }

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Get the requested Group
    const group: Group = await Group.findById(conn, groupId);
    if (!group) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if the requesting User can access this Group
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(
        conn, group.calendar.id, requestingUser.id
    );
    if (!calendarToOwner || calendarToOwner.role !== CalendarRole.Admin) {
        throw new ApiException(403, "Group not accessible");
    }

    // Check if max file size isn't exceeded
    if (file.size > MAX_FILE_SIZE) {
        throw new ApiException(413, "Image should not exceed 2MB");
    }

    // Convert to base64
    let b64: string;

    try {
        b64 = B64.base64Sync(file.path);
    } catch (e) {
        throw new ApiException(500, "Invalid image format");
    }

    // Delete file from filesystem
    Fs.unlinkSync(file.path);

    // Save new image as group image
    group.image = new Buffer(b64);
    const groupRepo = conn.getRepository(Group);

    await groupRepo.save(group);

    return res.status(200).json({
        message: "OK"
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
    const calendarToOwner: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(
        conn, group.calendar.id, requestingUser.id
    );
    if (!calendarToOwner
        || (calendarToOwner.role !== CalendarRole.Admin && requestingUser.pseudo !== userPseudo)) {
        throw new ApiException(403, "Group not accessible");
    }

    // Recover user to remove
    const rm_user: User = await User.findByPseudo(conn, userPseudo);

    // Check if user is a member of specified group
    const rm_cto: CalendarsToOwners = await CalendarsToOwners.findCalendarRelation(
        conn, group.calendar.id, rm_user.id
    );
    if (!rm_cto) {
        throw new ApiException(404, `User ${rm_user.pseudo} is not a member of the group`);
    }
    if (rm_cto.role === CalendarRole.Admin
        && rm_user.id === requestingUser.id) {
        throw new ApiException(403, "As an admin, you cannot remove yourself.");
    }

    // Remove user from calendar
    await Calendar.removeUser(conn, group.calendar.id, rm_user);

    const members = await Calendar.getCalendarOwners(conn, group.calendar.id);

    return res.status(200).json({
        message: "OK",
        group: GroupView.formatGroupWithMembers(group, members)
    });
}


//
// Get all group invites
//
export async function getAllInvites(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Fetch all pending invites
    const groupInvites = await CalendarsToOwners
        .fetchPendingRequestsForUserId(conn, requestingUser.id);

    return res.status(200).json({
        message: "OK",
        pending_invites: groupInvites.map(CalendarsToOwnersView.formatPendingInvite)
    });
}


//
// Accept a group invitation
//
export async function groupInviteAccept(req: Request, res: Response) {
    const requestingUser = await getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Retrieve relation
    const relation = await CalendarsToOwners.findCalendarRelation(conn, groupId, requestingUser.id);

    // Make sure that the relation is valid
    if (!relation) {
        throw new ApiException(403, "No existing invitation for this group");
    }
    if (relation.confirmed) {
        throw new ApiException(403, "Invitation already confirmed");
    }

    // Accept invite
    relation.confirmed = true;
    await CalendarsToOwners.acceptInvite(conn, relation.calendar_id, relation.owner_id);

    return res.status(200).json({
        message: "Invitation accepted"
    });
}


//
// Decline a group invitation
//
export async function groupInviteDecline(req: Request, res: Response) {
    const requestingUser = await getRequestingUser(req);

    // Recover arguments
    const groupId: number = req.params.group_id;

    // Recover Database connection
    const conn = await DbConnection.getConnection();

    // Retrieve relation
    const relation = await CalendarsToOwners.findCalendarRelation(conn, groupId, requestingUser.id);

    // Make sure that the relation is valid
    if (!relation) {
        throw new ApiException(403, "No existing invitation for this group");
    }
    if (relation.confirmed) {
        throw new ApiException(403, "Invitation already confirmed");
    }

    // Refuse invite
    await conn.getRepository(CalendarsToOwners).delete(relation);

    return res.status(200).json({
        message: "Invitation declined"
    });
}
