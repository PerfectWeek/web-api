//
// Created by alif_m on 2018/06/02
//

import {Router, Request, Response} from "express";

const router = Router();

router.all('/', (req: Request, res: Response) => {
    res.status(200).json({
        name : "Perfect Week API du swag",
    });
});

export default router;
