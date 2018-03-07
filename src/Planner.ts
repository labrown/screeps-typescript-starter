import { RoomRunner } from "./RoomRunner";
import { Traveler } from "./Traveler/Traveler";

interface xy { x: number, y: number }

const extension_sites: { [id: number]: xy[] } = {
    1: [],
    2: [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 2 }],
    3: [{ x: -2, y: 0 }, { x: -1, y: 1 }, { x: -2, y: 1 }, { x: -3, y: 1 }, { x: -2, y: 2 }],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
}


export class Planner {

    room: RoomRunner;

    constructor(room: RoomRunner) {
        this.room = room;
    }

    findPath(start: StructureSpawn | StructureController | Source, end: StructureSpawn | StructureController | Source, skip: number) {
        let path = Traveler.findTravelPath(
            end, start,
            { ignoreCreeps: true }
        );

        if (path.incomplete) {
            console.log(`Planner ERROR[${this.room.name} cannot find path start ${start.id} -> end ${end.id}:`);
        } else {
            let road_path = path.path;
            let ser = Traveler.serializePath(end.pos, road_path, 'red');
            console.log(`Setting roads from ${end.id} along ${ser}`);
            if (road_path.length >= skip) {
                while (skip-- > 0) {
                    road_path.shift()
                }
            }
            if (road_path.length > 0) {
                road_path.pop();
            };
            for (let pos of road_path) {
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
        }
    }

    SetRoads() {
        // For each source:
        // Source -> spawn, distance 1 
        // Source -> Controller, distance 1, chop off last 3 steps

        console.log("setting roads");
        let controller = this.room.room.controller;
        for (let source of this.room.sources) {
            for (let spawn of this.room.spawns) {
                this.findPath(source, spawn, 1);
            }
            this.findPath(source, controller as StructureController, 2);
        }
    }

    setExtensions() {
        // set memory
        if (typeof Memory.crit[this.room.name] === 'undefined') { 
            Memory.crit[this.room.name] = {};
        }
        if (typeof Memory.crit[this.room.name].ext === 'undefined') {
            console.log(`set extensions memory for ${this.room.name}`);
            Memory.crit[this.room.name].ext = {
                '1': false, '2': false, '3': false, '4': false,
                '5': false, '6': false, '7': false, '8': false
            };
        }
        let controller = this.room.room.controller as StructureController;

        if (Memory.crit[this.room.name].ext[controller.level] == false) {
            console.log(`Setting extensions for controller level ${controller.level}`);
            let spawn = this.room.spawns[0];
            for (let xy of extension_sites[controller.level]) {
                this.room.room.createConstructionSite(spawn.pos.x + xy.x, spawn.pos.y + xy.y, STRUCTURE_EXTENSION);
            }
            Memory.crit[this.room.name].ext[controller.level] = true;
        }
    }
}