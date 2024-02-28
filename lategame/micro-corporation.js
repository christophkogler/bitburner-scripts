import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("sleep");
  ns.disableLog("run");
  ns.atExit(() => {ns.run("corp-stop-script.js");});

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

  // HARD CONSTANTS
  
  const STORAGE_USED_BEFORE_UPGRADE = 0.85;

  const USEFUL_MATERIAL_STORAGE_RATIO = 0.75;

  const SPENDING_MODIFIER = .1;

  const INDUSTRY_NAMES = ["Agriculture", "Chemical", "Computer Hardware", "Fishing", "Healthcare", "Mining", "Pharmaceutical", "Real Estate", "Refinery", "Restaurant", "Robotics", "Software", "Spring Water", "Tobacco", "Water Utilities"]

  const MATERIALS = ["Water", "Food", "Plants", "Chemicals", "Ore", "Hardware", "Metal", "Robots", "AI Cores", "Drugs", "Minerals"];

  const MATERIAL_FACTORS = ["realEstateFactpr", "hardwareFactor", "robotFactor", "aiCoreFactor"];

  const UNLOCKS = ["Export", "Market Research - Demand", "Market Data - Competition", "VeChain", "Shady Accounting","Government Partnership"];

  const UPGRADES = ["Smart Factories", "Smart Storage", "DreamSense", "Wilson Analytics", "Nuoptimal Nootropic Injector Implants", "Speech Processor Implants", "Neural Accelerators", "FocusWires", "ABC SalesBots", "Project Insight"];

  const EMPLOYEE_POSITIONS = ["Operations", "Engineer", "Business", "Management", "Research & Development", "Intern"];

  const CITIES = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

  // SETUP
  // staging flags - assume stage one by default
  let STAGE1 = true; 
  let STAGE2 = false; let STAGE3 = false; let STAGE4 = false;

  const DEBUGFLAG = ns.args.includes('-d');

  // initialize and set SLEEP_TIMER based on bonus time
  let SLEEP_TIMER = 1000 * 9.1;
  async function relcalculateSleepTimer(){
    let remainingBonusTime = await easyRun(ns, "corporation/getBonusTime");
    if (remainingBonusTime > 1000){ SLEEP_TIMER = 910}
    else if (DEBUGFLAG) {SLEEP_TIMER = 29*1000}
    else {SLEEP_TIMER = 9.1 * 1000}
    return;
  }

  await relcalculateSleepTimer();

  async function synchronizeToCorpUpdates(){
    let corpData = await easyRun(ns, "corporation/getCorporation");
    // if called while ALREADY in 'synch cycle', wait until we exit it.
    while (corpData.prevState === "PRODUCTION"){
      await ns.sleep(100);
      corpData = await easyRun(ns, "corporation/getCorporation");
    }
    // wait until we reach the sync cycle
    while (corpData.prevState !== "PRODUCTION"){
      await ns.sleep(100);
      corpData = await easyRun(ns, "corporation/getCorporation");
    }
    await relcalculateSleepTimer(); 
  }

  async function getCorpFunds(){
    let corpData = await easyRun(ns, "corporation/getCorporation");
    return corpData.funds;
  }

  //  IF NO CORP, AND HAVE MONEY, MAKE CORP
  let hasCorporation = await easyRun(ns, "corporation/hasCorporation");
  let playerData = await easyRun(ns, "ns/getPlayer");
  if (!hasCorporation && playerData.money > 150000000000) {
    await easyRun(ns, "corporation/createCorporation", "Aphelion", true);
    ns.toast("Created new corporation: Aphelion!", "success", 5000);
    //await ns.sleep(5000);
  }

  let counter = 0;
  let corporationData = await easyRun(ns, "corporation/getCorporation");
  let corporationIncome = corporationData.revenue - corporationData.expenses;

  let investmentOffer = await easyRun(ns, "corporation/getInvestmentOffer");
  let investmentRound = investmentOffer.round;

  // these comparisons are only for initial run of the script, restarting into appropriate stage 
  if(corporationIncome >= 1000000000 || investmentRound >= 4){ // if we making BANK or 4 investment rounds deep, skip to stage 4
    STAGE1 = false;
    STAGE4 = true;
  } else if (investmentRound == 3){ // if we are on investment round 3...
    STAGE1 = false;
    STAGE3 = true;
  } else if (investmentRound == 2){ // if we are on investment round 2...
    STAGE1 = false;
    STAGE2 = true;
  }

  //ns.print(`STAGE1: ${STAGE1}, STAGE2: ${STAGE2}, STAGE3: ${STAGE3}, STAGE4:${STAGE4}`)
  //ns.tprint(`STAGE1: ${STAGE1}, STAGE2: ${STAGE2}, STAGE3: ${STAGE3}, STAGE4:${STAGE4}`)
  //await ns.sleep(5000);

  //  STAGE 1: Agriculture - 0-2m/s, funding round 0 -> 1
  if (STAGE1) {
  // agri div initialization logic
  const haveAgriDiv = (await easyRun(ns, "corporation/getCorporation")).divisions.includes("APH-Agri");
  
  let corpFunds;
  let divisionName = "APH-Agri";

  if (!haveAgriDiv){
    ns.toast("ENTERING CORPORATION DEVELOPMENT STAGE 1: AGRICULTURE!", "info", SLEEP_TIMER)
    //await ns.sleep(1000*10);


    // ------------------------------- initialization -----------------------------
    // Expand into Agriculture
    await easyRun(ns, "corporation/expandIndustry", "Agriculture", divisionName); 
    ns.toast("STAGE1: Expanded corporation into an Agriculture division!", "success", SLEEP_TIMER);
    ns.print("Expanded corporation into an Agriculture division!");
    // Setup in each city
    for (const city of CITIES) {
      // Expand division into city
      await easyRun(ns, "corporation/expandCity", divisionName, city);
      ns.print(`Expanded ${divisionName} into ${city}`);
      // Purchase and setup warehouse
      await easyRun(ns, "corporation/purchaseWarehouse", divisionName, city);
      await easyRun(ns, "corporation/upgradeWarehouse", divisionName, city, 5);
      corpFunds = await getCorpFunds();
      ns.print(`Purchased and upgraded warehouse, corp funds:${ns.formatNumber(corpFunds)}!`);
      // Hire employees and assign to Research & Development
      let officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
      let positionsToFill = officeData.size - officeData.numEmployees;
      for (let i = 0; i < positionsToFill; ++i) {
        await easyRun(ns, "corporation/hireEmployee", divisionName, city);
      }
      officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
      let numEmployees = officeData.numEmployees;
      await easyRun(ns, "corporation/setAutoJobAssignment", divisionName, city, "Research & Development", numEmployees);
    }
    ns.toast("STAGE1: Purchased and upgraded warehouses, and hired employees!", "success", SLEEP_TIMER);
    corpFunds = await getCorpFunds();
    ns.print(`Purchased and upgraded warehouses, corp funds:${ns.formatNumber(corpFunds)}!`);

    // Upgrade Smart Storage 
    for (let i = 0; i < 9; ++i) { await easyRun(ns, "corporation/levelUpgrade", "Smart Storage"); }
    ns.toast("STAGE1: Purchased Smart Storage!", "success", SLEEP_TIMER);
    corpFunds = await getCorpFunds();
    ns.print(`Purchased Smart Storage x9, corp funds:${ns.formatNumber(corpFunds)}!`); 
    for (let i = 0; i < 2; ++i) { await easyRun(ns, "corporation/hireAdVert", divisionName); }
    ns.toast("STAGE1: Purchased 2 AdVerts!", "success", SLEEP_TIMER);
    ns.print("Purchased 2 AdVerts!");
    // emnployee statuses...
    let notAllOfficesEnergized = true; let notAllOfficesHappy = true;
    ns.print("Buying tea and throwing parties.");
    while (notAllOfficesEnergized || notAllOfficesHappy) {
      notAllOfficesEnergized = false; notAllOfficesHappy = false;
      for (const city of CITIES) {
        let officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
        if (officeData.avgEnergy < 95) { notAllOfficesEnergized = true; await easyRun(ns, "corporation/buyTea", divisionName, city); }
        if (officeData.avgMorale < 95) { 
          notAllOfficesHappy = true; 
          let spendPerEmployee = 500000 * (Math.sqrt (Math.pow(officeData.avgMorale, 2) - 20 * officeData.avgMorale + 40 * officeData.maxMorale + 100) - officeData.avgMorale - 10);
          await easyRun(ns, "corporation/throwParty", divisionName, city, spendPerEmployee); 
        }
      }
      await relcalculateSleepTimer();
      await ns.sleep(SLEEP_TIMER);
    }
    ns.toast("STAGE1: Subdivisions energized and happy!", "success", SLEEP_TIMER);
    ns.print("Subdivisions energized and happy!");
    // Wait for more research points to accumulate
    let divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
    let researchTarget = 200;
    let notEnoughResearch = divisionData.researchPoints < researchTarget;
    while (notEnoughResearch) {
      ns.print(`Waiting for research points to accumulate: ${ns.formatNumber(divisionData.researchPoints, 1)} of ${researchTarget}`);
      await relcalculateSleepTimer();
      await ns.sleep(3*SLEEP_TIMER);
      divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
      notEnoughResearch = divisionData.researchPoints < researchTarget;
    }
    ns.toast("STAGE1: Accumulated 100 research points!", "success", SLEEP_TIMER);
    ns.print("Accumulated 100 research points!");
    // reassign employees
    for (const city of CITIES) { await easyRun(ns, "corporation/setAutoJobAssignment", divisionName, city, "Research & Development", 0); }
    //------------------------------- end initialization block --------------------------------------------
  }
  // stage 1 maintenance loop
    // main loop
    // purchaseUsefulItems() WILL send corp into debt
    let haveNotInvested = true;
    while(haveNotInvested){
      ns.toast("STAGE1: Waiting for sufficient investment offer!", "info", SLEEP_TIMER);
      ns.print(`\n${COLOR_CYAN}STAGE 1: Looping... ${counter++}`);
      ns.print("Waiting for investment!");
      let investmentOffer = await easyRun(ns, "corporation/getInvestmentOffer");
      corpFunds = await getCorpFunds();
      let postInvestmentFunds = corpFunds + investmentOffer.funds
      ns.print(`Investment offer: ${ns.formatNumber(investmentOffer.funds, 2)}, post-investment funds: ${ns.formatNumber(postInvestmentFunds, 2)}, investment round: ${investmentOffer.round}`);

      if(postInvestmentFunds >= 435e9){
        await easyRun(ns, "corporation/acceptInvestmentOffer");
        STAGE1 = false;
        STAGE2 = true;
        await cancelAllBuys();
        await cancelAllExports();
        await cancelAllSells();
        break;
      }

      await manageEmployees();
      await manageMaterials();
      await purchaseUsefulItems();
      await synchronizeToCorpUpdates();
    }

    ns.toast("STAGE1: Took investment offer! ", "success", 20*1000);
    corpFunds = await getCorpFunds();
    ns.print("Took investment offer! Corp funds: "+ corpFunds);

    // Buy 6 more adverts for a total of 8
    for (let i = 0; i < 6; ++i) { 
      await easyRun(ns, "corporation/hireAdVert", divisionName); 
      corpFunds = await getCorpFunds();
      ns.print(`Remaining funds after buying advert ${i+1}: ${ns.formatNumber(corpFunds, 2)}`)
    }

    // complete agriculture buildout, and set all emplyoees to R&D
    for (const city of CITIES){
      ns.print(`In City ${city}`)
      // upgrade warehouses
      await easyRun(ns, "corporation/upgradeWarehouse", divisionName, city, 9);
      let corpFunds = await getCorpFunds();
      ns.print(`  Remaining funds after warehouse upgrades: ${ns.formatNumber(corpFunds, 2)}`)

      // reset employees
      for (const position of EMPLOYEE_POSITIONS){ await easyRun(ns, "corporation/setAutoJobAssignment", divisionName, city, position, 0); }

      // Expand offices
      await easyRun(ns, "corporation/upgradeOfficeSize", divisionName, city, 3);
      corpFunds = await getCorpFunds();
      ns.print(`  Remaining funds after expanding office: ${ns.formatNumber(corpFunds, 2)}`)

      // Hire employees, and assign to Research & Development
      let officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
      let positionsToFill = officeData.size - officeData.numEmployees;
      for (let i = 0; i < positionsToFill; ++i) { await easyRun(ns, "corporation/hireEmployee", divisionName, city); }
      officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
      await easyRun(ns, "corporation/setAutoJobAssignment", divisionName, city, "Research & Development", officeData.numEmployees);
    }

    corpFunds = await getCorpFunds();
    ns.print(`Agriculture buildout completed! Moving into STAGE2 with ${ns.formatNumber(corpFunds, 2)}`);
  }// END STAGE 1 ---------------------------------------------------------------------
  
  
  
