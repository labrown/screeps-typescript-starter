import * as roleUpgrader from "./role.upgrader";


export function run(creep: Creep) {

    if(creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        creep.say('🔄 harvest');
    }
    else if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
        creep.memory.building = true;
        creep.say('🚧 repair');
    }

    if(creep.memory.building) {
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
        });
        if(target) {
            if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, {visualizePathStyle: {}} as TravelToOptions);
            }
        } else {
            roleUpgrader.run(creep);                
        }
    }
    else {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.travelTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}} as TravelToOptions);
        }        }
};
