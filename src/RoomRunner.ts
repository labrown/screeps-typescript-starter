
import { CreepRunner } from "CreepRunner";
import { CreepBreeder, CritterOptions, CritterRoles } from "CreepBreeder";
import { TowerRunner } from "TowerRunner";
import { Planner } from "Planner";

interface HeadCount { [id: string]: number };

export class RoomRunner {

    name: string;
    room: Room;
    sources: Array<Source>;
    sites: Array<ConstructionSite>;
    structures: Array<Structure>;
    creeps: Array<Creep>;
    headcounts: HeadCount = {};
    spawns: Array<StructureSpawn>;
    creepRunner: CreepRunner;
    creepBreeder?: CreepBreeder;
    towerRunner: TowerRunner;

    constructor(room_name: string) {
        // name of this room
        this.name = room_name;

        // Init memory if needed
        if (typeof Memory.crit[this.name] === 'undefined') {
            Memory.crit[this.name] = {};
        }

        // Room structure
        this.room = Game.rooms[this.name];

        // Sources in this room
        this.sources = this.room.find(FIND_SOURCES);

        // Get list of construction sites
        this.sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);

        // Get list of structures
        this.structures = this.room.find(FIND_MY_STRUCTURES);

        // Creeps in this room
        this.creeps = this.room.find(FIND_MY_CREEPS);

        // get headcounts
        for (let r of CritterRoles) {
            this.headcounts[r] = _.filter(this.creeps, function(c) { return c.memory.role === r}).length;
        }

        // Spawns in this room
        this.spawns = this.room.find(FIND_MY_SPAWNS);

        // Reset memory on spawns
        _.each(this.spawns, function (spawn: StructureSpawn) {
            spawn.memory.creep_name = "";
        })

        // Plan roads if needed
        let theRoom = this.room;
        let flag = _.filter(Game.flags, function (flag) {
            return flag.room == theRoom && flag.name == 'reset_roads'
        }).shift();

        if (flag) {
            console.log('Resetting roads');
            Memory.crit[this.name].roads_set = false;
            _.each(
                _.filter(this.sites, function (cs) {
                    return cs.structureType == STRUCTURE_ROAD &&
                        cs.progress == 0
                }),
                function (cs) { cs.remove() }
            );
            flag.remove();
        }

        let planner = new Planner(this);
        if (typeof Memory.crit[this.name].roads_set === 'undefined' ||
            Memory.crit[this.name].roads_set == false) {
            planner.SetRoads();
            Memory.crit[this.name].roads_set = true;
        }
        planner.setExtensions();

        let creepReqs: CritterOptions[] = [];

        // for each source we need 1 harvester creep
        for (let source of this.sources) {
            let creep_name = "harvester_" + source.id;
            let creeps = _.filter(this.creeps, function (creep) {
                return creep.name == creep_name;
            });
            if (creeps.length == 0) {
                creepReqs.push({ name: creep_name, role: 'harvester', source_id: source.id });
            }
        }

        // Make an upgrader if needed
        let upgraders = _.filter(this.creeps, function (creep) {
            return creep.memory.role == 'upgrader'
        })
        if (upgraders.length < 4) {
            creepReqs.push({ name: "upgrader_" + Game.time, role: 'upgrader' });
        }

        // use this in creating builders
        let road_sites = _.filter(this.sites, function (cs: ConstructionSite) {
            return cs.structureType == STRUCTURE_ROAD;
        });

        // Create a build if we need one
        let builders = _.filter(this.creeps, function (creep) {
            return creep.memory.role == 'builder'
        })
        let builders_wanted = Math.ceil((this.sites.length - road_sites.length) / 10);
        if (builders_wanted > 3) { builders_wanted = 3; }
        if (this.sites.length > 0 && builders.length < builders_wanted) {
            creepReqs.push({ name: "builder_" + Game.time, role: 'builder' });
        }

        // Create pavers if we need one
        if (road_sites.length > 0) {
            let pavers = _.filter(this.creeps, function (creep) {
                return creep.memory.role == 'paver'
            })
            let pavers_wanted = Math.ceil(road_sites.length / 10);
            if (pavers_wanted > 3) { pavers_wanted = 3; }
            if (road_sites.length > 0 && pavers.length < pavers_wanted) {
                creepReqs.push({ name: "paver_" + Game.time, role: 'paver' });
            }
        }

        // Breed creeps
        if (creepReqs.length > 0) {
            this.creepBreeder = new CreepBreeder(this);
            this.creepBreeder.breedCreeps(creepReqs);
        }

        // Run creeps
        this.creepRunner = new CreepRunner(this);
        this.creepRunner.runCreeps();

        // Run towers
        this.towerRunner = new TowerRunner(this);
        this.towerRunner.runTowers();



    }
}