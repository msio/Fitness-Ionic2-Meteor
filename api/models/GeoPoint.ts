export class GeoPoint {
    type: string = 'Point';
    coordinates: Array<number>;

    constructor(lng: number, lat: number) {
        this.coordinates = [lng, lat];
    }
}