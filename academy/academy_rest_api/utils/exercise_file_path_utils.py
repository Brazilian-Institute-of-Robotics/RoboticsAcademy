import os

# Return all path of files/directories related to this exercice
def getExercisesFilesPath(exercise, universes_list):
    
    category_identify = exercise.guide_page_category.category_identify

    #Object with path of all files and folders used by exercise
    original_paths = {
        'template': os.path.join('/RoboticsAcademy/exercises/templates/exercises', exercise.exercise_id),
        'static': os.path.join('/RoboticsAcademy/exercises/static/exercises', exercise.exercise_id),
        'teaser_image': os.path.join('/RoboticsAcademy/exercises/static/exercises/assets/img', f'{exercise.exercise_id}_teaser.png'),
        'guide_images': os.path.join('/GuidePages/assets/images/exercises', exercise.exercise_id),
        'guide_page': os.path.join('/GuidePages/_pages/exercises', category_identify, f'{exercise.exercise_id}.md'),
    }

    for universe in universes_list:
        if universe.world and universe.world.launch_file_path:
            launch_path = universe.world.launch_file_path
            file_name = os.path.splitext(os.path.splitext(os.path.basename(launch_path))[0])[0]
            original_paths[f'launcher__{file_name}'] = os.path.join('/Infrastructure/Launchers', f'{file_name}.launch.py')
            original_paths[f'world__{file_name}'] = os.path.join('/Infrastructure/Worlds', f'{file_name}.world')
    
    return original_paths


# Modify exercise.md to add a new exercise on list
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
    
    # Find start of block feature_row
    feature_row_index = content.find("feature_row:")
    if feature_row_index == -1:
        raise ValueError("feature_row not found in the markdown file.")

    # Divide content before and after feature_row
    before = content[:feature_row_index]
    after = content[feature_row_index:]

    # Find end of front matter (---)
    end_of_front_matter = after.find('---', 3)
    if end_of_front_matter != -1:
        feature_rows = after[:end_of_front_matter]
        body = after[end_of_front_matter:]
    else:
        feature_rows = after
        body = ""

    # Add exercises on feature_row
    updated_feature_rows = feature_rows.rstrip() + '\n' + new_entry + '\n'

    # Add content before feature_rows block
    new_content = before + updated_feature_rows + body

    # Save new content on file
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