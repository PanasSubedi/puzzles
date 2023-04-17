const ROWS = 5;
const COLUMNS = 11;

onmessage = event => {
  const data = event.data;

  if (data.action === 'start') {
    startWork(JSON.parse(data.blocks), JSON.parse(data.board));
  }
}

const startWork = (blocks, board) => {
  solvePolysphere(blocks, board, 0, 0);
  postMessage({'status': 'DONE'});
}

const findEmptyPoint = (board, x, y) => {

  let newX = x;
  let newY = y;
  let found = false;

  while(!found) {
    if (board[newX][newY] === 0) {
      found = true;
    }

    else {
      newX++;
      if (newX >= COLUMNS) {
        newX = 0;

        newY++;
        if (newY >= ROWS) {
          return;
        }
      }
    }
  }

  return [newX, newY];

}

const solvePolysphere = (availableBlocks, board, x, y) => {
  let xOffset, yOffset, blockPlaced, pointInBoardX, pointInBoardY, newBoard, newAvailableBlocks;
  [x, y] = findEmptyPoint(board, x, y);


  availableBlocks.forEach(block => {
    const layouts = block.layouts;
    layouts.forEach(points => {
      points.forEach(point => {
        xOffset = x - point[0];
        yOffset = y - point[1];

        blockPlaced = true;
        for (point=0; point<points.length; point++) {
          pointInBoardX = xOffset + points[point][0];
          pointInBoardY = yOffset + points[point][1];

          if (pointInBoardX<0 || pointInBoardX>=COLUMNS || pointInBoardY<0 || pointInBoardY>=ROWS) {
            blockPlaced = false;
            break;
          }

          if (board[pointInBoardX][pointInBoardY] !== 0) {
            blockPlaced = false;
            break;
          }
        }

        if (blockPlaced) {

          newBoard = [];
          board.forEach(row => {
            newBoard.push([...row]);
          });

          for (point=0; point<points.length; point++) {
            pointInBoardX = xOffset + points[point][0];
            pointInBoardY = yOffset + points[point][1];

            newBoard[pointInBoardX][pointInBoardY] = block.id;
          }

          newAvailableBlocks = availableBlocks.filter(availableBlock => availableBlock.id !== block.id);

          if (newAvailableBlocks.length === 0) {
            postMessage({'status': 'SOLUTION_FOUND', 'board': newBoard});
          }

          else {
            solvePolysphere(newAvailableBlocks, newBoard, x, y);
          }
        }
      })
    })
  })
}
