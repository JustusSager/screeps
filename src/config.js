
module.exports = {
    basebuilding: {
        printResult: true,
        maxConstructionSites: 3,
        flagNames: [
            'BunkerFlag',
            'BunkerFlag1'
        ]
    },
    structureLink: {
        upperThreshold: 50
    },
    structureTower: {
        repairEnergyThreshold: 750,
        repairMaxHits: 1000000
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
        minerCreepMaxWorkParts: 6
    }
}