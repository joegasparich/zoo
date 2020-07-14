import InputManager, { Input } from "engine/managers/InputManager";

const LeftMouse: Input = {
    name: "Left Click",
    buttons: [InputManager.MOUSE_BUTTON.LEFT],
};
const RightMouse: Input = {
    name: "Right Click",
    buttons: [InputManager.MOUSE_BUTTON.RIGHT],
};
const Up: Input = {
    name: "Move Up",
    buttons: [
        InputManager.KEY.UP,
        InputManager.KEY.W,
    ],
};
const Down: Input = {
    name: "Move Down",
    buttons: [
        InputManager.KEY.DOWN,
        InputManager.KEY.S,
    ],
};
const Left: Input = {
    name: "Move Left",
    buttons: [
        InputManager.KEY.LEFT,
        InputManager.KEY.A,
    ],
};
const Right: Input = {
    name: "Move Right",
    buttons: [
        InputManager.KEY.RIGHT,
        InputManager.KEY.D,
    ],
};
const ZoomIn: Input = {
    name: "Zoom In",
    buttons: [InputManager.KEY.Z],
};
const ZoomOut: Input = {
    name: "Zoom Out",
    buttons: [InputManager.KEY.X],
};

const Inputs = {
    LeftMouse, RightMouse,
    Up, Down, Left, Right,
    ZoomIn, ZoomOut,
};

export default Inputs;
