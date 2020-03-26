import * as path from "path";

import { Tileset } from "engine";
import { MapData, TiledMap, TiledSet } from "engine/map";

import { parseTiledMap, parseTiledSet } from "../helpers/parseTiled";

class AssetManager {
    private loader: PIXI.Loader;
    private preloadedAssets: string[];

    constructor() {
        this.loader = new PIXI.Loader();
    }

    public preLoadAssets(assets: string[]): void {
        if (!this.preloadedAssets) {
            this.preloadedAssets = [];
        }

        this.preloadedAssets.push(...assets);
    }

    public async doPreLoad(onProgress?: Function): Promise<PIXI.LoaderResource[]> {
        return this.loadResources(this.preloadedAssets, onProgress);
    }

    public async loadResource(asset: string, onProgress?: Function): Promise<PIXI.LoaderResource> {
        if (!asset) {
            return null;
        }

        const resources = await this.loadResources([asset], onProgress);

        return resources[0];
    }

    public loadResources(assets: string[], onProgress?: Function): Promise<PIXI.LoaderResource[]> {
        if (!assets || !assets.length) {
            return null;
        }

        this.loader.add(assets);
        const progressListener: (loader: PIXI.Loader) => void = loader => onProgress && onProgress(loader.progress);
        this.loader.on("progress", progressListener);

        return new Promise((resolve) => {
            this.loader.load((loader, resources) => {
                this.loader.off("progress", progressListener);
                resolve(assets.map(asset => resources[asset]));
            });
        });
    }

    public getTexture(key: string): PIXI.Texture {
        return this.loader.resources[key].texture;
    }

    public hasTexture(key: string): boolean {
        return !!this.loader.resources[key];
    }

    public getTexturesByType(type: object): PIXI.Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    public async loadMapData(location: string, onProgress?: Function): Promise<MapData> {
        // Load Map
        const mapResource = await this.loadResource(location, (progress: number) => onProgress && onProgress(progress/3));
        const tiledMap = parseTiledMap(mapResource.data as TiledMap);
        tiledMap.tileSetPath = path.join(location, "..", tiledMap.tileSetPath);

        // Load Tileset
        const tilesetResource = await this.loadResource(tiledMap.tileSetPath, (progress: number) => onProgress && onProgress(progress/3 + 33.33));
        const tiledSet = tilesetResource.data as TiledSet;

        // Load Tileset Image
        const imagePath = path.join(tiledMap.tileSetPath, "..", tiledSet.image);
        const imageResource = await this.loadResource(imagePath, (progress: number) => onProgress && onProgress(progress/3 + 66.66));
        const tileSetData = parseTiledSet(tiledSet, imageResource.texture);
        tiledMap.tileSet = new Tileset(tileSetData);

        return tiledMap;
    }
}

export default new AssetManager();
