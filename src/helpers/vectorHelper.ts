
import { ObservablePoint, Point } from "pixi.js";

import Vector from "vector";

export function toPoint(vector: Vector): Point {
    return new Point(vector.x, vector.y);
}

export function toObservablePoint(vector: Vector, callback?: (this: any) => any, scope?: any): ObservablePoint {
    return new ObservablePoint(callback, scope, vector.x, vector.y);
}

export function FromPoint(point: Point): Vector {
    return new Vector(point.x, point.y);
}
