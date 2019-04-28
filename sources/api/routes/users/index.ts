//
// Created by benard_g on 2018/06/03
//

import { Router } from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../controllers/UserController';
import  { loggedOnly }     from "../../middleware/loggedOnly";
import * as multer         from "multer";

const image_upload: multer.Instance = multer({dest: "/tmp/user"});

const router = Router();

router.post('/', AsyncHandler(UserController.createUser));

router.get('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.getUser));

router.get('/:pseudo/calendars', AsyncHandler(loggedOnly), AsyncHandler(UserController.getUserCalendars));

router.get('/:pseudo/groups', AsyncHandler(loggedOnly), AsyncHandler(UserController.getUserGroups));

router.put('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.editUser));

router.post('/:pseudo/timezone', AsyncHandler(loggedOnly), AsyncHandler(UserController.setTimezone));

router.post('/:pseudo/upload-image',
    AsyncHandler(loggedOnly),
    AsyncHandler(image_upload.single("image")),
    AsyncHandler(UserController.uploadUserImage));

router.get('/:pseudo/image', AsyncHandler(loggedOnly), AsyncHandler(UserController.getUserImage));

router.delete('/:pseudo', AsyncHandler(loggedOnly), AsyncHandler(UserController.deleteUser));

export default router;
