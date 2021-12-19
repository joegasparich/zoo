import MapGrid from "world/MapGrid";

export abstract class Scene {
    public name: string;

    public start(mapGrid: MapGrid): void {}
    public preUpdate(): void {}
    public update(): void {}
    public postUpdate(): void {}
    public stop(): void {}
}
