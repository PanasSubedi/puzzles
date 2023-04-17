import { useState } from 'react';

import {
  Dialog, DialogTitle, DialogActions, DialogContent,
  TextField, Typography,
  Button, IconButton,
  Grid,
  Tooltip,
} from '@mui/material';

import {
  MicNone as MicNoneIcon,
  Mic as MicIcon,
} from '@mui/icons-material';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { getBlockIDFromSentence, getPositionFromSentence } from '../helpers/pyramid';
import { colorTokens } from '../data/pyramid';

export const ConstraintsDialog = ({ showConstraints, setShowConstraints, constraints, setConstraints, showNotification }) => {

  const [sentence, setSentence] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const {
    transcript, listening, resetTranscript, browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const handleRecording = () => {
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening();
    }

    else {
      setSentence(transcript);
      SpeechRecognition.stopListening();
    }
  }

  const addConstraint = () => {
    let blocks = getBlockIDFromSentence(sentence.toLowerCase());
    let position = getPositionFromSentence(sentence.toLowerCase());

    if (blocks.length !== 0 && position !== null) {
      setConstraints(prevConstraints => [...prevConstraints, {blocks: blocks, position: position}])
      setSentence("");
    }

    else if (blocks.length === 0 && position !== null) {
      showNotification("Block not mentioned in the sentence", "red");
    }

    else if (blocks.length !== 0 && position === null) {
      showNotification("Position not mentioned in the sentence", "red");
    }

    else {
      showNotification("Position and block not mentioned in the sentence", "red");
    }
  }

  return (
    <Dialog fullWidth open={showConstraints} onClose={() => setShowConstraints(false)}>
      <DialogTitle>Constraints</DialogTitle>
      <DialogContent>
        { constraints.map((constraint, index) => (
          <Typography key={index} variant="subtitle">
            { index+1 }. <strong>Blocks:</strong> { constraint.blocks.map(blockID => (colorTokens[blockID-1].charAt(0).toUpperCase() + colorTokens[blockID-1].slice(1)).replace("-", " ")).join(", ") } <strong>Position:</strong> { constraint.position.charAt(0).toUpperCase() + constraint.position.slice(1) }<br />
          </Typography>
        )) }

        <Grid container>
          <Grid item sm={browserSupportsSpeechRecognition ? 10 : 12}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Constraint"
              type="text"
              fullWidth
              variant="standard"
              value={sentence}
              onChange={event => setSentence(event.target.value)}
            />
            <Typography onClick={() => setShowHelp(!showHelp)} variant="caption" style={{cursor: 'pointer'}}>Guide</Typography>
          </Grid>
          { browserSupportsSpeechRecognition && <Grid item sm={2}>
            <Tooltip title={listening ? "Stop recording" : "Start recording"}>
              <IconButton onClick={handleRecording}>
                { listening ? <MicIcon /> : <MicNoneIcon /> }
              </IconButton>
            </Tooltip>
          </Grid> }

          { showHelp && <Grid item sm={12}>
            <Typography variant="h6">
              Constraints Guide
            </Typography>
            <Typography variant="caption">
              1. You can use color names for blocks. You can mention multiple blocks per constraint.<br />
              2. Mention only a single position per constraint. The positions are bottom, right face, left face, front, and back.<br />
              3. The colors are: red, dark pink, pink, blue, yellow, purple, dark purple, green, dark orange, dark green, orange, light blue.<br />
              4. You can also use block numbers for blocks. The block numbers should be in the number-name format.<br />
            </Typography>
          </Grid>}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={addConstraint}>Add constraint</Button>
        <Button onClick={() => setShowConstraints(false)}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}
