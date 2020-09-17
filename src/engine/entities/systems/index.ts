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
};
