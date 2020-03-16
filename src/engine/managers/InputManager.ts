enum KEY {
    UP = "ArrowUp",
    DOWN = "ArrowDown",
    LEFT = "ArrowLeft",
    RIGHT = "ArrowRight",
    SPACE = " "
}

export default class InputManager {

    public static KEY = KEY;

    keys: string[];
    keysDown: string[];
    keysUp: string[];

    constructor() {
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
    }

    clearKeys(): void {
        // Reset one tick key lists
        this.keysDown = [];
        this.keysUp = [];
    }

    isKeyPressed(key: KEY): boolean {
        return this.keysDown.includes(key);
    }
    isKeyHeld(key: KEY): boolean {
        return this.keys.includes(key);
    }
    isKeyReleased(key: KEY): boolean {
        return this.keysUp.includes(key);
    }
}
