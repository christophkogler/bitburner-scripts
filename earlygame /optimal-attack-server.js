import {easyRun} from '/easyRun.js'; // easyRun executes (AND creates, as necessary) script-ized functions for easy RAM dodging.
import {retrieveServerData} from '/customGetServers.js'; // easyRun executes (AND creates, as necessary) script-ized functions for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  const LOOPWAIT = (typeof ns.args[0] === 'number') ? ns.args[0] : 1;
  const MAXSTACK = typeof ns.args[1] === 'number' ? ns.args[1] : 5000;
  const WEAKEN_POWER = 0.05;
  const hostName = ns.getHostname();
  const DEBUGFLAG = ns.args.includes('-d');
  
  const DEPLOYCUSHION = 1;

  const START_TIME = Date.now();
  function getTotalRunTime(){return Date.now() - START_TIME;}

  // PRETTY COLORS! (ANSI escape codes for text colorifcation)
  const COLOR_BLACK = "\u001b[30m"; 
  const COLOR_RED = "\u001b[31m"; 
  const COLOR_GREEN = "\u001b[32m"; 
  const COLOR_YELLOW = "\u001b[33m"; 
  const COLOR_BLUE = "\u001b[34m"; 
  const COLOR_MAGNETA = "\u001b[35m"; 
  const COLOR_CYAN = "\u001b[36m"; 
  const COLOR_WHITE = "\u001b[37m"; 
  const COLOR_RESET = "\u001b[0m";

  // disable SCP logging to make logs useful
  ns.disableLog("scp");
  ns.disableLog("sleep");
  ns.disableLog("run");
  ns.disableLog("exec");
  ns.disableLog("getHackingLevel");

  if (ns.args.includes('-p')){
    //  execute purchase server if flagged
    ns.run("purchase-servers.js",1 );
  }

// Create one-shot hack/grow/weaken scripts w/ basicHGWOptions functionality, if they are not already in existence.
  const scriptContents1 = `/** @param {NS} ns */
  export async function main(ns) {
    let basicHGWOptions = { additionalMsec: (ns.args[0] ?? 0) };
    await ns.`;
  const scriptContents2 = `(ns.args[1], basicHGWOptions);
  }`
  const oneDoneScripts = ["grow", "hack", "weaken"]
  for (const type of oneDoneScripts){
    let exists = await easyRun(ns, "ns/fileExists"`one-${type}.js`)
    if (!exists){  
      const scriptContents = `${scriptContents1}${type}${scriptContents2}`;
      ns.write(`one-${type}.js`, scriptContents, "w"); 
    }
  }

  await ns.sleep(250);
  const HACK_RAM = await easyRun(ns, "ns/getScriptRam", "one-hack.js");
  const GROW_RAM = await easyRun(ns, "ns/getScriptRam", "one-grow.js");
  const WEAKEN_RAM = await easyRun(ns, "ns/getScriptRam", "one-weaken.js");

  

let targetsandstackcount = [];

// wait about 1 so I can see logs
await ns.sleep(1000 * 1);

// so I can actually see if its looping
let counter = 0;

let totalFreeRam = 0;
let totalMaxRam = 0;

  

