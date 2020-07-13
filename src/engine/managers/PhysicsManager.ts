import * as Planck from "planck-js";

import { Game, Vector } from "engine";
import Debug from "engine/Debug";
import { FRAME_RATE } from "engine/constants";
import { Entity } from "engine/entities";

export type PhysicsObjOpts = {
    position: Vector;
    collider: Collider;
    isDynamic: boolean;
    maxSpeed?: number;
    friction?: number;
    density?: number;
};

export enum ColliderType {
    Circle,
    Rect
};

export type Collider = {
    type: ColliderType;
    radius?: number;
    width?: number;
    height?: number;
};

function getShape(collider: Collider): Planck.Shape {
    switch(collider.type) {
    case ColliderType.Circle:
        return Planck.Circle(collider.radius);
    case ColliderType.Rect:
        return Planck.Polygon([
            Planck.Vec2(-collider.width/2, -collider.height/2),
            Planck.Vec2(collider.width/2, -collider.height/2),
            Planck.Vec2(collider.width/2, collider.height/2),
            Planck.Vec2(-collider.width/2, collider.height/2),
        ]);
    }
}

export default class PhysicsManager {

    public static ColliderType = ColliderType;

    public game: Game;
    public world: Planck.World;
    public ground: Planck.Body;

    private entityBody: Map<Entity, Planck.Body>;
    private bodyEntity: Map<Planck.Body, Entity>;

    private listeners: Map<Planck.Fixture, {
        enter: ((contact: Planck.Contact) => void);
        exit: ((contact: Planck.Contact) => void);
    }[]>;

    constructor(game: Game) {
        this.game = game;

        this.listeners = new Map();
        this.entityBody = new Map();
        this.bodyEntity = new Map();
    }

    public setup(): void {
        this.world = Planck.World();
        this.ground = this.world.createBody();
        this.ground.createFixture(new Planck.Circle(0));

        this.world.on("begin-contact", (contact: Planck.Contact) => {
            this.listeners.get(contact.getFixtureA())?.forEach(callbacks => callbacks.enter(contact));
            this.listeners.get(contact.getFixtureB())?.forEach(callbacks => callbacks.enter(contact));
        });
        this.world.on("end-contact", (contact: Planck.Contact) => {
            this.listeners.get(contact.getFixtureA())?.forEach(callbacks => callbacks.exit(contact));
            this.listeners.get(contact.getFixtureB())?.forEach(callbacks => callbacks.exit(contact));
        });
    }

    public update(delta: number): void {
        this.world.step(delta / FRAME_RATE);
        this.drawDebug();
    }

    public setGravity(direction: Vector): void {
        this.world.setGravity(direction.toVec2());
    }

    public registerBody(entity: Entity, body: Planck.Body): void {
        this.entityBody.set(entity, body);
        this.bodyEntity.set(body, entity);
    }

    public getBody(entity: Entity): Planck.Body {
        return this.entityBody.get(entity);
    }

    public getEntity(body: Planck.Body): Entity {
        return this.bodyEntity.get(body);
    }

    public createPhysicsObject(opts: PhysicsObjOpts): Planck.Body {
        const body = opts.isDynamic
            ? this.world.createDynamicBody({linearDamping: 5 / (opts.maxSpeed ?? 1)})
            : this.world.createBody();

        body.setPosition(opts.position.toVec2());
        body.createFixture(getShape(opts.collider), {
            friction: opts.friction ?? 1,
            density: opts.density ?? 1,
        });
        const def: Planck.FrictionJointDef = {
            bodyA: this.ground,
            bodyB: body,
            localAnchorA: new Planck.Vec2(0,0),
            localAnchorB: new Planck.Vec2(0,0),
            collideConnected: false,
            maxForce: 20 * (opts.friction ?? 1),
        };
        this.world.createJoint(Planck.FrictionJoint(def));

        return body;
    }

    public onContact(fixture: Planck.Fixture, enter: (contact: Planck.Contact) => void, exit: (contact: Planck.Contact) => void): void {
        if (!this.listeners.has(fixture)) {
            this.listeners.set(fixture, [{enter, exit}]);
        } else {
            this.listeners.get(fixture).push({enter, exit});
        }
    }

    private drawDebug(): void {
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                Debug.setLineStyle(1, 0xFF0000);
                if (fixture.isSensor()) Debug.setLineStyle(1, 0x0000FF);
                const shape = fixture.getShape();
                switch(shape.getType()) {
                case "circle":
                    const circle = shape as Planck.CircleShape;
                    Debug.drawCircle(Vector.FromVec2(body.getPosition()).multiply(this.game.opts.worldScale), circle.getRadius() * this.game.opts.worldScale);
                    break;
                case "polygon":
                    const polygon = shape as Planck.PolygonShape;
                    const vectorList = polygon.m_vertices.map(vec2 => new Vector(vec2.x, vec2.y)
                        .add(Vector.FromVec2(body.getPosition()))
                        .multiply(this.game.opts.worldScale));
                    Debug.drawVectorList(vectorList);
                    break;
                default:
                    break;
                }
            }
        }
    }
}
