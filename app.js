import { createApp, ref, reactive, computed, watch, onMounted } from 'vue';
import * as THREE from 'three';

const app = createApp({
    setup() {
        // Game state
        const resources = reactive({
            money: 50,
            ore: 0,
            metal: 0,
            circuit: 0,
            plastic: 0,
            component: 0,
            gadget: 0,
            device: 0,
            quantumChip: 0,
            aiModule: 0
        });

        const displayedResources = computed(() => {
            const result = {};
            for (const [key, value] of Object.entries(resources)) {
                if (key !== 'money' && value > 0) {
                    result[key] = value;
                }
            }
            return result;
        });

        // Machine definitions
        const machineDefinitions = {
            oreMiner: {
                name: "Ore Miner",
                price: 50,
                inputRate: {},
                outputRate: { ore: 1 },
                baseUpgradeCost: 100,
                upgradeCostMultiplier: 1.5
            },
            metalRefiner: {
                name: "Metal Refiner",
                price: 150,
                inputRate: { ore: 2 },
                outputRate: { metal: 1 },
                baseUpgradeCost: 200,
                upgradeCostMultiplier: 1.5
            },
            circuitAssembler: {
                name: "Circuit Assembler",
                price: 500,
                inputRate: { metal: 2 },
                outputRate: { circuit: 1 },
                baseUpgradeCost: 750,
                upgradeCostMultiplier: 1.5
            },
            plasticInjector: {
                name: "Plastic Injector",
                price: 800,
                inputRate: {},
                outputRate: { plastic: 1 },
                baseUpgradeCost: 1200,
                upgradeCostMultiplier: 1.5
            },
            componentMaker: {
                name: "Component Maker",
                price: 2000,
                inputRate: { metal: 3, circuit: 1, plastic: 2 },
                outputRate: { component: 1 },
                baseUpgradeCost: 3000,
                upgradeCostMultiplier: 1.6
            },
            gadgetAssembler: {
                name: "Gadget Assembler",
                price: 5000,
                inputRate: { component: 2, circuit: 3 },
                outputRate: { gadget: 1 },
                baseUpgradeCost: 7500,
                upgradeCostMultiplier: 1.6
            },
            deviceFactory: {
                name: "Device Factory",
                price: 15000,
                inputRate: { gadget: 2, component: 5, plastic: 10 },
                outputRate: { device: 1 },
                baseUpgradeCost: 25000,
                upgradeCostMultiplier: 1.7
            },
            quantumProcessor: {
                name: "Quantum Processor",
                price: 50000,
                inputRate: { device: 1, circuit: 20 },
                outputRate: { quantumChip: 1 },
                baseUpgradeCost: 75000,
                upgradeCostMultiplier: 1.8
            },
            aiCore: {
                name: "AI Core",
                price: 200000,
                inputRate: { quantumChip: 2, device: 5 },
                outputRate: { aiModule: 1 },
                baseUpgradeCost: 300000,
                upgradeCostMultiplier: 2.0
            }
        };

        // Available machines (initially only basic machines are available)
        const availableMachines = reactive({
            oreMiner: { ...machineDefinitions.oreMiner },
            metalRefiner: { ...machineDefinitions.metalRefiner }
        });

        // Owned machines
        const ownedMachines = reactive({});

        // Market prices
        const market = reactive({
            ore: 2,
            metal: 8,
            circuit: 25,
            plastic: 10,
            component: 100,
            gadget: 300,
            device: 1000,
            quantumChip: 5000,
            aiModule: 25000
        });

        // Market amounts for selling
        const marketAmounts = reactive({
            ore: 1,
            metal: 1,
            circuit: 1,
            plastic: 1,
            component: 1,
            gadget: 1,
            device: 1,
            quantumChip: 1,
            aiModule: 1
        });

        // Research technologies
        const techDefinitions = {
            efficientMining: {
                name: "Efficient Mining",
                description: "Improves mining efficiency by 50%",
                cost: 500,
                costPerTick: 10,
                effect: () => {
                    // Apply efficiency boost to ore miners
                    for (const id in ownedMachines) {
                        if (id.includes("oreMiner")) {
                            ownedMachines[id].outputRate.ore *= 1.5;
                        }
                    }
                    showNotification("Mining efficiency boosted by 50%!", "success");
                },
                prerequisites: []
            },
            advancedMetallurgy: {
                name: "Advanced Metallurgy",
                description: "Unlocks Circuit Assembler and improves metal refining",
                cost: 1000,
                costPerTick: 25,
                effect: () => {
                    // Add circuit assembler to store
                    availableMachines.circuitAssembler = { ...machineDefinitions.circuitAssembler };
                    // Improve metal refiners
                    for (const id in ownedMachines) {
                        if (id.includes("metalRefiner")) {
                            ownedMachines[id].outputRate.metal *= 1.2;
                        }
                    }
                    showNotification("Circuit Assembler unlocked!", "success");
                },
                prerequisites: ["efficientMining"]
            },
            plasticProduction: {
                name: "Plastic Production",
                description: "Unlocks Plastic Injector",
                cost: 2000,
                costPerTick: 50,
                effect: () => {
                    availableMachines.plasticInjector = { ...machineDefinitions.plasticInjector };
                    showNotification("Plastic Injector unlocked!", "success");
                },
                prerequisites: ["advancedMetallurgy"]
            },
            componentEngineering: {
                name: "Component Engineering",
                description: "Unlocks Component Maker",
                cost: 5000,
                costPerTick: 100,
                effect: () => {
                    availableMachines.componentMaker = { ...machineDefinitions.componentMaker };
                    showNotification("Component Maker unlocked!", "success");
                },
                prerequisites: ["plasticProduction"]
            },
            gadgetDesign: {
                name: "Gadget Design",
                description: "Unlocks Gadget Assembler",
                cost: 12000,
                costPerTick: 250,
                effect: () => {
                    availableMachines.gadgetAssembler = { ...machineDefinitions.gadgetAssembler };
                    showNotification("Gadget Assembler unlocked!", "success");
                },
                prerequisites: ["componentEngineering"]
            },
            deviceManufacturing: {
                name: "Device Manufacturing",
                description: "Unlocks Device Factory",
                cost: 30000,
                costPerTick: 500,
                effect: () => {
                    availableMachines.deviceFactory = { ...machineDefinitions.deviceFactory };
                    showNotification("Device Factory unlocked!", "success");
                },
                prerequisites: ["gadgetDesign"]
            },
            automationSystems: {
                name: "Automation Systems",
                description: "All machines work 25% faster",
                cost: 50000,
                costPerTick: 1000,
                effect: () => {
                    for (const id in ownedMachines) {
                        for (const resource in ownedMachines[id].outputRate) {
                            ownedMachines[id].outputRate[resource] *= 1.25;
                        }
                    }
                    showNotification("All machines are now 25% faster!", "success");
                },
                prerequisites: ["deviceManufacturing"]
            },
            quantumComputing: {
                name: "Quantum Computing",
                description: "Unlocks Quantum Processor",
                cost: 100000,
                costPerTick: 2000,
                effect: () => {
                    availableMachines.quantumProcessor = { ...machineDefinitions.quantumProcessor };
                    // Add new resource to market
                    market.quantumChip = 5000;
                    showNotification("Quantum Processor unlocked!", "success");
                },
                prerequisites: ["automationSystems"]
            },
            artificialIntelligence: {
                name: "Artificial Intelligence",
                description: "Unlocks AI Core and adds passive income",
                cost: 500000,
                costPerTick: 5000,
                effect: () => {
                    availableMachines.aiCore = { ...machineDefinitions.aiCore };
                    // Add new resource to market
                    market.aiModule = 25000;
                    // Add passive income
                    passiveIncome.active = true;
                    passiveIncome.amount = 500;
                    showNotification("AI Core unlocked and passive income activated!", "success");
                },
                prerequisites: ["quantumComputing"]
            },
            resourceOptimization: {
                name: "Resource Optimization",
                description: "Reduces resource consumption by 20%",
                cost: 250000,
                costPerTick: 3000,
                effect: () => {
                    for (const id in ownedMachines) {
                        for (const resource in ownedMachines[id].inputRate) {
                            ownedMachines[id].inputRate[resource] *= 0.8;
                        }
                    }
                    showNotification("Resource consumption reduced by 20%!", "success");
                },
                prerequisites: ["automationSystems"]
            }
        };

        // Available research
        const availableResearch = reactive({});
        for (const [id, tech] of Object.entries(techDefinitions)) {
            availableResearch[id] = {
                ...tech,
                researched: false,
                researching: false,
                progress: 0
            };
        }

        // Achievements
        const achievements = reactive({
            firstMachine: {
                name: "First Steps",
                description: "Buy your first machine",
                unlocked: false,
                current: 0,
                target: 1,
                hidden: false
            },
            tenMachines: {
                name: "Small Factory",
                description: "Own 10 machines",
                unlocked: false,
                current: 0,
                target: 10,
                hidden: false
            },
            fiftyMachines: {
                name: "Industrial Complex",
                description: "Own 50 machines",
                unlocked: false,
                current: 0,
                target: 50,
                hidden: false
            },
            thousandOre: {
                name: "Mining Enthusiast",
                description: "Produce 1,000 ore",
                unlocked: false,
                current: 0,
                target: 1000,
                hidden: false
            },
            millionOre: {
                name: "Mining Tycoon",
                description: "Produce 1,000,000 ore",
                unlocked: false,
                current: 0,
                target: 1000000,
                hidden: false
            },
            firstResearch: {
                name: "Scientific Mind",
                description: "Complete your first research",
                unlocked: false,
                current: 0,
                target: 1,
                hidden: false
            },
            allResearch: {
                name: "Technological Marvel",
                description: "Complete all research technologies",
                unlocked: false,
                current: 0,
                target: Object.keys(techDefinitions).length,
                hidden: false
            },
            thousandMoney: {
                name: "Entrepreneur",
                description: "Earn $1,000",
                unlocked: false,
                current: 0,
                target: 1000,
                hidden: false
            },
            millionMoney: {
                name: "Millionaire",
                description: "Earn $1,000,000",
                unlocked: false,
                current: 0,
                target: 1000000,
                hidden: false
            },
            firstDevice: {
                name: "Tech Pioneer",
                description: "Produce your first device",
                unlocked: false,
                current: 0,
                target: 1,
                hidden: true
            },
            firstQuantumChip: {
                name: "Quantum Pioneer",
                description: "Produce your first quantum chip",
                unlocked: false,
                current: 0,
                target: 1,
                hidden: true
            },
            firstAiModule: {
                name: "Artificial Genius",
                description: "Produce your first AI module",
                unlocked: false,
                current: 0,
                target: 1,
                hidden: true
            },
            maxLevel: {
                name: "Perfectionist",
                description: "Upgrade a machine to level 10",
                unlocked: false,
                current: 0,
                target: 10,
                hidden: false
            },
            fastProduction: {
                name: "Speed Demon",
                description: "Have 10 devices produced per second",
                unlocked: false,
                current: 0,
                target: 10,
                hidden: true
            }
        });

        // Statistics
        const stats = reactive({
            timePlayed: 0,
            moneyEarned: 0,
            machinesBought: 0,
            resourcesProduced: 0,
            resourcesSold: 0,
            upgradesBought: 0,
            techsResearched: 0
        });

        // Game settings
        const settings = reactive({
            gameSpeed: 1,
            numberFormat: 'standard',
            autoSave: true,
            lastSave: null
        });

        // Add missing passive income object
        const passiveIncome = reactive({
            active: false,
            amount: 0,
            lastCollected: Date.now()
        });

        // Prestige system
        const prestige = reactive({
            multiplier: 1,
            prestigePoints: 0,
            cost: 1000000
        });

        // UI state
        const currentTab = ref('Factory');
        const tabs = ['Factory', 'Store', 'Market', 'Research', 'Achievements', 'Statistics', 'Settings'];
        const activeNotifications = ref([]);
        const newAchievement = ref(null);

        // Timer for game loop
        let gameInterval;

        // Show notification function
        function showNotification(message, type = 'info') {
            activeNotifications.value.push({ message, type });

            // Limit notifications to 5 at a time
            if (activeNotifications.value.length > 5) {
                activeNotifications.value.shift();
            }
        }

        // Remove notification
        function removeNotification(index) {
            activeNotifications.value.splice(index, 1);
        }

        // Check and unlock achievements
        function checkAchievements() {
            // Count total machines
            const totalMachines = Object.keys(ownedMachines).length;

            if (!achievements.firstMachine.unlocked && totalMachines >= 1) {
                unlockAchievement('firstMachine');
            }

            if (!achievements.tenMachines.unlocked && totalMachines >= 10) {
                unlockAchievement('tenMachines');
            }

            if (!achievements.fiftyMachines.unlocked && totalMachines >= 50) {
                unlockAchievement('fiftyMachines');
            }

            // Track ore production
            if (!achievements.thousandOre.unlocked && achievements.thousandOre.current >= 1000) {
                unlockAchievement('thousandOre');
            }

            if (!achievements.millionOre.unlocked && achievements.millionOre.current >= 1000000) {
                unlockAchievement('millionOre');
            }

            // Research achievements
            const completedResearch = Object.values(availableResearch).filter(tech => tech.researched).length;

            if (!achievements.firstResearch.unlocked && completedResearch >= 1) {
                unlockAchievement('firstResearch');
            }

            if (!achievements.allResearch.unlocked && completedResearch >= Object.keys(techDefinitions).length) {
                unlockAchievement('allResearch');
            }

            // Money achievements
            if (!achievements.thousandMoney.unlocked && stats.moneyEarned >= 1000) {
                unlockAchievement('thousandMoney');
            }

            if (!achievements.millionMoney.unlocked && stats.moneyEarned >= 1000000) {
                unlockAchievement('millionMoney');
            }

            // First device
            if (!achievements.firstDevice.unlocked && resources.device >= 1) {
                unlockAchievement('firstDevice');
            }

            // New achievement checks
            // Check for producing quantum chips
            if (!achievements.firstQuantumChip.unlocked && achievements.firstQuantumChip.current >= 1) {
                unlockAchievement('firstQuantumChip');
            }

            // Check for producing AI modules
            if (!achievements.firstAiModule.unlocked && achievements.firstAiModule.current >= 1) {
                unlockAchievement('firstAiModule');
            }

            // Check for max level machine
            const maxMachineLevel = Object.values(ownedMachines).reduce((max, machine) => 
                Math.max(max, machine.level), 0);
            
            if (!achievements.maxLevel.unlocked && maxMachineLevel >= 10) {
                unlockAchievement('maxLevel');
                achievements.maxLevel.current = maxMachineLevel;
            }
            
            // Check for fast device production
            if (!achievements.fastProduction.unlocked && achievements.fastProduction.current >= 10) {
                unlockAchievement('fastProduction');
            }

            // Update achievement progress
            achievements.firstMachine.current = Math.min(achievements.firstMachine.target, totalMachines);
            achievements.tenMachines.current = Math.min(achievements.tenMachines.target, totalMachines);
            achievements.fiftyMachines.current = Math.min(achievements.fiftyMachines.target, totalMachines);
            achievements.firstResearch.current = Math.min(achievements.firstResearch.target, completedResearch);
            achievements.allResearch.current = Math.min(achievements.allResearch.target, completedResearch);
            achievements.thousandMoney.current = Math.min(achievements.thousandMoney.target, stats.moneyEarned);
            achievements.millionMoney.current = Math.min(achievements.millionMoney.target, stats.moneyEarned);
            achievements.firstDevice.current = Math.min(achievements.firstDevice.target, resources.device);
        }

        // Unlock achievement
        function unlockAchievement(id) {
            if (!achievements[id].unlocked) {
                achievements[id].unlocked = true;
                newAchievement.value = { ...achievements[id] };
                showNotification(`Achievement unlocked: ${achievements[id].name}!`, 'success');
            }
        }

        // Game loop
        function gameLoop() {
            // Process machines
            for (const id in ownedMachines) {
                const machine = ownedMachines[id];

                if (machine.isRunning) {
                    // Check if we have enough input resources
                    let canProduce = true;
                    for (const resource in machine.inputRate) {
                        const required = machine.inputRate[resource] * machine.level * 0.1; // Per tick
                        if (resources[resource] < required) {
                            canProduce = false;
                            break;
                        }
                    }

                    if (canProduce) {
                        // Consume input resources
                        for (const resource in machine.inputRate) {
                            const amount = machine.inputRate[resource] * machine.level * 0.1;
                            resources[resource] -= amount;
                        }

                        // Progress production
                        machine.progress += 10; // 10% progress per tick

                        // Complete production if progress reaches 100%
                        if (machine.progress >= 100) {
                            // Produce output resources
                            for (const resource in machine.outputRate) {
                                const amount = machine.outputRate[resource] * machine.level * prestige.multiplier;
                                resources[resource] = (resources[resource] || 0) + amount;

                                // Track statistics
                                stats.resourcesProduced += amount;

                                // Track specific resources for achievements
                                if (resource === 'ore') {
                                    achievements.thousandOre.current += amount;
                                    achievements.millionOre.current += amount;
                                }
                                
                                // Track new achievements for advanced resources
                                if (resource === 'quantumChip') {
                                    achievements.firstQuantumChip.current += amount;
                                }
                                
                                if (resource === 'aiModule') {
                                    achievements.firstAiModule.current += amount;
                                }
                                
                                if (resource === 'device') {
                                    achievements.fastProduction.current = 
                                        Object.values(ownedMachines)
                                            .filter(m => m.isRunning && m.outputRate.device)
                                            .reduce((sum, m) => sum + (m.outputRate.device * m.level * prestige.multiplier), 0);
                                }
                            }

                            // Reset progress
                            machine.progress = 0;
                        }
                    } else {
                        machine.progress = 0; // Reset progress if we can't produce
                    }
                }
            }

            // Process passive income
            if (passiveIncome.active) {
                resources.money += passiveIncome.amount * prestige.multiplier * 0.1; // Per tick (0.1s)
                stats.moneyEarned += passiveIncome.amount * prestige.multiplier * 0.1;
            }
            
            // Process researching technologies
            for (const id in availableResearch) {
                const tech = availableResearch[id];

                if (tech.researching && !tech.researched) {
                    if (resources.money >= tech.costPerTick) {
                        resources.money -= tech.costPerTick;
                        tech.progress += (100 / (tech.cost / tech.costPerTick)) * settings.gameSpeed;

                        if (tech.progress >= 100) {
                            tech.researched = true;
                            tech.researching = false;
                            tech.progress = 100;
                            tech.effect();
                            stats.techsResearched++;
                            checkAchievements();
                        }
                    } else {
                        tech.researching = false;
                        showNotification("Research paused: Not enough money.", "warning");
                    }
                }
            }

            // Update market prices (slight fluctuation)
            for (const resource in market) {
                // Random fluctuation of ±2%
                const fluctuation = 0.98 + Math.random() * 0.04;
                market[resource] *= fluctuation;

                // Ensure minimum price
                market[resource] = Math.max(market[resource], 1);
            }

            // Update game statistics
            stats.timePlayed += 0.1; // Each tick is 0.1 seconds

            // Auto-save
            if (settings.autoSave && stats.timePlayed % 60 === 0) { // Auto-save every minute
                saveGame();
            }

            // Check achievements
            checkAchievements();
        }

        // Buy machine
        function buyMachine(id) {
            const machine = availableMachines[id];

            if (resources.money >= machine.price) {
                resources.money -= machine.price;

                // Create a unique ID for this machine instance
                const instanceId = `${id}_${Date.now()}`;

                // Create a new machine instance
                ownedMachines[instanceId] = {
                    name: machine.name,
                    level: 1,
                    inputRate: { ...machine.inputRate },
                    outputRate: { ...machine.outputRate },
                    baseUpgradeCost: machine.baseUpgradeCost,
                    upgradeCostMultiplier: machine.upgradeCostMultiplier,
                    isRunning: true,
                    progress: 0
                };

                showNotification(`Purchased a new ${machine.name}!`, 'success');
                stats.machinesBought++;
                checkAchievements();
            } else {
                showNotification("Not enough money to buy this machine.", "error");
            }
        }

        // Upgrade machine
        function upgradeMachine(id) {
            const machine = ownedMachines[id];
            const cost = getUpgradeCost(id);

            if (resources.money >= cost) {
                resources.money -= cost;

                // Increase level
                machine.level++;

                showNotification(`Upgraded ${machine.name} to level ${machine.level}!`, 'success');
                stats.upgradesBought++;
            } else {
                showNotification("Not enough money to upgrade this machine.", "error");
            }
        }

        // Get upgrade cost
        function getUpgradeCost(id) {
            const machine = ownedMachines[id];
            return Math.floor(machine.baseUpgradeCost * Math.pow(machine.upgradeCostMultiplier, machine.level - 1));
        }

        // Can afford upgrade
        function canAffordUpgrade(id) {
            return resources.money >= getUpgradeCost(id);
        }

        // Sell machine
        function sellMachine(id) {
            const machine = ownedMachines[id];
            const sellValue = getSellValue(id);

            resources.money += sellValue;
            delete ownedMachines[id];

            showNotification(`Sold ${machine.name} for $${formatNumber(sellValue)}.`, 'info');
        }

        // Get sell value
        function getSellValue(id) {
            const machine = ownedMachines[id];
            // Sell value is 50% of total investment
            const baseCost = machine.baseUpgradeCost / machine.upgradeCostMultiplier; // Reverse engineer original price

            let totalInvestment = baseCost;
            for (let i = 1; i < machine.level; i++) {
                totalInvestment += machine.baseUpgradeCost * Math.pow(machine.upgradeCostMultiplier, i - 1);
            }

            return Math.floor(totalInvestment * 0.5);
        }

        // Toggle machine
        function toggleMachine(id) {
            ownedMachines[id].isRunning = !ownedMachines[id].isRunning;

            if (ownedMachines[id].isRunning) {
                showNotification(`Started ${ownedMachines[id].name}.`, 'info');
            } else {
                showNotification(`Stopped ${ownedMachines[id].name}.`, 'info');
            }
        }

        // Sell resource
        function sellResource(resource) {
            const amount = marketAmounts[resource];

            if (resources[resource] >= amount) {
                const value = market[resource] * amount;
                resources[resource] -= amount;
                resources.money += value;

                stats.moneyEarned += value;
                stats.resourcesSold += amount;

                showNotification(`Sold ${amount} ${resource} for $${formatNumber(value)}.`, 'success');
                checkAchievements();
            } else {
                showNotification(`Not enough ${resource} to sell.`, 'error');
            }
        }

        // Increase market amount
        function increaseAmount(resource) {
            marketAmounts[resource] = Math.min(marketAmounts[resource] * 10, 1000000);
        }

        // Decrease market amount
        function decreaseAmount(resource) {
            marketAmounts[resource] = Math.max(Math.floor(marketAmounts[resource] / 10), 1);
        }

        // Research technology
        function researchTech(id) {
            const tech = availableResearch[id];

            if (!tech.researched && !tech.researching && isTechAvailable(id)) {
                if (resources.money >= tech.costPerTick) {
                    tech.researching = true;
                    showNotification(`Started researching ${tech.name}.`, 'info');
                } else {
                    showNotification("Not enough money to start research.", "error");
                }
            }
        }

        // Check if technology is available (prerequisites are met)
        function isTechAvailable(id) {
            const tech = availableResearch[id];

            if (tech.prerequisites.length === 0) {
                return true;
            }

            // Check if all prerequisites are researched
            return tech.prerequisites.every(prereqId => availableResearch[prereqId].researched);
        }

        // Save game
        function saveGame() {
            const saveData = {
                resources,
                ownedMachines,
                availableMachines,
                availableResearch,
                market,
                stats,
                settings,
                achievements,
                prestige,
                passiveIncome
            };

            try {
                localStorage.setItem('factoryTycoonSave', JSON.stringify(saveData));
                settings.lastSave = new Date().toLocaleString();
                showNotification("Game saved successfully.", "success");
                return saveData;
            } catch (error) {
                showNotification("Failed to save game: " + error.message, "error");
                return null;
            }
        }
        
        // Export save
        function exportSave() {
            const saveData = saveGame();
            if (saveData) {
                const saveString = btoa(JSON.stringify(saveData));
                
                // Create a downloadable file
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveString));
                element.setAttribute('download', `factoryTycoon_save_${new Date().toISOString().slice(0,10)}.txt`);
                
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                
                showNotification("Save file exported successfully!", "success");
            }
        }
        
        // Import save functionality
        function triggerFileInput() {
            this.$refs.fileInput.click();
        }

        // Import save
        function importSave(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const saveString = e.target.result;
                    const saveData = JSON.parse(atob(saveString));
                    
                    // Load the save data
                    Object.assign(resources, saveData.resources);
                    Object.assign(stats, saveData.stats);
                    Object.assign(settings, saveData.settings);
                    Object.assign(achievements, saveData.achievements);
                    Object.assign(prestige, saveData.prestige);
                    
                    if (saveData.passiveIncome) {
                        Object.assign(passiveIncome, saveData.passiveIncome);
                    }
                    
                    // Clear and reload collections
                    for (const id in ownedMachines) {
                        delete ownedMachines[id];
                    }
                    for (const id in saveData.ownedMachines) {
                        ownedMachines[id] = saveData.ownedMachines[id];
                    }

                    for (const id in availableMachines) {
                        delete availableMachines[id];
                    }
                    for (const id in saveData.availableMachines) {
                        availableMachines[id] = saveData.availableMachines[id];
                    }

                    for (const id in market) {
                        delete market[id];
                    }
                    for (const id in saveData.market) {
                        market[id] = saveData.market[id];
                    }

                    for (const id in availableResearch) {
                        if (saveData.availableResearch[id]) {
                            Object.assign(availableResearch[id], saveData.availableResearch[id]);
                        }
                    }
                    
                    showNotification("Save file imported successfully!", "success");
                    
                    // Clear the file input
                    event.target.value = '';
                } catch (error) {
                    showNotification("Failed to import save: " + error.message, "error");
                }
            };
            reader.readAsText(file);
        }

        // Load game
        function loadGame() {
            try {
                const saveData = JSON.parse(localStorage.getItem('factoryTycoonSave'));

                if (saveData) {
                    // Load saved data into reactive objects
                    Object.assign(resources, saveData.resources);
                    Object.assign(stats, saveData.stats);
                    Object.assign(settings, saveData.settings);
                    Object.assign(achievements, saveData.achievements);
                    Object.assign(prestige, saveData.prestige);

                    // Clear and reload collections
                    for (const id in ownedMachines) {
                        delete ownedMachines[id];
                    }
                    for (const id in saveData.ownedMachines) {
                        ownedMachines[id] = saveData.ownedMachines[id];
                    }

                    for (const id in availableMachines) {
                        delete availableMachines[id];
                    }
                    for (const id in saveData.availableMachines) {
                        availableMachines[id] = saveData.availableMachines[id];
                    }

                    for (const id in market) {
                        delete market[id];
                    }
                    for (const id in saveData.market) {
                        market[id] = saveData.market[id];
                    }

                    for (const id in availableResearch) {
                        Object.assign(availableResearch[id], saveData.availableResearch[id]);
                    }

                    showNotification("Game loaded successfully.", "success");
                } else {
                    showNotification("No saved game found.", "warning");
                }
            } catch (error) {
                showNotification("Failed to load game: " + error.message, "error");
            }
        }

        // Reset game
        function resetGame() {
            if (confirm("Are you sure you want to reset your game? All progress will be lost.")) {
                localStorage.removeItem('factoryTycoonSave');
                location.reload();
            }
        }

        // Format numbers according to settings
        function formatNumber(num) {
            if (isNaN(num)) return "0";

            switch (settings.numberFormat) {
                case 'scientific':
                    return num.toExponential(2);
                case 'compact':
                    return new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1
                    }).format(num);
                case 'standard':
                default:
                    return new Intl.NumberFormat('en-US').format(Math.floor(num));
            }
        }

        // Format time
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            return `${hours}h ${minutes}m ${secs}s`;
        }

        // Capitalize first letter
        function capitalizeFirst(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        // Create resource particle with improved animation
        function createResourceParticle(machineEl, resource) {
            if (!machineEl) return;

            const colors = {
                ore: '#9c9c9c',
                metal: '#b5b5b5',
                circuit: '#38bdf8',
                plastic: '#fb923c',
                component: '#84cc16',
                gadget: '#ef4444',
                device: '#10b981',
                money: '#f59e0b',
                quantumChip: '#8b9467',
                aiModule: '#421f44'
            };

            // Create multiple particles for a more dramatic effect
            const particleCount = Math.min(Math.floor(Math.random() * 3) + 1, 3);

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'resource-particle';
                particle.style.setProperty('--random', Math.random());
                particle.innerHTML = `<i class="fas fa-${getResourceIcon(resource)}"></i>`;
                particle.style.position = 'absolute';
                particle.style.color = colors[resource] || colors.money;
                particle.style.fontSize = `${10 + Math.random() * 4}px`;
                particle.style.opacity = '0.8';
                particle.style.top = `${Math.random() * 50 + 25}%`;
                particle.style.left = `${Math.random() * 50 + 25}%`;
                particle.style.zIndex = '10';
                particle.style.pointerEvents = 'none';
                particle.style.textShadow = `0 0 5px ${colors[resource]}`;

                machineEl.appendChild(particle);

                // Remove particle after animation completes
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1500);
            }
        }

        // Get resource icon
        function getResourceIcon(resource) {
            const icons = {
                ore: 'mountain',
                metal: 'cubes',
                circuit: 'microchip',
                plastic: 'flask',
                component: 'cogs',
                gadget: 'gamepad',
                device: 'tablet',
                money: 'coins',
                quantumChip: 'atom',
                aiModule: 'robot'
            };

            return icons[resource] || 'circle';
        }

        // Enhanced 3D scene setup with better lighting
        function setup3DElements() {
            // Only setup if we're on the Factory tab and have WebGL support
            const container = document.querySelector('.tab-content');
            if (!container || !window.WebGLRenderingContext) return;

            // Scene setup
            let scene, camera, renderer, cube;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

            try {
                renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setClearColor(0x000000, 0);

                // Create a factory icon in 3D with better materials
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const edges = new THREE.EdgesGeometry(geometry);
                const material = new THREE.LineBasicMaterial({
                    color: 0x7c3aed,
                    linewidth: 2
                });

                cube = new THREE.LineSegments(edges, material);
                scene.add(cube);

                // Add ambient light
                const ambientLight = new THREE.AmbientLight(0x404040);
                scene.add(ambientLight);

                // Add directional light
                const directionalLight = new THREE.DirectionalLight(0x7c3aed, 1);
                directionalLight.position.set(1, 1, 1);
                scene.add(directionalLight);

                camera.position.z = 5;

                // Add it to the DOM
                const headerEl = document.querySelector('header');
                if (headerEl) {
                    const canvas3D = document.createElement('div');
                    canvas3D.className = 'factory-3d';
                    canvas3D.style.position = 'absolute';
                    canvas3D.style.top = '10px';
                    canvas3D.style.right = '20px';
                    canvas3D.style.width = '80px';
                    canvas3D.style.height = '80px';
                    canvas3D.style.zIndex = '5';
                    headerEl.style.position = 'relative';
                    headerEl.appendChild(canvas3D);
                    canvas3D.appendChild(renderer.domElement);
                }

                animate();
            } catch (e) {
                console.warn('WebGL not supported:', e);
            }
        }

        function animate() {
            if (!cube || !renderer || !scene || !camera) return;

            requestAnimationFrame(animate);

            // More dynamic animation
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            // Add slight wobble
            cube.position.y = Math.sin(Date.now() * 0.001) * 0.1;

            renderer.render(scene, camera);
        }

        // Add machine icon animations
        function setupMachineAnimations() {
            const machines = document.querySelectorAll('.machine-card');
            machines.forEach(machine => {
                machine.addEventListener('mouseenter', () => {
                    const header = machine.querySelector('h3');
                    if (header) {
                        header.style.transform = 'translateZ(20px)';
                    }
                });

                machine.addEventListener('mouseleave', () => {
                    const header = machine.querySelector('h3');
                    if (header) {
                        header.style.transform = 'translateZ(0)';
                    }
                });
            });
        }

        // Enhanced game loop with visual effects
        const originalGameLoop = gameLoop;
        function enhancedGameLoop() {
            originalGameLoop();

            // Add visual effects for production
            for (const id in ownedMachines) {
                const machine = ownedMachines[id];
                if (machine.isRunning && machine.progress >= 99) {
                    // Production completed, show particles
                    const machineEl = document.querySelector(`[data-machine-id="${id}"]`);
                    if (machineEl) {
                        for (const resource in machine.outputRate) {
                            // Create particles for each produced resource
                            for (let i = 0; i < Math.min(machine.outputRate[resource], 5); i++) {
                                createResourceParticle(machineEl, resource);
                            }
                        }
                    }
                }
            }
        }

        // Replace original game loop with enhanced version
        gameLoop = enhancedGameLoop;

        // Change theme function
        function changeTheme(theme) {
            settings.theme = theme;
            document.body.dataset.theme = theme === 'purple' ? '' : theme;

            // Apply theme class to all interactive elements
            document.querySelectorAll('button, select, input, .progress, .machine-card, .store-item, .research-item, .market-item, .achievement-item, .stat-item, .tabs, .tab-content, .resource, .notifications, .notification, .achievement-popup, header, .toggle')
                .forEach(el => {
                    el.setAttribute('data-theme', theme === 'purple' ? '' : theme);
                });

            // Save theme preference to localStorage
            localStorage.setItem('factoryTycoonTheme', theme);
            showNotification(`Theme changed to ${theme}!`, 'success');
        }

        // Get resource color
        function getResourceColor(resource) {
            const colors = {
                ore: '#9c9c9c',
                metal: '#b5b5b5',
                circuit: '#38bdf8',
                plastic: '#fb923c',
                component: '#84cc16',
                gadget: '#ef4444',
                device: '#10b981',
                money: '#f59e0b',
                quantumChip: '#8b9467',
                aiModule: '#421f44'
            };
            return colors[resource] || '#ffffff';
        }

        // Perform prestige
        function performPrestige() {
            if (resources.money >= prestige.cost) {
                // Calculate prestige points to gain
                const pointsToGain = Math.floor(Math.sqrt(resources.money / 1000000));
                
                // Add to prestige points
                prestige.prestigePoints += pointsToGain;
                
                // Update multiplier (2% per point)
                prestige.multiplier = 1 + (prestige.prestigePoints * 0.02);
                
                // Increase cost for next prestige
                prestige.cost *= 5;
                
                // Reset resources but keep prestige points and multiplier
                for (const resource in resources) {
                    if (resource !== 'quantumChip' && resource !== 'aiModule') {
                        resources[resource] = 0;
                    } else {
                        resources[resource] = Math.floor(resources[resource] * 0.1); // Keep 10% of advanced resources
                    }
                }
                resources.money = 100 * prestige.multiplier; // Starting money scales with prestige
                
                // Reset machines
                for (const id in ownedMachines) {
                    delete ownedMachines[id];
                }
                
                // Keep research progress
                // But reset progress on unfinished research
                for (const id in availableResearch) {
                    if (!availableResearch[id].researched) {
                        availableResearch[id].progress = 0;
                        availableResearch[id].researching = false;
                    }
                }
                
                showNotification(`Prestige complete! Gained ${pointsToGain} prestige points. Production multiplier is now ${(prestige.multiplier).toFixed(2)}x`, "success");
            } else {
                showNotification(`You need $${formatNumber(prestige.cost)} to prestige!`, "error");
            }
        }

        // Start game loop when mounted
        onMounted(() => {
            // Try to load saved game
            if (localStorage.getItem('factoryTycoonSave')) {
                loadGame();
            }

            // Start game loop
            gameInterval = setInterval(() => {
                gameLoop();
            }, 100 / settings.gameSpeed); // 10 ticks per second, adjusted by game speed

            // Watch for game speed changes
            watch(() => settings.gameSpeed, (newSpeed) => {
                clearInterval(gameInterval);
                gameInterval = setInterval(() => {
                    gameLoop();
                }, 100 / newSpeed);
            });

            // Add 3D elements after a short delay
            setTimeout(() => {
                setup3DElements();
            }, 500);

            // Add machine ID attributes for animation targeting
            const observer = new MutationObserver(() => {
                document.querySelectorAll('.machine-card').forEach((card, index) => {
                    // Extract the ID from the machine card
                    const machineId = Object.keys(ownedMachines)[index];
                    if (machineId) {
                        card.setAttribute('data-machine-id', machineId);
                        card.style.transformStyle = 'preserve-3d';
                    }
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });

        return {
            // State
            resources,
            displayedResources,
            ownedMachines,
            availableMachines,
            market,
            marketAmounts,
            availableResearch,
            achievements,
            stats,
            settings,
            currentTab,
            tabs,
            activeNotifications,
            newAchievement,
            prestige,
            passiveIncome,

            // Methods
            buyMachine,
            upgradeMachine,
            getUpgradeCost,
            canAffordUpgrade,
            sellMachine,
            getSellValue,
            toggleMachine,
            sellResource,
            increaseAmount,
            decreaseAmount,
            researchTech,
            isTechAvailable,
            saveGame,
            loadGame,
            resetGame,
            exportSave,
            importSave,
            triggerFileInput,
            formatNumber,
            formatTime,
            capitalizeFirst,
            showNotification,
            removeNotification,
            setup3DElements,
            setupMachineAnimations,
            getResourceIcon,
            getResourceColor,
            performPrestige
        };
    }
}).mount('#app');