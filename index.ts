import "module-alias/register";
import express, { RequestHandler } from "express";
import puppeteer from "puppeteer";
import CONSTANTS from "@constants/";
import { Code } from "@utils/";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.get("/subjects", async (req, res, next) => {
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

app.listen(PORT, () => {
  // TODO - Change port message
  console.log(`⚡️[server]: Server running on http://localhost:${PORT}`);
});
