import "module-alias/register";
import express from "express";
import {
  AttributesRouter,
  SchoolsRouter,
  SubjectsRouter,
  TermsRouter,
  CoursesRouter,
} from "@routes/";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use("/attributes", AttributesRouter);
app.use("/schools", SchoolsRouter);
app.use("/terms", TermsRouter);
app.use("/subjects", SubjectsRouter);
app.use("/courses", CoursesRouter);

app.listen(PORT, () => {
  // TODO - Change port message
  console.log(`⚡️[server]: Server running on http://localhost:${PORT}`);
});
