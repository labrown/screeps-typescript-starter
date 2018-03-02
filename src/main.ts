import { ErrorMapper } from "utils/ErrorMapper";
import "Traveler/Traveler";

// import * as roleBuilder from "./role.builder";
// import * as roleHarvester from "./role.harvester";
// import * as roleUpgrader from "./role.upgrader";
// import * as roleRepairer from "./role.repairer";

import { RoomMgr } from "./RoomMgr";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

    // hash of rooms
    let theRooms:  { [id: string]: RoomMgr} = {};

    for (let name in Game.rooms) {
        theRooms[name] = new RoomMgr(name);
    }

    // // console.log("Current game tick is " + Game.time);

    // // Automatically delete memory of missing creeps
    // for (const name in Memory.creeps) {
    //     if (!(name in Game.creeps)) {
    //         delete Memory.creeps[name];
    //     }
    // }

    // let tower = Game.getObjectById('543642c1cd00309') as StructureTower;
    // if (tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if (closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }

    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if (closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }

    // for (var name in Game.creeps) {
    //     var creep = Game.creeps[name];
    //     if (creep.memory.role == 'harvester') {
    //         roleHarvester.run(creep);
    //     } else if (creep.memory.role == 'repairer') {
    //         roleRepairer.run(creep);
    //     } else if (creep.memory.role == 'upgrader') {
    //         roleUpgrader.run(creep);
    //     } else if (creep.memory.role == 'builder') {
    //         roleBuilder.run(creep);
    //     }
    // }


});
