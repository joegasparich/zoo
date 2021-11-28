import * as React from "react";
import Vector from "vector";

import Game from "Game";
import Windows from "./components/Windows";
import ToolManager from "./ToolManager";
import Mediator from "Mediator";
import { UIEvent } from "consts/events";
import { ToolType } from "./tools";

class UIManager {
    private tools: ToolManager;

    private focusListener: string;
    private unfocusListener: string;
    private windowsRef: React.RefObject<Windows>;

    private currentFocus: string;

    public setup(): void {
        this.windowsRef = React.createRef();

        this.tools = new ToolManager();
        this.tools.setup();

        Game.canvas.addChild(React.createElement(Windows, {
            key: "windows",
            ref: this.windowsRef,
        }));

        this.focusListener = Mediator.on(UIEvent.FOCUS, ({id}: {id: string}) => {
            this.currentFocus = id;
        });
        this.unfocusListener = Mediator.on(UIEvent.UNFOCUS, () => this.currentFocus = "");
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

        Mediator.unsubscribe(UIEvent.FOCUS, this.focusListener);
        Mediator.unsubscribe(UIEvent.UNFOCUS, this.unfocusListener);
    }

    public getCurrentTool(): ToolType {
        return this.tools.getActiveTool();
    }

    public hasFocus(): boolean {
        return !!this.currentFocus || this.tools.hasFocus();
    }

    public openWindow(id: string, title: string, position: Vector, content: JSX.Element): void {
        this.windowsRef.current.openWindow(id, title, position, content);
    }
}

export default new UIManager();
