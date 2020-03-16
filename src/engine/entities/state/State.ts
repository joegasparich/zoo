import { Entity } from "engine/entities";

export enum INPUT {
    MOVE,
    STILL,
    USE
};

export default interface State {
    enter(): void;
    exit(): void;
    handleInput(input: INPUT): State | void;
    update(entity: Entity, delta: number): void;
    [propName: string]: any;
};
