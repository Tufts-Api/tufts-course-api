import "module-alias/register";
import express from "express";
import { CoursesRouter } from "@routes/";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use("/courses", CoursesRouter);

app.listen(PORT, () => {
  // TODO - Change port message
  console.log(`⚡️[server]: Server running on http://localhost:${PORT}`);
});
