import * as React from "react";

import { Vector } from "engine";
import Mediator from "engine/Mediator";
import { UIEvent } from "engine/consts/events";

import ZooGame from "ZooGame";
import { Inputs } from "consts";
import { Toolbar } from "./components";
import { BiomeTool, DoorTool, NoTool, Tool, ToolType, TreeTool, WallTool, DeleteTool, HillTool } from "./tools";
import PlacementGhost from "./PlacementGhost";

export default class ToolManager {
    private activeTool: Tool;
    public radius: number;

    private ghost: PlacementGhost;

    private toolbarRef: React.RefObject<Toolbar>;

    public constructor() {
        this.ghost = new PlacementGhost();

        this.setTool(ToolType.None);

        this.toolbarRef = React.createRef();
        ZooGame.canvas.addChild(React.createElement(Toolbar, {
            key: "toolbar",
            toolManager: this,
            ref: this.toolbarRef,
        }));
    }

    public update(): void {
        if(ZooGame.input.isInputPressed(Inputs.RightMouse)) {
            this.setTool(ToolType.None);
            this.toolbarRef.current?.setState({activeTool: ToolType.None});
            Mediator.fire(UIEvent.UNFOCUS);
        }

        this.activeTool.update();

        if (this.showRadius()) {
            if (ZooGame.input.isInputPressed(Inputs.IncreaseBrushSize)) {
                this.setRadius(Math.min(this.radius + 0.125, 2.5));
            }
            if (ZooGame.input.isInputPressed(Inputs.DecreaseBrushSize)) {
                this.setRadius(Math.max(this.radius - 0.125, 0.25));
            }
        }
    }

    public postUpdate(): void {
        this.activeTool.postUpdate();
        this.ghost.postUpdate();
    }

    public setTool(tool: ToolType, data?: Record<string, any>): void {
        this.ghost.setVisible(true);
        this.ghost.setPivot(new Vector(0.5, 0.5));
        this.ghost.setOffset(new Vector(0, 0));

        switch(tool) {
            case ToolType.Tree: this.activeTool = new TreeTool(this); break;
            case ToolType.Wall: this.activeTool = new WallTool(this); break;
            case ToolType.Door: this.activeTool = new DoorTool(this); break;
            case ToolType.Delete: this.activeTool = new DeleteTool(this); break;
            case ToolType.Biome: this.activeTool = new BiomeTool(this); break;
            case ToolType.Hill: this.activeTool = new HillTool(this); break;

            case ToolType.None:
            default:
                this.activeTool = new NoTool(this);
                break;
        }

        this.activeTool.set(this.ghost, data);
    }

    public setRadius(radius: number): void {
        this.radius = radius;
        this.toolbarRef.current?.setState({radius});
    }

    public showRadius(): boolean {
        switch(this.activeTool.type) {
            case ToolType.Biome:
            case ToolType.Hill:
                return true;
            default:
                return false;
        }
    }

    public hasFocus(): boolean {
        return this.activeTool.type !== ToolType.None;
    }
}
