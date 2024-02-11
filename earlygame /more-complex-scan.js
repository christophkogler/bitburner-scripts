/** @param {NS} ns */
export async function main(ns) {

  let initialServer = {
    name: "home",
    numPortsRequired: ns.getServerNumPortsRequired("home"),
    maxMoney: ns.getServerMaxMoney("home"),
    requiredLevel: ns.getServerRequiredHackingLevel("home"),
    minSecurityLevel: ns.getServerMinSecurityLevel("home"),
    maxRam: ns.getServerMaxRam("home"),
    depth: 0,
    moneyAvailable: ns.getServerMoneyAvailable("home"),
    securityLevel: ns.getServerSecurityLevel("home"),
    usedRam: ns.getServerUsedRam("home"),
    freeRam: ns.getServerMaxRam("home") - ns.getServerUsedRam("home"),
    hackCoefficient: ns.hackAnalyze("home"), // Adding hackCoefficient for the initialServer as well
    children: []
  };

  var outputfile = "server_list.txt";

  ns.write(outputfile, "name, numPortsRequired, maxMoney, requiredLevel, minSecurityLevel, maxRam, depth, moneyAvailable, securityLevel, usedRam, feeRam, hackCoefficient\n", "w");

  let visitedServers = new Set();

  visitedServers.add(initialServer.name);
  recursiveScan(initialServer);
  writeTreeDepthFirstToFile(initialServer);

  ns.print(JSON.stringify(initialServer));

    

  // self-explanatory
  function serverExistsInTree(serverName) {
    return visitedServers.has(serverName);
  }
    
    // recursively scan from a server
    function recursiveScan(currentServerNode) {
        // get new scan array
        let currentServerScanArray = ns.scan(currentServerNode.name);
        // iterate through all servers
        for (let scannedServer of currentServerScanArray) {
            // if we have not already scanned this server
            if (!serverExistsInTree(scannedServer)) {
                // get data for the server object
                let usedRam = ns.getServerUsedRam(scannedServer);
                let maxRam = ns.getServerMaxRam(scannedServer);
                let hackCoefficient = ns.hackAnalyze(scannedServer);
                let serverData = {
                    name: scannedServer,
                    numPortsRequired: ns.getServerNumPortsRequired(scannedServer),
                    maxMoney: ns.getServerMaxMoney(scannedServer),
                    requiredLevel: ns.getServerRequiredHackingLevel(scannedServer),
                    minSecurityLevel: ns.getServerMinSecurityLevel(scannedServer),
                    maxRam: maxRam,
                    depth: currentServerNode.depth + 1,
                    moneyAvailable: ns.getServerMoneyAvailable(scannedServer),
                    securityLevel: ns.getServerSecurityLevel(scannedServer),
                    usedRam: usedRam,
                    freeRam: maxRam - usedRam,
                    hackCoefficient: hackCoefficient,
                    children: []
                };
                //  add newly scanned server to children of current
                currentServerNode.children.push(serverData);
                //  add newly scanned server to already-scanned list
                visitedServers.add(scannedServer);
                //  next level of recursion
                recursiveScan(serverData);
            }
        }
    }

    // output function - recursively output all children of children of children... of serverNode
    function writeTreeDepthFirstToFile(serverNode) {
        ns.write(outputfile, 
                 `${serverNode.name},${serverNode.numPortsRequired},${serverNode.maxMoney},${serverNode.requiredLevel},${serverNode.minSecurityLevel},${serverNode.maxRam},${serverNode.depth},${serverNode.moneyAvailable},${serverNode.securityLevel},${serverNode.usedRam},${serverNode.freeRam},${serverNode.hackCoefficient}\n`, 
                 "a");
        for (let child of serverNode.children) {
            writeTreeDepthFirstToFile(child);
        }
    }

}
