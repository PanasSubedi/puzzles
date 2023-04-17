export const getSolution = size => {
  return fetch("/nQueen/solution/" + size)
    .then (response => response.json())
    .then (
      result => {
        if (result.isSuccess) {
          return result.solutions;
        }

        else {asd
          return [];
        }
      }
    )
}

export const getCompletion = (size, inputs) => {
  return fetch("/nQueen/completion/" + size, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(inputs)
  })
  .then(response => response.json())
  .then(results => {
    if (results.isSuccess) {
      return results.completion;
    }

    else {
      return [];
    }
  })
}
