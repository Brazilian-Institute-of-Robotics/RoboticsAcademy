import React, { useState, useEffect } from 'react';
import { Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { FormStep } from '../MultiStepForm';
import FormError from '../../message_system/FormError';
import { Editor } from '@monaco-editor/react';
import MutipleFileUploader from '../../uploads/MutipleFileUploader';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';

export const guidePageDataValidator = Yup.object(
    { guidePageCode: Yup.string().required("Markdown code is required")}
)

export default function GuidePageDataStep({exerciseOriginalData, validationSchema, categoryList=[]}) {

    const { values, setFieldValue, errors, touched } = useFormikContext();

    const initialCategoryIdentify = exerciseOriginalData ? exerciseOriginalData.guide_page_category.category_identify : ""

    const [ categoryIdentify, setCategoryIdentify ] = useState(initialCategoryIdentify)

    // UPDATE MARKDOWN WHEN EXERCISE NAME OR
    // EXERCISE CATEGORY CHANGES
    useEffect(() => {

      const name = values.name.trim()
      const categoryId = values.categoryId

      if(name != "" && categoryId != ""){

        const exerciseIdentify = values.identify

        const currentMarkdown = values.guidePageCode
        const frontMatterEnd = currentMarkdown.indexOf('---', 3);

        if (frontMatterEnd === -1) {
          setFieldValue("guidePageCode", "ERROR")
        }

        // Contain only markdown's front matter
        const frontMatter = currentMarkdown.substring(0, frontMatterEnd + 3);

        // Contain markdown page content
        const pageContent = currentMarkdown.substring(frontMatterEnd + 3);

        // Update on markdown the lines "permalink", "title" and "toc_label"
        const updatedFrontMatter = frontMatter
          .replace(
           /(permalink:\s*\/exercises\/)[^\/\s]+\/[a-zA-Z0-9_-]*/,
            `permalink: /exercises/${categoryIdentify}/${exerciseIdentify}`
          )
          .replace(
            /title:\s*"[^"]*"/,
            `title: "${values.name}"`
          )
          .replace(
            /toc_label:\s*"TOC [^"]*"/,
            `toc_label: "TOC ${values.name}"`
          );
        
        // Update on markdown all lines that contain a image path
        const imagePathRegex = /(\/assets\/images\/exercises\/)[^\/\s]+\/([^\/\s"')]+\.(png|jpg|jpeg|gif|svg|webp))/gi
        const updatedPageContent = pageContent.replace(
          imagePathRegex,
          `$1${exerciseIdentify}/$2`
        );
        
        setFieldValue("guidePageCode", updatedFrontMatter + updatedPageContent)
      }
      
    }, [values.name, values.categoryId]);

    const handleChangeCategory = (categoryId) => {
      const category_selected = categoryList.find(category => category.id == categoryId)
      setFieldValue("categoryId", categoryId);
      setCategoryIdentify(category_selected.category_identify)
    }

    return (
        <FormStep
            onSubmit={() => console.log('Step2 onSubmit')}
            validationSchema={validationSchema}
        >
          <Grid sx={{ mb: 0 }}>
            <Field name="categoryId">
                {({ field, meta, form }) => {
                  const hasError = meta.touched && !!meta.error;
                  return (
                      <>
                        <TextField
                            select
                            variant="filled"
                            label="Guide's category"
                            id="categoryId"
                            value={field.value ?? ""}
                            error={hasError}
                            onChange={(e) => { handleChangeCategory(e.target.value, false);}}
                            sx={{ bgcolor: "white" }}
                        >
                            {categoryList.map((c) => (
                                <MenuItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <FormError inputName="categoryId" errorsList={errors} touchedList={touched}/>
                      </>
                  );
                }}
            </Field>
          </Grid>
            
            {/* GUIDE PAGES FILES */}
            <MutipleFileUploader
              formik={null}
              formikAtrributeName="guidePageFiles"
              fileTypes=".png, .jpg, .jpeg, .gif"
              startText="Insert here new files to be used in guide page"
            />

            
            {/* WARNING MARKDOWN CODE */}
            {
              values.name.trim() !== "" && values.categoryId !== "" ? (
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
                    2 - To use new images, use the path: "/assets/images/exercises/{values.identify}/FILE_NAME.FORMAT"
                  </Typography>
                </Box>
              ) : (<div></div>)
            }

            <FormError inputName="guidePageCode" errorsList={errors} touchedList={touched}/>
            <Editor
                name="code"
                height="600px"
                defaultLanguage="markdown"
                value={values.guidePageCode}
                onChange={(value) => { setFieldValue("guidePageCode", value);}}
                theme="vs-dark"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    readOnly: !(values.name.trim() && values.categoryId !== "")
                }}
            />
            <Box sx={{mt:3}}></Box>
        </FormStep>
    )

}