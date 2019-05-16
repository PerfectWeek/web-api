import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as FriendController from "../../controllers/FriendController";


const router = Router();


router.get(
    "/",
    AsyncHandler(loggedOnly),
    AsyncHandler(FriendController.getAllFriends)
);


export default router;
