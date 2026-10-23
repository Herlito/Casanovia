export async function processAndOptimizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToCloudStorage(file: File): Promise<string> {
  return processAndOptimizeImage(file);
}

export async function uploadQrToCloudStorage(file: File): Promise<string> {
  return processAndOptimizeImage(file);
}
