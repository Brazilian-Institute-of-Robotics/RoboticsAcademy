import os
import re

def getContent(exercise_id, category_identify):
    markdown_path = os.path.join(
        '/GuidePages/_pages/exercises/', 
        category_identify, 
        f'{exercise_id}.md'
    )

    with open(markdown_path, "r") as f:
        content = f.read()

    return content