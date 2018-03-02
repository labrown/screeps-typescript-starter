interface CreepMemory { 
    role?: string,
    building?: boolean,
    upgrading?: boolean,
    loading?: boolean,
    source_id?: string,
    working?: boolean
}

import { CreepRunner } from "CreepRunner";
import { TowerRunner } from "TowerRunner";

export class RoomMgr {

    name: string;
    room: Room;
    sources: Array<Source>;
    sites: Array<ConstructionSite>;
    structures: Array<Structure>;
    creeps: Array<Creep>;
    spawns: Array<StructureSpawn>;
    creepRunner: CreepRunner;
    towerRunner: TowerRunner;

    constructor(room_name: string) {
        // name of this room
        this.name = room_name;

        // Room structure
        this.room = Game.rooms[this.name];

        // Sources in this room
        this.sources = this.room.find(FIND_SOURCES);

        // Get list of construction sites
        this.sites = this.room.find(FIND_CONSTRUCTION_SITES);

        // Get list of structures
        this.structures = this.room.find(FIND_STRUCTURES);
        
        // Creeps in this room
        this.creeps = this.room.find(FIND_MY_CREEPS);

        // Spawns in this room
        this.spawns = this.room.find(FIND_MY_SPAWNS);

        // for each source we need 1 harvester creep
        for (let source of this.sources) {
            let creep_name = "harvester_" + source.id;
            let creeps = _.filter(this.creeps, function (creep) {
                return creep.name == creep_name;
            });
            if (creeps.length == 0) {

                for (let spawn of this.spawns) {
                    if (!spawn.spawning) {
                        console.log(`Spawning ${creep_name}`);
                        spawn.spawnCreep([WORK, CARRY, MOVE], creep_name,
                            { memory: { role: "harvester", source_id: source.id } as CreepMemory });
                    }
                }
            }
        }

        // Create a build if we need one
        let builders = _.filter(this.creeps, function(creep) {
            return creep.memory.role == 'builder'
        })
        let builders_wanted = Math.ceil(this.sites.length / 5);
        if (this.sites.length > 0 && builders.length < builders_wanted) {
            let creep_name = "builder_" + Game.time;
            for (let spawn of this.spawns) {
                if (!spawn.spawning) {
                    console.log(`Spawning ${creep_name}`);
                    spawn.spawnCreep([WORK, CARRY, MOVE], creep_name,
                        { memory: { role: "builder" } as CreepMemory });
                }
            }
        }

        // Make an upgrader if needed
        let upgraders = _.filter(this.creeps, function(creep) {
            return creep.memory.role == 'upgrader'
        })
        if (upgraders.length == 0) {
            let creep_name = "upgrader_" + Game.time;
            for (let spawn of this.spawns) {
                if (!spawn.spawning) {
                    console.log(`Spawning ${creep_name}`);
                    spawn.spawnCreep([WORK, CARRY, MOVE], creep_name,
                        { memory: { role: "upgrader" } as CreepMemory });
                }
            }
            
        }

        // Run creeps
        this.creepRunner = new CreepRunner(this);
        this.creepRunner.runCreeps();

        // Run towers
        this.towerRunner = new TowerRunner(this);
        this.towerRunner.runTowers();

    }
}