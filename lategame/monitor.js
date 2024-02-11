import {easyRun} from '/easyRun.js'; // easyRun executes (OR creates, as necessary) script-ized functions, for easy RAM dodging.
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.print(`\nInitializing monitor . . .\n\n`)

  const karmaIn = ns.heart.break();
  const startTime = Date.now();
  
  await easyRun(ns, "ns/tail", ns.pid);

  while(true){
    await ns.sleep(1000);
    const homeServer = ns.getServer("home");
    const playerData = await easyRun(ns, "ns/getPlayer");
    const haveCorp = await easyRun(ns, "corporation/hasCorporation");
    
    const totalIncome = await getTotalIncome()
    const corpString = haveCorp ? ``:`Corp: ${"$"}${ns.formatNumber(playerData.money,0)}/150b (~${ns.tFormat(( (150e9 - playerData.money)/totalIncome) * 1000)})\n`;

    const currentAugs = await easyRun(ns, "singularity/getOwnedAugmentations", true);
    const nickofolasString = currentAugs.includes(`nickofolas Congruity Implant`) ? ``:`ETA to graft 'nickofolas Congruity Implant': ${ns.tFormat((150e12/totalIncome) * 1000)}\n`


    const currentKarma = ns.heart.break();
    const karmaChange = currentKarma - karmaIn;

    const currentTime = Date.now();
    const timeChange = currentTime - startTime;

    const averageKarmaChangePerMilliecond = karmaChange / timeChange;

    const karmaToGang = -54000 - currentKarma;
    const millisecondsToGangKarma = karmaToGang / averageKarmaChangePerMilliecond;
    
    const karmaString = currentKarma < -54000 ? `` : `ETA to unlock Gang: ${ns.tFormat(millisecondsToGangKarma)}\n`

    ns.print(`


Monitor has been alive for ${ns.tFormat(timeChange)}

Home RAM: ${ns.formatRam(homeServer.maxRam - homeServer.ramUsed,1)} free/${ns.formatRam(homeServer.maxRam,1)} max
Income since last install: ${"$"}${ns.formatNumber(totalIncome,2)}/s
${corpString}${nickofolasString}${karmaString}`)
  }


  async function getTotalIncome(){
    return (Object.entries((await easyRun(ns, "ns/getMoneySources")).sinceInstall)
        .filter((moneySource) => moneySource[1] > 0)
        .reduce((previousValue, currentValue) => { return previousValue + currentValue[1] }, 0) ) 
      / ((await easyRun(ns, "ns/getTimeSinceLastAug"))/1000);
  }
}
