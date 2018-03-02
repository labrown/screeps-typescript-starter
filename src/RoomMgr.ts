import { CreepRunner } from "CreepRunner";

export class RoomMgr {
    name: string;
    room: Room;
    sources: Array<Source>;
    sites: Array<ConstructionSite>;
    creeps: Array<Creep>;
    spawns: Array<StructureSpawn>;
    runner: CreepRunner;
    
    constructor(room_name: string) {
        // name of this room
        this.name = room_name;

        // Room structure
        this.room = Game.rooms[this.name];

        // Sources in this room
        this.sources = this.room.find(FIND_SOURCES);

        // Get list of construction sites
        this.sites = this.room.find(FIND_CONSTRUCTION_SITES);

        // Creeps in this room
        this.creeps = this.room.find(FIND_MY_CREEPS);

        // Spawns in this room
        this.spawns = this.room.find(FIND_MY_SPAWNS);

        // for each source we need 1 harvester creep
        for (let source of this.sources) {
            let creep_name = "harvester_" + source.id;
            let creeps = _.filter(this.creeps, function(creep) {
                return creep.name == creep_name;
            });
            if (creeps.length == 0 ) {
                console.log(`Spawning ${creep_name}`);

                for (let spawn of this.spawns) {
                    spawn.spawnCreep([WORK,CARRY,MOVE], creep_name, 
                        { memory: { role: "harvester", source_id: source.id } as CreepMemory });
                }
            }
        }

        // Run creeps
        this.runner = new CreepRunner(this);
        this.runner.runCreeps();
    }
}