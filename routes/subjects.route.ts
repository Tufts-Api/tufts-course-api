import { Router } from "express";
import puppeteer from "puppeteer";
import { Code } from "@utils/code";
import CONSTANTS from "@constants/";

const router = Router();

router.get("/subjects", async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(CONSTANTS.baseUrl);

    // Wait for courses dropdown menu
    await page.waitForSelector(
      "#s2id_tfp_clssrch_subject2 .select2-choice .select2-arrow"
    );
    // Select courses dropdown menu
    const dropdownButton = await page.$(
      "#s2id_tfp_clssrch_subject2 .select2-choice .select2-arrow"
    );
    if (dropdownButton === null) {
      res
        .status(Code.internalCrash)
        .json({ message: "Subject previews not available" });
      return;
    }
    await dropdownButton.click();

    // Query list of classes
    await page.waitForSelector(".select2-result");
    const classNodes = await page.$$(".select2-result div");
    const classes = await Promise.all(
      classNodes.map(async (ele) => {
        const textContent = await ele.getProperty("textContent");
        return textContent.jsonValue();
      })
    );
    const map = classes.reduce((map, course) => {
      if (course === null) {
        return map;
      }
      const courseStrip = course.replace('"', "");
      const data = courseStrip.split(" - ");
      if (data.length === 2) {
        const [code, name] = data;
        map[name] = code;
      }
      return map;
    }, {} as { [key: string]: string });

    await browser.close();

    res.status(Code.ok).json(map);
  } catch (err) {
    res
      .status(Code.internalCrash)
      .json({ message: "Internal crash", data: err });
  }
});

export default router;
