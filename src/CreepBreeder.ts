import { RoomRunner } from "RoomRunner";

export interface CritterOptions {
    name: string,
    role: string,
    source_id?: string,
}

export let CritterRoles: string[] = [
    'harvester','upgrader','paver','builder'
]

export class CreepBreeder {

    room: RoomRunner;
    bodies: { [id: string]: BodyPartConstant[] } = {
        'harvester': [WORK, CARRY, MOVE],
        'upgrader': [WORK, CARRY, MOVE],
        'paver': [WORK, CARRY, MOVE],
        'builder': [WORK, CARRY, MOVE],
    }

    constructor(room: RoomRunner) {
        this.room = room;
    };

    bodyCost(body: BodyPartConstant[]) {
        let cost = 0;
        for (let part of body) {
            cost += BODYPART_COST[part];
        }
        return cost;
    }

    growCreep(role:string) {
        // console.log(`growing ${role} with capacity ${capacity}'`);
        let body = this.bodies[role];
        let cost = this.bodyCost(body);
        let capacity = (role == 'harvester' && this.room.headcounts[role] == 0) ? this.room.room.energyAvailable: this.room.room.energyCapacityAvailable;
        let done = cost > capacity;
        let index = 0;
         console.log(`${role} - ${this.room.headcounts[role]} -${body} - ${cost} - ${capacity} - ${done} - ${index}`);
        while (!done) {
            let part = this.bodies[role][index];
            cost += BODYPART_COST[part];
            if (cost <= capacity) {
                body.push(part);
            } else {
                done = true;
            }
            // console.log(`${body} - ${cost} - ${done} - ${index}`);
            index = (index + 1) % this.bodies[role].length;
        }
        // console.log(`grew ${body}`);
        return body;
    }

    breedCreeps(wanted: CritterOptions[]) {

        let available_spawns = _.filter(this.room.spawns, function (spawn: StructureSpawn) {
            return spawn.spawning == null;
        });

        for (let creep_options of wanted) {
            let name = creep_options.name;
            delete creep_options.name;
            let body = this.growCreep(creep_options.role);

            for (let i in available_spawns) {
                let spawn = available_spawns[i];
                // dry run
                let memory: CreepMemory = _.defaults({ _trav: {} as TravelData }, creep_options);

                if (spawn.spawnCreep(body, name,
                    { memory: memory, dryRun: true }) == OK) {
                    console.log(`Spawning ${name}`);
                    spawn.spawnCreep(body, name,
                        { memory: memory, dryRun: false })
                    // Remove spawn from list of available spawns
                    delete available_spawns[i];
                }
            }
        }
    }
}