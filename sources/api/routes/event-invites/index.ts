import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as EventController from "../../controllers/EventController"


const router = Router();


router.get(
    "/",
    AsyncHandler(loggedOnly),
    AsyncHandler(EventController.getPendingInvites)
);


export default router;
