import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';

import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FormStep } from '../MultiStepForm';
import HalGenerator from '../../editors/HalGenerator';

export const halDataValidator = Yup.object(
    { code: Yup.string().required("HAL's code is required")}
)

export default function HalDataStep({exerciseOriginalData, validationSchema}) {

    const { values, setFieldValue } = useFormikContext();

    const [message, setMessage] = useState("")
    const [isGenarating, setIsGenerating] = useState(false)

    return (
        <FormStep
            onSubmit={() => {}}
            validationSchema={validationSchema}
        >
            <Typography variant="h5" align="center" sx={{mb:3}}>
                {message}
            </Typography>
            <HalGenerator
                formikAtrributeName="code"
                isLoading={isGenarating}
                setIsLoading={(bool)=> {setIsGenerating(bool)}}
                isDisable={false}
                setMessageFunction={(message) => {setMessage(message)}}
                initialHalCode={exerciseOriginalData.code}
            />
            <Box sx={{mt:3}}></Box>
        </FormStep>
    )
}