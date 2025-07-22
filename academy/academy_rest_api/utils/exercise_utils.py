import os
import shutil
from exercises.models import Exercise, Universe, World, Robot
from django.db import transaction
from django.conf import settings


def createExerciseDatabase(exercise_name):
    try:
        exercise_exists = Exercise.objects.filter(exercise_id=exercise_name).exists()
        if exercise_exists:
          return {'success': 0, 'exists': 1, 'error': 'There is a exercise with this name', 'details': 'There is a exercise with this name'}
        
        with transaction.atomic():
            world = World.objects.create(
                name=exercise_name,
                launch_file_path=f"/opt/jderobot/Launchers/{exercise_name}.launch.py",
                visualization_config_path="None",
                ros_version="ROS2",
                visualization="gazebo_rae",
                world="gazebo",
                start_pose=[0,0,0,0,0,0]
            )

            robot = Robot.objects.first() or Robot.objects.create(
                name="useless",
                model="needless",
                ip="0.0.0.0"
            )

            universe = Universe.objects.create(
                name=exercise_name,
                world=world,
                robot=robot
            )

            exercise = Exercise.objects.create(
                exercise_id=exercise_name,
                name=exercise_name,
                description=exercise_name,
                tags='{"tags": "ROS2"}',
                status="ACTIVE",
                template=f"RoboticsAcademy/exercises/static/exercises/{exercise_name}/python_template/",
            )

            exercise.universes.add(universe)
            return {'success': 1, 'exists': 0}
        
    except Exception as e:
        return {'success': 0, 'exists': 0, 'error': 'Fail to create exercise in database',  'details': str(e)}



def createExerciseTemplate(exercise_name):
    template_base_path = '/RoboticsAcademy/exercises/templates'
    exercises_dir = os.path.join(template_base_path, 'exercises')
    new_exercise_path = os.path.join(exercises_dir, exercise_name)

    # Verificar se template base existe
    if not os.path.exists(template_base_path):
        return {'success': 0, 'error': 'Template base path not found.' ,'details': 'Template base path not found.'}

    # Delete old folder if exists
    if os.path.exists(new_exercise_path):
        shutil.rmtree(new_exercise_path)

    # Create new folder
    try:
        os.makedirs(new_exercise_path, exist_ok=False)
    except OSError as e:
        return {'success': 0, 'error': 'Fail to create exercise template directory', 'details': f'{str(e)}'}

    template_base_path = os.path.join(exercises_dir, 'base.html')
    destination_template = os.path.join(new_exercise_path, 'exercise.html')

    # Copy base.html on exercise template directory as exercise.html
    try:
        shutil.copyfile(template_base_path, destination_template)
    except IOError as e:
        return {'success': 0, 'error': 'Fail to copy base.html to exercise template directory', 'details': f'{str(e)}'}

    # Changes contents inside exercise.html
    try:
        with open(destination_template, 'r') as file:
            content = file.read()
        
        content = content.replace('!EXERCISE_NAME!', exercise_name)
        
        with open(destination_template, 'w') as file:
            file.write(content)
    except IOError as e:
        return {'success': 0, 'error': 'Fail to change exercise.html', 'details': f'{str(e)}'}
    
    return {'success': 1,}

def createExerciseStatic(exercise_name):
    try:
        static_base_path = '/RoboticsAcademy/exercises/static'
        exercises_dir = os.path.join(static_base_path, 'exercises')
        new_exercise_path = os.path.join(exercises_dir, exercise_name)

        python_code_path = os.path.join(new_exercise_path, "python_template", "ros2_humble")
        resources_path = os.path.join(new_exercise_path, "resources")
        react_code_path = os.path.join(new_exercise_path, "react-components")
        css_path = os.path.join(react_code_path, "css")

        # Delete old folder if exists
        if os.path.exists(new_exercise_path):
            shutil.rmtree(new_exercise_path)

        os.makedirs(new_exercise_path, exist_ok=False)
        os.makedirs(python_code_path, exist_ok=False)
        os.makedirs(react_code_path, exist_ok=False)
        os.makedirs(css_path, exist_ok=False)
        os.makedirs(resources_path, exist_ok=False)
    
        #React component
        base_template = os.path.join(static_base_path, 'ReactParentComponent.js')
        destination_template = os.path.join(react_code_path, 'ReactParentComponent.js')
        shutil.copyfile(base_template, destination_template)

        #CSS
        base_template = os.path.join(static_base_path, 'ReactParentComponent.css')
        destination_template = os.path.join(react_code_path, 'css', 'ReactParentComponent.css')
        shutil.copyfile(base_template, destination_template)

        return {'success': 1,}
    except OSError as e:
        return {'success': 0, 'error': 'Fail to create directory', 'details': f'{str(e)}'}
    except Exception as e:
        return {'success': 0, 'error': 'Unexpected problem', 'details': f'{str(e)}'}

