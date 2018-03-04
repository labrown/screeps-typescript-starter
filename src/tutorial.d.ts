interface CreepMemory { 
    role: string,
    building?: boolean,
    upgrading?: boolean,
    loading?: boolean,
    source_id?: string,
    working?: boolean
}

interface SpawnMemory {
    creep_name: string
}

interface FlagMemory {
    roads_cleared?: boolean
}