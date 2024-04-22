export const dateNow = () => {
    return  new Date().toLocaleDateString('es-US', {
        day: 'numeric',
        month: '2-digit', 
        year: 'numeric',
        timeZone: 'America/Guayaquil'
    });
}