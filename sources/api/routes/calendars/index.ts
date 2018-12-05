import { Router } from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly } from "../../middleware/loggedOnly";
import * as CalendarController from "../../controllers/CalendarController"

const router = Router();

router.post('/', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.createCalendar));

router.get('/:calendar_id', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.getCalendarInfo));

router.put('/:calendar_id', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.editCalendar));

router.post('/:calendar_id/events', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.createEvent));

router.get('/:calendar_id/events', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.getCalendarEvents));

router.delete('/:calendar_id', AsyncHandler(loggedOnly), AsyncHandler(CalendarController.deleteCalendar));

export default router;
