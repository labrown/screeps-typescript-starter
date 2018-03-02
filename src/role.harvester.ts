import * as roleBuilder from "./role.builder";

export function run(creep: Creep) {

    if(creep.memory.loading && creep.carry.energy == 0) {
		creep.memory.loading = false;
		creep.say('🔄 harvest');
	}
	else if(!creep.memory.loading && creep.carry.energy == creep.carryCapacity) {
		creep.memory.loading = true;
		creep.say('🚧 loading');
	}

    if (creep.memory.loading) {
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });
        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}} as TravelToOptions);
            }
        }
    }
    else {
        let sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.travelTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}} as TravelToOptions);
        }
    }
};