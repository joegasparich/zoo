import { World, Vec2, Body, Shape, Circle, Polygon, PolygonShape, CircleShape } from "planck-js";

import { Vector } from "engine";
import Debug from "engine/Debug";
import { WORLD_SCALE } from "engine/constants";

function toVec2(vector: Vector): Vec2 {
    return new Vec2(vector.x, vector.y);
}
function toVector(vec2: Vec2): Vector {
    return new Vector(vec2.x, vec2.y);
}

enum ColliderType {
    Circle,
    Rect
}
type Collider = {
    type: ColliderType,
    radius?: number,
    width?: number,
    height?: number
}
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
            ])
    }
}

export default class PhysicsManager {

    public static ColliderType = ColliderType;

    public world: World

    public setup() {
        this.world = World();
    }

    public update(delta: number) {
        this.world.step(delta);
        this.drawDebug();
    }

    public setGravity(direction: Vector) {
        this.world.setGravity(toVec2(direction));
    }

    public createPhysicsObject(position: Vector, collider: Collider, isDynamic: boolean): Body {
        const body = isDynamic ? this.world.createDynamicBody({
            linearDamping: 0,
            angularDamping: 0.01
        }) : this.world.createBody();

        body.setPosition(toVec2(position));
        body.createFixture(getShape(collider));

        return body;
    }

    drawDebug() {
        Debug.setLineStyle(1, 0xFF0000);
        for (var body = this.world.getBodyList(); body; body = body.getNext()) {
            for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                const shape = fixture.getShape()
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