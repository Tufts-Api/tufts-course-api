import { Course } from "@utils/";

abstract class Query {
  abstract match(course: Course, value: any): boolean;
}

class Attribute extends Query {
  match(course: Course, value: string) {
    const attributes = course.attributes();
    return attributes.includes(value);
  }
}

class Career extends Query {
  match(course: Course, value: string) {
    const career = course.career();
    return career === value;
  }
}

class Consent extends Query {
  match(course: Course, value: string) {
    const consent = course.consent();
    return consent === value;
    // check if consent has length of 1
  }
}

class Grading extends Query {
  match(course: Course, value: string) {
    // const
  }
}

class Subject extends Query {
  match(course: Course, value: string) {
    const subject = course.subject().split("-")[0];
    return subject === value;
  }
}

class Not extends Query {
  private _query: Query;

  constructor(query: Query) {
    super();
    this._query = query;
  }

  match(course: Course, value: any) {
    return !this._query.match(course, value);
  }
}

class Or extends Query {
  private _queries: Query[];

  constructor(queries: Query[]) {
    super();
    this._queries = queries;
  }

  public match(course: Course, value: any) {
    return this._queries.some((query) => query.match(course, value));
  }
}

class And extends Query {
  private _queries: Query[];

  constructor(queries: Query[]) {
    super();
    this._queries = queries;
  }

  public match(course: Course, value: any) {
    return this._queries.every((query) => query.match(course, value));
  }
}
