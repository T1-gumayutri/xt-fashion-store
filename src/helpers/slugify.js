export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '') 
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-'); 
};