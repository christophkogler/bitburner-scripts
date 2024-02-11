/** @param {NS} ns */
export async function easyRun(ns, functionName, ...moreArgs){
  if (!ns.ls("home").includes(`helpers/${functionName}.js`)){ // if the script doesnt exist
    ns.tprint(`easyRun: Creating 'helpers/${functionName}.js'.`)
    await formatHelperScript(ns, `helpers/${functionName}.js`); // create the file.
  }

  const scriptName = "/helpers/" + functionName + ".js";
  let scriptPID = 0;

  try{ scriptPID = ns.run(scriptName, 1, ...moreArgs); } 
  catch (error) {ns.print("ERROR: "+error); }

  if (scriptPID === 0) {
    ns.print(`ERROR! EASYRUN FOR ${functionName} FAILED! OOM/BAD ARGS?
EASYRUN ARGS: scriptName: ${scriptName}, ...moreArgs: ${moreArgs}`);
    return;
  }else{
    const PORT_NUMBER = scriptPID;                        // ghost script PID
    const DATA_PORT = ns.getPortHandle(PORT_NUMBER);      // create port handle
    await DATA_PORT.nextWrite();                          // wait for our running script to respond...

    const dataFound = DATA_PORT.read(); // what did it say?
    if (dataFound === "NULL PORT DATA"){ // if NOTHING?!?! give big, noticable error
      const errorString = `ERROR! SCRIPT ${functionName} WITH ARGS ${moreArgs} RETURNED NULL PORT DATA`
      ns.print(errorString);  ns.tprint(errorString);
      return; 
    }
    else { return JSON.parse(dataFound) } // else return response (kills promises)
  }

}

/** @param {NS} ns */
export async function formatHelperScript(ns, script) {
  // Validate if the script parameter is provided
  if (!script) {
    ns.tprint("Format script given no file name.");
    return;
  }

  // Extract the namespace and function name
  const parts = script.split('/'); // ["helpers", "namespace", "function.js"]
  const namespace = parts[1];
  const functionName = parts[2].replace('.js', '');

  // Determine if the function is in the 'ns' namespace
  const isNsNamespace = (namespace === "ns");

  // Compose the formatted string based on the namespace
  let functionCall = isNsNamespace ?
    `response = await ns.${functionName}(...functionArgs);` : // if in ns namespace
    `response = await ns.${namespace}.${functionName}(...functionArgs);`; // if in any other namespace

  // Generate the new content for the file
  let newContent = `/** @param {NS} ns */
export async function main(ns) {
  // Extract the first argument as the return port number.
  const returnPort = ns.pid;
  // Remove the first argument (port number) from the arguments array.
  const functionArgs = ns.args;
  let response;
  try {
    ${functionCall}
    // Check if response is undefined; return true in this case (handle void funcs)
    response = (response === undefined) ? true : response;
  } catch (error) {
    response = error;
  }
  // Send the response to the specified port before exiting.
  ns.atExit(() => { ns.writePort(returnPort, JSON.stringify(response)); });
}`;

  // Write content to the new file
  await ns.write(`helpers/${namespace}/${functionName}.js`, newContent, "w");
}
