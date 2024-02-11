/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL")
  ns.tail();
  makeWayToNoodleBar();
  const startTime = Date.now();
  let lastSleep = startTime;
  let lastFocus = startTime;
  let last1000 = startTime;
  let counter = 0;
  let totalProfit = 0;
  while (true) {
    if (isNoodlesButton()){
      for(let i = 0; i < 100; i++){
        eatNoodles(ns);
        if (counter % 1000 === 0) {
          const now = Date.now();
          ns.print(`Took ${ns.tFormat(now - last1000)} to eat 1000 noodles.`)
          last1000 = now;
        }
        if (Date.now() > lastSleep + 100) {
          ns.print(`Have consumed ${counter} noodles and earned a total of ${"$"}${ns.formatNumber(totalProfit)} for Corporation!`)
          await ns.asleep(0);
          lastSleep = Date.now();
        }
        if (Date.now() > lastFocus + (1000 * 60 * 60)) { // every hour...
          makeWayToNoodleBar();
          await ns.asleep(0);
          lastFocus = Date.now();
        }
      }
    } else {
      ns.print(`No button.`)
      await ns.asleep(1000);
    }
  }

  function makeWayToNoodleBar() {
    let doc = globalThis['document'];
    const mainGameButtons = doc.getElementsByClassName('MuiButtonBase-root');
    for (const button of mainGameButtons) { if (button.outerText === 'Travel') { button.click(); break; } }
    doc = globalThis['document'];
    const travelPageSpans = doc.getElementsByTagName("SPAN")
    for (const span of travelPageSpans) { if (span.outerText === 'N') { span.click(); break; } }
    for (const button of mainGameButtons) { if (button.outerText === 'City') { button.click(); break; } }
    doc = globalThis['document'];
    const newTokyoCityPageSpans = doc.getElementsByTagName("SPAN")
    for (const span of newTokyoCityPageSpans) { if (span.ariaLabel === "Noodle Bar") { span.click(); break; } }
  }

  function isNoodlesButton(){
    const doc = globalThis['document'];
    const buttonsByTagName = doc.getElementsByClassName('MuiButtonBase-root');
    for (const button of buttonsByTagName) { 
      if (button.textContent === 'Eat noodles') { return true; }
    }
    return false;
  }

  function eatNoodles() {
    const doc = globalThis['document'];
    const buttonsByTagName = doc.getElementsByClassName('MuiButtonBase-root');
    for (const button of buttonsByTagName) { 
      if (button.textContent === 'Eat noodles') { 
        button.click(); 
        totalProfit = totalProfit + ns.corporation.getCorporation().revenue / 100;
        counter++
        return; 
      }
    }
  }
}
