import { Vector } from "engine";
import { Vec2 } from "planck-js";

export function removeItem<T>(array: T[], item: T): void {
    array = array.filter(i => i !== item);
}

export function registerPixiInspector(): void {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

export function toVec2(vector: Vector): Vec2 {
    return new Vec2(vector.x, vector.y);
}

export function toVector(vec2: Vec2): Vector {
    return new Vector(vec2.x, vec2.y);
}
