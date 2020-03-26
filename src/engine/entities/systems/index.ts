export { default as System } from "./System";
export { default as RenderSystem } from "./RenderSystem";
export { default as AnimatedRenderSystem } from "./AnimatedRenderSystem";
export { default as PhysicsSystem } from "./PhysicsSystem";
export { default as InputSystem } from "./InputSystem";
export { default as CameraFollowSystem } from "./CameraFollowSystem";

export const SYSTEM = {
    PHYSICS_SYSTEM: "PHYSICS_SYSTEM",
    RENDER_SYSTEM: "RENDER_SYSTEM",
    ANIMATED_RENDER_SYSTEM: "ANIMATED_RENDER_SYSTEM",
    CAMERA_FOLLOW_SYSTEM: "CAMERA_FOLLOW_SYSTEM",
}