export default interface State {
    enter?(): void;
    exit?(): void;
    handleInput(input: string): State | void;
    update?(delta: number, ...opts: any[]): void;
    [propName: string]: any;
};
