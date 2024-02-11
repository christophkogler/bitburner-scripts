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

    const serverLines = serverListContent.split('\n') // Split the file into lines
                          .slice(1) // Skip the header line
                          .filter(line => line.trim() !== ''); // Remove any empty lines

    const servers = serverLines.map(line => {
        const parts = line.split(',');
        return {
            name: parts[0],
            depth: parseInt(parts[6], 10) // Assuming the depth is the 7th field (index 6)
        };
    });

    const targetServer = servers.find(srv => srv.name === targetServerName);
    if (!targetServer) {
        ns.tprint(`ERROR: The target server '${targetServerName}' was not found in the server list.`);
        return;
    }

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

    // Format the connection string
    // Reverse the path to start from 'home' and move towards the target server
    //const reversedPath = path.reverse().slice(1); // Remove 'home' as it's our starting point
    const connectChain = path.slice(1).map(srv => `connect ${srv}`).join('; ');

    ns.tprint(connectChain);
}
