import os
import shutil
from exercises.models import Exercise, Universe, World, Robot, GuidePageCategory
from django.db import transaction
from django.conf import settings

def createExerciseDatabase(exercise_id, exercise_name, exercise_description,
       universe_name, launcher_name, category_id):
    try:
        exercise_exists = Exercise.objects.filter(exercise_id=exercise_id).exists()
        universe_exists = Universe.objects.filter(name=universe_name).exists()
        world_exists = World.objects.filter(name=universe_name).exists()
        guide_category = GuidePageCategory.objects.filter(id=category_id).first()

        if exercise_exists:
            return {'success': 0, 'exists': 1, 'error': 'There is a exercise with this name', 'details': 'There is a exercise with this name'}
        if universe_exists:
            return {'success': 0, 'exists': 1, 'error': 'There is a universe with this name', 'details': 'There is a universe with this name'}
        if world_exists:
            return {'success': 0, 'exists': 1, 'error': 'There is a world with this name', 'details': 'There is a world with this name'}
        if guide_category == None:
            return {'success': 0, 'exists': 0, 'error': 'There is no category with this id', 'details': 'There is no category with this id'}
        
        with transaction.atomic():
            world = World.objects.create(
                name=universe_name,
                launch_file_path=f"/opt/jderobot/Launchers/{launcher_name}.launch.py",
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
                name=universe_name,
                world=world,
                robot=robot
            )

            exercise = Exercise.objects.create(
                exercise_id=exercise_id,
                name=exercise_name,
                description=exercise_description,
                tags='{"tags": "ROS2"}',
                status="ACTIVE",
                template=f"RoboticsAcademy/exercises/static/exercises/{exercise_id}/python_template/",
                guide_page_category=guide_category,
            )

            exercise.universes.add(universe)
            return {'success': 1, 'exists': 0}
        
    except Exception as e:
        return {'success': 0, 'exists': 0, 'error': 'Fail to create exercise in database',  'details': str(e)}



def createExerciseTemplate(exercise_id, category_id, uses_camera):

    category = None

    try:
        category = GuidePageCategory.objects.filter(id=category_id).first()
        if category == None:
            return {
                'success': 0, 'error': 
                'There is no find guide page category with this id', 'details': 'There is no find guide page category with this id'
            }
    except Exception as e:
        return {'success': 0, 'error': 'Fail to find guide page category', 'details': f'{str(e)}'}

    template_base_path = '/RoboticsAcademy/exercises/templates'
    exercises_dir = os.path.join(template_base_path, 'exercises')
    new_exercise_path = os.path.join(exercises_dir, exercise_id)

    # Verify if template base path exists
    if not os.path.exists(template_base_path):
        return {'success': 0, 'error': 'Template base path not found.' ,'details': 'Template base path not found.'}

    # Delete old folder if exists
    if os.path.exists(new_exercise_path):
        shutil.rmtree(new_exercise_path)

    # Create new folder for exercise
    try:
        os.makedirs(new_exercise_path, exist_ok=False)
    except OSError as e:
        return {'success': 0, 'error': 'Fail to create exercise template directory', 'details': f'{str(e)}'}

    # What base template will be use, case exercise's robot uses camera, than base_with_camera.html,
    # otherwise, base.html
    template_file_name = "base_with_camera.html" if uses_camera == True else "base.html"

    template_base_path = os.path.join(exercises_dir, template_file_name)
    destination_template = os.path.join(new_exercise_path, 'exercise.html')

    # Copy template base file on exercise template directory as exercise.html
    try:
        shutil.copyfile(template_base_path, destination_template)
    except IOError as e:
        return {'success': 0, 'error': f'Fail to copy {template_base_path} to exercise template directory', 'details': f'{str(e)}'}

    # Changes contents inside exercise.html
    try:
        with open(destination_template, 'r') as file:
            content = file.read()
        
        # Find on file the string '!EXERCISE_NAME!' and replace for exercise_id
        content = content.replace('!EXERCISE_NAME!', exercise_id)

        # Find on file the string '!EXERCISE_GUIDE_PATH!' and replace for /{category_identify}/{exercise_id}
        content = content.replace('!EXERCISE_GUIDE_PATH!', f'/{category.category_identify}/{exercise_id}')
        
        with open(destination_template, 'w') as file:
            file.write(content)
    
    except IOError as e:
        return {'success': 0, 'error': 'Fail to change exercise.html', 'details': f'{str(e)}'}
    
    return {'success': 1,}

