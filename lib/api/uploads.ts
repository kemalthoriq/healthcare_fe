import { api, ApiError } from "@/lib/api/client";

export type UploadFolder = "treatments" | "therapists" | "promos";

type UploadSignature = {
  upload_url: string;
  api_key: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowed_formats: string;
};

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Ukuran gambar maksimal 2 MB.";
  }
  return null;
}

function signUpload(folder: UploadFolder) {
  return api.post<UploadSignature>("/admin/uploads/sign", { folder });
}

function postToCloudinary(signature: UploadSignature, file: File, onProgress: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.api_key);
    body.append("timestamp", String(signature.timestamp));
    body.append("signature", signature.signature);
    body.append("folder", signature.folder);
    body.append("allowed_formats", signature.allowed_formats);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signature.upload_url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      const payload = (() => {
        try {
          return JSON.parse(xhr.responseText) as { secure_url?: string; error?: { message?: string } };
        } catch {
          return null;
        }
      })();
      if (xhr.status >= 200 && xhr.status < 300 && payload?.secure_url) {
        resolve(payload.secure_url);
        return;
      }
      reject(new ApiError(xhr.status, "UPLOAD_FAILED", "Upload gambar gagal. Silakan coba lagi."));
    };
    xhr.onerror = () =>
      reject(new ApiError(0, "NETWORK_ERROR", "Upload gambar terputus. Periksa koneksi Anda lalu coba lagi."));
    xhr.send(body);
  });
}

export async function uploadImage(folder: UploadFolder, file: File, onProgress: (percent: number) => void) {
  const signature = await signUpload(folder);
  return postToCloudinary(signature, file, onProgress);
}
