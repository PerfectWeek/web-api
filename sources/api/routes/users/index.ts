//
// Created by benard_g on 2018/06/03
//

import { Router } from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../controllers/UserController';

const router = Router();

router.post('/', AsyncHandler(UserController.createUser));

router.get('/:pseudo', AsyncHandler(UserController.getUser));

export default router;
