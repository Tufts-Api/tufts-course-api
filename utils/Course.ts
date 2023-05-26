import * as C from "@interfaces/";
import CONSTANTS from "@constants/";

class Course {
  private _course: C.Course;
  private _term: string;

  public constructor(data: any, term: string) {
    this._course = this._parse_course(data);
    this._term = term;
  }

  public instructors() {
    let instructors = new Set<string>();

    this._course.sections.forEach((s) =>
      s.components.forEach((c) =>
        c.locations.forEach((l) =>
          l.instructors.forEach((i) => instructors.add(i))
        )
      )
    );

    return Array.from(instructors);
  }

  public attributes() {
    let attributes = new Set<string>();

    this._course.sections.forEach((s) =>
      s.components.forEach((c) =>
        c.attributes.forEach((i) => attributes.add(i))
      )
    );

    return Array.from(attributes);
  }

  public subjects() {
    return this._course.course_num;
  }

  // @TODO: print out all careers to find proper mapping
  public careers() {
    return this._course.career;
  }

  public credits() {
    const credits: { min: number; max: number }[] = [];

    this._course.sections.forEach((s) => {
      s.components.forEach((c) => {
        credits.push(c.credits);
      });
    });

    return credits;
  }

  public statuses() {
    // @TODO : Enumerate statuses
    const statuses: string[] = [];

    this._course.sections.forEach((s) => {
      s.components.forEach((c) => {
        statuses.push(c.status);
      });
    });

    return statuses;
  }

  public gradings() {
    // @TODO : Enumerate grading
    const gradings = new Set<string>();

    this._course.sections.forEach((s) => {
      s.components.forEach((c) => {
        gradings.add(c.grading);
      });
    });

    return Array.from(gradings);
  }

  private _parse_location(location: any): C.Location {
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
  }

  private _parse_component(component: any): C.Component {
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
      this._parse_location(location)
    );

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
  }

  private _parse_section(section: any): C.Section {
    const { comp_desc: type } = section;
    const components: C.Component[] = section.components.map((s: any) =>
      this._parse_component(s)
    );

    return {
      components: components,
      type: type,
    };
  }

  private _parse_course(course: any): C.Course {
    const { desc_long, acad_career, course_title, course_num } = course;
    const sections: C.Section[] = course.sections.map((c: any) =>
      this._parse_section(c)
    );

    return {
      description: desc_long,
      career: acad_career,
      title: course_title,
      course_num: course_num,
      sections: sections,
      semester: CONSTANTS.rev_terms[this._term],
    };
  }
}
