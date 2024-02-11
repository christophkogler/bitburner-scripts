# bitburner-scripts
Collection of personal BitBurner scripts remaining after completing most of the game.  
All scripts should be placed in the base folder of the home server. Placing them in a subdirectory (ie /earlygame/...) or operating them from a remote server (ie running on n00dles) is **not tested**.

# easyRun
The script named 'easyRun.js' is used for turning the RAM costs linked to functions dynamic. It must be present for most of these scripts to function.  

easyRun will generate a library of 'helper' scripts. These scripts essentially act as a API layer for accessing the base game functions, allowing for ghost workers which process a single function before dying instantly, and then return on a port. This methodology allows the 'main' script which is calling the functions to only use as much RAM as any _individual_ function would require at once + ~5GB.  

# dev-menu
This script allows opening a dev menu containing controls for most mechanics in the game, and some spoilers. (Functional as of 02/10/24)
