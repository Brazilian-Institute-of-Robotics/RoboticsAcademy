import * as React from "react";
import { ButtonGroup } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import RoboticsTheme from "Components/RoboticsTheme";
import LogoutIcon from '@mui/icons-material/Logout';
import { deleteContainerManagerPorts } from "../../helpers/storeManager";

import "../../styles/buttons/ExerciseTheoryForumButton.css";

const ExerciseTheoryForumButton = (props) => {

  const handleLogout = async (e) => {
      try {
          //Use component ./message_system/Loading.js
          window.RoboticsReactComponents.MessageSystem.Loading.showLoading(
            "Logout user..."
          );
          const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
          const response = await fetch(`${serverBase}/api/v1/logout/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken,
              },
          });
          if (response.ok) {
              //Delete localStorage
              deleteContainerManagerPorts()
              window.location.href = '/login';
          } else {
              alert('Erro na resposta da API');
          }
      } catch (err) {
          console.log("Error: "+err)
          alert('Erro no local');
      }finally{
        window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();
      }
  }

  return (
    <RoboticsTheme>
      <ButtonGroup color={"loading"} variant={"contained"}>
        <IconButton href={props.url} target="_blank" color="secondary">
          <SchoolOutlinedIcon />
        </IconButton>
        <IconButton
          href="https://forum.unibotics.org/"
          target="_blank"
          color="secondary"
        >
          <CommentOutlinedIcon />
        </IconButton>
        <IconButton 
          onClick={handleLogout} 
          target="_blank" 
          color="secondary"
        >
          <LogoutIcon />
        </IconButton>
      </ButtonGroup>
    </RoboticsTheme>
  );
};

export default ExerciseTheoryForumButton;
