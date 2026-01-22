type ProgressCallback = (message: string) => void;

type EncodeOptions = {
  maxSide?: number;
  quality?: number;
  timeoutMs?: number;
};

const DEFAULT_MAX_SIDE = 1200;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_TIMEOUT_MS = 8000;

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const getScaledSize = (sourceWidth: number, sourceHeight: number, maxSide: number) => {
  const maxSourceSide = Math.max(sourceWidth, sourceHeight);
  const scale = maxSourceSide > maxSide ? maxSide / maxSourceSide : 1;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  return { width, height };
};

const encodeSourceToJpegBlob = async (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  options: EncodeOptions = {}
): Promise<Blob> => {
  const maxSide = options.maxSide ?? DEFAULT_MAX_SIDE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const { width, height } = getScaledSize(sourceWidth, sourceHeight, maxSide);
  const type: "image/jpeg" = "image/jpeg";

  // Prefer OffscreenCanvas + convertToBlob: more reliable and promise-based.
  if (typeof OffscreenCanvas !== "undefined") {
    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext("2d");
    if (!ctx) throw new Error("Canvas context error");
    ctx.drawImage(source, 0, 0, width, height);

    // convertToBlob exists on OffscreenCanvas in modern browsers.
    if (typeof (offscreen as any).convertToBlob === "function") {
      const convertPromise = (offscreen as any).convertToBlob({ type, quality }) as Promise<Blob>;
      return await withTimeout(convertPromise, timeoutMs, "Image encoding");
    }
  }

  // Fallback: HTMLCanvasElement.toBlob (promise-wrapped) with timeout.
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context error");
  ctx.drawImage(source, 0, 0, width, height);

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    if (!canvas.toBlob) return reject(new Error("toBlob not supported"));
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      type,
      quality
    );
  });

  return await withTimeout(blobPromise, timeoutMs, "Image encoding");
};

export const compressImageFileToJpegBlob = async (file: File, options: EncodeOptions = {}): Promise<Blob> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Fast path: decode via createImageBitmap.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await withTimeout(createImageBitmap(file), timeoutMs, "Decode image");
      try {
        return await encodeSourceToJpegBlob(bitmap, bitmap.width, bitmap.height, options);
      } finally {
        // ImageBitmap has close() in most browsers.
        (bitmap as any)?.close?.();
      }
    } catch {
      // fall through
    }
  }

  // Fallback: HTMLImageElement decode.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;

    await withTimeout(
      new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      }),
      timeoutMs,
      "Decode image"
    );

    return await encodeSourceToJpegBlob(img, img.naturalWidth || img.width, img.naturalHeight || img.height, options);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const captureDisplayToJpegBlob = async (params: {
  progress?: ProgressCallback;
  maxSide?: number;
  quality?: number;
  timeoutMs?: number;
}): Promise<Blob> => {
  const progress = params.progress;
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen capture not supported. Please use file upload.");
  }

  progress?.("Starting capture...");
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: { ideal: 1920 }, height: { ideal: 1080 } } as any,
    audio: false,
  });

  let video: HTMLVideoElement | null = null;
  try {
    const track = stream.getVideoTracks()[0];
    if (!track) throw new Error("No video track");

    progress?.("Capturing frame...");

    // Prefer ImageCapture.grabFrame when available.
    const ImageCaptureCtor = (window as any).ImageCapture as
      | (new (track: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> })
      | undefined;

    if (ImageCaptureCtor) {
      try {
        const imageCapture = new ImageCaptureCtor(track);
        const bitmap = await withTimeout(imageCapture.grabFrame(), 5000, "Grab frame");
        try {
          progress?.("Compressing...");
          return await encodeSourceToJpegBlob(bitmap, bitmap.width, bitmap.height, {
            maxSide: params.maxSide,
            quality: params.quality,
            timeoutMs,
          });
        } finally {
          (bitmap as any)?.close?.();
        }
      } catch {
        // fall through to video
      }
    }

    // Fallback: hidden video element, then encode directly from the video element.
    video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.style.position = "fixed";
    video.style.left = "-9999px";
    video.style.top = "-9999px";
    video.style.width = "1px";
    video.style.height = "1px";
    video.style.opacity = "0";
    document.body.appendChild(video);

    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video!.onloadedmetadata = () => resolve();
        video!.onerror = () => reject(new Error("Failed to initialize capture"));
      }),
      5000,
      "Capture setup"
    );

    await withTimeout(video.play(), 5000, "Video play");

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("Invalid video dimensions");
    }

    progress?.("Compressing...");
    return await encodeSourceToJpegBlob(video, video.videoWidth, video.videoHeight, {
      maxSide: params.maxSide,
      quality: params.quality,
      timeoutMs,
    });
  } finally {
    stream.getTracks().forEach((t) => t.stop());
    if (video) {
      try {
        video.pause();
      } catch {
        // ignore
      }
      video.srcObject = null;
      video.remove();
    }
  }
};
