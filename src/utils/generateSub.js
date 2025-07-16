export const generateSub = (name) => {
    if (typeof name !== 'string' || !name.trim()) return '';
    return name.replace(/ /g, '-').toLowerCase();
};