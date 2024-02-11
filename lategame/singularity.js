import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */ // this script does... everything! (its incomplete, obviously)
export async function main(ns) {

  ns.killall("home", true);
  ns.tail();
  ns.resizeTail(1024, 512);
  ns.moveTail(250, 50);
  const DEBUGFLAG = ns.args.includes('-d') || false;
  const SLEEP_TIME = 1000 * 1;
  const CITIES = ["Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Volhaven"]
  if (!DEBUGFLAG) ns.disableLog("ALL");
  let countdownToTravel = 0;

  const COLORS = {
    BLACK: "\u001b[30m",    RED: "\u001b[31m",      GREEN: "\u001b[32m",  YELLOW: "\u001b[33m",   
    BLUE: "\u001b[34m",     MAGENTA: "\u001b[35m",  CYAN: "\u001b[36m",   WHITE: "\u001b[37m"
  };
  const COLOR_RESET = "\u001b[0m";

  let counter = 0;

  let doBladeburnerBoolean = false;

  let currentGangPID = 0;
  let currentHashnetPID = 0;
  let currentPurchaseServerPID = 0;

  ns.run("more-complex-scan.js");
  await ns.sleep(250);
  ns.run("crack-list.js");
  await ns.sleep(250);

  while(true){//------------------MAIN LOOP------------------------
    ns.print(`\n\n\n\n\n\n\n\n\n`);

    await completeCurrentWork(); // if doing work (that ends!), complete it first.
    
    await instantaneousSingularityFunctions(true);
    
    await doFactionWork(true); 

    await doGang();

    // dont do bladeburner or faction work until we have unlocked gangs - takes a long time, cant do homicide at the same time
    // after we have unlocked gangs, alternate between bladeburner and faction work.
    if (doBladeburnerBoolean) {
      await doBladeburner();
      doBladeburnerBoolean = false 
    } else { 
      doBladeburnerBoolean = true; 
    }

    await doGraft();

    ns.print(`Looping... ${counter++}`);

    await ns.sleep(1 * 1000);
  }//-------------------------------------------------------------

  async function instantaneousSingularityFunctions(report = false){
    // instantaneous, do not require player 'presence', do not interrupt current job - can run frivolously
      await doStanek(report);
      await doHacking(report);
      await doHashnet(report);
      await doCorp(report);
      await doContracts(report);
      await backdoorAllServers(report);
      await doSleeves(report);
      await doShare(report);

      await doHeal(); // no reporting
      await doAugs(report); // I wanna know what augs are purchased.

      await joinAndPromoteInMegacorps(report);
      await upgradeHome(report);
      await tryBuyAllPrograms(report);
      
      await handleFactionJoins(report);
      await rotateThroughCities(report);

      //const playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations")
      //if (!playerAugs.includes(`The Blade's Simulacrum`)) {
        //doFactionWork(report); // dont ACTUALLY do work - just run through factions, for any useful donations
      //}
    //
    
    let nextBlackOp = await easyRun(ns, "bladeburner/getNextBlackOp");
    if (nextBlackOp === null) { 
      //ns.singularity.destroyW0r1dD43m0n()
      ns.tprintf(`${COLORS.CYAN}Bladeburner: WORLD DAEMON EXPOSED!${COLOR_RESET}`) 
    }
    
    await easyRun(ns, "bladeburner/joinBladeburnerDivision"); // constantly try to join Bladeburner
  }

  async function doStanek(report = true){
    const runOps = {preventDuplicates:true};
    const stanekDaemonActive = ns.run("all-stanek.js", runOps);
    if (!(stanekDaemonActive === 0)){
      if (report){
        ns.print("Starting up Stanek daemon...")
        ns.toast("Starting up Stanek daemon...", "success", 5000)
      }
    } 
  }

  async function doShare(report = true){
    const runOps = {preventDuplicates:true};
    const shareDaemonActive = ns.run("all-share.js", runOps);
    if (!(shareDaemonActive === 0)){
      if (report){
        ns.print("Starting up Sharing daemon...")
        ns.toast("Starting up Sharing daemon...", "success", 5000)
      }
    } 
  }

  async function doSleeves(report = true){
    const runOps = {preventDuplicates:true};
    // if we aren't running the hashnet script, start it up
    const sleeveDaemonActive = ns.run("steves.js", runOps);
    if (!(sleeveDaemonActive === 0)){
      if (report){
        ns.print("Starting up Sleeve daemon...")
        ns.toast("Starting up Sleeve daemon...", "success", 5000)
      }
    } 
  }

  async function doHeal(){ 
    await easyRun(ns, "singularity/hospitalize"); 
  } // just got to hospital every second to heal XD


  async function doHashnet(report = true){
    if (report) ns.print(`Hashing...`)
    let runOps = {preventDuplicates:true};
    // if we aren't running the hashnet script, start it up
    let hashnetActive = ns.run("hashnet.js", runOps);
    if (!(hashnetActive === 0)){
      currentHashnetPID = hashnetActive;
      if (report){
        ns.print("Starting up Hashnet dameon...")
        ns.toast("Starting up Hashnet dameon...", "success", 5000)
      }
    } 
  }


  
  async function tryBuyAllPrograms(report = true){
    let haveTor = await easyRun(ns, "singularity/purchaseTor");
    if(!haveTor){ return }

    let programList = await easyRun(ns, "singularity/getDarkwebPrograms");
    if ((!programList || programList.length === 0) && report) {
      ns.print("Failed to retrieve program list or list is empty.");
      return;
    }

    for (const program of programList) {
      const programPrice = await easyRun(ns, "singularity/getDarkwebProgramCost", program);
      let playerData = await easyRun(ns, "ns/getPlayer");
      const canAfford = playerData.money > programPrice;
      if (programPrice > 0 && canAfford) {
        const purchaseResult = await easyRun(ns, "singularity/purchaseProgram", program);
        if (purchaseResult && report) { 
          ns.toast(`Purchased ${program} from the Darkweb.`, "success", 5000);
          ns.print(`Purchased ${program} from the Darkweb.`);
          ns.tprint(`Purchased ${program} from the Darkweb.`);
         }
        else if (report) { ns.print(`Failed to purchase ${program} from the Darkweb.`); }
      } 
    }
  }//----------------------------------------------------------------------------



  async function doHacking(report = true){
    if (report) ns.print(`Hacking...`)
    let runOps = {preventDuplicates:true};
    // if we aren't running the hack server, start it up
    let attackServerActive = ns.run("optimal-attack-server.js", runOps, 1, "-u");
    if (!(attackServerActive === 0) && report){
      ns.print("Starting up attack server...")
      ns.toast("Starting up attack server...", "success", 5000)
    }
    // wait to run purchase servers until we've made enough money to upgrade home server at least once
    let playerInfo = await easyRun(ns, "ns/getPlayer");
    let playerFunds = playerInfo.money;
    let sufficientPlayerFunds = playerFunds >= 500000;

    // if any server less than maximum ram, serversNotMaxed
    let purchasedServers = await easyRun(ns, "ns/getPurchasedServers");
    const MAX_RAM = 2**20;
    let serversNotMaxed = false;
    
    for (let server of purchasedServers) {
      let serverInfo = await easyRun(ns, "ns/getServer", server);
      if (serverInfo.maxRam < MAX_RAM) { serversNotMaxed = true; break; }
    }

    // if we have less servers than bn maximum, serversNotMaxed
    const bnMultipliers = await easyRun(ns, "ns/getBitNodeMultipliers");
    const bnMaxServers = Math.floor(25 * bnMultipliers.PurchasedServerLimit);

    if (purchasedServers.length < bnMaxServers) serversNotMaxed = true;

    if (sufficientPlayerFunds && serversNotMaxed){
      currentPurchaseServerPID = ns.run("purchase-servers.js", runOps, '-p');
    }
  }//---------------------------------------------------------------------------



  async function handleFactionJoins(report = true) {
    if (report) ns.print(`Joining factions...`);

    const specialFactions = ["Sector-12", "Aevum", "Volhaven", "Tian Di Hui", "New Tokyo", "Chongqing", "Ishima"];
    let factionInvites = await easyRun(ns, "singularity/checkFactionInvitations");
    if (factionInvites.length === 0 && report) { ns.print(`  No factions to join!`); return; }
    for (const faction of factionInvites) {
      let joinResult = false;
      if (specialFactions.includes(faction)) {
        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        let hasNewAugs = factionAugs.some(aug => aug !== "NeuroFlux Governor" && !ownedAugs.includes(aug));
        if (hasNewAugs) {
          joinResult = await easyRun(ns, "singularity/joinFaction", faction);
          if (report) ns.print(`  Attempted to join faction ${faction}: ${joinResult}`);
        } else {
          if (report) ns.print(`  No new augmentations in ${faction}, not joining.`);
        }
      } else { // only filter for the factions with opponents; otherwise, just join.
        joinResult = await easyRun(ns, "singularity/joinFaction", faction);
      }

      if (joinResult && report) {
        ns.toast(`Joined faction: ${faction}`, "success", 5000);
        ns.print(`  Joined faction: ${faction}`);
      }
    }

    if (report) ns.print(`  Finished processing faction invitations.`);
  }//-------------------------------------------------------------------------------



  async function rotateThroughCities(report = true){
    if (report) ns.print(`Travelling?`)
    if (countdownToTravel > 0){
      //ns.toast("Not time to travel.", "warning", 2500);
      if (report) ns.print("  Not time to travel.");
      countdownToTravel -= 1;
      return;
    }

    
    let playerData = await easyRun(ns, "ns/getPlayer");

    if (playerData.money > 5000000) { // if more than $5m
      let currentCity = playerData.city;
      let cityIndex = CITIES.findIndex(city => city === currentCity);
      let nextCityIndex = (cityIndex + 1) % CITIES.length;

      // while >150m, travel up to ~600 times (200k * 600 = 120m)
      if (playerData.money > 150000000){
        playerData = await easyRun(ns, "ns/getPlayer");
        for (let repetitions = 0; repetitions < 100; repetitions++){
          for (const city of CITIES){
            playerData = await easyRun(ns, "ns/getPlayer");
            if (playerData.money < 10000000) break;
            await easyRun(ns, "singularity/travelToCity", city); 
          }
        }
      }

      await easyRun(ns, "singularity/travelToCity", CITIES[nextCityIndex]);
      ns.print(`  Traveled to ${CITIES[nextCityIndex]}!`);
      countdownToTravel = 10;
    }
  }//--------------------------------------------------------------------------



  async function upgradeHome(report = true){
    if (report) ns.print(`Upgrading home...`)
    // WH ILE we have more money than upgrades (ram or cores) cost, upgrade!
    let upgradeHomeRamCost = await easyRun(ns, "singularity/getUpgradeHomeRamCost");
    let upgradeHomeCoreCost = await easyRun(ns, "singularity/getUpgradeHomeCoreCost");
    let playerInfo = await easyRun(ns, "ns/getPlayer");
    let playerFunds = playerInfo.money;
    let canUpgradeRam = playerFunds > upgradeHomeRamCost;
    let homeServer = await easyRun(ns, "ns/getServer", "home");
    canUpgradeRam = canUpgradeRam && homeServer.maxRam < Math.pow(2, 30);
    let canUpgradeCores = playerFunds > upgradeHomeCoreCost;


    if ( (canUpgradeCores || canUpgradeRam) && report) ns.print(` Upgrading Home!`)
    
    while(canUpgradeRam){
      if (report) ns.print(`  Upgrading home RAM!`)
      // purchase Ram
      await easyRun(ns, "singularity/upgradeHomeRam");
      
      // update comparitor
      upgradeHomeRamCost = await easyRun(ns, "singularity/getUpgradeHomeRamCost");
      playerInfo = await easyRun(ns, "ns/getPlayer");
      playerFunds = playerInfo.money;
      canUpgradeRam = playerFunds > upgradeHomeRamCost;
      homeServer = await easyRun(ns, "ns/getServer", "home");
      canUpgradeRam = canUpgradeRam && homeServer.maxRam < Math.pow(2, 30);
    }
    
    while(canUpgradeCores){
      if (report) ns.print(`  Upgrading home cores!`)
      await ns.sleep(50);
      await easyRun(ns, "singularity/upgradeHomeCores");
      // update comparitor
      upgradeHomeCoreCost = await easyRun(ns, "singularity/getUpgradeHomeCoreCost");
      playerInfo = await easyRun(ns, "ns/getPlayer");
      playerFunds = playerInfo.money;
      canUpgradeCores = playerFunds > upgradeHomeCoreCost;
    }
  }//---------------------------------------------------------------------------------------------



  async function backdoorAllServers(report = true){
    if (report) ns.print(`Checking for new backdoors...`)
    let homeServer = await easyRun(ns, "ns/getServer", "home");
    let sufficientHomeRam = homeServer.maxRam > 64;
    let runOps = {preventDuplicates:true}
    if (sufficientHomeRam){
      ns.run("backdoor-runner.js", runOps);
      ns.run("backdoor-runner.js", runOps, "-p");
    }
  }//------------------------------------------------------------------------------------



  async function doGang(report = true){
    let runOps = {preventDuplicates:true}
    // check karma
    if (report) ns.print("Doing Gang...");


    const lowKarma = await reduceKarma();
    if (!lowKarma) return;

    // if we are not yet in Slum Snakes, wait a wh ile, then return
    let playerData = await easyRun(ns, "ns/getPlayer");
    if (!playerData.factions.includes("Slum Snakes")) return; 

    // if we CAN start a gang and ARE in slum snakes already, do gang.
    ns.run("gang.js", runOps);
  }//-----------------------------------------------------------------------
  async function reduceKarma(report = true){
    const karmaAmount = ns.heart.break();
    // if we cannot yet start a gang, commit crimes, then return
    if (karmaAmount > -54000){ 
      if (report) ns.print(`  Karma too high for gangs. Currently: ${ns.formatNumber(karmaAmount,1)}`);
      // if our chances to succeed at homicide are TRASH, mug instead
      const homicideSuccess = await easyRun(ns, "singularity/getCrimeChance", "Homicide");
      if (homicideSuccess < .5){ 
        await doCrime("Mug");
      } else {
        await doCrime("Homicide");
      }

      async function doCrime(crimeType){
        const repeat = 100;
        const currentWork = await easyRun(ns, "singularity/getCurrentWork"); // get work details
        const playerIsFocused = await easyRun(ns, "singularity/isFocused"); // maintain 'focus' state
        // if not working OR not doing crime OR not doing THIS crime
        if (!currentWork || !currentWork.type === "CRIME" || currentWork.crimeType !== crimeType){
          await easyRun(ns, "singularity/commitCrime", crimeType, playerIsFocused); // start doing this crime.
        }
        const crimeStats = await easyRun(ns, "singularity/getCrimeStats", "Mug");
        if (report) ns.print(`  ${crimeType}-ing for ${ns.tFormat(crimeStats.time*repeat)}, to reduce Karma.`);
        for (let i = 0; i < repeat; i++){
          await ns.sleep(crimeStats.time); // complete a crime
          await instantaneousSingularityFunctions(); // do other stuff
        }
      }
    }
    const finalKarmaAmount = ns.heart.break();
    // if we cannot yet start a gang, false.
    if (finalKarmaAmount > -54000){ return false; }
    else { return true; }
  }



  async function doCorp(report = true){
    let runOps = {preventDuplicates:true, threads:1};
    let homeServer = await easyRun(ns, "ns/getServer", "home");
    let sufficientHomeRam = homeServer.maxRam > 64;
    let playerData = await easyRun(ns, "ns/getPlayer");
    let sufficientFunding = playerData.money > 150000000000;
    let haveCorp = await easyRun(ns, "corporation/hasCorporation");
    //ns.print(`sufficientFunding: ${sufficientFunding}, haveCorp: ${haveCorp}, sufficientHomeRam: ${sufficientHomeRam}`)
    if ((sufficientFunding || haveCorp) && sufficientHomeRam){
      if (report) ns.print("Doing Corp...");
      let corpScriptPID = ns.run("micro-corporation.js", runOps);
      if (corpScriptPID !== 0 && report){
        ns.print("  Started Corporation script!")
        ns.toast("Started Corporation script!")
      }
    }
  }//---------------------------------------------------------------------------



  async function doAugs(report = true) { // 'instantaneous', or, close enough.
    if (report) ns.print("Doing Augmentations...");

    // Get player data and owned augmentations
    let playerData = await easyRun(ns, "ns/getPlayer");
    let playerFactions = playerData.factions
    let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
    let purchased = false;

    // Bladeburners augmentations handling
    if (playerFactions.includes("Bladeburners")) {
      //if (report) ns.print("Player is in the Bladeburners faction. Evaluating augmentations...");

      let bladeburnerAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", "Bladeburners");
      
      // Filter Bladeburners augmentations for unowned, and sort by price
      const augPricePromises = bladeburnerAugs.map(async (aug) => { const price = await easyRun(ns, "singularity/getAugmentationPrice", aug); return { aug, price }; });
      const augsWithPrice = await Promise.all(augPricePromises);
      const unownedAugsWithPrice = augsWithPrice.filter(augData => !ownedAugs.includes(augData.aug));
      unownedAugsWithPrice.sort((a, b) => a.price - b.price);

      bladeburnerAugs = unownedAugsWithPrice.map(augData => augData.aug);

      let meetAnyAugRepReq = false;
      for (const aug of bladeburnerAugs) {
        let augPrice = await easyRun(ns, "singularity/getAugmentationPrice", aug);
        let augRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", aug);
        playerData = await easyRun(ns, "ns/getPlayer");
        let factionReptuation = await easyRun(ns, "singularity/getFactionRep", "Bladeburners");
        let haveEnoughRep = factionReptuation >= augRepReq;
        meetAnyAugRepReq = meetAnyAugRepReq ? meetAnyAugRepReq : factionReptuation >= augRepReq;
        //ns.print(`Checking augmentation: ${aug}. Price: ${ns.formatNumber(augPrice,2)} Required Rep: ${ns.formatNumber(augRepReq,2)}`);

        // Check if we have enough rep and money for the augmentation
        if (haveEnoughRep && playerData.money >= augPrice) {
          if (report) ns.print(`  Purchasing augmentation: ${aug}`);
          await easyRun(ns, "singularity/purchaseAugmentation", "Bladeburners", aug);
          purchased = true;
        }
      }

      let installedAugs = await easyRun(ns, "singularity/getOwnedAugmentations");
      let pendingAugs = ownedAugs.length - installedAugs.length;

      if (purchased && pendingAugs >= 2) {
        if (report) ns.print(`  Installing augmentations...`);
        await IDidntAskForThis();
      }
    }

    // collect unique faction augmentations...
    let allFactionAugs = [];
    for (const faction of playerFactions) {
      let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
      let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
      //ns.print(`Owned augmentations: ${ownedAugs}`)

      for (const aug of factionAugs) {
        if (!ownedAugs.includes(aug)) {
          // Ensure the augmentation is not already in the allFactionAugs list
          if (!allFactionAugs.some(fa => fa.aug === aug)) {
            let basePrice = await easyRun(ns, "singularity/getAugmentationBasePrice", aug);
            let repReq = await easyRun(ns, "singularity/getAugmentationRepReq", aug);
            allFactionAugs.push({ aug, basePrice, repReq });
          }
        }
      }
    }
    //ns.print(`allFactionAugs: ${allFactionAugs.join("\n")}`)
    // process 'normal' augmentations...
    if (allFactionAugs.length > 0){ // if there are faction augs, buy some augmentations.
      allFactionAugs.sort((a, b) => b.basePrice - a.basePrice); // Initial sorting of allFactionAugs by basePrice in descending order...
      const augmentationDependencyGraph = await buildDependencyGraph(allFactionAugs);
      const sortedAugs = topologicalSort(augmentationDependencyGraph);
      //ns.print(`Sorted augs: ${JSON.stringify(sortedAugs)}`)

      const cheapestRealAugPrice = await easyRun(ns, "singularity/getAugmentationPrice", allFactionAugs[allFactionAugs.length-1].aug)
      playerData = await easyRun(ns, "ns/getPlayer")
      //ns.print(`  Cheapest augmentation: ${allFactionAugs[allFactionAugs.length-1].aug} (${ns.formatNumber(cheapestRealAugPrice)}), Augmentation funding: ${ns.formatNumber(playerData.money * .1)}`)
      
      if (playerData.money * .01 > cheapestRealAugPrice ){ //  if 1% of money is more than the cheapest augmentation
        const purchasedAugs = await purchaseAugmentations(sortedAugs); // purchase unique augmentations based on the sorted order
        const pendingAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        // buy as many NFG's as we can, IF we bought a different aug AND have a large amount of augmentations already
        if (purchasedAugs && pendingAugs.length > 25) await installMaxNFG();
      }
    }

    //if (allFactionAugs.length < 50){ await installMaxNFG(); }

    // Decide whether to install augmentations
    const pendingAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
    const installedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", false);
    //let installAugs = (pendingAugs.length - installedAugs.length) >= 8;

    // if we have over 50 augs total, start freely purchasing NFG's. Should have essentially endless income (and basically instant resets) by then.
    if (pendingAugs.length > 50){ await installMaxNFG(); } 

    const initialRequirement = 8; // Assume an initial requirement
    const scaleFactor = 8; // Every scaleFactor additional augs, reduce requirement by 1
    // Calculate the reduced requirement based on the number of installed augs
    let reducedRequirement = initialRequirement - Math.floor(installedAugs.length / scaleFactor);
    reducedRequirement = Math.max(reducedRequirement, 2); // Ensure the reduced requirement doesn't go below 2
    const installAugs = (pendingAugs.length - installedAugs.length) >= reducedRequirement; // Check if the number of pending augs meets the reduced requirement
    
    // Install augmentations if conditions are met
    if (installAugs) {
      await IDidntAskForThis();
    }
  }
// ------------------------------------- MISCELLANEOUS AUGMENTATION FUNCTIONS --------------------------------------------------\
  async function IDidntAskForThis(){
    const currentWork = await easyRun(ns, "singularity/getCurrentWork");
    // if not doing work, install.
    if (currentWork === null){ await actuallyInstallAugs() } 
    // if grafting...
    else if (currentWork.type === "GRAFTING") { 
      const playerPendingAndInstalledAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
      // are we currently grafting an aug we have purchased (?)
      if (playerPendingAndInstalledAugs.includes(currentWork.augmentation)) await actuallyInstallAugs()
      return; 
    }
    else {await actuallyInstallAugs() } // if doing unimportant work...
    async function actuallyInstallAugs(){ await easyRun(ns, "singularity/installAugmentations", "singularity.js"); }
  }
  async function buildDependencyGraph(allFactionAugs) {
    let graph = new Map();
    for (const aug of allFactionAugs) {
      let prerequisites = await easyRun(ns, "singularity/getAugmentationPrereq", aug.aug);
      if (prerequisites !== undefined) graph.set(aug.aug, { aug: aug, prerequisites });
    }
    return graph;
  }

  async function installMaxNFG(){
    // install as many NFG's as possible.
    let highestFactionRep = {factionName:null, rep:-Infinity};
    const playerIsInGang = await easyRun(ns, "gang/inGang");
    let playerData = await easyRun(ns, "ns/getPlayer");
    const playerFactions = playerData.factions;
    for (const faction of playerFactions){
      const factionReptuation = await easyRun(ns, "singularity/getFactionRep", faction);
      if (playerIsInGang && faction === "Slum Snakes") continue;
      if (faction === "Bladeburners") continue;
      if (faction === "Church of the Machine God") continue;
      if (factionReptuation > highestFactionRep.rep) highestFactionRep = {factionName:faction, rep:factionReptuation}
    }
    //if (playerFactions.includes("Daedalus")) {highestFactionRep.factionName = "Daedalus";}
    const factionNFG = highestFactionRep.factionName;

    if (factionNFG === null) return; // no faction we can get NFG's with

    let neuroFluxPrice = await easyRun(ns, "singularity/getAugmentationPrice", "NeuroFlux Governor");
    let neuroFluxRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", "NeuroFlux Governor");
    while (playerData.money >= neuroFluxPrice) {

      const factionRep = await easyRun(ns, "singularity/getFactionRep", factionNFG);
      const haveNFGRep = factionRep >= neuroFluxRepReq;

      const currentFavor = await easyRun(ns, "singularity/getFactionFavor", factionNFG);
      const canDonate = currentFavor >= 150;

      if (!haveNFGRep && !canDonate) { break; } // we do not have the means to farm rep.

      if (!haveNFGRep && canDonate) { // we do not have enough rep, so donate
        const donationAmount = playerData.money * 0.1;
        //ns.print(`  Donating ${"$"}${ns.formatNumber(donationAmount,1)} to ${factionNFG}!`);
        await easyRun(ns, "singularity/donateToFaction", factionNFG, donationAmount);
        playerData.money -= donationAmount;
        continue;
      }

      ns.print("  Purchasing NeuroFlux Governor from " + factionNFG);
      await easyRun(ns, "singularity/purchaseAugmentation", factionNFG, "NeuroFlux Governor");

      neuroFluxPrice = await easyRun(ns, "singularity/getAugmentationPrice", "NeuroFlux Governor");
      neuroFluxRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", "NeuroFlux Governor");
      playerData = await easyRun(ns, "ns/getPlayer"); // update player data...
      await ns.sleep(50);
    }
  }

  function topologicalSort(graph) {
    let visited = new Set();
    let stack = [];
    function visit(node) { // recursive visit function
      if (visited.has(node.aug)) { return; } // if we have already visited it, skip; else add to visited.
      visited.add(node.aug);
      for (const prereq of node.prerequisites) {// for all prerequisites
        // if the graph has it, visit it
        if (graph.has(prereq)) { visit(graph.get(prereq)); } // recursing step
      }
      stack.push(node); // push on the way OUT of the depths
    }
    for (const [aug, node] of graph) { if (!visited.has(aug)) { visit(node); } } // initialize recursion
    return stack;
  }

  async function purchaseAugmentations(sortedAugs) {
    let purchasedAug = false;
    for (const augNode of sortedAugs) {
      // example of horrific augNode object format:
        // {"aug":{"aug":"QLink","basePrice":75000000000000,"repReq":1875000},"prerequisites":[]}
      //ns.print(`${JSON.stringify(augNode)}`)
      let playerData = await easyRun(ns, "ns/getPlayer");
      let playerMoney = playerData.money;
      let augObject = augNode.aug; // ex: {"aug":"QLink","basePrice":75000000000000,"repReq":1875000}
      let realPrice = await easyRun(ns, "singularity/getAugmentationPrice", augObject.aug);
      if (playerMoney < realPrice) continue;
      let playerFactions = playerData.factions;

      // scan through factions for first one which has the augmentation (LAZY & probably BAD)
      for (const faction of playerFactions) {
        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        let factionHasAug = factionAugs.includes(augObject.aug);
        if (!factionHasAug) continue; // if this faction doesnt have the aug, try next.

        let factionRep = await easyRun(ns, "singularity/getFactionRep", faction);
        let sufficientFactionRep = factionRep >= augObject.repReq;

        // only factions we can donate to...
        if (!["Slum Snakes", "Bladeburners", "Church of the Machine God"].includes(faction)){
          const factionFavor = await easyRun(ns, "singularity/getFactionFavor", faction)
          const canDonate = factionFavor > 150;

          while (!sufficientFactionRep && canDonate && playerMoney > realPrice){
            // donate 1%, check again
            const donationAmount = playerMoney / 1000
            ns.print(`Donating ${"$"}${ns.formatNumber(donationAmount)} to ${faction} to increase rep...`);
            await easyRun(ns, "singularity/donateToFaction", faction, donationAmount);

            factionRep = await easyRun(ns, "singularity/getFactionRep", faction);
            sufficientFactionRep = factionRep >= augObject.repReq;

            playerData = await easyRun(ns, "ns/getPlayer");
            playerMoney = playerData.money;
          }
        }


        let augPrereqs = await easyRun(ns, "singularity/getAugmentationPrereq", augObject.aug);
        let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        let haveAllPrereqs = true;
        
        if (augPrereqs.length > 0){
          haveAllPrereqs = augPrereqs.reduce( (allPrereqsMet, prereqAug) => { 
            return allPrereqsMet && ownedAugs.includes(prereqAug); 
          }, true);
        }

        if (sufficientFactionRep && factionHasAug && haveAllPrereqs) {
          ns.print(`    Purchasing ${augObject.aug} from ${faction} (${ns.formatNumber(factionRep,1)} rep) for ${ns.formatNumber(realPrice,0)}.`)
          await easyRun(ns, "singularity/purchaseAugmentation", faction, augObject.aug);
          purchasedAug = true;
          break; // exit faction loop; go to next augmentation.
        }
      }
    }
    return purchasedAug;
  }
  
// -----------------------------------------------------------------------------------------------------------------------------



  async function doFactionWork(report = true, time = 60 * 15) { // default 15 minutes of work (or less) at a time.
    if (report) ns.print("Handling Faction Work...");

    let playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations")
    if (!playerAugs.includes(`The Blade's Simulacrum`)) await easyRun(ns, "singularity/stopAction");

    // get all currently joined factions
    let playerData = await easyRun(ns, "ns/getPlayer");
    let playerFactions = playerData.factions;

    let karmaAmount = ns.heart.break();
    let lowKarma = karmaAmount <= -54e3;

    // Handle faction work & donations
    let chosenFaction;
    let chosenFactionMaxRepGain = 0;
    let chosenFactionWait = 0;
    //if (lowKarma){
      let factionsForSort = [];
      for (const faction of playerFactions){
        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        factionAugs = factionAugs.filter(aug => (aug !== "NeuroFlux Governor" && !ownedAugs.includes(aug)))

        let highestAugRepCostFromFaction = 0;
        for (const augmentation of factionAugs){ let currentAugRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", augmentation); if (currentAugRepReq > highestAugRepCostFromFaction) highestAugRepCostFromFaction = currentAugRepReq }
        let bestType = {type:null, repGain:0.000001};
        const workTypes = ["hacking", "field", "security"];
        const playerData = await easyRun(ns, "ns/getPlayer");
        for (const newType of workTypes){
          try {
            const typeGains = ns.formulas.work.factionGains(playerData, type, currentFavor);
            if (typeGains.reputation > bestType.repGain) { bestType = {type:newType,repGain:typeGains.reputation}; }
          } catch{}
        }
        const waitTime = highestAugRepCostFromFaction / bestType.repGain;
        const factionRep = await easyRun(ns, "singularity/getFactionRep", faction);
        factionsForSort.push({factionName:faction, wait:waitTime, rep: factionRep});
      }
      const sortedFactions = factionsForSort.sort((a, b) => {
        // If one of the waits is 0 but not both, sort the non-zero one first
        if (a.wait === 0 && b.wait != 0) return 1; if (a.wait != 0 && b.wait === 0) return -1;
        // If wait times are equal, sort by rep in descending order
        if (a.wait === b.wait) { return b.rep - a.rep; }
        // Otherwise, sort by wait time in ascending order
        return a.wait - b.wait;
      }); // sort for lowest time for all augs, then highest rep

      playerFactions = sortedFactions.map(factionObj => factionObj.factionName);
      //ns.print(`playerFactions: ${playerFactions}`)

      // handle faction work & donations (gaining augmentation ACCESS)
      for (const faction of playerFactions){
        const MEGACORP_AND_SPECIAL_FACTIONS = [
          "ECorp",                "MegaCorp",             "Bachman & Associates",  "Blade Industries",       "NWO",                    
          "Clarke Incorporated",  "OmniTek Incorporated", "Four Sigma",            "KuaiGong International", "Fulcrum Technologies",
          "Slum Snakes",          "Bladeburners"
        ];
        if (MEGACORP_AND_SPECIAL_FACTIONS.includes(faction)) continue; // skip 'faction work' for megacorps, slum snakes, and bladeburners

        let factionAugs = await easyRun(ns, "singularity/getAugmentationsFromFaction", faction);
        let ownedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        factionAugs = factionAugs.filter(aug => (aug === "NeuroFlux Governor" || !ownedAugs.includes(aug)))

        const hasNewAugs = factionAugs.length > 0;
        if (hasNewAugs) { ns.print(`  ${COLORS.CYAN}${faction} has new augmentations.${COLOR_RESET}\n`) }
        else { continue; }

        let currentFavor = await easyRun(ns, "singularity/getFactionFavor", faction);
        let favorGainOnReset = await easyRun(ns, "singularity/getFactionFavorGain", faction);
        let favorIfReset = currentFavor + favorGainOnReset;
        let resetAllowsDonations = favorIfReset >= 150;

        let canDonate = currentFavor >= 150;
        if (resetAllowsDonations && !canDonate){
          const pendingAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
          const installedAugs = await easyRun(ns, "singularity/getOwnedAugmentations", false);
          
          // Calculate falling requirement minimum aug install amount, based on the number of installed augs.
          const initialRequirement = 8; // Assume an initial requirement
          const scaleFactor = 15; // Every 15 additional augs, reduce requirement by 1
          const reducedRequirement = initialRequirement - Math.floor(installedAugs.length / scaleFactor);
          if (reducedRequirement > 0){
            const installAugs = (pendingAugs.length - installedAugs.length) >= reducedRequirement;
            if (installAugs) await IDidntAskForThis();
          // if we have a LOT of augs, soft reset for favor when we ever BECOME ABLE to donate to a faction
          } else if (reducedRequirement <= 0){
            await easyRun(ns, "singularity/softReset", "singularity.js")
          }
        }

        let highestAugRepCostFromFaction = 0;
        for (const augmentation of factionAugs){ let currentAugRepReq = await easyRun(ns, "singularity/getAugmentationRepReq", augmentation); if (currentAugRepReq > highestAugRepCostFromFaction) highestAugRepCostFromFaction = currentAugRepReq }
        let factionReptuation = await easyRun(ns, "singularity/getFactionRep", faction);
        let sufficientFactionRep = factionReptuation >= highestAugRepCostFromFaction;

        if (sufficientFactionRep) continue; // why would we work for or donate to a faction where we can get all augs already

        let playerFunds = playerData.money;
        let augCash = playerFunds >= 1e9;

        // if: we can currently donate && have over a billion && faction has new augs && dont have enough rep for all faction augs
        if (canDonate && augCash && hasNewAugs && !sufficientFactionRep){
          await easyRun(ns, "singularity/donateToFaction", faction, playerFunds * .1); // donate m u n e
        }

        if (hasNewAugs && !sufficientFactionRep){
          const playerFocus = await easyRun(ns, "singularity/isFocused");
          const workTypes = ["hacking", "field", "security"];
          const playerData = await easyRun(ns, "ns/getPlayer");
          let bestType = {type:null, repGain:0};
          // select best work type
          for (const type of workTypes){
            const startedWorking = await easyRun(ns, "singularity/workForFaction", faction, type, playerFocus);
            const typeGains = ns.formulas.work.factionGains(playerData, type, currentFavor);
            if (startedWorking && typeGains && typeGains.reputation > bestType.repGain) {
              bestType.type = type;
              bestType.repGain = typeGains.reputation;
            }
          }
          if (bestType.type === null){
            ns.tprint(`ERROR: NO FACTION WORK TYPE SELECTED!`)
            continue;
          }
          const waitTime = highestAugRepCostFromFaction / bestType.repGain;
          chosenFactionWait = waitTime;
          const startedWorking = await easyRun(ns, "singularity/workForFaction", faction, bestType.type, playerFocus);
          if (!startedWorking){
            ns.print(`FAILED TO START WORKING!`)
            await ns.sleep(5 * 1000);
          }
          if (report) {
            ns.print(`    Working for ${faction}, ${ns.formatNumber(factionReptuation,2)}/${ns.formatNumber(highestAugRepCostFromFaction,2)} reputation
    ETA for full ${faction} rep.: ~${ns.tFormat(waitTime * 1000)}.
    Doing ${bestType.type} work for ~${ns.formatNumber(bestType.repGain, 2)} rep/s.`);
          }
          chosenFaction = faction;
          chosenFactionMaxRepGain = bestType.repGain;
          break;
        }
      }
    
    let playerIsBusy = await easyRun(ns, "singularity/isBusy");
    playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations")
    const haveBladesSimulacrum = playerAugs.includes(`The Blade's Simulacrum`)
    time = Math.min(time, chosenFactionWait);
    // if we are busy and DONT have blade's simulacrum OR DONT have low karma, wait up to 'time' seconds
    if (playerIsBusy && (!haveBladesSimulacrum || !lowKarma)) {
      ns.print(`    ${COLORS.CYAN}Working for ${ns.tFormat(time * 1000)} to earn ~${ns.formatNumber(time * chosenFactionMaxRepGain,2)} reputation . . .${COLOR_RESET}`)
      for (let i = 0; i < 10; i++){
      await ns.sleep(time * 100);                 // do one tenth of faction work
      await instantaneousSingularityFunctions();  // check on other functions
      }
    }
    // if we DONT have blade's simulacrum, stop faction work after doing it
    if (!haveBladesSimulacrum) await easyRun(ns, "singularity/stopAction");
  }//-----------------------------------------------------------------------------------------------------------------
  async function haveNMI(){
    const playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations");
    if (playerAugs.includes("Neuroreceptor Management Implant")) return true;
    else {return false;}
  }



  async function doContracts(report = true){
    if (report) ns.print(`Solving Contracts...`)
  // Search server list for any .cct files. Handle them.
    let servers = retrieveServerData(ns); 
    for (let i = 0; i < servers.length; i++) {
      let server = servers[i];
      // Check if the server has any .cct files.
      let contracts = ns.ls(server.name, ".cct");
      if (contracts.length > 0){
        //ns.tprint(`Server ${server.name} has contracts: ${contracts}`);
        for (const contract of contracts){
          let contractType = await easyRun(ns, "codingcontract/getContractType", contract, server.name)
          //ns.tprint(`Contract type: ${contractType}`)
          ns.run("cct-solver.js", 1, contract, server.name);
          await ns.sleep(100);
        }
      }
    }
    return;
  }



  async function doBladeburner(){ // do bladeburner

    ns.print(`Doing Bladeburner...`)
    // Join Bladeburner.
    let joinedBladeburner = await easyRun(ns, "bladeburner/joinBladeburnerDivision");
    if (!joinedBladeburner) {
      ns.print(`Failed to join Bladeburner division.`)
      return; // failed to join bladeburner.
    }
    
    // if we DONT have blade's simulacrum, stop actions
    let playerAugs = await easyRun(ns, "singularity/getOwnedAugmentations")
    if (!playerAugs.includes(`The Blade's Simulacrum`)) await easyRun(ns, "singularity/stopAction");

    // Bladeburner faction?
    let bbRank = await easyRun(ns, "bladeburner/getRank");
    if (bbRank >= 25) await easyRun(ns, "bladeburner/joinBladeburnerFaction");

    await trainBladeburner();

    // ------------------------------ TRAIN CHARISMA --------------------------------------
      let playerData =  await easyRun(ns, "ns/getPlayer");
      let oldCharisma = playerData.skills.charisma;
      let loopCounter = 0;
      let [recruitChanceLow, recruitChanceHigh] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "General", "Recruitment");
      let recruitChance = ((recruitChanceLow + recruitChanceHigh) / 2);
      if (oldCharisma < 100000 || recruitChance > .5) await waitForAction("General", "Field Analysis"); // initial charisma kick
      while ( (oldCharisma < 100000 || recruitChance > .5) && loopCounter < 10 ){
        ns.print(`${COLORS.YELLOW}Training Charisma: ${ns.formatNumber(oldCharisma)} / 100k (${ns.formatNumber(100000-oldCharisma,3)} to go!)${COLOR_RESET}`)
        await waitForAction("General", "Recruitment");
        await optimizeForActions(false);
        playerData =  await easyRun(ns, "ns/getPlayer");
        let newCharisma = playerData.skills.charisma;
        if (newCharisma <= oldCharisma + 10) break; // if we aren't gaining significant Cha levels per recruitment, not worth continuing
        oldCharisma = playerData.skills.charisma;
        [recruitChanceLow, recruitChanceHigh] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "General", "Recruitment");
        recruitChance = ((recruitChanceLow + recruitChanceHigh) / 2);
        loopCounter++;
      }
    //------------------------------------------------------------------------------------
    // do before optimizing, because charisma is super powerful for controlling chaos - especially with large quantities.
    
    await optimizeForActions();

    // ------------------------------------------------ BLACK OPS? ----------------------------------------------
      
      let nextBlackOp = await easyRun(ns, "bladeburner/getNextBlackOp");
      while (nextBlackOp != null){
        const currentRank = await easyRun(ns, "bladeburner/getRank"); // Retrieve current Bladeburner rank
        const requiredRank = nextBlackOp.rank;
        const haveRequiredRank = requiredRank <= currentRank;
        if (haveRequiredRank) {
          const [low, high] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "BlackOps", nextBlackOp.name);
          const goodSuccessChance = ((low + high) / 2) >= 0.8;
          ns.print(`Black Op: ${nextBlackOp.name} (req. rank ${requiredRank}) has a success rate of ${ns.formatPercent(((low + high) / 2))}.`)
          if (goodSuccessChance){
            ns.print(`Performing Black Op.`)
            await waitForAction("BlackOps", nextBlackOp.name);
            await optimizeForActions(false);
          } else { break; }
        } else { break; }
        nextBlackOp = await easyRun(ns, "bladeburner/getNextBlackOp");
      }
      if (nextBlackOp === null) {
        for (let i = 0; i < 25; i++){
          ns.tprint(`${COLORS.CYAN}WORLD DAEMON EXPOSED!${COLOR_RESET}`)
        }
      }
    // ----------------------------------------------------------------------------------------------------------
    let highestActionSuccessRate = 0;
    do{
    // --------------------------------------------- ASSASSINATIONS? ---------------------------------------------------------
      let highestViableAssassinationLevel = await findHighestViableActionLevel("Operation", "Assassination");
      await easyRun(ns, "bladeburner/setActionLevel", "Operation", "Assassination", highestViableAssassinationLevel);
      let assassinationChance = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "Operation", "Assassination");
      let assassinationActionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Operation", "Assassination");
      if (highestActionSuccessRate < assassinationChance[0]) highestActionSuccessRate = assassinationChance[0];
      if (assassinationChance[0] >= 0.85 && assassinationActionsRemaining > 0) { // only do when good odds (and have actions)
        ns.print(`Planning to perform Operation: Assassination (${assassinationActionsRemaining} remaining), with success rate: ${ns.formatPercent(assassinationChance[0], 2)}`);
        await assignMembersToOp("Assassination"); // reassigne team members to assist
        await repeatAction("Operation", "Assassination");
        ns.print(`Finished performing Operation: Assassination`);
        break; // only do one action
      } else {
        ns.print(`${COLORS.YELLOW}Unable to complete Assassinations, training with lesser tasks...${COLOR_RESET}`)
        // do up to 10 operations AND contracts
      }
    // -----------------------------------------------------------------------------------------------------------------------

    // ------------------------------------------- OPERATIONS? -------------------------------------------------------------------------
      let availableOperations = await easyRun(ns, "bladeburner/getOperationNames");
      let viableOperations = [];
      for (const operation of availableOperations) {
        if (["Sting Operation", "Raid", "Stealth Retirement Operation"].includes(operation)) continue;
        let actionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Operation", operation);
        if (actionsRemaining === 0) continue;
        let highestViableLevel = await findHighestViableActionLevel("Operation", operation);
        await easyRun(ns, "bladeburner/setActionLevel", "Operation", operation, highestViableLevel);
        let [successRate] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "Operation", operation);
        if (highestActionSuccessRate < successRate) highestActionSuccessRate = successRate;
        if (actionsRemaining > 0 && successRate >= 0.85)  viableOperations.push({ operationName: operation, remaining: actionsRemaining, successRate: successRate });
      }

      if (viableOperations.length > 0) {
        viableOperations.sort((a, b) => a.successRate - b.successRate); // Sort viable operations by ascending success rate
        let underCoverOp = viableOperations.find(op => op.operationName === "Undercover Operation");
        let operation;
        if (underCoverOp !== undefined){ operation = underCoverOp; } 
        else { operation = viableOperations[0] }
        ns.print(`Planning to perform Operation: ${operation.operationName} (${operation.remaining} remaining), with success rate: ${ns.formatPercent(operation.successRate, 2)}`);
        let highestViableLevel = await findHighestViableActionLevel("Operation", operation.operationName);
        await easyRun(ns, "bladeburner/setActionLevel", "Operation", operation.operationName, highestViableLevel);
        await repeatAction("Operation", operation.operationName);
        break; // only do one action
      }else {
        ns.print(`${COLORS.YELLOW}Unable to complete any Operations, training with lesser tasks...${COLOR_RESET}`)
      }
    // ---------------------------------------------------------------------------------------------------------------------------------
    
    // -------------------------------------------- CONTRACTS? -----------------------------------------------------------
      let availableContracts = await easyRun(ns, "bladeburner/getContractNames");
      let viableContracts = [];
      for (const contract of availableContracts) {
        let actionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Contract", contract);
        if (actionsRemaining === 0) continue;
        let highestViableLevel = await findHighestViableActionLevel("Contract", contract);
        await easyRun(ns, "bladeburner/setActionLevel", "Contract", contract, highestViableLevel);
        // final successRate check
        let [successRate, _] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "Contract", contract);
        if (highestActionSuccessRate < successRate) highestActionSuccessRate = successRate;
        if (actionsRemaining > 0 && successRate >= 0.75)  viableContracts.push({ contractName: contract, remaining: actionsRemaining, successRate: successRate }); 
      }

      if (viableContracts.length > 0) {
        // Sort viable contracts by success rate (higher first)
        viableContracts.sort((a, b) => b.successRate - a.successRate);
        let contractRetirement = viableContracts.find(contract => contract.contractName === "Retirement");
        let contractBountyHunter = viableContracts.find(contract => contract.contractName === "Bounty Hunter");
        let contractTracking = viableContracts.find(contract => contract.contractName === "Tracking");
        let contract;
        // override the sort, because need more combat stats. do retirement contracts if we can.
        if (contractRetirement !== undefined) { contract = contractRetirement; } 
        else if (contractBountyHunter !== undefined) { contract = contractBountyHunter; } 
        else if (contractTracking !== undefined){ contract = contractTracking; } 
        else { contract = viableContracts[0]; } 
        ns.print(`Planning to perform Contract: ${contract.contractName} (${contract.remaining} remaining), with success rate: ${ns.formatPercent(contract.successRate, 1)}.`);
        await repeatAction("Contract", contract.contractName);
      } else {
        ns.print(`${COLORS.RED}Unable to complete any Contracts!?${COLOR_RESET}`)
      }
    // -------------------------------------------------------------------------------------------------------------------
    } while(false); // action exit jump point
    // ---------------------- INCITING VIOLENCE ---------------------------------
      /* nah this shit aint worth it - incite violence then spend an hour controlling chaos RESIDENTSLEEPER
      let lowestActionCountRemaining = await getLowestActionCount();
      wh ile (lowestActionCountRemaining < 25){
        ns.print(`Something is running low on actions. Inciting violence to generate more contracts & operations...`)
        await waitForAction("General", "Incite Violence");
        await manageCities(false);
        lowestActionCountRemaining = await getLowestActionCount();
      }
      */
    // --------------------------------------------------------------------------

    // ---------- TRAINING -------------
      if (highestActionSuccessRate < .75){
        ns.print(`Cannot succeed at ANYTHING. Training...`)
        for (let i = 0; i < 10; i++) { await waitForAction("General", "Training"); }
        return;
      }
    // ---------------------------------
  }



