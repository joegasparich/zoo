export { default as Component } from "./Component";
export { default as RenderComponent } from "./RenderComponent";
export { default as AnimatedRenderComponent } from "./AnimatedRenderComponent";
export { default as PhysicsComponent } from "./PhysicsComponent";
export { default as InputComponent } from "./InputComponent";
export { default as CameraFollowComponent } from "./CameraFollowComponent";
export { default as PathFollowComponent } from "./PathFollowComponent";
export { default as WallAvoidanceComponent } from "./WallAvoidanceComponent";
export { default as InputToPhysicsComponent } from "./InputToPhysicsComponent";
export { default as PathBlockComponent } from "./PathBlockComponent";
export { default as ActorInputComponent } from "./ActorInputComponent";
export { default as SnapToGridComponent } from "./SnapToGridComponent";
export { default as FollowMouseComponent } from "./FollowMouseComponent";
export { default as AreaPathFollowComponent } from "./AreaPathFollowComponent";
export { default as ElevationComponent } from "./ElevationComponent";
export { default as TileObjectComponent } from "./TileObjectComponent";

export { createComponent } from "./createComponent";

export const COMPONENT = {
    RENDER_COMPONENT: "RENDER_COMPONENT",
    ANIMATED_RENDER_COMPONENT: "ANIMATED_RENDER_COMPONENT",
    PHYSICS_COMPONENT: "PHYSICS_COMPONENT",
    INPUT_COMPONENT: "INPUT_COMPONENT",
    CAMERA_FOLLOW_COMPONENT: "CAMERA_FOLLOW_COMPONENT",
    PATH_FOLLOW_COMPONENT: "PATH_FOLLOW_COMPONENT",
    WALL_AVOIDANCE_COMPONENT: "WALL_AVOIDANCE_COMPONENT",
    INPUT_TO_PHYSICS_COMPONENT: "INPUT_TO_PHYSICS_COMPONENT",
    PATH_BLOCK_COMPONENT: "PATH_BLOCK_COMPONENT",
    ACTOR_INPUT_COMPONENT: "ACTOR_INPUT_COMPONENT",
    SNAP_TO_GRID_COMPONENT: "SNAP_TO_GRID_COMPONENT",
    FOLLOW_MOUSE_COMPONENT: "FOLLOW_MOUSE_COMPONENT",
    AREA_PATH_FOLLOW_COMPONENT: "AREA_PATH_FOLLOW_COMPONENT",
    ELEVATION_COMPONENT: "ELEVATION_COMPONENT",
    TILE_OBJECT_COMPONENT: "TILE_OBJECT_COMPONENT",
};
