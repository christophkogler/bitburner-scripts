import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const servers = [ 
    "home-node-01", "home-node-02", "home-node-03", "home-node-04", "home-node-05", 
    "home-node-06", "home-node-07", "home-node-08", "home-node-09", "home-node-10", 
    "home-node-11", "home-node-12", "home-node-13", "home-node-14", "home-node-15", 
    "home-node-16", "home-node-17", "home-node-18", "home-node-19", "home-node-20", 
    "home-node-21", "home-node-22", "home-node-23", "home-node-24", "home-node-25"];

  const bnMultipliers = await easyRun(ns, "ns/getBitNodeMultipliers");

  const bnServers = servers.slice(0, Math.floor(servers.length * bnMultipliers.PurchasedServerLimit));

  const SERVERS_TO_MAX = bnServers.length;

  let allServersUpgraded = false;
  let counter = 0;
  while (true) {
    let maxedServers = 0; // reset maxed server count

    ns.print("\n\n\n\nYet again!  " + (counter++));

    const purchasedServers = await easyRun(ns, "ns/getPurchasedServers")

    bnServers.forEach(async (serverName) => {
      if (!purchasedServers.includes(serverName)) await easyRun(ns, "ns/purchaseServer", serverName, 2)
    })

    for (let index = 0; index < bnServers.length; index++) {

      const bServerExists = await easyRun(ns, "ns/serverExists", bnServers[index]);
      if (!bServerExists) { 
        ns.print(`Attempting to purchase ${bnServers[index]}`)
        const serverName = await easyRun(ns, "ns/purchaseServer", bnServers[index], 2);
        if (serverName === "") break;
        continue;
      }

      const serverMaxRam = await easyRun(ns, "ns/getServerMaxRam", bnServers[index]);
      const upgradeCost = await easyRun(ns, "ns/getPurchasedServerUpgradeCost", bnServers[index], serverMaxRam * 2);
      if (Number.isFinite(upgradeCost)) {
        const playerMoney = (await easyRun(ns, "ns/getPlayer")).money; 
        ns.print(`Price to upgrade: ${ns.formatNumber(upgradeCost)}, max spend: ${ns.formatNumber(playerMoney)}`);
        if (upgradeCost < playerMoney) {
          ns.print("Trying to upgrade server for " + ns.formatNumber(upgradeCost) + "...");
          let upgradeSuccess = await easyRun(ns, "ns/upgradePurchasedServer", bnServers[index], serverMaxRam * 2);
          if (upgradeSuccess) ns.print("Upgrade successful!");
          else ns.print("Upgrade failed?");
        }
      } else { 
        ns.print(`Server ${bnServers[index]} maxed out!`)
        maxedServers += 1; 
      }
      
      if (maxedServers == SERVERS_TO_MAX) {
        allServersUpgraded = true;
        break;
      }
    }

    if (allServersUpgraded) {
      ns.print("All servers max upgraded! Script ending.")
      break;
    }

    await ns.sleep(1000);
  }
}
