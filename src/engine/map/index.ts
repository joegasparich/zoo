export { default as MapGrid, MapFileData, MapCell } from "./MapGrid";
export { default as PathfindingGrid, Path } from "./PathfindingGrid";

//--Generated interfaces from Tiled--//

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
    tilesets:         MapTileSet[];
    tilewidth:        number;
    type:             string;
    version:          number;
    width:            number;
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

interface MapTileSet {
    firstgid: number;
    source:   string;
}

export interface TiledSet {
    columns:        number;
    editorsettings: Editorsettings;
    image:          string;
    imageheight:    number;
    imagewidth:     number;
    margin:         number;
    name:           string;
    spacing:        number;
    terrains:       Terrain[];
    tilecount:      number;
    tiledversion:   string;
    tileheight:     number;
    tiles:          Tile[];
    tilewidth:      number;
    type:           string;
    version:        number;
    wangsets:       Wangset[];
}

export interface Editorsettings {
    export: Export;
}

export interface Export {
    format: string;
    target: string;
}

export interface Terrain {
    name: string;
    tile: number;
}

export interface Tile {
    id:           number;
    probability?: number;
    objectgroup?: Objectgroup;
    properties?:  Property[];
    terrain?:     number[];
}

export interface Objectgroup {
    draworder: string;
    name:      string;
    objects:   Object[];
    opacity:   number;
    type:      string;
    visible:   boolean;
    x:         number;
    y:         number;
}

export interface Object {
    height:   number;
    id:       number;
    name:     string;
    rotation: number;
    type:     string;
    visible:  boolean;
    width:    number;
    x:        number;
    y:        number;
}

export interface Property {
    name:  string;
    type:  string;
    value: string;
}

export interface Wangset {
    cornercolors: any[];
    edgecolors:   Edgecolor[];
    name:         string;
    tile:         number;
    wangtiles:    Wangtile[];
}

export interface Edgecolor {
    color:       string;
    name:        string;
    probability: number;
    tile:        number;
}

export interface Wangtile {
    dflip:  boolean;
    hflip:  boolean;
    tileid: number;
    vflip:  boolean;
    wangid: number[];
}
