/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

interface UIComponentProps {
    key: string;
}

export default abstract class UIComponent extends React.Component<UIComponentProps> {
    private baseStyles = css`
        pointer-events: all;
        background: #AAAAAA;
    `;

    protected abstract getStyles(): SerializedStyles;
    protected abstract getContent(): JSX.Element;

    public render(): JSX.Element {
        const style = css`
            ${this.baseStyles};
            ${this.getStyles()}
        `;

        return (
            <div css={style}>
                {this.getContent()}
            </div>
        );
    }
}
