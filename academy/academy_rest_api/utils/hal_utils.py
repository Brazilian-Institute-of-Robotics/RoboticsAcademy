import os
import re

def getExerciseHalContent(exercise_id):

    hal_path = os.path.join(
        "/RoboticsAcademy/exercises/static/exercises", 
        exercise_id,
        "python_template", 
        "ros2_humble",
        "HAL.py"
    )

    with open(hal_path, "r") as f:
        code = f.read()

    return code

def generateHal(nodes=None) -> str:
    """
    Gera uma versão personalizada do base_hal.py com os blocos substituídos,
    e retorna o código final como uma string.
    """

    base_path = '/RoboticsAcademy/exercises/static/base_hal_files'
    hal_path = os.path.join(base_path, 'base_hal.py')

    if nodes is None:
        nodes = []

    with open(hal_path, "r") as f:
        base_code = f.read()

    for node in nodes:
        txt_path = os.path.join(base_path, f"{node}_node.txt")
        if os.path.exists(txt_path):
            blocks = _extract_blocks(txt_path)
            base_code = _inject_into_base_str(base_code, node, blocks)

    return base_code

def _extract_blocks(node_file):
    content = open(node_file).read()
    blocks = {}
    current_block = None
    lines = []

    for line in content.splitlines():
        if "#IMPORT START" in line:
            current_block = "IMPORT"
            lines = []
        elif "#CREATE START" in line:
            current_block = "CREATE"
            lines = []
        elif "#ADD START" in line:
            current_block = "ADD"
            lines = []
        elif "#FUNCTION START" in line:
            current_block = "FUNCTION"
            lines = []
        elif "#IMPORT END" in line or "#CREATE END" in line or "#ADD END" in line or "#FUNCTION END" in line:
            blocks[current_block] = "\n".join(lines)
            current_block = None
        elif current_block:
            lines.append(line)
    
    return blocks

def _inject_into_base_str(base_code: str, node_name: str, blocks: dict) -> str:
    lines = base_code.splitlines()
    new_lines = []

    for line in lines:
        if f"# IMPORT {node_name.upper()}" in line:
            new_lines.append(blocks.get("IMPORT", "") + "\n")
        elif f"# CREATE {node_name.upper()} NODE" in line:
            new_lines.append(blocks.get("CREATE", "") + "\n")
        elif f"# ADD {node_name.upper()} NODE" in line:
            new_lines.append(blocks.get("ADD", "") + "\n")
        elif f"# {node_name.upper()} NODE FUNCTIONS" in line:
            new_lines.append(blocks.get("FUNCTION", "") + "\n")
        else:
            new_lines.append(line)

    return "\n".join(new_lines)
