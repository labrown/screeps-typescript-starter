import { RoomMgr } from "RoomMgr";

export class TowerRunner {

    room: RoomMgr;

    constructor(room: RoomMgr) {
        this.room = room;
    };

    runTowers() {
        let towers = this.room.room.find(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => structure.structureType == STRUCTURE_TOWER
        }) as Array<StructureTower>;

        for (let tower of towers) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
            else {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
        }
    }
}