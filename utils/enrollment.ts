import puppeteer from "puppeteer";
import * as C from "@interfaces/";
import CONSTANTS from "@constants/";

const parse_location = (location: any): C.Location => {
  const { instructor, campus, class_loc, meetings } = location;
  const meetingRecord: Record<C.Day, C.Meeting[]> = {
    Mo: [],
    Tu: [],
    We: [],
    Th: [],
    Fr: [],
    Sa: [],
    Su: [],
  };

  for (let i = 0; i < meetings.length; i++) {
    const m: any = meetings[i];
    const { meet_start, meet_end, days } = m;
    for (let j = 0; j < days.length; j++) {
      const day: C.Day = days[j];
      meetingRecord[day].push({
        start: meet_start,
        end: meet_end,
      });
    }
  }

  return {
    instructors: instructor.split(",").map((inst: string) => inst.trim()),
    campus: campus,
    location: class_loc,
    meeting: meetingRecord,
  };
};

const parse_component = async (component: any): Promise<C.Component> => {
  const {
    unit_min,
    unit_max,
    section_num,
    class_num,
    consent,
    class_attr,
    grd_basis,
    instructionmode,
    status,
  } = component;

  const locations: C.Location[] = component.locations.map((location: any) =>
    parse_location(location)
  );

  // const browser = await puppeteer.launch({ headless: "new" });
  // const page = await browser.newPage();
  // await page.goto(CONSTANTS.baseUrl);

  // // @TODO - Change to dynamic jQuery
  // await page.goto(
  //   `https://siscs.it.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getResultsDetails?callback=jQuery182049704776932840633_1684457900703&term=${2238}&class_num=${class_num}`
  // );
  // let enrollment: C.Enrollment | null = null;
  // console.log("Before waiting");
  // const body = await page.$("pre");
  // if (body !== null) {
  //   const textContent = await body.getProperty("textContent");
  //   const text = await textContent.jsonValue();
  //   if (text !== null) {
  //     // @TODO - Change to dynamic jquery
  //     const data = text.split("jQuery182049704776932840633_1684457900703");
  //     if (data.length === 2) {
  //       const [_, status] = data;
  //       const json = JSON.parse(status.slice(1, status.length - 1));

  //       const {
  //         reserved_cap,
  //         combined_sec: other_sections,
  //         note,
  //         start_date,
  //         end_date,
  //       } = json;

  //       const capacity: C.Capacity[] = reserved_cap.map((capacity: any) => {
  //         const { cap, total, available, cap_type } = capacity;

  //         return {
  //           cap: cap,
  //           total: total,
  //           available: available,
  //           cap_type: cap_type,
  //         };
  //       });

  //       const combined_sec: C.CombinedSec[] = other_sections.map(
  //         (section: any) => {
  //           const { wait_total, status, enrl_total, combsect_id, class_num } =
  //             section;
  //           return {
  //             waitlist: wait_total,
  //             status: status,
  //             enrolled: enrl_total,
  //             id: combsect_id,
  //             class_num: class_num,
  //           };
  //         }
  //       );

  //       enrollment = {
  //         capacity: capacity,
  //         combined_sec: combined_sec,
  //         note: note,
  //         start_date: start_date.replace("\\/", "/"),
  //         end_date: end_date.replace("\\/", "/"),
  //       };
  //     }
  //   }
  // }
  // console.log("After waiting");

  // await browser.close();

  return {
    credits: {
      min: unit_min,
      max: unit_max,
    },
    section_num: section_num,
    consent: consent,
    class_num: class_num,
    attributes: class_attr.split("|").map((attr: string) => attr.trim()),
    grading: grd_basis,
    instruction_mode: instructionmode,
    locations: locations,
    status: status,
  };
};

const parse_section = async (section: any): Promise<C.Section> => {
  const { comp_desc: type } = section;
  const components: C.Component[] = [];

  for (let i = 0; i < section.components.length; i++) {
    const s = await parse_component(section.components[i]);
    components.push(s);
  }

  return {
    components: components,
    type: type,
  };
};

const parse_course = async (course: any, term: string): Promise<C.Course> => {
  const { desc_long, acad_career, course_title, course_num } = course;
  const sections: C.Section[] = [];

  for (let i = 0; i < course.sections.length; i++) {
    const c = await parse_section(course.sections[i]);
    sections.push(c);
  }

  return {
    description: desc_long,
    career: acad_career,
    title: course_title,
    course_num: course_num,
    sections: sections,
    semester: CONSTANTS.rev_terms[term],
  };
};

export default parse_course;
