import Openrouteservice from 'openrouteservice-js';
import { OPEN_ROUTESERVICE_API_KEY } from '@/configs/openrouteservice.config';
console.log("OPEN_ROUTESERVICE_API_KEY:::", OPEN_ROUTESERVICE_API_KEY)

export const Geocode = new Openrouteservice.Geocode({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Directions = new Openrouteservice.Directions({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Isochrones = new Openrouteservice.Isochrones({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Matrix = new Openrouteservice.Matrix({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Elevation = new Openrouteservice.Elevation({ api_key: OPEN_ROUTESERVICE_API_KEY });
