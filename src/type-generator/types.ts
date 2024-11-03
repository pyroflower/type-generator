export type Primitive = string | number | boolean | symbol;
export type ObjectTypes = object | Array<any> | null | undefined;

export type TypeGeneratorConfiguration = {
  literalKeys?: string[];
  currentSchema?: Record<string | number, any>;
};
