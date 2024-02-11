import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const COLORS = {
    BLACK: "\u001b[30m",    RED: "\u001b[31m",      GREEN: "\u001b[32m",  YELLOW: "\u001b[33m",   
    BLUE: "\u001b[34m",     MAGENTA: "\u001b[35m",  CYAN: "\u001b[36m",   WHITE: "\u001b[37m"
  };
  const COLOR_RESET = "\u001b[0m";

  const CITIES = ["Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Volhaven"]

  const sleeveCount = await easyRun(ns, "sleeve/getNumSleeves");

  let sleeveDoingTracking = false;
  let sleeveDoingBountyHunting = false;
  let sleeveDoingRetirement = false;
  let sleeveDoingInfiltration = false;

  ns.print("Sleeve management script starting . . .");

  // Start managing each sleeve in its own loop
  for (let sleeveIndex = 0; sleeveIndex < sleeveCount; sleeveIndex++) {
    manageSleeve(sleeveIndex);
    await ns.asleep(100); // stagger sleeve management slightly - to reduce race conditions, mostly.
  }

  // keep the script running...
  while(true){ await ns.asleep(1) }

  async function manageSleeve(sleeveIndex) {
    ns.print(`${COLORS.CYAN}SLEEVE${sleeveIndex}-Managing Sleeve ${sleeveIndex}${COLOR_RESET}`);
    while (true) {
      await accumulateCycles(sleeveIndex, true);
      await sleevePrep(sleeveIndex);
      //ns.print(`SLEEVE${sleeveIndex} - Purchasing Sleeve augmentations.`)
      await purchaseSleeveAugs(sleeveIndex);
      ns.print(`${COLORS.CYAN}SLEEVE${sleeveIndex} - Assigning Sleeve to task. . .${COLOR_RESET}`)
      await assignTask(sleeveIndex);
      //ns.print(`SLEEVE${sleeveIndex}      Finishing Sleeve ${sleeveIndex} preparation . . .`)
      //await finalSleevePrep(sleeveIndex, easyRunArgs);
      await ns.asleep(25);
    }
  }

  async function completeSleeveWork(sleeveIndex, reportAccumulation = true){
    const currentTask = ns.sleeve.getTask(sleeveIndex); // THIS CONTAINS A PROMISE AND EASYRUN MURDERS PROMISES
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
    const storedCycles = sleeveData.storedCycles;
    const normalTime = 200;
    const acceleratedTime = normalTime / 15;
    // if the task doesnt exist (???) return.
    const taskExists = currentTask !== null;
    if (!taskExists){ ns.print(`ERROR: TASK DOESNT EXIST?`); return; }
    // if task is completable, wait for a completion.
    //ns.print(`currentTask keys: ${Object.keys(currentTask)}`)
    const taskKeys = Object.keys(currentTask);
    if (taskKeys.includes("cyclesNeeded")){
      // if the task has it, just await next completion...
      if (taskKeys.includes("nextCompletion")) { 
        await currentTask.nextCompletion; 
        await accumulateCycles(sleeveIndex, reportAccumulation);
        return; 
      } 
      // else wait for the rest of cycles required
      else {
        //ns.print(`SLEEVE${sleeveIndex}    Completing ${currentTask.type} task . . .`)
        const storedCycles = sleeveData.storedCycles;

        const waitTime = storedCycles < 1 ? // if no stored cycles
          currentTask.cyclesNeeded * normalTime : // we are in normal time.
          storedCycles > currentTask.cyclesNeeded ? // else, if we have more stored cycles than task cycles
            currentTask.cyclesNeeded * acceleratedTime : // entire task is in acclerated time
            storedCycles * acceleratedTime + (currentTask.cyclesNeeded-storedCycles) * normalTime; // else, only part of task accelerated

        //const waitTime = currentTask.cyclesNeeded * normalTime;
        
        ns.print(`              Waiting ${ns.tFormat(waitTime)} to complete task . . .`)
        await ns.asleep(waitTime); 
        await accumulateCycles(sleeveIndex, reportAccumulation);
        return; // sleep and exit.
      }
    }
    // continuous task; use up a few cycles
    const targetCycles = 100;
    const sleepTime = storedCycles < 1 ?            // if no stored cycles
          targetCycles * normalTime :                             // do 100 cycles in normal time.
          storedCycles > targetCycles ?                           // else - if we have more stored cycles than we plan to consume
            targetCycles * acceleratedTime :                                              // do entire task in acclerated time
            storedCycles * acceleratedTime + (targetCycles - storedCycles) * normalTime;  // else do only part of task accelerated
    //ns.print(`Task has no 'cyclesNeeded', defaulting to 100 cycles (~${ns.tFormat(sleepTime)}).`)
    await ns.asleep(sleepTime); 
    await accumulateCycles(sleeveIndex, reportAccumulation);
    return;
  }

  async function isSleevePrepped(sleeveIndex){
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
    if (sleeveData.sync < 100)          { return false; }
    else {ns.print(`SLEEVE${sleeveIndex} - - Sleeve is fully synced.`)}
    if (sleeveData.shock > 0)          { return false; }
    else {ns.print(`SLEEVE${sleeveIndex} - - Sleeve is ${sleeveData.shock}% shocked.`)}
    if (sleeveData.storedCycles < 1000) { return false; }
    else {ns.print(`SLEEVE${sleeveIndex} - - Sleeve has ${sleeveData.storedCycles} stored cycles.`)}

    return true;
  }
  
  async function sleevePrep(sleeveIndex){
    // consume 100 accumulated cycles...
    const cycleLength = 200;//in ms
    const cycles = 100;

    await accumulateCycles(sleeveIndex, false);

    const sleevePrepped = await isSleevePrepped(sleeveIndex);
    if (!sleevePrepped) ns.print(`${COLORS.YELLOW}SLEEVE${sleeveIndex} - Sleeve is not prepped.${COLOR_RESET}`)

    // do up to 10 syncs initially; less as sync rises.
    for( let repeat = 0; repeat < 10; repeat++){ await doSleeveSyncUntil(sleeveIndex, 100); }

    // do up to 10 syncs initially; less as shock falls.
    for( let repeat = 0; repeat < 10; repeat++){ await doShockRecoveryUntil(sleeveIndex, 100); }

    async function doShockRecoveryUntil(sleeveIndex, cutoff){
      cutoff = 100 - cutoff;
      const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
      if (sleeveData.shock === 0) return;
      if (sleeveData.shock > cutoff) { 
        //await accumulateCycles(sleeveIndex);
        const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
        const sleepTime = sleeveData.storedCycles > 1000 ? cycles * (cycleLength/15) : cycles * (cycleLength);
        ns.print(`${COLORS.GREEN}SLEEVE${sleeveIndex}- - -Reducing Shock for ${ns.tFormat(sleepTime)} (${ns.formatNumber(100 - sleeveData.shock, 1)}% recovered). . .${COLOR_RESET}`);
        await easyRun(ns, "sleeve/setToShockRecovery", sleeveIndex); 
        await completeSleeveWork(sleeveIndex);
      }
    }

    async function doSleeveSyncUntil(sleeveIndex, cutoff){
      const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
      if (sleeveData.sync === 100) return;
      if (sleeveData.sync < cutoff) { 
        //await accumulateCycles(sleeveIndex);
        const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
        const sleepTime = sleeveData.storedCycles > 1000 ? cycles * (cycleLength/15) : cycles * (cycleLength);
        ns.print(`${COLORS.GREEN}SLEEVE${sleeveIndex}- - -Increasing synchronization for ${ns.tFormat(sleepTime)} (${ns.formatNumber(sleeveData.sync, 1)}% synced). . .${COLOR_RESET}`)
        await easyRun(ns, "sleeve/setToSynchronize", sleeveIndex); 
        await completeSleeveWork(sleeveIndex);
      }
    }

    //await accumulateCycles(sleeveIndex);
    return;
  }
    async function accumulateCycles(sleeveIndex, report = true){
      const cycleLength = 200;//in ms
      let sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
      let sleeveCycles = sleeveData.storedCycles;
      const storedCyclesTarget = 5000;
      while (sleeveCycles < storedCyclesTarget){
        await easyRun(ns, "sleeve/setToIdle", sleeveIndex);
        const cyclesTo1000 = storedCyclesTarget - sleeveData.storedCycles;
        //if (report) ns.print(`${COLORS.YELLOW}SLEEVE${sleeveIndex}- - -Sleeve has ${sleeveData.storedCycles} stored cycles.
        //    Waiting ${ns.tFormat(cycleLength * cyclesTo1000)} . . .${COLOR_RESET}`)
        await ns.asleep(cycleLength * cyclesTo1000);
        sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
        sleeveCycles = sleeveData.storedCycles;
      }
      //if (report) ns.print(`SLEEVE${sleeveIndex}- - -Sleeve has ${sleeveData.storedCycles} stored cycles.`)
    }

  async function purchaseSleeveAugs(sleeveIndex){
    const sleevePurchasableAugs = await easyRun(ns, "sleeve/getSleevePurchasableAugs", sleeveIndex); // [{cost:Number, name:string},...]
    // if null
    if (sleevePurchasableAugs === null) return;
    // if returns singular object
    if (typeof sleevePurchasableAugs === "object"){
      const augmentationCost = sleevePurchasableAugs.cost;
      const augmentationName = sleevePurchasableAugs.name;
      const playerData = await easyRun(ns, "ns/getPlayer");
      if (playerData.money > augmentationCost){ await easyRun(ns, "sleeve/purchaseSleeveAug", sleeveIndex, augmentationName); }
    }
    // if returns array
    if (sleevePurchasableAugs.length > 0){ // ARE there any purchasable augs for this sleeve?
      // sort avialable sleeve augmentations by price, highest -> lowest
      const sortedSleeveAugs = sleevePurchasableAugs.sort((a,b) => b.cost - a.cost);
      // for each aug in our sorted list, purchase if we can (still) afford it.
      for (const augPair of sortedSleeveAugs){
        const augmentationCost = augPair.cost;
        const augmentationName = augPair.name;
        const playerData = await easyRun(ns, "ns/getPlayer");
        if (playerData.money > augmentationCost){ await easyRun(ns, "sleeve/purchaseSleeveAug", sleeveIndex, augmentationName); }
      }
    }
    return;
  }

