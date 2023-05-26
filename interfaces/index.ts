import CONSTANTS from "@constants/";

export type Consent = (typeof CONSTANTS.consent)[number];

export type Attribute = (typeof CONSTANTS.attributes)[number];

export type Grading = (typeof CONSTANTS.grading)[number];

export type Status = (typeof CONSTANTS.status)[number];

export type Type = (typeof CONSTANTS.type)[number];

export type Instruction = (typeof CONSTANTS.instruction)[number];

export type Career = (typeof CONSTANTS.career)[number];

export type Day = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export interface Capacity {
  cap: number;
  total: number;
  available: number;
  cap_type: string;
}

export interface CombinedSec {
  waitlist: number;
  status: Status;
  enrolled: number;
  id: string;
  class_num: string;
}

export interface Enrollment {
  capacity: Capacity[];
  combined_sec: CombinedSec[];
  note: string;
  start_date: string;
  end_date: string;
}

export interface Meeting {
  start: string;
  end: string;
}

export interface Location {
  instructors: string[]; // instructor
  campus: string; // campus
  location: string; // class_loc
  meeting: Record<Day, Meeting[]>; // meetings
}

export interface Component {
  credits: {
    min: number; // unit_min
    max: number; // unit_max
  };
  section_num: string; // section_num
  consent: Consent; // consent
  class_num: number; // class_number
  attributes: Attribute[]; // class_attr
  grading: Grading;
  instruction_mode: Instruction;
  locations: Location[]; // locations
  status: Status; // status
}

export interface Section {
  components: Component[]; // components
  type: Type; // comp_desc
}

export interface Course {
  description: string; // desc_long
  career: Career; // acad_career ASEU, ASEG, FLTR
  title: string; // course_title
  // @TODO - include comp_reqd_desc ?
  course_num: string; // course_num
  sections: Section[];

  // Additional metadata
  semester: string;
  // @TODO - include prerequisites  ?
  // prerequisites: string;  // degree: "undergraduate" | "graduate";
}
