import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { Box, Button } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";
import { userCodeFiles } from "../../contexts/UserCodeFilesContex";
import { useState, useEffect } from "react";
import SelectMultipleCodeModal from '../modals/SelectMutipleCodeModal';

const LoadServerFileButton = ({changeFileName},props) => {

    const { setCodeFiles } = userCodeFiles()
    const [openModal, setOpenModal] = useState(false);

    const config = JSON.parse(
        document.getElementById("exercise-config").textContent
      );
    
    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    
    useEffect(() => {
      getCodes()
    }, []);

    const getCodes = async() => {
        window.RoboticsReactComponents.MessageSystem.Loading.showLoading("Saving code...");
        const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;
    
        let requestUrl = `${serverBase}/exercises/exercise/${config[0].exercise_id}/list_user_codes`;
    
        try {
          const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if(response.ok){
            const data = await response.json()
            setCodeFiles(data.codes);
          }else
            alert('Erro na resposta da API');
          
        } catch (error) {
          console.log("ERRO: "+error)
          alert('Erro no local');
        }finally{window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();}
         
    };

  return (
    <Box sx={{ display: "flex" }}>
      <Button
        variant="contained"
        sx={{ m: 1 }}
        color={"secondary"}
        startIcon={<CloudUploadOutlinedIcon />}
        component="label"
        onClick={() => setOpenModal(true)}
      >
        Load server code
      </Button>
      <SelectMultipleCodeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        changeFileName={changeFileName}
      />
    </Box>
  );
};

LoadServerFileButton.propTypes = {
  context: PropTypes.any,
};

export default LoadServerFileButton;
