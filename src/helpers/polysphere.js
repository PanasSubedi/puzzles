const ROWS = 5;
const COLUMNS = 11;

export const canPositionInBoard = (position, board) => {
	let canPosition = true;
	position.forEach(point => {
		if (point[0] < 0 || point[0] >= ROWS || point[1] < 0 || point[1] >= COLUMNS) {
			canPosition = false;
		}

		try {
			if (board[point[0]][point[1]] !== 0) {
				canPosition = false;
			}
		} catch(error) {
			return false;
		}
	})

	return canPosition;
}

export const getBlockPositionInBoard = (block, boardPoint, blockState) => {
	let layout = getLayout(block.layout, blockState, block.maxDims);

	let finalLayout = [];
	const layoutHover = layout.hover;
	layout.points.forEach(layoutPoint => {
		finalLayout.push([layoutPoint[0]+boardPoint[0]-layoutHover[0], layoutPoint[1]+boardPoint[1]-layoutHover[1]]);
	})

	return finalLayout;
}

const flipPoint = (point, size) => {
	let flipAxis = (parseInt(size)-1);

	let newX = point[0];
	let newY = flipAxis-point[1];

	return [newX, newY];
}

const flipLayout = (layout, size) => {

	let newLayoutPoints = [];
	layout.points.forEach(point => {
		newLayoutPoints.push(flipPoint(point, size));
	})

	let newHoverPoint = flipPoint(layout.hover, size)

	return {
		points: newLayoutPoints,
		hover: newHoverPoint,
	};
}

const rotateLayout = (layout, size) => {
	let newLayoutPoints = [];
	layout.points.forEach(point => {
		newLayoutPoints.push(rotatePoint(point, size));
	});

	let newHoverPoint = rotatePoint(layout.hover, size);

	return {
		points: newLayoutPoints,
		hover: newHoverPoint,
	};
}

const rotatePoint = (point, size) => {

	let center = (parseInt(size)-1)/2;

	let newX, newY, temp;

	// translate to origin
	newX = point[0]-center;
	newY = point[1]-center;

	// rotate about origin
	temp = newX;
	newX = -newY;
	newY = temp;

	// translate to actual center
	newX = newX+center;
	newY = newY+center;

	return [newX, newY];
}

export const getLayout = (layout, blockState, size) => {
	let newLayoutPoints = [];
	layout.points.forEach(point => { newLayoutPoints.push(point) });

	let newLayout = {
		points: newLayoutPoints,
		hover: layout.hover,
	}

	blockState.forEach(transformation => {
		if (transformation === "rotation") {
			newLayout = rotateLayout(newLayout, size);
		}

		else if (transformation === "flip") {
			newLayout = flipLayout(newLayout, size);
		}
	});
	return newLayout;
}





const initializeBoard = inputBoard => {
	let board = [];
	let rowCounter, colCounter, column;

	for (colCounter=0; colCounter<COLUMNS; colCounter++) {
		column = [];
		for (rowCounter=0; rowCounter<ROWS; rowCounter++) {
			column.push(inputBoard[rowCounter][colCounter]);
		}
		board.push(column);
	}

	return board;
}

const normalize = points => {
	let newPoints = [];
	points.forEach(point => { newPoints.push([point[0], point[1]]) });

	let minX = newPoints[0][0];
	let minY = newPoints[0][1];

	let counter;

	for (counter=0; counter<newPoints.length; counter++) {
		minX = Math.min(minX, newPoints[counter][0]);
		minY = Math.min(minY, newPoints[counter][1]);
	}

	for (counter=0; counter<newPoints.length; counter++) {
		newPoints[counter][0] -= minX;
		newPoints[counter][1] -= minY;
	}

	return newPoints;
}

const pointSort = (point1, point2) => {
	if (point1[0] < point2[0]) return -1;
	if (point1[0] > point2[0]) return 1;
	if (point1[1] < point2[1]) return -1;
	if (point1[1] > point2[1]) return 1;
	return 0;
}

const flipPoints = (axis, points) => {
	let newPoints = [];
	points.forEach(point => {
		if (axis === 'x') {
			newPoints.push([6-point[0], point[1]])
		}

		if (axis === 'y') {
			newPoints.push([point[0], 6-point[1]])
		}
	})

	newPoints.sort(pointSort)
	return normalize(newPoints);
}

