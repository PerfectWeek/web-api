import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as GoogleCalendarController from "../../controllers/GoogleCalendarController";

const router = Router();

router.post("/google-calendar/authorize", AsyncHandler(loggedOnly), AsyncHandler(GoogleCalendarController.authorizeGoogleCalendar));

router.get("/google-calendar/get-code", AsyncHandler(GoogleCalendarController.getCode));

router.get("/google-calendar/import", AsyncHandler(loggedOnly), AsyncHandler(GoogleCalendarController.importGoogleCalendar));

export default router;