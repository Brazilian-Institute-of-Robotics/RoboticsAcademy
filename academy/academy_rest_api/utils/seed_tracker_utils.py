import os

TRACKER_FILE_PATH  = "exercises/fixtures/personalSeedTracker/last_seed_executed.txt"
SEEDS_PATH = "exercises/fixtures"

# Return SEED_NAME.json
def getLastSeedExecuted():
    with open(TRACKER_FILE_PATH, "r", encoding="utf-8") as f:
        last_seed_executed_name = f.readline().strip()
    return last_seed_executed_name

# The seed_name must be SEED_NAME.json
def updateTrackerFile(seed_name):
    with open(TRACKER_FILE_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    if not lines:
        lines = [seed_name + "\n"]
    else:
        lines[0] = seed_name + "\n"

    with open(TRACKER_FILE_PATH, "w", encoding="utf-8") as f:
        f.writelines(lines)

#Delete newest seed and update tracker file to previous seed
def rollbackSeed():
    current_seed_name = getLastSeedExecuted()
    current_seed_path = f'{SEEDS_PATH}/{current_seed_name}'

    list_seeds = [
        f for f in os.listdir(SEEDS_PATH)
        if f.startswith("Seed_") and f.endswith(".json")
    ]

    list_seeds.sort()
    index = list_seeds.index(current_seed_name)

    previous_seed_path = list_seeds[index - 1]
    previous_seed_name = os.path.basename(previous_seed_path)

    #Delete current seed file
    os.remove(current_seed_path)

    #Tracker file point to previous seed file
    updateTrackerFile(previous_seed_name)