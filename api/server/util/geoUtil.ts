import {destination, distance, point} from  '@turf/turf';
import {GeoPoint} from "../../models/GeoPoint";

export class GeoUtil {

    static distanceVariation: number = 100;

    constructor() {
    }

    static createEndPointByKm(startPoint: GeoPoint, distance: number, bearing?: number): GeoPoint {
        bearing = bearing || 0;
        //longitude, latitude
        let future = destination(point(startPoint.coordinates), distance, bearing, 'kilometers');
        return future.geometry;
    }


    static
    kmToMeters(value) {
        return value * 1000;
    }

    static
    getDistance(from: GeoPoint, to: GeoPoint) {
        return distance(point(from.coordinates), point(to.coordinates), 'kilometers');
    }

    static createGeoPointJSON(lng: number, lat: number) {
        const geoPoint = new GeoPoint(lng, lat);
        return {
            type: geoPoint.type,
            coordinates: geoPoint.coordinates
        }
    }

    //radius in km
    // distance of two points is calculated on high precision but with divergence
    static maxDistance(radius: number) {
        //km to meters
        return (radius * 1000) + GeoUtil.distanceVariation;
    }
}