import * as React from "react";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, TextField } from "@mui/material";
import { saveCode } from "../../helpers/utils";
import PropTypes from "prop-types";

const SaveFileButton = (props) => {

  const config = JSON.parse(
    document.getElementById("exercise-config").textContent
  );

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;

  const [fileName, setFileName] = React.useState("myCode");

  const saveFile = async(e) => {
    e.preventDefault();
    
    window.RoboticsReactComponents.MessageSystem.Loading.showLoading("Saving code...");

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    let requestUrl = `${serverBase}/exercises/exercise/${config[0].exercise_id}/save_code`;
    let userCode = RoboticsReactComponents.CodeEditor.getCode();

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({fileName, userCode}),
      });

      if(response.ok)
        alert('Código salvo com sucesso');
      else
        alert('Erro na resposta da API');
      
    } catch (error) {
      console.log("ERRO: "+error)
      alert('Erro no local');
    }finally{window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();}
     
  };
  return (
    <Box sx={{ display: "flex" }}>
      <Button
        id={"save"}
        variant="contained"
        color={"secondary"}
        startIcon={<SaveIcon />}
        sx={{ m: 1 }}
        onClick={saveFile}
      >
        Save code on system
      </Button>
      <TextField
        sx={{ m: 1 }}
        size={"small"}
        id="filename"
        label="Filename"
        color={"secondary"}
        value={fileName}
        onChange={(e) => {
          setFileName(e.target.value);
        }}
      />
    </Box>
  );
};

SaveFileButton.propTypes = {
  context: PropTypes.any,
};

export default SaveFileButton;