const rotatePoints = points => {
	let newPoints = [];
	points.forEach(point => {
		newPoints.push([6-point[1], point[0]])
	});

	newPoints.sort(pointSort);
	return normalize(newPoints);
}

const compareLayouts = (layout1, layout2) => {
	if(layout1.length !== layout2.length) return false;

	let pointCounter;

	for(pointCounter=0; pointCounter<layout1.length; pointCounter++){
			if(layout1[pointCounter][0] !== layout2[pointCounter][0]) return false;
			if(layout1[pointCounter][1] !== layout2[pointCounter][1]) return false;
	}

	return true;
}

const isDuplicate = (layouts, layoutToCheck) => {

	let layoutCounter;
	for(layoutCounter=0; layoutCounter<layouts.length; layoutCounter++){
			if(compareLayouts(layouts[layoutCounter], layoutToCheck)) return true;
	}
	return false;
}

const initializeBlocks = availableBlocks => {
	let blocks = new Array(availableBlocks.length);
	let blockCounter, counter, currentLayout, rotationCounter;

	for (blockCounter=0; blockCounter<availableBlocks.length; blockCounter++){
		blocks[blockCounter] = {}
		blocks[blockCounter].id = availableBlocks[blockCounter].id;
		blocks[blockCounter].layouts = [];

		for (counter=0; counter<3; counter++) {
			currentLayout = availableBlocks[blockCounter].layout.points.map(point => { return [point[0]+1, point[1]+1] });
			if (counter === 0) {
				currentLayout = normalize(currentLayout);
				currentLayout.sort(pointSort);
			}

			else if (counter === 1) {
				currentLayout = flipPoints('x', currentLayout);
			}

			else {
				currentLayout = flipPoints('y', currentLayout);
			}

			for (rotationCounter=0; rotationCounter<4; rotationCounter++) {

				let show = false;
				if (rotationCounter === 2 && counter === 0 && blockCounter === 0) {
					show = true;
				}
				if (!isDuplicate(blocks[blockCounter].layouts, currentLayout, show)) {
					blocks[blockCounter].layouts.push(currentLayout);
				}
				currentLayout = rotatePoints(currentLayout);
			}
		}
	}
	return blocks;
}

const isSolutionDuplicate = (board1, board2) => {
	let row, col;

	for (row=0; row<board1.length; row++) {
		for (col=0; col<board1[0].length; col++) {
			if (board1[row][col] !== board2[row][col]) {
				return false;
			}
		}
	}

	return true;
}

export const startSolving = (inputBoard, availableBlocks, setSolutions, showNotification, setSolvingInProgress) => {
	const board = initializeBoard(inputBoard);
	const blocks = initializeBlocks(availableBlocks);
	let solution, rowCounter, colCounter, currentRow;
	let worker;
	let oneSolutionFound = false;

	if (typeof(Worker) !== "undefined") {
		worker = new window.Worker(new URL('./polysphereSolver.js', import.meta.url), {type: "module"});
		worker.onmessage = event => {
			const data = event.data;

			if (data.status === 'SOLUTION_FOUND') {
				oneSolutionFound = true;
				solution = [];
				for (rowCounter=0; rowCounter<ROWS; rowCounter++) {
					currentRow = [];
					for (colCounter=0; colCounter<COLUMNS; colCounter++) {
						currentRow.push(data.board[colCounter][rowCounter]);
					}
					solution.push(currentRow);
				}

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
				});
			}

			else if (data.status === 'DONE')  {
				stopSolving(worker);
				setSolvingInProgress(false);

				if (oneSolutionFound) {
					showNotification("All the solutions generated.");
				}

				else {
					showNotification("No solutions found for your input configuration.");
				}
			}
		}

		worker.postMessage({
			'action': 'start',
			'blocks': JSON.stringify(blocks),
			'board': JSON.stringify(board),
		})
		return worker;
	}

	else {
		showNotification("Your browser does not support this application. We suggest using an updated version of Chrome, Firefox, or Edge.")
	}
}

export const stopSolving = worker => {
	if (worker) worker.terminate();
	worker = null;
}
