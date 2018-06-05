//
// Created by alif_m on 2018/06/02
//

import {Router} from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../../controllers/users';

const router = Router();

router.post('/', AsyncHandler(UserController.login));

export default router;
