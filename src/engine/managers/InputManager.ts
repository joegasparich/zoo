import { Game, Vector } from "engine";

enum KEY {
    UP = "ArrowUp",
    DOWN = "ArrowDown",
    LEFT = "ArrowLeft",
    RIGHT = "ArrowRight",
    SPACE = "Space",
    Z = "z",
    X = "x",
}
enum MOUSE_BUTTON {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

export default class InputManager {

    // smh no enum class members
    public static readonly KEY = KEY;
    public static readonly MOUSE_BUTTON = MOUSE_BUTTON;

    private game: Game;

    private keys: string[];
    private keysDown: string[];
    private keysUp: string[];

    private mousePos: Vector;
    private mouseButtons: number[];
    private mouseButtonsUp: number[];
    private mouseButtonsDown: number[];

    public constructor(game: Game) {
        this.game = game;

        //-- Keyboard --//
        this.keys = [];
        this.keysDown = [];
        this.keysUp = [];

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (Object.values(KEY).includes(event.key as KEY)) {
                event.preventDefault();
            }

            if (this.keys.includes(event.key)) return;
            this.keys.push(event.key);
            this.keysDown.push(event.key);
        });

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            const index = this.keys.indexOf(event.key);
            if (index !== -1) this.keys.splice(index, 1);
            this.keysUp.push(event.key);
        });

        //-- Mouse --//
        this.mouseButtons = [];
        this.mouseButtonsDown = [];
        this.mouseButtonsUp = [];

        this.mousePos = Vector.Zero;
        document.addEventListener("mousemove", (event: MouseEvent) => {
            this.mousePos = new Vector(event.offsetX, event.offsetY);
        });

        document.addEventListener("mousedown", (event: MouseEvent) => {
            if (Object.values(MOUSE_BUTTON).includes(event.button as MOUSE_BUTTON)) {
                event.preventDefault();
            }

            if (this.mouseButtons.includes(event.button)) return;
            this.mouseButtons.push(event.button);
            this.mouseButtonsDown.push(event.button);
        });

        document.addEventListener("mouseup", (event: MouseEvent) => {
            const index = this.mouseButtons.indexOf(event.button);
            if (index !== -1) this.mouseButtons.splice(index, 1);
            this.mouseButtonsUp.push(event.button);
        });
    }

    public clearKeys(): void {
        // Reset one tick key lists
        this.keysDown = [];
        this.keysUp = [];
        this.mouseButtonsDown = [];
        this.mouseButtonsUp = [];
    }

    public isKeyPressed(key: KEY): boolean {
        return this.keysDown.includes(key);
    }
    public isKeyHeld(key: KEY): boolean {
        return this.keys.includes(key);
    }
    public isKeyReleased(key: KEY): boolean {
        return this.keysUp.includes(key);
    }

    public getMousePos(): Vector {
        return this.mousePos;
    }
    public isMouseButtonPressed(button: MOUSE_BUTTON): boolean {
        return this.mouseButtonsDown.includes(button);
    }
    public isMouseButtonHeld(button: MOUSE_BUTTON): boolean {
        return this.mouseButtons.includes(button);
    }
    public isMouseButtonReleased(button: MOUSE_BUTTON): boolean {
        return this.mouseButtonsUp.includes(button);
    }
}
