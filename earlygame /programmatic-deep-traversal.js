/** @param {NS} ns **/
export async function main(ns) {
    const targetServerName = ns.args[0];
    if (!targetServerName) {
        ns.tprint("ERROR: No target server name provided as an argument.");
        return;
    }

    const filename = 'server_list.txt'; // This is the name of the file where the server list is stored.
    const serverListContent = ns.read(filename); // Read the content of the server list file.
    if (!serverListContent) {
        ns.tprint(`ERROR: File '${filename}' is empty or does not exist.`);
        return;
    }

    // server_list.txt lines, split on newlines, first row removed, filtered for empty
    const serverLines = serverListContent.split('\n').slice(1).filter(line => line.trim() !== '');

    // create array of server names and depths
    const servers = serverLines.map(line => {
        const parts = line.split(',');
        return { name: parts[0], depth: parseInt(parts[6], 10) }; });

    // find target server by name
    const targetServer = servers.find(srv => srv.name === targetServerName);
    if (!targetServer) { ns.tprint(`ERROR: The target server '${targetServerName}' was not found in the server list.`); return; }

    // Function to recursively find the path to 'home'
    function findPathToHome(currentServer, serverList) {
        if (currentServer.depth === 0) return [currentServer.name]; // We've reached 'home'
        
        // Search upwards in the list for the next server with a lower depth
        let nextServerIndex = serverList.findIndex(srv => srv.name === currentServer.name) - 1;
        while (nextServerIndex >= 0 && serverList[nextServerIndex].depth >= currentServer.depth) {
            nextServerIndex--;
        }
        if (nextServerIndex < 0) {
            throw new Error(`No server found with lower depth than '${currentServer.name}'`);
        }
        const nextServer = serverList[nextServerIndex];
        return [...findPathToHome(nextServer, serverList), currentServer.name];
    }

    // Construct the path from the target server to 'home'
    let path;
    try {
        path = findPathToHome(targetServer, servers);
    } catch (error) {
        ns.tprint(error.message);
        return;
    }

    // list of path to target: path.slice(1);
    ns.tprint(path.slice(1));
}
