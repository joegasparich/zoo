import * as PIXI from 'pixi.js';
import { SPRITES, TEXTURES } from "constants/assets";

class AssetManager {
    loader: PIXI.Loader;
    onCompleteCallbacks: Function[];

    constructor() {
        this.loader = new PIXI.Loader();
        this.onCompleteCallbacks = [];

        this.loader.add(Object.values(SPRITES));
        this.loader.add(Object.values(TEXTURES));

        this.loader.load((loader, resources) => {
            this.onCompleteCallbacks.forEach(callback => callback(loader, resources))
        });
    }

    onLoadComplete(callback: Function) {
        this.onCompleteCallbacks.push(callback);
    }
}

export default new AssetManager();