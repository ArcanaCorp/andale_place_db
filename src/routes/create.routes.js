import { Router } from "express";
import { controllerCreatePlace, controllerCreateRouter } from "../controllers/create.controller.js";
import { uploadPhoto } from "../middlewares/uploadRouter.js";

const router = Router();

router.post('/create/router', uploadPhoto.single('photo'), controllerCreateRouter)

router.get('/create/place', controllerCreatePlace)

export default router;