export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export function lerp (start: number, end: number, amount: number): number {
    return (1 - amount) * start + amount * end;
};

export function randomInt (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
