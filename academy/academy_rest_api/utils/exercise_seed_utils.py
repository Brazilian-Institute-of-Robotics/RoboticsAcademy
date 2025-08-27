import os
import json
from datetime import datetime
from django.apps import apps

from academy.academy_rest_api.utils import seed_tracker_utils as SeedTrackerUtils 

# Receives a model object and returns his natural key has a list
def _nk(obj):
    if not hasattr(obj, "natural_key"):
        raise TypeError(f"{obj.__class__.__name__} doesn't have function natural_key().")
    
    nk = obj.natural_key()

    if not isinstance(nk, tuple):
        raise TypeError(f"{obj.__class__.__name__}.natural_key() must return a tuple. Returned value: {type(nk).__name__}: {nk}")
    
    return list(nk)

#Create new seed of creation new exercise
def writeCreationSeed(exercise, universe, world, robot, guide_category):
    items = []

    # WORLD
    items.append({
        "model": f"{world._meta.app_label}.{world._meta.model_name}",
        "fields": {
            "name": world.name,
            "launch_file_path": world.launch_file_path,
            "visualization_config_path": world.visualization_config_path,
            "ros_version": world.ros_version,
            "visualization": world.visualization,
            "world": world.world,
            "start_pose": world.start_pose,
        },
    })

    # ROBOT
    items.append({
        "model": f"{robot._meta.app_label}.{robot._meta.model_name}",
        "fields": {
            "name": robot.name,
            "launch_file_path": robot.launch_file_path,
        },
    })

    # UNIVERSE
    items.append({
        "model": f"{universe._meta.app_label}.{universe._meta.model_name}",
        "fields": {
            "name": universe.name,
            "world": _nk(world),
            "robot": _nk(robot),
        },
    })

    # EXERCISE
    items.append({
        "model": f"{exercise._meta.app_label}.{exercise._meta.model_name}",
        "fields": {
            "exercise_id": exercise.exercise_id,
            "name": exercise.name,
            "description": exercise.description,
            "tags": exercise.tags,
            "status": exercise.status,
            "template": exercise.template,
            "guide_page_category": _nk(guide_category),
            "universes": [_nk(universe)],
        },
    })

    #Garantees seed folder exists
    fixtures_dir = os.path.join("exercises", "fixtures")
    os.makedirs(fixtures_dir, exist_ok=True)

    date_hour = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_seed_name = f"Seed_{date_hour}_{exercise.exercise_id}.json"

    #Creates new seed file
    path = os.path.join(fixtures_dir, new_seed_name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    
    #Update seed tracker file with new seed
    SeedTrackerUtils.updateTrackerFile(new_seed_name)
    
    
        
