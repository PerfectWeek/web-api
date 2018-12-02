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

router.get('/:group_id/members', AsyncHandler(loggedOnly), AsyncHandler(GroupController.getMembers));

router.post('/:group_id/add-members', AsyncHandler(loggedOnly), AsyncHandler(GroupController.addUsersToGroup));

router.put('/:group_id/members/:user_pseudo', AsyncHandler(loggedOnly), AsyncHandler(GroupController.editUserStatus));

router.post('/:group_id/members/:user_pseudo', AsyncHandler(loggedOnly), AsyncHandler(GroupController.kickUserFromGroup));

export default router;
