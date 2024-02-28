import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL")
  const MATERIALS = ["Water", "Food", "Plants", "Chemicals", "Ore", "Hardware", "Metal", "Robots", "AI Cores", "Drugs", "Minerals"];

  await cancelAllBuys();
  await cancelAllExports();
  await cancelAllSells();

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
          ns.print("Canceling buy of " + material + " in " + division + " - " + city);
          await easyRun(ns, "corporation/buyMaterial", division, city, material, 0);
        }
        await easyRun(ns, "corporation/buyMaterial", division, city, "Real Estate", 0);
    } }
    return;
  }
  async function cancelAllSells(){
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
          ns.print("Canceling sell of " + material + " in " + division + " - " + city);
          await easyRun(ns, "corporation/sellMaterial", division, city, material, 0, 0);
    } } }
    return;
  }
  async function cancelAllExports(){
    let corporationData = await easyRun(ns, "corporation/getCorporation");
    let corporationDivisions = corporationData.divisions;
    for (let division of corporationDivisions){ // cancel exports
      let divisionData = await easyRun(ns, "corporation/getDivision", division);
      let divisionCities = divisionData.cities;
      for (let city of divisionCities) {
        let subdivisionHasWarehouse = await easyRun(ns, "corporation/hasWarehouse", division, city)
        if (!subdivisionHasWarehouse) continue; // skip if subdiv doesnt have a warehouse
        for (let material of MATERIALS) {
          await easyRun(ns, "corporation/buyMaterial", division, city, material, 0);
          for (let division2 of corporationDivisions){
            let division2Data = await easyRun(ns, "corporation/getDivision", division2);
            let division2Cities = division2Data.cities;
            for (let city2 of division2Cities) {            
              ns.print("Attempting to cancel export of "+material+" from "+division+" - "+city+" to "+division2+" - "+city2);
              await easyRun(ns, "corporation/cancelExportMaterial", division, city, division2, city2, material);
    } } } } }
    return;
  }
}
