export const objectParser = (obj: Record<string | number, any>) => {
  return { id: typeof obj.id };
};
