# Explanation

This folder is where all seed files to database are stored. When the API is used to create/delete/update the database, a new seed is generated to be commited later. This seeds are executed when webapp container starts, more especifically, the entrypoint uses the script run_seeds.sh.

The tracker of last seed executed is made throught the file last_seed_executed.txt, inside the folder personalSeedTracker in this directory. Both file and directory will only be created when run the app for the first time.