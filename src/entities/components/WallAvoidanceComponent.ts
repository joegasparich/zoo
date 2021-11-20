import * as Planck from "planck-js";

import { PhysicsComponent, COMPONENT, Component } from ".";
import { Entity } from "..";
import * as util from "helpers/util";
import Vector from "vector";
import Game from "Game";
import { FromVec2 } from "helpers/vectorHelper";

const TRIGGER_DISTANCE = 1;
const AVOID_STRENGTH = 10;

export default class WallAvoidanceComponent extends Component {
    public id: COMPONENT = "WALL_AVOIDANCE_COMPONENT";
    public type: COMPONENT = "WALL_AVOIDANCE_COMPONENT";

    public shouldAvoid = true;

    private physics: PhysicsComponent;

    // TODO: Store this in a singleton somewhere so there isn't an array of walls for every entity
    private walls: Planck.Fixture[];

    public start(entity: Entity): void {
        super.start(entity);

        this.walls = [];

        this.physics = entity.getComponent("PHYSICS_COMPONENT");

        const avoidanceArea = new Planck.Circle(TRIGGER_DISTANCE);
        const fixture = this.physics.body.createFixture(avoidanceArea, {isSensor: true});

        // Listen for contact
        Game.physicsManager.onContact(
            fixture,
            contact => {
                // TODO: Ensure that the fixtures are walls
                const other = contact.getFixtureA() === fixture ? contact.getFixtureB() : contact.getFixtureA();
                if (other.isSensor()) return;
                this.walls.push(other);
            },
            contact => {
                const other = contact.getFixtureA() === fixture ? contact.getFixtureB() : contact.getFixtureA();
                if (other.isSensor()) return;
                util.removeItem(this.walls, other);
            },
        );
    }

    public update(delta: number): void {
        super.update(delta);

        if (!this.shouldAvoid) return;

        let closestWall: Planck.Fixture;
        let closestDist = Infinity;
        this.walls.forEach((wall: Planck.Fixture) => {
            const dist = Vector.Distance(this.entity.position, FromVec2(wall.getBody().getPosition()));
            if (dist < closestDist) {
                closestWall = wall;
                closestDist = dist;
            }
        });

        if (closestWall) {
            const closestWallPos = FromVec2(closestWall.getBody().getPosition());
            this.physics.addForce(this.entity.position.subtract(closestWallPos).multiply(AVOID_STRENGTH / closestDist));
        }
    }

}
