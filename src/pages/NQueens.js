import { useState, useEffect } from 'react';

import './NQueens.css';

import { NavigationBar } from '../components/NavigationBar';

import {
  Box,
  TextField, IconButton,
  Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert,
  Typography,
} from '@mui/material';

import {
  Cached as CachedIcon,
  Send as SendIcon,
} from '@mui/icons-material';

import { findSolutions } from '../helpers/nQueenHelpers';

const MAX_SIZE_VALUE = 50;
const MIN_SIZE_VALUE = 1;

export const NQueens = () => {

  const [sizeInput, setSizeInput] = useState("");
  const [size, setSize] = useState(0);

  const [nQueenResults, setNQueenResults] = useState([]);
  const [nQueenResult, setNQueenResult] = useState(0);
  const [nQueenInputs, setNQueenInputs] = useState([]);

  const [invalidQueens, setInvalidQueens] = useState([]);

  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showInvalidAlert, setShowInvalidAlert] = useState(false);

  useEffect(() => {
    setInvalidQueens([]);
    for (let i=0; i<nQueenInputs.length; i++) {
      for (let j=i+1; j<nQueenInputs.length; j++) {

        let invalidPair = false;
        if (nQueenInputs[i][0] === nQueenInputs[j][0]) {
          invalidPair = true;
        }

        if (nQueenInputs[i][1] === nQueenInputs[j][1]) {
          invalidPair = true;
        }

        if (nQueenInputs[i][1]+nQueenInputs[i][0] === nQueenInputs[j][1]+nQueenInputs[j][0]) {
          invalidPair = true;
        }

        if (nQueenInputs[i][1]-nQueenInputs[i][0] === nQueenInputs[j][1]-nQueenInputs[j][0]) {
          invalidPair = true;
        }

        if (invalidPair) {
          setInvalidQueens(prevInvalidQueens => [...prevInvalidQueens, nQueenInputs[i], nQueenInputs[j]]);
        }


      }
    }
  }, [nQueenInputs]);

  const getSolutions = async() => {

    if (invalidQueens.length === 0) {
      setShowInputDialog(false);
      setSize(sizeInput);
      setNQueenResults(findSolutions(parseInt(sizeInput), nQueenInputs));
      setNQueenResult(0);
    }

    else {
      setShowInvalidAlert(true);
    }
  }

  const handleSizeUpdate = event => {
    let newSize = event.target.value;

    if (newSize === "") {
      setSizeInput(newSize);
    }

    else {
      newSize = parseInt(newSize);

      if (!isNaN(newSize)) {
        if (newSize >= MIN_SIZE_VALUE && newSize <= MAX_SIZE_VALUE) {
          setSizeInput(newSize);
        }
      }
    }
  }

  const getNextNQueenResult = () => {
    let newValueGenerated = false;
    let newValue;
    while (!newValueGenerated) {
      newValue = Math.floor(Math.random() * nQueenResults.length);
      if (newValue !== nQueenResult) {
        newValueGenerated = true;
      }
    }
    setNQueenResult(newValue);
  }

  const isQueenCell = (row, column) => {
    try {
      return nQueenResults[nQueenResult][row][1] === parseInt(column);
    }

    catch (error) {
      return false;
    }
  }

  const getCellColor = (row, column) => {
    if (row % 2 === 0) {
      return column % 2 === 0 ? "white" : "black";
    }

    else {
      if (column % 2 === 0) {
        return "black";
      }

      else {
        return "white";
      }
    }
  }

  const isInputQueenCell = (row, column) => {
    const cell = nQueenInputs.filter(cell => cell[0]===parseInt(row) && cell[1]===parseInt(column));
    return cell.length === 1;
  }


  const toggleInput = (row, column) => {
    setNQueenInputs(prevNQueenInputs => {

      let cellPresent = false;
      prevNQueenInputs.forEach(cell => {
        if (cell[0] === parseInt(row) && cell[1] === parseInt(column)) {
          cellPresent = true;
        }
      })

      if (cellPresent) {
        return prevNQueenInputs.filter(cell => !(cell[0]===parseInt(row) && cell[1] === parseInt(column)))
      }

      else {
        return [...prevNQueenInputs, [parseInt(row), parseInt(column)]];
      }
    });
  }

  const isInvalidCell = (row, column) => {
    return invalidQueens.filter(cell => cell[0] === parseInt(row) && cell[1] === parseInt(column)).length > 0
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setShowInvalidAlert(false);
  }

  return (
    <>
      <NavigationBar />
      <Box
        sx={{
          mx: 10,
          my: 2,
        }}
        style={{textAlign: 'center'}}
      >
        <Box className="inputs">
          <TextField
            sx={{
              my: 2,
            }}
            label="Size"
            variant="standard"
            type="number"
            value={sizeInput}
            onChange={handleSizeUpdate}
          />
          {
            <Box className="input-buttons">
              <Tooltip title="Update size" placement="right">
                <IconButton onClick={() => setShowInputDialog(true)}><SendIcon /></IconButton>
              </Tooltip>

              {
                nQueenResults.length > 1 &&
                <Tooltip title="Next random solution" placement="right">
                  <IconButton onClick={getNextNQueenResult}><CachedIcon /></IconButton>
                </Tooltip>
              }
            </Box>
          }
        </Box>
        <Box className="chess-container">

          <Box>
            {
              size > 0 &&

              <>
                {
                  Object.keys([...Array(size)]).map(row =>
                    <Box className="chess-board-row" key={row}>
                      {
                        Object.keys([...Array(size)]).map(column =>
                          <Box className={`chess-board-cell ${getCellColor(row, column)} ${isQueenCell(row, column) && "queen-"+getCellColor(row, column)}`} key={column}></Box>
                        )
                      }
                    </Box>
                  )
                }
                <Typography variant="caption">{nQueenResults.length} total solution{nQueenResults.length > 1 && "s"}</Typography>
              </>
            }
          </Box>

        </Box>
      </Box>

      <Dialog open={showInputDialog} onClose={() => setShowInputDialog(false)}>
        <DialogTitle>Choose Inputs</DialogTitle>
        <DialogContent>
          {
            Object.keys([...Array(sizeInput)]).map(row =>
              <Box className="chess-board-row" key={row}>
                {
                  Object.keys([...Array(sizeInput)]).map(column =>
                    <Box
                      className={`chess-board-cell ${getCellColor(row, column)} ${isInputQueenCell(row, column) && "queen-"+getCellColor(row, column)} ${isInvalidCell(row, column) && "invalid-cell"}`}
                      key={column}
                      onClick={() => toggleInput(row, column)}
                    >
                    </Box>
                  )
                }
              </Box>
            )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInputDialog(false)}>Cancel</Button>
          <Button onClick={getSolutions}>Get Solutions</Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'center'}} open={showInvalidAlert} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          Please remove all invalid pieces first
        </Alert>
      </Snackbar>
    </>
  )
}
