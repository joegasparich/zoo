export * as Assets from "./Assets";
export { default as Config } from "./config";
export { default as Inputs } from "./inputs";
export { GameEvent, MapEvent } from "./events";
export { default as RenderLayers } from "./layers";
export { TAG } from "./physicsTags";

/**Frames per second */
export const FRAME_RATE = 60; // TODO: Check this isn't changeable

export enum Side {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}
