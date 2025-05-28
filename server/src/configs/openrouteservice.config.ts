export const OPEN_ROUTESERVICE_API_KEY = process.env.OPEN_ROUTE_SERVICE_API_KEY!;

if (!OPEN_ROUTESERVICE_API_KEY) {
    throw new Error('OPEN_ROUTE_SERVICE_API_KEY is not defined in environment variables');
}
