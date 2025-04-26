import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

const steps = ['Preferences', 'Plan', 'Groceries'];

interface ProgressStepperProps {
  activeStep: number;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ activeStep }) => {
  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

export default ProgressStepper;
