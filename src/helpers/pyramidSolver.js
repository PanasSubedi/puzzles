const PYRAMID_SIZE = 5;

onmessage = event => {
  const data = event.data;
  if (data.action === "start") {
    startWork(JSON.parse(data.blocks), JSON.parse(data.pyramid), JSON.parse(data.constraints));
  }
}

const startWork = (blocks, pyramid, constraints) => {
  solvePyramid(blocks, pyramid, 0, 0, 0, constraints);
  postMessage({"status": "DONE"});
}

const findEmptyPoint = (pyramid, x, y, z) => {

  let newX = x;
  let newY = y;
  let newZ = z;
  let found = false;

  while(!found) {
    if (pyramid[newX][newY][newZ] === 0) {
      found = true;
    }

    else {
      newX++;
      if (newX >= PYRAMID_SIZE) {
        newX = 0;

        newY++;
        if (newY >= PYRAMID_SIZE) {
          newY = 0;

          newZ++;
          if (newZ >= PYRAMID_SIZE) {
            return;
          }
        }
      }
    }
  }
  return [newX, newY, newZ];
}

const solvePyramid = (availableBlocks, pyramid, x, y, z, constraints) => {
  let xOffset, yOffset, zOffset, xInPyramid, yInPyramid, zInPyramid;
  let blockPlaced, currentRow, constraintCounter, constraint;
  let newPyramid, newAvailableBlocks;

  [x, y, z] = findEmptyPoint(pyramid, x, y, z);

  availableBlocks.forEach(block => {
    const layouts = block.layouts;
    layouts.forEach(points => {
      points.forEach(point => {
        xOffset = x-point[0];
        yOffset = y-point[1];
        zOffset = z-point[2];

        blockPlaced = true;

        for (point=0; point<points.length; point++) {
          xInPyramid = xOffset + points[point][0];
          yInPyramid = yOffset + points[point][1];
          zInPyramid = zOffset + points[point][2];

          if (!isValidPlacement(pyramid, xInPyramid, yInPyramid, zInPyramid)) {
            blockPlaced = false;
          }

          for (constraintCounter=0; constraintCounter<constraints.length; constraintCounter++) {
            constraint = constraints[constraintCounter];
            if (constraint.blocks.includes(block.id)) {
              if (!isConstraintSatisfied(xInPyramid, yInPyramid, zInPyramid, constraint)) {
                blockPlaced = false;
              }
            }
          }

          if (!blockPlaced) {
            break;
          }
        }

        if (blockPlaced) {
          newPyramid = [];
          pyramid.forEach(row => {
            currentRow = [];
            row.forEach(column => {
              currentRow.push([...column]);
            })
            newPyramid.push(currentRow);
          });

          for (point=0; point<points.length; point++) {
            xInPyramid = xOffset + points[point][0];
            yInPyramid = yOffset + points[point][1];
            zInPyramid = zOffset + points[point][2];

            newPyramid[xInPyramid][yInPyramid][zInPyramid] = block.id;
          }

          newAvailableBlocks = availableBlocks.filter(availableBlock => availableBlock.id !== block.id);

          if (newAvailableBlocks.length === 0) {
            postMessage({"status": "SOLUTION_FOUND", "pyramid": newPyramid});
          }

          else {
            solvePyramid(newAvailableBlocks, newPyramid, x, y, z, constraints);
          }
        }
      })
    })
  })

}

const isConstraintSatisfied = (x, y, z, constraint) => {
  if (constraint.position === "bottom") {
    return y === 0;
  }

  else if (constraint.position === "left") {
    return x === 0;
  }

  else if (constraint.position === "right") {
    return x === 4;
  }

  else if (constraint.position === "front") {
    return z === 0;
  }

  else if (constraint.position === "back") {
    return z === 4;
  }
}

const isValidPlacement = (pyramid, x, y, z) => {

  if (x<0 || x>=PYRAMID_SIZE || y<0 || y>=PYRAMID_SIZE || z<0 || z>=PYRAMID_SIZE) {
    return false;
  }

  if (pyramid[x][y][z] !== 0) {
    return false;
  }

  return true;
}
