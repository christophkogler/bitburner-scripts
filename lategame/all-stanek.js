import { retrieveServerData } from '/customGetServers.js'; // Assumes this function fetches server data including free RAM
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  //ns.tail();
  const chargeStanekRamCost = ns.getScriptRam("charge-stanek.js");
  const minFreeRam = 256;
  let lastStanekCharge = performance.now();
  ns.write("charge-stanek.js", `/** @param {NS} ns */
export async function main(ns) {
  await ns.stanek.chargeFragment(ns.args[0], ns.args[1]);
  ns.writePort(ns.pid, "done");
}`, "w")

  while (true) {
    await ns.sleep(100);
    // run for 30 seconds on startup.
    // every 5 minutes, run?
    const currentTime = performance.now();
    const timeSinceLastChargeMillisec = currentTime - lastStanekCharge;

    // greater than 30 seconds since charging run started and less than five minutes -> wait 30s
    if (timeSinceLastChargeMillisec >= 30 * 1000 && timeSinceLastChargeMillisec < 5 * 60 * 1000) { 
      ns.print(`${ns.tFormat(300000 - timeSinceLastChargeMillisec)} until next Stanek charging cycle.`)
      await ns.sleep(30 * 1000); continue; 
    } 
    // greater than 5 min since last charge -> start charging, reset timer.
    else if (timeSinceLastChargeMillisec >= 5 * 60 * 100){ lastStanekCharge = performance.now(); }

    const servers = await retrieveServerData(ns);
    let totalThreads = 0;
    let stanekFragments = ns.stanek.activeFragments().filter(fragment => fragment.type !== 18); // Assuming type 18 is not chargeable
    stanekFragments = stanekFragments.map(fragment => {return {fragId: fragment.id, fragX: fragment.x, fragY: fragment.y, threads:0}})
    if (stanekFragments.length === 0){
      await ns.sleep(30 * 1000); // Sleep before the next iteration
      continue; // Skip if no chargeable fragments
    }

    let chargerArray = [];
    for (const server of servers) {
      stanekFragments.forEach(fragment => fragment.threads = 0); // Reset threads count for each fragment
      const serverFreeRam = server.freeRam;
      const maxRamUsed = server.name === "home" ? serverFreeRam - minFreeRam : serverFreeRam;
      if (maxRamUsed < chargeStanekRamCost) continue; // Ensure we can run at least one thread

      let availableThreads = Math.floor(maxRamUsed/chargeStanekRamCost);
      totalThreads += availableThreads;

      // Distribute threads evenly across fragments
      while (availableThreads > 0) {
        for (let i = 0; i < stanekFragments.length && availableThreads > 0; i++) {
          stanekFragments[i].threads += 1;
          availableThreads--;
        }
      }
      // Execute your script with the calculated threads for each fragment
      for (const fragment of stanekFragments) {
        if (fragment.threads > 0) {
          
          ns.scp("charge-stanek.js", server.name, "home");
          const chargerPID = ns.exec("charge-stanek.js", server.name, fragment.threads, fragment.fragX, fragment.fragY);
          if (chargerPID === 0){
            ns.tprint(`ERROR! CHARGER DIDNT START ON ${server.name} WITH ${fragment.threads} THREADS FOR ${fragment.threads * chargeStanekRamCost} RAM
SERVER PROPERTIES: ${Object.entries(server)}`)
          } else {
            const chargerPortHandle = ns.getPortHandle(chargerPID);
            chargerArray.push(chargerPortHandle.nextWrite());         // push the charger's promise to the big array...
          }
        }
      }
    }
    ns.print(`Deployed ${totalThreads} charge-stanek threads across network. Waiting for completion . . .`)
    await Promise.allSettled(chargerArray);
    ns.print(`Charging cycle completed.`);
  }
}
