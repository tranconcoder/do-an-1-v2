import Openrouteservice from 'openrouteservice-js'
import { OPEN_ROUTESERVICE_API_KEY } from '@/configs/openrouteservice.config';


export const Geocode = new Openrouteservice.Geocode({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Directions = new Openrouteservice.Directions({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Isochrones = new Openrouteservice.Isochrones({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Matrix = new Openrouteservice.Matrix({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Elevation = new Openrouteservice.Elevation({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Nearest = new Openrouteservice.Nearest({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const Places = new Openrouteservice.Places({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const TimeFilter = new Openrouteservice.TimeFilter({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const GeocodeAutocomplete = new Openrouteservice.GeocodeAutocomplete({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const GeocodeReverse = new Openrouteservice.GeocodeReverse({ api_key: OPEN_ROUTESERVICE_API_KEY });

export const GeocodeSearch = new Openrouteservice.GeocodeSearch({ api_key: OPEN_ROUTESERVICE_API_KEY });