def createExerciseStatic(exercise_id, hal_code, teaser_img_file, uses_camera):
    try:
        static_base_path = '/RoboticsAcademy/exercises/static'
        exercises_dir = os.path.join(static_base_path, 'exercises')
        new_exercise_path = os.path.join(exercises_dir, exercise_id)

        python_code_path = os.path.join(new_exercise_path, "python_template", "ros2_humble")
        resources_path = os.path.join(new_exercise_path, "resources")
        react_code_path = os.path.join(new_exercise_path, "react-components")
        css_path = os.path.join(react_code_path, "css")

        # Delete old folder if exists
        if os.path.exists(new_exercise_path):
            shutil.rmtree(new_exercise_path)

        # Create directories
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

        # Case exercise uses camera, component responsible for show camera's image is copy
        # on exercise static folder
        if uses_camera == True:
            image_canvas_component = os.path.join(static_base_path, 'ImageCanvas.js')
            destination = os.path.join(react_code_path, 'ImageCanvas.js')
            shutil.copyfile(image_canvas_component, destination)
            
            image_canvas_css = os.path.join(static_base_path, 'Canvas.css')
            destination = os.path.join(css_path, 'Canvas.css')
            shutil.copyfile(image_canvas_css, destination)
        
        #GUI.py
        base_gui_path = os.path.join(static_base_path, 'base_gui_files', 'base_gui.py')
        destination = os.path.join(python_code_path, 'GUI.py')
        shutil.copyfile(base_gui_path, destination)

        #HAL.py
        hal_path = os.path.join(python_code_path, 'HAL.py')
        with open(hal_path, "w") as f:
            f.write(hal_code)
        
        #Exercise teaser image
        img_teaser_path = os.path.join(exercises_dir, "assets", "img", f'{exercise_id}_teaser.png')
        if os.path.isfile(img_teaser_path):
            os.remove(img_teaser_path)

        with open(img_teaser_path, 'wb+') as dest:
            for chunk in teaser_img_file.chunks():
                dest.write(chunk)

        return {'success': 1,}
    except OSError as e:
        return {'success': 0, 'error': 'Fail to create directory', 'details': f'{str(e)}'}
    except Exception as e:
        return {'success': 0, 'error': 'Unexpected problem', 'details': f'{str(e)}'}

def createExerciseLauncher(launcher_name):
    try:
        launchers_path = '/Infrastructure/Launchers'
        base_launcher_path = os.path.join(launchers_path, 'base_launch', 'base.launch.py')
        exercise_launcher_path = os.path.join(launchers_path, f'{launcher_name}.launch.py')

       # Check if exercise's launcher exits and delete
        if os.path.isfile(exercise_launcher_path):
            os.remove(exercise_launcher_path)

        # Copy base.launch.py on exercise template directory as {launcher_name}.launch.py
        try:
            shutil.copyfile(base_launcher_path, exercise_launcher_path)
        except IOError as e:
            return {'success': 0, 'error': 'Fail to copy base_launch.py to exercise template directory', 'details': f'{str(e)}'}
        
        # Changes contents inside exercise.html
        try:
            with open(exercise_launcher_path, 'r') as file:
                content = file.read()
            
            content = content.replace('!WORLD_NAME!', launcher_name)
            
            with open(exercise_launcher_path, 'w') as file:
                file.write(content)
        except IOError as e:
            return {'success': 0, 'error': f'Fail to change {launcher_name}.launch.py', 'details': f'{str(e)}'}
        
        return {'success': 1,}

    except Exception as e:
        return {'success': 0, 'exists': 1, 'error': 'Unexpected problem', 'details': f'{e}'}

