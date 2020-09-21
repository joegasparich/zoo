import { ColliderType } from "managers";
import Vector from "vector";
import { ActorInputSystem, PhysicsSystem, AnimatedRenderSystem, AreaPathFollowSystem, CameraFollowSystem, ElevationSystem, FollowMouseSystem, InputToPhysicsSystem, PathBlockSystem, PathFollowSystem, RenderSystem, SnapToGridSystem, SYSTEM, TileObjectSystem, WallAvoidanceSystem } from ".";
import { PhysicsSystemSaveData } from "./PhysicsSystem";
import System, { SystemSaveData } from "./System";

export function createSystem(systemData: SystemSaveData): System {
    switch(systemData.id) {
        case SYSTEM.RENDER_SYSTEM: return new RenderSystem();
        case SYSTEM.ANIMATED_RENDER_SYSTEM: return new AnimatedRenderSystem();
        case SYSTEM.CAMERA_FOLLOW_SYSTEM: return new CameraFollowSystem();
        case SYSTEM.PATH_FOLLOW_SYSTEM: return new PathFollowSystem();
        case SYSTEM.PHYSICS_SYSTEM:
            const data = systemData as PhysicsSystemSaveData;
            return new PhysicsSystem({
                type: data.collider.type as ColliderType,
                height: data.collider.height,
                width: data.collider.width,
                radius: data.collider.radius,
            }, data.isDynamic, data.density, data.tag, Vector.Deserialize(data.pivot));
        case SYSTEM.WALL_AVOIDANCE_SYSTEM: return new WallAvoidanceSystem();
        case SYSTEM.INPUT_TO_PHYSICS_SYSTEM: return new InputToPhysicsSystem();
        case SYSTEM.PATH_BLOCK_SYSTEM: return new PathBlockSystem();

        case SYSTEM.ACTOR_INPUT_SYSTEM: return new ActorInputSystem();
        case SYSTEM.AREA_PATH_FOLLOW_SYSTEM: return new AreaPathFollowSystem();
        case SYSTEM.FOLLOW_MOUSE_SYSTEM: return new FollowMouseSystem();
        case SYSTEM.SNAP_TO_GRID_SYSTEM: return new SnapToGridSystem();
        case SYSTEM.ELEVATION_SYSTEM: return new ElevationSystem();
        case SYSTEM.TILE_OBJECT_SYSTEM: return new TileObjectSystem();
        default: return undefined;
    }
}
