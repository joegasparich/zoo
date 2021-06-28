import { ColliderType } from "managers";
import Vector from "vector";
import { ActorInputComponent, PhysicsComponent, AnimatedRenderComponent, AreaPathFollowComponent, CameraFollowComponent, ElevationComponent, FollowMouseComponent, InputToPhysicsComponent, PathBlockComponent, PathFollowComponent, RenderComponent, SnapToGridComponent, COMPONENT, TileObjectComponent, WallAvoidanceComponent } from ".";
import { PhysicsComponentSaveData } from "./PhysicsComponent";
import Component, { ComponentSaveData } from "./Component";

export function createComponent(componentData: ComponentSaveData): Component {
    switch(componentData.id) {
        case COMPONENT.RENDER_COMPONENT: return new RenderComponent();
        case COMPONENT.ANIMATED_RENDER_COMPONENT: return new AnimatedRenderComponent();
        case COMPONENT.CAMERA_FOLLOW_COMPONENT: return new CameraFollowComponent();
        case COMPONENT.PATH_FOLLOW_COMPONENT: return new PathFollowComponent();
        case COMPONENT.PHYSICS_COMPONENT:
            const data = componentData as PhysicsComponentSaveData;
            return new PhysicsComponent({
                type: data.collider.type as ColliderType,
                height: data.collider.height,
                width: data.collider.width,
                radius: data.collider.radius,
            }, data.isDynamic, data.density, data.tag, Vector.Deserialize(data.pivot));
        case COMPONENT.WALL_AVOIDANCE_COMPONENT: return new WallAvoidanceComponent();
        case COMPONENT.INPUT_TO_PHYSICS_COMPONENT: return new InputToPhysicsComponent();
        case COMPONENT.PATH_BLOCK_COMPONENT: return new PathBlockComponent();

        case COMPONENT.ACTOR_INPUT_COMPONENT: return new ActorInputComponent();
        case COMPONENT.AREA_PATH_FOLLOW_COMPONENT: return new AreaPathFollowComponent();
        case COMPONENT.FOLLOW_MOUSE_COMPONENT: return new FollowMouseComponent();
        case COMPONENT.SNAP_TO_GRID_COMPONENT: return new SnapToGridComponent();
        case COMPONENT.ELEVATION_COMPONENT: return new ElevationComponent();
        case COMPONENT.TILE_OBJECT_COMPONENT: return new TileObjectComponent();
        default: return undefined;
    }
}
