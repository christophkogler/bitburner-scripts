import {retrieveServerData} from '/customGetServers.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) { // THIS SCRIPT REQUIRES 'share-ram.js' TO BE PRESENT
  ns.disableLog("ALL")
  const shareScriptRamCost = ns.getScriptRam("share-ram.js");
  const chargeStanekRamCost = ns.getScriptRam("charge-stanek.js");
  const minFreeRam = 256;

  while (true){
    const curWork = ns.singularity.getCurrentWork();
    // if not working, or not doing faction work, wait and test again later.
    if (!curWork || curWork.type !== "FACTION"){
      ns.print(`Not doing faction work.`)
      await ns.sleep(10 * 1000);
      continue;
    }
    const servers = await retrieveServerData(ns);
    let totalThreads = 0;
    // use up to half of free ram
    // for all servers
    for (const server of servers){
      // how much free ram the server has
      const serverFreeRam = server.freeRam; 
      // how much ram we are going to use. save 256gb if targeting home.
      const maxRamUsed = server.name === "home" ? serverFreeRam - minFreeRam : serverFreeRam; 
      if (maxRamUsed < shareScriptRamCost) continue; // ensure we can run a thread
      const maxThreadsOnServer = Math.floor( (maxRamUsed/shareScriptRamCost) / 2);
      if (maxThreadsOnServer >= 1){
        totalThreads += maxThreadsOnServer;
        ns.scp("share-ram.js", server.name);
        ns.exec("share-ram.js", server.name, maxThreadsOnServer);
      }
    }
    ns.print(`Deployed ${totalThreads} share-ram threads across network. \n`)
    await ns.sleep(10.5 * 1000);
  }
}
