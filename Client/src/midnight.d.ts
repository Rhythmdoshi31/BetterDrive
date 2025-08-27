import "jquery";

declare module "jquery" {
  interface JQuery {
    midnight(options?: any): JQuery;
  }
}