// STAGE 2: Chemical - 2.5m-3.5m, funding round 1->2
// using investment funds to grow profit
  if (STAGE2){
  // stage 2 initialization logic...
  let divisionName = "APH-Chem";
  const haveChemDiv = (await easyRun(ns, "corporation/getCorporation")).divisions.includes(divisionName);
  let corpFunds;
  if (!haveChemDiv){
    ns.toast("ENTERING CORPORATION DEVELOPMENT STAGE 2: CHEMICALS!", "info", 10000);

    // Expand into Chemical
    await easyRun(ns, "corporation/expandIndustry", "Chemical", divisionName);
    corpFunds = await getCorpFunds();
    ns.print(`Remaining funds after expanding into Chemical: ${ns.formatNumber(corpFunds, 2)}`)

    // corporation unlock: Export
    await easyRun(ns, "corporation/purchaseUnlock", "Export");
    corpFunds = await getCorpFunds();
    ns.print(`Remaining funds after unlocking Exports: ${ns.formatNumber(corpFunds, 2)}`)

    // Upgrade Smart Storage 
    for (let i = 0; i < 16; ++i) {
      await easyRun(ns, "corporation/levelUpgrade", "Smart Storage"); // bring smart storage to level 25
      await easyRun(ns, "corporation/levelUpgrade", "Smart Factories"); // bring smart factories to level 16
    }
    corpFunds = await getCorpFunds();
    ns.print(`Remaining funds after upgrading Smart Storage and Smart Factories: ${ns.formatNumber(corpFunds, 2)}`)

    // Setup in each city
    for (const city of CITIES) {
      // Expand division into city
      await easyRun(ns, "corporation/expandCity", divisionName, city);
      ns.print(`Expanded ${divisionName} into ${city}`);

      // Purchase and initial upgrade warehouse
      await easyRun(ns, "corporation/purchaseWarehouse", divisionName, city);
      await easyRun(ns, "corporation/upgradeWarehouse", divisionName, city, 2);
      
      corpFunds = await getCorpFunds();
      ns.print(`Remaining funds after purchasing & upgrading ${city} warehouse: ${ns.formatNumber(corpFunds, 2)}`)

      // Hire employees
      const officeData1 = await easyRun(ns, "corporation/getOffice", divisionName, city);
      //ns.print(`officeData1: ${JSON.stringify(officeData1)}`)
      let positionsToFill = officeData1.size - officeData1.numEmployees;
      for (let i = 0; i < positionsToFill; ++i) {
        await easyRun(ns, "corporation/hireEmployee", divisionName, city);
      }

      const officeData2 = await easyRun(ns, "corporation/getOffice", divisionName, city);
      //ns.print(`officeData2: ${JSON.stringify(officeData2)}`)
      let employeeCount = officeData2.numEmployees
      //ns.print("employeeCount: "+employeeCount)
      await easyRun(ns, "corporation/setAutoJobAssignment", divisionName, city, "Research & Development", officeData2.numEmployees);
    }

    // increase energy and morale
    let notAllOfficesEnergized = true; let notAllOfficesHappy = true;
    while (notAllOfficesEnergized || notAllOfficesHappy) {
      notAllOfficesEnergized = false; notAllOfficesHappy = false;
      let corpData = await easyRun(ns, "corporation/getCorporation");
      for (const city of CITIES) {
        let officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
        if (officeData.avgEnergy < 95) { notAllOfficesEnergized = true; await easyRun(ns, "corporation/buyTea", divisionName, city); }
        if (officeData.avgMorale < 95) { 
          notAllOfficesHappy = true; 
          let spendPerEmployee = 500000 * (Math.sqrt (Math.pow(officeData.avgMorale, 2) - 20 * officeData.avgMorale + 40 * officeData.maxMorale + 100) - officeData.avgMorale - 10);
          await easyRun(ns, "corporation/throwParty", divisionName, city, spendPerEmployee); 
        }
      }
      ns.print("Waiting for energy & morale..." + counter++) 
      await relcalculateSleepTimer();
      await ns.sleep(SLEEP_TIMER);
    }// energy and morale above 97%

    // wait for reserach to build up
    let agriData = await easyRun(ns, "corporation/getDivision", "APH-Agri");
    let notEnoughAgriResearch = agriData.researchPoints < 600;

    let chemData = await easyRun(ns, "corporation/getDivision", "APH-Chem");
    let notEnoughChemResearch = chemData.researchPoints < 400;
    while (notEnoughAgriResearch || notEnoughChemResearch){
      ns.print(`${COLOR_CYAN}Waiting for research points... ${counter++}${COLOR_RESET}`)
      agriData = await easyRun(ns, "corporation/getDivision", "APH-Agri");
      notEnoughAgriResearch = agriData.researchPoints < 600;

      chemData = await easyRun(ns, "corporation/getDivision", "APH-Chem");
      notEnoughChemResearch = chemData.researchPoints < 400;
      ns.print(`Agri research: ${ns.formatNumber(agriData.researchPoints,1)}, Chem research: ${ns.formatNumber(chemData.researchPoints,1)}`);
      await relcalculateSleepTimer();
      await ns.sleep(3*SLEEP_TIMER);
    }// sufficient research; return to normal operations

    // reassign employees
    for (const city of CITIES){
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Agri", city, "Research & Development", 0);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Agri", city, "Operations", 2);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Agri", city, "Engineer", 1);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Agri", city, "Business", 2);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Agri", city, "Management", 1);

      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Chem", city, "Research & Development", 0);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Chem", city, "Operations", 1);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Chem", city, "Engineer", 1);
      await easyRun(ns, "corporation/setAutoJobAssignment", "APH-Chem", city, "Business", 1);
    }
  }
  // stage 2 maintenance loop
    //  while (have not taken investment offer)
    //  probably go into debt on this stage, too
    let haveNotInvested = true;
    while(haveNotInvested){
      ns.print(`\n${COLOR_CYAN}STAGE 2: Looping... ${counter++}`);
      await manageEmployees();
      await manageMaterials();
      await purchaseUsefulItems();
      let investmentOffer = await easyRun(ns, "corporation/getInvestmentOffer");
      let bitnodeMultis = await easyRun(ns, "ns/getBitNodeMultipliers");
      let corpValuationModifier = bitnodeMultis.CorporationValuation;
      if (!(corpValuationModifier)) corpValuationModifier = 1;
      let modifiedInvestmentTarget = 9e12*corpValuationModifier;
      modifiedInvestmentTarget = Math.max(modifiedInvestmentTarget, 3e12); // AT LEAST 3 trillion (need money for buildout)
      ns.print(`Investment offer: ${ns.formatNumber(investmentOffer.funds, 2)}, investment target: ${ns.formatNumber(modifiedInvestmentTarget, 2)}, investment round: ${investmentOffer.round}`);

      // tobacco buildout is expensive, but only a few trillion. (may run into issues in some BNs with exceptionally low evaluations?)
      if(investmentOffer.funds >= modifiedInvestmentTarget){
        await easyRun(ns, "corporation/acceptInvestmentOffer");
        haveNotInvested = false;
        STAGE2 = false;
        STAGE3 = true;
        await cancelAllBuys();
        await cancelAllExports();
        await cancelAllSells();
      }
      await synchronizeToCorpUpdates();
    }
    ns.toast("STAGE2: Investment taken! Moving to STAGE3!", "success", SLEEP_TIMER);
    corpFunds = await getCorpFunds();
    ns.print("Moving to STAGE3! Corp funds: " + ns.formatNumber(corpFunds,2));
  }// END STAGE 2 ---------------------------------------------------------------------
  
  
    
