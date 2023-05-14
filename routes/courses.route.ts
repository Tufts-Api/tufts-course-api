import CONSTANTS from "@constants/";
import { Code } from "@utils/code";
import { Request, Router } from "express";
import { query, validationResult } from "express-validator";

const router = Router();

interface Query {
  term: string;
  attribute: string;
  instructors: string[];
  subjects: string[];
  school: string;
  limit: number;
  offset: number;
}

router.get(
  "/",
  query("term")
    .default(
      Math.max(
        ...Object.values(CONSTANTS.terms).map((term) => parseInt(term))
      ).toString()
    )
    .isString()
    .custom((value: string, meta) => {
      return /\d{4}/.test(value);
    })
    .withMessage("Terms must be a 4 digit number"),
  (req: Request<any, any, any, Query>, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped);
      res.status(Code.badRequest).json(errors.mapped());
    }

    res.end();
  }
);

export default router;
