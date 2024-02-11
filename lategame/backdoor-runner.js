/** @param {NS} ns */
import {easyRun} from '/easyRun.js'; // easyRun executes (AND creates, as necessary) script-ized functions for easy RAM dodging.
export async function main(ns) {

  ns.disableLog("run");
  ns.disableLog("sleep")

    //ns.toast("Backdooring servers...", "info", 2500);
    ns.print(`Doing backdoors...`)

    // run scan and crack.
    ns.run("more-complex-scan.js");
    await ns.sleep(25);
    ns.run("crack-list.js");
    await ns.sleep(25);

    const filename = 'server_list.txt'; // This is the name of the file where the server list is stored.
    const serverListContent = ns.read(filename); // Read the content of the server list file.
    if (!serverListContent) { ns.tprint(`ERROR: File '${filename}' is empty or does not exist.`); return; }

    // server_list.txt lines, split on newlines, first row removed, filtered for empty
    const serverLines = serverListContent.split('\n').slice(1).filter(line => line.trim() !== '');

    // create array of server names and depths
    const serverList = serverLines.map(lines => { 
      const parts = lines.split(',');
      return { name: parts[0], depth: parseInt(parts[6], 10) }; 
    });

    let toolCount = await countTools();

    // first, check high-prio servers:
    const highPrioNames = ["CSEC", "I.I.I.I", "avmnite-02h", "run4theh111z"] // , "w0r1d_d43m0n"
    let highPrioTargets = [];
    for (const server of serverList){
      let serverData = await easyRun(ns, "ns/getServer", server.name); 
      let serverBackdoored = serverData.backdoorInstalled;
      if (!serverBackdoored && highPrioNames.includes(server.name)){
        highPrioTargets.push(server);
      }
    }
    if (ns.args.includes('-p')){
      if (highPrioTargets.length > 0) ns.print(`Doing high prio: ${JSON.stringify(highPrioTargets)}`)
      // hit high prio
      for (const server of highPrioTargets){
        // get server
        const targetServerName = server.name; // get the server name
        let targetServer = await easyRun(ns, "ns/getServer", targetServerName);
        // can we crack it?
        let canCrack = targetServer.numOpenPortsRequired <= toolCount; 
        // can we hack it?
        let hackingLevel = await easyRun(ns, "ns/getHackingLevel");
        let canHack = targetServer.requiredHackingSkill <= hackingLevel; 
        // is it already backdoored?
        let alreadyBackdoored = targetServer.backdoorInstalled; 
        // if we CAN hack && crack && !backdoored
        if (canCrack && canHack && !alreadyBackdoored){ 
          let pathToTargetServer = findPath(server, serverList);  // get the path to the target (includes target)

          // for all servers along path to target, INCLUDING target
          for(const pathEntry of pathToTargetServer){
            let pathServer = await easyRun(ns, "ns/getServer", pathEntry);
            if (pathEntry === targetServerName){ // if we are at the target, backdoor
              await easyRun(ns, "singularity/connect", pathEntry);
              ns.toast(`Backdooring ${pathEntry}...`, "success", 5000);
              ns.print(`Backdooring ${pathEntry}...`);
              await easyRun(ns, "singularity/installBackdoor");
            } else {
              await easyRun(ns, "singularity/connect", pathEntry);
            }
          }
          await easyRun(ns, "singularity/connect", "home"); // return to home
        }
      }
    } else {
      ns.print(`Doing the rest...`)
      // time to just hit the rest
      for (const server of serverList){
        // get server
        const targetServerName = server.name; // get the server name
        // if world daemon, skip?
        if (targetServerName === "w0r1d_d43m0n") continue;
        let targetServer = await easyRun(ns, "ns/getServer", targetServerName);
        // can we crack it?
        let canCrack = targetServer.numOpenPortsRequired <= toolCount; 
        // can we hack it?
        let hackingLevel = await easyRun(ns, "ns/getHackingLevel");
        let canHack = targetServer.requiredHackingSkill <= hackingLevel; 
        // is it already backdoored?
        let alreadyBackdoored = targetServer.backdoorInstalled; 
        // if we CAN hack && crack && !backdoored
        if (canCrack && canHack && !alreadyBackdoored){ 
          let pathToTargetServer = findPath(server, serverList);  // get the path to the target (includes target)

          // for all servers along path to target, INCLUDING target
          for(const pathEntry of pathToTargetServer){
            let pathServer = await easyRun(ns, "ns/getServer", pathEntry); let isBackdoored = pathServer.backdoorInstalled;
            if (!isBackdoored){
              await easyRun(ns, "singularity/connect", pathEntry);
              ns.toast(`Backdooring ${pathEntry}...`, "success", 5000);
              ns.print(`Backdooring ${pathEntry}...`);
              await easyRun(ns, "singularity/installBackdoor");
            } else {
              await easyRun(ns, "singularity/connect", pathEntry);
            }
          }
          await easyRun(ns, "singularity/connect", "home"); // return to home
        }
        else {
          //ns.print(`Can't hack, can't crack, or already backdoored target!`);
        }
      }
    }

    // Function to recursively find the path to 'home' from targetServer
    // returns array reprsenting series of connections to be made to reach target
    function findPath(targetServer, serverList) {
        if (targetServer.depth === 0) return [targetServer.name]; // 0 depth - we've reached home
        
        // Search upwards in the list for the next server with a lower depth
        let nextServerIndex = serverList.findIndex(srv => srv.name === targetServer.name) - 1;
        while (nextServerIndex >= 0 && serverList[nextServerIndex].depth >= targetServer.depth) {
            nextServerIndex--;
        }
        if (nextServerIndex < 0) {
            throw new Error(`No server found with lower depth than '${targetServer.name}'`);
        }
        const nextServer = serverList[nextServerIndex];
        return [...findPath(nextServer, serverList), targetServer.name];
    }

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
}
