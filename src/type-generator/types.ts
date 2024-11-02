export type Primitive = string | number | boolean | null | symbol;

export type TypeGeneratorConfiguration = {
  literalKeys?: string[];
  currentSchema?: Record<string | number, any>;
};