// assign sleeve to a task . . .
  async function assignTask(sleeveIndex){
    await easyRun(ns, "sleeve/setToIdle", sleeveIndex);
  // if more than 85% shock, dont do work yet
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex);
    if (sleeveData.shock > 85) return;

  // If not yet low enough karma to join gang, do crimes...
    const playerKarma = ns.heart.break();
    if (playerKarma > -54000){
      let startedCrime = false;
      const startTask = await easyRun(ns, "sleeve/getTask", sleeveIndex);
      const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex);
      const homicideSuccessChance = ns.formulas.work.crimeSuccessChance(sleeveData, "Homicide");
      const muggingSuccessChance = ns.formulas.work.crimeSuccessChance(sleeveData, "Mug");
      const repetitions = 100;
      if (homicideSuccessChance > .5) {
        if (startTask === null || startTask.type !== "CRIME" || startTask.crimeType !== "Homicide") {
          startedCrime = true;
          for (let index = 0; index < repetitions; index++){
            ns.print(`SLEEVE${sleeveIndex} - - - Doing Homicide to reduce Karma, ${index+1}/${repetitions}.`);
            await easyRun(ns, "sleeve/setToCommitCrime", sleeveIndex, "Homicide");
            await completeSleeveWork(sleeveIndex);
            const pK = ns.heart.break();
            if (pK < -54000) return;
          }
        }
      }else{
        if (startTask === null || startTask.type !== "CRIME" || startTask.crimeType !== "Mug") {
          startedCrime = true;
          for (let index = 0; index < repetitions; index++){
            ns.print(`SLEEVE${sleeveIndex} - - - Doing Mugging to reduce Karma, ${index+1}/${repetitions}.`);
            await easyRun(ns, "sleeve/setToCommitCrime", sleeveIndex, "Mug");
            await completeSleeveWork(sleeveIndex);
            await purchaseSleeveAugs(sleeveIndex);
            const pK = ns.heart.break();
            if (pK < -54000) return;
          }
        }
      }

      if (startedCrime){ return; }
    }




  // bladeburner stuff
    const playerInBladeburner = await easyRun(ns, "bladeburner/inBladeburner");
    if (playerInBladeburner){
    do{
      const minimumBladeburnerStats = 100;

      const sufficientBBSkills = await areAllSleeveSkillsAbove(sleeveIndex, minimumBladeburnerStats);
      
      if (sufficientBBSkills){
      // Control Chaos...
        // build list of cities in chaos...
        const citiesInChaos = [];
        for (const city of CITIES){
          const cityChaos = await easyRun(ns, "bladeburner/getCityChaos", city);
          if (cityChaos > 50) {citiesInChaos.push({cityName: city, chaos:cityChaos})};
        }

        // if any cities in chaos
        if (citiesInChaos.length > 0){
          const mostChaoticCity = citiesInChaos.sort((a, b) => { b.chaos - a.chaos})
                                               .shift();
          ns.print(`SLEEVE${sleeveIndex}        Controlling chaos in ${mostChaoticCity.cityName} . . .`);                
          await easyRun(ns, "sleeve/travel", sleeveIndex, mostChaoticCity.cityName);
          await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Diplomacy");
          await completeSleeveWork(sleeveIndex);
          break;
        }
      //

      // Control success estimate variance in player's city. . .
        const controlVariance = await isVarianceInSuccessEstimates();       
        if (controlVariance) {
          const playerData = await easyRun(ns, "ns/getPlayer");
          await easyRun(ns, "sleeve/travel", sleeveIndex, playerData.city);
          ns.print(`SLEEVE${sleeveIndex} - - Doing Field Analysis to improve success estimates . . .`)
          await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Field Analysis");
          await completeSleeveWork(sleeveIndex);
          break;
        };
      //

      // Take sleeve to best BB city... (should be the same as the player's? this is for after controlling chaos, primarily.)
        await goToBestCity(sleeveIndex);
      //

      // Infiltrate if possible & needed . . .
        const minActions = await getLowestActionCount();
        if (!sleeveDoingInfiltration && minActions < 100){
          sleeveDoingInfiltration = true;
          ns.print(`SLEEVE${sleeveIndex} - - Infiltrating Synthoids . . .`)
          await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Infiltrate Synthoids");
          await completeSleeveWork(sleeveIndex);
          sleeveDoingInfiltration = false;
        }
      //

      // Do Contracts (multiple, if possible)...
        const sufficientBBSkillsRetirement = await areAllSleeveSkillsAbove(sleeveIndex, 250);
        if (sufficientBBSkillsRetirement && !sleeveDoingRetirement){
          sleeveDoingRetirement = true;
          ns.print(`SLEEVE${sleeveIndex} - - Retiring Synthoids . . .`);
          await startContract(sleeveIndex, "Retirement");
          await completeSleeveWork(sleeveIndex);
          sleeveDoingRetirement = false;
        }
        const sufficientBBSkillsBountyHunter = await areAllSleeveSkillsAbove(sleeveIndex, 175);
        if (sufficientBBSkillsBountyHunter && !sleeveDoingBountyHunting){
          sleeveDoingBountyHunting = true;
          ns.print(`SLEEVE${sleeveIndex} - - Acting as a Bounty Hunter . . .`);    
          await startContract(sleeveIndex, "Bounty Hunter");
          await completeSleeveWork(sleeveIndex);
          sleeveDoingBountyHunting = false;
        }
        const sufficientBBSkillsTracking = await areAllSleeveSkillsAbove(sleeveIndex, 100);
        if (sufficientBBSkillsTracking && !sleeveDoingTracking){
          sleeveDoingTracking = true;
          ns.print(`SLEEVE${sleeveIndex} - - Tracking Synthoids . . .`);
          const startedTracking = await startContract(sleeveIndex, "Tracking");
          if (!startedTracking){
            ns.print(`FAILED TO START TRACKING!`)
          }
          await completeSleeveWork(sleeveIndex);
          sleeveDoingTracking = false;
        }
      //
      } else { // Training due to insufficient skills for bladeburner activities. 
        ns.print(`SLEEVE${sleeveIndex}        Training to do Bladeburner . . .`);    

        const sufficientCombatSkills = await areSleeveCombatSkillsAbove(sleeveIndex, minimumBladeburnerStats);

        if (!sufficientCombatSkills) {
          ns.print(`SLEEVE${sleeveIndex}        Training combat stats . . .`);    
          await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Training");
          await completeSleeveWork(sleeveIndex);
        }

        const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
        const sleeveSkills = sleeveData.skills
        
        const lowHacking = sleeveSkills.hacking < minimumBladeburnerStats;

        if (lowHacking){
          ns.print(`SLEEVE${sleeveIndex}        Training Hacking . . .`);    
          //await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Training");
          await easyRun(ns, "sleeve/travel", sleeveIndex, "Sector-12");
          await easyRun(ns, "sleeve/setToUniversityCourse", sleeveIndex, "Rothman University", "Algorithms");
          await completeSleeveWork(sleeveIndex);
        }

        const lowCharisma = sleeveSkills.charisma < minimumBladeburnerStats;

        const recruitmentSuccesChance = await getSleeveRecruitmentSuccessChance(sleeveIndex);
        const highRecruitChance = recruitmentSuccesChance > .5
        if (lowCharisma && highRecruitChance){
          ns.print(`SLEEVE${sleeveIndex}        Training Charisma . . .`);    
          await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Recruitment");
          await completeSleeveWork(sleeveIndex);
        }
      }
    }while(false)
    }
  //

  // Do Faction work...
    const playerData = await easyRun(ns, "ns/getPlayer");
    const playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
    const playerFactions = playerData.factions;
    const viableFactions = [];
    for (const faction of playerFactions){
      let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
      factionAugs = factionAugs.filter(aug => !playerAugs.includes(aug) && aug !== "NeuroFlux Governor");
      if (factionAugs.length > 0){ viableFactions.push(faction); }
    }
    if (viableFactions.length < 1){ // allow NFG's
      for (const faction of playerFactions){
        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        factionAugs = factionAugs.filter(aug => !playerAugs.includes(aug));
        if (factionAugs.length > 0){ viableFactions.push(faction); }
      }
    }

    // sort the list:
    let factionObjects = [];
    for (const faction of viableFactions){
      let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
      factionAugs = factionAugs.filter(aug => !playerAugs.includes(aug) && aug !== "NeuroFlux Governor");
      let highestRepRequirement = 0;
      for (const aug of factionAugs){
        const augRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", aug);
        if (augRepReq > highestRepRequirement) highestRepRequirement = augRepReq;
      }
      const factionRep = await easyRun(ns, "singularity/getFactionRep", faction);
      const repGainRequired = highestRepRequirement - factionRep;
      factionObjects.push({faction:faction, gainReq:repGainRequired})
    }
    if (factionObjects.length < 1){ // allow NFG's
      for (const faction of viableFactions){
        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        factionAugs = factionAugs.filter(aug => !playerAugs.includes(aug));
        let highestRepRequirement = 0;
        for (const aug of factionAugs){
          const augRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", aug);
          if (augRepReq > highestRepRequirement) highestRepRequirement = augRepReq;
        }
        const factionRep = await easyRun(ns, "singularity/getFactionRep", faction);
        const repGainRequired = highestRepRequirement - factionRep;
        factionObjects.push({faction:factionName, gainReq:repGainRequired})
      }
    }
    // remove slum snakes and bladeburners from the list
    factionObjects = factionObjects.filter(facObjs => !["Slum Snakes", "Bladeburners"].includes(facObjs.faction))

    const playerTask = await easyRun(ns, "singularity/getCurrentWork");
    if (playerTask && playerTask.type === "FACTION") factionObjects = factionObjects.filter(facObjs => playerTask.factionName !== facObjs.faction)

    factionObjects = factionObjects.sort((a,b) => { a.gainReq - b.gainReq})

    let sortedFactions = factionObjects.map(obj => obj.faction);

    const sleeveCount = await easyRun(ns, "sleeve/getNumSleeves");
    for (let i = 0; i < sleeveCount; i++){
      const sleeveTask = await easyRun(ns, "sleeve/getTask", i); // get sleeve task
      //  if sleeve is doing something, and they are doing faction work, remove the faction they are working for from the available faction list.
      if (sleeveTask && sleeveTask.type === "FACTION"){ sortedFactions = sortedFactions.filter(name => name !== sleeveTask.factionName) }
    }

    const factionToWorkFor = sortedFactions.shift(); // get fastest to full augs that does not have a sleeve working for it
    if (factionToWorkFor){
      //ns.print(`factionToWorkFor: ${factionToWorkFor}`)

      const currentFavor = await easyRun(ns, "singularity/getFactionFavor", factionToWorkFor);
      const sleeveDoFactionWork = await areAllSleeveSkillsAbove(sleeveIndex, 50);

      if (sleeveDoFactionWork){
        const workTypes = ["hacking", "field", "security"];
        let bestType = {type:null, repGain:0};
        // get best work type...
        for (const type of workTypes){
          try{
            const startedWorking = await easyRun(ns, "sleeve/setToFactionWork", sleeveIndex, factionToWorkFor, type);
            const typeGains = ns.formulas.work.factionGains(playerData, type, currentFavor);
            if (startedWorking && typeGains && typeGains.reputation > bestType.repGain) {
              bestType.type = type;
              bestType.repGain = typeGains.reputation;
            }
          }catch {}
        }
        // set sleeve to work for the faction
        ns.print(`SLEEVE${sleeveIndex} - - - Doing ${bestType.type} work for ${factionToWorkFor}.`)
        await easyRun(ns, "sleeve/setToFactionWork", sleeveIndex, factionToWorkFor, bestType.type);
        await completeSleeveWork(sleeveIndex);
      }
    }
    
  //

  // Company work
    const MEGACORP_FACTIONS = [
      "ECorp",               "MegaCorp",             "Bachman & Associates",  "Blade Industries",       "NWO",                    
      "Clarke Incorporated", "OmniTek Incorporated", "Four Sigma",            "KuaiGong International", "Fulcrum Technologies"
    ];
    let viableMegacorporations = MEGACORP_FACTIONS;
    for (let i = 0; i < sleeveCount; i++){
      const sleeveTask = await easyRun(ns, "sleeve/getTask", i); // get sleeve task
      //  if sleeve is doing something, and they are doing company work, remove the company they are working for from the company faction list.
      if (sleeveTask && sleeveTask.type === "COMPANY"){ 
        viableMegacorporations.filter(corpName => corpName !== sleeveTask.companyName) 
      }
    }
    //ns.print(`ns.getPlayer().jobs keys: ${Object.keys(ns.getPlayer().jobs)}`);
    const employedAt = Object.keys(playerData.jobs);
    viableMegacorporations = viableMegacorporations.filter(corpName => employedAt.includes(corpName));
    //ns.print(`viableMegacorporations: ${viableMegacorporations}`)

    for (const megaCorporation of viableMegacorporations){
      // if in their faction AND no new augs, continue past them
      const playerFactions = playerData.factions;
      let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", megaCorporation);
      factionAugs = factionAugs.filter(aug => !playerAugs.includes(aug));
      if (playerFactions.includes(megaCorporation) && factionAugs.length < 1) continue;
      ns.print(`SLEEVE${sleeveIndex} - - - Working for ${megaCorporation}.`)
      await easyRun(ns, "sleeve/setToCompanyWork", sleeveIndex, megaCorporation);
      await completeSleeveWork(sleeveIndex);
      break;
    }
  //

  // Train...  
    const playerSkills = playerData.skills;
    const playerSkillKeyValPairs = Object.entries(playerSkills);

    const playerCombatSkills = playerSkillKeyValPairs.filter(keyValPair => ["defense", "strength", "dexterity", "agility"].includes(keyValPair[0]));
    const anyPlayerCombatSkillBelowBladeburnerAccess = playerCombatSkills.some(kVP => kVP[1] < 100);

    const homicideChance = ns.formulas.work.crimeSuccessChance(playerData, "Homicide")
    const playerCanNotDoHomicides = homicideChance < .5;

    if (anyPlayerCombatSkillBelowBladeburnerAccess || playerCanNotDoHomicides){
      const playerCombatSkillObjects = playerCombatSkills.map(keyValPair => {return {skillType:keyValPair[0], value: keyValPair[1]}});
      const sortedAscendingCombatSkillObjects = playerCombatSkillObjects.sort((a,b) => a.value - b.value)
      const lowestCombatSkillType = sortedAscendingCombatSkillObjects.shift().skillType;
      ns.print(`SLEEVE${sleeveIndex} - - Training ${lowestCombatSkillType} for Player's Bladeburner / Crime stats.`)
      await trainPhysicalStats(lowestCombatSkillType);
    }

    const playerSkillKeyValPairsExcludingIntelligence = playerSkillKeyValPairs.filter(keyValPair => keyValPair[0] !== "intelligence");
    const playerSkillObjects = playerSkillKeyValPairsExcludingIntelligence.map(keyValPair => {return {skillType:keyValPair[0], value: keyValPair[1]}})

    let lowestSkillObjects = playerSkillObjects;
    for (let i = 0; i < sleeveCount; i++){
      // Get sleeve stats
      const sleeveData = await easyRun(ns, "sleeve/getSleeve", i);
      const sleeveSkills = sleeveData.skills;
      const sleeveSkillKeyValPairs = Object.entries(sleeveSkills);
      const sleeveSkillKeyValPairsExcludingIntelligence = sleeveSkillKeyValPairs.filter(keyValPair => keyValPair[0] !== "intelligence");
      const sleeveSkillObjects = sleeveSkillKeyValPairsExcludingIntelligence.map(keyValPair => ({ skillType: keyValPair[0], value: keyValPair[1] }));

      // Update lowestSkillObjects with the lowest skill values found in sleeves
      lowestSkillObjects = lowestSkillObjects.map(skillObj => {
        const sleeveSkillObj = sleeveSkillObjects.find(sleeveSkill => sleeveSkill.skillType === skillObj.skillType);
        if (sleeveSkillObj && sleeveSkillObj.value < skillObj.value) {
          return { skillType:skillObj.skillType, value: sleeveSkillObj.value };
        }
        return skillObj;
      });
    }

    const sleeveAndPlayerSkillObjects = playerSkillObjects.concat(lowestSkillObjects);

    const sortedSkillObjects = sleeveAndPlayerSkillObjects.sort((a,b) => a.value - b.value)

    const lowestSkillObj = sortedSkillObjects.shift();
    const lowestSkillType = lowestSkillObj.skillType; // type of the lowest skill among all sleeves & the player.

    ns.print(`SLEEVE${sleeveIndex}- - -Lowest Skill for player or sleeves is ${lowestSkillObj.skillType} @ ${lowestSkillObj.value}`)

    // train physical stats; prefer doing bladeburner training, because Gym costs money and only trains ONE stat
    async function trainPhysicalStats(type){ 
      const playerInBladeburner = await easyRun(ns, "bladeburner/inBladeburner");
      const playerData = await easyRun(ns, "ns/getPlayer");
      const installIncome = await getAverageIncomePerSecondSinceLastInstall();
      if (!playerInBladeburner && playerData.money > installIncome){ 
        await easyRun(ns, "sleeve/travel", sleeveIndex, "Sector-12");
        await easyRun(ns, "sleeve/setToGymWorkout", sleeveIndex, "Powerhouse Gym", type);
        await completeSleeveWork(sleeveIndex);
      } else if (playerInBladeburner){ 
        await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Training");
        await completeSleeveWork(sleeveIndex); 
      }
    }

    // prefer bladeburner recruitment to taking courses.
    async function trainCharisma(){
      const playerInBladeburner = await easyRun(ns, "bladeburner/inBladeburner");
      if (playerInBladeburner){ 
        await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Recruitment");
        await completeSleeveWork(sleeveIndex); 
      }
      else { 
        const playerData = await easyRun(ns, "ns/getPlayer");
        const installIncome = await getAverageIncomePerSecondSinceLastInstall();
        if (playerData.money < installIncome) return;
        await takeCourse("Leadership"); 
      }
    }

    async function takeCourse(type){
      await easyRun(ns, "sleeve/travel", sleeveIndex, "Sector-12");
      const startedCourse = await easyRun(ns, "sleeve/setToUniversityCourse", sleeveIndex, "Rothman University", type);
      if (!startedCourse) ns.print(`ERROR: FAILED TO START COURSE.`)
      await completeSleeveWork(sleeveIndex);
    }

    switch(lowestSkillType){
      case "charisma":
        ns.print(`SLEEVE${sleeveIndex} - - Training Charisma.`)
        await trainCharisma();
        return;
      case "hacking":
        const playerData = await easyRun(ns, "ns/getPlayer");
        const installIncome = await getAverageIncomePerSecondSinceLastInstall();
        if (playerData.money < installIncome) return;
        ns.print(`SLEEVE${sleeveIndex} - - Taking Algorithms courses to increase Hacking.`)
        await takeCourse("Algorithms"); 
        return;
      case "dexterity":
        ns.print(`SLEEVE${sleeveIndex} - - Training Dexterity.`)
        await trainPhysicalStats("defense");     
        return;
      case "strength":
        ns.print(`SLEEVE${sleeveIndex} - - Training Strength.`)
        await trainPhysicalStats("strength");
        return;
      case "defense":   
        ns.print(`SLEEVE${sleeveIndex} - - Training Defense.`)
        await trainPhysicalStats("defense");     
        return;
      case "agility":
        ns.print(`SLEEVE${sleeveIndex} - - Training Agility.`)
        await trainPhysicalStats("defense");     
        return;
    }
  //

  // should never get here, tbh. no reason NOT to do a training and retur n
    ns.print(`SLEEVE${sleeveIndex} NOT ASSIGNED TO A TASK.`)
    // idk, what do sleeves DO?
    await ns.asleep(1000);
    return;
  }

  async function areSleeveCombatSkillsAbove(sleeveIndex, comparisonValue = 50){
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
    return Object.entries(sleeveData.skills)
      .filter(skillObj => ["strength", "dexterity", "defense", "agility"].includes(skillObj[0]))
      .every(skillObj => skillObj[1] >= comparisonValue);
  }

  async function areAllSleeveSkillsAbove(sleeveIndex, comparisonValue = 50){
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
    return Object.entries(sleeveData.skills)
      .filter(skillObj => ["hacking", "strength", "dexterity", "defense", "agility", "charisma"].includes(skillObj[0]))
      .every(skillObj => skillObj[1] >= comparisonValue);
  }

  async function getSleeveRecruitmentSuccessChance(sleeveIndex){
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex); // get sleeve data
    const bladeburnerTeamSize = await easyRun(ns, "bladeburner/getTeamSize");
    const sleeveSize = await easyRun(ns, "sleeve/getNumSleeves", sleeveIndex);
    return Math.pow(sleeveData.skills.charisma, 0.45) / (bladeburnerTeamSize - sleeveSize + 1);
  }

  async function goToBestCity(sleeveIndex){
    let cityPops = [];
    for (const city of CITIES){
      const cityPop = await easyRun(ns, "bladeburner/getCityEstimatedPopulation", city);
      cityPops.push({cityName: city, pop:cityPop});
    }
    const highestCityPop = cityPops.sort((a, b) => { b.pop - a.pop}).shift();
    ns.print(`SLEEVE${sleeveIndex} - - Traveling to ${highestCityPop.cityName} (${ns.formatNumber(highestCityPop.pop,1)} synths)`);
    const sleeveData = await easyRun(ns, "sleeve/getSleeve", sleeveIndex);
    const sleeveCity = sleeveData.city;
    if (sleeveCity !== highestCityPop.cityName){ await easyRun(ns, "sleeve/travel", sleeveIndex, highestCityPop.cityName); }
    return;
  }

  async function startContract(sleeveIndex, contract){ 
    return (await easyRun(ns, "sleeve/setToBladeburnerAction", sleeveIndex, "Take on contracts", contract)); 
  }

  async function getAssassinationCount(){
    return await easyRun(ns, "bladeburner/getActionCountRemaining", "Contract", "Assassination")
  }

  async function getLowestActionCount(){ // get lowest remaining action count of all actions
    let lowestActionCount = Infinity;
    let contractNames = await easyRun(ns, "bladeburner/getContractNames");
    for (const contract of contractNames){
      const contractActionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Contract", contract);
      if (contractActionsRemaining < lowestActionCount) lowestActionCount = contractActionsRemaining
    }
    
    let operationNames = await easyRun(ns, "bladeburner/getOperationNames");
    for (const operation of operationNames) {
      const operationActionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Operation", operation);
      if (operationActionsRemaining < lowestActionCount) lowestActionCount = operationActionsRemaining;
    }
    return lowestActionCount;
  }

  async function isVarianceInSuccessEstimates() { 
    const contractNames = await easyRun(ns, "bladeburner/getContractNames");
    const operationNames = await easyRun(ns, "bladeburner/getOperationNames");
    let actionList = contractNames.map(name => ({ type: "Contract", name }))
             .concat(operationNames.map(name => ({ type: "Operation", name })));
    let maxVariance = 0;
    for (const action of actionList) {
      let [minChance, maxChance] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", action.type, action.name);
      let variance = maxChance - minChance;
      if (variance > maxVariance) {  maxVariance = variance; }
    }
    return maxVariance > 0 ? maxVariance : false; // Return maximum variance or false if no variance found
  }

  async function getAverageIncomePerSecondSinceLastInstall(){ // average income/s since last install
    const timeSinceLastAug = await easyRun(ns, "ns/getTimeSinceLastAug");
    const moneySources = await easyRun(ns, "ns/getMoneySources")
    return (Object.entries(moneySources.sinceInstall)
        .filter((moneySource) => moneySource[1] > 0)
        .reduce((previousValue, currentValue) => { return previousValue + currentValue[1] }, 0) ) 
      / (timeSinceLastAug/1000);
  }

}
