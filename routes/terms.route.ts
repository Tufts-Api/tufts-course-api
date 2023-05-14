import { Router } from "express";
import { Code } from "@utils/code";
import CONSTANTS from "@constants/";

const router = Router();

router.get("/", (req, res, next) => {
  res.status(Code.ok).json(CONSTANTS.terms);
});

export default router;
