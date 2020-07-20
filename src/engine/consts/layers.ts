const GROUND = new PIXI.display.Group(0, false);
const ENTITIES = new PIXI.display.Group(1, (sprite: PIXI.Sprite) => sprite.zOrder = sprite.y);
const UI = new PIXI.display.Group(2, false);
const DEBUG = new PIXI.display.Group(3, false);

export default {
    GROUND,
    ENTITIES,
    UI,
    DEBUG,
};
