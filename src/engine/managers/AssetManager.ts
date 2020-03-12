import { Tileset } from "engine";
import { MapData, TiledMap } from "engine/map";

import parseTiledMap from "../helpers/parseTiledMap";

class AssetManager {
    private loader: PIXI.Loader;
    private tilesets: Map<string, Tileset>;

    constructor() {
        this.loader = new PIXI.Loader();

        this.tilesets = new Map<string, Tileset>();
    }

    loadAssets(assets: string[]) {
        this.loader.add(assets);
    }

    doLoad(callback: Function) {
        this.loader.load((loader, resources) => {
            callback();
        });
    }

    getTexture(key: string): PIXI.Texture {
        return this.loader.resources[key].texture
    }

    getTexturesByType(type: object): PIXI.Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    registerTileset(key: string): void {
        this.tilesets.set(key, new Tileset(this.loader.resources[key].texture, 32, 32));
    }

    getTileset(key: string): Tileset {
        return this.tilesets.get(key);
    }

    getMap(key: string): MapData {
        return parseTiledMap(this.loader.resources[key].data as TiledMap);
    }
}

export default new AssetManager();