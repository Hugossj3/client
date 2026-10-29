export type ResourceConfig = {
  table: string;
  pk: string;
  writable: string[];
  filterable?: string[];
  hidden?: string[];
  hashFields?: string[];
};
