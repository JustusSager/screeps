
module.exports = {
    basebuilding: {
        printResult: true,
        maxConstructionSites: 3,
        flagNames: [
            'BunkerFlag'
        ],
        rampartRCLLevel: 4, // rampartRCLLevel > 8 -> no Rampart construction
        rampartOnRoadsRCLLevel: 8 // rampartOnRoadsRCLLevel > 8 -> no Rampart construction on Roads
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
    }
}