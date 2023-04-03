export const buildSearchableId = (values) => {
  const params = new URLSearchParams(values);
  params.sort();

  return params.toString();
};

export const parseSearchableId = (id: string): any => {
  const params = new URLSearchParams(id);

  return Array.from(params.entries()).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {});
};
