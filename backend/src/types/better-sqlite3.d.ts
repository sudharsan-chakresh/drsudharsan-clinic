declare module "better-sqlite3" {
  export interface Database {
    pragma(sql: string): any;
    prepare(sql: string): any;
    exec(sql: string): any;
  }

  export default class Database {
    constructor(path: string);
    pragma(sql: string): any;
    prepare(sql: string): any;
    exec(sql: string): any;
  }
}
