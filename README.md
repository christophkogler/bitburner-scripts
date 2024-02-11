# bitburner-scripts
Collection of personal BitBurner scripts.

The script named 'easyRun.js' is used for turning the RAM costs linked to functions dynamic. 
It must be present for most of these scripts to function.

easyRun will generate a library of 'helper' scripts.
These scripts essentially act as a API layer for accessing the base game functions, allowing for ghost workers which process a single function before dying instantly, and then return on a port.
This methodology allows the 'main' script which is calling the functions to only use as much RAM as any _individual_ function would require at once + ~5GB.
