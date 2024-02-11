/** @param {NS} ns */
export async function retrieveServerData(ns) {
  //ns.disableLog(`brutessh`);
  //ns.disableLog(`ftpcrack`);
  //ns.disableLog(`relaysmtp`);
  //ns.disableLog(`httpworm`);
  ns.disableLog(`scan`);

  const TOOLNAMES = ["BruteSSH", "FTPCrack", "relaySMTP", "HTTPWorm", "SQLInject"]
  const toolCount = TOOLNAMES.reduce((total, toolName) => { 
    if (ns.fileExists(`${toolName}.exe`, "home")) {return (total+1)}
    else return total;
    }, 0);

  function tryPortAndNuke(server){
    const serverData = ns.getServer(server);
    if (serverData.hasAdminRights) return;
    [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke].map(func => { try { func(server) } catch { } })
  }

  let allServers = ["home"];
  for (let i = 0; i < allServers.length; i++) {
    const server = allServers[i];
    const newChildServers = ns.scan(server).filter(newChildServer => {
      const serverObject = ns.getServer(newChildServer);
      return (!allServers.includes(newChildServer) && 
              !newChildServer.startsWith("hacknet") && 
              (serverObject.numOpenPortsRequired <= toolCount || newChildServer.startsWith("home")))
    });
    for (const childServer of newChildServers) { tryPortAndNuke(childServer); }
    allServers.splice(i + 1, 0, ...newChildServers); // Insert the childServer array right after the current server
  }

  let serverarray = []; // Array to hold server objects
  for (let server of allServers) {
    const serverObj = ns.getServer(server);
    let serverData = {
      name: server,
      numPortsRequired: serverObj.numOpenPortsRequired,
      maxMoney: serverObj.moneyMax,
      requiredLevel: serverObj.requiredHackingSkill,
      minSecurityLevel: serverObj.minDifficulty,
      maxRam: serverObj.maxRam,
      moneyAvailable: serverObj.moneyAvailable,
      securityLevel: serverObj.hackDifficulty,
      usedRam: serverObj.ramUsed,
      freeRam: serverObj.maxRam - serverObj.ramUsed
    };
    serverarray.push(serverData);
  }
  return serverarray;
}