def createExerciseLauncher(exercise_name):
    try:
        launchers_path = '/Infrastructure/Launchers'
        base_launcher_path = os.path.join(launchers_path, 'base_launch', 'base.launch.py')
        exercise_launcher_path = os.path.join(launchers_path, f'{exercise_name}.launch.py')

       # Check if exercise's launcher exits and delete
        if os.path.isfile(exercise_launcher_path):
            os.remove(exercise_launcher_path)

        # Copy base.launch.py on exercise template directory as {exercise_name}.launch.py
        try:
            shutil.copyfile(base_launcher_path, exercise_launcher_path)
        except IOError as e:
            return {'success': 0, 'error': 'Fail to copy base_launch.py to exercise template directory', 'details': f'{str(e)}'}
        
        # Changes contents inside exercise.html
        try:
            with open(exercise_launcher_path, 'r') as file:
                content = file.read()
            
            content = content.replace('!WORLD_NAME!', exercise_name)
            
            with open(exercise_launcher_path, 'w') as file:
                file.write(content)
        except IOError as e:
            return {'success': 0, 'error': f'Fail to change {exercise_name}.launch.py', 'details': f'{str(e)}'}
        
        return {'success': 1,}

    except Exception as e:
        return {'success': 0, 'exists': 1, 'error': 'Unexpected problem', 'details': f'{e}'}

def createExerciseWorld(exercise_name, world_file):
    try:
        exercise_world_path = os.path.join('/Infrastructure/Worlds', f'{exercise_name}.world')

        # Check if exercise's world exists and delete
        if os.path.isfile(exercise_world_path):
            os.remove(exercise_world_path)

        with open(exercise_world_path, 'wb+') as dest:
            for chunk in world_file.chunks():
                dest.write(chunk)

        return {'success': 1,}
    except Exception as e:
        return {'success': 0, 'exists': 1, 'error': 'Unexpected problem', 'details': f'{e}'}

def deleteExercise(exercise_name):
    
    exercise = Exercise.objects.filter(exercise_id=exercise_name).first()
    if not exercise:
        return {
            'success': 0,
            'exists': 0,
            'error': f'There is no exercise with this name ({exercise_name})',
            'details': f'There is no exercise with this name ({exercise_name})'
        }

    original_paths = {
        'template': os.path.join('/RoboticsAcademy/exercises/templates', 'exercises', exercise_name),
        'static': os.path.join('/RoboticsAcademy/exercises/static', 'exercises', exercise_name),
        'launcher': os.path.join('/Infrastructure/Launchers', f'{exercise_name}.launch.py'),
        'world': os.path.join('/Infrastructure/Worlds', f'{exercise_name}.world'),
    }
    
    # Create a temporary path to exercises files
    TRASH_BASE = '/tmp/deleted_exercises'
    trash_dir = os.path.join(TRASH_BASE, exercise_name)
    os.makedirs(trash_dir, exist_ok=True)
    moved_paths = []

    try:
        # Moves exercises files to temporary directory and test if they are deletable
        for label, path in original_paths.items():
            if os.path.exists(path):
                trash_path = os.path.join(trash_dir, f"{label}__{os.path.basename(path)}")
                shutil.move(path, trash_path)
                moved_paths.append((trash_path, path))
                if not test_file_deletable(trash_path):
                    raise Exception(f"File not deletable: {trash_path}")

        # Make db transaction to delete exercise, universes and worlds
        with transaction.atomic():
            universes = exercise.universes.all()
            for universe in universes:
                if getattr(universe, 'world', None):
                    universe.world.delete()
                universe.delete()
            exercise.delete()

            #Function to delete temporary path
            def finalize_deletion():
                try:
                    shutil.rmtree(trash_dir)
                except Exception as cleanup_error:
                    return {
                        'success': 0,
                        'exists': 1,
                        'error': f'Could not delete trash dir {trash_dir}: {cleanup_error}',
                        'details': str(e)
                    }
                
            # Ensure finalize_deletion() only executes if db transaction succeed
            transaction.on_commit(finalize_deletion)

        return {'success': 1}

    except Exception as e:

        # Restore exercises files to original path
        for trash_path, original_path in moved_paths:
            try:
                shutil.move(trash_path, original_path)
            except Exception as restore_error:
                return {
                    'success': 0,
                    'exists': 1,
                    'error': f'Failed to restore {original_path} from trash: {restore_error}',
                    'details': str(e)
                }

        return {
            'success': 0,
            'exists': 1,
            'error': 'Aborted due to undeletable file or other error',
            'details': str(e)
        }

# Verify if file or folder in path is deletable
def test_file_deletable(path):
    try:
        if os.path.isdir(path):
            os.listdir(path)
        elif os.path.isfile(path):
            with open(path, 'rb'):
                pass
        return True
    except Exception as e:
        return False
    
