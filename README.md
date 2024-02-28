# bitburner-scripts
This repository is a collection of personal BitBurner scripts remaining after completing most of the game.  
All scripts should be run from the base directory of the home server. Placing them in a subdirectory (ie /earlygame/...) or operating them from a remote server (ie running on n00dles) is **not tested**.

# drop-in-attack-server
A batcher designed to literally drop in to a save and function. Uses 14.5GB, will batch using as much network RAM as necessary / available.

# easyRun
The script named 'easyRun.js' is used for turning the RAM costs linked to functions dynamic. It must be present for most of these scripts to function.  

easyRun will generate a library of 'helper' scripts as functions are called through it. These scripts essentially act as a API layer for accessing the base game functions, allowing for ghost workers which process a single function before dying instantly, and then return on a port. This methodology allows the 'main' script which is calling the functions to only use as much RAM as any _individual_ function would require at once + ~5GB. 

# earlygame
Scripts using mechanics solely from the early game, before seeing the truth.

# lategame
Scripts for mechanics from lategame.
 
# dev-menu
This script allows opening a dev menu containing controls for most mechanics in the game, so some spoilers. Should remain functional until breaking 'webpack' changes.

# noodle-daemon
An example of a dom exploit to eat noodles very fast. Yummy yummy!
