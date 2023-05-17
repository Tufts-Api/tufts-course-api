import { Request, Response, Router } from "express";
import CONSTANTS from "@constants/";
import puppeteer from "puppeteer";
import { Code } from "@utils/code";
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

  async (
    req: Request<any, any, any, Query>,
    res: Response<any, Locals>,
    next
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
          next();
          await browser.close();
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

    // Check localation != TBA

    console.log(JSON.stringify(json.searchResults[0], null, 4));
    // const relevant = json.filter((course) => course.acad_career !== "ASEU");
    // 1] {
    //   [1]     "desc_long": "(Cross-listed w/CSHD 62 and LST 62) Intermediate-level study of child development, with emphasis on cultural perspectives integrating psychological and anthropological theory. Children's development examined across cultures and in the context of the various social institutions and settings within which they live.",
    //   [1]     "showCourse": "Y",
    //   [1]     "acad_career": "ASEU",
    //   [1]     "course_title": "Childhood Across Culture",
    //   [1]     "level1_groupid": "1423120010000000",
    //   [1]     "hasHiddenClasses": "N",
    //   [1]     "comp_reqd_desc": "",
    //   [1]     "course_num": "AAST-0062",
    //   [1]     "sections": [
    //   [1]         {
    //   [1]             "components": [
    //   [1]                 {
    //   [1]                     "unit_selected": 3,
    //   [1]                     "enrl_cart_stat": "N",
    //   [1]                     "section_num": "01-LEC",
    //   [1]                     "unit_min": 3,
    //   [1]                     "showClass": "Y",
    //   [1]                     "campus": "Medford/Somerville",
    //   [1]                     "class_stat": "A",
    //   [1]                     "session_desc": "Regular",
    //   [1]                     "consent": "N",
    //   [1]                     "class_num": "84137",
    //   [1]                     "assoc_flag": "A",
    //   [1]                     "component": "Lecture",
    //   [1]                     "class_attr": "BFA-Language/Culture|BFA-Social Science|LA-Distribution-Social Sciences|SoE-HASS|SoE-HASS-Social Sciences|World Civilization Requirement",
    //   [1]                     "grd_basis": "GRD",
    //   [1]                     "instructionmode": "P",
    //   [1]                     "credit_select": "N",
    //   [1]                     "ssr_comp": "LEC",
    //   [1]                     "unit_max": 3,
    //   [1]                     "grd_desc": "GRD",
    //   [1]                     "locations": [
    //   [1]                         {
    //   [1]                             "myLocUniqueId": "AAST-00628413701-LECM205-170",
    //   [1]                             "instructor": "Theo Klimstra",
    //   [1]                             "campus": "Medford/Somerville",
    //   [1]                             "class_loc": "Joyce Cummings Center, 170",
    //   [1]                             "meetings": [
    //   [1]                                 {
    //   [1]                                     "mtg_num": "1",
    //   [1]                                     "meet_end_min": 885,
    //   [1]                                     "days": [
    //   [1]                                         "Tu",
    //   [1]                                         "Th"
    //   [1]                                     ],
    //   [1]                                     "meet_end": "2:45PM",
    //   [1]                                     "meet_start_min": 810,
    //   [1]                                     "meet_start": "1:30PM"
    //   [1]                                 }
    //   [1]                             ],
    //   [1]                             "loc_id": "M205-170"
    //   [1]                         }
    //   [1]                     ],
    //   [1]                     "assoc_class": "1",
    //   [1]                     "selected": "",
    //   [1]                     "status": "W"
    //   [1]                 }
    //   [1]             ],
    //   [1]             "comp_desc": "Lecture"
    //   [1]         }
    //   [1]     ]
    //   [1] }

    // {
    //   "desc_long": "This course is designed to help MD/MPH and DVM/MPH students integrate their clinical, scientific, and public health education both conceptually and in regards to future career planning and development. The course provides continuity throughout the course of medical or veterinary school, allowing each student to develop a mentoring relationship with at least two faculty members. The course is designed in part to ameliorate the potential perceptions of discontinuity created by the spreading out of an 18 month curriculum over 4 years. The course is designed to help prepare a student for the Applied Learning Experience (ALE) and to increase the likelihood that the ALE will be of sufficient scope, depth and quality to allow for a final paper suitable for publication.",
    //   "showCourse": "Y",
    //   "acad_career": "PHPR",
    //   "course_title": "Integration Of Publ Hlth",
    //   "level1_groupid": "102308CMP0000000",
    //   "hasHiddenClasses": "N",
    //   "comp_reqd_desc": "",
    //   "course_num": "CMPH-0451",
    //   "sections": [
    //     {
    //       "components": [
    //         {
    //           "unit_selected": 0,
    //           "enrl_cart_stat": "N",
    //           "section_num": "DVM-LEC",
    //           "unit_min": 0,
    //           "showClass": "Y",
    //           "campus": "Boston",
    //           "class_stat": "A",
    //           "session_desc": "CMPH",
    //           "consent": "D",
    //           "class_num": "83363",
    //           "assoc_flag": "A",
    //           "component": "Lecture",
    //           "class_attr": "DVM/MPH Required Courses",
    //           "grd_basis": "SUS",
    //           "instructionmode": "P",
    //           "credit_select": "N",
    //           "ssr_comp": "LEC",
    //           "unit_max": 0,
    //           "grd_desc": "SUS",
    //           "locations": [
    //             {
    //               "myLocUniqueId": "CMPH-045183363DVM-LECTBA",
    //               "instructor": "STAFF",
    //               "campus": "Boston",
    //               "class_loc": "TBA",
    //               "meetings": [
    //                 {
    //                   "mtg_num": "1",
    //                   "meet_end_min": 0,
    //                   "days": [],
    //                   "meet_end": "12:00AM",
    //                   "meet_start_min": 0,
    //                   "meet_start": "12:00AM"
    //                 }
    //               ],
    //               "loc_id": "TBA"
    //             }
    //           ],
    //           "assoc_class": "1",
    //           "selected": "",
    //           "status": "O"
    //         }
    //       ],
    //       "comp_desc": "Lecture"
    //     }
    //   ]
    // }

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
