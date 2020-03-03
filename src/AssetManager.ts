import { SPRITES, TEXTURES, TILESETS } from "constants/assets";
import Tileset from "Tileset";
import { CELL_SIZE } from "MapGrid";

class AssetManager {
    private loader: PIXI.Loader;
    private tilesets: Map<string, Tileset>;
    private onCompleteCallbacks: Function[];

    constructor() {
        this.loader = new PIXI.Loader();
        this.onCompleteCallbacks = [];

        this.loader.add(Object.values(SPRITES));
        this.loader.add(Object.values(TEXTURES));
        this.loader.add(Object.values(TILESETS));
        this.tilesets = new Map<string, Tileset>();

        this.loader.load((loader, resources) => {
            Object.values(TILESETS).forEach((tileset: string) => {
                // TODO Add some filename parsing to get tile width & height
                this.tilesets.set(tileset, new Tileset(resources[tileset].texture, CELL_SIZE, CELL_SIZE));
            });

            this.onCompleteCallbacks.forEach(callback => callback(loader, resources))
        });
    }

    onLoadComplete(callback: Function) {
        this.onCompleteCallbacks.push(callback);
    }

    getTexture(key: string): PIXI.Texture {
        return this.loader.resources[key].texture
    }

    getTexturesByType(type: object): PIXI.Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    getTileset(key: string): Tileset {
        return this.tilesets.get(key);
    }
}

export default new AssetManager();