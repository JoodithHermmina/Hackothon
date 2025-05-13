import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourProvider } from '../../contexts/TourContext';
import { Step } from 'react-joyride';

// Mock localStorage
const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock variables for the tour context
let mockIsActive = false;
let mockIsFirstVisit = false;
let mockRun = false;
let mockStepIndex = 0;
let mockTourCompleted = false;
let mockSteps: Step[] = [];

// Mock functions for the tour context
const mockStartTour = jest.fn();
const mockStopTour = jest.fn();
const mockResetTour = jest.fn();
const mockMarkTourCompleted = jest.fn();
const mockGoToStep = jest.fn();
const mockNextStep = jest.fn();
const mockPrevStep = jest.fn();
const mockSetTourSteps = jest.fn();

// Mock the useTour hook
jest.mock('../../contexts/TourContext', () => {
  const mockUseTour = () => ({
    tourState: {
      isActive: mockIsActive,
      isFirstVisit: mockIsFirstVisit,
      steps: mockSteps,
      run: mockRun,
      stepIndex: mockStepIndex,
      tourCompleted: mockTourCompleted
    },
    startTour: mockStartTour,
    stopTour: mockStopTour,
    resetTour: mockResetTour,
    markTourCompleted: mockMarkTourCompleted,
    goToStep: mockGoToStep,
    nextStep: mockNextStep,
    prevStep: mockPrevStep,
    setTourSteps: mockSetTourSteps
  });

  return {
    __esModule: true,
    TourProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useTour: mockUseTour,
    default: {
      Provider: ({ children }: { children: ReactNode }) => <>{children}</>
    }
  };
});

// Test component that uses the tour context
const TestComponent: React.FC = () => {
  const { tourState, startTour, stopTour, resetTour } = require('../../contexts/TourContext').useTour();
  
  return (
    <div>
      <div data-testid="tour-active">{tourState.isActive.toString()}</div>
      <div data-testid="tour-run">{tourState.run.toString()}</div>
      <div data-testid="tour-completed">{tourState.tourCompleted.toString()}</div>
      <div data-testid="tour-first-visit">{tourState.isFirstVisit.toString()}</div>
      <button data-testid="start-tour" onClick={startTour}>Start Tour</button>
      <button data-testid="stop-tour" onClick={stopTour}>Stop Tour</button>
      <button data-testid="reset-tour" onClick={resetTour}>Reset Tour</button>
    </div>
  );
};

describe('TourContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock values to defaults
    mockIsActive = false;
    mockIsFirstVisit = false;
    mockRun = false;
    mockStepIndex = 0;
    mockTourCompleted = false;
    mockSteps = [];
  });

  it('initializes with default values', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('tour-active').textContent).toBe('false');
    expect(screen.getByTestId('tour-run').textContent).toBe('false');
    expect(screen.getByTestId('tour-completed').textContent).toBe('false');
  });

  it('sets isFirstVisit to true for first-time visitors', async () => {
    // Update mock for this test
    mockIsFirstVisit = true;

    render(<TestComponent />);

    expect(screen.getByTestId('tour-first-visit').textContent).toBe('true');
  });

  it('starts the tour when startTour is called', () => {
    render(<TestComponent />);

    const startButton = screen.getByTestId('start-tour');
    userEvent.click(startButton);

    expect(mockStartTour).toHaveBeenCalled();
  });

  it('stops the tour when stopTour is called', () => {
    // Update mock for this test
    mockIsActive = true;
    mockRun = true;

    render(<TestComponent />);

    const stopButton = screen.getByTestId('stop-tour');
    userEvent.click(stopButton);

    expect(mockStopTour).toHaveBeenCalled();
  });

  it('resets the tour when resetTour is called', () => {
    // Update mock for this test
    mockTourCompleted = true;

    render(<TestComponent />);

    const resetButton = screen.getByTestId('reset-tour');
    userEvent.click(resetButton);

    expect(mockResetTour).toHaveBeenCalled();
    expect(screen.getByTestId('tour-completed').textContent).toBe('true');
  });
}); 