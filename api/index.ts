import { fetchTwoHourForecast } from './two-hr-forecast';
import { fetchPsiData } from './psi';
import { getHealthStatus } from './health';

export { fetchTwoHourForecast, fetchPsiData, getHealthStatus };

export const routes = {
  '/api/two-hr-forecast': fetchTwoHourForecast,
  '/api/forecast': fetchTwoHourForecast,
  '/api/psi': fetchPsiData,
  '/api/health': getHealthStatus,
};
