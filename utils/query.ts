import { Course } from "@interfaces/";

abstract class Query {
  abstract match(course: Course, value: any): boolean;
}

// class Instructor extends Query {
//   ...

//   match(course: Course, value: any) {
//     course.instructor()
//   }
// }

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
