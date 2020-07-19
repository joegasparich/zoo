/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

export default class FloatingPanel extends UIComponent<UIComponentProps, {}> {
    protected getContent(): JSX.Element {
        return (
            <div className="container">{this.props.children}</div>
        );
    }

    protected getStyles(): SerializedStyles {
        const triangleSize = 4;

        return css`
            min-width: 40px;
            min-height: 40px;
            position: absolute;
            top: 45px;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 5px;
            box-sizing: border-box;

            // Triangle
            &:after {
                content: '';
                border: ${triangleSize}px solid transparent;
                border-bottom-color: #AAAAAA;
                border-top: 0;
                position: absolute;
                top: -${triangleSize}px;
                left: 50%;
                margin-left: -${triangleSize}px;
            }

            .container {
                display: flex;
            }
        `;
    }
}
