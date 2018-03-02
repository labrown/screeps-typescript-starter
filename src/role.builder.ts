import * as  roleUpgrader from "./role.upgrader";

export function run(creep: Creep) {

	if(creep.memory.building && creep.carry.energy == 0) {
		creep.memory.building = false;
		creep.say('🔄 harvest');
	}
	else if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
		creep.memory.building = true;
		creep.say('🚧 build');
	}

	if(creep.memory.building) {
		let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
		if(target) {
			if(creep.build(target) == ERR_NOT_IN_RANGE) {
				creep.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}} as TravelToOptions);
			}
		}
		else { 
			creep.memory.role = 'upgrader';
			delete creep.memory.building;
			roleUpgrader.run(creep);
		}
	}
	else {
		var sources = creep.room.find(FIND_SOURCES);
		if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
			creep.travelTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}} as TravelToOptions);
		}
	}
};
