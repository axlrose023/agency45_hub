import axios from 'axios';

const INVALID_TIME_RANGE_DETAIL = 'since must be less than or equal to until in time_range';

type Translate = (key: string) => string;

export function resolveFacebookErrorMessage(
  error: unknown,
  fallback: string,
  t: Translate,
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail === INVALID_TIME_RANGE_DETAIL) {
      return t('facebookInvalidTimeRange');
    }
  }

  return fallback;
}
