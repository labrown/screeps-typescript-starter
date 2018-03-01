export function run(creep: Creep) {

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('⚡ upgrade');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller as StructureController, 
                {visualizePathStyle: {stroke: '#ffffff'}} as TravelToOptions);
        }
    }
    else {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.travelTo(sources[0], 
                {visualizePathStyle: {stroke: '#ffaa00'}}  as TravelToOptions);
        }
    }
}