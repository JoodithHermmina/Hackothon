import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';

// Import components
import PersonalInfoForm from './components/PersonalInfoForm';
import ThoughtworksExperienceForm from './components/ThoughtworksExperienceForm';
import OtherExperienceForm from './components/OtherExperienceForm';
import SkillsForm from './components/SkillsForm';
import ReviewForm from './components/ReviewForm';

// Import tour components
import { TourControls, TourManager, TourWelcomeDialog } from './components/tour';
import { TourProvider } from './contexts/TourContext';
import { defaultTourSteps } from './utils/tour/tourConfig';

// Import types
import { ResumeFormData, defaultFormData } from './types/resume';

// Backend API URL
const API_URL = 'http://localhost:5001';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0F6A8B',
    },
    secondary: {
      main: '#E7332B',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const steps = [
  'Personal Information',
  'ThoughtWorks Experience',
  'Other Experience',
  'Skills',
  'Review & Submit',
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1000px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

const getStepContent = (
  step: number,
  formData: ResumeFormData,
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>,
  setActiveStep: React.Dispatch<React.SetStateAction<number>>
) => {
  switch (step) {
    case 0:
      return <PersonalInfoForm formData={formData} setFormData={setFormData} />;
    case 1:
      return <ThoughtworksExperienceForm formData={formData} setFormData={setFormData} />;
    case 2:
      return <OtherExperienceForm formData={formData} setFormData={setFormData} />;
    case 3:
      return <SkillsForm formData={formData} setFormData={setFormData} />;
    case 4:
      return <ReviewForm formData={formData} setActiveStep={setActiveStep} />;
    default:
      return 'Unknown step';
  }
};

const AppContent: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [formData, setFormData] = useState<ResumeFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState<boolean>(false);

  useEffect(() => {
    // Check if this is the first visit
    const visited = localStorage.getItem('visitedBefore');
    if (!visited) {
      // First time visitor
      setShowWelcomeDialog(true);
    }
  }, []);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData(defaultFormData);
    setSuccess('');
    setError('');
    setPdfBlob(null);
  };

  const loadSampleData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sample-data`);
      setFormData(response.data);
    } catch (err) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data. Please try again.');
    }
  };

  const handlePreview = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await axios.post(`${API_URL}/api/generate-pdf`, formData, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlob(blobUrl);
      setPreviewOpen(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please check your data and try again.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    await handlePreview();
    setSuccess('Your resume has been generated successfully!');
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleDownloadPdf = () => {
    if (pdfBlob) {
      const link = document.createElement('a');
      link.href = pdfBlob;
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleWelcomeDialogStart = () => {
    setShowWelcomeDialog(false);
  };

  const handleWelcomeDialogSkip = () => {
    setShowWelcomeDialog(false);
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" className="app-title" sx={{ flexGrow: 1 }}>
            ThoughtWorks Resume Builder
          </Typography>
          <TourControls />
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ mt: 4, mb: 4 }} className="sample-data-container">
          <Button
            variant="outlined"
            onClick={loadSampleData}
            className="sample-data-btn"
            sx={{ mb: 2 }}
          >
            Load Sample Data
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
          <Typography component="h1" variant="h4" align="center" className="form-title">
            Build Your Resume
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }} className="stepper-container">
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Thank you for using ThoughtWorks Resume Builder!
              </Typography>
              <Typography variant="subtitle1">
                Your resume has been created successfully. You can download it by clicking the button
                below.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownloadPdf}
                  sx={{ mr: 1 }}
                >
                  Download PDF
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Create Another Resume
                </Button>
              </Box>
            </Box>
          ) : (
            <Box className="form-container">
              {getStepContent(activeStep, formData, setFormData, setActiveStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }} className="navigation-btns">
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Generate Resume'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {success && (
          <Box sx={{ mt: 2 }}>
            <Typography color="success.main">{success}</Typography>
          </Box>
        )}

        {/* Modal for PDF preview */}
        <Modal
          open={previewOpen}
          onClose={handleClosePreview}
          aria-labelledby="preview-modal-title"
          aria-describedby="preview-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="preview-modal-title" variant="h6" component="h2" gutterBottom>
              Resume Preview
            </Typography>
            {pdfBlob && (
              <Box sx={{ width: '100%', height: '70vh' }}>
                <iframe
                  src={pdfBlob}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="Resume Preview"
                />
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleClosePreview} color="inherit">
                Close
              </Button>
              <Button onClick={handleDownloadPdf} variant="contained" color="primary">
                Download
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={handleCloseConfirm}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Generate Resume</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you ready to generate your resume? Please make sure all information is correct.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} color="primary" autoFocus>
              Generate
            </Button>
          </DialogActions>
        </Dialog>

        {/* Welcome Dialog for Tour */}
        <TourWelcomeDialog
          open={showWelcomeDialog}
          onStartTour={handleWelcomeDialogStart}
          onSkipTour={handleWelcomeDialogSkip}
        />

        {/* Tour Manager */}
        <TourManager steps={defaultTourSteps} />
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TourProvider initialSteps={defaultTourSteps}>
        <AppContent />
      </TourProvider>
    </ThemeProvider>
  );
};

export default App;
