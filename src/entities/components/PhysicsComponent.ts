import { Component, COMPONENT } from ".";
import Vector from "vector";
import { Collider } from "managers";
import * as Planck from "planck-js";
import { Entity } from "..";
import { TAG } from "consts";
import { BodyUserData } from "managers/PhysicsManager";
import { ComponentSaveData } from "./Component";
import Game from "Game";
import { FromVec2, toVec2 } from "helpers/vectorHelper";

export interface PhysicsComponentSaveData extends ComponentSaveData {
    collider: {
        type: string;
        radius?: number;
        width?: number;
        height?: number;
    };
    isDynamic: boolean;
    density: number;
    tag: number;
    pivot: number[];
}

export default class PhysicsComponent extends Component {
    public id: COMPONENT = "PHYSICS_COMPONENT";
    public type: COMPONENT = "PHYSICS_COMPONENT";

    public body: Planck.Body;

    private lastPosition: Vector;

    public constructor(private collider: Collider, private isDynamic: boolean, private density = 10, public tag = TAG.Entity, private pivot = new Vector(0.5, 0.5)) {
        super();
    }

    public start(entity: Entity): void {
        super.start(entity);

        this.body = Game.physicsManager.createPhysicsObject({
            position: this.entity.position,
            collider: this.collider,
            tag: this.tag,
            pivot: this.pivot,
            isDynamic: this.isDynamic,
            density: this.density,
        });
        Game.physicsManager.registerBody(entity, this.body);
        this.lastPosition = this.entity.position;
    }

    public update(delta: number): void {
        super.update(delta);
        const offset = (this.body.getUserData() as BodyUserData).offset;

        if (this.entity.position !== this.lastPosition) {
            // Position has been altered somewhere, compensate
            this.body.setPosition(toVec2(this.entity.position.add(offset)));
        }

        this.entity.position = FromVec2(this.body.getPosition()).subtract(offset);
        this.lastPosition = this.entity.position;
    }

    public addForce(force: Vector): void {
        this.body.applyForceToCenter(toVec2(force), true);
    }

    public end(): void {
        Game.physicsManager.removeBody(this.body);
    }

    public save(): PhysicsComponentSaveData {
        return Object.assign({
            collider: {
                type: this.collider.type,
                radius: this.collider.radius,
                width: this.collider.width,
                height: this.collider.height,
            },
            isDynamic: this.isDynamic,
            density: this.density,
            tag: this.tag,
            pivot: Vector.Serialize(this.pivot),
        }, super.save());
    }
}