// ----------------------------------------------- MISCELLANEOUS BLADEBURNER FUNCTIONS -----------------------------------------------------------

  async function trainBladeburner(report = true) { // train up bladeburner stats
    let playerData = await easyRun(ns, "ns/getPlayer");
    const bnMultis = await easyRun(ns, "ns/getBitNodeMultipliers");

    // Check if any stat is below 100 times their respective multipliers
    function statsBelowThreshold(playerData) {
      return playerData.skills.agility  < 100 * playerData.mults.agility    * bnMultis.AgilityLevelMultiplier   ||
            playerData.skills.strength  < 100 * playerData.mults.strength   * bnMultis.StrengthLevelMultiplier  ||
            playerData.skills.defense   < 100 * playerData.mults.defense    * bnMultis.DefenseLevelMultiplier   ||
            playerData.skills.dexterity < 100 * playerData.mults.dexterity  * bnMultis.DexterityLevelMultiplier;
    }

    // Wh ile any stats are below their threshold, continue training
    while (statsBelowThreshold(playerData)) {
      await waitForAction("General", "Training", report);
      await optimizeForActions(report);
      playerData = await easyRun(ns, "ns/getPlayer");
    }
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

  async function recoverStamina(report = true){ // ensure stamina is at maximum; report?
    let staminaValues = await easyRun(ns, "bladeburner/getStamina");
    let staminaPercentage = staminaValues[0] / staminaValues[1];
    while (staminaPercentage < .9){
      await waitForAction("General", "Hyperbolic Regeneration Chamber", report);
      staminaValues = await easyRun(ns, "bladeburner/getStamina");
      staminaPercentage = staminaValues[0] / staminaValues[1];
    }
  }

  async function recoverHealth(){
    let playerData = await easyRun(ns, "ns/getPlayer");
    let healthPercentage = playerData.hp.current / playerData.hp.max
    if (healthPercentage < 1) {
      await easyRun(ns, "singularity/hospitalize"); // hoptal
      playerData = await easyRun(ns, "ns/getPlayer");
      healthPercentage = playerData.hp.current / playerData.hp.max
      ns.print(`${COLORS.YELLOW}Went to hospital. New health: ${playerData.hp.current}/${playerData.hp.max}(${ns.formatPercent(healthPercentage,1)}${COLOR_RESET})`);
    }
  }

  async function optimizeForActions(report = true){
    await recoverHealth(); // heal if necessary
    await recoverStamina(report); // max out stamina
    await upgradeSkills(); // use up all our skill points
    await manageCities(report); // ensure cities are at optimal conditions, and move to the largest pop
  }

  async function repeatAction(actionType, actionName) { // repeat an action until we are low on stamina, health, or have low success chance
    let actionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", actionType, actionName);
    let maxRepetitions = Math.min(25, actionsRemaining)
    let repetitions = 0;
    
    await optimizeForActions(false);

    let optimizeActionsCounter = 0;
    while (repetitions < maxRepetitions) {
      // Check health, stamina, success rate.
      let maxViableActionLevel = await findHighestViableActionLevel(actionType, actionName);
      await easyRun(ns, "bladeburner/setActionLevel", actionType, actionName, maxViableActionLevel);
      await ns.sleep(5);
      let [successChance, _] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", actionType, actionName);
      if (successChance < .7) {ns.print(`${COLORS.YELLOW}Stopping action due to low success chance.${COLOR_RESET}`); break; }
      // if we have good success chance...
      let actionTime = await easyRun(ns, "bladeburner/getActionTime", actionType, actionName);
      let remainingReps = maxRepetitions - repetitions;
      let remainingTime = remainingReps*actionTime;
      ns.print(`${COLORS.CYAN}${actionType}: ${actionName} - ${repetitions+1} / ${maxRepetitions}, ${millisecondsToTimeString(remainingTime)} remaining (${remainingReps}x @ ${millisecondsToTimeString(actionTime)}/ea)${COLOR_RESET}`)
      await waitForAction(actionType, actionName, false); // Perform the action
      if (optimizeActionsCounter >= 5){
        optimizeActionsCounter = 0;
        await optimizeForActions(false);
      } 
      optimizeActionsCounter++;;
      repetitions++;
    }
  }//------------------------------------------------------------------------------------------------------------------------------

  async function upgradeSkills() { // --------upgrade overclock (speed), then hyperdrive (exp), then other things--------------------------------
    let skillPoints = await easyRun(ns, "bladeburner/getSkillPoints");
      let overclockCost = await customGetSkillUpgradeCost("Overclock");
      let ocLevel = await easyRun(ns, "bladeburner/getSkillLevel", "Overclock");
      let hyperdriveCost = await customGetSkillUpgradeCost("Hyperdrive");
    // Overclock then Hyperdrive, as many times as possible.
      while (skillPoints >= overclockCost && ocLevel < 90 || skillPoints >= hyperdriveCost) {
        await ns.sleep(1);
        if (skillPoints >= overclockCost && ocLevel < 90){
          ns.print(`Upgrading Overclock skill!`)
          await easyRun(ns, "bladeburner/upgradeSkill", "Overclock", 1);
          skillPoints = await easyRun(ns, "bladeburner/getSkillPoints");
          overclockCost = await customGetSkillUpgradeCost("Overclock");
          ocLevel = await easyRun(ns, "bladeburner/getSkillLevel", "Overclock");
        }
        if (skillPoints >= hyperdriveCost){
          ns.print(`Upgrading Hyperdrive skill!`)
          await easyRun(ns, "bladeburner/upgradeSkill", "Hyperdrive", 1);
          skillPoints = await easyRun(ns, "bladeburner/getSkillPoints");
          hyperdriveCost = await customGetSkillUpgradeCost("Hyperdrive");
        }
      }
    // Then, the rest; cheapest each time.
      //  Upgrade the cheapest skill as long as you have enough skill points
    while (true) {
      let cheapestSkill = await getCheapestSkillUpgrade();
      // if Overclock level is 90, use most skill points (focusing hyperdrive); else, use minimal
      let freeSkillPoints = ocLevel === 90 ? skillPoints / 2 : skillPoints / 10; 
      if (!cheapestSkill || freeSkillPoints < cheapestSkill.cost) break;
      ns.print(`Upgrading ${cheapestSkill.skillName} for ${cheapestSkill.cost} of ${skillPoints} available skill points.`)
      await easyRun(ns, "bladeburner/upgradeSkill", cheapestSkill.skillName, 1);
      skillPoints = await easyRun(ns, "bladeburner/getSkillPoints");
    }
  }//------------------------------------------------------------------------------------------------------------

  async function getCheapestSkillUpgrade() { //--- Function to get the cheapest skill to upgrade, excluding overclock -----------
    let skillNames = await easyRun(ns, "bladeburner/getSkillNames");
    let cheapestSkill = null;
    let lowestCost = Infinity;
    for (const skill of skillNames) {
      let upgradeCost = await customGetSkillUpgradeCost(skill);
      if (upgradeCost < lowestCost && skill !== "Overclock") {
        lowestCost = upgradeCost;
        cheapestSkill = skill;
      }
    }
    return cheapestSkill ? { skillName: cheapestSkill, cost: lowestCost } : null;
  }//-------------------------------------------------------------------------------------------------------------
  
  // Function to get the cost to upgrade a specific skill
  async function customGetSkillUpgradeCost(skillName) { return easyRun(ns, "bladeburner/getSkillUpgradeCost", skillName, 1); }

  // ensure all cities have accurate estimates and controlled chaos numbers. travel to highest synthoid pop.
  async function manageCities(report = true) { 
    if (report) ns.print(`${COLORS.CYAN}Improving population estimates and controlling Chaos levels...${COLOR_RESET}`)
    const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];
    for (const city of cities) {
      await makeEstimatesAccurate(city, report);
      await controlChaos(city, report);
    }
    // Identify the city with the highest Synthoid population, and travel to it.
    let highestCityPop = { name: "", pop: -1 };
    for (const city of cities) {
      const cityPop = await easyRun(ns, "bladeburner/getCityEstimatedPopulation", city);
      if (cityPop > highestCityPop.pop) highestCityPop = { name: city, pop: cityPop }; 
    }
    // Move to the city with the highest population (if it's not the current city)
    let currentCity = await easyRun(ns, "bladeburner/getCity");
    if (currentCity !== highestCityPop.name) {
      await easyRun(ns, "bladeburner/switchCity", highestCityPop.name);
      if (report) ns.print(`Moved to ${highestCityPop.name} (Synthoid pop ${ns.formatNumber(highestCityPop.pop, 2)}) for optimal Bladeburner operations.`);
    }
  }//--------------------------------------------------------------------------------------------------------

  async function makeEstimatesAccurate(city, report = false){ // ensure action success estimates are accurate in a city
    await easyRun(ns, "bladeburner/switchCity", city);

    const contractNames = await easyRun(ns, "bladeburner/getContractNames");
    const operationNames = await easyRun(ns, "bladeburner/getOperationNames");
    let actionList = contractNames.map(name => ({ type: "Contract", name }))
            .concat(operationNames.map(name => ({ type: "Operation", name })));
    const nextBlackOp = await easyRun(ns, "bladeburner/getNextBlackOp");
    const isNextBlackOp = nextBlackOp !== null;
    if (isNextBlackOp) actionList.concat({ type: "BlackOps", name: nextBlackOp })
    // Check for variance in any action
    let varianceFound = await isVarianceInSuccessEstimates(actionList);
    if (varianceFound !== false) {
      let highestViableInvestigationLevel = await findHighestViableActionLevel("Operation", "Investigation");
      await easyRun(ns, "bladeburner/setActionLevel", "Operation", "Investigation", highestViableInvestigationLevel);
      let [low, high] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "Operation", "Investigation");
      let investigationAverageSuccessChance = (low + high) / 2;
      let investigationActionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Operation", "Investigation");
      let doInvestigation = true;
      if (report) ns.print(`${COLORS.YELLOW}Working in ${city} to ensure accurate numbers.${COLOR_RESET}`);
      do {
        await ns.sleep(50);
        investigationActionsRemaining = await easyRun(ns, "bladeburner/getActionCountRemaining", "Operation", "Investigation");
        [low, high] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", "Operation", "Investigation");
        investigationAverageSuccessChance = (low + high) / 2;
        if (investigationAverageSuccessChance > 0.75 && investigationActionsRemaining > 0 && doInvestigation) {
          if (report) ns.print(`${COLORS.YELLOW}Doing Investigations in ${city} to ensure accurate numbers, current Δ:${ns.formatPercent(varianceFound,1)}.${COLOR_RESET}`);
          await waitForAction("Operation", "Investigation", report);
          doInvestigation = false;
        } else {
          if (report) ns.print(`${COLORS.YELLOW}Doing Field Analysis in ${city} to ensure accurate numbers, current Δ:${ns.formatPercent(varianceFound,1)}.${COLOR_RESET}`);
          await waitForAction("General", "Field Analysis", report);
          doInvestigation = true;
        }

        await upgradeSkills();

        varianceFound = await isVarianceInSuccessEstimates(actionList);
      } while (varianceFound !== false);
      if (varianceFound === false) ns.print(`Numbers accurate in ${city}!`);
    }
  }//-----------------------------------------------------------------------------------------------------------------------
  async function controlChaos(city, report = false){ // reduce chaos in the city to a reasonable level
    let chaosInCity = await easyRun(ns, "bladeburner/getCityChaos", city);
    let previousChaos = chaosInCity;
    let newChaos = previousChaos;
    if (chaosInCity > 50){

      if (report) ns.print(`${COLORS.YELLOW}Starting Diplomacy in ${city} to reduce Chaos of ${ns.formatNumber(chaosInCity, 3)}${COLOR_RESET}.`); 

      while (newChaos > 50) {
        await waitForAction("General", "Diplomacy", report);
        await upgradeSkills();
        newChaos = await easyRun(ns, "bladeburner/getCityChaos", city);
        let chaosReductionPercent = (previousChaos - newChaos) / previousChaos;
        if (newChaos < 50 && report) ns.print(`Chaos under control in ${city}!`);
        else if (report) ns.print(`${COLORS.YELLOW}Remaining chaos in ${city}: ${ns.formatNumber(newChaos, 3)} (${ns.formatPercent(chaosReductionPercent, 2)}% reduction).${COLOR_RESET}`);
        previousChaos = newChaos; // Update the previousChaos for the next iteration
      }
      ns.print(`Chaos under control in ${city} (${ns.formatNumber(newChaos, 1)}).`);
    }
  }//--------------------------------------------------------------------------------------------------------------------------
  async function waitForAction(type, name, report = true){ // begin an action, and wait for it to complete.

    await instantaneousSingularityFunctions(); // handle any singularity work that we can do 'instaneously' FIRST, then do BB actions.

    let actionTime = await easyRun(ns, "bladeburner/getActionTime", type, name);
    if (report) ns.print(`${COLORS.CYAN}Waiting for ${type} - ${name}: ${millisecondsToTimeString(actionTime)}${COLOR_RESET}`);
    if (type === "BlackOps"){
      let currentNextBlackOp =  await easyRun(ns, "bladeburner/getNextBlackOp");
      await easyRun(ns, "bladeburner/startAction", type, name);
      await ns.sleep(actionTime);
      let newNextBlackOp =  await easyRun(ns, "bladeburner/getNextBlackOp");
      if (currentNextBlackOp !== newNextBlackOp) {return true;}
      else {return false;}
    } else {
      let beforeSuccesses = await easyRun(ns, "bladeburner/getActionSuccesses", type, name);
      await easyRun(ns, "bladeburner/startAction", type, name);
      await ns.sleep(actionTime);
      let afterSuccesses = await easyRun(ns, "bladeburner/getActionSuccesses", type, name);
      if (afterSuccesses > beforeSuccesses) {return true;}
      else {return false;}
    }
  } 
  async function assignMembersToOp(operation){ // assign all team members to operation
    let opNames = await easyRun(ns, "bladeburner/getOperationNames");
    for (const op of opNames){ await easyRun(ns, "bladeburner/setTeamSize", "Operation", op, 0); }
    // assign as many as possible to the one we are about to do.
    let teamMembers = await easyRun(ns, "bladeburner/setTeamSize", "Operation", operation, 9e999);
    if (teamMembers === -1) {ns.print("ERROR ASSIGNING TEAM MEMBERS!"); await ns.sleep(1000*60); }
    else {ns.print(`Assigned ${teamMembers} teammates to assist.`)}
    return teamMembers;
  }//----------------------------------------------------------------------------------
  function millisecondsToTimeString(milliseconds) {// convert a milliseconds number into a pretty time string
    let hours = Math.floor(milliseconds / 3600000); // 1 hour = 3600000 milliseconds
    let mins = Math.floor((milliseconds % 3600000) / 60000); // 1 minute = 60000 milliseconds
    let secs = Math.floor((milliseconds % 60000) / 1000); // 1 second = 1000 milliseconds
    let msecs = milliseconds % 1000;
    // Format milliseconds to always have three digits
    if (msecs < 10) { msecs = '00' + msecs; } 
    else if (msecs < 100) { msecs = '0' + msecs; }
    let timeString = "";
    if (hours > 0) timeString += hours + "h";
    if (mins > 0) timeString += (timeString ? " " : "") + mins + "m";
    if (secs > 0) timeString += (timeString ? " " : "") + secs + "s";
    if (msecs > 0) timeString += (timeString ? " " : "") + msecs + "ms";
    return timeString || "0ms"; // Return "0ms" if all are zero
  }//--------------------------------------------------------------------------------------

  async function findHighestViableActionLevel(actionType, actionName) { // Function to find the highest viable level for an action
    let low = 1;
    let high = await easyRun(ns, "bladeburner/getActionMaxLevel", actionType, actionName);
    let viableLevel = 1; // Default to level 1 if no higher level is found
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      await easyRun(ns, "bladeburner/setActionLevel", actionType, actionName, mid);
      await ns.sleep(5);
      let [successRate, _] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", actionType, actionName);
      if (successRate >= 0.9) {
        viableLevel = mid; // Mid level is viable
        low = mid + 1; // Check if higher levels are also viable
      } else {
        high = mid - 1; // Check lower levels
      }
    }
    return viableLevel;
  }//---------------------------------------------------------------------------------------------------------

  // detect variance in success estimates for Iterable {type:actionType(str), name: actionName(str)}
  async function isVarianceInSuccessEstimates(actionList) { 
    let maxVariance = 0;
    for (const action of actionList) {
      let [minChance, maxChance] = await easyRun(ns, "bladeburner/getActionEstimatedSuccessChance", action.type, action.name);
      let variance = maxChance - minChance;
      if (variance > maxVariance) {  maxVariance = variance; }
    }
    return maxVariance > 0 ? maxVariance : false; // Return maximum variance or false if no variance found
  }//-----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------------------------------


  async function doGraft(){
    return; // grafting is kind of dogshit?
    ns.print(`Doing Grafts...`);

    // dont do grafting until we have unlocked gangs
    const lowKarma = await reduceKarma();
    if (!lowKarma) return;

    const playerData = await easyRun(ns, "ns/getPlayer")
    const startingCity = playerData.city;
    await easyRun(ns, "singularity/travelToCity", "New Tokyo");

    const currentAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);

    // if we have the nCI, graft freely.
    if (currentAugs.includes("nickofolas Congruity Implant")){
      // get graftable augs...
      const graftableAugs = await easyRun(ns, "grafting/getGraftableAugmentations");
      // create {augName, augPrice, graftTime} objects for each graftable aug
      let graftableAugObjects = []
      for (const graftAug of graftableAugs){ 
          const graftAugPrice = await easyRun(ns, "grafting/getAugmentationGraftPrice", graftAug)
          const graftAugTime = await easyRun(ns, "grafting/getAugmentationGraftTime", graftAug)
          graftableAugObjects.push({augName: graftAug, augPrice: graftAugPrice, graftTime:graftAugTime})
      }
      // sort by fastest installs (speedrun augs)
      const sortedGraftables = graftableAugObjects.sort((a, b) => a.graftTime - b.graftTime); // sort by graft time; lowest to highest

      for (const graftObj of sortedGraftables){ 
        const installedAug = await graftAug(graftObj.augName); 
        if (!installedAug) break; // ran out of money. (or possibly error of some kind?)
        await doFactionWork();
      }

    } else { // go for nickofolas Congruity Implant, or return immediately if too long
      const pD = await easyRun(ns, "ns/getPlayer");
      let totalIncome = await getTotalIncome();
      let nickofolasTimeInSeconds = ((150e12 - pD.money)/totalIncome);
      ns.print(`Approximate ETA for 'nickofolas Congruity Implant' funds: ${ns.tFormat(nickofolasTimeInSeconds * 1000)}.`)
      if (nickofolasTimeInSeconds > 60 * 60) { // more than 1h wait, nah
        await easyRun(ns, "singularity/travelToCity", startingCity);
        return; 
      }
      while (nickofolasTimeInSeconds <= 60 * 60){ // wh ile ~1h or less, wait for it. KEEP. WAITING.
        //restart the gang into savings mode (wont spend on equipment)
        if (currentGangPID != 0) {
          await easyRun(ns, "ns/kill", currentGangPID);
          const runOps = {preventDuplicates:true};
          currentGangPID = ns.run("gang.js", runOps, "-s");
        }

        // kill the money sink daemons
        if (currentHashnetPID != 0) await easyRun(ns, "ns/kill", currentHashnetPID);
        if (currentPurchaseServerPID != 0) await easyRun(ns, "ns/kill", currentPurchaseServerPID);

        // sleep until we (should) be able to afford it.
        ns.print(`Saving for ~${ns.tFormat(nickofolasTimeInSeconds * 1000)} to afford 'nickofolas Congruity Implant' . . .`)
        const timeDivisor = 100;
        for (let index = 0; index < timeDivisor; index++){
          const playerData = await easyRun(ns, "ns/getPlayer");
          if (playerData.money >= 150e12) break;
          totalIncome = await getTotalIncome();
          const cashToGraft = 150e12 - playerData.money;
          nickofolasTimeInSeconds = (cashToGraft/totalIncome);
          ns.print(`${index}/${timeDivisor}, ${"$"}${ns.formatNumber(playerData.money, 2)}/150t (${ns.tFormat( (nickofolasTimeInSeconds+(index/nickofolasTimeInSeconds)) * 1000/timeDivisor)})`)
          await ns.sleep((nickofolasTimeInSeconds/100) * 1000);
        }
        // try to purchase & install the graft...
        const nickofolasGrafted = await graftAug("nickofolas Congruity Implant");
        if (nickofolasGrafted) break;

        totalIncome = await getTotalIncome();
        nickofolasTimeInSeconds = (150e12/totalIncome);
      }
      
      // nickofolas has been installed (or some horrific logic error occured). resume normal operations.
      // reset gang to normal operations, restart hashnet and server purchasing daemons
      await easyRun(ns, "ns/kill", currentGangPID);
      const runOps = {preventDuplicates:true};
      currentGangPID =  await easyRun(ns, "ns/run", "gang.js", runOps)
      currentHashnetPID = await easyRun(ns, "ns/run", "hashnet.js", runOps);
      currentPurchaseServerPID = await easyRun(ns, "ns/run", "purchase-servers.js", runOps, "-p");
    }
    
    await easyRun(ns, "singularity/travelToCity", startingCity);
    return;
  }
  async function graftAug(augName){
    try {
      const playerData = await easyRun(ns, "ns/getPlayer");
      const graftPrice = await easyRun(ns, "grafting/getAugmentationGraftPrice", augName);
      // if we can afford the graft...
      if (graftPrice <= playerData.money){
        await easyRun(ns, "singularity/travelToCity", "New Tokyo"); // travel to New Tokyo
        ns.print(`Purchasing ${augName} Graft!`);
        const graftWait = await easyRun(ns, "grafting/getAugmentationGraftTime", augName); // get graft install time
        // start the grafting process...
        await easyRun(ns, "grafting/graftAugmentation", augName);
        const sleepDivisor = 100;
        for (let index = 0; index < sleepDivisor; index++){
          const focusBool = await easyRun(ns, "singularity/isFocused");
          // if focused, we will complete the task faster. if not, extend sleeps. if NMI, focus doesnt matter.
          const boolNMI = await haveNMI();
          const loopSleep = focusBool || boolNMI ? graftWait/sleepDivisor : (1.25*graftWait)/sleepDivisor;
          ns.print(`Completing Graft. . . (${ns.tFormat( (loopSleep) * (sleepDivisor - index))})`)
          await ns.sleep(loopSleep);
          await instantaneousSingularityFunctions(true);
        }
        // now sit and wait until it actually finishes.
        await completeCurrentWork();
      } else {
        return false;
      }
    } catch(error) {
      ns.print(error)
      return false;
    }
    return true;
  }
    async function completeCurrentWork(){
      let currentWork = await easyRun(ns, "singularity/getCurrentWork");
      // are we currently grafting an aug we have purchased (?)
      while(currentWork != null && ["CREATE_PROGRAM", "GRAFTING"].includes(currentWork.type)){
        const playerPendingAndInstalledAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
        if (currentWork.type === "GRAFTING" && playerPendingAndInstalledAugs.includes(currentWork.augmentation)) {
          ns.print(`Aug currently being Grafted was purchased via other means.`)
          return;
        }
        ns.print(`Finishing up task . . .`);
        await instantaneousSingularityFunctions(true);
        await ns.sleep(5 * 1000);
        currentWork = await easyRun(ns, "singularity/getCurrentWork");
      }
      return;
    }
  async function getTotalIncome(){ // average income/s since last install
    const timeSinceLastAug = await easyRun(ns, "ns/getTimeSinceLastAug");
    const moneySources = await easyRun(ns, "ns/getMoneySources")
    return (Object.entries(moneySources.sinceInstall)
        .filter((moneySource) => moneySource[1] > 0)
        .reduce((previousValue, currentValue) => { return previousValue + currentValue[1] }, 0) ) 
      / (timeSinceLastAug/1000);
  }


  async function joinAndPromoteInMegacorps(report = true){
    const MEGACORP_FACTIONS = [
      "ECorp",               "MegaCorp",              "Bachman & Associates", "Blade Industries",       "NWO",
      "Clarke Incorporated", "OmniTek Incorporated",  "Four Sigma",           "KuaiGong International", "Fulcrum Technologies"
    ];
    for (const megaCorporation of MEGACORP_FACTIONS){ 
      const recruitedOrPromoted = await easyRun(ns, "singularity/applyToCompany", megaCorporation, "Business"); 
      if (recruitedOrPromoted){
        ns.print(`  Recruited or promoted at ${megaCorporation}!`)
      }
    }
  }


