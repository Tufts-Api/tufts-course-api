import { ATTRIBUTES } from "./attributes";
import { SCHOOLS } from "./schools";
import { REV_TERMS, TERMS } from "./terms";
import { CONSENT } from "./consent";
import { GRADING } from "./grading";
import { INSTRUCTION } from "./instruction";
import { TYPE } from "./type";
import { STATUS } from "./status";
import { CAREER } from "./career";
import { SUBJECTS } from "./subjects";

const CONSTANTS = {
  attributes: ATTRIBUTES,
  schools: SCHOOLS,
  terms: TERMS,
  rev_terms: REV_TERMS,
  consent: CONSENT,
  grading: GRADING,
  instruction: INSTRUCTION,
  type: TYPE,
  status: STATUS,
  career: CAREER,
  subjects: SUBJECTS,
  baseUrl:
    "https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#class_search",
};

export default CONSTANTS;