// Main loop
while (true) {
  // if any function times have reached 4ms or less (on noodles, w/e), start up a new lategame-eht.js (if there is not one running) and kill this script
  const testGrowTime = await easyRun(ns, "ns/getGrowTime", "n00dles");
  const testWeakenTime = await easyRun(ns, "ns/getWeakenTime", "n00dles");
  const testHackTime = await easyRun(ns, "ns/getHackTime", "n00dles");
  if (testGrowTime <= 4 || testHackTime <= 4 || testWeakenTime <= 4){
    const runOps = {threads: 50000, preventDuplicates:true};
    ns.run("lategame-eht.js", runOps); // try to start up lategame-eht w/ 50k threads (~420TB)
    ns.kill(ns.pid); // kill this script
  }

  // also if function powers get really strong?
  // Update server data
  let servers = await retrieveServerData(ns);

  // hacking level for filtering
  let hackinglevel = ns.getHackingLevel();
  // lets see how many ports we can break, for filtering
  let tools = checkTools();

  // update target list
  let targetservers = servers.filter(server => server.numPortsRequired <= tools && server.requiredLevel <= hackinglevel && server.name !== "home" && server.maxMoney != 0);
  // sort by name
  targetservers.sort((a, b) => a.name.localeCompare(b.name));
  
  let purchasedServersList = await easyRun(ns, "ns/getPurchasedServers");
  // create / initial update controllable list - what we can crack + purchased servers + home
  let controllableServers = servers.filter(server => {
    (server.numPortsRequired <= tools || purchasedServersList.includes(server.name)) && !server.name.includes("hacknet")
  });

  controllableServers = controllableServers.fill((server) => {
    server.name != "home"
  });
  
  // check for new targets
  for (let target of targetservers) {
    // any new targets on the list?
    if (!targetsandstackcount.some(entry => entry[0] === target.name)) {
      targetsandstackcount.push([target.name, 0, []]);
    }
  }

  // update target stack data
  for (let targetEntry of targetsandstackcount) {
    // Get the PID array for the current target
    let pidArray = targetEntry[2];
    // If PID array is EMPTY for a target, ensure its stack count to zero
    if (pidArray.length === 0) {
      targetEntry[1] = 0;
      continue;
    }
    // Use a reverse for loop to iterate over the array safely
    for (let i = pidArray.length - 1; i >= 0; i--) {
      if (!ns.isRunning(pidArray[i])) {
        // Remove the dead PID's from the array
        pidArray.splice(i, 1);
        // Decrement the stack count for the target
        targetEntry[1]--;
      }
    }
  }

  let targetsAtMaxStack = 0;
  let whileerrorflag = false;
  let excessDelay = false;
  let runtimeTooLong = false;

  // reset ram values for calculation before deploy
  totalFreeRam = 0;
  totalMaxRam = 0;

  // get totals
  for (let controllable of controllableServers){
    totalFreeRam += controllable.freeRam;
    totalMaxRam += controllable.maxRam;
  }

  let serversWithWeights = [];
  for (const target of targetservers){
    let targetDesirability = await getDesirability(ns, target.name)
    serversWithWeights.push({target:target, weight:targetDesirability})
  }

  serversWithWeights.sort((a,b) => { return b.weight - a.weight })

  let optimalTargetByWeight = serversWithWeights[0];

  for (let target of targetservers){
    if (target.name !== optimalTargetByWeight.target.name) continue; 
    // Retrieve the entry in targetsandstackcount that has the same name as target
    let targetStack = targetsandstackcount.find(entry => entry[0] === target.name);
    if (targetStack && target.maxMoney > 0) {
      if (targetStack[1] < MAXSTACK || ns.args.includes('-u')) {
        // Calculate how many threads are needed for each operation
        let growThreads = 1; // initialize
        // aim to take a bit more than half AVAILABLE

        const aboutHalfMoney = (0.95*(target.moneyAvailable/2));
        let initialHackThreads =  await easyRun(ns, "ns/hackAnalyzeThreads", target.name, aboutHalfMoney)

        let hackThreads = target.moneyAvailable >= 1 ? Math.ceil(initialHackThreads): 0;

        // if the target has max money and has more than a dollar to it's name (ensuring growRatio is a real number and not infinite)
        if (target.maxMoney > 0 && target.moneyAvailable > 0){
          //  EXPECTED money remaining in server after hack:
          const singleThreadTakeAsPercent = await easyRun(ns, "ns/hackAnalyze", target.name);
          let projectedServerCash = target.moneyAvailable * (1 - (hackThreads * singleThreadTakeAsPercent));

          if (projectedServerCash <= 0){ projectedServerCash = 1; }
          // ratio to grow from projected remaining money to full * 1.1 extra
          let growRatio = 1.1 * (target.maxMoney / projectedServerCash);
          let oldgrowThreads = growThreads;
          if( growRatio <= 1) growRatio = 1.1;  // ensure growRatio is valid for growthAnalyze
          let growthAnalyzeResponse = await easyRun(ns, "ns/growthAnalyze", target.name, growRatio);
          growThreads = Math.max(1, Math.ceil(growthAnalyzeResponse));

          if (DEBUGFLAG) ns.print("Trying for full growth. Projected cash: " + projectedServerCash + ", ratio: " + growRatio + ", old growThreads:" + oldgrowThreads +" , new grow threads: " +growThreads);
        }
          
        if (Number.isNaN(hackThreads) || !Number.isFinite(hackThreads)){
          ns.print(COLOR_RED + "\n!!!   !!!   !!!   !!!   !!!   !!!   !!!   !!!   !!!\nhackThreads calc returned strange number!" + COLOR_RESET);   hackThreads = 1;  whileerrorflag = true;
          await ns.sleep(5 * 60 * 1000);
        }

        const securityIncreaseFromHack = await easyRun(ns, "ns/hackAnalyzeSecurity", hackThreads)
        let weaken1Threads = Math.max(1, Math.ceil(securityIncreaseFromHack / WEAKEN_POWER));
        const securityIncreaseFromGrow = await easyRun(ns, "ns/growthAnalyzeSecurity", growThreads)
        let weaken2Threads = Math.max(1, Math.ceil(securityIncreaseFromGrow / WEAKEN_POWER));

        // Check if target has reasonable security and money (drop security FIRST)
        if (target.securityLevel > 1.1 * target.minSecurityLevel){
          ns.print(COLOR_YELLOW + "\n!!!   !!!   !!!   !!!   !!!   !!!   !!!   !!!   !!! (IMBALANCE, OR PREPPING?)\nTarget security level excessive, weakening!" + COLOR_RESET);
          weaken2Threads += Math.floor(hackThreads);
          weaken2Threads += Math.floor(weaken1Threads);
          hackThreads = 0; weaken1Threads = 0; whileerrorflag = true;
        } else if (target.moneyAvailable < .1 * target.maxMoney) {
          ns.print(COLOR_YELLOW + "\n!!!   !!!   !!!   !!!   !!!   !!!   !!!   !!!   !!! (IMBALANCE, OR PREPPING?)\nTarget low on funds, growing!" + COLOR_RESET);
          growThreads += Math.floor(hackThreads);
          growThreads += Math.floor(weaken1Threads);
          hackThreads = 0; weaken1Threads = 0; whileerrorflag = true;
        }

        if (whileerrorflag){
          ns.print(COLOR_YELLOW + "Target security at " + Math.round(100 * target.securityLevel / target.minSecurityLevel) + "% of min, money at " + Math.round(100 * target.moneyAvailable / target.maxMoney) +"% of max." + COLOR_RESET);
        }

        let threadsum = (growThreads + hackThreads + weaken1Threads + weaken2Threads);
        // Calculate total RAM required
        let totalRamRequired = (HACK_RAM * hackThreads) + 
                                  (WEAKEN_RAM * (weaken1Threads + weaken2Threads)) + 
                                  (GROW_RAM * growThreads);

        ns.print(`Planning to deploy ${threadsum} threads (h:${hackThreads}, w1:${weaken1Threads}, g:${growThreads}, w2:${weaken2Threads}) which is expected to take ${totalRamRequired}GB of RAM.`)

        if (ns.args.includes('-d')){
          ns.print("Target: '" + targetStack[0] + "', Threads: g:" + growThreads + ", h:" + hackThreads + ", w1:"+weaken1Threads +", w2:"+weaken2Threads+ "', current stack " + targetStack[1] + ", with " + threadsum + " threads requiring " + totalRamRequired +" RAM.");
        }

        // DEPLOY REMOTELY
        let bestRatio = 0;
        let bestServer = null;
        let deployed = false;
        controllableServers = 
          (await retrieveServerData(ns)).filter(server => 
            (server.numPortsRequired <= tools && !server.name.includes("hacknet")) 
            || purchasedServersList.includes(server.name)
            || (server.name === "home" && server.freeRam > 128)
          );
  
        controllableServers.sort((a, b) => { b.freeRam - a.freeRam });
          
        for (let controlled of controllableServers) { // OPTIMAL DEPLOYMENT / ALTERNATE HOST SELECTION
          //  does the controlled server have enough free ram to host the entire expected RAM?
          if (controlled.name === "home") controlled.freeRam = controlled.freeRam - 128; // ensure home leaves 128GB free ram
          if (controlled.freeRam >= totalRamRequired) {
            //  WOO! print to logs!
            if (ns.args.includes('-d')){
              ns.print("Deploying threads to '" + controlled.name + "' with (free) RAM " + Math.round(controlled.freeRam) + " (consuming " + Math.round(totalRamRequired) + ", leaving " + Math.round(controlled.freeRam - totalRamRequired) + ")");
            }
            //  DEPLOY
            let deploystatus = await deploy(hackThreads, weaken1Threads, growThreads, weaken2Threads, targetStack, controlled.name);
            if (deploystatus ==  1) deployed = true; 
            if (deploystatus == -1) excessDelay = true; 
            if (deploystatus == -2) runtimeTooLong = true; 
            bestServer = null; // reset since we found a perfect match
            break;
          } else {
            //  Does the server have enough space to do ANY useful batching? (1 hack, 1 grow, 1 weaken MINIMUM)
            if (controlled.freeRam >= WEAKEN_RAM + GROW_RAM + HACK_RAM) { 
              let ratio;
              if (controlled.name === "home" && controlled.maxRam > 512 && controlled.freeRam > 128){
                ratio = (controlled.freeRam - 128) / totalRamRequired; // leave at LEAST 128 free on home
              } else ratio = controlled.freeRam / totalRamRequired;
              if (ratio > bestRatio) { bestRatio = ratio; bestServer = controlled; }
            }
          }
        }// END OF OPTIMAL DEPLOYMENT / ALTERNATE HOST SELECTION 

        if (bestServer) { // ALTERNATE DEPLOYMENT, REDUCED THREADS
          ns.print(COLOR_YELLOW + "Failed full deployment (OOM, most likely). Attempting reduced deployment!" + COLOR_RESET);
          const MAGIC_NUMBER = .8; // try to keep within server bounds
          let adjustedHackThreads = Math.max(1, Math.floor(hackThreads * (MAGIC_NUMBER * bestRatio)));
          let adjustedWeaken1Threads = Math.floor(weaken1Threads * (MAGIC_NUMBER * bestRatio));
          let adjustedGrowThreads = Math.max(1, Math.floor(growThreads * (MAGIC_NUMBER * bestRatio)));
          let adjustedWeaken2Threads = Math.floor(weaken2Threads * bestRatio);

          // get adjusted ram cost
          let adjustedramcost =((adjustedHackThreads * HACK_RAM) + 
                                ((adjustedWeaken1Threads + adjustedWeaken2Threads) * WEAKEN_RAM) + 
                                (adjustedGrowThreads * GROW_RAM));
            
          if (ns.args.includes('-d')){
            ns.print("Thread loss ratio: " + bestRatio);
            ns.print("Adjusted thread counts: h:" + adjustedHackThreads + " , w1:" + adjustedWeaken1Threads + " , g:" + adjustedGrowThreads + " , w2:" + adjustedWeaken2Threads);
            ns.print("Adjusted RAM deploy requirement: " + adjustedramcost + ", bestServer free RAM: " + bestServer.freeRam.toFixed(2));
          }

          if (adjustedramcost > bestServer.freeRam){
            whileerrorflag = true;
            ns.print(COLOR_RED + "Bad re-calculated threads (ram cost > free)! Resorting to 1 hack, 1 grow, 1 weaken!" + COLOR_YELLOW);
            adjustedHackThreads = 1;
            adjustedWeaken1Threads = 0;
            adjustedGrowThreads = 1;
            adjustedWeaken2Threads = 1;
            adjustedramcost =((adjustedHackThreads * HACK_RAM) + 
                                ((adjustedWeaken1Threads + adjustedWeaken2Threads) * WEAKEN_RAM) + (adjustedGrowThreads * GROW_RAM));
          }

          if (adjustedramcost <= bestServer.freeRam){
            // log our attempt
            ns.print("Deploying less threads (h:" + adjustedHackThreads + ",g:" + adjustedGrowThreads + ",w1:" + adjustedWeaken1Threads + ", w2:" + adjustedWeaken2Threads +") to '" + bestServer.name + "' with (free) RAM " + Math.round(bestServer.freeRam) + " (consuming " + adjustedramcost + ", leaving " + (bestServer.freeRam - adjustedramcost).toFixed(2) + ")");

            // deploy and flag
            let deploystatus = await deploy(adjustedHackThreads, adjustedWeaken1Threads, adjustedGrowThreads, adjustedWeaken2Threads, targetStack, bestServer.name);
            if (deploystatus == 1) deployed = true;
            if (deploystatus == -1) excessDelay = true;
            if (deploystatus == -2) runtimeTooLong = true;
            // next target!
            continue;
          } else {
            // no servers with enough ram to host ANYTHING.
            ns.print (COLOR_RED + "\n!!!   !!!   !!!   !!!   FAILED ALTERNATE DEPLOYMENT!   !!!   !!!   !!!   !!!\n" + COLOR_RESET)
            whileerrorflag = true;
          }
            
        }//  END OF ALTERNATE DEPLOYMENT

        // if we failed to deploy and it WASNT because of an excess delay or extreme runtime
        if (!deployed && !excessDelay && !runtimeTooLong) {
          whileerrorflag = true;
          // if we get here, no server could handle the job.
          ns.print(COLOR_RED + "No host capable of handling any job! Waiting 5 seconds..." + COLOR_RESET);
          await ns.sleep(5000);
        }
      } else {
        targetsAtMaxStack += 1;
        if (ns.args.includes('-d')){ns.print("Deploying on target would exceed max stack count (" + MAXSTACK + "), skipping!");}
      }
    }// END OF HOST SELECTION AND DEPLOYMENT LOOP
  }

  if (!whileerrorflag){
    ns.print("\n\n\n\n")
  }

  function numberWithCommas(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  // update controllableserver values for accurate calculations after deploy cycle
  controllableServers = 
    (await retrieveServerData(ns)).filter(server => 
      (server.numPortsRequired <= tools && !server.name.includes("hacknet")) 
      || purchasedServersList.includes(server.name)
      || (server.name === "home" && server.freeRam > 128)
    );

  // reset ram values for recalculation
  totalFreeRam = 0;
  totalMaxRam = 0;

  let totalUsedRam = 0;
  // get totals
  for (let controllable of controllableServers){
    totalFreeRam += controllable.freeRam;
    totalMaxRam += controllable.maxRam;
    totalUsedRam += controllable.usedRam;
  }


  //  get FREE ram as (skewed) percentage
  let freeRamPercentDecimal = Math.pow(1 - ((totalMaxRam - totalFreeRam) / totalMaxRam), .6);
  let ramUsageDisplayColorCode = determineColor(freeRamPercentDecimal);
  let ramUsageDisplay = COLOR_RESET + ramUsageDisplayColorCode + numberWithCommas((totalMaxRam - totalFreeRam).toFixed(2)) + COLOR_RESET + COLOR_CYAN

  let optimalTarget = optimalTargetByWeight.target;

  function smlForm(number){ return ns.formatNumber(number, 2)}

  let whilingString = `Whiling away... ${counter++} | Total Run Time: ${millisecondsToTimeString(getTotalRunTime())}`;
  
  let expGainString = `EXP Gain: ${smlForm(Math.round(ns.getTotalScriptExpGain()))}/s`
  let incomeString = `Income: ${'$'}${smlForm(Math.round(ns.getScriptIncome("optimal-attack-server.js", "home", ...ns.args)))}/s`

  let targetStack = targetsandstackcount.find(entry => entry[0] === optimalTarget.name)[1];
  let maxStackString = (targetsAtMaxStack === 1) ? "At Max Stacks" : `At ${targetStack} Stacks`;
  let targetMoneyString = `${"$"}${smlForm(optimalTarget.moneyAvailable)}/${smlForm(optimalTarget.maxMoney)} (${ns.formatPercent(optimalTarget.moneyAvailable/optimalTarget.maxMoney)}%)`;
  let targetSecurityString = `Security: ${smlForm(optimalTarget.securityLevel)}/${smlForm(optimalTarget.minSecurityLevel)} (${ns.formatPercent(optimalTarget.securityLevel/optimalTarget.minSecurityLevel)}%)`

  let networkRAMString = `Network RAM Usage: ${ramUsageDisplay}/${numberWithCommas(totalMaxRam.toFixed(2))}`;

  let commonLog = `${COLOR_CYAN}

${whilingString}
${expGainString} | ${incomeString}
Optimal Target: ${optimalTarget.name} | ${targetMoneyString} | ${targetSecurityString}
${maxStackString} | ${networkRAMString}${COLOR_RESET}`;

  ns.print(commonLog);

  if (whileerrorflag && ns.args.includes('-d')){
    // wait two seconds if an error occured; logging
    await ns.sleep(1000 * 2);
  }

  // if we are running out of ram, sleep for an additional (LONG!) time (trying to prevent 1k+ tiny stacks)
  if (totalFreeRam < totalMaxRam * .15) {
    ns.print(`Low free RAM, waiting a bit longer...`)
    await ns.sleep(1 * 1000);
    }

  await ns.sleep(LOOPWAIT);
}//------------------------------------------------------ END OF WHILE LOOP ------------------------------------------------------------

  async function deploy(hackThreads, weaken1Threads, growThreads, weaken2Threads, targetStack, hostserver) {// deploy thread counts to host aimed at a target, with proper timing
    
    // Get runtimes for the script on the target server
    let targetGrowTime = ns.getGrowTime(targetStack[0]);
    let targetWeakenTime = ns.getWeakenTime(targetStack[0]);
    let targetHackTime = ns.getHackTime(targetStack[0]);

    // Handle EXTREMELY low runtimes by setting 'min' times that (should?) work
    if (targetGrowTime < 1) targetGrowTime = 1;
    if (targetWeakenTime < 1) targetWeakenTime = 1;
    if (targetHackTime < 1) targetHackTime = 1;

    //ns.print(`Initial Grow, Weaken, Hack Times: ${millisecondsToTimeString(targetGrowTime)}, ${millisecondsToTimeString(targetWeakenTime)}, ${millisecondsToTimeString(targetHackTime)}`);

    let targetServerObject = await easyRun(ns, "ns/getServer", targetStack[0]);
    let playerObject = await easyRun(ns, "ns/getPlayer");
    let formulasExists = await easyRun(ns, "ns/fileExists", "Formulas.exe")
    if (formulasExists){
      targetGrowTime = ns.formulas.hacking.growTime(targetServerObject, playerObject);
      targetWeakenTime = ns.formulas.hacking.weakenTime(targetServerObject, playerObject);
      targetHackTime = ns.formulas.hacking.hackTime(targetServerObject, playerObject);
      //ns.print(`Updated Grow, Weaken, Hack Times (using formulas): ${millisecondsToTimeString(targetGrowTime)}, ${millisecondsToTimeString(targetWeakenTime)}, ${millisecondsToTimeString(targetHackTime)}`);
    }

    // Calculate worth - do we have the free ram to wait for very long cycles? using up all free ram on large, slow runs likely not as profitable as hitting smaller ones continually (leveling! upgrading servers faster! MONEY!)
    //  if we have LESS than a THIRD free ram AND weaken time is OVER/EQUAL 15 minutes
    if ( (totalFreeRam < totalMaxRam/3) && (targetWeakenTime >= 1000 * 60 * 15)){
      ns.print(COLOR_YELLOW + ">15min execute with "+ totalFreeRam.toFixed(2) +" free RAM, canceling deploy!" + COLOR_RESET); return -2;
    }
    // if we have less than a SIXTH free ram and weaken time is over FIVE minutes
    if ( (totalFreeRam < totalMaxRam/6) && (targetWeakenTime >= 1000 * 60 * 5)){
      ns.print(COLOR_YELLOW + ">5min execute with "+ totalFreeRam.toFixed(2) +" free RAM, canceling deploy!" + COLOR_RESET); return -2;
    }

    // Wait time calculations
    let hackWait = targetWeakenTime - (targetHackTime + DEPLOYCUSHION); // Hack ends just before weaken1
    let weaken1Wait = 0; // First weaken starts immediately
    let growWait = targetWeakenTime + DEPLOYCUSHION - targetGrowTime ; // Grow ends just after weaken2
    let weaken2Wait = DEPLOYCUSHION * 2; // Weaken2 ends just after grow ends

    //ns.print(`Initial wait times: Hack: ${millisecondsToTimeString(hackWait)}, Weaken1: ${millisecondsToTimeString(weaken1Wait)}, Grow: ${millisecondsToTimeString(growWait)}, Weaken2: ${millisecondsToTimeString(weaken2Wait)}`);


    // Ensure no negative waits, and if there are, adjust all waits
    let minWait = Math.min(hackWait, weaken1Wait, growWait, weaken2Wait); 
    if (minWait < 0) {
      let adjustValue = Math.abs(minWait);
      hackWait = hackWait + adjustValue;
      weaken1Wait = weaken1Wait + adjustValue;
      growWait = growWait + adjustValue;
      weaken2Wait = weaken2Wait + adjustValue;

      //ns.print(`Adjusted wait times for negative waits: Hack: ${millisecondsToTimeString(hackWait)}, Weaken1: ${millisecondsToTimeString(weaken1Wait)}, Grow: ${millisecondsToTimeString(growWait)}, Weaken2: ${millisecondsToTimeString(weaken2Wait)}`);
    }


    let baseDelay = DEPLOYCUSHION * targetStack[1]
    // adjust all waits by additional BASEDELAY (stack depth)
    hackWait = hackWait + baseDelay;
    weaken1Wait = weaken1Wait + baseDelay;
    growWait = growWait + baseDelay;
    weaken2Wait = weaken2Wait + baseDelay;

    let longestDelay = Math.max(hackWait, weaken1Wait, growWait, weaken2Wait);
    if (longestDelay >= targetWeakenTime && targetWeakenTime >= 4) {
      ns.print(COLOR_YELLOW + "Excessive delay scheduled, canceling deploy!" + COLOR_RESET); 
      return -1;
    }

    //ns.print(`Final wait times with base delay added: Hack: ${millisecondsToTimeString(hackWait)}, Weaken1: ${millisecondsToTimeString(weaken1Wait)}, Grow: ${millisecondsToTimeString(growWait)}, Weaken2: ${millisecondsToTimeString(weaken2Wait)}`);

    /*
    ns.print(`Planned delays and calculated end times:
    Hack start delay: ${millisecondsToTimeString(hackWait)}, expected end time: ${millisecondsToTimeString(hackWait + targetHackTime)} | Weaken1 start delay: ${millisecondsToTimeString(weaken1Wait)}, expected end time: ${millisecondsToTimeString(weaken1Wait + targetWeakenTime)} | Grow start delay: ${millisecondsToTimeString(growWait)}, expected end time: ${millisecondsToTimeString(growWait + targetGrowTime)} | Weaken2 start delay: ${millisecondsToTimeString(weaken2Wait)}, expected end time: ${millisecondsToTimeString(weaken2Wait + targetWeakenTime)}`);
    */
    let weaken2PID = 0;
    if (hostserver) {
        // If hostserver parameter is provided, use ns.scp and ns.exec
        const scripts = ["one-hack.js", "one-weaken.js", "one-grow.js", "one-weaken.js"];
        for (const script of scripts) {
            ns.scp(script, hostserver);
        }
        let runOps = {threads:1, temporary:true};
        if (hackThreads > 0){ 
          runOps.threads = hackThreads; 
          ns.exec("one-hack.js", hostserver, runOps, hackWait, targetStack[0]);
        }
        if (weaken1Threads > 0){ 
          runOps.threads = weaken1Threads; 
          ns.exec("one-weaken.js", hostserver, runOps, weaken1Wait, targetStack[0]);
        }
        if (growThreads > 0){ 
          runOps.threads = growThreads; 
          ns.exec("one-grow.js", hostserver, runOps, growWait, targetStack[0]);
        }
        if (weaken2Threads > 0){ 
          runOps.threads = weaken2Threads; 
          weaken2PID = ns.exec("one-weaken.js", hostserver, runOps, weaken2Wait, targetStack[0]);
        }
        //ns.print(`Deploying threads: h:${hackThreads}, w1: ${weaken1Threads}, g:${growThreads}, w2:${weaken2Threads}`);
    } else {
        ns.tprint("Attack coordinator attempted to deploy to nothing.");
    }

    // Update the target stack count
    targetStack[1]++;
    // Store the PID of the last weaken process to the PID array
    // This could be useful if you need to manage/terminate specific processes later
    targetStack[2].push(weaken2PID);

    // succesfully reached end of script - return a 1 to indicate such
    return 1;
  }//------------------------------------------------------------------------------------


  
  function determineColor(percent) { // helper function to reduce repitition
    if (percent >= 1) return COLOR_CYAN;
    else if (percent >= 0.75) return COLOR_GREEN;
    else if (percent >= 0.5) return COLOR_YELLOW;
    else if (percent >= 0.25) return COLOR_RED;
    else return "\u001b[37;41m"; // very very low max stack ratio
  }//------------------------------------------------------------------------
  
  async function getDesirability(ns, server) { // Returns a weight that can be used to sort servers by hack desirability
      if (!server) return 0;
      if (server.startsWith('hacknet-node')) return 0; // skip our purchased servers
      let player = await easyRun(ns, "ns/getPlayer");
      let so = await easyRun(ns, "ns/getServer", server);
      so.hackDifficulty = so.minDifficulty;
      if (so.requiredHackingSkill > player.skills.hacking) return 0;
      let weight = so.moneyMax / so.minDifficulty;

      if (ns.fileExists('Formulas.exe')) { 
        const hackWeight = ns.formulas.hacking.hackTime(so, player) / 1000;
        const profitWeight = ns.formulas.hacking.hackPercent(so, player) * so.moneyMax * ns.formulas.hacking.hackChance(so, player);
        weight = (profitWeight / hackWeight)
      }

      weight = weight * Math.pow(so.serverGrowth, .5); // final weight; growth modifier

      if (so.requiredHackingSkill > player.skills.hacking / 2) return 0;
      return weight;
  }//-----------------------------------------------------------------------------------------------------------

  function millisecondsToTimeString(milliseconds) {// convert a milliseconds number into a pretty time string
    let hours = Math.floor(milliseconds / 3600000); // 1 hour = 3600000 milliseconds
    let mins = Math.floor((milliseconds % 3600000) / 60000); // 1 minute = 60000 milliseconds
    let secs = Math.floor((milliseconds % 60000) / 1000); // 1 second = 1000 milliseconds
    let msecs = milliseconds % 1000;
    // Format milliseconds to always have three digits
    if (msecs < 10) { msecs = '00' + msecs; } 
    else if (msecs < 100) { msecs = '0' + msecs; }
    else { msecs = ns.formatNumber(msecs, 0)}
    let timeString = "";
    if (hours > 0) timeString += hours + "h";
    if (mins > 0) timeString += (timeString ? " " : "") + mins + "m";
    if (secs > 0) timeString += (timeString ? " " : "") + secs + "s";
    if (msecs > 0) timeString += (timeString ? " " : "") + msecs + "ms";
    return timeString || "0ms"; // Return "0ms" if all are zero
  }//--------------------------------------------------------------------------------------

  function checkTools(){
    // check if we have cracking tools.
    let tools = 0;
    ["BruteSSH", "FTPCrack", "relaySMTP", "HTTPWorm", "SQLInject"].forEach(file => { if (ns.fileExists(`${file}.exe`, "home")) {tools++;} })
    return tools;
  }
}//  END OF MAIN
