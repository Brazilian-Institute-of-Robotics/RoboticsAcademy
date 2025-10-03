import React, { useState, useEffect } from 'react';

import { useFormikContext } from 'formik';
import * as Yup from 'yup';

import { FormStep } from '../MultiStepForm';
import FormError from '../../message_system/FormError';

import { Editor } from '@monaco-editor/react';

import MutipleFileUploader from '../../uploads/MutipleFileUploader';

import { Typography } from '@mui/material';
import { Box } from '@mui/system';

export const guidePageDataValidator = Yup.object(
    { guidePageCode: Yup.string().required("Markdown code is required")}
)

/*
    exerciseOriginalData = Case you want to edit exercise data, store in this prop
    validationSchema = Yup object validator used to this step
*/
export default function GuidePageDataStep({exerciseOriginalData=null, validationSchema }) {

    const { values, setFieldValue, errors, touched } = useFormikContext();

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    // UPDATE MARKDOWN WHEN EXERCISE NAME OR
    // EXERCISE CATEGORY CHANGES
    useEffect(() => {
      updatedMarkdown(
        values.exerciseName,
        values.exerciseIdentify,
        values.categoryId,
        values.categoryIdentify,
        values.guidePageCode
      )
      
    }, [values.exerciseName, values.categoryId]);

    const updatedMarkdown = (name, exerciseIdentify, categoryId, categoryIdentify, currentMarkdown) => {
      if(name.trim() != "" && categoryId != ""){

        const frontMatterEnd = currentMarkdown.indexOf('---', 3);

        if (frontMatterEnd === -1) {
          setFieldValue("guidePageCode", "ERROR")
        }

        // Contain only markdown's front matter
        const frontMatter = currentMarkdown.substring(0, frontMatterEnd + 3);

        // Contain markdown page content
        const pageContent = currentMarkdown.substring(frontMatterEnd + 3);
        
        let updatedFrontMatter = frontMatter

        // Case this component is used to create new exercise
        if (exerciseOriginalData == null){
          updatedFrontMatter = updatedFrontMatter
            .replace(/{CATEGORY_INDENTIFY}/g, categoryIdentify)
            .replace(/{EXERCISE_ID}/g, exerciseIdentify)
            .replace(/{EXERCISE_NAME}/g, name);
        }

        // Update on markdown the lines "permalink", "title" and "toc_label"
        updatedFrontMatter = updatedFrontMatter
          .replace(
           /(permalink:\s*\/exercises\/)[^\/\s]+\/[a-zA-Z0-9_-]*/,
            `permalink: /exercises/${categoryIdentify}/${exerciseIdentify}`
          )
          .replace(
            /title:\s*"[^"]*"/,
            `title: "${values.exerciseName}"`
          )
          .replace(
            /toc_label:\s*"TOC [^"]*"/,
            `toc_label: "TOC ${values.exerciseName}"`
          );
        
        // Update on markdown all lines that contain a image path
        const imagePathRegex = /(\/?assets\/images\/exercises\/)[^\/\s]+\/([^\/\s"')]+\.(png|jpg|jpeg|gif|svg|webp))/gi
        const updatedPageContent = pageContent.replace(
          imagePathRegex,
          `$1${exerciseIdentify}/$2`
        );
        
        setFieldValue("guidePageCode", updatedFrontMatter + updatedPageContent)
      }
    }

    return (
        <FormStep
            onSubmit={() => console.log('Step2 onSubmit')}
            validationSchema={validationSchema}
        >   
            {/* GUIDE PAGES FILES */}
            <MutipleFileUploader
              formik={null}
              formikAtrributeName="guidePageFiles"
              fileTypes=".png, .jpg, .jpeg, .gif"
              startText="Insert here new files to be used in guide page"
            />

            
            {/* WARNING MARKDOWN CODE */}
            {
              values.exerciseName.trim() !== "" && values.categoryId !== "" ? (
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
                    2 - To use new images, use the path: "/assets/images/exercises/{values.exerciseIdentify}/FILE_NAME.FORMAT"
                  </Typography>
                </Box>
              ) : (<div></div>)
            }

            <FormError inputName="guidePageCode" errorsList={errors} touchedList={touched}/>
            <Editor
                name="guidePageCode"
                height="600px"
                defaultLanguage="markdown"
                value={values.guidePageCode}
                onChange={(value) => { setFieldValue("guidePageCode", value);}}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    readOnly: !(values.exerciseName.trim() && values.categoryId !== "")
                }}
            />
            <Box sx={{mt:3}}></Box>
        </FormStep>
    )

}