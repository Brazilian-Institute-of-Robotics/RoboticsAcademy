import React, {useEffect, useState} from 'react';

import { FormStep } from '../MultiStepForm';
import FormError from '../../message_system/FormError';

import TransferList from '../../TransferList';
import UniverseRouter from '../../../helpers/UniverseRouter';

import * as Yup from 'yup';
import { Field, useFormikContext } from 'formik';

import { Grid, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';

import UploadFileButton from '../../buttons/UploadFileButton';

export const universeDataValidator = Yup.object({
    universeName: Yup.string()
    .trim()
    .test(
      'name-required-when-list-empty',
      'Universe name is required when universes chosen list is empty.',
      function (value) {
        const { universeList } = this.parent;
        const listFilled = Array.isArray(universeList) && universeList.length > 0;
        return listFilled ? true : !!(value && value.trim());
      }
    )
    .test(
      'name-required-when-file-present',
      'Universe name is required when world file was informed',
      function (value) {
        const { worldFile } = this.parent
        const filePresent = worldFile != null
        return filePresent ? !!(value && String(value).trim()) : true
      }
    ),

  worldFile: Yup.mixed()
    .nullable()
    .test(
      'file-required-when-list-empty',
      'World file is required when universes chosen list is empty.',
      function (value) {
        const { universeList } = this.parent
        const listFilled = Array.isArray(universeList) && universeList.length > 0
        const filePresent = value != null

        return listFilled ? true : filePresent
      }
    )
    .test(
      'file-required-when-name-present',
      'World file is required when universe name was informed.',
      function (value) {
        const { universeName } = this.parent
        const namePresent = !!(universeName && String(universeName).trim())
        const filePresent = value != null

        return namePresent ? filePresent : true
      }
    ),

  universeList: Yup.array()
    .of(Yup.mixed())
    .test(
      'list-or-pair',
      'Select at least one universe AND/OR informs name + worldfile.',
      function (val) {
        const { universeName, worldFile } = this.parent;
        const namePresent = !!(universeName && String(universeName).trim());
        const filePresent = worldFile != null

        const listFilled = Array.isArray(val) && val.length > 0;
        const pairFilled = namePresent && filePresent;

        return listFilled || pairFilled;
      }
    ),
});

/*
    universeList: List of universes for show
    validationSchema = Yup object validator used to this step
*/
export default function UniverseDataStep({universeList=[], validationSchema}) {

    const [universes, setUniverses] = useState(universeList)
    const [message, setMessage] = useState("")
    
    const { values, setFieldValue, errors, touched } = useFormikContext();

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    // FILTER INVALID CHARACTERS UNIVERSE NAME
    const handleChangeUniverseName = (name) => {

        // : / \ * ? : | " < > . ' espaço - e outros proibidos no Ubuntu
        const invalidChars = /[\/\\?%*:|"<>.\0:;=&#!$'`\n\r\t]/g;

        if (!invalidChars.test(name)) {
            setFieldValue("universeName", name);
        }

    };

    const handleCheckUniverseName = async (e) => {
        const universeName = values.universeName
        if (!universeName) {
            setMessage('❌ Write a universe name to be checked');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
    
        try {
          const result = await UniverseRouter.checkNameAvalability(universeName, serverBase)
          if (result.success == 1)
            if (result.data.exists == 0)
                setMessage(`✅ Universe name is available`);
            else
                setMessage(`❌ Universe name is not available`)
          else
            setMessage(`❌ ${result.data.error}`)
    
        } catch (error) {
          //console.log(error)
          setMessage(`❌ Fail to verify universe name avalability. Check connection or contact suport`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }finally{
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    return (
        <FormStep
            onSubmit={() => {}}
            validationSchema={validationSchema}
        >  
            <Grid container sx={{justifyContent: "center", alignItems: "center", bgcolor:"#ccba87" }}>
                <Grid item xs={12} sx={{textAlign: "center", mb:2, bgcolor:"#b8a87b"}}>
                    <Typography variant='h5'>Create a new universe</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" align="center" sx={{my:3}}>
                        {message}
                    </Typography>
                </Grid>
                <Grid item xs={4} sx={{}}>
                    <Field name="universeName">
                        {({ field, meta }) => {
                            const hasError = meta.touched && !!meta.error;
                            return (
                                <>
                                    <TextField
                                        {...field}
                                        id="universeName"
                                        label="Universe name"
                                        variant="filled"
                                        onChange={(e) => handleChangeUniverseName(e.target.value)}
                                        fullWidth
                                        sx={{ bgcolor:"white", maxWidth:500 }}
                                        error={hasError}
                                    />
                                    <FormError
                                        inputName="universeName" 
                                        errorsList={errors} 
                                        touchedList={touched}
                                    />
                                </>
                            )
                        }}
                    </Field>
                </Grid>
                <Grid item xs={4} sx={{}}>
                    <LoadingButton
                        loading={false}
                        loadingIndicator="Loading..."
                        startIcon={<SearchIcon/>}
                        variant="contained" 
                        component="label"
                        sx={{ ml: 3, mb: 2, textTransform: "none",}}
                        onClick={handleCheckUniverseName}
                    >
                        Check universe name availability
                    </LoadingButton>
                </Grid>
                <Grid item xs={12}  sx={{textAlign: "center", my:2}}>
                    <UploadFileButton
                        formik={null}
                        formikAtrributeName="worldFile"
                        title={"Upload world file"}
                        successTitle={"World file received"}
                        width={"30ch"}
                        fileType=".world"
                        isDisable={false}
                        setMessageFunction={(message) => {setMessage(message)}}
                    />
                </Grid>
                <Grid item xs={12} sx={{textAlign: "center", mb:2, bgcolor:"#bdac7d"}}>
                    <Typography variant='h5'>
                        Use existing universes
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{my:2}}>
                    <TransferList
                        formikAtrributeName="universeList"
                        leftList={universes}
                        itemIdentifyName={"id"} 
                        itemTextLabelName={"name"}
                    />
                </Grid>
            </Grid>
        </FormStep>
    )
}