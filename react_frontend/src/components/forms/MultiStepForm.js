import React, { useState, useEffect, cloneElement } from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export function FormStep ({children}){ return children};

export default function MultiStepForm  ({ children, initialValues, onReturn, onSubmit }) {
  const [stepNumber, setStepNumber] = useState(0);
  const steps = React.Children.toArray(children);
  const [snapshot, setSnapshot] = useState(initialValues);

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  useEffect(() => {
    setSnapshot(initialValues);
  }, [initialValues]);

  /** Util: foca no primeiro campo com erro */
  const focusFirstError = (errors) => {
    const first = Object.keys(errors)[0];
    if (!first) return;
    const el =
      document.querySelector(`[name="${first}"]`) ||
      document.querySelector(`[name^="${first}."]`);
    if (el && typeof el.focus === "function") el.focus();
  }

  const next = values => {
    setSnapshot(values);
    setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
  };

  const previous = values => {
    setSnapshot(values);
    setStepNumber(Math.max(stepNumber - 1, 0));
  };

  const handleSubmit = async (values, bag) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(values, bag);
    }
    if (isLastStep) {
      return onSubmit(values, bag);
    } else {

      // Validate data from actual step before let to go to next one
      const errors = await bag.validateForm();
      bag.setTouched(
        Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
        false
      );

      if (Object.keys(errors).length > 0) {
        focusFirstError(errors);
        bag.setSubmitting(false);
        return;
      }
      
      next(values);
      bag.setSubmitting(false);
     
    }
  };

  return (
    <Formik
      initialValues={snapshot}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={step.props.validationSchema}
      validateOnBlur={true}
      validateOnChange={false}
    >
      {(formik) => {
        return (
          <Form>
            <p>Step {stepNumber + 1} of {totalSteps}</p>
            {step}
            <div style={{ 
                display: 'flex',
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div>
                {stepNumber > 0 ? 
                  (
                    <Button 
                      variant="contained"
                      onClick={() => previous(formik.values)}
                    >
                      Back
                    </Button>
                  ) : 
                  (
                    <Button 
                      variant="contained"
                      onClick={onReturn}
                    >
                      Back to list
                    </Button>
                  )
              }
              </div>
              

              <LoadingButton
                variant="contained"
                disabled={formik.isSubmitting} 
                type="submit"
              >
                {isLastStep ? 'Submit' : 'Next'}
              </LoadingButton>
              
            </div>
          </Form>
        
        )
      }}
    </Formik>
  );
};