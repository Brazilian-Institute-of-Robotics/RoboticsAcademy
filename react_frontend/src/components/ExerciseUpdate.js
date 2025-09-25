import React, { useState, useEffect } from 'react';
import { Card, CardContent, Container, Typography } from '@mui/material';

import ExerciseRouter from '../helpers/ExerciseRouter';

import MultiStepForm from './forms/MultiStepForm';
import ExerciseDataStep, { exerciseDataValidator } from './forms/exerciseUpdateSteps/ExerciseDataStep';
import HalDataStep, { halDataValidator } from './forms/exerciseUpdateSteps/HalDataStep';
import GuidePageDataStep, { guidePageDataValidator } from './forms/exerciseUpdateSteps/GuidePageDataStep';
import GuidePageCategoryRouter from '../helpers/GuidePageCategoryRouter';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

export default function ExerciseUpdate() {
    
    const [pageIsReady, setPageIsReady] = useState(false)
    const [message, setMessage] = useState("Loading...")

    const [exercise, setExercise] = useState(null)
    const [id, setId] = useState("")
    const [categoryList, setCategoryList] = useState([])
    const [initialValues, setInitialValues] = useState({})


    //Fetch necessary data
    useEffect(() => {
        const url_parts = window.location.pathname.split('/');
        const id = url_parts.at(-2)

        setId(id)
        fetchExercise(id)
        fetchGuideCategories()

    },[])

    //Show form or loading message
    useEffect(() => {
        if(exercise != null && categoryList.length > 0)
            setPageIsReady(true)
        else
            setPageIsReady(false)
    },[exercise, categoryList])

    const fetchExercise = async (id) => {
        try {
            const result = await ExerciseRouter.getExerciseToUpdate(id,serverBase)
            if (result.success == 1){
                const exercise = result.data

                //convert images used on guide pages to blob
                const blobImages = exercise.guide_page_current_images.map(image => convertImageToBlob(image))
                exercise.guide_page_current_images = blobImages

                const initValues = {
                    name: exercise.name,
                    identify: exercise.exercise_id,
                    description: exercise.description,
                    code: exercise.code,
                    categoryId: exercise.guide_page_category.id,
                    teaserImageFile: exercise.image_teaser_base64,
                    guidePageFiles: exercise.guide_page_current_images,
                    guidePageCode: exercise.guide_page_content,
                }
                setInitialValues(initValues)
                setExercise(exercise)
            }
            else{
                setMessage(`❌ ${result.error}`);
            }
          
        } catch (error) {
            //console.log(error)
            setMessage("❌ Error to find exercise data. Verify connection or contact suport")
        }
    };

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

    const convertImageToBlob = (imageData) => {

        // Convert base64 to Blob
        const byteCharacters = atob(imageData.content);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: imageData.type });
        
        // Create object a file similar type File
        const fileLike = Object.assign(blob, {
          name: imageData.filename,
          lastModified: imageData.lastModified * 1000,
          webkitRelativePath: '',
          dataUrl: imageData.dataUrl,
          fromServer: true,
          serverId: imageData.exercise_id
        });
        
        return fileLike;
    };

    return (
        <Container sx={{ mt:3, mb:3 }}>
            <Card sx={{bgcolor: "#8E7756"}}>

                <Typography variant="h4" align="center" sx={{mt: 2, mb: 2}}>
                    Update Exercise
                </Typography>

                <CardContent sx={{bgcolor: "#B39283"}}>
                    { !pageIsReady ? (
                            <Typography variant="h5" align="center" sx={{mt: 2, mb: 2}}>
                                {message}
                            </Typography>
                        ) : (

                        <MultiStepForm
                            initialValues={initialValues}
                            onReturn={() => {window.location.href = `${serverBase}/exerciseListCrud/`}}
                            onSubmit={async values =>
                                sleep(300).then(() => console.log(values))
                            }
                        >
                            <ExerciseDataStep
                                exerciseOriginalData={exercise}
                                validationSchema={exerciseDataValidator}
                            />

                            <HalDataStep
                                exerciseOriginalData={exercise}
                                validationSchema={halDataValidator}
                            />

                            <GuidePageDataStep
                                exerciseOriginalData={exercise}
                                categoryList={categoryList}
                                validationSchema={guidePageDataValidator}
                            />
                        </MultiStepForm>
                        )
                    }
                </CardContent>
            </Card>
        </Container>
    )
};

