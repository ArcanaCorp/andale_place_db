import { Router } from "express";
import { controllerListPlaces, controllerListSections, controllerSlugPlace, controllerSubPlace } from "../controllers/places.controller.js";

const router = Router();

router.get('/places/list', controllerListPlaces)

router.get('/places/mobile', controllerListSections)

router.get('/places/:slug', controllerSlugPlace)

router.get('/places/c/:sub', controllerSubPlace)

export default router;