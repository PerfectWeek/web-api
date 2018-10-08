//
// Created by benard_g on 2018/10/08
//

import {Router} from "express";
import * as AsyncHandler from 'express-async-handler';
import {loggedOnly} from "../../middleware/loggedOnly";
import * as GroupController from "../../controllers/GroupController";

const router = Router();

router.post('/', AsyncHandler(loggedOnly), AsyncHandler(GroupController.createGroup));

export default router;
