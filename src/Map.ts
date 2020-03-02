// import PathfindingGrid from "PathfindingGrid";

// export default class Map {
//     mapWidth: number;
//     mapHeight: number;

//     pathfindingGrid: PathfindingGrid;

//     constructor(width: number, height: number) {
//         this.mapWidth = width;
//         this.mapHeight = height;

//         this.pathfindingGrid = new PathfindingGrid(width, height);

//         this.init();
//     }

//     init() {
//         this.pathfindingGrid.setup();
//     }

//     setupTileGrid() {
//         for (let i = 0; i < this.mapHeight; i++) {
//             for  (let j = 0; j < this.mapWidth; j++) {
//                 const newTile = new Tile(i, j);
//             }
//         }
//     }
// }

// enum Biome {
//     Dirt,
//     Rock,
//     Grass,
//     DryGrass,
//     Snow
// }

// class Tile {
//     x: number;
//     y: number;

//     biome: Biome;

//     constructor(x: number, y: number) {
//         this.x = x;
//         this.y = y;

//         this.biome = Biome.Grass;
//     }
// }