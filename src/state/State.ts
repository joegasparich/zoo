export default interface State {
    enter?(): void;
    exit?(): void;
    update?(delta: number, ...opts: any[]): void;
    save?(): Record<string, any>;
    load?(data: Record<string, any>): void;
    [propName: string]: any;
}
