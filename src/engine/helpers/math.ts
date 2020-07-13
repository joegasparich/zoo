export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

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
