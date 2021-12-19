import * as PIXI from "pixi.js";

import { hexToRgb, randomInt } from "./math";

export function removeItem<T>(array: T[], item: T): void {
    const index = array.indexOf(item);
    if (index > -1) {
        array = array.splice(index, 1);
    }
}

export function registerPixiInspector(): void {
    (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&
        (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
}

export function hexToString(hex: number): string {
    if (hex === undefined) return undefined;

    const { r, g, b } = hexToRgb(hex);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function defer(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

const StringIsNumber = (value: string) => isNaN(Number(value)) === false;

export function EnumValues(enumme: any): any[] {
    return Object.keys(enumme).filter(StringIsNumber);
}

export function EnumKeys(enumme: any): any[] {
    return EnumValues(enumme).map(key => enumme[key]);
}

export function randomItem<T>(array: T[]): T {
    return array[randomInt(0, array.length)];
}

export function capitalize(string: string): string {
    return string.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}
