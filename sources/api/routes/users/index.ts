//
// Created by benard_g on 2018/06/03
//

import { Router } from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../controllers/UserController';
import  { loggedOnly } from "../../middleware/loggedOnly";

const router = Router();

router.post('/', AsyncHandler(UserController.createUser));

router.get('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.getUser));

router.put('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.editUser));

export default router;
