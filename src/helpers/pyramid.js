import { VALID_POINTS } from '../data/pyramid';

import { positionTokens, numberTokens, colorTokens, colorGroupTokens, colorGroupTokensIDs } from '../data/pyramid';

const PYRAMID_SIZE = 5;

export const getPositionFromSentence = sentence => {
	let tokens = sentence.replace(/[^a-zA-Z ]/g, "").split(" ");

	let position = null;
	let positionFound = false;
	positionTokens.forEach(positionToken => {
		if (tokens.includes(positionToken) && !positionFound) {
			position = positionToken;
		}
	});
	return position;
}

export const getBlockIDFromSentence = sentence => {
  let blockIDs = [];

  let tokens = sentence.replace(/[^a-zA-Z ]/g, "").split(" ");

	tokens.forEach((token, index) => {
		if (numberTokens.includes(token)) {
			blockIDs.push(numberTokens.indexOf(token)+1);
		}

		if (colorTokens.includes(token)) {
			if (index > 0 && tokens[index-1] === "light") {
				if (colorTokens.includes("light-"+token)) {
					blockIDs.push(colorTokens.indexOf("light-"+token)+1);
				}
			}

			else if (index > 0 && tokens[index-1] === "dark") {
				if (colorTokens.includes("dark-"+token)) {
					blockIDs.push(colorTokens.indexOf("dark-"+token)+1);
				}
			}

			else {
				blockIDs.push(colorTokens.indexOf(token)+1);
			}
		}

		if (colorGroupTokens.includes(token)) {
			blockIDs.push(...colorGroupTokensIDs[token]);
		}
	})

  return blockIDs;
}

export const checkPositionValidity = point => {

	if (point[0] < 0 || point[0] > 4 || point[1] < 0 || point[1] > 4 || point[2] < 0 || point[2] > 4) {
		return false;
	}

	for (let i=0; i<VALID_POINTS.length; i++) {
		if (point[0] === VALID_POINTS[i][0] && point[1] === VALID_POINTS[i][1] && point[2] === VALID_POINTS[i][2]) {
			return true;
		}
	}
	return false;
}

export const stopSolving = worker => {
	if (worker) worker.terminate();
	worker = null;
}

export const startSolving = (pyramid, availableBlocks, setSolutions, setSolvingInProgress, showNotification, constraints) => {
  let blocks = initializeBlocks(availableBlocks);

  let worker, solution;
  let oneSolutionFound = false;
  if (typeof(Worker) !== "undefined") {
    worker = new window.Worker(new URL("./pyramidSolver.js", import.meta.url), {type: "module"});
    worker.onmessage = event => {
      const data = event.data;

			if (data.status === "SOLUTION_FOUND") {
        oneSolutionFound = true;
        solution = data.pyramid;

        setSolutions(prevSolutions => {
          if (prevSolutions.length === 0) {
            return [...prevSolutions, solution];
          }

          else if (isSolutionDuplicate(prevSolutions[prevSolutions.length-1], solution)) {
            return [...prevSolutions];
          }

          else {
            return [...prevSolutions, solution];
          }
        })
      }

      else if (data.status === "DONE") {
        stopSolving(worker);
        setSolvingInProgress(false);

        if (oneSolutionFound) {
          showNotification("All the solutions generated.", "green");
        }

        else {
          showNotification("No solutions found for your input configuration.", "red");
        }
      }
    }

    worker.postMessage({
      "action": "start",
      "blocks": JSON.stringify(blocks),
      "pyramid": JSON.stringify(pyramid),
			"constraints": JSON.stringify(constraints),
    });

    return worker;
  }
}

const isSolutionDuplicate = (solution1, solution2) => {
  let x, y, z;
  for (x=0; x<PYRAMID_SIZE; x++) {
    for (y=0; y<PYRAMID_SIZE; y++) {
      for (z=0; z<PYRAMID_SIZE; z++) {
        if (solution1[x][y][z] !== solution2[x][y][z]) {
          return false;
        }
      }
    }
  }

  return true;
}

const initializeBlocks = availableBlocks => {
  let blocks = new Array(availableBlocks.length);
  let blockCounter, currentLayout;

  const transformations = [
    "rx", "rx", "rx", "rx", "fx",
    "rx", "rx", "rx", "rx", "fy",
    "rx", "rx", "rx", "rx", "fz",
    "ry", "ry", "ry", "ry", "fx",
    "ry", "ry", "ry", "ry", "fy",
    "ry", "ry", "ry", "ry", "fz",
    "rz", "rz", "rz", "rz", "fx",
    "rz", "rz", "rz", "rz", "fy",
    "rz", "rz", "rz", "rz", "fz",
  ];

  for (blockCounter=0; blockCounter<availableBlocks.length; blockCounter++) {
    blocks[blockCounter] = {}
    blocks[blockCounter].id = availableBlocks[blockCounter].id;
    blocks[blockCounter].layouts = [];

    currentLayout = availableBlocks[blockCounter].layout.points.map(point => [point[1], 0, point[0]]);

		let transformation, transformationCounter;
		for (transformationCounter=0; transformationCounter<transformations.length; transformationCounter++) {
			transformation = transformations[transformationCounter];

			if (["rx", "ry", "rz"].includes(transformation)) {
        currentLayout = rotatePoints(currentLayout, transformation, availableBlocks[blockCounter].maxDims);
      }

      else if (["fx", "fy", "fz"].includes(transformation)) {
        currentLayout = flipPoints(currentLayout, transformation, availableBlocks[blockCounter].maxDims);
      }

      if (!isDuplicate(blocks[blockCounter].layouts, currentLayout)) {
        blocks[blockCounter].layouts.push(currentLayout);
      }
		}
  }

  return blocks;
}