def createExerciseWorld(world_name, world_file):
    try:
        exercise_world_path = os.path.join('/Infrastructure/Worlds', f'{world_name}.world')

        # Check if exercise's world exists and delete
        if os.path.isfile(exercise_world_path):
            os.remove(exercise_world_path)

        with open(exercise_world_path, 'wb+') as dest:
            for chunk in world_file.chunks():
                dest.write(chunk)

        return {'success': 1,}
    except Exception as e:
        return {'success': 0, 'exists': 1, 'error': 'Unexpected problem', 'details': f'{e}'}

def createExerciseGuidePage(
        exercise_id, exercise_name, exercise_description, category_id, 
        guide_page_files, guide_page_code, teaser_img_file):
    try:

        #CREATE FOLDER TO GUIDE PAGE IMAGES
        exercise_guide_files_dir = os.path.join('/GuidePages/assets/images/exercises', f'{exercise_id}')
        os.makedirs(exercise_guide_files_dir, exist_ok=False)

        #COPY FILES ON NEW IMAGE FOLDER
        for file in guide_page_files:
            file_path = os.path.join(exercise_guide_files_dir, file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

        #COPY TEASER IMAGE ON NEW FOLDER
        img_teaser_path = os.path.join(exercise_guide_files_dir, f'{exercise_id}_teaser.png')
        with open(img_teaser_path, 'wb+') as dest:
            for chunk in teaser_img_file.chunks():
                dest.write(chunk)
        
        category = GuidePageCategory.objects.filter(id=category_id).first()
        
        #ADD NEW EXERCISE ON MARKDOWN FILE THAT CONTAINS LIST OF EXERCISES
        addExerciseOnGuideList(exercise_id, exercise_name, exercise_description, category)

        #CREATE EXERCISE GUIDE PAGE FILE
        markdown_path = os.path.join(f'/GuidePages/_pages/exercises/{category.category_identify}', f'{exercise_id}.md')

        if os.path.isfile(markdown_path):
            os.remove(markdown_path)
        
        with open(markdown_path, "w") as f:
            f.write(guide_page_code)


        return {'success': 1,}
    except Exception as e:
        return {'success': 0, 'exists': 1, 'error': 'Failt to create guide page', 'details': f'{e}'}


def deleteExercise(exercise_name):

    moved_paths = []
    exercises_md_path = "/GuidePages/_pages/exercises.md"
    exercises_md_backup = f"{exercises_md_path}.bak"

    try:
        exercise = Exercise.objects.filter(exercise_id=exercise_name).first()

        if not exercise:
            return {
                'success': 0,
                'exists': 0,
                'error': f'There is no exercise with this name ({exercise_name})',
                'details': f'There is no exercise with this name ({exercise_name})'
            }
        
        category_identify = exercise.guide_page_category.category_identify

        #Object with path of all files and folders used by exercise
        original_paths = {
            'template': os.path.join('/RoboticsAcademy/exercises/templates/exercises', exercise.exercise_id),
            'static': os.path.join('/RoboticsAcademy/exercises/static/exercises', exercise.exercise_id),
            'teaser_image': os.path.join('/RoboticsAcademy/exercises/static/exercises/assets/img', f'{exercise.exercise_id}_teaser.png'),
            'guide_images': os.path.join('/GuidePages/assets/images/exercises', exercise.exercise_id),
            'guide_page': os.path.join('/GuidePages/_pages/exercises', category_identify, f'{exercise.exercise_id}.md'),
        }

        # Add all launchers and worlds files associated with exercises on original_paths array
        universes = exercise.universes.select_related('world').all()
        for universe in universes:
            if universe.world and universe.world.launch_file_path:
                launch_path = universe.world.launch_file_path
                file_name = os.path.splitext(os.path.splitext(os.path.basename(launch_path))[0])[0]
                original_paths[f'launcher__{file_name}'] = os.path.join('/Infrastructure/Launchers', f'{file_name}.launch.py')
                original_paths[f'world__{file_name}'] = os.path.join('/Infrastructure/Worlds', f'{file_name}.world')
        
        # Create a temporary path to exercises files
        TRASH_BASE = '/tmp/deleted_exercises'
        trash_dir = os.path.join(TRASH_BASE, exercise.exercise_id)
        os.makedirs(trash_dir, exist_ok=True)

    
        # Moves exercises files to temporary directory and test if they are deletable
        for label, path in original_paths.items():
            if os.path.exists(path):
                trash_path = os.path.join(trash_dir, f"{label}__{os.path.basename(path)}")
                shutil.move(path, trash_path)
                moved_paths.append((trash_path, path))
                if not test_file_deletable(trash_path):
                    raise Exception(f"File not deletable: {trash_path}")
        
        # Creates a backup file of exercises.md and removes
        # this exercises from it
        shutil.copy2(exercises_md_path, exercises_md_backup)
        removeExerciseOnGuideList(exercises_md_path, exercise.exercise_id)

        # Make db transaction to delete exercise, universes and worlds
        with transaction.atomic():
            universes = exercise.universes.all()
            for universe in universes:
                if getattr(universe, 'world', None):
                    universe.world.delete()
                universe.delete()
            exercise.delete()

            # Function to delete temporary path and
            # exercise.md backup
            def finalize_deletion():
                try:
                    shutil.rmtree(trash_dir)
                    if os.path.exists(exercises_md_backup):
                        os.remove(exercises_md_backup)

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

        # Restaurar exercises.md a partir do backup
        if os.path.exists(exercises_md_backup):
            shutil.copy2(exercises_md_backup, exercises_md_path)
            os.remove(exercises_md_backup)
        
        return {
            'success': 0,
            'exists': 1,
            'error': 'Aborted due to undeletable file or other error',
            'details': str(e)
        }


#BELLOW HERE ARE FUNCTION TO ONLY USE IS THIS FILE

# Modify exercise.md to add a new exercise
def addExerciseOnGuideList(exercise_id, exercise_name, exercise_description, category):
    image_path = f'/assets/images/exercises/{exercise_id}/{exercise_id}_teaser.png'
    guide_page_path = f'/exercises/{category.category_identify}/{exercise_id}/'

    new_entry = (
        "\n" + f"  - image_path: {image_path}" + 
        "\n" + f"    alt: {exercise_name}" +
        "\n" + f"    title: {exercise_name}" +
        "\n" + f"    excerpt: {exercise_description}" +
        "\n" + f"    url: {guide_page_path}" +
        "\n" +  '    btn_class: "btn--danger"' +
        "\n" +  '    btn_label: "Go!"' +
        "\n" +  '    version_label: "btn--success"' +
        "\n" +  '    status: "running"' +
        "\n" +  '    order: 0;'
    )

    exercise_list_page_path = "/GuidePages/_pages/exercises.md"

    with open(exercise_list_page_path, 'r') as file:
        content = file.read()
    
    # Encontra o início do bloco feature_row
    feature_row_index = content.find("feature_row:")
    if feature_row_index == -1:
        raise ValueError("feature_row not found in the markdown file.")

    # Divide o conteúdo antes e depois do feature_row
    before = content[:feature_row_index]
    after = content[feature_row_index:]

    # Localiza o final do front matter (---) se houver
    end_of_front_matter = after.find('---', 3)
    if end_of_front_matter != -1:
        feature_rows = after[:end_of_front_matter]
        body = after[end_of_front_matter:]
    else:
        feature_rows = after
        body = ""

    # Adiciona o novo bloco
    updated_feature_rows = feature_rows.rstrip() + '\n' + new_entry + '\n'

    # Reconstroi o conteúdo final
    new_content = before + updated_feature_rows + body

    # Salva de volta
    with open(exercise_list_page_path, 'w', encoding='utf-8') as f:
        f.write(new_content)


# Modify exercise.md to remove a exercise from list
def removeExerciseOnGuideList(exercises_md_path, exercise_name):

    with open(exercises_md_path, "r") as f:
        lines = f.readlines()

    image_path_line = f"- image_path: /assets/images/exercises/{exercise_name}/{exercise_name}_teaser.png\n"
    new_lines = []
    skip_count = 0

    for line in lines:
        if skip_count > 0:
            skip_count -= 1
            continue
        if line.strip() == image_path_line.strip():
            skip_count = 9
            continue
        new_lines.append(line)

    with open(exercises_md_path, "w") as f:
        f.writelines(new_lines)

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
    
