export { default as MapGrid } from "./MapGrid";
export { default as PathfindingGrid, Path } from "./PathfindingGrid";

export interface MapData {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tileSet: string;
    tileData: number[];
}

export interface TiledMap {
    compressionlevel: number;
    editorsettings:   Editorsettings;
    height:           number;
    infinite:         boolean;
    layers:           Layer[];
    nextlayerid:      number;
    nextobjectid:     number;
    orientation:      string;
    properties:       Property[];
    renderorder:      string;
    tiledversion:     string;
    tileheight:       number;
    tilesets:         Tileset[];
    tilewidth:        number;
    type:             string;
    version:          number;
    width:            number;
}

interface Editorsettings {
    export: Export;
}

interface Export {
    format: string;
    target: string;
}

interface Layer {
    data:    number[];
    height:  number;
    id:      number;
    name:    string;
    opacity: number;
    type:    string;
    visible: boolean;
    width:   number;
    x:       number;
    y:       number;
}

interface Property {
    name:  string;
    type:  string;
    value: string;
}

interface Tileset {
    firstgid: number;
    source:   string;
}
