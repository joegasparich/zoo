
import { ObservablePoint, Point } from "pixi.js";
import * as Planck from "planck-js";

import Vector from "vector";

export function toPoint(vector: Vector): Point {
    return new Point(vector.x, vector.y);
}

export function toVec2(vector: Vector): Planck.Vec2 {
    return new Planck.Vec2(vector.x, vector.y);
}

export function toObservablePoint(vector: Vector, callback?: (this: any) => any, scope?: any): ObservablePoint {
    return new ObservablePoint(callback, scope, vector.x, vector.y);
}

export function FromPoint(point: Point): Vector {
    return new Vector(point.x, point.y);
}

export function FromVec2(vec2: Planck.Vec2): Vector {
    return new Vector(vec2.x, vec2.y);
}
