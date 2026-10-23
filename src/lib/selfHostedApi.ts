export async function uploadImageToHost(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.readAsDataURL(file);
  });
}

export async function saveWeddingToHost(data: any): Promise<any> {
  return {};
}
