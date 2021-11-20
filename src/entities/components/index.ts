import Component from "./Component";
import RenderComponent from "./RenderComponent";
import AnimatedRenderComponent from "./AnimatedRenderComponent";
import PhysicsComponent from "./PhysicsComponent";
import InputComponent from "./InputComponent";
import CameraFollowComponent from "./CameraFollowComponent";
import PathFollowComponent from "./PathFollowComponent";
import WallAvoidanceComponent from "./WallAvoidanceComponent";
import InputToPhysicsComponent from "./InputToPhysicsComponent";
import PathBlockComponent from "./PathBlockComponent";
import ActorInputComponent from "./ActorInputComponent";
import SnapToGridComponent from "./SnapToGridComponent";
import FollowMouseComponent from "./FollowMouseComponent";
import AreaPathFollowComponent from "./AreaPathFollowComponent";
import ElevationComponent from "./ElevationComponent";
import TileObjectComponent from "./TileObjectComponent";

export { createComponent } from "./createComponent";

export type COMPONENT =
      "RENDER_COMPONENT"
    | "ANIMATED_RENDER_COMPONENT"
    | "PHYSICS_COMPONENT"
    | "INPUT_COMPONENT"
    | "CAMERA_FOLLOW_COMPONENT"
    | "PATH_FOLLOW_COMPONENT"
    | "WALL_AVOIDANCE_COMPONENT"
    | "INPUT_TO_PHYSICS_COMPONENT"
    | "PATH_BLOCK_COMPONENT"
    | "ACTOR_INPUT_COMPONENT"
    | "SNAP_TO_GRID_COMPONENT"
    | "FOLLOW_MOUSE_COMPONENT"
    | "AREA_PATH_FOLLOW_COMPONENT"
    | "ELEVATION_COMPONENT"
    | "TILE_OBJECT_COMPONENT";

export type ComponentType<T> =
    T extends "RENDER_COMPONENT" ? RenderComponent :
    T extends "ANIMATED_RENDER_COMPONENT" ? AnimatedRenderComponent :
    T extends "PHYSICS_COMPONENT" ? PhysicsComponent :
    T extends "INPUT_COMPONENT" ? InputComponent :
    T extends "CAMERA_FOLLOW_COMPONENT" ? CameraFollowComponent :
    T extends "PATH_FOLLOW_COMPONENT" ? PathFollowComponent :
    T extends "WALL_AVOIDANCE_COMPONENT" ? WallAvoidanceComponent :
    T extends "INPUT_TO_PHYSICS_COMPONENT" ? InputToPhysicsComponent :
    T extends "PATH_BLOCK_COMPONENT" ? PathBlockComponent :
    T extends "ACTOR_INPUT_COMPONENT" ? ActorInputComponent :
    T extends "SNAP_TO_GRID_COMPONENT" ? SnapToGridComponent :
    T extends "FOLLOW_MOUSE_COMPONENT" ? FollowMouseComponent :
    T extends "AREA_PATH_FOLLOW_COMPONENT" ? AreaPathFollowComponent :
    T extends "ELEVATION_COMPONENT" ? ElevationComponent :
    T extends "TILE_OBJECT_COMPONENT" ? TileObjectComponent :
    Component;

export {
    Component,
    RenderComponent,
    AnimatedRenderComponent,
    PhysicsComponent,
    InputComponent,
    CameraFollowComponent,
    PathFollowComponent,
    WallAvoidanceComponent,
    InputToPhysicsComponent,
    PathBlockComponent,
    ActorInputComponent,
    SnapToGridComponent,
    FollowMouseComponent,
    AreaPathFollowComponent,
    ElevationComponent,
    TileObjectComponent,
};
