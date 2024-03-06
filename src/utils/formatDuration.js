export function formatDuration(secondsInput) {
    // Arrondissement des secondes au plus proche
    const seconds = Math.round(secondsInput);
    // Calcul des heures, minutes et secondes
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60;
  
    // Formatage de la chaîne de caractères de retour
    let result = ""
  
    // Ajout des heures à la chaîne de caractères si nécessaire
    if (hours > 0) {
      result += `${hours}:`
    }
  
    // Ajout des minutes et des secondes à la chaîne de caractères
    // Si il y a des heures, on s'assure que les minutes soient toujours sur 2 chiffres
    if (hours > 0) {
      result += `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      result += `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  
    return result
}