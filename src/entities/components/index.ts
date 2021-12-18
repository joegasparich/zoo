import Component, { ComponentSaveData } from "./Component";

import RenderComponent from "./RenderComponent";
import AnimatedRenderComponent from "./AnimatedRenderComponent";
import SimplePhysicsComponent from "./SimplePhysicsComponent";
import InputComponent from "./InputComponent";
import DebuggableComponent from "./DebuggableComponent";
import CameraFollowComponent from "./CameraFollowComponent";
import PathFollowComponent from "./PathFollowComponent";
import InputToPhysicsComponent from "./InputToPhysicsComponent";
import SolidComponent from "./SolidComponent";
import ActorInputComponent from "./ActorInputComponent";
import SnapToGridComponent from "./SnapToGridComponent";
import FollowMouseComponent from "./FollowMouseComponent";
import AreaPathFollowComponent from "./AreaPathFollowComponent";
import ElevationComponent from "./ElevationComponent";
import TileObjectComponent from "./TileObjectComponent";
import NeedsComponent from "./NeedsComponent";
import AnimalBehaviourComponent from "./AnimalBehaviourComponent";
import ConsumableComponent from "./ConsumableComponent";

// prettier-ignore
export function createComponent(componentData: ComponentSaveData): Component {
    switch(componentData.id) {
        case "RENDER_COMPONENT": return new RenderComponent();
        case "ANIMATED_RENDER_COMPONENT": return new AnimatedRenderComponent();
        case "CAMERA_FOLLOW_COMPONENT": return new CameraFollowComponent();
        case "SIMPLE_PHYSICS_COMPONENT": return new SimplePhysicsComponent();
        case "DEBUGGABLE_COMPONENT": return new DebuggableComponent();
        case "PATH_FOLLOW_COMPONENT": return new PathFollowComponent();
        case "INPUT_TO_PHYSICS_COMPONENT": return new InputToPhysicsComponent();
        case "SOLID_COMPONENT": return new SolidComponent();
        case "ACTOR_INPUT_COMPONENT": return new ActorInputComponent();
        case "AREA_PATH_FOLLOW_COMPONENT": return new AreaPathFollowComponent();
        case "FOLLOW_MOUSE_COMPONENT": return new FollowMouseComponent();
        case "SNAP_TO_GRID_COMPONENT": return new SnapToGridComponent();
        case "ELEVATION_COMPONENT": return new ElevationComponent();
        case "TILE_OBJECT_COMPONENT": return new TileObjectComponent();
        case "NEEDS_COMPONENT": return new NeedsComponent();
        case "ANIMAL_BEHAVIOUR_COMPONENT": return new AnimalBehaviourComponent();
        case "CONSUMABLE_COMPONENT": return new ConsumableComponent();
        default: return undefined;
    }
}

export type COMPONENT =
    | "RENDER_COMPONENT"
    | "ANIMATED_RENDER_COMPONENT"
    | "SIMPLE_PHYSICS_COMPONENT"
    | "INPUT_COMPONENT"
    | "DEBUGGABLE_COMPONENT"
    | "CAMERA_FOLLOW_COMPONENT"
    | "PATH_FOLLOW_COMPONENT"
    | "INPUT_TO_PHYSICS_COMPONENT"
    | "SOLID_COMPONENT"
    | "ACTOR_INPUT_COMPONENT"
    | "SNAP_TO_GRID_COMPONENT"
    | "FOLLOW_MOUSE_COMPONENT"
    | "AREA_PATH_FOLLOW_COMPONENT"
    | "ELEVATION_COMPONENT"
    | "TILE_OBJECT_COMPONENT"
    | "NEEDS_COMPONENT"
    | "ANIMAL_BEHAVIOUR_COMPONENT"
    | "CONSUMABLE_COMPONENT";

// prettier-ignore
export type ComponentType<T> =
    T extends "RENDER_COMPONENT" ? RenderComponent :
    T extends "ANIMATED_RENDER_COMPONENT" ? AnimatedRenderComponent :
    T extends "SIMPLE_PHYSICS_COMPONENT" ? SimplePhysicsComponent :
    T extends "INPUT_COMPONENT" ? InputComponent :
    T extends "DEBUGGABLE_COMPONENT" ? DebuggableComponent :
    T extends "CAMERA_FOLLOW_COMPONENT" ? CameraFollowComponent :
    T extends "PATH_FOLLOW_COMPONENT" ? PathFollowComponent :
    T extends "INPUT_TO_PHYSICS_COMPONENT" ? InputToPhysicsComponent :
    T extends "SOLID_COMPONENT" ? SolidComponent :
    T extends "ACTOR_INPUT_COMPONENT" ? ActorInputComponent :
    T extends "SNAP_TO_GRID_COMPONENT" ? SnapToGridComponent :
    T extends "FOLLOW_MOUSE_COMPONENT" ? FollowMouseComponent :
    T extends "AREA_PATH_FOLLOW_COMPONENT" ? AreaPathFollowComponent :
    T extends "ELEVATION_COMPONENT" ? ElevationComponent :
    T extends "TILE_OBJECT_COMPONENT" ? TileObjectComponent :
    T extends "NEEDS_COMPONENT" ? NeedsComponent :
    T extends "ANIMAL_BEHAVIOUR_COMPONENT" ? AnimalBehaviourComponent :
    T extends "CONSUMABLE_COMPONENT" ? ConsumableComponent :
    Component;

export {
    Component,
    RenderComponent,
    AnimatedRenderComponent,
    SimplePhysicsComponent,
    InputComponent,
    DebuggableComponent,
    CameraFollowComponent,
    PathFollowComponent,
    InputToPhysicsComponent,
    SolidComponent,
    ActorInputComponent,
    SnapToGridComponent,
    FollowMouseComponent,
    AreaPathFollowComponent,
    ElevationComponent,
    TileObjectComponent,
    NeedsComponent,
    AnimalBehaviourComponent,
    ConsumableComponent,
};
