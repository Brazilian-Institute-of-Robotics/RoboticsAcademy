import os
import shutil
from exercises.models import Exercise, Universe, World, Robot
from django.db import transaction


def createExerciseDatabase(exercise_name):
    try:
        exercise_exists = Exercise.objects.filter(exercise_id=exercise_name).exists()
        if exercise_exists:
          return {'success': 0, 'error': 'There is a exercise with this name', 'details': 'There is a exercise with this name'}
        
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
            return {'success': 1,}
        
    except Exception as e:
        return {'success': 0, 'error': 'Fail to create exercise in database',  'details': str(e)}



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

def deleteExercise(exercise_name):
    try:
        exercise = Exercise.objects.filter(exercise_id=exercise_name).first()
        if exercise:
            with transaction.atomic():
                universes = exercise.universes.all()
                for universe in universes:
                    # Deleta world associado
                    if getattr(universe, 'world', None):
                        universe.world.delete()
                    universe.delete()
            
                exercise.delete()
                template_exercise_dir = os.path.join('/RoboticsAcademy/exercises/templates', 'exercises', exercise_name)
                static_exercise_dir = os.path.join('/RoboticsAcademy/exercises/static', 'exercises', exercise_name)

                # Check if exercise's template directory and delete
                if os.path.exists(template_exercise_dir):
                    shutil.rmtree(template_exercise_dir)

                # Check if exercise's static directory and delete
                if os.path.exists(static_exercise_dir):
                    shutil.rmtree(static_exercise_dir)
            
            return {'success': 1,}
        
        return {
            'success': 0,
            'exists': 0,
            'error': f'There is no exercise with this name ({exercise_name})', 
            'details': f'There is no exercise with this name ({exercise_name})'
        }
    except Exception as e:
        #Case fails, recreate exercises directories
        createExerciseTemplate(exercise_name)
        createExerciseStatic(exercise_name)
        return {'success': 0, 'exists': 1, 'error': 'Unexpected problem', 'details': f'{e}'}
    
