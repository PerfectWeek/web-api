import { Router }        from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly }       from "../../middleware/loggedOnly";
import * as EventController from "../../controllers/EventController";
import * as multer          from "multer";

const image_upload: multer.Instance = multer({dest: "/tmp/event"});

const router = Router();

router.get("/:event_id", AsyncHandler(loggedOnly), AsyncHandler(EventController.getEventInfo));

router.get("/:event_id/attendees", AsyncHandler(loggedOnly), AsyncHandler(EventController.getEventAttendees));

router.post("/:event_id/invite-users", AsyncHandler(loggedOnly), AsyncHandler(EventController.inviteUsersToEvent));

router.post("/:event_id/upload-image",
    AsyncHandler(loggedOnly),
    AsyncHandler(image_upload.single("image")),
    AsyncHandler(EventController.uploadEventImage));

router.get("/:event_id/image", AsyncHandler(loggedOnly), AsyncHandler(EventController.getEventImage));

router.put("/:event_id", AsyncHandler(loggedOnly), AsyncHandler(EventController.editEvent));

router.delete("/:event_id", AsyncHandler(loggedOnly), AsyncHandler(EventController.deleteEvent));

export default router;
