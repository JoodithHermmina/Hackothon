import React from 'react';
import { render, screen } from '@testing-library/react';
import TourManager from '../../../components/tour/TourManager';
import { TourProvider } from '../../../contexts/TourContext';
import { Step } from 'react-joyride';

// Mock Joyride
jest.mock('react-joyride', () => {
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="mock-joyride" />),
    STATUS: {
      FINISHED: 'finished',
      SKIPPED: 'skipped',
    },
  };
});

// Mock the tour context values
jest.mock('../../../contexts/TourContext', () => {
  const originalModule = jest.requireActual('../../../contexts/TourContext');
  
  return {
    ...originalModule,
    useTour: jest.fn(() => ({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      setTourSteps: jest.fn(),
      stopTour: jest.fn(),
      nextStep: jest.fn(),
      markTourCompleted: jest.fn()
    }))
  };
});

describe('TourManager', () => {
  const mockSteps: Step[] = [
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
  });

  it('renders the Joyride component', () => {
    render(
      <TourProvider>
        <TourManager steps={mockSteps} />
      </TourProvider>
    );

    expect(screen.getByTestId('mock-joyride')).toBeInTheDocument();
  });

  it('sets the tour steps on mount', () => {
    const { useTour } = require('../../../contexts/TourContext');
    const setTourStepsMock = jest.fn();
    useTour.mockReturnValue({
      tourState: {
        isActive: false,
        isFirstVisit: false,
        steps: [],
        run: false,
        stepIndex: 0,
        tourCompleted: false
      },
      setTourSteps: setTourStepsMock,
      stopTour: jest.fn(),
      nextStep: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourManager steps={mockSteps} />
      </TourProvider>
    );

    expect(setTourStepsMock).toHaveBeenCalledWith(mockSteps);
  });

  it('uses the tour state values from context', () => {
    const Joyride = require('react-joyride').default;
    const { useTour } = require('../../../contexts/TourContext');
    
    // Set some specific tour state values
    useTour.mockReturnValue({
      tourState: {
        isActive: true,
        isFirstVisit: true,
        steps: mockSteps,
        run: true,
        stepIndex: 1,
        tourCompleted: false
      },
      setTourSteps: jest.fn(),
      stopTour: jest.fn(),
      nextStep: jest.fn(),
      markTourCompleted: jest.fn()
    });

    render(
      <TourProvider>
        <TourManager steps={mockSteps} />
      </TourProvider>
    );

    // Verify Joyride was called with the correct props
    expect(Joyride).toHaveBeenCalledWith(
      expect.objectContaining({
        run: true,
        stepIndex: 1,
        steps: mockSteps,
      }),
      expect.anything()
    );
  });

  it('handles tour callbacks properly', () => {
    const Joyride = require('react-joyride').default;
    const { useTour } = require('../../../contexts/TourContext');
    
    const markTourCompletedMock = jest.fn();
    const stopTourMock = jest.fn();
    const nextStepMock = jest.fn();
    
    useTour.mockReturnValue({
      tourState: {
        isActive: true,
        isFirstVisit: false,
        steps: mockSteps,
        run: true,
        stepIndex: 0,
        tourCompleted: false
      },
      setTourSteps: jest.fn(),
      stopTour: stopTourMock,
      nextStep: nextStepMock,
      markTourCompleted: markTourCompletedMock
    });

    render(
      <TourProvider>
        <TourManager steps={mockSteps} />
      </TourProvider>
    );

    // Extract the callback function
    const callbackFn = Joyride.mock.calls[0][0].callback;
    
    // Test FINISHED status
    callbackFn({
      action: 'next',
      index: 1,
      status: 'finished',
      type: 'tour:end',
    });
    expect(markTourCompletedMock).toHaveBeenCalled();
    
    // Test close action
    callbackFn({
      action: 'close',
      index: 0,
      status: 'running',
      type: 'step:before',
    });
    expect(stopTourMock).toHaveBeenCalled();
    
    // Test next action
    callbackFn({
      action: 'next',
      index: 0,
      status: 'running',
      type: 'step:after',
    });
    expect(nextStepMock).toHaveBeenCalled();
  });
}); 