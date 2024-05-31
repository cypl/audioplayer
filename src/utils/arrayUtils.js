/**
 * Create an array, by determining a starting element and an ending position of an initial array
 * @param {Array} array // initial array
 * @param {Number} start // position where you want to begin
 * @param {Number} end // position where you want to stop
 * @returns {Array} // new array
 */
export const createNewArrayFromTo = (array, start, end) => {
    return array.slice(start, end + 1)
}

/**
 * Calculate the sum of every element of an array
 * @param {Array} array // an array of numbers
 * @returns {Number} // a number
 */
export const sumThisArray = (array) => {
    return array.reduce((acc, current) => acc + current, 0)
}


export const reduceSizeArray = (originalArray, numberOfElements) => {
    const newArray = []
    const segmentSize = Math.floor(originalArray.length / numberOfElements)
    
    for (let i = 0; i < numberOfElements; i++) {
        // Calculate the start and the end of the segment
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

    return newArray
}


export function transformArray(arr, start, end, numElements, direction) {
    let array = Array.from(arr)
    // Vérification des paramètres
    if(array.length > 0){
        if (start < 0 || end > array.length || start >= end || numElements <= 0) {
            throw new Error("Paramètres invalides");
        }
    }

    // Extraire la tranche du tableau
    const subArray = array.slice(start, end);

    // Calculer la taille de chaque segment
    const segmentSize = Math.floor(subArray.length / numElements);
    const resultArray = [];

    for (let i = 0; i < numElements; i++) {
        // Déterminer les bornes du segment
        const segmentStart = i * segmentSize;
        const segmentEnd = (i + 1) * segmentSize;
        const segment = subArray.slice(segmentStart, segmentEnd);

        // Calculer la moyenne du segment
        const segmentAverage = segment.reduce((sum, value) => sum + value, 0) / segment.length;

        resultArray.push(segmentAverage);
    }

    // Normaliser les valeurs de 0 à 100
    const normalizedArray = resultArray.map(value => (value / 256) * 100);

    if(direction === "normal") { return normalizedArray }
    if(direction === "reverse") { return normalizedArray.reverse() }
    
}