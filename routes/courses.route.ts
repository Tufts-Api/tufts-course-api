import { NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import CONSTANTS from "@constants/";
import puppeteer from "puppeteer";
import { parse_course, Code } from "@utils/";
import { query, validationResult } from "express-validator";
import { Course } from "@interfaces/";

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

interface Locals {
  jquery: string;
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
    })
    .withMessage("School must be a valid code"),

  async (req, res, next) => {
    const { term } = req.query;
    const file = fs.readFileSync("./reference.json").toString();
    const json = JSON.parse(file);

    const courses: Course[] = [];
    for (let i = 0; i < 10; i++) {
      const course = await parse_course(json.searchResults[i], term);
      courses.push(course);
      console.log("Finished iteration " + i);
    }

    const result = { res: courses };
    const string = JSON.stringify(result, null, 2);
    fs.writeFileSync("./output.json", string, "utf-8");

    res.end();
  },

  async (
    req: Request<any, any, any, Query>,
    res: Response<any, Locals>,
    next: NextFunction
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.mapped);
      res.status(Code.badRequest).json(errors.mapped());
    }

    const { term } = req.query;
    // @TODO - Change school
    const url = `${CONSTANTS.baseUrl}/term/${term}/career/ALL/subject/course/attr/keyword/instructor`;
    // const url =
    //   "https://siscs.it.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3?callback=jQuery18206821673401761599_1684273176471&term=2238&career=ALL&subject=&crs_number=&attribute=&keyword=&instructor=&searchby=crs_number&_=1684273635967";

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url);
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const url = request.url();
      if (url.startsWith("https://siscs.it.tufts.edu")) {
        const reJquery = url.match(/(jQuery[0-9 _]+)&/);
        if (reJquery !== null) {
          res.locals.jquery = reJquery[1];
          await browser.close();
          next();
        }
      }
      request.continue();
    });
  },

  async (
    req: Request<any, any, any, Query>,
    res: Response<any, Locals>,
    next
  ) => {
    const { term, school } = req.query;
    const { jquery } = res.locals;
    // @TODO - Use school query
    const url = `https://siscs.it.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3?callback=${jquery}&term=${term}&school=ALL`;
    // https://siscs.it.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3?callback=jQuery18206821673401761599_1684273176471&term=2238&career=PHPD&subject=&crs_number=&attribute=&keyword=&instructor=&searchby=crs_number&_=1684273635967

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(CONSTANTS.baseUrl);
    await page.goto(url);

    const body = await page.$("pre");
    if (body === null) {
      res
        .status(Code.internalCrash)
        .json({ message: "Course previews not available" });
      return;
    }
    const textContent = await body.getProperty("textContent");
    const text = await textContent.jsonValue();

    await browser.close();

    if (text === null) {
      res
        .status(Code.internalCrash)
        .json({ message: "Course previews not available" });
      return;
    }

    const data = text.split(jquery);
    if (data.length !== 2) {
      res
        .status(Code.internalCrash)
        .json({ message: "Course previews not available" });
      return;
    }
    const [_, courses] = data;
    const json = JSON.parse(courses.slice(1, courses.length - 1));
    // fs.writeFileSync(
    //   "./reference.json",
    //   JSON.stringify(json, null, "\t"),
    //   "utf-8"
    // );

    // Check localation != TBA
    // const parsedCourses: Course[] = json.searchResults.map((course) => {
    // });
    // console.log(JSON.stringify(json.searchResults[0], null, 4));
    // const relevant = json.filter((course) => course.acad_career !== "ASEU");

    // console.log(json.searchResults[0], json.searchResults[0].sections);
    // const json = JSON.parse()
    // const json = await page.evaluate(() => {
    //   return JSON.parse(body.getProperty("innerHTML"));
    // });
    // const json = JSON.parse(content);

    res.end();
  }
);

export default router;

// while (jquery === "") {
//   console.log("HERE");
// }
// await page.goto(api);
// console.log(await page.content());

// await page.setUserAgent(
// "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
// "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
// );
// await page.setViewport({
//   width: 1920,
//   height: 1080,
//   deviceScaleFactor: 1,
// // });
// await page.goto(CONSTANTS.baseUrl);

// console.log(page.url());

// let bodyHTML = await page.evaluate(
//   () => document.documentElement.outerHTML
// );
// console.log(await page.content());
// await page.waitForSelector("#TFP_ClsSrch_viewport");
// page.on("framenavigated", (interceptedRequest) => {
//   console.log(interceptedRequest.url());
// });
// const node = await page.waitForSelector("#TFP_CLS_search_wrapper");
// const courses = await page.waitForSelector("#TFP_search_results");
// const children = await courses?.getProperty("innerHTML");
// console.log(await children?.jsonValue());
// console.log(await browser.userAgent());
// await browser.close();
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
// res.end();
