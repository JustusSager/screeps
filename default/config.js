
module.exports = {
    basebuilding: {
        printResult: true,
        maxConstructionSites: 5,
        flagNames: [
            'BunkerFlag'
        ],
        rampartRCLLevel: 6, // rampartRCLLevel > 8 -> no Rampart construction
        rampartOnRoadsRCLLevel: 8, // rampartOnRoadsRCLLevel > 8 -> no Rampart construction on Roads
        floodfill: false
    },
    initMaxCreepRoles: {
        "defenders": 0
    },
    initalMaxSpawnEnergy: 300,
    minerCreepMaxWorkParts: 5,
    dropped_resource_threshold: 50,
    structureLink: {
        upperThreshold: 50
    },
    structureTower: {
        repairEnergyThreshold: 750,
        repairMaxHits: 250000
    },
    structureStorage: {
        genericsEnergyThreshhold: 2000
    },
    structureTerminal: {
        energyUpperTheshold: 5000,
        energyLowerThreshold: 3000,
        mineralThresholds: {
            H: 1500, // Hydrogen
            O: 1500 // Oxygen
        },
        mineralSellFactor: 1.5,
        mineralTransportFactor: 0.5,
        mineralBuyFactor: 0.1,
        maxTransactionCost: 400,
        transactionVolume: 200
    },
    remote_targets: {
        harvest: [
            'E22S12'
        ]
    },
    taskGeneration: {
        repair_hitsMax_multiplier: 0.9 // ab wann soll repariert werden
    },
    spawning: {
        critical_ttl_for_miners: 50, // wenn die time-to-live eines miners < critical_ttl_for_miners -> nichts anderes mehr spawnen
        max_workers_energy_divider: 500, // dropped-energy-im-raum / max_workers_energy_divider = anzahl-der-worker 
        max_defenders: 2 // max anzahl an defendern, wenn Gegner im Raum sind
    },
    roomVisuals: {
        roomStats: {x: 1, y:1},
        currentTasks: {x: 44, y: 1},
        spawnQueu: {x: 7, y: 1},
        rcl_stats: {x: 44, y: 40}
    }
}