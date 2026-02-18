const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function uploadImage(
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  // Client-side pre-validation
  if (file.size > MAX_SIZE) {
    return Promise.reject(new Error("FILE_TOO_LARGE"));
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Promise.reject(new Error("INVALID_TYPE"));
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status === 201) {
          resolve(json.url);
        } else {
          reject(new Error(json.error ?? "Upload failed"));
        }
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("NETWORK_ERROR"));
    xhr.open("POST", "/api/upload/image");
    xhr.send(formData);
  });
}
