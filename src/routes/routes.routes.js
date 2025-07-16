import { Router } from "express";
import { controllerImageRouters, controllerListRouters } from "../controllers/routes.controller.js";

const router = Router()

router.get('/routes/list', controllerListRouters)
router.get('/routes/image/:sub/:image', controllerImageRouters)

export default router;