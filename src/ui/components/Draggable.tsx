import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent } from ".";
import { UIComponentProps } from "./UIComponent";
import Vector from "vector";

export interface DraggableProps extends UIComponentProps {
    draggableClassName: string;
    position: Vector;
}
export interface DraggableState {
    position: Vector;
}

export default class Draggable extends UIComponent<DraggableProps, DraggableState> {
    public constructor(props: DraggableProps) {
        super(props);

        this.state = {
            position: props.position,
        };
    }

    public componentDidMount(): void {
        this.dragElement(this.getRootElement());
    }

    // https://www.w3schools.com/howto/howto_js_draggable.asp
    private dragElement(element: HTMLElement): void {
        const dragMouseDown = (event: MouseEvent): void => {
            event.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = event.clientX;
            pos4 = event.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        };

        const elementDrag = (event: MouseEvent): void => {
            event.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;
            // set the element's new position:
            element.style.top = element.offsetTop - pos2 + "px";
            element.style.left = element.offsetLeft - pos1 + "px";
            this.setState({
                position: new Vector(element.offsetTop - pos2, element.offsetLeft - pos1),
            });
        };

        const closeDragElement = (): void => {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        };

        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (element.getElementsByClassName(this.props.draggableClassName)) {
            // if present, the header is where you move the DIV from:
            (element.getElementsByClassName(this.props.draggableClassName)[0] as HTMLElement).onmousedown =
                dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            element.onmousedown = dragMouseDown;
        }
    }

    protected getStyles(): SerializedStyles {
        return css`
            position: absolute;
            top: ${this.props.position.y}px;
            left: ${this.props.position.x}px;
        `;
    }

    protected getContent(): JSX.Element {
        return <div>{this.props.children}</div>;
    }
}
