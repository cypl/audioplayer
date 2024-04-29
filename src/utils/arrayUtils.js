export const createNewArrayFromTo = (array, start, end) => {
    return array.slice(start, end + 1);
}

export const sumThisArray = (array) => {
    return array.reduce((acc, current) => acc + current, 0);
}

export const reduceSizeArray = (originalArray, numberOfElements) => {
    const newArray = [];
    const segmentSize = Math.floor(originalArray.length / numberOfElements);
    
    for (let i = 0; i < numberOfElements; i++) {
        // Calculer le début et la fin du segment
        let start = i * segmentSize;
        let end = start + segmentSize;

        // Si on est au dernier segment, s'assurer d'inclure tous les éléments restants
        if (i === numberOfElements - 1) {
            end = originalArray.length;
        }

        // Extraire le segment (qui reste un Uint8Array) et calculer la moyenne
        const segment = originalArray.slice(start, end);
        const average = segment.reduce((acc, val) => acc + val, 0) / segment.length;
        
        // Ajouter la moyenne calculée au nouveau tableau (de type Array)
        newArray.push(average);
    }

    return newArray;
}