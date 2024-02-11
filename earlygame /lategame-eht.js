import {retrieveServerData} from '/customGetServers.js';
/** @param {NS} ns */
export async function main(ns) {
  const scriptData = ns.getRunningScript();
  // this is an EHT 'optimized for late game' - built with assumptions like <4ms function times, executed with massive thread count, large function power numbers
  while(true){
    ns.clearLog();

    const homeData = ns.getServer("home");
    let servers = await retrieveServerData(ns);
    servers = servers.filter((serverData) => serverData.name !== "home")
    let serverDesirabilityObjects = []
    for (const serverData of servers){
      const serverDesirability = await getDesirability(ns, serverData.name)
      serverDesirabilityObjects.push({serverName:serverData.name, desirability:serverDesirability})
    }
    serverDesirabilityObjects = serverDesirabilityObjects.sort((a,b)=>{ return b.desirability - a.desirability});
    const firstObject = serverDesirabilityObjects.shift();
    const mostDesirableServer = firstObject.serverName;
    const serverObject = ns.getServer(mostDesirableServer);
    ns.print(`Most desirable server is ${mostDesirableServer} with ${ns.formatNumber(firstObject.desirability)} desirability.`)
    ns.print(`Server status: 
  Difficulty: ${ns.formatNumber(serverObject.hackDifficulty)}
  Money: ${"$"}${ns.formatNumber(serverObject.moneyAvailable)}/${ns.formatNumber(serverObject.moneyMax)}`)

    const currDifficulty = serverObject.hackDifficulty;
    const minDifficulty = serverObject.minDifficulty;

    const currMoney = serverObject.moneyAvailable;
    const maxMoney = serverObject.moneyMax;

    if (currDifficulty > minDifficulty){ // weaken
      const requiredReduction = currDifficulty - minDifficulty;
      const weakenPower = ns.weakenAnalyze(1, homeData.cpuCores);
      const reqWeakenThreads = requiredReduction/weakenPower;
      const actualWeakenThreads = Math.floor(Math.min(scriptData.threads, Math.max(1, reqWeakenThreads)));
      const basicHGWOptions = {threads: actualWeakenThreads};
      await ns.weaken(mostDesirableServer, basicHGWOptions);
    } else if (currMoney < maxMoney){ // grow
      const requiredIncrease = maxMoney - currMoney;
      const multiplier = currMoney > 0 ? 1 + (requiredIncrease / currMoney) : requiredIncrease;
      const reqGrowThreads = ns.growthAnalyze(mostDesirableServer, multiplier, homeData.cpuCores);
      const actualGrowThreads = Math.floor(Math.min(scriptData.threads, Math.max(1, reqGrowThreads)));
      const basicHGWOptions = {threads: actualGrowThreads};
      await ns.grow(mostDesirableServer, basicHGWOptions);
      const serverObject2 = ns.getServer(mostDesirableServer);
    } else { // hack
      const hackTarget = currMoney / 2;
      const reqHackThreads = ns.hackAnalyzeThreads(mostDesirableServer, hackTarget);
      const actualHackThreads = Math.floor(Math.min(scriptData.threads, Math.max(1, reqHackThreads)));
      const basicHGWOptions = {threads: actualHackThreads};
      await ns.hack(mostDesirableServer, basicHGWOptions);
    }
  }
}

/** @param {NS} ns */
async function getDesirability(ns, server) { // Returns a weight that can be used to sort servers by hack desirability
  if (!server) return 0;
  if (server.startsWith('hacknet-node')) return 0; // skip our purchased servers
  let player = ns.getPlayer();
  let so = ns.getServer(server);
  so.hackDifficulty = so.minDifficulty;
  if (so.requiredHackingSkill > player.skills.hacking) return 0;
  let weight = so.moneyMax / so.minDifficulty;

  if (ns.fileExists('Formulas.exe')) { 
    const hackWeight = ns.formulas.hacking.hackTime(so, player) / 1000;
    const profitWeight = ns.formulas.hacking.hackPercent(so, player) * so.moneyMax * ns.formulas.hacking.hackChance(so, player);
    weight = (profitWeight / hackWeight)
  }

  //weight = weight * Math.pow(so.serverGrowth, .5); // final weight; growth modifier

  if (so.requiredHackingSkill > player.skills.hacking / 2) return 0;
  return weight;
}
