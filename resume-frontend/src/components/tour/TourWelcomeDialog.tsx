import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

interface TourWelcomeDialogProps {
  open: boolean;
  onStartTour: () => void;
  onSkipTour: () => void;
}

const TourWelcomeDialog: React.FC<TourWelcomeDialogProps> = ({
  open,
  onStartTour,
  onSkipTour,
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="tour-welcome-dialog-title"
      aria-describedby="tour-welcome-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="tour-welcome-dialog-title" sx={{ textAlign: 'center', pb: 0 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <EmojiPeopleIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" component="div" fontWeight="bold" color="primary">
            Welcome to ThoughtWorks Resume Builder!
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="tour-welcome-dialog-description" sx={{ textAlign: 'center', mt: 2 }}>
          It looks like this is your first time using our resume builder. Would you like to take a
          quick tour to learn how to use the application?
        </DialogContentText>
        <Box sx={{ mt: 3, px: 2 }}>
          <Typography variant="body1" component="div" gutterBottom>
            The tour will guide you through:
          </Typography>
          <ul>
            <li>How to navigate between different sections</li>
            <li>Where to find help and sample data</li>
            <li>The key features of the resume builder</li>
            <li>How to preview and download your resume</li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
            You can always restart the tour later by clicking the help icon in the top right corner.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={onSkipTour}
          color="inherit"
          variant="outlined"
          sx={{ minWidth: '120px' }}
        >
          Skip Tour
        </Button>
        <Button
          onClick={onStartTour}
          color="primary"
          variant="contained"
          sx={{ minWidth: '120px' }}
          autoFocus
        >
          Start Tour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TourWelcomeDialog; 