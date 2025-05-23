import * as React from "react";
import { ButtonGroup } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import RoboticsTheme from "Components/RoboticsTheme";
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from "../../helpers/auth";

import "../../styles/buttons/ExerciseTheoryForumButton.css";

const ExerciseTheoryForumButton = (props) => {

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
  const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`; 
          
  const [url, setUrl] = React.useState("")

  React.useEffect(() => {
       /*
        Case window.DJANGO_ENV.GUIDE_BASE_URL == "", that means guide pages server is executed
        on same machine that this server, so this page can create url dinamically

        Otherwise, it used the url on DJANGO_ENV.GUIDE_BASE_URL
      */
      const base_url =  window.DJANGO_ENV.GUIDE_BASE_URL == "" ?
        `${document.location.protocol}//${document.location.hostname}:4000/exercises` :
          window.DJANGO_ENV.GUIDE_BASE_URL
      
      const complete_url = base_url+props.url
      setUrl(complete_url)
    }, []);
  

  const handleLogout = async () => {
    
      //Use component ./message_system/Loading.js imported on App.js
      window.RoboticsReactComponents.MessageSystem.Loading.showLoading(
        "Logout user..."
      );
      await logout(serverBase)
  
      window.RoboticsReactComponents.MessageSystem.Loading.hideLoading();
  }

  return (
    <RoboticsTheme>
      <ButtonGroup color={"loading"} variant={"contained"}>
        <IconButton href={url} target="_blank" color="secondary">
          <SchoolOutlinedIcon />
        </IconButton>
        {/* <IconButton
          href="https://forum.unibotics.org/"
          target="_blank"
          color="secondary"
        >
          <CommentOutlinedIcon />
        </IconButton> */}
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
