export { default as System } from "./System";
export { default as RenderSystem } from "./RenderSystem";
export { default as AnimatedRenderSystem } from "./AnimatedRenderSystem";
export { default as PhysicsSystem } from "./PhysicsSystem";
export { default as InputSystem } from "./InputSystem";
export { default as CameraFollowSystem } from "./CameraFollowSystem";
export { default as PathFollowSystem } from "./PathFollowSystem";
export { default as WallAvoidanceSystem } from "./WallAvoidanceSystem";

export const SYSTEM = {
    RENDER_SYSTEM: "RENDER_SYSTEM",
    ANIMATED_RENDER_SYSTEM: "ANIMATED_RENDER_SYSTEM",
    PHYSICS_SYSTEM: "PHYSICS_SYSTEM",
    INPUT_SYSTEM: "INPUT_SYSTEM",
    CAMERA_FOLLOW_SYSTEM: "CAMERA_FOLLOW_SYSTEM",
    PATH_FOLLOW_SYSTEM: "PATH_FOLLOW_SYSTEM",
    WALL_AVOIDANCE_SYSTEM: "WALL_AVOIDANCE_SYSTEM",
};
