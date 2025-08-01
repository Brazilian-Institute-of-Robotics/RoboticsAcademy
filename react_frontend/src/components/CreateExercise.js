import "../styles/create_exercise.css"
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid';

import { Container, Typography, Button, styled } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import FormError from "./message_system/FormError";

import { useFormik } from "formik";
import * as Yup from "yup"

import HalGenerator from './editors/HalGenerator';
import UploadFileButton from "./buttons/UploadFileButton";

import { getCookie } from "../helpers/cookie";
import ExerciseRouter from "../helpers/ExerciseRouter"

function CreateExerciseForm() {

  const [responseMsg, setResponseMsg] = useState('');
  
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGenarating, setIsGenerating] = useState(false)

  const [isCheckingExerciseName, setIsCheckingExerciseName] = useState(false)
  const [isCheckingUniverseName, setIsCheckingUniverseName] = useState(false)

  const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
  const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

  const formik = useFormik({
    initialValues: {
      exerciseName: "",
      description: "",
      universeName: "",
      worldFile: null,
      code: "",
    },
    validationSchema: Yup.object({
      exerciseName: Yup.string().trim().required("Exercise's name is required").max(40, "Max length is 40 characters"),
      description: Yup.string().max(40, "Max length is 400 characters"),
      universeName: Yup.string().trim().required("Universes's name is required").max(100, "Max length is 100 characters"),
      worldFile: Yup.mixed().required("World's file is required"),
      code: Yup.string().required("HAL's code is required"),
    }),
    onSubmit: async (values, {setSubmitting}) => {

      setIsSaving(true)
      try{
        const result = await ExerciseRouter.create(
          values.exerciseName, values.description, 
          values.universeName, values.worldFile, 
          values.code, serverBase
        )

        if (result.success == 1) 
          setResponseMsg(`✅ Exercise created!`);
        else 
          setResponseMsg(`❌ ${result.error}`);

      } catch (error) {
        //console.log("ERRO: "+error)
        setResponseMsg(`❌ Fail to create exercise. Please contact suport`);
      }finally{
        setIsSaving(false)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  })

  // CASE FORM VALIDATION FAILS, AUTO SCROLLS PAGE TO TOP
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [formik.errors, formik.submitCount]);

  // FILTER INVALID CHARACTERS EXERCISE NAME
  const handleChangeExerciseName = (name) => {
    // : / \ * ? : | " < > . ' espaço - e outros proibidos no Ubuntu
    const invalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/g;

    if (!invalidChars.test(name)) 
        formik.setFieldValue("exerciseName", name);
  };

  // FILTER INVALID CHARACTERS UNIVERSE NAME
  const handleChangeUniverseName = (name) => {
    // : / \ * ? : | " < > . ' espaço - e outros proibidos no Ubuntu
    const invalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/g;

    if (!invalidChars.test(name)) 
        formik.setFieldValue("universeName", name);
  };

  const handleCheckExerciseName = async (e) => {
    const name = formik.values.exerciseName
    if (!name) {
      setResponseMsg('❌ Write a exercise name to be checked');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try{
      setIsCheckingExerciseName(true)
      const result = await ExerciseRouter.findByName(name, serverBase)

      if (result.success == 1)
        if (result.data.exercise == null)
          setResponseMsg(`✅ Exercise name is available`);
        else
          setResponseMsg(`❌ Exercise name is not available`)
      else
          setResponseMsg(`❌ ${result.data.error}`)
      
    }catch(error){
      setResponseMsg(`❌ Fail to verivy exercise name avalability, contact suport`);
    }finally{
      setIsCheckingExerciseName(false)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handleCheckUniverseName = async (e) => {
    const universeName = formik.values.universeName
    if (!universeName) {
      setResponseMsg('❌ Write a universe name to be checked');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsCheckingUniverseName(true)
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/universe/findByName/${encodeURIComponent(universeName)}/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok){
        if (data.universe == null)
          setResponseMsg(`✅ Universe name is available`);
        else
          setResponseMsg(`❌ Universe name is not available`)

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }else
        setResponseMsg(`❌ ${data.error}`)
    } catch (error) {
      //console.log(error)
      setResponseMsg("Error on check universe name (FRONT END). please contact suport");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }finally{
      setIsCheckingUniverseName(false)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handleDelete = async (e) => {
    const name = formik.values.exerciseName
    if (!name) {
      setResponseMsg('❌ Digite um nome de exercício para deletar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsDeleting(true)
    try {
      const csrfToken = getCookie("csrftoken")
      const res = await fetch(`${serverBase}/api/v1/exercise/${encodeURIComponent(name)}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': csrfToken
        },
      });

      const data = await res.json();

      if (res.ok) 
        setResponseMsg(`✅ ${data.message}`);
      else
        setResponseMsg(`❌ ${data.error}`)
    } catch (error) {
      //console.log(error)
      setResponseMsg("Error on deleting (FRONT END). please contact suport");
    }finally{
      setIsDeleting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return(
    <Box sx={{
        height: "100%",
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#474444",
      }}>
        
        <Container sx={{padding: 3}}>
          <Paper elevation={4} sx={{ padding: 4, }}>
            <Typography variant="h2" align="center" gutterBottom>
              Create new exercise
            </Typography>

            <form 
              onSubmit={formik.handleSubmit}
            >
              {/* API RESPONSE MESSAGE */}
              <Typography variant="h5" align="center" color="orange" gutterBottom>
                {responseMsg}
              </Typography>

              {/* GRID EXERCISE NAME + BUTTON */}
              <Grid container sx={{ alignItems: "center" }}>
                <Grid item xs={8}>
                  <TextField
                    name="exerciseName"
                    label="Exercise name"
                    value={formik.values.exerciseName}
                    onChange={(e) => {
                      handleChangeExerciseName(e.target.value);
                    }}
                    sx={{ m: 1 }}
                    inputProps={{ maxLength: 40 }}
                    variant="filled"
                    fullWidth
                  />
                  <FormError
                    inputName="exerciseName" 
                    errors={formik.errors} 
                    touched={formik.touched}
                    divStyle={{ height: "1.2rem", marginTop: "4px", marginLeft: "8px" }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <LoadingButton 
                    loading={isCheckingExerciseName}
                    loadingIndicator="Loading..."
                    startIcon={<SearchIcon/>}
                    disabled={isGenarating || isDeleting || isSaving}
                    variant="contained" 
                    component="label"
                    sx={{ ml:3, mb:3}}
                    onClick={handleCheckExerciseName}
                  >
                    Check exercise name availability
                  </LoadingButton>
                </Grid>
              </Grid>
              
              {/* TEXTFIELD TO DESCRIPTION */}
              <TextField
                name="description"
                label="Description (Opcional)"
                value={formik.values.description}
                onChange={formik.handleChange}
                sx={{ m: 1, minHeight: 2}}
                minRows={3}
                inputProps={{ maxLength: 400 }}
                variant="filled"
                fullWidth
                multiline
              />
              <FormError inputName="description" errors={formik.errors} touched={formik.touched}/>
              
              {/* GRID WITH UNIVERSE NAME + BUTTON */}
              <Grid container sx={{ m: 1, alignItems: "center" }}>
                <Grid item xs={8}>
                  <TextField
                    name="universeName"
                    label="Universe name"
                    value={formik.values.universeName}
                    onChange={(e)=>{handleChangeUniverseName(e.target.value)}}
                    inputProps={{ maxLength: 100 }}
                    variant="filled"
                    fullWidth
                  />
                  <FormError inputName="universeName" errors={formik.errors} touched={formik.touched}/>
                </Grid>

                <Grid item xs={3} sx={{}}>
                  <LoadingButton 
                    loading={isCheckingUniverseName}
                    loadingIndicator="Loading..."
                    startIcon={<SearchIcon/>}
                    disabled={isGenarating || isDeleting || isSaving}
                    variant="contained" 
                    component="label"
                    sx={{ ml:3, mb:3}}
                    onClick={handleCheckUniverseName}
                  >
                    Check universe name availability
                  </LoadingButton>
                </Grid>
              </Grid>

              {/* UPLOAD BUTTON */}
              <UploadFileButton
                formik={formik}
                formikAtrributeName="worldFile"
                fileType=".world"
                isDisable={isGenarating || isSaving || isDeleting}
                setMessageFunction={(message) => {setResponseMsg(message)}}
              />

              <HalGenerator
                formik={formik}
                formikAtrributeName="code"
                isLoading={isGenarating}
                setIsLoading={(bool)=> {setIsGenerating(bool)}}
                isDisable={isSaving || isDeleting}
                setMessageFunction={(message) => {setResponseMsg(message)}}
              />

              {/* SAVE AND DELETE BUTTONS */}
              <LoadingButton 
                loading={isSaving}
                loadingIndicator="Loading..."
                startIcon={<AddIcon/>}
                disabled={isGenarating || isDeleting}
                variant="contained" 
                sx={{ m:2, width:"25ch"}} 
                type="submit"
                //onClick={handleSubmit}
              >
                SAVE
              </LoadingButton>

              {/* <LoadingButton
                loading={isDeleting}
                loadingIndicator="Loading..."
                startIcon={<DeleteIcon/>}
                disabled={isGenarating || isSaving}
                variant="contained" 
                sx={{ 
                  m:2, 
                  width:"25ch", 
                  bgcolor:"#eb4034",
                  '&:hover': {
                    backgroundColor: '#eb4034',
                  },
                }} 
                onClick={handleDelete}
              >
                DELETE
              </LoadingButton> */}
            </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default CreateExerciseForm;