// STAGE THREE: BUILD Tobacco
  let corpFunds = await getCorpFunds();
  let immediatelyPostInvestment = corpFunds > 3e12
  if(STAGE3 && immediatelyPostInvestment){
    ns.toast("ENTERING CORPORATION DEVELOPMENT STAGE 3: TOBACCO!", "info", 10000)
    //await ns.sleep(1000*10);
    let divisionName = "APH-Tobacco";
    let productName = "SmokEmsV1"

    // Expand into Tobacco
    await easyRun(ns, "corporation/expandIndustry", "Tobacco", divisionName);

    // Setup in each city
    for (const city of CITIES) {
      // Expand division into city
      await easyRun(ns, "corporation/expandCity", divisionName, city);
      ns.print(`Expanded ${divisionName} into ${city}`);

      // Purchase and setup warehouse
      await easyRun(ns, "corporation/purchaseWarehouse", divisionName, city);

      // Expand the offices
      await easyRun(ns, "corporation/upgradeOfficeSize", divisionName, city, 30);
      
      // Hire employees
      let officeData = await easyRun(ns, "corporation/getOffice", divisionName, city);
      let positionsToFill = officeData.size - officeData.numEmployees;
      for (let i = 0; i < positionsToFill; ++i) {
        await easyRun(ns, "corporation/hireEmployee", divisionName, city);
      }
    }

    await manageEmployees();

    let notAllOfficesEnergized = true;
    let notAllOfficesHappy = true;
    let corpData = await easyRun(ns, "corporation/getCorporation");

    //  increase morale & energy
    while (notAllOfficesEnergized || notAllOfficesHappy) {
      notAllOfficesEnergized = false; notAllOfficesHappy = false;

      let corpData = await easyRun(ns, "corporation/getCorporation");
      for(const division of corpData.divisions){
        for (const city of CITIES) {
          let officeData = await easyRun(ns, "corporation/getOffice", division, city);

          // Check and improve energy
          if (officeData.avgEnergy < 95) {
            notAllOfficesEnergized = true;
            ns.print("Low energy in " + division + "-" + city + ", buying tea.");
            let purchasedTea = await easyRun(ns, "corporation/buyTea", division, city);
            if (purchasedTea) { ns.print("Successfully purchased tea."); }
            else { ns.print(COLOR_YELLOW + "Too poor for tea time." + COLOR_RESET); }
          }
          // Check and improve morale
          if (officeData.avgMorale < 95) {
            notAllOfficesHappy = true;
            ns.print("Low morale in " + division + "-" + city + ", throwing party.");
            let spendPerEmployee = 500000 * (Math.sqrt (Math.pow(officeData.avgMorale, 2) - 20 * officeData.avgMorale + 40 * officeData.maxMorale + 100) - officeData.avgMorale - 10);
            let moraleImprovement = await easyRun(ns, "corporation/throwParty", division, city, spendPerEmployee);
            ns.print("Morale increased by " + moraleImprovement.toFixed(2) + "%");
          }
        }
      }
      // Wait before the next iteration
      await relcalculateSleepTimer();
      await ns.sleep(SLEEP_TIMER);
    }

    // create an initial product
    await easyRun(ns, "corporation/makeProduct", divisionName, "Sector-12", productName, 1e9, 1e9);
    
    //  purchase as many 'wilson analytics' as possible
    corpData = await easyRun(ns, "corporation/getCorporation");
    let corpFunds = corpData.funds;
    let wilsonPrice = await easyRun(ns, "corporation/getUpgradeLevelCost", "Wilson Analytics");
    while (corpFunds > wilsonPrice){
      await easyRun(ns, "corporation/levelUpgrade", "Wilson Analytics");
      corpFunds -= wilsonPrice
      wilsonPrice = await easyRun(ns, "corporation/getUpgradeLevelCost", "Wilson Analytics");
      await ns.sleep(25);
    }
    // one dreamsense, to ensure numbers WILL go up (eventually)
    await easyRun(ns, "corporation/levelUpgrade", "DreamSense");

    // waste some money on unlockables
    await getUnlockables();

    await advertDivisions();

    ns.toast("STAGE3: Tobacco buildout complete! Moving to STAGE4: Infinite growth!", "success", 5*SLEEP_TIMER);
    corpFunds = await getCorpFunds();
    ns.print("Moving to STAGE4! Corp funds: " + corpFunds);
    STAGE3 = false;
    STAGE4 = true;

  } else if (STAGE3){STAGE3 = false; STAGE4 = true; }
  // END STAGE 3 ---------------------------------------------------------------------


