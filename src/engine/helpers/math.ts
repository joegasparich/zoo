import { Vector } from "engine";

export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function inCircle(circleCentre: Vector, radius: number, point: Vector): boolean {
    const dx = circleCentre.x - point.x;
    const dy = circleCentre.y - point.y;
    return (dx*dx + dy*dy) < radius*radius;
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
