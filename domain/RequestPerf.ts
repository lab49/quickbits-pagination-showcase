import { Result } from "../utils/createPerformanceInterceptor";

export type RequestPerf = Result & {
  requestTime: number;
};
