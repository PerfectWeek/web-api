import { Router }        from "express";
import * as AsyncHandler from "express-async-handler";

import { loggedOnly }       from "../../middleware/loggedOnly";
import * as GroupController from "../../controllers/GroupController";
import * as multer          from "multer";

const image_upload: multer.Instance = multer({dest: "/tmp/group"});

const router = Router();

router.post("/", AsyncHandler(loggedOnly), AsyncHandler(GroupController.createGroup));

router.get("/:group_id", AsyncHandler(loggedOnly), AsyncHandler(GroupController.groupInfo));

router.put("/:group_id", AsyncHandler(loggedOnly), AsyncHandler(GroupController.editGroup));

router.delete("/:group_id", AsyncHandler(loggedOnly), AsyncHandler(GroupController.deleteGroup));

router.get("/:group_id/members", AsyncHandler(loggedOnly), AsyncHandler(GroupController.getMembers));

router.post("/:group_id/add-members", AsyncHandler(loggedOnly), AsyncHandler(GroupController.addUsersToGroup));

router.post("/:group_id/upload-image",
    AsyncHandler(loggedOnly),
    AsyncHandler(image_upload.single("image")),
    AsyncHandler(GroupController.uploadGroupImage));

router.get("/:group_id/image", AsyncHandler(loggedOnly), AsyncHandler(GroupController.getGroupImage));

router.put("/:group_id/members/:user_pseudo", AsyncHandler(loggedOnly), AsyncHandler(GroupController.editUserStatus));

router.delete("/:group_id/members/:user_pseudo", AsyncHandler(loggedOnly), AsyncHandler(GroupController.kickUserFromGroup));

export default router;
