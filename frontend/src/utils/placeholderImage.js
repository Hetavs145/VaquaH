// Placeholder JPG image as base64 data URL
// This is a simple gray placeholder image with "No Image" text
export const placeholderImageJPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';

// Function to get placeholder image
export const getPlaceholderImage = () => {
  return placeholderImageJPG;
};

// Function to check if an image is a placeholder
export const isPlaceholderImage = (imageUrl) => {
  return imageUrl === placeholderImageJPG || imageUrl === '/placeholder.jpg';
};

export default placeholderImageJPG;