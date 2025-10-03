import React, { useState, useEffect } from 'react';
import { Card, CardContent, Container, Typography } from '@mui/material';

import GuidePageCategoryRouter from '../helpers/GuidePageCategoryRouter';

import MultiStepForm from './forms/MultiStepForm';
import ExerciseDataStep, { exerciseDataValidator } from './forms/exerciseUpdateSteps/ExerciseDataStep';
import HalDataStep, { halDataValidator } from './forms/exerciseUpdateSteps/HalDataStep';
import GuidePageDataStep, { guidePageDataValidator } from './forms/exerciseUpdateSteps/GuidePageDataStep';
import { getCookie } from '../helpers/cookie';
import UniverseDataStep, { universeDataValidator } from './forms/exerciseUpdateSteps/UniverseDataStep';
import UniverseRouter from '../helpers/UniverseRouter';
import ExerciseRouter from '../helpers/ExerciseRouter';



const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

const default_markdown = "Please give exercise name and select his category"

export default function ExerciseCreation() {
    
    const [pageIsReady, setPageIsReady] = useState(false)
    const [message, setMessage] = useState("Loading...")

    const [categoryList, setCategoryList] = useState([])
    const [universeList, setUniverseList] = useState([])
    const [responseMsg, setResponseMsg] = useState("")
    const [initialValues, setInitialValues] = useState({
        exerciseName: "",
        exerciseIdentify: "",
        description: "",
        universeName: "",
        worldFile: null,
        universeList: [],
        code: "",
        categoryId: "",
        categoryIdentify:"",
        teaserImageFile: null,
        guidePageFiles: [],
        guidePageCode: "",
    })


    //Fetch necessary data
    useEffect(() => {
        fetchGuideCategories()
        fetchUniverseList()
        fetchBaseMarkdown()
    },[])

    //Show form or loading message
    useEffect(() => {
        if(categoryList.length > 0)
            setPageIsReady(true)
        else
            setPageIsReady(false)
    },[categoryList])

    const fetchGuideCategories = async () => {
        try {
            const result = await GuidePageCategoryRouter.findAll(serverBase)
            if (result.success == 1){
                const list_category = result.data
                setCategoryList(list_category)
            }
            else
                setMessage(`❌ ${result.error}`);

        } catch (error) {
            //console.log(error)
            setMessage("❌ Error to find list of guide category. Verify connection or contact suport")
        }
    };

    const fetchUniverseList = async () => {
        try {
            const result = await UniverseRouter.getUniverseList(serverBase)
            if (result.success == 1){
                const list = result.data
                setUniverseList(list)
            }
            else
                setMessage(`❌ ${result.error}`);

        } catch (error) {
            //console.log(error)
            setMessage("❌ Error to find list universes. Verify connection or contact suport")
        }
    }

    const fetchBaseMarkdown = async () => {
        try {
          const csrfToken = getCookie("csrftoken")
          const response = await fetch(`${serverBase}/api/v1/baseMarkdownFile`, {
              method: 'GET',
              headers: {'X-CSRFToken': csrfToken},
          });
  
          const data = await response.json();
          initialValues.guidePageCode = data.file_content
          setInitialValues(initialValues)

        } catch (error) {
          //console.log(error)
          setMessage("❌ Error to get base markdown. Check connection or contact suport")
        }
    };

    const createExercise = async (values) => {
        //console.log(values)
        try{

            const universesToLinkId =  values.universeList.map( universe => universe.id)
            console.log(universesToLinkId)

            const result = await ExerciseRouter.create(
                values.exerciseName, values.description, 
                values.universeName, values.worldFile, universesToLinkId,
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    return (
        <Container sx={{ mt:3, mb:3 }}>
            <Card sx={{bgcolor: "#8E7756"}}>

                <Typography variant="h4" align="center" sx={{mt: 2, mb: 2}}>
                    Add new exercise
                </Typography>

                <CardContent sx={{bgcolor: "#B39283"}}>
                    { !pageIsReady ? (
                            <Typography variant="h5" align="center" sx={{mt: 2, mb: 2}}>
                                {message}
                            </Typography>
                        ) : (
                        <>
                            <Typography variant="h5" align="center" sx={{mt: 2, mb: 2}}>
                                {responseMsg}
                            </Typography>
                            <MultiStepForm
                                initialValues={initialValues}
                                onReturn={() => {window.location.href = `${serverBase}/exerciseListCrud/`}}
                                onSubmit={async values => createExercise(values)}
                            >

                                <ExerciseDataStep
                                    exerciseOriginalData={null}
                                    categoryList={categoryList}
                                    validationSchema={exerciseDataValidator}
                                />

                                <UniverseDataStep
                                    universeList={universeList}
                                    validationSchema={universeDataValidator}
                                />

                                <HalDataStep
                                    exerciseOriginalData={null}
                                    validationSchema={halDataValidator}
                                />

                                <GuidePageDataStep
                                    exerciseOriginalData={null}
                                    validationSchema={guidePageDataValidator}
                                />
                            </MultiStepForm>
                        </>
                        )
                    }
                </CardContent>
            </Card>
        </Container>
    )
};

