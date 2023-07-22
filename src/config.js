
module.exports = {
    basebuilding: {
        printResult: true,
        maxConstructionSites: 3,
        flagNames: [
            'BunkerFlag',
            'BunkerFlag1'
        ],
        rampartRCLLevel: 4, // rampartRCLLevel > 8 -> no Rampart construction
        rampartOnRoadsRCLLevel: 8 // rampartOnRoadsRCLLevel > 8 -> no Rampart construction on Roads
    },
    structureLink: {
        upperThreshold: 50
    },
    structureTower: {
        repairEnergyThreshold: 750,
        repairMaxHits: 250000
    },
    structureSpawn: {
        initalMaxSpawnEnergy: 300,
        initialMaxHarvesters: 0,
        initialMaxRepairers: 1,
        initialMaxUpgraders: 1,
        initialMaxLongDistanceHarvesters: 0,
        initialMaxDefenders: 0,
        initialMaxGenerics: 3,
        kingCreepMaxCarryParts: 4,
        minerCreepMaxWorkParts: 6,
        transporterMultiplier: 1
    },
    structureStorage: {
        genericsEnergyThreshhold: 2000
    }
}