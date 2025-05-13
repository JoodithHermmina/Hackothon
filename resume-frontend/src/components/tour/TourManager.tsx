import React, { useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, TooltipRenderProps } from 'react-joyride';
import { Box, Button, Typography } from '@mui/material';

import { useTour } from '../../contexts/TourContext';
import { handleMissingElement, tourOptions } from '../../utils/tour/tourConfig';

// Custom tooltip component for better styling
const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size,
  isLastStep
}: TooltipRenderProps) => (
  <Box
    {...tooltipProps}
    sx={{
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
      color: '#333',
      maxWidth: '420px',
      padding: '15px',
      textAlign: 'center',
      zIndex: 10001,
    }}
  >
    {step.title && (
      <Typography variant="h6" sx={{ mb: 1, color: '#0F6A8B' }}>
        {step.title}
      </Typography>
    )}
    <Typography variant="body1" sx={{ mb: 2 }}>
      {step.content}
    </Typography>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 2,
      }}
    >
      {index > 0 && (
        <Button {...backProps} variant="outlined" size="small">
          Back
        </Button>
      )}
      {!index && (
        <Button {...closeProps} variant="outlined" size="small">
          Skip
        </Button>
      )}
      <Button
        {...primaryProps}
        variant="contained"
        size="small"
        sx={{ ml: 'auto' }}
      >
        {isLastStep ? 'Finish' : 'Next'}
      </Button>
    </Box>
  </Box>
);

interface TourManagerProps {
  steps: Step[];
}

const TourManager: React.FC<TourManagerProps> = ({ steps }) => {
  const { 
    tourState, 
    setTourSteps, 
    stopTour, 
    nextStep, 
    markTourCompleted 
  } = useTour();

  // Set steps when component mounts
  useEffect(() => {
    setTourSteps(steps);
  }, [steps, setTourSteps]);

  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Handle missing elements
    if (type === 'error:target_not_found') {
      console.warn(`Target element not found: ${steps[index]?.target}`);
      nextStep(); // Skip to next step
      return;
    }

    // Handle tour completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      markTourCompleted();
    }

    // Handle tour pause
    if (action === 'close' || action === 'skip') {
      stopTour();
    }

    // Handle tour next step
    if (action === 'next' && type === 'step:after') {
      nextStep();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={tourState.run}
      scrollToFirstStep
      showProgress
      showSkipButton
      stepIndex={tourState.stepIndex}
      steps={tourState.steps}
      styles={tourOptions.styles}
      tooltipComponent={CustomTooltip}
      disableOverlayClose={tourOptions.disableOverlayClose}
      spotlightClicks={tourOptions.spotlightClicks}
    />
  );
};

export default TourManager; 