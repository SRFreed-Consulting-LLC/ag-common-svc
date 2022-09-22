import { fromUnixTime, isDate, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const dateFromTimestamp = (item: Timestamp) => {
  if (!item) {
    return null;
  }

  if (isDate(item)) {
    return item;
  }

  let normalizedDate;

  if (item?.seconds) {
    normalizedDate = fromUnixTime(item.seconds);
  }

  return isValid(normalizedDate) ? normalizedDate : null;
};
