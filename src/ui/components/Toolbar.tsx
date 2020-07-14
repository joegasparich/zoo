/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent } from "engine/ui";

import { TreeButton } from "ui/components";

export default class Toolbar extends UIComponent {

    protected getStyles(): SerializedStyles {
        return css`
            display: flex;
            justify-content: center;
            position: absolute;
            top: 0;
            width: 100%;
            height: 40px;
        `;
    }

    protected getContent(): JSX.Element {
        return <TreeButton />;
    }
}
