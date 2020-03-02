import System from "./System";
import RenderSystem from "./RenderSystem";
import PhysicsSystem from "./PhysicsSystem";
import InputSystem from "./InputSystem";
import PlayerInputSystem from "./PlayerInputSystem";

export const enum SYSTEM {
    RENDER_SYSTEM,
    PHYSICS_SYSTEM,
    INPUT_SYSTEM,
    PLAYER_INPUT_SYSTEM,
}

export {
    System,
    RenderSystem,
    PhysicsSystem,
    InputSystem,
    PlayerInputSystem,
};