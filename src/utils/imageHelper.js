export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    return imagePath;
  }

  return `http://localhost:5000${imagePath}`;
};