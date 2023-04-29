import { EmailParticipant } from 'ag-common-lib/public-api';

export const buildSearchableId = (values: { [key: string]: string }) => {
  const params = Object.entries(values);
  const urlSearchParams = new URLSearchParams(params);
  urlSearchParams.sort();

  return urlSearchParams.toString();
};

export const parseSearchableId = (id: string): Partial<EmailParticipant> => {
  const params = new URLSearchParams(id);

  return Array.from(params.entries()).reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {});
};