const compareLayouts = (layout1, layout2) => {
  if (layout1.length !== layout2.length) return false;

  let pointCounter;
  for (pointCounter=0; pointCounter<layout1.length; pointCounter++) {
    if(layout1[pointCounter][0] !== layout2[pointCounter][0]) return false;
    if(layout1[pointCounter][1] !== layout2[pointCounter][1]) return false;
    if(layout1[pointCounter][2] !== layout2[pointCounter][2]) return false;
  }
  return true;
}

const isDuplicate = (layouts, layoutToCheck) => {
  let layoutCounter;
  for (layoutCounter=0; layoutCounter<layouts.length; layoutCounter++) {
    if (compareLayouts(layouts[layoutCounter], layoutToCheck)) {
      return true;
    }
  }

  return false;
}

export const getLayout = (points, blockState, size) => {
  let newPoints = [];
  points.forEach(point => {
    newPoints.push([point[1], 0, point[0]]);
  })
  newPoints.sort(pointSort);

  blockState.forEach(state => {
    if (["rx", "ry", "rz"].includes(state)) {
      newPoints = rotatePoints(newPoints, state, size);
    }

    else if (["fx", "fy", "fz"].includes(state)) {
      newPoints = flipPoints(newPoints, state, size);
    }
  })
  return newPoints;
}

const flipPoints = (points, axis, size) => {
  let newPoints = [];
  points.forEach(point => {
    newPoints.push(flipPoint(point, axis, size));
  });
  newPoints = normalize(newPoints)
  return newPoints.sort(pointSort);
}

const rotatePoints = (points, axis, size) => {
  let newPoints = [];
  points.forEach(point => {
    newPoints.push(rotatePoint(point, axis, size));
  });
  newPoints = normalize(newPoints)
  return newPoints.sort(pointSort);
}

const pointSort = (point1, point2) => {
	if (point1[0] < point2[0]) return -1;
	if (point1[0] > point2[0]) return 1;
	if (point1[1] < point2[1]) return -1;
	if (point1[1] > point2[1]) return 1;
  if (point1[2] < point2[2]) return -1;
  if (point1[2] > point2[2]) return 1;
	return 0;
}

const normalize = points => {
	let newPoints = [];
	points.forEach(point => { newPoints.push([point[0], point[1], point[2]]) });

	let minX = newPoints[0][0];
	let minY = newPoints[0][1];
  let minZ = newPoints[0][2];

	let counter;

	for (counter=0; counter<newPoints.length; counter++) {
		minX = Math.min(minX, newPoints[counter][0]);
		minY = Math.min(minY, newPoints[counter][1]);
    minZ = Math.min(minZ, newPoints[counter][2])
	}

	for (counter=0; counter<newPoints.length; counter++) {
		newPoints[counter][0] -= minX;
		newPoints[counter][1] -= minY;
    newPoints[counter][2] -= minZ;
	}

	return newPoints;
}

const flipPoint = (point, axis, size) => {

  let center = (size-1)/2;
  let newX, newY, newZ;

  // translate to origin
  newX = point[0] - center;
  newY = point[1] - center;
  newZ = point[2] - center;

  // rotate about origin
  if (axis === "fx") {
    newX = -newX;
  }

  if (axis === "fy") {
    newY = -newY;
  }

  if (axis === "fz") {
    newZ = -newZ;
  }

  // translate to actual center
  newX = newX+center;
  newY = newY+center;
  newZ = newZ+center;

  return [newX, newY, newZ];

}

const rotatePoint = (point, axis, size) => {

  let center = (size-1)/2;
  let newX, newY, newZ, temp;

  // translate to origin
  newX = point[0] - center;
  newY = point[1] - center;
  newZ = point[2] - center;

  // rotate about origin
  if (axis === "rx") {
    temp = newY;
    newY = -newZ;
    newZ = temp;
  }

  if (axis === "ry") {
    temp = newX;
    newX = newZ;
    newZ = -temp;
  }

  if (axis === "rz") {
    temp = newX;
    newX = -newY;
    newY = temp;
  }

  // translate to actual center
  newX = newX+center;
  newY = newY+center;
  newZ = newZ+center;

  return [newX, newY, newZ];

}
