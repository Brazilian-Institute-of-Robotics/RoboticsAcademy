import React, { useState } from 'react';
import * as Yup from 'yup';
import { Field, useFormikContext } from 'formik';

import { Button, Grid, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


import FormError from '../../message_system/FormError';
import { LoadingButton } from '@mui/lab';
import { Box, styled } from '@mui/system';
import { FormStep } from '../MultiStepForm';

const nameInvalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/;

export const exerciseDataValidator = Yup.object({
    name: Yup.string()
        .trim()
        .required('Name is required')
        .max(40, "Max length is 40 characters")
        .test("no-invalid-chars", 'Characters not allowed: / \\ ? % * : | " < > . ; = & # ! $ \' ` ', 
            (val) => {
                if (typeof val !== "string") return false;
                return !nameInvalidChars.test(val);
            }
        ),
    description: Yup.string().max(400, "Max length is 400 characters"),      
})

export default function ExerciseDataStep({exerciseOriginalData, validationSchema}) {

    //formik values on initialValues
    const { values, setFieldValue, errors, touched } = useFormikContext();

    const [message, setMessage] = useState("")
    const [isCheckingExerciseName, setIsCheckingExerciseName] = useState(false)
    
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleCheckExerciseName = async () => {
        const name = values.name
        if (!name) {
            setMessage('❌ Write a exercise name to be checked');
            return;
        }

        //Case name don't change
        if(name == exerciseOriginalData.name){
            setMessage(`✅ Exercise name is available`);
            return;
        }

        try{
            setIsCheckingExerciseName(true)
            const result = await ExerciseRouter.checkNameAvalability(name, serverBase)

            if (result.success == 1)
                if (result.data.exists == 0)
                    setMessage(`✅ Exercise name is available`);
                else
                    setMessage(`❌ Exercise name is not available`)
            else
                setMessage(`❌ ${result.data.error}`)
            
        }catch(error){
            setMessage(`❌ Fail to verify exercise name avalability. Check connection or contact suport`);
        }finally{
            setIsCheckingExerciseName(false)
        }
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.name.endsWith(".png")) {
            const reader = new FileReader();
        
            reader.onload = (e) => {
                //console.log(e.target.result)

                //The result will be string base64 on format: "data:image/png;base64,..."
                setFieldValue("teaserImageFile", e.target.result)
                setMessage('');
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setMessage('❌ Only .world file is allowed')
        }
    };

    // FILTER INVALID CHARACTERS EXERCISE NAME
    function handleChangeExerciseName(name){

        // : / \ * ? : | " < > . ' - e outros proibidos no Ubuntu
        const invalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/g;

        if (!invalidChars.test(name)){
            const identify = name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '_')
            
            setFieldValue("name", name)
            setFieldValue("identify", identify)
        }
    };

    return (
        <FormStep
            onSubmit={() => {}}
            validationSchema={validationSchema}
        >
            <Typography variant="h5" align="center" sx={{mb:3}}>
                {message}
            </Typography>
            
            <Grid container sx={{ mb: 2, alignItems: "center"}}>
                <Grid item xs={7} sx={{}}>
                    <Field name="name">
                        {({ field, meta }) => {
                            const hasError = meta.touched && !!meta.error;
                            return (
                                <>
                                    <TextField
                                        {...field}
                                        id="name"
                                        label="Name"
                                        variant="filled"
                                        onChange={(e) => handleChangeExerciseName(e.target.value)}
                                        fullWidth
                                        sx={{ bgcolor:"white" }}
                                        error={hasError}
                                    />
                                    <FormError inputName="name" errorsList={errors} touchedList={touched} />
                                </>
                            )
                        }}
                    </Field>
                </Grid>
                <Grid item xs={5} sx={{}}>
                    <LoadingButton 
                        loading={isCheckingExerciseName}
                        loadingIndicator="Loading..."
                        startIcon={<SearchIcon/>}
                        variant="contained" 
                        component="label"
                        sx={{ ml: 3, mb: 2, textTransform: "none",}}
                        onClick={handleCheckExerciseName}
                    >
                        Check exercise name availability
                    </LoadingButton>
                </Grid>
            </Grid>
            <Grid container sx={{ mb:3, alignItems: "center" }}>
                <Field name="description">
                    {({ field, meta }) => {
                        const hasError = meta.touched && !!meta.error;

                        return (
                            <>
                                <TextField
                                    {...field}
                                    id="description"
                                    label="Description"
                                    variant="filled"
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    sx={{ bgcolor:"white" }}
                                    error={hasError}
                                />
                                <FormError inputName="description" errorsList={errors} touchedList={touched}/>
                            </>
                        )
                    }}
                </Field>
            </Grid>

            <Box sx={{mb:2}} display="flex" flexDirection="row">
                <Box
                    sx={{ bgcolor:"darkgray", display:"flex",  justifyContent: "center", alignItems: "center", width: "50%",}}
                >
                    <img
                        src={values.teaserImageFile}
                        alt={values.name}
                        style={{ maxWidth: '80%', height: '80%' }}
                    />
                </Box>
                <Box
                    sx={{
                        bgcolor:"#D9C8B4",
                        width: "50%",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <Button component="label" size="large" variant="contained">
                        Insert new teaser image
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleFileChange}
                            accept=".png"
                        />
                    </Button>
                    <Button 
                        size="large" 
                        variant="contained"
                        onClick={() => {
                            setFieldValue("teaserImageFile", exerciseOriginalData.image_teaser_base64)
                        }}
                    >
                        Reset teaser image
                    </Button>
                </Box>
                
            </Box>
        </FormStep>
    )
}