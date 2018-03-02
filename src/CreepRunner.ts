import { RoomMgr } from "RoomMgr";

export class CreepRunner {

    room: RoomMgr;

    constructor(room: RoomMgr) {
        this.room = room;
    };

    runCreeps() {
        for (let creep of this.room.creeps) {
            if (creep.memory.working && creep.carry.energy == 0) {
                creep.memory.working = false;
                creep.say('🔄 loading');
            }
            else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
                creep.memory.working = true;
                creep.say('🚧 working');
            }

            if (creep.memory.working) {
                switch (creep.memory.role) {
                    case "harvester": this.harvester_work(creep);
                }
            }
            else {
                switch (creep.memory.role) {
                    case "harvester": this.harvester_load(creep);
                }
            }
        }
    }

    harvester_work(creep: Creep) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, { visualizePathStyle: { stroke: '#ffffff' } } as TravelToOptions);
            }
        }
    }

    harvester_load(creep: Creep) {
        let source: Source = Game.getObjectById(creep.memory.source_id) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.travelTo(source, { visualizePathStyle: { stroke: '#ffaa00' } } as TravelToOptions);
        }
    }
}