export abstract class Scene {
    public name: string;

    public start(): void {}
    public preUpdate(delta: number): void {}
    public update(delta: number): void {}
    public postUpdate(delta: number): void {}
    public stop(): void {}
}
