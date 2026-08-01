import { Router, type IRouter } from "express";
import healthRouter from "./health";
import processRouter from "./process";
import entriesRouter from "./entries";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(processRouter);
router.use(entriesRouter);
router.use(statsRouter);

export default router;
