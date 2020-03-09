import { SPRITES, TEXTURES, TILESETS, MAPS } from "constants/assets";
import Tileset from "Tileset";
import { CELL_SIZE } from "MapGrid";
import parseTiledMap from "helpers/parseTiledMap";
import MapData from "types/Map";
import { TiledMap } from "types/TiledMap";

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
        this.loader.add(Object.values(MAPS));
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

    getMap(key: string): MapData {
        return parseTiledMap(this.loader.resources[key].data as TiledMap);
    }
}

export default new AssetManager();