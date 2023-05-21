export type Status = "open" | "closed" | "waitlist";

export type Day = "Mo" | "Tu" | "We" | "Th" | "Fr" | "Sa" | "Su";

export interface Capacity {
  cap: number;
  total: number;
  available: number;
  cap_type: string;
}

export interface CombinedSec {
  waitlist: number;
  status: string;
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
  // @TODO - Some format...
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
  // @TODO - enumerate consent
  consent: string; // consent
  class_num: number; // class_number
  // @TODO - enumerate component
  // @TODO - Verify that Component.type === Section.type
  type: string; // component
  // @TODO - Enumerate attributes
  attributes: string[]; // class_attr
  // @TODO - Enumerate grading
  grading: string; // grd_basis -- GRD, PNP, NOG, SUS
  // @TODO - Enumerate instruction modes
  instruction_mode: string; // instructionmode
  locations: Location[]; // locations
  // @TODO - Enumerate status
  status: string; // status

  // Additional metadata
  enrollment: Enrollment | null;
}

export interface Section {
  components: Component[]; // components
  // @TODO - Enumerate section type
  type: string; // comp_desc
}

export interface Course {
  description: string; // desc_long
  // @TODO - Enumerate careers
  career: string; // acad_career ASEU, ASEG, FLTR
  title: string; // course_title
  // @TODO - include comp_reqd_desc ?
  course_num: string; // course_num
  sections: Section[];

  // Additional metadata
  semester: string;
  // @TODO - include prerequisites  ?
  // prerequisites: string;  // degree: "undergraduate" | "graduate";
}
