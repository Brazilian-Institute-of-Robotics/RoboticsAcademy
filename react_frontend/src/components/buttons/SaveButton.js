import * as React from "react";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, TextField } from "@mui/material";
import { saveCode } from "../../helpers/utils";
import PropTypes from "prop-types";
import { userCodeFiles } from "../../contexts/UserCodeFilesContex";

const SaveFileButton = ({fileName, changeFileName}, props) => {

  const config = JSON.parse(
    document.getElementById("exercise-config").textContent
  );

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;

  const { codeFiles, setCodeFiles } = userCodeFiles()

  const handleSaveFile = async(e) => {
    if(fileName == "")
      alert("Por favor insira o nome do arquivo.")
    else{
      window.RoboticsReactComponents.MessageSystem.Loading.showLoading("Saving code...");
      await saveFile(e)
      window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();
    }
  }

  const saveFile = async(e) => {
    e.preventDefault();
    
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    let requestUrl = `${serverBase}/exercises/exercise/${config[0].exercise_id}/save_code`;
    let userCode = RoboticsReactComponents.CodeEditor.getCode();

    const overwritedIndex = codeFiles.findIndex( item => item.filename === fileName)

    if(overwritedIndex != -1){
      const confirmed = window.confirm("There is a file with same name. Are you sure you want to overwrite it?");
      if (!confirmed) return;
    }

    //Simutale request waiting
    //await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({fileName, userCode}),
      });

      if(response.ok){

        //A new file was saved, so it's add on
        //codeFiles (context variable)
        if(overwritedIndex == -1){
          const newFile = {
            "filename": fileName,
            "content": userCode,
          }
          codeFiles.push(newFile)
          setCodeFiles(codeFiles)
        }else{
          //File already exists, so here file is overwrited with new content
          codeFiles[overwritedIndex].content = userCode
        }
        
        alert('Code was saved');
      }else
        alert('Failed to save code, error on request or API');
      
    } catch (error) {
      console.log("ERROR: "+error)
      alert('Failed to save code, error on FRONT');
    }finally{}
     
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Button
        id={"save"}
        variant="contained"
        color={"secondary"}
        startIcon={<SaveIcon />}
        sx={{ m: 1 }}
        onClick={handleSaveFile}
      >
        Save code on server
      </Button>
      <TextField
        sx={{ m: 1 }}
        size={"small"}
        id="filename"
        label="Filename"
        color={"secondary"}
        value={fileName}
        onChange={(e) => {
          changeFileName(e.target.value);
        }}
      />
    </Box>
  );
};

SaveFileButton.propTypes = {
  context: PropTypes.any,
};

export default SaveFileButton;
