const GROUND = new PIXI.display.Group(0, false);
const WATER = new PIXI.display.Group(1, false);
const ENTITIES = new PIXI.display.Group(2, (sprite: PIXI.Sprite) => sprite.zOrder = sprite.y);
const UI = new PIXI.display.Group(3, false);
const DEBUG = new PIXI.display.Group(4, false);

export default {
    GROUND,
    WATER,
    ENTITIES,
    UI,
    DEBUG,
};
