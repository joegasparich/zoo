import { PhysicsSystem, SYSTEM, System } from ".";
import { Entity } from "..";
import * as Planck from "planck-js";
import * as util from "engine/helpers/util";
import { Vector } from "engine";

const TRIGGER_DISTANCE = 0.3;
const AVOID_STRENGTH = 30;

export default class WallAvoidanceSystem extends System {
    id = SYSTEM.WALL_AVOIDANCE_SYSTEM;

    physics: PhysicsSystem;

    walls: Planck.Fixture[];

    public start(entity: Entity): void {
        super.start(entity);

        this.walls = [];

        this.physics = entity.getSystem(SYSTEM.PHYSICS_SYSTEM) as PhysicsSystem;
        if (!this.physics) {
            console.error("WallAvoidanceSystem requires PhysicsSystem");
        }

        const avoidanceArea = new Planck.Circle(TRIGGER_DISTANCE);
        const fixture = this.physics.body.createFixture(avoidanceArea, {isSensor: true});

        // Listen for contact
        this.game.physicsManager.onContact(
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
                this.walls = util.removeItem(this.walls, other);
            },
        );
    }

    public update(delta: number): void {
        super.update(delta);

        let closestWall: Planck.Fixture;
        let closestDist = Infinity;
        this.walls.forEach((wall: Planck.Fixture) => {
            const dist = Vector.Distance(this.entity.position, Vector.FromVec2(wall.getBody().getPosition()));
            if (dist < closestDist) {
                closestWall = wall;
                closestDist = dist;
            }
        });

        if (closestWall) {
            const closestWallPos = Vector.FromVec2(closestWall.getBody().getPosition());
            this.physics.addForce(this.entity.position.subtract(closestWallPos).multiply(AVOID_STRENGTH / closestDist));
        }
    }

}
