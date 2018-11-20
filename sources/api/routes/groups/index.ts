//
// Created by benard_g on 2018/10/08
//

import {Router} from "express";
import * as AsyncHandler from 'express-async-handler';
import {loggedOnly} from "../../middleware/loggedOnly";
import * as GroupController from "../../controllers/GroupController";

const router = Router();

router.post('/', AsyncHandler(loggedOnly), AsyncHandler(GroupController.createGroup));

router.get('/:group_id', AsyncHandler(loggedOnly), AsyncHandler(GroupController.groupInfo));

router.put('/:group_id', AsyncHandler(loggedOnly), AsyncHandler(GroupController.editGroup));

router.delete('/:group_id', AsyncHandler(loggedOnly), AsyncHandler(GroupController.deleteGroup));

router.post('/:group_id/add-users', AsyncHandler(loggedOnly), AsyncHandler(GroupController.addUsersToGroup));

router.delete('/:group_id/kick-users', AsyncHandler(loggedOnly), AsyncHandler(GroupController.kickUsersFromGroup));

export default router;
