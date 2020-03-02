import Entity from "entities/Entity";

export enum INPUT {
    MOVE,
    STILL,
    USE
}

export default interface IState {
    enter(): void;
    exit(): void;
    handleInput(input: INPUT): IState | void;
    update(entity: Entity, delta: number): void;
    [propName: string]: any;
};
