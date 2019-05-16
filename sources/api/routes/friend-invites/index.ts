import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as FriendController from "../../controllers/FriendController";

const router = Router();


router.get(
    "/",
    AsyncHandler(loggedOnly),
    AsyncHandler(FriendController.getAllInvites)
);


router.get(
    "/:pseudo",
    AsyncHandler(loggedOnly),
    AsyncHandler(FriendController.getInviteStatus)
);


router.post(
    "/:pseudo/accept",
    AsyncHandler(loggedOnly),
    AsyncHandler(FriendController.acceptInvite)
);


router.post(
    "/:pseudo/decline",
    AsyncHandler(loggedOnly),
    AsyncHandler(FriendController.declineInvite)
);


export default router;
