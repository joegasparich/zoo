import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from ".";
import Game from "Game";
import { Entity } from "entities";
import { Assets } from "consts";
import Needs from "./Needs";

const GUEST_UPDATE_INTERVAL = 1000;

interface GuestInfoProps extends UIComponentProps {
    guestId: string;
    closeWindow?: () => void;
}

interface GuestInfoState {
    guest: Entity;
}
const defaultState: GuestInfoState = {
    guest: undefined,
};

export default class GuestInfo extends UIComponent<GuestInfoProps, GuestInfoState> {
    private updateIntervalHandle: number;

    public constructor(props: GuestInfoProps) {
        super(props);

        this.state = defaultState;

        this.updateIntervalHandle = window.setInterval(this.updateAnimal.bind(this), GUEST_UPDATE_INTERVAL);
    }

    public componentDidMount(): void {
        this.updateAnimal();
    }
    public componentWillUnmount(): void {
        window.clearInterval(this.updateIntervalHandle);
    }

    private updateAnimal(): void {
        const guest = Game.getEntityById(this.props.guestId);

        if (!guest?.exists) {
            this.props.closeWindow?.();
            return;
        }

        // Setting the state to the same animal will force a rerender
        this.setState({
            guest,
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 400px;
            background: #ddd;
            padding: 0 20px;
            overflow: auto;

            p,
            ul {
                margin: 0;
            }

            .image {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 5px;
                border: 1px solid black;
                background: white;
            }
        `;
    }

    protected getContent(): JSX.Element {
        if (!this.state.guest) {
            return <div />;
        }

        const { guest } = this.state;
        const guestComponent = guest.getComponent("GUEST_COMPONENT");

        return (
            <div className="animal">
                <img className="image" src={Assets.SPRITES.GUEST} />
                <p>Needs: </p>
                <Needs needs={guestComponent.needs.needs} />
            </div>
        );
    }
}
