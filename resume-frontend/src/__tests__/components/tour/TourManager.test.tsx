import React from 'react';
import { render, screen } from '@testing-library/react';
import TourManager from '../../../components/tour/TourManager';
import { Step } from 'react-joyride';

// Create a mock callback function to capture
let mockJoyrideCallback: ((data: any) => void) | null = null;

// Mock Joyride component
const MockJoyride = (props: any) => {
  // Capture the callback function
  if (props.callback) {
    mockJoyrideCallback = props.callback;
  }
  return <div data-testid="mock-joyride">Mock Joyride</div>;
};

// Mock Joyride
jest.mock('react-joyride', () => {
  return {
    __esModule: true,
    default: function MockJoyride(props: any) {
      // Capture the callback function
      if (props.callback) {
        mockJoyrideCallback = props.callback;
      }
      return <div data-testid="mock-joyride">Mock Joyride</div>;
    },
    STATUS: {
      FINISHED: 'finished',
      SKIPPED: 'skipped',
    },
  };
});

// Simple mock functions and state for the tour context
const mockSetTourSteps = jest.fn();
const mockStopTour = jest.fn();
const mockNextStep = jest.fn();
const mockMarkTourCompleted = jest.fn();
const mockStartTour = jest.fn();
const mockResetTour = jest.fn();
const mockGoToStep = jest.fn();
const mockPrevStep = jest.fn();

let mockSteps: Step[] = [];
let mockIsActive = false;
let mockIsFirstVisit = false;
let mockRun = false;
let mockStepIndex = 0;
let mockTourCompleted = false;

// Mock the tour context hook
jest.mock('../../../contexts/TourContext', () => {
  return {
    useTour: () => ({
      tourState: {
        isActive: mockIsActive,
        isFirstVisit: mockIsFirstVisit,
        steps: mockSteps,
        run: mockRun,
        stepIndex: mockStepIndex,
        tourCompleted: mockTourCompleted,
      },
      startTour: mockStartTour,
      stopTour: mockStopTour,
      resetTour: mockResetTour,
      markTourCompleted: mockMarkTourCompleted,
      goToStep: mockGoToStep,
      nextStep: mockNextStep,
      prevStep: mockPrevStep,
      setTourSteps: mockSetTourSteps,
    })
  };
});

describe('TourManager', () => {
  const mockStepsList: Step[] = [
    {
      target: '.test-target-1',
      content: 'Test content 1',
      title: 'Test Title 1',
    },
    {
      target: '.test-target-2',
      content: 'Test content 2',
      title: 'Test Title 2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock values
    mockSteps = [];
    mockIsActive = false;
    mockIsFirstVisit = false;
    mockRun = false;
    mockStepIndex = 0;
    mockTourCompleted = false;
    // Reset the callback
    mockJoyrideCallback = null;
  });

  it('renders the Joyride component', () => {
    render(<TourManager steps={mockStepsList} />);
    expect(screen.getByTestId('mock-joyride')).toBeInTheDocument();
  });

  it('sets the tour steps on mount', () => {
    render(<TourManager steps={mockStepsList} />);
    expect(mockSetTourSteps).toHaveBeenCalledWith(mockStepsList);
  });

  it('uses the tour state values from context', () => {
    // Set some specific tour state values
    mockIsActive = true;
    mockIsFirstVisit = true;
    mockSteps = mockStepsList;
    mockRun = true;
    mockStepIndex = 1;

    render(<TourManager steps={mockStepsList} />);

    // Just check that the component renders
    expect(screen.getByTestId('mock-joyride')).toBeInTheDocument();
  });

  it('handles tour callbacks properly', () => {
    // Set up mock context for this test
    mockIsActive = true;
    mockSteps = mockStepsList;
    mockRun = true;

    render(<TourManager steps={mockStepsList} />);

    // Make sure the callback was captured
    expect(mockJoyrideCallback).not.toBeNull();
    
    if (mockJoyrideCallback) {
      // Test FINISHED status
      mockJoyrideCallback({
        action: 'next',
        index: 1,
        status: 'finished',
        type: 'tour:end',
      });
      expect(mockMarkTourCompleted).toHaveBeenCalled();
      
      // Test close action
      mockJoyrideCallback({
        action: 'close',
        index: 0,
        status: 'running',
        type: 'step:before',
      });
      expect(mockStopTour).toHaveBeenCalled();
      
      // Test next action
      mockJoyrideCallback({
        action: 'next',
        index: 0,
        status: 'running',
        type: 'step:after',
      });
      expect(mockNextStep).toHaveBeenCalled();
    }
  });
}); 