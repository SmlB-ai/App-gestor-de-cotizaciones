/**
 * Converts a File object to a Base64 string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validates if a string is a base64 image or a URL.
 */
export function isImageValid(str: string): boolean {
  return str.startsWith('data:image/') || str.startsWith('http');
}
