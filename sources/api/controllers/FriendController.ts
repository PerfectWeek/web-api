import { Request, Response } from "express";

import { getRequestingUser } from "../middleware/loggedOnly";
import { User } from "../../model/entity/User";
import { DbConnection } from "../../utils/DbConnection";
import { ApiException } from "../../utils/apiException";
import { FriendRelation } from "../../model/entity/FriendRelation";
import { FriendRelationView } from "../views/FriendRelationView";
import { FriendRequestStatus } from "../../utils/types/FriendRequestStatus";
import { UserView } from "../views/UserView";


export async function inviteFriend(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Retrieve query parameters
    const pseudo: string = req.params.pseudo;

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // Fetch user to invite
    const userToInvite = await User.findByPseudo(conn, pseudo);
    if (!userToInvite) {
        throw new ApiException(404, `User "${pseudo}" does not exists`);
    }

    // Make sure there is not already an invite
    const sentRequest = await FriendRelation.findReceivedRequest(conn, requestingUser.id, userToInvite.id);
    const receivedRequest = await FriendRelation.findReceivedRequest(conn, userToInvite.id, requestingUser.id);
    if (sentRequest || receivedRequest) {
        throw new ApiException(400, "This friend request already exists");
    }

    // Create friend request
    const friendRequest = new FriendRelation(requestingUser.id, userToInvite.id, false);
    await conn.manager.save(friendRequest);


    return res.status(200).json({
        message: "Request sent"
    });
}


export async function getAllInvites(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // fetch all received invitations
    const receivedRequests = await FriendRelation.fetchAllReceivedRequests(
        conn, requestingUser.id
    );

    return res.status(200).json({
        message: "OK",
        friend_requests: receivedRequests.map(fr =>
            FriendRelationView.formatFriendRequest(fr, FriendRequestStatus.RECEIVED)
        )
    });
}


export async function getAllFriends(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // Fetch all friends
    const friends = await FriendRelation.fetchAllFriends(conn, requestingUser.id);

    return res.status(200).json({
        message: "OK",
        friends: friends.map(UserView.formatPublicUser)
    });
}


export async function getInviteStatus(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Retrieve query parameters
    const pseudo: string = req.params.pseudo;

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // Retrieve user
    const user = await User.findByPseudo(conn, pseudo);
    if (!user) {
        throw new ApiException(404, "User does not exist");
    }

    let inviteStatus: FriendRequestStatus = FriendRequestStatus.NONE;

    // Retrieve sentInvite
    const sentInvite = await FriendRelation.findReceivedRequest(conn, requestingUser.id, user.id);
    if (sentInvite) {
        inviteStatus = sentInvite.confirmed
            ? FriendRequestStatus.CONFIRMED : FriendRequestStatus.SENT;
    }
    else {
        const receivedInvite = await FriendRelation.findReceivedRequest(conn, user.id, requestingUser.id);
        if (receivedInvite) {
            inviteStatus = receivedInvite.confirmed
                ? FriendRequestStatus.CONFIRMED : FriendRequestStatus.RECEIVED;
        }
    }

    return res.status(200).json({
        message: "OK",
        status: inviteStatus
    });
}


export async function acceptInvite(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Retrieve query parameters
    const pseudo: string = req.params.pseudo;

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // Retrieve user
    const user = await User.findByPseudo(conn, pseudo);
    if (!user) {
        throw new ApiException(404, "User does not exist");
    }

    // Fetch friend request
    const friendRequest = await FriendRelation.findReceivedRequest(conn, user.id, requestingUser.id);
    if (!friendRequest) {
        throw new ApiException(404, "No existing friend request");
    }
    if (friendRequest.confirmed) {
        throw new ApiException(400, "Invitation already confirmed");
    }

    // Accept request
    await FriendRelation.acceptRequest(conn, user.id, requestingUser.id);

    return res.status(200).json({
        message: "Invitation accepted"
    });
}


export async function declineInvite(req: Request, res: Response) {
    const requestingUser = getRequestingUser(req);

    // Retrieve query parameters
    const pseudo: string = req.params.pseudo;

    // Acquire db connection
    const conn = await DbConnection.getConnection();

    // Retrieve user
    const user = await User.findByPseudo(conn, pseudo);
    if (!user) {
        throw new ApiException(404, "User does not exist");
    }

    // Fetch friend request
    const friendRequest = await FriendRelation.findReceivedRequest(conn, user.id, requestingUser.id);
    if (!friendRequest) {
        throw new ApiException(404, "No existing friend request");
    }
    if (friendRequest.confirmed) {
        throw new ApiException(400, "Invitation already confirmed");
    }

    // Decline request
    await conn.getRepository(FriendRelation).delete(friendRequest);

    return res.status(200).json({
        message: "Invitation declined"
    });
}
