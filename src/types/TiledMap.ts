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

export interface Editorsettings {
    export: Export;
}

export interface Export {
    format: string;
    target: string;
}

export interface Layer {
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

export interface Property {
    name:  string;
    type:  string;
    value: string;
}

export interface Tileset {
    firstgid: number;
    source:   string;
}
