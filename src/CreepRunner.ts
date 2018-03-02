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
                        break;
                    case "builder": this.builder_work(creep);
                        break;
                    case "upgrader": this.upgrader_work(creep);
                        break;
                }
            }
            else {
                switch (creep.memory.role) {
                    case "harvester": this.harvester_load(creep);
                        break;
                    case "builder": this.builder_load(creep);
                        break;
                    case "upgrader": this.upgrader_load(creep);
                        break;
                }
            }

            // Set down road if possible
            let controller = this.room.room.controller as StructureController;
            if (controller.my) {
                let roads = _.filter(this.room.structures, function (s) {
                    return (s.pos.x == creep.pos.x && s.pos.y == creep.pos.y)
                });
                let sites = _.filter(this.room.sites, function (s) {
                    return (s.pos.x == creep.pos.x && s.pos.y == creep.pos.y)
                });
                if (roads.length == 0 && sites.length == 0) {
                    console.log(`creating road at ${creep.pos.x},${creep.pos.y} in ${this.room.name}`);
                    this.room.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
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

    builder_work(creep: Creep) {
        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, { visualizePathStyle: { stroke: '#ffffff' } } as TravelToOptions);
            }
        }
    }

    builder_load(creep: Creep) {
        this.loadFromSource(creep);
    }

    upgrader_work(creep: Creep) {
        if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller as StructureController,
                { visualizePathStyle: { stroke: '#ffffff' } } as TravelToOptions);
        }
    }

    upgrader_load(creep: Creep) {
        this.loadFromSource(creep);
    }

    loadFromSource(creep: Creep) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.travelTo(source, { visualizePathStyle: { stroke: '#ffaa00' } } as TravelToOptions);
        }
    }
}