import { useState } from 'react';

import './Polysphere.css';

import {
  getLayout, getBlockPositionInBoard, canPositionInBoard,
  startSolving, stopSolving,
} from '../helpers/polysphere';

import { BLOCKS } from '../data/polysphere';

import { Notification } from '../components/Notification';
import { NavigationBar } from '../components/NavigationBar';

import {
  Grid, Box, IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Pagination,
} from '@mui/material';

import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Backspace as BackspaceIcon,
  RotateLeft as RotateLeftIcon,
  Flip as FlipIcon,
  Input as InputIcon,
} from '@mui/icons-material';

const ROWS = 5;
const COLUMNS = 11;
const DEFAULT_BOARD = Array(ROWS).fill([...Array(COLUMNS).fill(0)]);
const DEFAULT_BLOCK_STATE = Array(BLOCKS.length).fill([]);
const DEFAULT_BLOCKS_PLACED = Array(BLOCKS.length).fill(false);
const SOLUTIONS_PER_PAGE = 12;

let worker = null;
let inputBoard = [];

export const Polysphere = () => {

  const [board, setBoard] = useState(DEFAULT_BOARD);
  const [hoverCells, setHoverCells] = useState([]);

  const [blockState, setBlockState] = useState(DEFAULT_BLOCK_STATE);
  const [blocksPlaced, setBlocksPlaced] = useState(DEFAULT_BLOCKS_PLACED);

  const [selectedBlock, setSelectedBlock] = useState(0);

  const [solutions, setSolutions] = useState([]);
  const [solvingInProgress, setSolvingInProgress] = useState(false);
  const [page, setPage] = useState(1);

  const [notification, setNotification] = useState("");
  const [openNotification, setOpenNotification] = useState(false);

  const clearBoard = () => {
    showNotification("Board cleared.");
    stop();
    setBoard(DEFAULT_BOARD);
    setHoverCells([]);
    setBlockState(DEFAULT_BLOCK_STATE);
    setBlocksPlaced(DEFAULT_BLOCKS_PLACED);
    setSelectedBlock(0);
    setSolutions([]);
    setSolvingInProgress(false);
    setPage(1)
  }

  const toggleWorkerStatus = () => {

    if (solvingInProgress) {
      showNotification("Solving stopped manually. All the solutions may not have been generated.");
      stop();
    }

    else {
      start();
    }
    setSolvingInProgress(!solvingInProgress);
  }

  const start = () => {
    setPage(1);
    setSolutions([]);


    let availableBlocks = [];

    blocksPlaced.forEach((blockState, index) => {
      if (!blockState) {
        availableBlocks.push(BLOCKS[index]);
      }
    });

    inputBoard = [];
    for (let row=0; row<board.length; row++) {
      let currentRow = [];
      for (let col=0; col<board[0].length; col++) {
        currentRow.push(board[row][col]);
      }
      inputBoard.push(currentRow);
    }


    // slice 1 to remove the empty block
    worker = startSolving(inputBoard, availableBlocks.slice(1), setSolutions, showNotification, setSolvingInProgress);
  }

  const stop = () => {
    stopSolving(worker);
  }

  const showNotification = notification => {
    setNotification(notification);
    setOpenNotification(true);
  }

  const addBlockAtPosition = point => {
    setHoverCells([]);
    if (selectedBlock !== 0 && board[point[0]][point[1]] === 0 && !blocksPlaced[selectedBlock]) {
      const filteredBlocks = BLOCKS.filter(block => block.id === selectedBlock);

      if (filteredBlocks.length === 1) {
        const block = filteredBlocks[0];
        const blockPositionInBoard = getBlockPositionInBoard(block, point, blockState[block.id]);

        if (canPositionInBoard(blockPositionInBoard, board)) {
          setBoard(prevBoard => {
            let newBoard = [];
            prevBoard.forEach(row => {
              newBoard.push([...row]);
            });

            blockPositionInBoard.forEach(point => {
              newBoard[point[0]][point[1]] = block.id;
            });

            return newBoard;
          });

          setBlocksPlaced(prevBlocksPlaced => {
            let newBlocksPlaced = [...prevBlocksPlaced];
            newBlocksPlaced[block.id] = true;
            return newBlocksPlaced;
          });

          setSelectedBlock(0);
        }
      }
    }
  }

  const flip = blockID => {
    setBlockState(prevBlockState => {

      let newBlockState = [];
      prevBlockState.forEach(blockState => {
        newBlockState.push([...blockState]);
      })

      newBlockState[blockID].push("flip");

      return newBlockState;

    })
  }

  const rotate = blockID => {
    setBlockState(prevBlockState => {

      let newBlockState = [];
      prevBlockState.forEach(blockState => {
        newBlockState.push([...blockState]);
      })

      newBlockState[blockID].push("rotation");

      return newBlockState;

    })

  }

  const isHoverCell = point => {
    let hoverCell = false;
    hoverCells.forEach(hoverPoint => {
      if (point[0] === hoverPoint[0] && point[1] === hoverPoint[1]) {
        hoverCell = true;
      }
    });

    return hoverCell;
  }

  const addHoverCells = point => {
    setHoverCells([]);
    if (board[point[0]][point[1]] === 0) {
      const filteredBlocks = BLOCKS.filter(block => block.id === selectedBlock);

      if (filteredBlocks.length === 1) {
        const block = filteredBlocks[0];
        const blockPositionInBoard = getBlockPositionInBoard(block, point, blockState[block.id]);

        if (canPositionInBoard(blockPositionInBoard, board)) {
          setHoverCells([...blockPositionInBoard]);
        }
      }
    }
  }

  const getCellColor = blockID => {
    const filteredBlocks = BLOCKS.filter(block => block.id === parseInt(blockID));
    if (filteredBlocks.length === 1) {
      return filteredBlocks[0].color;
    }

    return "";
  }

  const isPartOfLayout = (block, row, column) => {
    let layout = getLayout(block.layout, blockState[block.id], block.maxDims);

    let flag = false;
    layout.points.forEach(point => {
      if (point[0] === parseInt(row) && point[1] === parseInt(column)) {
        flag = true;
      }
    });
    return flag;
  }

  const displaySolution = solutionIndex => {
    setBoard(solutions[solutionIndex]);
  }

  return (
    <>
      <NavigationBar />
      <Grid container className="polysphere-wrapper" justifyContent="space-around">
        <Grid item md={4} sm={12} className="grid-item-wrapper">
          <Typography variant="h1">Blocks</Typography>

          <Grid container>
            {
              BLOCKS.map(block => (
                <Grid
                  item key={block.id} sm={3}
                >
                  <Box
                    className={`block-layout-container ${blocksPlaced[block.id] ? "disabled" : ""} ${!blocksPlaced[block.id] && selectedBlock === block.id ? "selected" : ""}`}
                    onClick={() => { !blocksPlaced[block.id] && setSelectedBlock(parseInt(block.id)) }}
                  >
                    {
                      Object.keys([...Array(block.maxDims)]).map(row =>
                        <Box key={row} className="layout-row">
                          {
                            Object.keys([...Array(block.maxDims)]).map(column => (
                              <Box key={row+"-"+column} className="cell-wrapper">
                                <Box className={`cell block-cell board-cell-${isPartOfLayout(block, row, column) ? block.color + " block-cell-color" : ""}`}></Box>
                              </Box>
                            ))
                          }
                        </Box>
                      )
                    }
                  </Box>
                  <Box className="button-wrapper">
                    <Tooltip title="Rotate Left">
                      <IconButton disabled={blocksPlaced[block.id]} onClick={() => rotate(block.id)} size="small">
                        <RotateLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Flip">
                      <IconButton disabled={blocksPlaced[block.id]} onClick={() => flip(block.id)} size="small">
                        <FlipIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              ))
            }
          </Grid>
        </Grid>

        <Grid item md={6} sm={12} className="grid-item-wrapper">
          <Typography variant="h1">Board</Typography>

          {
            board.map((row, rowIndex) => (
              <Box className="layout-row" key={rowIndex}>
                {
                  row.map((column, columnIndex) => (
                    <Box
                      onClick={() => addBlockAtPosition([rowIndex, columnIndex])}
                      onMouseEnter={() => addHoverCells([rowIndex, columnIndex])}
                      onMouseOut={() => setHoverCells([])}
                      key={columnIndex}
                      className="cell-wrapper"
                    >
                      <Box className={`cell board-cell board-cell-${getCellColor(board[rowIndex][columnIndex])} ${isHoverCell([rowIndex, columnIndex]) ? "board-cell-hover" : ""} `} />
                    </Box>
                  ))
                }
              </Box>
            ))
          }

          <Grid container justifyContent="space-between">
            <Grid item sm={4}>
              <Tooltip title={solvingInProgress ? "Stop" : "Start"}>
                <IconButton onClick={toggleWorkerStatus}>
                  {solvingInProgress ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
            </Grid>
            { inputBoard.length > 0 && <Grid item sm={4}>
              <Tooltip title="Show input">
                <IconButton onClick={() => setBoard(inputBoard)}>
                  <InputIcon />
                </IconButton>
              </Tooltip>
            </Grid> }
            <Grid item sm={4}>
              <Tooltip title="Clear Board">
                <IconButton onClick={clearBoard}>
                  <BackspaceIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          {
            solutions.length > 0 &&
            <Grid container>
              <Grid item md={12}>
                <Typography variant="h1">Solutions</Typography>
                <Typography variant="caption">{solvingInProgress && <CircularProgress style={{marginRight: '10px'}} size={15} />}Found {solutions.length} solutions.</Typography>
              </Grid>
              {
                solutions.slice((page-1)*SOLUTIONS_PER_PAGE, page*SOLUTIONS_PER_PAGE).map((solution, solutionIndex) => (
                  <Grid
                    key={solutionIndex}
                    item md={3} sm={6} xs={12}
                    className="solution-container block-layout-container"
                    onClick={() => displaySolution(solutionIndex)}
                  >
                    {
                      solution.map((row, rowIndex) => (
                        <Box className="layout-row" key={rowIndex}>
                          {
                            row.map((column, columnIndex) => (
                              <Box
                                key={columnIndex}
                                className="cell-wrapper"
                              >
                                <Box className={`cell cell-solution board-cell-${getCellColor(solution[rowIndex][columnIndex])}`} />
                              </Box>
                            ))
                          }
                        </Box>
                      ))
                    }
                  </Grid>
                ))
              }

              {

                solutions.length > SOLUTIONS_PER_PAGE &&

                <Grid item md={12}>
                  <Pagination count={Math.ceil(solutions.length/SOLUTIONS_PER_PAGE)} page={page} onChange={(_, value) => setPage(value)} />
                </Grid>

              }
            </Grid>
          }
        </Grid>
      </Grid>
      <Notification open={openNotification} setOpen={setOpenNotification} notification={notification} />
    </>
  )
}
