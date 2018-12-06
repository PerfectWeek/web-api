import {Router, Request, Response} from "express";


import * as swaggerOpenApi from '../../../resources/openapi/openapi.json';

const router = Router();

router.all('/', (req: Request, res: Response) => {
    res.status(200).json({
        name : "Perfect Week API du swag",
    });
});

router.get('/swagger.json', (req: Request, res: Response) => {
    res.status(200).json(swaggerOpenApi);
});

export default router;
