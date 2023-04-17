import { useState, useEffect } from 'react';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";

import { Ball } from "../three/shapes";

import './Pyramid.css';

import {
  getLayout, startSolving, stopSolving, checkPositionValidity,
} from '../helpers/pyramid';

import { BLOCKS } from '../data/polysphere';
import { VALID_POINTS } from '../data/pyramid';

import { Notification } from '../components/Notification';
import { NavigationBar } from '../components/NavigationBar';
import { ConstraintsDialog } from '../components/ConstraintsDialog';

import {
  Grid, Box,
  Typography,
  IconButton, Tooltip,
  CircularProgress,
  Pagination,
} from '@mui/material';

import {
  RotateRight as RotateRightIcon,
  Flip as FlipIcon,
  GridOn as GridOnIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, SouthEast as SouthEastIcon, NorthWest as NorthWestIcon,
  Height as HeightIcon,
  Add as AddIcon,
  Check as CheckIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  Input as InputIcon,
  Backspace as BackspaceIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';

const PYRAMID_SIZE = 5;
const SOLUTIONS_PER_PAGE = 6;
const DEFAULT_BLOCK_TRANSFORMATIONS = new Array(BLOCKS.length).fill([]);
const DEFAULT_BLOCK_POSITIONS = new Array(BLOCKS.length).fill([]);

let worker = null;

export const Pyramid = () => {

  const [selectedBlock, setSelectedBlock] = useState(0);
  const [blockTransformations, setBlockTransformations] = useState(DEFAULT_BLOCK_TRANSFORMATIONS);
  const [blockPositions, setBlockPositions] = useState(DEFAULT_BLOCK_POSITIONS);

  const [notification, setNotification] = useState("");
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationColor, setNotificationColor] = useState("");

  const [pyramid, setPyramid] = useState([]);
  const [confirmedPyramid, setConfirmedPyramid] = useState([]);
  const [input, setInput] = useState([]);

  const [invalidInput, setInvalidInput] = useState(-1);

  const [solutions, setSolutions] = useState([]);
  const [solvingInProgress, setSolvingInProgress] = useState(false);
  const [page, setPage] = useState(1);
  const [showSolutions, setShowSolutions] = useState(false);

  const [constraints, setConstraints] = useState([]);
  const [showConstraints, setShowConstraints] = useState(false);

  const [elongate, setElongate] = useState(false);

  useEffect(() => {
    setPyramid(() => {
      let x, y, z, currentRow, currentCol;
      let newPyramid = [];
      for (x=0; x<5; x++) {
        currentRow = [];
        for (y=0; y<5; y++) {
          currentCol = [];
          for (z=0; z<5; z++) {
            currentCol.push(null);
          }
          currentRow.push(currentCol);
        }
        newPyramid.push(currentRow);
      }

      VALID_POINTS.forEach(point => {
        newPyramid[point[0]][point[1]][point[2]] = 0;
      })
      return newPyramid;
    });

    setConfirmedPyramid(() => {
      let x, y, z, currentRow, currentCol;
      let newPyramid = [];
      for (x=0; x<5; x++) {
        currentRow = [];
        for (y=0; y<5; y++) {
          currentCol = [];
          for (z=0; z<5; z++) {
            currentCol.push(null);
          }
          currentRow.push(currentCol);
        }
        newPyramid.push(currentRow);
      }

      VALID_POINTS.forEach(point => {
        newPyramid[point[0]][point[1]][point[2]] = 0;
      })
      return newPyramid;
    });
  }, []);

  useEffect(() => {
    setPyramid(prevPyramid => {
      let newPosition, blockLayout;
      let blocksInPyramid = [];
      blockPositions.forEach((position, index) => {
        if (position.length === 0) {
          blocksInPyramid.push([]);
        }

        else {
          newPosition = [];
          blockLayout = getLayout(BLOCKS[index].layout.points, blockTransformations[index], BLOCKS[index].maxDims);
          blockLayout.forEach(point => {
            newPosition.push([point[0]+position[0], point[1]+position[1], point[2]+position[2]]);
          })
          blocksInPyramid.push(newPosition);
        }
      });

      let x, y, z, row, column;
      let newPyramid = [];
      for (x=0; x<5; x++) {
        row = [];
        for (y=0; y<5; y++) {
          column = [];
          for (z=0; z<5; z++) {
            if (prevPyramid[x][y][z] === null) {
              column.push(null);
            }
            else {
              column.push(0);
            }
          }
          row.push(column);
        }
        newPyramid.push(row);
      }

      let blocksAtTheSamePosition = false;
      blocksInPyramid.forEach((position, index) => {
        if (position.length !== 0) {
          position.forEach(point => {

            if (index === selectedBlock) {
              if (![0, selectedBlock].includes(confirmedPyramid[point[0]][point[1]][point[2]])) {
                blocksAtTheSamePosition = true;
              }
            }

            newPyramid[point[0]][point[1]][point[2]] = index;
          })
        }
      });

      if (blocksAtTheSamePosition) {
        setInvalidInput(selectedBlock);
      }
      else {
        setInvalidInput(-1);
      }

      return newPyramid;
    })
  }, [blockPositions, blockTransformations, confirmedPyramid, selectedBlock]);

  const showNotification = (notification, color) => {
    setNotification(notification);
    setNotificationColor(color.charAt().toLowerCase() === "r" ? "red" : "green");
    setOpenNotification(true);
  }

  const toggleWorkerStatus = () => {

    if (solvingInProgress) {
      showNotification("Solving stopped manually. All the solutions may not have been generated.", "green");
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
    setInput([]);

    let x, y, z;
    let row, column;
    let currentInput = [];
    let blocksPlaced = [];

    for (x=0; x<PYRAMID_SIZE; x++) {
      row = [];
      for (y=0; y<PYRAMID_SIZE; y++) {
        column = [];
        for (z=0; z<PYRAMID_SIZE; z++) {
          if (!blocksPlaced.includes(pyramid[x][y][z])) {
            blocksPlaced.push(pyramid[x][y][z]);
          }
          column.push(pyramid[x][y][z]);
        }
        row.push(column);
      }
      currentInput.push(row);
    }

    setInput(currentInput);
    worker = startSolving(currentInput, BLOCKS.filter(block => !blocksPlaced.includes(block.id)), setSolutions, setSolvingInProgress, showNotification, constraints);
  }

  const stop = () => {
    stopSolving(worker);
  }

  const isPartOfLayout = (block, row, column) => {
    let flag = false;
    block.layout.points.forEach(point => {
      if (point[0] === parseInt(row) && point[1] === parseInt(column)) {
        flag = true;
      }
    });
    return flag;
  }

  const transform = (transformation, axis) => {

    const valid_transformations = ["rotate", "flip"]
    if (valid_transformations.includes(transformation)) {
      setBlockTransformations(prevBlockTransformations => {
        let newBlockTransformations = [];
        prevBlockTransformations.forEach((state, index) => {
          if (index === selectedBlock) {
            newBlockTransformations.push([...state, transformation.charAt(0)+axis]);
          }

          else {
            newBlockTransformations.push([...state]);
          }
        })

        return newBlockTransformations;
      });
    }
  }

  const transformForUI = point => {
    let elongateHeight = elongate ? 2.5 : 1;
    return [point[0]*2+point[1], point[1]*1.5*elongateHeight, point[2]*2+point[1]];
  }

  const movePieceInPyramid = keyCode => {

    // left = 37, up = 38, right = 39, down = 40
    // w = 87, s = 83
    if ([37, 38, 39, 40, 87, 83].includes(keyCode)) {
      setBlockPositions(prevBlockPositions => {
        let newBlockPositions = [];
        let positionsValid, newBlockPosition, blockLayout;
        let pyramidPointCounter, pointInPyramid, pointInLayout;

        prevBlockPositions.forEach((position, index) => {
          if (index === selectedBlock) {

            if (keyCode === 39) newBlockPosition = [position[0]+1, position[1], position[2]];
            if (keyCode === 37) newBlockPosition = [position[0]-1, position[1], position[2]];
            if (keyCode === 40) newBlockPosition = [position[0], position[1], position[2]+1];
            if (keyCode === 38) newBlockPosition = [position[0], position[1], position[2]-1];
            if (keyCode === 87) newBlockPosition = [position[0], position[1]+1, position[2]];
            if (keyCode === 83) newBlockPosition = [position[0], position[1]-1, position[2]];

            blockLayout = getLayout(BLOCKS[index].layout.points, blockTransformations[index], BLOCKS[index].maxDims);
            for (pyramidPointCounter=0; pyramidPointCounter<blockLayout.length; pyramidPointCounter++) {
              pointInLayout = blockLayout[pyramidPointCounter];
              pointInPyramid = [pointInLayout[0]+newBlockPosition[0], pointInLayout[1]+newBlockPosition[1], pointInLayout[2]+newBlockPosition[2]];
              positionsValid = checkPositionValidity(pointInPyramid);

              if (!positionsValid) {
                break;
              }
            }

            if (positionsValid) {
              newBlockPositions.push(newBlockPosition);
            }
            else {
              newBlockPositions.push([...position]);
            }
          }

          else {
            newBlockPositions.push([...position]);
          }
        })

        return newBlockPositions;
      })
    }
  }

  const removeFromPyramid = () => {
    setBlockPositions(prevBlockPositions => {
      let newBlockPositions = [];
      prevBlockPositions.forEach((position, index) => {
        if (index === selectedBlock) {
          newBlockPositions.push([]);
        }

        else {
          newBlockPositions.push([...position]);
        }
      });
      return newBlockPositions;
    });
  }

  const addToPyramid = () => {
    const block = BLOCKS[selectedBlock];

    const blockLayout = getLayout(block.layout.points, blockTransformations[selectedBlock], block.maxDims);
    blockLayout.forEach(point => {

      let x, y, z, row, column;
      let newPyramid = [];
      for (x=0; x<5; x++) {
        row = [];
        for (y=0; y<5; y++) {
          column = [];
          for (z=0; z<5; z++) {
            column.push(pyramid[x][y][z]);
          }
          row.push(column);
        }
        newPyramid.push(row);
      }

      setBlockPositions(prevBlockPositions => {
        let newBlockPositions = [];
        prevBlockPositions.forEach((position, index) => {
          if (index === selectedBlock) {
            newBlockPositions.push([0, 0, 0]);
          }

          else {
            newBlockPositions.push([...position]);
          }
        })

        return newBlockPositions;
      });
    });
  }

  const showSolution = index => {
    setPyramid(solutions[(page-1)*SOLUTIONS_PER_PAGE+index]);
    setShowSolutions(false);
  }

  const getBallColor = blockID => {

    if (blockID === 0) {
      return "empty";
    }

    else if (blockID === selectedBlock) {
      return (invalidInput === selectedBlock) ? "selected-invalid" : "selected-valid";
    }

    else {
      return BLOCKS[blockID].color;
    }
  }

  const confirmPyramid = () => {
    if (invalidInput === -1) {
      setConfirmedPyramid(pyramid);
      setSelectedBlock(0);
    }

    else {
      showNotification("Block placement invalid", "red");
    }
  }

  const goBack = () => {
    setPyramid(confirmedPyramid);
    setBlockPositions(prevBlockPositions => {
      let newBlockPositions = [];
      prevBlockPositions.forEach((position, index) => {
        if (index === selectedBlock) {
          newBlockPositions.push([]);
        }
        else {
          newBlockPositions.push([...position]);
        }
      })
      return newBlockPositions;
    })
    setSelectedBlock(0);
  }

  const selectBlock = blockID => {
    if (solutions.length > 0) {
      showNotification("Please clear the board to provide inputs again.", "red");
    }

    else {
      setSelectedBlock(parseInt(blockID));
    }
  }

  return (
    <>
      <NavigationBar />
      <Grid container className="polysphere-wrapper" justifyContent="space-around">
        {
          selectedBlock === 0
          ?
          <Grid item md={4} sm={12} className="grid-item-wrapper">
            <Typography variant="h1">Blocks</Typography>
              <Grid container>
              {
                BLOCKS.map(block => (
                  <Grid
                    item key={block.id} sm={3}
                  >
                    <Box
                      className={`block-layout-container ${selectedBlock === block.id ? "selected" : ""}`}
                      onClick={() => selectBlock(block.id)}
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
                  </Grid>
                ))
              }
            </Grid>
          </Grid>

          :

          <Grid container item md={4} sm={12} className="grid-item-wrapper" alignItems="center">
            <Grid item sm={2}>
              <IconButton size="small" onClick={goBack}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Grid>
            <Grid item sm={10}>
              <Typography variant="h1">Block</Typography>
            </Grid>
            <Grid item sm={12} style={{height: "500px"}}>
              <Canvas camera={{fov: 10, position: [-3, 2, 2], zoom:0.3}}>
                <OrbitControls />
                <Stage preset="rembrandt" intensity={1} adjustCamera={true} environment="city">
                {
                  getLayout(BLOCKS[selectedBlock].layout.points, blockTransformations[selectedBlock], BLOCKS[selectedBlock].maxDims).map((point, index) => (
                    <Ball key={index} position={[...transformForUI(point)]} color={BLOCKS[selectedBlock].color} />
                  ))
                }
                </Stage>
              </Canvas>
              <Box className="action-buttons">
                <Tooltip title="Rotate X">
                  <IconButton size="small" onClick={() => transform("rotate", "x")}>
                    <RotateRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate Y">
                  <IconButton size="small" onClick={() => transform("rotate", "y")}>
                    <RotateRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Rotate Z">
                  <IconButton size="small" onClick={() => transform("rotate", "z")}>
                    <RotateRightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Flip X">
                  <IconButton size="small" onClick={() => transform("flip", "x")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Flip Y">
                  <IconButton size="small" onClick={() => transform("flip", "y")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Flip Z">
                  <IconButton size="small" onClick={() => transform("flip", "z")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add to pyramid">
                  <IconButton size="small" onClick={addToPyramid}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Confirm position">
                  <IconButton size="small" onClick={confirmPyramid}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from pyramid">
                  <IconButton size="small" onClick={removeFromPyramid}>
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        }

        <Grid item md={4} sm={12} className="grid-item-wrapper">
          <Typography variant="h1">{showSolutions ? <>Solutions</> : <>Pyramid</>}</Typography>
          <Grid container justifyContent="space-between">
            <Grid item sm={2}>
              <Tooltip title={solvingInProgress ? "Stop" : "Start"}>
                <IconButton onClick={toggleWorkerStatus}>
                  {solvingInProgress ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Constraints">
                <IconButton onClick={() => setShowConstraints(true)}>
                  <FilterAltIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item sm={4}>
              { solvingInProgress && <CircularProgress style={{marginRight: '10px'}} size={15} />}
              { solutions.length > 0 && <Typography variant="caption">{solutions.length} solutions.</Typography>}
            </Grid>
          </Grid>
          <Box>
            {
              showSolutions

              ?

              <Grid container>
                {solutions.slice((page-1)*SOLUTIONS_PER_PAGE, page*SOLUTIONS_PER_PAGE).map((solution, index) => (
                  <Grid key={index} item sm={4} className="pyramid-solution" onClick={() => showSolution(index)}>
                    <Canvas
                      camera={{fov: 10, position: [-3, 2, 2], zoom:0.5}}
                    >
                      <Stage preset="rembrandt" intensity={1} adjustCamera={true} environment="city">
                        {
                          [...Array(PYRAMID_SIZE)].map((_, x) => (
                            [...Array(PYRAMID_SIZE)].map((_, y) => (
                              [...Array(PYRAMID_SIZE)].map((_, z) => (
                                solution[x][y][z] !== null &&
                                <Ball
                                  key={x.toString()+y.toString()+z.toString()}
                                  position={[...transformForUI([x, y, z])]}
                                  color={BLOCKS[solution[x][y][z]].color}
                                  transparent={false}
                                />
                              ))
                            ))
                          ))
                        }
                      </Stage>
                    </Canvas>
                  </Grid>
                ))}

                <Grid item sm={12}>
                  <Pagination
                    count={Math.ceil(solutions.length/SOLUTIONS_PER_PAGE)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                  />
                </Grid>
              </Grid>

              :

              <Box style={{height: "400px"}}>
                <Canvas
                  onKeyDown={event => movePieceInPyramid(event.keyCode)}
                  tabIndex="0"
                  camera={{fov: 10, position: [-3, 2, 2], zoom:0.5}}
                >
                  <OrbitControls />
                  <Stage preset="rembrandt" intensity={1} adjustCamera={true} environment="city">
                    {
                      pyramid.length > 0 &&
                      [...Array(PYRAMID_SIZE)].map((_, x) => (
                        [...Array(PYRAMID_SIZE)].map((_, y) => (
                          [...Array(PYRAMID_SIZE)].map((_, z) => (
                            pyramid[x][y][z] !== null &&
                            <Ball
                              key={x.toString()+y.toString()+z.toString()}
                              position={[...transformForUI([x, y, z])]}
                              color={getBallColor(pyramid[x][y][z])}
                              transparent={pyramid[x][y][z] === 0 || selectedBlock === BLOCKS[pyramid[x][y][z]].id}
                              opacity={(pyramid[x][y][z] === 0 && 0.3) || (selectedBlock === BLOCKS[pyramid[x][y][z]].id && 0.6)}
                            />
                          ))
                        ))
                      ))
                    }
                  </Stage>
                </Canvas>
                {
                  selectedBlock !== 0 &&
                  <>
                    <Tooltip title="Move Left">
                      <IconButton size="small" onClick={() => movePieceInPyramid(37)}>
                        <ArrowBackIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move Right">
                      <IconButton size="small" onClick={() => movePieceInPyramid(39)}>
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move Front">
                      <IconButton size="small" onClick={() => movePieceInPyramid(40)}>
                        <SouthEastIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move Back">
                      <IconButton size="small" onClick={() => movePieceInPyramid(38)}>
                        <NorthWestIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move Up">
                      <IconButton size="small" onClick={() => movePieceInPyramid(87)}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Move Down">
                      <IconButton size="small" onClick={() => movePieceInPyramid(83)}>
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                }
                <Tooltip title="Stretch">
                  <IconButton size="small" onClick={() => setElongate(!elongate)}>
                    <HeightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {
                  solutions.length > 0 &&

                  <>
                    <Tooltip title="Show solutions">
                      <IconButton onClick={() => {
                        setElongate(false);
                        setShowSolutions(true);
                      }}>
                        <GridOnIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Show input">
                      <IconButton size="small" onClick={() => setPyramid(input)}>
                        <InputIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                }
                <Tooltip title="Clear">
                  <IconButton size="small" onClick={() => {window.location.reload()}}>
                    <BackspaceIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          </Box>
        </Grid>

      </Grid>
      <ConstraintsDialog
        showConstraints={showConstraints} setShowConstraints={setShowConstraints}
        constraints={constraints} setConstraints={setConstraints}
        showNotification={showNotification}
      />
      <Notification
        open={openNotification}
        setOpen={setOpenNotification}
        notification={notification}
        color={notificationColor}
      />
    </>
  )
}
