/** @param {NS} ns */
export async function main(ns) {
    
  function retrieveServerData(ns) {
    let csvContent = ns.read("server_list.txt"); // Read the entire content of the CSV file
    let lines = csvContent.split("\n");
    lines.shift(); // Skip the header line
    let servers = []; // Array to hold server objects
    for (let line of lines) {
        if (line.trim() === "") continue;  // To handle potential empty lines
        let parts = line.split(",");
        let server = {name: parts[0],
                      numPortsRequired: parts[1],
                      maxMoney: parts[2],
                      requiredLevel: parts[3],
                      minSecurityLevel: parts[4],
                      depth: parts[6]
                    };
        servers.push(server);
    } return servers;
  }

  let tools = 0;
  let ssh = false;
  let ftp = false;
  let smtp = false;
  let http = false;
  let sql = false;

  // TOOLS:
  if (ns.fileExists("BruteSSH.exe", "home")) { tools++; ssh = true; } 
  if (ns.fileExists("FTPCrack.exe", "home")) { tools++; ftp = true; } 
  if (ns.fileExists("relaySMTP.exe", "home")) { tools++; smtp = true; } 
  if (ns.fileExists("HTTPWorm.exe", "home")) { tools++; http = true; } 
  if (ns.fileExists("SQLInject.exe", "home")) { tools++; sql = true; }

  // Retrieve server data
  let servers = retrieveServerData(ns); 
  // Iterate through all servers
  for (let i = 0; i < servers.length; i++) {
    let server = servers[i];
    // Check if server ports required is less than the tool count
    if (server.numPortsRequired <= tools) {
      // Use available tools
      if (ssh) ns.brutessh(server.name);
      if (ftp) ns.ftpcrack(server.name);
      if (smtp) ns.relaysmtp(server.name);
      if (http) ns.httpworm(server.name);
      if (sql) ns.sqlinject(server.name);
      // Then nuke the server
      ns.nuke(server.name);
    }
  }
}
