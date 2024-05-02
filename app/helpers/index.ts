export const dateNow = () => {
    return  new Date().toLocaleDateString('es-US', {
        day: 'numeric',
        month: '2-digit', 
        year: 'numeric',
        timeZone: 'America/Guayaquil'
    });
}

export const generateCodeShipping = (text:string) => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^\w\s]|_/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/\s+$/g, '');
}

export const extractCedula = (identification:string) => {
    if (identification.endsWith("001")) {
        return Math.floor(+identification / 1000).toString();
    } else {
        return identification;
    }
}

export const nextConsecutive = (numberSerie:string) => {
    const parts = numberSerie.split('-');
    let lastNumero = +parts[2];
    lastNumero += 1;

    const newNumero = lastNumero.toString().padStart(9, '0');
    parts[2] = newNumero;
    const newNumberSerie = parts.join('-');

    return newNumberSerie;
}