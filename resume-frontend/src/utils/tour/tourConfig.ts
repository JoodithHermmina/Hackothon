import { Step } from 'react-joyride';

// Define the tour steps with specific selectors and content
export const defaultTourSteps: Step[] = [
  {
    target: '.app-title',
    content:
      'Welcome to the ThoughtWorks Resume Builder! This tool will help you create a professional resume in ThoughtWorks format.',
    disableBeacon: true,
    placement: 'bottom',
    title: 'Welcome 👋',
  },
  {
    target: '.sample-data-btn',
    content:
      'Click here to load sample data that will help you understand what information to include in each field.',
    placement: 'bottom',
    title: 'Sample Data',
  },
  {
    target: '.stepper-container',
    content:
      'The form is divided into steps. Fill out each section and use the Next and Back buttons to navigate.',
    placement: 'bottom',
    title: 'Form Navigation',
  },
  {
    target: '.form-container',
    content:
      'Enter your information in each form section. All fields have helpful placeholders to guide you.',
    placement: 'bottom',
    title: 'Form Sections',
  },
  {
    target: '.navigation-btns',
    content: 'Use these buttons to navigate between form sections.',
    placement: 'top',
    title: 'Navigation Controls',
  },
  {
    target: '.help-btn',
    content: 'Click here anytime to restart this tour.',
    placement: 'left',
    title: 'Need Help?',
  },
];

// Function to handle missing tour targets gracefully
export const handleMissingElement = (step: Step, index: number, steps: Step[]): Step[] => {
  console.warn(`Tour target not found: ${step.target}`);
  
  // If the current step target is missing, skip to the next available step
  const remainingSteps = steps.slice(index + 1);
  return remainingSteps;
};

// Tour configuration options
export const tourOptions = {
  disableOverlayClose: false,
  hideCloseButton: false,
  hideBackButton: false,
  spotlightClicks: false,
  styles: {
    options: {
      primaryColor: '#0F6A8B', // Match the primary theme color
      zIndex: 10000,
    },
    buttonClose: {
      display: 'none',
    },
    buttonBack: {
      color: '#333',
    },
    buttonNext: {
      backgroundColor: '#0F6A8B',
    },
    spotlight: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
};

// Define tour data storage key
export const TOUR_STORAGE_KEY = 'resumeBuilderTourState';

// Function to save tour state to local storage
export const saveTourState = (stepIndex: number, completed: boolean): void => {
  localStorage.setItem(
    TOUR_STORAGE_KEY,
    JSON.stringify({
      currentStep: stepIndex,
      completed,
      lastUpdated: new Date().toISOString(),
    })
  );
};

// Function to get tour state from local storage
export const getTourState = (): { currentStep: number; completed: boolean } | null => {
  const storedState = localStorage.getItem(TOUR_STORAGE_KEY);
  if (!storedState) return null;
  
  try {
    return JSON.parse(storedState);
  } catch (e) {
    console.error('Error parsing stored tour state', e);
    return null;
  }
};

export default {
  defaultTourSteps,
  handleMissingElement,
  tourOptions,
  saveTourState,
  getTourState,
  TOUR_STORAGE_KEY,
}; 