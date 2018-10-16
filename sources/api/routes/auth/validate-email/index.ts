import { Router } from "express";
import * as AsyncHandler from 'express-async-handler';

import * as UserController from '../../../controllers/UserController';

const router = Router();

router.get('/:uuid', AsyncHandler(UserController.confirmUserEmail));


export default router;
