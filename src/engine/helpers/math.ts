export type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number,
}

export function lerp (start: number, end: number, amount: number){
    return (1 - amount) * start + amount * end;
}