interface CreepMemory { 
    role: string,
    building?: boolean,
    upgrading?: boolean,
    loading?: boolean,
    source_id?: Id<Source>,
    working?: boolean
}

interface SpawnMemory {
    creep_name: string
}

interface FlagMemory {
    roads_cleared?: boolean
}

interface Memory {
  crit: any;
}
