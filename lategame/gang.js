import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) { // THIS SCRIPT PROGRAMATICALLY CONTROLS A GANG
  const LOOP_WAIT = ns.args[0] || 5000;
  const ASCENSION_MULT = 1.2;
  const SPENDMODIFIER = .1; // multiplier for what to spend of cash on hand
  const MIN_WARFARE_STATS = 1000;
  // PRETTY COLORS! (ANSI escape codes for text colorifcation)
  const COLOR_BLACK = "\u001b[30m"; 
  const COLOR_RED = "\u001b[31m"; 
  const COLOR_GREEN = "\u001b[32m"; 
  const COLOR_YELLOW = "\u001b[33m"; 
  const COLOR_BLUE = "\u001b[34m"; 
  const COLOR_MAGENTA = "\u001b[35m"; 
  const COLOR_CYAN = "\u001b[36m"; 
  const COLOR_WHITE = "\u001b[37m"; 
  const COLOR_RESET = "\u001b[0m";

  // CONSTANTS
  const minTaskableStats = 25;
  const taskTierScaleFactor = 25;
  const GANG_FACTION = "Aphelion";
  const MIN_AVERAGE_CLASH_WIN_CHANCE = 0.65;
  
  ns.disableLog("ALL");
  ns.disableLog("sleep");
  ns.disableLog("gang.setMemberTask");
  ns.disableLog("getServerMoneyAvailable");



  // only needed BEFORE we are in a gang
  let alreadyInGang = await easyRun(ns, "gang/inGang");
  if (!alreadyInGang) {
    let madeGang = await easyRun(ns, "gang/createGang", "Slum Snakes");
    if (!madeGang) return; // if we failed to make a gang, end script.
    else { await easyRun(ns, "gang/recruitMember", "member-01"); } // if we made a new gang, recruit an initial member (necessary for sycnhronization)
  }

  let counter = 0;

  //await synchronize(); // initial synchronization...

  // Cycle duration settings
  const WORK_CYCLE_DURATION = 19.5;
  let BASE_SLEEP_TIME = 2000
  let SLEEP_TIME = 2000;
  let INTERAL_WAIT = 2*SLEEP_TIME;


  // MAIN LOOP
  while (true) {
    await updateTiming(); // update sleep time and internal wait
    await trainLowestStat();
    await ns.sleep((WORK_CYCLE_DURATION * SLEEP_TIME) / 5)
    await manageGangActivities(); // Work Cycle, has an internal wait
    await ns.sleep((4 * ((WORK_CYCLE_DURATION * SLEEP_TIME)/5)) - INTERAL_WAIT); // sleep
    await synchronize(); // territory warfare; synchronize to clashes
  }//-----------------------------------------------------------------------------------

  async function updateTiming(){
    const bonusTime = await easyRun(ns, "gang/getBonusTime");
    SLEEP_TIME = bonusTime > 2000 ? SLEEP_TIME = BASE_SLEEP_TIME/25 : SLEEP_TIME = BASE_SLEEP_TIME;
    INTERAL_WAIT = 2 * SLEEP_TIME;
  }

  async function trainLowestStat(){
    const gangMembers = await easyRun(ns, "gang/getMemberNames");
    for (const member of gangMembers){
      const memberData = await easyRun(ns, "gang/getMemberInformation", member);
      const skillNames = ["hack", "str", "def", "dex", "agi", "cha"];
      const lowestSkillName = 
        Object.entries(memberData)                                      // all [property, value]'s of memberData,
          .filter(propValPair => skillNames.includes(propValPair[0]))   // filtered for skills only,
          .sort((a, b)=> a[1] - b[1])                                   // sorted ascending,
          .shift()[0];                                                  // retrieving the lowest
      switch(lowestSkillName){
        case "str": 
          ns.print(`${member} training combat stats.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Combat");
          break;
        case "def": 
          ns.print(`${member} training combat stats.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Combat");
          break;
        case "dex": 
          ns.print(`${member} training combat stats.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Combat");
          break;
        case "agi":
          ns.print(`${member} training combat stats.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Combat");
          break;
        case "hack":
          ns.print(`${member} training hacking.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Hacking");
          break;
        case "cha":
          ns.print(`${member} training charisma.`)
          await easyRun(ns, "gang/setMemberTask", member, "Train Charisma");
          break;
      }

    }
  }

  async function manageGangActivities(){ // function to manage all general gang activities
    ns.print("\n\n");

    let myGangInfo = await easyRun(ns, "gang/getGangInformation");
    // flag for territory clashes
    let averageClashWinChance = await getAverageClashWinChance()
    ns.print("Average clash win chance: "+ ns.formatPercent(averageClashWinChance, 2));
    let canWinAgainstAll = await getAverageClashWinChance() >= MIN_AVERAGE_CLASH_WIN_CHANCE ? true : false;
    
    // enable / disable territory combat
    if (canWinAgainstAll && myGangInfo.territory < 1) {
      if (!myGangInfo.territoryWarfareEngaged) ns.toast("Engaging in territory clashes."); // only toast if changing what we are doing
      await easyRun(ns, "gang/setTerritoryWarfare", true);
    } else {
      await easyRun(ns, "gang/setTerritoryWarfare", false);
      if (myGangInfo.territoryWarfareEngaged) ns.toast("Disengaging from territory clashes.", "warning");
    }
    
    let gangCanRecruit = await easyRun(ns, "gang/canRecruitMember");
    while (gangCanRecruit) { // Recruit new members if possible-------------
      // Get the current list of member names
      let currentMembers = await easyRun(ns, "gang/getMemberNames");
      // Find the highest member number in use
      let highestNumber = currentMembers
            .map(name => parseInt(name.replace('member-', ''), 10)) // Extract number part of the name and convert to int
            .filter(num => !isNaN(num)) // Filter out any non-number entries
            .sort((a, b) => a - b) // Sort numerically
            .pop() || 0; // Get the highest number or zero if there are none

      // Calculate the new member number
      let newMemberNumber = highestNumber + 1;
      let memberName = `member-${newMemberNumber.toString().padStart(2, '0')}`;

      // Ensure the new name is unique before recruiting
      if (!currentMembers.includes(memberName)) {
        await easyRun(ns, "gang/recruitMember", memberName);
        ns.toast(`Recruited new member: ${memberName}`);
      }
      gangCanRecruit = await easyRun(ns, "gang/canRecruitMember");
      await ns.sleep(50);
    }//----------------------------------------------------------------------

    let memberNames = await easyRun(ns, "gang/getMemberNames");
    
    // generate memberInfo array
    let memberInfo = [];
    for (const n of memberNames){ let s = await easyRun(ns, "gang/getMemberInformation", n); memberInfo.push(s); }
    
    let vigilanteCount = 0;

    // randomize memberInfo array order
    for (let i = memberInfo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Generate a random index lower than the current element
      [memberInfo[i], memberInfo[j]] = [memberInfo[j], memberInfo[i]]; // Swap elements at indices i and j
    }

    // TASK ASSIGNMENT -----------------------------------------------------------
    for (let specificMemberInfo of memberInfo) {

      // equipment, if cheap enough (and not in 'saving' mode) (boosts training, why not?)
      let allEquipmentNames = await easyRun(ns, "gang/getEquipmentNames");
      for(let equipment of allEquipmentNames){

        let equipmentCost = await easyRun(ns, "gang/getEquipmentCost", equipment)
        let playerMoney = await easyRun(ns, "ns/getServerMoneyAvailable", "home");
        let isAffordable = equipmentCost <= playerMoney * .1;
        let memberDoesntHaveUpgrade = !(specificMemberInfo.upgrades.includes(equipment) || specificMemberInfo.augmentations.includes(equipment));
        
        if(isAffordable && memberDoesntHaveUpgrade && !ns.args.includes("-s")){
          await easyRun(ns, "gang/purchaseEquipment", specificMemberInfo.name, equipment);
          ns.toast("Purchased " + equipment + " for " + specificMemberInfo.name, "info");
        }
      }
      
      // Check if we should ascend (only after training all stats up)
      let shouldAscendMember = await shouldAscend(specificMemberInfo)
      if (shouldAscendMember) {
        await easyRun(ns, "gang/ascendMember", specificMemberInfo.name);
        ns.toast("Ascending " + specificMemberInfo.name);
        continue;
      }

      // Assign other tasks based on their stats.
      if (!await assignTask(specificMemberInfo)) {
        ns.toast("Bad task assignment.", "error", 5000);
      }
    }// END TASK ASSIGNMENT ---------------------------------------------------

    // wait a bit, to get actual profit numbers
    await ns.sleep(INTERAL_WAIT);
    
    myGangInfo = await easyRun(ns, "gang/getGangInformation");
    memberNames = await easyRun(ns, "gang/getMemberNames");
    let percentageWantedPenalty = (100 - (myGangInfo.wantedPenalty * 100)).toFixed(2);
    ns.print(COLOR_CYAN + "Looping... " + counter++ + COLOR_RESET);
    ns.print(COLOR_CYAN + 
            "Gang members: " + memberNames.length + 
            // Wanted: colored percentage wanted penalty, raw wanted value, and colored +/- gain
            " | Wanted Penalty: " + 
              (percentageWantedPenalty > 1 ? (COLOR_RESET + COLOR_RED + percentageWantedPenalty) : (COLOR_RESET + COLOR_GREEN + percentageWantedPenalty)) + "%" + COLOR_RESET + COLOR_CYAN + " (" + ns.formatNumber(myGangInfo.wantedLevel, 2)  +  " " + (myGangInfo.wantedLevelGainRate > 0 ? (COLOR_RESET + COLOR_YELLOW + "+") : (COLOR_RESET + COLOR_GREEN + "")) + ns.formatNumber(myGangInfo.wantedLevelGainRate, 2) + "/s"+ COLOR_RESET + COLOR_CYAN + ")" + 
            // Income/s commas 2 decimals         | Territory percentage 2 decimals, warring Y/N, Clash chance percentage 1 decimal
            "\nIncome: " + ns.formatNumber(myGangInfo.moneyGainRate*5, 2) + "/s | Territory: " + ns.formatPercent(myGangInfo.territory, 2) + "% (Warring:" + (myGangInfo.territoryWarfareEngaged ? "Y" : "N") + ", Clash chance: " + ns.formatPercent(myGangInfo.territoryClashChance, 1) + "%)" +
            COLOR_RESET);
    if (myGangInfo.moneyGainRate > 0) { ns.toast("Gang profit: "+ns.formatNumber(myGangInfo.moneyGainRate*5,2), "success", WORK_CYCLE_DURATION * SLEEP_TIME); }
    else { ns.toast("Gang profit: "+ ns.formatNumber(myGangInfo.moneyGainRate,2), "warning", WORK_CYCLE_DURATION * SLEEP_TIME); }

  }//---------------------------------------------------------------------------------------

  async function synchronize() { // function to synchronize script to gang clash update cycle
    ns.print("\n\nSynchronizing gang script to gang operations...");
    //ns.toast("Synchronizing gang script to gang operations...", "info", 2500);
    // Get initial values...
    let gangInfo = await easyRun(ns, "gang/getGangInformation");
    let gangPower = gangInfo.power;
    let initialWinChance = await getAverageClashWinChance();
    await engageInTerritoryWarfare(false);
    while (true) { // and then engage in territory warfare until win chance OR power is updated
      let newWinChance = await getAverageClashWinChance();
      let winChanceUpdated = newWinChance !== initialWinChance;

      let newGangInfo = await easyRun(ns, "gang/getGangInformation");
      let newGangPower = newGangInfo.power;
      let gangPowerUpdated = newGangPower !== gangPower;

      if (winChanceUpdated || gangPowerUpdated) { return Date.now(); }
      await ns.sleep(1); // Sleep for a short time
    }
  }//---------------------------------------------------------------------------------

  async function getAverageClashWinChance(){ // function to return current average clash win chance against all other gangs
    let myGangInfo = await easyRun(ns, "gang/getGangInformation"); 
    let myGangName = myGangInfo.faction;
    let averageClashWinChance;
    let totalPower = 0;
    let activeOpponents = 0;
    let otherGangsInfo = await easyRun(ns, "gang/getOtherGangInformation");
    // process opponents
    for (const [gangName, gangInfo] of Object.entries(otherGangsInfo)) {
      if (gangName !== myGangName && gangInfo.territory > 0) { // Check if the gang is not your own
        // Calculate win chance ratio
        let powerRatio = myGangInfo.power / (myGangInfo.power + gangInfo.power);
        totalPower += powerRatio; activeOpponents++;
      }
    }
    if (activeOpponents === 0) return 1;
    averageClashWinChance = totalPower/activeOpponents;
    return averageClashWinChance;
  }//-------------------------------------------------------------------------------

  async function engageInTerritoryWarfare(shouldToast = true) {
    // Logic to engage all members in territory warfare
    if (shouldToast) ns.toast("Engaging in territory warfare...", "success", 1000);
    let memberNames = await easyRun(ns, "gang/getMemberNames");
    ns.print(`Assigning gang members to Territory Warfare.`);
    for (const name of memberNames) {
      await easyRun(ns, "gang/setMemberTask", name, "Territory Warfare");
    }
  }

  // Helper function to determine if ascension is worth it
  async function shouldAscend(memberInfo) {
    const ascensionResult = await easyRun(ns, "gang/getAscensionResult", memberInfo.name);
    if (!ascensionResult) { ns.print(`No ascension possible for ${memberInfo.name}`); return false; }
    // filter out respect
    const cleanAscensionMultipliers = Object.entries(ascensionResult).filter(skillObj => skillObj[0] != "respect")
    const ascensionMultiplierKeys = Object.keys(ascensionResult).filter(skillObj => skillObj[0] != "respect")
    // get average multi
    const ascensionAverageMultiplier = cleanAscensionMultipliers.reduce((sum, keyVal) => {return sum + keyVal[1]}, 0) / ascensionMultiplierKeys.length;
    // Check if all stats are above the threshold
    const allStatsAboveThreshold = cleanAscensionMultipliers.every(keyVal => keyVal[1] >= ASCENSION_MULT);
    // check if average is sufficient
    const sufficientAverageMultiplier = ascensionAverageMultiplier >= ASCENSION_MULT;
    // final boolean
    const isBeneficial = allStatsAboveThreshold && sufficientAverageMultiplier;
    if (isBeneficial) { ns.print(`Average ascension multiplier increase for ${memberInfo.name}: ${ascensionAverageMultiplier.toFixed(2)}x`); }
    return isBeneficial;
  }//--------------------------------------------------------------------------------------

  // Helper function to assign tasks based on stats
  async function assignTask(memberInfo) {
    const stats = ["hack", "str", "def", "dex", "agi", "cha"];
    let myGangInfo = await easyRun(ns, "gang/getGangInformation");
  const tasks = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism"];

    let qualifiedTasks = [];
    for (const task of tasks) {
      await easyRun(ns, "gang/setMemberTask", memberInfo.name, task);
      const localMemberInfo = await easyRun(ns, "gang/getMemberInformation", memberInfo.name);
      if (localMemberInfo.respectGain > 0 || localMemberInfo.wantedLevelGain !== 0){ // if we CAN complete the task, we will be gaining SOME respect
        const respectWeight = localMemberInfo.respectGain - localMemberInfo.wantedLevelGain; // higher respectWeight -> better wantedPenalty trend
        qualifiedTasks.push({ task: task, profit: localMemberInfo.moneyGain, respectWeight: respectWeight });
      }
    }

    let nextRecruitRespect = await easyRun(ns, "gang/respectForNextRecruit");
    qualifiedTasks = qualifiedTasks.sort((a, b) => { // sort by respectWeight
        // only sort by profit if we got LOTS of respect
        if (nextRecruitRespect === null && myGangInfo.wantedPenalty > 0.99 && myGangInfo.respect > 50e6) {return b.profit - a.profit;}
        else {return b.respectWeight - a.respectWeight;}
      });

    qualifiedTasks = qualifiedTasks.map(taskObject => taskObject.task);  // Extract just the task

    if (qualifiedTasks.length > 0) {
      // choose the hardest task they can do
      const hardestTask = qualifiedTasks[0];
      await easyRun(ns, "gang/setMemberTask", memberInfo.name, hardestTask);
      ns.print(`Assigned ${memberInfo.name} to ${hardestTask}.`);
      return true;
    } else {
      ns.print(`${COLOR_YELLOW}Gang member unable to complete ANY task!?${COLOR_RESET}`)
      return false;
    }
  }//-------------------------------------------------------------------------------------

  // helper function, takes in object and properties to check
  function findMinProperty(obj, propertyList) {
    let minKey = propertyList[0];
    let minValue = obj[minKey];
    for (const key of propertyList) {
      if (obj[key] < minValue) { minValue = obj[key]; minKey = key; }
    }
    return minKey;
  }//------------------------------------------------------------------------------------

}
