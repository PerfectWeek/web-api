import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../../middleware/loggedOnly";
import * as SearchController from "../../../controllers/SearchController";

const router = Router();

router.get("/", AsyncHandler(loggedOnly), AsyncHandler(SearchController.searchUser));

export default router;
