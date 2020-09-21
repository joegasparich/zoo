export { default as System } from "./System";
export { default as RenderSystem } from "./RenderSystem";
export { default as AnimatedRenderSystem } from "./AnimatedRenderSystem";
export { default as PhysicsSystem } from "./PhysicsSystem";
export { default as InputSystem } from "./InputSystem";
export { default as CameraFollowSystem } from "./CameraFollowSystem";
export { default as PathFollowSystem } from "./PathFollowSystem";
export { default as WallAvoidanceSystem } from "./WallAvoidanceSystem";
export { default as InputToPhysicsSystem } from "./InputToPhysicsSystem";
export { default as PathBlockSystem } from "./PathBlockSystem";
export { default as ActorInputSystem } from "./ActorInputSystem";
export { default as SnapToGridSystem } from "./SnapToGridSystem";
export { default as FollowMouseSystem } from "./FollowMouseSystem";
export { default as AreaPathFollowSystem } from "./AreaPathFollowSystem";
export { default as ElevationSystem } from "./ElevationSystem";
export { default as TileObjectSystem } from "./TileObjectSystem";

export { createSystem } from "./createSystem";

export const SYSTEM = {
    RENDER_SYSTEM: "RENDER_SYSTEM",
    ANIMATED_RENDER_SYSTEM: "ANIMATED_RENDER_SYSTEM",
    PHYSICS_SYSTEM: "PHYSICS_SYSTEM",
    INPUT_SYSTEM: "INPUT_SYSTEM",
    CAMERA_FOLLOW_SYSTEM: "CAMERA_FOLLOW_SYSTEM",
    PATH_FOLLOW_SYSTEM: "PATH_FOLLOW_SYSTEM",
    WALL_AVOIDANCE_SYSTEM: "WALL_AVOIDANCE_SYSTEM",
    INPUT_TO_PHYSICS_SYSTEM: "INPUT_TO_PHYSICS_SYSTEM",
    PATH_BLOCK_SYSTEM: "PATH_BLOCK_SYSTEM",
    ACTOR_INPUT_SYSTEM: "ACTOR_INPUT_SYSTEM",
    SNAP_TO_GRID_SYSTEM: "SNAP_TO_GRID_SYSTEM",
    FOLLOW_MOUSE_SYSTEM: "FOLLOW_MOUSE_SYSTEM",
    AREA_PATH_FOLLOW_SYSTEM: "AREA_PATH_FOLLOW_SYSTEM",
    ELEVATION_SYSTEM: "ELEVATION_SYSTEM",
    TILE_OBJECT_SYSTEM: "TILE_OBJECT_SYSTEM",
};