// ------------------------------------------ ADDITIONAL HELPER FUNCTIONS -----------------------------------------------------------------
  // returns count of cracking tools for easier filtering
  // GOLF
  async function countTools(){ 
    var t = 0;
    if (await easyFileExists("BruteSSH.exe")) {t++;}
    if (await easyFileExists("FTPCrack.exe")) {t++;}
    if (await easyFileExists("relaySMTP.exe")) {t++;}
    if (await easyFileExists("HTTPWorm.exe")) {t++;}
    if (await easyFileExists("SQLInject.exe")) {t++;} 
    return t; 
  }

  async function easyFileExists(name){
    let response = await easyRun(ns, "ns/fileExists", name, "home");
    return response;
  }

  function retrieveServerData(ns) {
    let csvContent = ns.read("server_list.txt"); // Read the entire content of the CSV file
    let lines = csvContent.split("\n");
    lines.shift(); // Skip the header line
    let servers = []; // Array to hold server objects
    for (let line of lines) {
      if (line.trim() === "") continue;  // To handle potential empty lines
      let parts = line.split(",");
      let server = {name: parts[0],
              numPortsRequired: parts[1],
              maxMoney: parts[2],
              requiredLevel: parts[3],
              minSecurityLevel: parts[4],
              depth: parts[6]
            };
      servers.push(server);
    } return servers;
  }
// ----------------------------------------------------------------------------------------------------------------------------------------
}
