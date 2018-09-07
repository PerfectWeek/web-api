//
// Created by alif on 2018/09/05
//

import { Router } from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../../controllers/UserController';
import {loggedOnly} from "../../../middleware/loggedOnly";

const router = Router();

router.put('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.editUser));

export default router;
