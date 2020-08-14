import { Vector } from "engine";

export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function pointInCircle(circlePos: Vector, radius: number, point: Vector): boolean {
    const dx = circlePos.x - point.x;
    const dy = circlePos.y - point.y;
    return (dx*dx + dy*dy) < radius*radius;
}

export function lineIntesectsCircle(lineStart: Vector, lineEnd: Vector, circlePos: Vector, circleRad: number): boolean {
    const ac = new Vector(circlePos.x - lineStart.x, circlePos.y - lineStart.y);
    const ab = new Vector(lineEnd.x - lineStart.x, lineEnd.y - lineStart.y);
    const ab2 = Vector.Dot(ab, ab);
    const acab = Vector.Dot(ac, ab);
    let t = acab / ab2;
    t = (t < 0) ? 0 : t;
    t = (t > 1) ? 1 : t;
    const h = new Vector((ab.x * t + lineStart.x) - circlePos.x, (ab.y * t + lineStart.y) - circlePos.y);
    const h2 = Vector.Dot(h, h);
    return h2 <= circleRad * circleRad;
}

export function circleIntersectsRect(boxPos: Vector, boxDim: Vector, circlePos: Vector, circleRad: number): boolean {
    const distX = Math.abs(circlePos.x - boxPos.x-boxDim.x/2);
    const distY = Math.abs(circlePos.y - boxPos.y-boxDim.y/2);

    if (distX > (boxDim.x/2 + circleRad)) { return false; }
    if (distY > (boxDim.y/2 + circleRad)) { return false; }

    if (distX <= (boxDim.x/2)) { return true; }
    if (distY <= (boxDim.y/2)) { return true; }

    const dx=distX-boxDim.x/2;
    const dy=distY-boxDim.y/2;
    return (dx*dx+dy*dy<=(circleRad*circleRad));
}

/**
 * Returns the hex value for the RGB value, eg. 0x2352FF
 * @param r Red value between 0 & 255
 * @param g Green value between 0 & 255
 * @param b Blue value between 0 & 255
 */
export function rgbToHex(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b;
}
/**
 * Returns and object containing the RGB values
 * @param hex The hex number to convert to RGB
 */
export function hexToRgb(hex: number): {r: number; g: number; b: number} {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return {r, g, b};
}

export function lerp (start: number, end: number, percent: number): number {
    return start + (end - start) * percent;
};

export function flip (t: number): number {
    return 1 - t;
}

export function square (t: number): number {
    return t * t;
}

export function easeIn (t: number): number {
    return square(t);
};

export function easeOut (t: number): number {
    return flip(square(flip(t)));
};

export function easeInOut (t: number): number {
    return lerp(easeIn(t), easeOut(t), t);
};

export function randomInt (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}
