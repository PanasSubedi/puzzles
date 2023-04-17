let final_solutions = [];

const isValidChoice = (points, inputs, currentPoint) => {
    let point;
    for (let i=0; i<points.length; i++) {
        point = points[i];
        
        if (point[0] === currentPoint[0] || point[1] === currentPoint[1]) {
            return false;
        }

        if (point[0]+point[1] === currentPoint[0]+currentPoint[1]) {
            return false;
        }

        if (point[0]-point[1] === currentPoint[0]-currentPoint[1]) {
            return false;
        }
    }

    let input;
    for (let i=0; i<inputs.length; i++) {
        input = inputs[i];
        if (currentPoint[0] === input[0] && currentPoint[1] !== input[1]) {
            return false;
        }
    }

    return true;
}

export const findSolutions = (size, inputs=[]) => {
    final_solutions = [];
    findSolutionsRecursive(size, inputs)
    return final_solutions;
}

export const findSolutionsRecursive = (size, inputs, points=[], row=0) => {
    if (points.length === size) {
        final_solutions.push(points);
    }

    for (let col=0; col<size; col++) {
        if (row < size && isValidChoice(points, inputs, [row, col])) {
            findSolutionsRecursive(size, inputs, points.concat([[row, col]]), row+1);
        }
    }
}