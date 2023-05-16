import CONSTANTS from "@constants/";
import puppeteer from "puppeteer";
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
      return Object.values(CONSTANTS.terms).includes(value);
    })
    .withMessage("Terms must be a 4 digit number"),
  query("school")
    .default("ALL")
    .isString()
    .custom((value: string, meta) => {
      return Object.values(CONSTANTS.schools).includes(value);
    }),
  async (req: Request<any, any, any, Query>, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped);
      res.status(Code.badRequest).json(errors.mapped());
    }

    const { term, school } = req.query;
    // https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#search_results/term/2238/career/ALL/subject/course/attr/keyword/instructor
    // const url = `${CONSTANTS.baseUrl}/term/${term}/career/${school}/subject/course/attr/keyword/instructor`;
    // console.log(url);
    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();
    // await page.goto(url);
    // // tfp_accordion_row cls-show-js
    // // await page.waitForSelector("#TFP_ClsSrch_viewport");
    // await setTimeout(async () => {
    //   console.log("hi");
    //   // await page.waitForSelector("#TFP_search_results");
    //   const html = await page.content();
    //   console.log(html);
    //   // await setTimeout(async () => await page.close(), 30000);
    //   res.status(Code.ok).json(html);
    // }, 3000);
    res.end();
  }
);

export default router;
