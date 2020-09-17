import * as React from "react";
import Vector from "vector";

import Game from "Game";
import Windows from "./components/Windows";
import ToolManager from "./ToolManager";

class UIManager {
    private tools: ToolManager;

    private windowsRef: React.RefObject<Windows>;

    public setup(): void {
        this.windowsRef = React.createRef();

        this.tools = new ToolManager();
        this.tools.setup();

        Game.canvas.addChild(React.createElement(Windows, {
            key: "windows",
            ref: this.windowsRef,
        }));
    }

    public update(delta: number): void {
        this.tools.update();
    }

    public postUpdate(delta: number): void {
        this.tools.postUpdate();
    }

    public reset(): void {
        this.tools.reset();
        this.tools.setup();
    }

    public hasFocus(): boolean {
        return this.tools.hasFocus();
    }

    public openWindow(id: string, title: string, position: Vector, content: JSX.Element): void {
        this.windowsRef.current.openWindow(id, title, position, content);
    }
}

export default new UIManager();
