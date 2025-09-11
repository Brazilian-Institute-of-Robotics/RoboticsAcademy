import "../styles/create_exercise.css"
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import { Container, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { LoadingButton } from '@mui/lab';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import FormError from "./message_system/FormError";

import { useFormik } from "formik";
import * as Yup from "yup"

import HalGenerator from './editors/HalGenerator';
import UploadFileButton from "./buttons/UploadFileButton";

import { getCookie } from "../helpers/cookie";
import ExerciseRouter from "../helpers/ExerciseRouter"
import UniverseRouter from "../helpers/UniverseRouter";

import MutipleFileUploader from "./uploads/MutipleFileUploader";
import { Editor } from "@monaco-editor/react";

function CreateExerciseForm() {

  const default_markdown = "Please give exercise name and select his category"

  const [categoryList, setCategoryList] = useState([])
  const [categoryIdentify, setCategoryIdentify] = useState("")

  const [baseMarkdown, setBaseMarkdown] = useState("")

  const [exerciseIdentify, setExerciseIdentify] = useState("")
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
      categoryId: "",
      teaserImageFile: null,
      guidePageFiles: [],
      guidePageCode: default_markdown,
    },
    validationSchema: Yup.object({
      exerciseName: Yup.string().trim().required("Exercise's name is required").max(40, "Max length is 40 characters"),
      description: Yup.string().max(40, "Max length is 400 characters"),
      universeName: Yup.string().trim().required("Universes's name is required").max(100, "Max length is 100 characters"),
      worldFile: Yup.mixed().required("World's file is required"),
      code: Yup.string().required("HAL's code is required"),
      categoryId: Yup.number().required("Category is required"),
      teaserImageFile: Yup.mixed().required("Teaser image file is required"),
      guidePageCode: Yup.string().required("Markdown code is required"),
    }),
    onSubmit: async (values, {setSubmitting}) => {

      setIsSaving(true)
      try{
        const result = await ExerciseRouter.create(
          values.exerciseName, values.description, 
          values.universeName, values.worldFile,
          values.code, values.categoryId, values.teaserImageFile,
          values.guidePageFiles, values.guidePageCode, serverBase
        )

        if (result.success == 1){
          setResponseMsg(`✅ Exercise created. Redirecting to list page...`);
          setTimeout(() => {
              window.location.href = `${serverBase}/exerciseListCrud/`;
          }, 5000);
        }
        else 
          setResponseMsg(`❌ ${result.error}`);

      } catch (error) {
        //console.log("ERRO: "+error)
        setResponseMsg(`❌ Fail to create exercise. Check connection or contact suport`);
      }finally{
        setIsSaving(false)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  })


  // WHEN PAGES STARTS, GETS EXERCISE GUIDE PAGE CATEGORY
  // AND BASE MARKDOWN CONTENT
  useEffect(() => {
    const csrfToken = getCookie("csrftoken")

    const fetchGuideCategories = async () => {
        try {
          const response = await fetch(`${serverBase}/api/v1/guideCategory/findAll`, {
              method: 'GET',
              headers: {'X-CSRFToken': csrfToken},
          });

          const data = await response.json();
          setCategoryList(data)

        } catch (error) {
          setResponseMsg("❌ Error to exercise category. Check connection or contact suport")
        }
    };

    const fetchBaseMarkdown = async () => {
      try {
        const response = await fetch(`${serverBase}/api/v1/baseMarkdownFile`, {
            method: 'GET',
            headers: {'X-CSRFToken': csrfToken},
        });

        const data = await response.json();
        setBaseMarkdown(data.file_content)

      } catch (error) {
        setResponseMsg("❌ Error to get base markdown. Check connection or contact suport")
      }
    };

    fetchGuideCategories();
    fetchBaseMarkdown();
  }, []);


  // UPDATE MARKDOWN WHEN EXERCISE NAME OR
  // EXERCISE CATEGORY CHANGES
  useEffect(() => {
    const name = formik.values.exerciseName.trim()
    const categoryId = formik.values.categoryId

    if(name != "" && categoryId != ""){
      const updatedMarkdown = baseMarkdown
        .replace(/{CATEGORY_INDENTIFY}/g, categoryIdentify)
        .replace(/{EXERCISE_ID}/g, exerciseIdentify)
        .replace(/{EXERCISE_NAME}/g, name);
      
      formik.setFieldValue("guidePageCode", updatedMarkdown)
    }else
      formik.setFieldValue("guidePageCode", default_markdown)
    
  }, [formik.values.exerciseName, formik.values.categoryId]);


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

    if (!invalidChars.test(name)){
      formik.setFieldValue("exerciseName", name);
      const identify = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
      setExerciseIdentify(identify)
    }
  };

  // FILTER INVALID CHARACTERS UNIVERSE NAME
  const handleChangeUniverseName = (name) => {

    // : / \ * ? : | " < > . ' espaço - e outros proibidos no Ubuntu
    const invalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/g;

    if (!invalidChars.test(name)) {
      formik.setFieldValue("universeName", name);
    }

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
      const result = await ExerciseRouter.checkNameAvalability(name, serverBase)

      if (result.success == 1)
        if (result.data.exists == 0)
          setResponseMsg(`✅ Exercise name is available`);
        else
          setResponseMsg(`❌ Exercise name is not available`)
      else
          setResponseMsg(`❌ ${result.data.error}`)
      
    }catch(error){
      setResponseMsg(`❌ Fail to verify exercise name avalability. Check connection or contact suport`);
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
      const result = await UniverseRouter.checkNameAvalability(universeName, serverBase)
      if (result.success == 1)
        if (result.data.exists == 0)
          setResponseMsg(`✅ Universe name is available`);
        else
          setResponseMsg(`❌ Universe name is not available`)
      else
          setResponseMsg(`❌ ${result.data.error}`)

    } catch (error) {
      console.log(error)
      setResponseMsg(`❌ Fail to verify universe name avalability. Check connection or contact suport`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }finally{
      setIsCheckingUniverseName(false)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handleChangeCategory = (categoryId) => {
    const category_selected = categoryList.find(category => category.id == categoryId)
    formik.setFieldValue("categoryId", categoryId);
    setCategoryIdentify(category_selected.category_identify)
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
        
        <Container sx={{padding: 3, background: "#838fa3"}}>
          
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

            {/* EXERCISE NAME + BUTTON */}
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
              <Grid item xs={4}>
                <LoadingButton 
                  loading={isCheckingExerciseName}
                  loadingIndicator="Loading..."
                  startIcon={<SearchIcon/>}
                  disabled={isGenarating || isDeleting || isSaving}
                  variant="contained" 
                  component="label"
                  sx={{ ml:3, mb:3, textTransform: "none",}}
                  onClick={handleCheckExerciseName}
                >
                  Check exercise name availability
                </LoadingButton>
              </Grid>
            </Grid>
            
            {/*DESCRIPTION */}
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
            
            {/* UNIVERSE NAME + BUTTON */}
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

              <Grid item xs={4} sx={{}}>
                <LoadingButton 
                  loading={isCheckingUniverseName}
                  loadingIndicator="Loading..."
                  startIcon={<SearchIcon/>}
                  disabled={isGenarating || isDeleting || isSaving}
                  variant="contained" 
                  component="label"
                  sx={{ ml:3, mb:3, textTransform: "none",}}
                  onClick={handleCheckUniverseName}
                >
                  Check universe name availability
                </LoadingButton>
              </Grid>
            </Grid>
            
            {/* WORLD AND IMAGES BUTTONS */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 2,
                mb: 2,
                gap: 2,
            }}>
              <UploadFileButton
                formik={formik}
                formikAtrributeName="worldFile"
                title={"Upload world file"}
                successTitle={"World file received"}
                width={"30ch"}
                fileType=".world"
                isDisable={isGenarating || isSaving || isDeleting}
                setMessageFunction={(message) => {setResponseMsg(message)}}
              />
              
              <UploadFileButton
                  formik={formik}
                  formikAtrributeName="teaserImageFile"
                  title={"Upload teaser image (.png)"}
                  successTitle={"Teaser image received"}
                  width={"40ch"}
                  fileType=".png"
                  isDisable={isGenarating || isSaving || isDeleting}
                  setMessageFunction={(message) => {setResponseMsg(message)}}
                />
            </Box>
            
            {/* HAL GENERATOR */}
            <HalGenerator
              formik={formik}
              formikAtrributeName="code"
              isLoading={isGenarating}
              setIsLoading={(bool)=> {setIsGenerating(bool)}}
              isDisable={isSaving || isDeleting}
              setMessageFunction={(message) => {setResponseMsg(message)}}
            />

            <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                Create exercise guide page
            </Typography>
            
            {/* CATEGORY SELECTOR */}
            <FormControl sx={{ width:"30ch" }}>
              <InputLabel sx={{ m: 1}} id="category-label">Exercise category</InputLabel>
              <Select
                labelId="label"
                name="categoryId"
                label="Exercise category"
                value={formik.values.categoryId}
                onChange={(e) => { handleChangeCategory(e.target.value); }}
                sx={{ m: 1 }}
                variant="filled"
                fullWidth
              >
                {categoryList.map((category) => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormError
              inputName="categoryId" 
              errors={formik.errors} 
              touched={formik.touched}
              divStyle={{ height: "1.2rem", marginTop: "4px", marginLeft: "8px" }}
            />
            
            {/* GUIDE PAGES FILES */}
            <MutipleFileUploader
              formik={formik}
              formikAtrributeName="guidePageFiles"
              fileTypes=".png, .jpg, .jpeg, .gif"
              startText="Insert here files to be used in guide page"
            />

            
            {/* WARNING MARKDOWN CODE */}
            {
              formik.values.exerciseName.trim() !== "" && formik.values.categoryId !== "" ? (
                <Box
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  color="red"
                  backgroundColor="#fad8d2"
                  gap={3}
                  sx={{mb:2, pt: 2, pb:2}}
                >
                  <Typography variant="h4">
                    Warnings about markdown code bellow
                  </Typography>
                  <Typography variant="h6">
                    1 - Don't change the first 5 lines of code
                  </Typography>
                  <Typography variant="h6">
                    2 - On change exercise's name or exercise's category, the code will be reset. BE CAREFUL
                  </Typography>
                  <Typography variant="h6">
                    3 - To use upload files on code, the path is "/assets/images/exercises/{exerciseIdentify}/FILE_NAME.FORMAT"
                  </Typography>
                </Box>
              ) : (<div></div>)
            }

            <FormError
              inputName="guidePageCode"
              errors={formik.errors} 
              touched={formik.touched}
              divStyle={{ height: "1.2rem", marginTop: "4px", marginLeft: "8px" }}
            />
            <Editor
                name="code"
                height="600px"
                defaultLanguage="markdown"
                value={formik.values.guidePageCode}
                onChange={(value) => {formik.setFieldValue("guidePageCode", value);}}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    readOnly: !(formik.values.exerciseName.trim() && formik.values.categoryId !== "")
                }}
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

            <LoadingButton
              loading={isDeleting}
              loadingIndicator="Loading..."
              startIcon={<ArrowBackIcon/>}
              disabled={isGenarating || isSaving}
              variant="contained" 
              sx={{
                m:2, 
                width:"25ch", 
              }} 
              onClick={() => { window.location.href = `${serverBase}/exerciseListCrud/`}}
            >
              BACK
            </LoadingButton>
          </form>
      </Container>
    </Box>
  )
}

export default CreateExerciseForm;
