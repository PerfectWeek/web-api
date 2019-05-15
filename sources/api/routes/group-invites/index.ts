import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as GroupController from "../../controllers/GroupController";


const router = Router();


router.get(
    "/",
    AsyncHandler(loggedOnly),
    AsyncHandler(GroupController.getAllInvites)
);

router.post(
    "/:group_id/accept-invite",
    AsyncHandler(loggedOnly),
    AsyncHandler(GroupController.groupInviteAccept)
);

router.post(
    "/:group_id/decline-invite",
    AsyncHandler(loggedOnly),
    AsyncHandler(GroupController.groupInviteDecline)
);


export default router;
