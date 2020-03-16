import { World, Vec2, Body, Shape, Circle, Polygon, PolygonShape, CircleShape, FrictionJoint, FrictionJointDef } from "planck-js";

import { Vector } from "engine";
import Debug from "engine/Debug";
import { WORLD_SCALE, FRAME_RATE } from "engine/constants";
import { toVec2, toVector } from "engine/helpers/util";

type PhysicsObjOpts = {
    position: Vector;
    collider: Collider;
    isDynamic: boolean;
    maxSpeed?: number;
    friction?: number;
    density?: number;
};

enum ColliderType {
    Circle,
    Rect
};

type Collider = {
    type: ColliderType;
    radius?: number;
    width?: number;
    height?: number;
};

function getShape(collider: Collider): Shape {
    switch(collider.type) {
    case ColliderType.Circle:
        return Circle(collider.radius);
    case ColliderType.Rect:
        return Polygon([
            Vec2(-collider.width/2, -collider.height/2),
            Vec2(collider.width/2, -collider.height/2),
            Vec2(collider.width/2, collider.height/2),
            Vec2(-collider.width/2, collider.height/2),
        ]);
    }
}

export default class PhysicsManager {

    public static ColliderType = ColliderType;

    public world: World;
    public ground: Body;

    public setup(): void {
        this.world = World();
        this.ground = this.world.createBody();
        this.ground.createFixture(new Circle(0));
    }

    public update(delta: number): void {
        this.world.step(delta / FRAME_RATE);
        this.drawDebug();
    }

    public setGravity(direction: Vector): void {
        this.world.setGravity(toVec2(direction));
    }

    public createPhysicsObject(opts: PhysicsObjOpts): Body {
        const body = opts.isDynamic
            ? this.world.createDynamicBody({linearDamping: 5 / (opts.maxSpeed ?? 1)})
            : this.world.createBody();

        body.setPosition(toVec2(opts.position));
        body.createFixture(getShape(opts.collider), {
            friction: opts.friction ?? 1,
            density: opts.density ?? 1,
        });
        const def: FrictionJointDef = {
            bodyA: this.ground,
            bodyB: body,
            localAnchorA: new Vec2(0,0),
            localAnchorB: new Vec2(0,0),
            collideConnected: false,
            maxForce: 20 * (opts.friction ?? 1),
        };
        this.world.createJoint(FrictionJoint(def));

        return body;
    }

    drawDebug(): void {
        Debug.setLineStyle(1, 0xFF0000);
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                const shape = fixture.getShape();
                switch(shape.getType()) {
                case "circle":
                    const circle = shape as CircleShape;
                    Debug.drawCircle(toVector(body.getPosition()).multiply(WORLD_SCALE), circle.getRadius() * WORLD_SCALE);
                    break;
                case "polygon":
                    const polygon = shape as PolygonShape;
                    const vectorList = polygon.m_vertices.map(vec2 => new Vector(vec2.x, vec2.y).multiply(WORLD_SCALE));
                    Debug.drawVectorList(vectorList);
                    break;
                default:
                    break;
                }
            }
        }
    }
}
