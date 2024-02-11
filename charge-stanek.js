/** @param {NS} ns */
export async function main(ns) {
  await ns.stanek.chargeFragment(ns.args[0], ns.args[1]);
  ns.writePort(ns.pid, "done");
}
