import { ColliderType } from "managers";
import Vector from "vector";
import {
    ActorInputComponent,
    PhysicsComponent,
    AnimatedRenderComponent,
    AreaPathFollowComponent,
    CameraFollowComponent,
    ElevationComponent,
    FollowMouseComponent,
    InputToPhysicsComponent,
    SolidComponent,
    PathFollowComponent,
    RenderComponent,
    SnapToGridComponent,
    TileObjectComponent,
    WallAvoidanceComponent,
} from ".";
import { PhysicsComponentSaveData } from "./PhysicsComponent";
import Component, { ComponentSaveData } from "./Component";

export function createComponent(componentData: ComponentSaveData): Component {
    switch(componentData.id) {
        case "RENDER_COMPONENT": return new RenderComponent();
        case "ANIMATED_RENDER_COMPONENT": return new AnimatedRenderComponent();
        case "CAMERA_FOLLOW_COMPONENT": return new CameraFollowComponent();
        case "PATH_FOLLOW_COMPONENT": return new PathFollowComponent();
        case "PHYSICS_COMPONENT":
            const data = componentData as PhysicsComponentSaveData;
            return new PhysicsComponent({
                type: data.collider.type as ColliderType,
                height: data.collider.height,
                width: data.collider.width,
                radius: data.collider.radius,
            }, data.isDynamic, data.density, data.tag, Vector.Deserialize(data.pivot));
        case "WALL_AVOIDANCE_COMPONENT": return new WallAvoidanceComponent();
        case "INPUT_TO_PHYSICS_COMPONENT": return new InputToPhysicsComponent();
        case "SOLID_COMPONENT": return new SolidComponent();

        case "ACTOR_INPUT_COMPONENT": return new ActorInputComponent();
        case "AREA_PATH_FOLLOW_COMPONENT": return new AreaPathFollowComponent();
        case "FOLLOW_MOUSE_COMPONENT": return new FollowMouseComponent();
        case "SNAP_TO_GRID_COMPONENT": return new SnapToGridComponent();
        case "ELEVATION_COMPONENT": return new ElevationComponent();
        case "TILE_OBJECT_COMPONENT": return new TileObjectComponent();
        default: return undefined;
    }
}
