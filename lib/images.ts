const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"];

export function isOptimizableImage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}
