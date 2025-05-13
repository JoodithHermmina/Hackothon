import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Step } from 'react-joyride';

// Define the type for our tour state
export interface TourState {
  isActive: boolean;
  isFirstVisit: boolean;
  steps: Step[];
  run: boolean;
  stepIndex: number;
  tourCompleted: boolean;
}

// Define the type for our tour context
interface TourContextType {
  tourState: TourState;
  startTour: () => void;
  stopTour: () => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetTour: () => void;
  setTourSteps: (steps: Step[]) => void;
  markTourCompleted: () => void;
}

// Create the context with an initial undefined value
const TourContext = createContext<TourContextType | undefined>(undefined);

// Props for our context provider
interface TourProviderProps {
  children: ReactNode;
  initialSteps?: Step[];
}

export const TourProvider: React.FC<TourProviderProps> = ({ 
  children,
  initialSteps = [] 
}) => {
  // Initialize tour state
  const [tourState, setTourState] = useState<TourState>({
    isActive: false,
    isFirstVisit: false,
    steps: initialSteps,
    run: false,
    stepIndex: 0,
    tourCompleted: false
  });

  // Check if this is the first visit when component mounts
  useEffect(() => {
    const visited = localStorage.getItem('visitedBefore');
    const tourCompleted = localStorage.getItem('tourCompleted') === 'true';
    
    if (!visited) {
      // First time visitor
      setTourState(prevState => ({
        ...prevState,
        isFirstVisit: true,
        run: true, // Auto-start tour for first-time visitors
        tourCompleted: false
      }));
      localStorage.setItem('visitedBefore', 'true');
    } else {
      setTourState(prevState => ({
        ...prevState,
        isFirstVisit: false,
        tourCompleted
      }));
    }
  }, []);

  // Save tour completion state to localStorage
  useEffect(() => {
    if (tourState.tourCompleted) {
      localStorage.setItem('tourCompleted', 'true');
    }
  }, [tourState.tourCompleted]);

  // Function to start the tour
  const startTour = () => {
    setTourState(prevState => ({
      ...prevState,
      isActive: true,
      run: true,
      stepIndex: 0
    }));
  };

  // Function to stop the tour
  const stopTour = () => {
    setTourState(prevState => ({
      ...prevState,
      isActive: false,
      run: false
    }));
  };

  // Function to go to a specific step
  const goToStep = (index: number) => {
    if (index >= 0 && index < tourState.steps.length) {
      setTourState(prevState => ({
        ...prevState,
        stepIndex: index,
        run: true,
        isActive: true
      }));
    }
  };

  // Function to go to the next step
  const nextStep = () => {
    const nextIndex = tourState.stepIndex + 1;
    if (nextIndex < tourState.steps.length) {
      setTourState(prevState => ({
        ...prevState,
        stepIndex: nextIndex
      }));
    } else {
      // End of tour reached
      setTourState(prevState => ({
        ...prevState,
        isActive: false,
        run: false,
        tourCompleted: true
      }));
    }
  };

  // Function to go to the previous step
  const prevStep = () => {
    const prevIndex = tourState.stepIndex - 1;
    if (prevIndex >= 0) {
      setTourState(prevState => ({
        ...prevState,
        stepIndex: prevIndex
      }));
    }
  };

  // Function to reset the tour state
  const resetTour = () => {
    setTourState({
      isActive: false,
      isFirstVisit: false,
      steps: tourState.steps,
      run: false,
      stepIndex: 0,
      tourCompleted: false
    });
    localStorage.removeItem('tourCompleted');
  };

  // Function to set tour steps
  const setTourSteps = (steps: Step[]) => {
    setTourState(prevState => ({
      ...prevState,
      steps
    }));
  };

  // Function to mark the tour as completed
  const markTourCompleted = () => {
    setTourState(prevState => ({
      ...prevState,
      isActive: false,
      run: false,
      tourCompleted: true
    }));
    localStorage.setItem('tourCompleted', 'true');
  };

  // Context value
  const value = {
    tourState,
    startTour,
    stopTour,
    goToStep,
    nextStep,
    prevStep,
    resetTour,
    setTourSteps,
    markTourCompleted
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

// Custom hook to use the tour context
export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  
  return context;
};

export default TourContext; 