import { RoomRunner } from "RoomRunner";

interface CritterTraits {
    stepAway: boolean,
    pave: boolean,
}

const OtherWay: { [id: string]: DirectionConstant } = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 1,
    6: 2,
    7: 3,
    8: 4
};


const traits: { [id: string]: CritterTraits } = {
    'builder': {
        stepAway: true,
        pave: false,
    },
    'harvester': {
        stepAway: true,
        pave: false,
    },
    'upgrader': {
        stepAway: true,
        pave: false,
    },
    'paver': {
        stepAway: true,
        pave: false,
    }
};

export class CreepRunner {

    room: RoomRunner;

    constructor(room: RoomRunner) {
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
                if (traits[creep.memory.role].stepAway) {
                    this.stepAway(creep)
                };
            }

            if (creep.memory.working) {
                if (traits[creep.memory.role].pave) {
                    this.construct_road_site(creep);
                }

                switch (creep.memory.role) {
                    case "harvester":
                        this.harvester_work(creep);
                        break;
                    case "builder":
                        this.builder_work(creep);
                        break;
                    case "upgrader":
                        this.upgrader_work(creep);
                        break;
                    case "paver":
                        this.paver_work(creep);
                        break;
                }
            }
            else {
                switch (creep.memory.role) {
                    case "harvester":
                        this.harvester_load(creep);
                        break;
                    case "builder":
                        this.builder_load(creep);
                        break;
                    case "upgrader":
                        this.upgrader_load(creep);
                        break;
                    case "paver":
                        this.paver_load(creep);
                        break;
                }
            }

        }
    }

    construct_road_site(creep: Creep) {
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
                console.log(`${creep.name} laying road at ${creep.pos.x},${creep.pos.y} in ${this.room.name}`);
                this.room.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
            }
        }
    }



    harvester_work(creep: Creep) {
        let target;
        for (let struct of [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]) {
            if (this.room.energy_requests[struct].length > 0) {
                target = creep.pos.findClosestByPath(this.room.energy_requests[struct]);
                if (target) {
                    break;
                }
            }
        }
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target);
            }
        }
    }

    harvester_load(creep: Creep) {
        let source: Source = Game.getObjectById(creep.memory.source_id) as Source;
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.travelTo(source);
        }
    }


    builder_work(creep: Creep) {
        let extension_sites = _.filter(this.room.sites, function (cs: ConstructionSite) {
            return cs.structureType == STRUCTURE_EXTENSION
        });

        let target: ConstructionSite;
        if (extension_sites.length > 0) {
            target = _.sortBy(extension_sites, function (cs: ConstructionSite) {
                return cs.progressTotal - cs.progress;
            })[0];
        } else {
            target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, { range: 3 } as TravelToOptions);
            }
        }
    }

    builder_load(creep: Creep) {
        this.loadFromSource(creep);
    }

    paver_work(creep: Creep) {
        let road_sites = _.filter(this.room.sites, function (cs: ConstructionSite) {
            return cs.structureType == STRUCTURE_ROAD
        });

        let target = creep.pos.findClosestByPath(road_sites);
        if (target) {
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.travelTo(target, { range: 3 } as TravelToOptions);
            }
        }
    }

    paver_load(creep: Creep) {
        this.loadFromSource(creep);
    }

    upgrader_work(creep: Creep) {
        if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller as StructureController,
                { range: 3 } as TravelToOptions);
        }
    }

    upgrader_load(creep: Creep) {
        this.loadFromSource(creep);
    }



    loadFromSource(creep: Creep) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.travelTo(source);
        }
    }

    stepAway(creep: Creep) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES);
        let step_dir = OtherWay[creep.pos.getDirectionTo(source)];
        // console.log(`${creep.name} stepping ${step_dir}`);
        creep.move(step_dir);
    }
}