// STAGE FOUR: TO INFINITY!
//  if we get here, we should have enough profit (>1b/s) OR a completed three-division buildout, so we can spend without worry!
//  (functions have targeted ratios to encourage spending in the right places first)
  ns.toast("ENTERING CORPORATION STAGE 4: INFINITE GROWTH!", "info", 10000)
  ns.print("ENTERING CORPORATION STAGE 4: INFINITE GROWTH!")
  await ns.sleep(1000*10);
  while (STAGE4) {
    
    ns.print("\n\n\n\n");
        
    ns.print(`${COLOR_CYAN}Managing products...${COLOR_RESET}`);
    await manageProducts();

    ns.print(`${COLOR_CYAN}Advertising divisions...${COLOR_RESET}`);
    await advertDivisions();

    ns.print(`${COLOR_CYAN}Upgrading corporation...${COLOR_RESET}`);
    await upgragradeCorporation();
    
    ns.print(`${COLOR_CYAN}Managing materials...${COLOR_RESET}`);
    await manageMaterials();

    ns.print(`${COLOR_CYAN}Expanding divisions...${COLOR_RESET}`);
    await expandDivisions(); 
    
    ns.print(`${COLOR_CYAN}Purchasing any needed warehouses...${COLOR_RESET}`);
    await purchaseDivisionWarehouses();

    ns.print(`${COLOR_CYAN}Upgrading storages...${COLOR_RESET}`);
    await upgradeStorage();

    ns.print(`${COLOR_CYAN}Upgrading subdivisions...${COLOR_RESET}`);
    await upgradeSubdivisions();

    ns.print(`${COLOR_CYAN}Manging employees...${COLOR_RESET}`);
    await manageEmployees();

    ns.print(`${COLOR_CYAN}Purchasing useful items...${COLOR_RESET}`);
    await purchaseUsefulItems();

    ns.print(`${COLOR_CYAN}Handling research upgrades...${COLOR_RESET}`);
    await unlockResearch();

    //Round 3 & 4 investment handling.
    let investmentOffer = await easyRun(ns, "corporation/getInvestmentOffer");
    if (investmentOffer !== undefined && investmentOffer !== null){
      let bitnodeMultis = await easyRun(ns, "ns/getBitNodeMultipliers");
      let corpValuationModifier = bitnodeMultis.CorporationValuation;
      if (!(corpValuationModifier)) corpValuationModifier = 1;
      let investmentRound = investmentOffer.round;
      let investmentGoal;

      if (investmentRound === 3){
        let baseRound3Investment = 1e15; // 1 quad
        let round3InvestmentGoal = baseRound3Investment * corpValuationModifier;
        investmentGoal = round3InvestmentGoal;
        if(investmentOffer.funds >= round3InvestmentGoal){
          await easyRun(ns, "corporation/acceptInvestmentOffer");
        }
      }
      if(investmentRound === 4){
        let baseRound4Investment = 1e18; // 1 Quint
        let round4InvestmentGoal = baseRound4Investment * corpValuationModifier;
        investmentGoal = round4InvestmentGoal;
        if(investmentOffer.funds >= round4InvestmentGoal){
          await easyRun(ns, "corporation/acceptInvestmentOffer");
          await easyRun(ns, "corporation/goPublic", 0);
          await easyRun(ns, "corporation/issueDividends", 0.01);
        }
      }
      ns.print(`  Investment offer: ${ns.formatNumber(investmentOffer.funds,2)}, goal: ${ns.formatNumber(investmentGoal,2)}`)
    }
    
    await profitReport(); // display a report on corp
    await relcalculateSleepTimer();
    await synchronizeToCorpUpdates();
    
  } // ---------------------------------- END OF WHILE -----------------------------------



  async function profitReport(){
    // a counter, and profit report
    ns.print(COLOR_CYAN + "Looping away the day...           " + counter++ + COLOR_RESET);
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationProfit = corporationData.revenue - corporationData.expenses;
    let profitSign = corporationProfit>0 ? (COLOR_RESET + COLOR_GREEN + "+"):(COLOR_RESET + COLOR_RED + "");
    ns.print(`${COLOR_CYAN}Company funds: ${"$"}${ns.formatNumber(corporationData.funds, 2)} (${profitSign}${ns.formatNumber(corporationProfit,2)}/s${COLOR_RESET}${COLOR_CYAN})${COLOR_RESET}`);
    if (corporationProfit > 0) { ns.toast("Corporation profit: "+ns.formatNumber(corporationProfit, 2), "success", SLEEP_TIMER) }
    else { ns.toast("Corporation profit: "+ns.formatNumber(corporationProfit,2), "warning", SLEEP_TIMER) }
  }


  async function unlockResearch(){
    const corporationData = await easyRun(ns, "corporation/getCorporation");
    const corporationDivisions = corporationData.divisions;

    const RESEARCH_UPGRADES = 
      ["Hi-Tech R&D Laboratory",            // 0
        "AutoBrew",                         // 1
        "AutoPartyManager",                 // 2
        "Automatic Drug Administration",    // 3
          "CPH4 Injections",                // 4
          "Go-Juice",                       // 5
        "Drones",                           // 6
          "Drones - Assembly",              // 7
          "Drones - Transport",             // 8
        "Market-TA.I",                      // 9
          "Market-TA.II",                   // 10
        "Overclock",                        // 11
          "Sti.mu",                         // 12
        "Self-Correcting Assemblers"]       // 13

    const PRODUCT_RESERACH_UPGRADES = [
      "uPgrade: Fulcrum",           // 0
        "uPgrade: Capacity.I",      // 1
          "uPgrade: Capacity.II",   // 2
        "uPgrade: Dashboard"];      // 3

    async function unlockResearchUpgrade(division, upgradeName){
      const haveUpgrade = await easyRun(ns, "corporation/hasResearched", division.name, upgradeName);
      if (haveUpgrade) return [true, division];
      const divisionResearch = division.researchPoints;
      const upgradeCost = await easyRun(ns, "corporation/getResearchCost", division.name, upgradeName);
      if (upgradeCost < divisionResearch/2) { 
        ns.print(`  Unlocking ${upgradeName} for ${division.name}`)
        await easyRun(ns, "corporation/research", division.name, upgradeName);
        division = await easyRun(ns, "corporation/getDivision", division.name);
        return [true, division]; 
      } else { return [false, division]; }
    }

    for( const divisionName of corporationDivisions){
      let divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
      let haveRnDLab; [haveRnDLab, divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[0]);
      if (haveRnDLab){
        let _;
        [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[1]);
        [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[2]);
        let haveAutoDrugAdmin; [haveAutoDrugAdmin, divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[3]);
        if (haveAutoDrugAdmin){
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[4]);
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[5]);
        }
        let haveDrones; [haveDrones, divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[6]);
        if (haveDrones){
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[7]);
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[8]);
        }
        let haveTAI; [haveTAI, divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[9]);
        if (haveTAI){ 
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[10]);
        }
        let haveOverclock; [haveOverclock, divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[11]);
        if (haveOverclock){ 
          [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[12]);
        }
        [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[13]);
        [_,divisionData] = await unlockResearchUpgrade(divisionData, RESEARCH_UPGRADES[11]);

        if (divisionData.makesProducts){
          let haveFulcrum; [haveFulcrum, divisionData]  = await unlockResearchUpgrade(divisionData, PRODUCT_RESERACH_UPGRADES[0]);
          if (haveFulcrum){
            let haveCapacityI; [haveCapacityI,divisionData] = await unlockResearchUpgrade(divisionData, PRODUCT_RESERACH_UPGRADES[1]);
            if (haveCapacityI){
              [_,divisionData] = await unlockResearchUpgrade(divisionData, PRODUCT_RESERACH_UPGRADES[2]);
            }
            [_,divisionData] = await unlockResearchUpgrade(divisionData, PRODUCT_RESERACH_UPGRADES[3]);
          }
        }
      }
      
      // ELSE
        // 
    }
    

  }
    



  async function expandDivisions() {
    let corpData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corpData.divisions;
    //ns.print("expandDivisions corporationDivisions:" + corporationDivisions);
    for (let divisionName of corporationDivisions) {
      let divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
      //ns.print("Checking if we can expand division " + divisionName +"...")
      for (let city of CITIES) {
        // Check if the division is not in the city and if expansion is affordable
        if (!divisionData.cities.includes(city) && await corpData.funds >= 4000000000) {
          try { 
            await easyRun(ns, "corporation/expandCity", divisionName, city);
            ns.print(`Expanded ${divisionName} into ${city}.`);
            purchaseDivisionWarehouses(divisionName);
          } catch (error) {
            ns.print(`Error expanding ${divisionName} into ${city}: ${error}`);
          }
        }
      }
    }
  }//------------------------------------------------------------------------



  async function purchaseDivisionWarehouses() {
    let corpData = await easyRun(ns, "corporation/getCorporation");
    
    let corporationDivisions = corpData.divisions;

    for (let divisionName of corporationDivisions) {
      let divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
      let divisionCites = divisionData.cities
      for (let city of divisionCites) {
        let warehouseInSubdiv = await easyRun(ns, "corporation/hasWarehouse", divisionData.name, city);
        if (!warehouseInSubdiv && corpData.funds >= 5000000000) {
          try {  
            await easyRun(ns, "corporation/purchaseWarehouse", divisionData.name, city);
            ns.print(`Purchased warehouse for ${divisionName} in ${city}.`);
          } catch (error) {
            ns.print(`Error purchasing warehouse for ${divisionName} in ${city}: ${error}`);
          }
        }
      }
    }
  }//------------------------------------------------------------------------



  async function upgragradeCorporation(){
    await getUnlockables();
    await getUpgradables();
    return;
  } //------------------------------------------------------------------------
  async function getUnlockables(){
    let availableFunds = await getCorpFunds();

    // Purchase one-time unlocks if affordable
    for (let unlockable of UNLOCKS) {
      let unlockCost = await easyRun(ns, "corporation/getUnlockCost", unlockable);
      let dontHaveUnlock = !(await easyRun(ns, "corporation/hasUnlock", unlockable));
      if (availableFunds/10 >= unlockCost && dontHaveUnlock) {
        ns.print("Purchasing unlock: " + unlockable);
        await easyRun(ns, "corporation/purchaseUnlock", unlockable).catch((error) => ns.print(error));
        availableFunds -= unlockCost; // Update available funds
        ns.print("Purchased " + unlockable + "!");
        ns.toast("Purchased " + unlockable + "!", "success", SLEEP_TIMER/4);
      }
    }
  }//------------------------------------------------------------------------
  async function getUpgradables(){
    let availableFunds = await getCorpFunds();

    async function getLeastExpensiveUpgrade(){
      let lowestPrice = 999e99;
      for (let upgradable of UPGRADES) {
        let upgradeCost = await easyRun(ns, "corporation/getUpgradeLevelCost", upgradable);
        if (upgradeCost < lowestPrice) lowestPrice = upgradeCost;
      }
      return lowestPrice;
    }

    // Purchase repeatable upgrades if affordable
    let lowestUpgradeCost = await getLeastExpensiveUpgrade();
    let counter = 0;
    while (availableFunds/10 >= lowestUpgradeCost) {
      if ((counter++)%10===0) await ns.sleep(1);
      for (let upgradable of UPGRADES) {
        let upgradeCost = await easyRun(ns, "corporation/getUpgradeLevelCost", upgradable);
        if (availableFunds/10 >= upgradeCost) {
          //ns.print("  Upgrading " + upgradable + "!");
          //ns.toast("  Upgrading " + upgradable + "!", "success", SLEEP_TIMER/4);
          await easyRun(ns, "corporation/levelUpgrade", upgradable);
          availableFunds -= upgradeCost; // Update available funds
        }
      }
      lowestUpgradeCost = await getLeastExpensiveUpgrade();
    }
  }//---------------------------------------------------------------------------



  async function cancelAllBuys(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corporationData.divisions;
    for (let division of corporationDivisions) {// cancel buys
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let divisionCities = divisionData.cities;
      for (let city of divisionCities) {
        let subdivisionHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", division, city);
        if (!subdivisionHasWarehouse) continue;
        for (let material of MATERIALS) {
          // Cancel buy orders
          if (DEBUGFLAG) ns.print("Canceling buy of " + material + " in " + division + " - " + city);
          await easyRun(ns, "corporation/buyMaterial", division, city, material, 0);
        }
        await easyRun(ns, "corporation/buyMaterial", division, city, "Real Estate", 0);
    } }
    return;
  }
  async function cancelAllExports(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corporationData.divisions;
    for (let division of corporationDivisions) { // cancel sells
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let divisionCities = divisionData.cities;
      for (let city of divisionCities) {
        let subdivisionHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", division, city);
        if (!subdivisionHasWarehouse) continue;
        for (let material of MATERIALS) {
          // Cancel buy orders
          if (DEBUGFLAG) ns.print("Canceling sell of " + material + " in " + division + " - " + city);
          await easyRun(ns, "corporation/sellMaterial", division, city, material, 0, 0);
    } } }
    return;
  }
  async function cancelAllSells(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corporationData.divisions;
    for (let division of corporationDivisions){ // cancel exports
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let divisionCities = divisionData.cities;
      let divisionType = divisionData.type;
      for (let city of divisionCities) {
        let subdivisionHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", division, city)
        if (!subdivisionHasWarehouse) continue; // skip if subdiv doesnt have a warehouse
        for (let material of MATERIALS) {
          await easyRun(ns, "corporation/buyMaterial", division, city, material, 0);
          for (let division2 of corporationDivisions){
            let division2Data = await easyRun(ns, "corporation/getDivision", division2);
            let division2Cities = division2Data.cities;
            for (let city2 of division2Cities) {            
              if (DEBUGFLAG) ns.print("Attempting to cancel export of "+material+" from "+division+" - "+city+" to "+division2+" - "+city2);
              await easyRun(ns, "corporation/cancelExportMaterial", division, city, division2, city2, material);
    } } } } }
    return;
  }



  async function manageMaterials(profitSearch = false) {
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corporationData.divisions;

    await cancelAllBuys();
    await cancelAllExports();
    await cancelAllSells();

    //ns.print("Creating supplyAndDemand object...");
    
    let supplyAndDemand = {}; // Initialize demand tracking object
    // Calculate production amounts and populate object
    for (let division of corporationDivisions) {
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let divisionType = divisionData.type;
      let industryData = await easyRun(ns, "corporation/getIndustryData", divisionType);
      supplyAndDemand[division] = supplyAndDemand[division] || {};
      for (let city of divisionData.cities) {
        // check if the subdivision even HAS a warehouse before proceeding further
        let subdivisionHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", division, city);
        if (!subdivisionHasWarehouse) continue; 

        supplyAndDemand[division][city] = supplyAndDemand[division][city] || {};
        for (let material of MATERIALS) {
          // if subdivision produces any materials, does it produce the specific one we are on?
          let divisionProducesMaterial = false;
          if (industryData.producedMaterials && industryData.producedMaterials.length > 0) divisionProducesMaterial = industryData.producedMaterials.includes(material);

          let materialData = await easyRun(ns, "corporation/getMaterial", divisionData.name, city, material);
          // IF subdivision produces specific material we are processing, provide production OR storage amount - whatever is larger. 
          // this ensures full warehouses and stopped production DOESNT prevent exports from producers. if it does NOT produce the material, it will provide it's demand, or 0 if no demand.

          let productionAmount = materialData.productionAmount;
          // if the division demands the material
          if (productionAmount < 0 && !divisionProducesMaterial) { 
            //ns.print(`Demand for ${material} in ${division} - ${city}: ${ns.formatNumber(productionAmount,1)}`);
            supplyAndDemand[division][city][material] = productionAmount; 
            continue; 
          }

          // if the division doesnt produce AND doesnt demand or supply the material
          if (productionAmount === 0 && !divisionProducesMaterial) { 
            supplyAndDemand[division][city][material] = 0; 
            continue; 
          }

          // if the division produces the material
          if (divisionProducesMaterial){
            let storedAmount = materialData.stored/10;
            let providableAmount = Math.max(productionAmount, storedAmount);
            //ns.print(`${division} - ${city} provides: ${ns.formatNumber(providableAmount,1)}, Produces: ${ns.formatNumber(productionAmount,1)}, Stored: ${ns.formatNumber(storedAmount,1)}, `);
            
            if (providableAmount > 1 && DEBUGFLAG) { ns.print(`${division} - ${city} providing ${material}: ${providableAmount.toFixed(2)}`); }
            
            supplyAndDemand[division][city][material] = providableAmount;
          }
        } 
      } 
    }

    // add a print of sum of productionAmounts for each material
    let totalProduction = {};
    MATERIALS.forEach(material => {
      totalProduction[material] = 0;
      for (let divisionName in supplyAndDemand) {
        for (let city in supplyAndDemand[divisionName]) {
          totalProduction[material] += supplyAndDemand[divisionName][city][material];
        }
      }
      if (totalProduction[material] !== 0) ns.print(`  Total production of ${material}: ${ns.formatNumber(totalProduction[material],2)}`);
    });

    let exportOrders = {}; // Initialize export orders object

    //ns.print("Calculating necessary exports...");

    let usedCombinations = new Set(); // Set to track used combinations
    // Calculate necessary exports to balance negative production
    for (let targetDivision in supplyAndDemand) {
      for (let targetCity in supplyAndDemand[targetDivision]) {
        materialLoop: for (let material of MATERIALS) {
          // for all materials, cities, divisions
          let amountNeeded = -supplyAndDemand[targetDivision][targetCity][material];
          if (amountNeeded > 0) {// If there is a demand in the target city

            // first, try to fullfill from the same city, different division
            for (let sourceDivision in supplyAndDemand){
              let availableSupplyInSameCity = supplyAndDemand[sourceDivision][targetCity][material];
              if (availableSupplyInSameCity > 0) {
                let exportAmount = Math.min(amountNeeded, availableSupplyInSameCity);
                // Create or update export order within the same city
                exportOrders[sourceDivision] = exportOrders[sourceDivision] || {};
                exportOrders[sourceDivision][targetCity] = exportOrders[sourceDivision][targetCity] || {};
                exportOrders[sourceDivision][targetCity][material] = exportOrders[sourceDivision][targetCity][material] || [];
                exportOrders[sourceDivision][targetCity][material].push([targetDivision, targetCity, exportAmount]);
                // Update the remaining demand and available supply
                amountNeeded -= exportAmount;
                supplyAndDemand[sourceDivision][targetCity][material] -= exportAmount;
                //ns.print(`Planning intra-city export from ${sourceDivision} to ${targetDivision} within ${targetCity} of ${ns.formatNumber(exportAmount,1)} ${material}!`);
                usedCombinations.add(`${sourceDivision}-${targetCity}-${material}`); // Add to used combinations
                if (amountNeeded <= 0) continue; // if demand fulfilled, move to next material
              }
            }

            if (amountNeeded <= 0) continue; // if demand fulfilled, move to next material
            
            for (let sourceDivision in supplyAndDemand) { 
              if (amountNeeded <= 0) continue;
              for (let sourceCity in supplyAndDemand[sourceDivision]) { 
                if (amountNeeded <= 0 || usedCombinations.has(`${sourceDivision}-${targetCity}-${material}`)) continue; // Skip used combinations
                let availableSupply = supplyAndDemand[sourceDivision][sourceCity][material];
                if (availableSupply > 0) {// If there is a supply in the source city and still a demand
                  let exportAmount = Math.min(amountNeeded, availableSupply);
                  // Create or update export order
                  exportOrders[sourceDivision] = exportOrders[sourceDivision] || {};
                  exportOrders[sourceDivision][sourceCity] = exportOrders[sourceDivision][sourceCity] || {};
                  exportOrders[sourceDivision][sourceCity][material] = exportOrders[sourceDivision][sourceCity][material] || [];
                  exportOrders[sourceDivision][sourceCity][material].push([targetDivision, targetCity, exportAmount]);
                  // Update the remaining demand and available supply
                  amountNeeded -= exportAmount;
                  supplyAndDemand[sourceDivision][sourceCity][material] -= exportAmount;
                  //ns.print(`Planning inter-city export from ${sourceDivision}-${sourceCity} to ${targetDivision}-${targetCity} of ${ns.formatNumber(exportAmount,1)} ${material}!`)
                  if (amountNeeded <= 0) continue; // move to next material if we have covered need
                }
              }
            }
          }
        }
      }
    }

    // Process all export orders
    for (let sourceDivision in exportOrders) {
      for (let sourceCity in exportOrders[sourceDivision]) {
        for (let material in exportOrders[sourceDivision][sourceCity]) {
          for (let order of exportOrders[sourceDivision][sourceCity][material]) {
            let [targetDivision, targetCity, amount] = order;
            try { 
              //ns.print(`Exporting ${ns.formatNumber(amount,1)} of ${material} from ${sourceDivision} - ${sourceCity} to ${targetDivision} ${targetCity}.`);
              await easyRun(ns, "corporation/exportMaterial", sourceDivision, sourceCity, targetDivision, targetCity, material, amount);
              //supplyAndDemand[sourceDivision][sourceCity][material] -= amount; // adjust supplyAndDemand to ensure we dont sell material we want to export
            } catch (error) { 
              ns.print(`Error processing export: ${error.message}`); 
            }
          }
        }
      }
    }

    // Sell remaining surplus materials and adjust prices
    for (let divisionName in supplyAndDemand) {
      for (let city in supplyAndDemand[divisionName]) {
        for (let material in supplyAndDemand[divisionName][city]) {
          let surplus = supplyAndDemand[divisionName][city][material];
          if (surplus > 0) {
            if (profitSearch){
              let materialData = await easyRun(ns, "corporation/getMaterial", divisionName, city, material);
              let currentPriceMultiplier = parseMultiplier(materialData.sellPrice);
              let sellAmount = materialData.actualSellAmount;
              // Adjust price based on surplus and sell amount
              if (sellAmount < surplus) {
                currentPriceMultiplier *= 0.995; // Decrease price
              } else if (sellAmount >= surplus*1.1) {
                currentPriceMultiplier *= 1.001; // Increase price
              }

              try {
                await easyRun(ns, "corporation/sellMaterial", divisionName, city, material, surplus.toString(), `MP*${currentPriceMultiplier}`);
                ns.print(`Selling ${material} in ${divisionName} at ${city}. MP*${ns.formatNumber(currentPriceMultiplier,3)}`);
              } catch (error) {
                if (DEBUGFLAG) ns.print(`Error adjusting sell price for surplus material: ${error.message}`);
              }
            } else {
              if(material === "Food"){
                try {
                  await easyRun(ns, "corporation/sellMaterial", divisionName, city, material, surplus.toString(), "MP");
                  //ns.print(`Selling ${material} in ${divisionName} at ${city}.`);
                } catch (error) { if (DEBUGFLAG) ns.print(`Error adjusting sell price for surplus material: ${error.message}`); }
              }else {
                try {
                  await easyRun(ns, "corporation/sellMaterial", divisionName, city, material, surplus.toString(), "MP");
                  //ns.print(`Selling ${material} in ${divisionName} at ${city}.`);
                } catch (error) {
                  if (DEBUGFLAG) ns.print(`Error adjusting sell price for surplus material: ${error.message}`);
                }
              }
            }
          }
        } 
      }
    }
 
    // Purchase any required materials
    for (let divisionName in supplyAndDemand) {
      // if corporation has smart supply, flag
      let divisionData = await easyRun(ns, "corporation/getDivision", divisionName);
      let divisionType = divisionData.type;
      let industryData = await easyRun(ns, "corporation/getIndustryData", divisionType);
      let requiredMaterials = industryData.requiredMaterials;
      for (let city in supplyAndDemand[divisionName]) {
        // if smart supply flag, enable smart supply with leftovers, and continue to next city
        for (let material in supplyAndDemand[divisionName][city]) {
          // check if the industry needs the material
          let industryRequiresMaterial = false;
          if (requiredMaterials[material] !== undefined) { industryRequiresMaterial = true; }
          if (!industryRequiresMaterial) { continue; }

          let materialData = await easyRun(ns, "corporation/getMaterial", divisionName, city, material);
          let materialProduction = -materialData.productionAmount;
          let materialImports = -materialData.exports;
          //if (!STAGE1) ns.print(`materialData.exports: ${materialData.exports}`);
          let materialStored = materialData.stored;

          let productionMultScalar = (divisionData.productionMult * 1)/50;

          let purchaseAmount = materialProduction - (materialImports/10) - (materialStored/10);
          let flatAdditional = ((materialProduction - (materialImports/10)) < 5) ? 1 : 0; // break perfect production-import stalemates

          let minimalMaterialBeingUsed = materialProduction < 10;
          let minimalMaterialStored = materialStored <= 5;

          // if none in storage and none being used, kickstart production
          if (minimalMaterialBeingUsed && minimalMaterialStored){
            //ns.print(`${divisionName} - ${city} - ${material}: low storage and no purchases - initialization buy.`);
            purchaseAmount = materialProduction - (materialImports/10) - (materialStored/10) + productionMultScalar;
            purchaseAmount += flatAdditional;
            await easyRun(ns, "corporation/buyMaterial", divisionName, city, material, purchaseAmount);
            continue;
          }

          let significantMaterialsStored = materialStored >= Math.abs(11 * materialProduction);

          if (significantMaterialsStored){
            purchaseAmount = materialProduction - (materialImports/10) - (materialStored/10);
            purchaseAmount += flatAdditional;
            //ns.print(`${divisionName} - ${city} - ${material}: buying continuous, ${ns.formatNumber(purchaseAmount, 2)}`);
            await easyRun(ns, "corporation/buyMaterial", divisionName, city, material, purchaseAmount);
            continue;
          }
          
          // otherwise, scale up purchase amount
          purchaseAmount = materialProduction*1.2 - (materialImports/10) - (materialStored/10) + productionMultScalar;
          purchaseAmount += flatAdditional;
          //ns.print(`${divisionName} - ${city} - ${material}: buying ${ns.formatNumber(purchaseAmount, 2)}`);
          await easyRun(ns, "corporation/buyMaterial", divisionName, city, material, purchaseAmount);
        }
      }
    }

    // Helper function to parse the current price multiplier
    function parseMultiplier(priceString) {
      let parts;
      try{ parts = priceString.split("*") } 
      catch { return 1; }
      return parts.length === 2 ? parseFloat(parts[1]) : 1;
    }
    
    return;
  }//------------------------------------------------------------------------



  //  see if any locations in any divisions need a storage upgrade.
  async function upgradeStorage(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationFunds = corporationData.funds;
    let spendingMoney = corporationFunds * SPENDING_MODIFIER;
    let approximateUpgradeCost = 0;
    //do{
      // collect viable-upgrade array:
        //  across all divisions and cities
          //  record

      for (let division of corporationData.divisions){
        //ns.print("Checking for upgrabilitity in " + division);
        let divisionData = await easyRun(ns, "corporation/getDivision", division);
        for (let city of divisionData.cities) {
          //ns.print("Checking for upgrabilitity in " + city);
          let subdivisionsHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", divisionData.name, city);
          if (subdivisionsHasWarehouse){
            //ns.print("Subdiv has warehouse.");
            let warehouseData = await easyRun(ns, "corporation/getWarehouse", divisionData.name, city);
            //ns.print("warehouseData: " + warehouseData);
            let warehouseUpgradeCost = await easyRun(ns, "corporation/getUpgradeWarehouseCost", divisionData.name, city);
            approximateUpgradeCost = warehouseUpgradeCost;
            //ns.print("warehouseUpgradeCost: " + warehouseUpgradeCost);
            let warehouseUsage = warehouseData.sizeUsed / warehouseData.size;
            //ns.print("warehouseUsage: " + warehouseUsage);
            let canUpgradeWarehouse = spendingMoney >= warehouseUpgradeCost ? true:false;
            //ns.print("canUpgradeWarehouse: " + canUpgradeWarehouse);
            if (warehouseUsage > STORAGE_USED_BEFORE_UPGRADE && canUpgradeWarehouse){
              ns.print("  Upgrading warehouse for " + divisionData.name + "-" + city + "!");
              spendingMoney -= warehouseUpgradeCost;
              await easyRun(ns, "corporation/upgradeWarehouse", divisionData.name, city);
            }
            let canEasilyUpgradeWarehouse = spendingMoney/2 >= warehouseUpgradeCost ? true:false;
            let upgradeAgricultureAggressively = (spendingMoney*5 >= warehouseUpgradeCost) && (divisionData.type === "Agriculture") ? true:false;
            let counter = 0;
            if (canEasilyUpgradeWarehouse || (upgradeAgricultureAggressively && warehouseData.size < 2500)){
              ns.print("  Upgrading warehouse for " + divisionData.name + "-" + city + "!");
              ns.toast("  Upgrading warehouse for " + divisionData.name + "-" + city + "!", "success", SLEEP_TIMER/4);
            }
            while (canEasilyUpgradeWarehouse || (upgradeAgricultureAggressively && warehouseData.size < 2500)){
              if ((counter++)%10===0) await ns.sleep(1);
              //ns.print("  Upgrading warehouse for " + divisionData.name + "-" + city + "!");
              //ns.toast("  Upgrading warehouse for " + divisionData.name + "-" + city + "!", "success", SLEEP_TIMER/4);
              await easyRun(ns, "corporation/upgradeWarehouse", divisionData.name, city);
              corporationData = await easyRun(ns, "corporation/getCorporation");
              corporationFunds = corporationData.funds;
              spendingMoney = corporationFunds * SPENDING_MODIFIER;
              warehouseUpgradeCost = await easyRun(ns, "corporation/getUpgradeWarehouseCost", divisionData.name, city);
              canEasilyUpgradeWarehouse = spendingMoney/2 >= warehouseUpgradeCost ? true:false;
              warehouseData = await easyRun(ns, "corporation/getWarehouse", divisionData.name, city);
              upgradeAgricultureAggressively = (spendingMoney*5 >= warehouseUpgradeCost) && (divisionData.type === "Agriculture") ? true:false;
            }
          } else{
            try{
              await easyRun(ns, "corporation/purchaseWarehouse", divisionData.name, city);
            }catch(error){
              ns.print("Error upgrading storage: " + error.message);
            }
          }
        }
      }
    //} while (spendingMoney > 2*approximateUpgradeCost)
  }//------------------------------------------------------------------------



  //  manage products ( in product-producing divisions only) (ASSUMES WE HAVE A DIVISION BASE IN SECTOR-12)
  async function manageProducts() {
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    //ns.print(corporationData);
    for (let division of corporationData.divisions){
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      //ns.print(divisionData);
      // Exit the function if the division doesn't make products or has no products
      if (!divisionData.makesProducts || divisionData.products.length === 0) continue;
      ns.print("  Managing products for " + divisionData.name);

      
      // Extract the base product name (without number) from an existing product
      let baseProductName = divisionData.products[0].replace(/[0-9]/g, '');

      // Find the highest product number
      let maxProductNumber = divisionData.products
        .map(product => parseInt(product.replace(/[^0-9]/g, ''), 10))
        .filter(num => !isNaN(num))
        .reduce((max, num) => Math.max(max, num), 0);

  // ASYNC HELPER FUNCS
      // extract highest product multiplier from all products in division, sector 12
      async function getHighestProductValue(division) {
        // min 1
        let highestValue = 25e3;

        // Iterating over each product asynchronously
        for (const product of division.products) {
          let newValue = 0;
          try {
            let productData = await easyRun(ns, "corporation/getProduct", division.name, "Sector-12", product);
            if (productData && productData.desiredSellPrice && typeof productData.desiredSellPrice === "number") {
              newValue = productData.desiredSellPrice;
            }
          } catch { newValue = 25000; }
          if (isNaN(newValue)) { newValue = 25000;  }
          highestValue = Math.max(highestValue, newValue);
        }
        return highestValue;
      }

      async function checkAnyProductInDevelopment(division) {
        
        for (let product of division.products) {
          let productData = await easyRun(ns, "corporation/getProduct", division.name, "Sector-12", product);
          if (productData.developmentProgress < 100) { return true; }
        }
        return false;
      }

      async function getLowestRatedProduct(division) {
        let lowestRatedProduct = null;
        for (let product of division.products) {
          let productData = await easyRun(ns, "corporation/getProduct", division.name, "Sector-12", product);
          if (!lowestRatedProduct || productData.rating < lowestRatedProduct.rating) { lowestRatedProduct = productData; }
        }
        return lowestRatedProduct;
      }

      let intializiationMultiplier = await getHighestProductValue(divisionData).catch(error => { ns.print("An error occurred:", error); });;

      // process prices for products
      for (let productName of divisionData.products) {
        // if market TA 2 is researched in this division, enable it for the product (covers all cities), and continue.
        const haveTAII = await easyRun(ns, "corporation/hasResearched", division, "Market-TA.II");
        const divisionProducts = divisionData.products
        if (haveTAII && divisionProducts.length > 0){ // if we have TA2 and at least one product
          ns.print(`${division} has Market-TA II! Enabling for all products.`); // reporting
          await easyRun(ns, "corporation/sellProduct", division, CITIES[0], productName, "MAX", `MP*${corporationData.revenue}`, true); // set product to sell in all cities
          await easyRun(ns, "corporation/setProductMarketTA2", division, productName, true); // then enable TA2 on product
          ns.print(`    Selling ${productName} in ${CITIES[1].padEnd(10)} with Market TAII pricing.`); // reporting sell price
          continue;
        } else {
          // process pricing per city
          for (const city of CITIES){
            let productData = await easyRun(ns, "corporation/getProduct", divisionData.name, city, productName);
            let prodSellAmount = productData.actualSellAmount;
            let prodProductionAmount = productData.productionAmount

            // if the product isnt finished, skip it! set prices ON COMPLETION
            if(productData.developmentProgress < 100){ continue; }


            // Extract multiplier from desiredSellPrice
            let splitPrice;
            let badFormat = true;
            let value = 10000; // default if parsing fails without error
            // see if the product has a 'properly' formatted price
            if (typeof productData.desiredSellPrice === "string"){
              //ns.print(`productData.desiredSellPrice is string.`)

              try{ splitPrice = productData.desiredSellPrice.split("*");
                badFormat = false; value = parseFloat(splitPrice[1]);
              } catch{ badFormat = true; }
              try{ splitPrice = productData.desiredSellPrice.split("+");
                badFormat = false; value = parseFloat(splitPrice[1]);
              } catch{ badFormat = true; }

            } else if (typeof productData.desiredSellPrice === "number"){
              //ns.print(`productData.desiredSellPrice is number.`);
              value = productData.desiredSellPrice;
              badFormat = false;
            } else {
              ns.print(`ERROR: Bad desiredSellPrice format.`);
            }
            

            if (isNaN(value)) {
              badFormat = true; // Default to 1 if parsing fails
            }

            if (badFormat) { value = intializiationMultiplier; } //  if parsing fails, reinitialize
            else {
              // Price adjustment logic
              let notSellingEnoughProduct = prodSellAmount < .95 * prodProductionAmount;
              let accumulatingProductInStorage =  productData.stored > prodProductionAmount * 10 ; // prodProductionAmount is /s... I think?
              let sellingMostOfProduction = prodSellAmount >= .9 * prodProductionAmount;
              let sellingBarelyAnyProduct = prodSellAmount <= 0.1;

              if (notSellingEnoughProduct || accumulatingProductInStorage) { value *= 0.98; } 
              else if (sellingMostOfProduction)       { value *= 1.01; }
              else if (sellingBarelyAnyProduct)       { value *= .9; } 
              else { ns.print("ERROR: Product comparison shenanigans.") }
            }
            ns.print(`    Selling ${productName} in ${city.padEnd(10)} for ${"$"}${ns.formatNumber(value,2)}/ea`);
            await easyRun(ns, "corporation/sellProduct", divisionData.name, city, productName, "MAX", value);
          }// city
        }

        
      }// product

      // generate new products, always in sector-12
      if (divisionData.products.length < divisionData.maxProducts) {
        const MAX_PURCHASE_POWER_FACTOR = 0.1;
        // Create new product with incremented number
        let corpData = await easyRun(ns, "corporation/getCorporation");
        let corpFunds = corpData.funds;
        let newProductName = baseProductName + (maxProductNumber + 1);
        let investAmount = corpFunds * MAX_PURCHASE_POWER_FACTOR;
        await easyRun(ns, "corporation/makeProduct", divisionData.name, "Sector-12", newProductName, investAmount, investAmount);
      } else {
        // Check if any product is still in development
        let anyProductInDevelopment = await checkAnyProductInDevelopment(divisionData);

        if (!anyProductInDevelopment) {
          let lowestRatedProduct = await getLowestRatedProduct(divisionData);

          if (lowestRatedProduct) {
            await easyRun(ns, "corporation/discontinueProduct", divisionData.name, lowestRatedProduct.name);
            let newProductName = baseProductName + (maxProductNumber + 1);
            let corpData = await easyRun(ns, "corporation/getCorporation");
            let corpFunds = corpData.funds;
            let investAmount = corpFunds * 0.01;
            ns.print(divisionData.name + " creating new product " + newProductName + ", with " + investAmount.toFixed(1) + " design and marketing investment.");
            await easyRun(ns, "corporation/makeProduct", divisionData.name, "Sector-12", newProductName, investAmount, investAmount);
          }
        }
      }
    }
  }//------------------------------------------------------------------------



  async function advertDivisions(){ 
    //ns.print("Starting advert func");
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corpAdvertCash = corporationData.funds; 
    for (let division of corporationData.divisions){
      //ns.print("Found division: " + division);
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      //ns.print("divisionData: " + divisionData);
      let advertCost = await easyRun(ns, "corporation/getHireAdVertCost", division);
      //ns.print("advertCost: " + advertCost);
      // spend any cent we have on advertising products
      // if this division makes products, has max products designed/being designed, and we have the cash to buy it
      if (divisionData.makesProducts && divisionData.products.length === divisionData.maxProducts && corpAdvertCash >= advertCost){
        ns.print("Hiring AdVert(s) for " + division + "!")
        // upgrade tobacco as many times as we can with cash on hand
        if (divisionData.type === "Tobacco"){
          let counter = 0;
          while(corpAdvertCash >= advertCost){
            if((counter++)%10===0) await ns.sleep(1);
            await easyRun(ns, "corporation/hireAdVert", division);
            advertCost = await easyRun(ns, "corporation/getHireAdVertCost", division);
            corpAdvertCash -= advertCost;
          } 
        }
        await easyRun(ns, "corporation/hireAdVert", division);
      }
      if (corpAdvertCash >= 25*advertCost){
        ns.print("Hiring AdVert for " + division + "!")
        // upgrade tobacco as many times as we can with cash on hand
        if (divisionData.type === "Tobacco"){
          while(corpAdvertCash >= advertCost){
            ns.toast("Hiring AdVert for "+ division, "success", SLEEP_TIMER/4);
            await easyRun(ns, "corporation/hireAdVert", division);
            advertCost = await easyRun(ns, "corporation/getHireAdVertCost", division);
            corpAdvertCash -= advertCost;
            if (corpAdvertCash >= advertCost) ns.print("And another!");
            await ns.sleep(25);
          }
          return;
        }
        await easyRun(ns, "corporation/hireAdVert", division);
      }

    }
  }//------------------------------------------------------------------------



  async function upgradeSubdivisions(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    for (let division of corporationData.divisions){
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      corporationData = await easyRun(ns, "corporation/getCorporation")
      let spendingMoney = corporationData.funds;
      for(let city of divisionData.cities){
        let upgradeCost = await easyRun(ns, "corporation/getOfficeSizeUpgradeCost", divisionData.name, city, 3);
        // if we can afford it, buy more office space
        let cityHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", divisionData.name, city);
        if (cityHasWarehouse){
          let counter = 0;
          if (spendingMoney/10 >= upgradeCost) ns.print("  Upgrading office size for " + divisionData.name + " - " + city + "!");
          while (spendingMoney/10 >= upgradeCost){
            if ((counter++) % 10 === 0) await ns.sleep(1);
            //ns.print("  Upgrading office size for " + divisionData.name + " - " + city + "!");
            //ns.toast("  Upgrading office size for " + divisionData.name + " - " + city + "!", "success", SLEEP_TIMER/4);
            await easyRun(ns, "corporation/upgradeOfficeSize", divisionData.name, city, 3); 
            upgradeCost = await easyRun(ns, "corporation/getOfficeSizeUpgradeCost", divisionData.name, city, 3);
            corporationData = await easyRun(ns, "corporation/getCorporation")
            spendingMoney = corporationData.funds;
          }
        }
      }
    }
    return;
  }//------------------------------------------------------------------------



  async function manageEmployees() {
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let isCorporationInDebt = corporationData.funds < 0;
    for (let division of corporationData.divisions){
      let hiredEmployee = false;
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      
      let isDivisionProfitable = (divisionData.lastCycleRevenue - divisionData.lastCycleExpenses) > 0;
      //ns.print("Managing employees for " + divisionData.name + "...");

      // for all cities that the division has
      for (let city of divisionData.cities) {
        let officeData = await easyRun(ns, "corporation/getOffice", divisionData.name, city);
        if (officeData.avgEnergy < 100){
          ns.print("Low energy in " + divisionData.name + "-" + city + ", buying tea.");
          await easyRun(ns, "corporation/buyTea", divisionData.name, city);
        }

        if (officeData.avgMorale < 100){
          // Using DarkTechnomancer's spooky math
          let spendPerEmployee = 500000 * (Math.sqrt (Math.pow(officeData.avgMorale, 2) - 20 * officeData.avgMorale + 40 * officeData.maxMorale + 100) - officeData.avgMorale - 10);
          ns.print("Low morale in " + divisionData.name + "-" + city + ", throwing party.");
          await easyRun(ns, "corporation/throwParty", divisionData.name, city, spendPerEmployee);
        }

        // Hire employees if there are job openings
        let positionsToFill = officeData.size - officeData.numEmployees;
        if (positionsToFill <= 0) {hiredEmployee = false;}
        for (let i = 0; i < positionsToFill; i++) {
          await easyRun(ns, "corporation/hireEmployee", divisionData.name, city);
          hiredEmployee = true;
        }
        
        officeData = await easyRun(ns, "corporation/getOffice", divisionData.name, city);
        // if we have hired a new employee OR have any unassigned employees OR corp is in debt OR divisions isnt profitable, redistribute employees.
        //if (hiredEmployee || officeData.employeeJobs.Unassigned > 0 || isCorporationInDebt || !isDivisionProfitable) {

          let jobAssignments = {};

          //ns.print("Managing employee count in " + divisionData.name + " - " + city);
          // unassign all people for reassignments
          for (let position of EMPLOYEE_POSITIONS) {
            await easyRun(ns, "corporation/setAutoJobAssignment", divisionData.name, city, position, 0);
          }

          const verySmallOffice = officeData.numEmployees < 6;
          let internRatio = 
            verySmallOffice ? 0: // if in a very small office, we do not need interns.
              // is corp in debt? if yes, further logic; if no, 0 interns - can buy tea
              (isCorporationInDebt ?
                // is the division profitable? if yes, 1/9th; if no, 1/6th
                (isDivisionProfitable ? officeData.numEmployees / 9 : officeData.numEmployees / 6)
                :0);
          let internCount = Math.ceil(internRatio);
          jobAssignments["Intern"] = internCount;

          let remainingEmployees = officeData.numEmployees - internCount;

          // PRODUCT PRODUCING:
          let assignedCounts = {};
          if (divisionData.makesProducts === true) {
            // Product production strategy:
            if (city === "Sector-12") {
              // Sector-12 is the product creation office
              // Assign 30% engineers, 25% management, remaining split between other roles
              assignedCounts["Engineer"] = Math.floor(remainingEmployees * 0.30);
              assignedCounts["Management"] = Math.floor(remainingEmployees * 0.25);
            } else {
              // others focused on research too - need some BIG research numbers for quality increases
              // Assign 75% research and development, remaining split between other roles
              assignedCounts["Research & Development"] = Math.floor(remainingEmployees * 0.75);
            }
          } /* else {
            // Material product strategy:
            assignedCounts["Operations"] = Math.floor(remainingEmployees * 2/9);
            assignedCounts["Engineer"] = Math.floor(remainingEmployees * 2/9);
            assignedCounts["Management"] = Math.floor(remainingEmployees * 3/9);
            assignedCounts["Research & Development"] = Math.floor(remainingEmployees * 1/9);
          }*/

          // Accumulate job assignments
          for (const [position, count] of Object.entries(assignedCounts)) {
            jobAssignments[position] = (jobAssignments[position] || 0) + count;
            remainingEmployees -= count;
          }

          // Generic employee reassignment, excluding interns
          let positionsExcludingInterns = EMPLOYEE_POSITIONS.filter(p => p !== "Intern");
          let index = 0;
          while (remainingEmployees > 0) {
            let position = positionsExcludingInterns[index];
            jobAssignments[position] = (jobAssignments[position] || 0) + 1;
            remainingEmployees--;
            index = (index + 1) % positionsExcludingInterns.length;
          }

          // Assign employees based on accumulated counts
          for (const [position, count] of Object.entries(jobAssignments)) {
            if (DEBUGFLAG) {ns.print("Assigning " + count + " employees to " + position + ".");}
            await easyRun(ns, "corporation/setAutoJobAssignment", divisionData.name, city, position, count);
          }
        //} // end of hiredEmployee if
      } // end of city loop
    }
    return;
  }//------------------------------------------------------------------------



  // 200 GB
  //  balance real estate within a division between all cities
  async function balanceRealEstate(divisionIn){
    let divisionData = await easyRun(ns, "getDivision", divisionIn);
    // if division NOT in more than one city, return

    // if the difference between the city with the most real estate and the least is less than 15%, reset land exports.

    // if difference between the city with the most real estate and the least is more than 15%, start land exports
      // idenfity city with the highest amount of real estate
      // get difference from highest cities to average of other cities amount of real estate
      //  export (1/10th of (1/cities-1 of (difference between largest amount and average))) to other cities

    return;
  }//------------------------------------------------------------------------



  async function purchaseUsefulItems() { 
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    for (let division of corporationData.divisions){
      //ns.print("Processing    items      for       " + division);
      
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let industryData = await easyRun(ns, "corporation/getIndustryData", divisionData.type); 

      // Materials and factor names {material: materialFactorName}
      const MATERIAL_TABLE = { "Hardware": "hardwareFactor", 
                              "Robots": "robotFactor", 
                              "AI Cores": "aiCoreFactor", 
                              "Real Estate": "realEstateFactor" };

      let totalFactor = 0;
      let materialRatios = {};

      // get normalized materialRatios: (factor/size) / totalfactor
      for (const [material, factorName] of Object.entries(MATERIAL_TABLE)) {
        let factorValue = industryData[factorName];
        if (factorValue) {
          const materialData = await easyRun(ns, "corporation/getMaterialData", material);
          const materialSize = materialData.size;
          //let relativeBonus = factorValue / Math.pow(materialSize, .8); // weight a BIT less towards real estate (lowest size)
          const relativeBonus = factorValue / materialSize; // weight a BIT less towards real estate (lowest size)
          materialRatios[material] = relativeBonus;
          totalFactor += relativeBonus;
        }
      }
      for (const material in materialRatios) { materialRatios[material] /= totalFactor; }

      for (const city of divisionData.cities) {
        const cityHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", divisionData.name, city);
        if (!cityHasWarehouse){ continue; }
        //ns.print("Processing items for " + city);
        // stop all sells of useful materials
        for (const material in materialRatios) {
          //ns.print("Canceling sell of " + material);
          await easyRun(ns, "corporation/sellMaterial", divisionData.name, city, material, "0", "MP");
        }

        let warehouse = await easyRun(ns, "corporation/getWarehouse", divisionData.name, city);
        for (const material in materialRatios) {
          if (STAGE1){
            // Assuming we ONLY have an agriculture division.
            // Targetting SPECIFIC values:
            const targetAmounts = { "AI Cores": 2114, "Hardware": 2404, "Real Estate": 124960, "Robots": 23 };

            const targetAmount = targetAmounts[material];
            if (targetAmount) {
              let materialProperties = await easyRun(ns, "corporation/getMaterial", divisionData.name, city, material);
              let storedMaterial = materialProperties.stored;

              let amountToPurchase = targetAmount - storedMaterial;
              if (amountToPurchase > 0) {
                try{
                  await easyRun(ns, "corporation/buyMaterial", divisionData.name, city, material, amountToPurchase/10 );
                  ns.print(`Purchased ${amountToPurchase} of ${material} for ${divisionData.name} in ${city}.`);
                }catch (error){ ns.print("Error purchasing useful items: " + error); }
              } else if (amountToPurchase < 0){
                ns.print(`${COLOR_RED}Excess of ${ns.formatNumber(-amountToPurchase)} of ${material} at ${divisionData.name} in ${city}.${COLOR_RESET}`);
                await easyRun(ns, "corporation/sellMaterial", divisionData.name, city, material, (-amountToPurchase/10).toString(), "MP");
              }
            }
          }// END STAGE1 HANDLING

          if (STAGE2){
            // Define target amounts for each division and material
            const targetAmounts = {
              "Agriculture": { "AI Cores": 8446, "Hardware": 9440, "Real Estate": 428895, "Robots": 1289 },
              "Chemical": { "AI Cores": 1732, "Hardware": 3220, "Real Estate": 55306, "Robots": 58 } };

            const divisionTargets = targetAmounts[divisionData.type];
            if (divisionTargets) {
              const targetAmount = divisionTargets[material];
              if (targetAmount) {
                let materialProperties = await easyRun(ns, "corporation/getMaterial", divisionData.name, city, material);
                let storedMaterial = materialProperties.stored;

                let amountToPurchase = targetAmount - storedMaterial;
                if (amountToPurchase > 0) {
                  try {
                    await easyRun(ns, "corporation/buyMaterial", divisionData.name, city, material, amountToPurchase / 10);
                    ns.print(`Purchased ${amountToPurchase} of ${material} for ${divisionData.name} in ${city}.`);
                  } catch (error) { ns.print("Error purchasing useful items: " + error); }
                } else if (amountToPurchase < 0) {
                  ns.print(`${COLOR_RED}Excess of ${ns.formatNumber(-amountToPurchase)} of ${material} at ${divisionData.name} in ${city}.${COLOR_RESET}`);
                  await easyRun(ns, "corporation/sellMaterial", divisionData.name, city, material, (-amountToPurchase / 10).toString(), "MP");
                }
              }
            }
          }// END STAGE2 HANDLING


          if (STAGE4){
            corporationData = await easyRun(ns, "corporation/getCorporation");
            let materialProperties = await easyRun(ns, "corporation/getMaterial", divisionData.name, city, material);
            let materialData = await easyRun(ns, "corporation/getMaterialData", material);
            let storedMaterial = materialProperties.stored; // amount stored, in material units
            const materialSize = materialData.size; // material units in warehouse size
            let warehouseSizeToFill = warehouse.size * USEFUL_MATERIAL_STORAGE_RATIO; // amount of storage to fill with useful materials

            // at this stage, agriculture production can start to be hampered by overful warehouses.
            if (warehouse.size >= 10000 && divisionData.type === "Agriculture"){ warehouseSizeToFill = warehouse.size * .65; }

            let warehouseSizeForMaterial = warehouseSizeToFill * materialRatios[material];  // percentage of storage to fill with specific material
            let goalAmount = warehouseSizeForMaterial / materialSize; // calculated target quantity of material to fill to warehouse size

            let excessAmount = goalAmount * 1.05; // five percent more than goal
            let amountToPurchase = goalAmount - storedMaterial;
            let warehouseUsage = warehouse.sizeUsed / warehouse.size;
            
            if ((amountToPurchase > 0) && ( warehouseUsage < 0.75)) {

              try{
                await easyRun(ns, "corporation/buyMaterial", divisionData.name, city, material, (amountToPurchase/10) );
                if ((amountToPurchase/10) > 1) ns.print(`Purchased ${ns.formatNumber(amountToPurchase, 2)} of ${material} for ${divisionData.name} in ${city}.`);
              }catch (error){
                ns.print(COLOR_RED + "Error purchasing useful items: " + error + COLOR_RESET);
              }

            } else{ // we are over goal amount, or over warehouse size limit
              // only sell if useful materials OVER excessAmount
              if (storedMaterial > excessAmount){
                let amountToSellToGoal = storedMaterial - goalAmount;
                ns.print(COLOR_RED + "Excess of " + amountToSellToGoal.toFixed(1) + " of " + material + " at " + divisionData.name + " in " + city + "." + COLOR_RESET);
                await easyRun(ns, "corporation/sellMaterial", divisionData.name, city, material, (amountToSellToGoal/10).toString(), "MP");
              }
            }
          }// END STAGE4 HANDLING
        }
      }
    }
  }//------------------------------------------------------------------------

  function numberWithCommas(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

}
