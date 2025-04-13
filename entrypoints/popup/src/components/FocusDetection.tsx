import React, { JSX, useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../../environment";

// Define types for face landmarks and vectors
interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface FaceVectors {
  LR: number[];
  normal: number[];
}

interface PitchYawRoll {
  pitch: number;
  yaw: number;
  roll: number;
}

interface FaceMeshResults {
  image: HTMLVideoElement | HTMLImageElement;
  multiFaceLandmarks?: Landmark[][];
}

// Create a FocusDetection component
export default function FocusDetection(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focusStatus, setFocusStatus] = useState<string>("Unknown");
  const [focusScore, setFocusScore] = useState<number>(0);
  const [metricsInfo, setMetricsInfo] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [meetingCode, setMeetingCode] = useState("");
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  async function saveFocusData() {
    try {
      
      const data = await axios.post(
        backendUrl + `classroom/${meetingCode}/focus-data`,
        { student_name: user.username ,  data:{focusStatus , focusScore , metricsInfo}}
      );


    } catch (error) {
      console.log(error);
    }
  }
  setTimeout(() => {}, 10000);
  // Track face vectors and calibration values
  const neutralPitchRef = useRef<number>(0);
  const neutralYawRef = useRef<number>(0);
  const neutralIrisFocusRef = useRef<number>(50.0);

  // Buffer refs to avoid recreation
  const focusScoresBufferRef = useRef<number[]>([]);
  const pitchBufferRef = useRef<number[]>([]);
  const yawBufferRef = useRef<number[]>([]);
  const rollBufferRef = useRef<number[]>([]);
  const noFaceCountRef = useRef<number>(0);

  // Parameters for focus detection
  const FOCUS_THRESHOLD = 70;
  const MAX_YAW_ANGLE = 20.0;
  const MAX_PITCH_ANGLE = 15.0;
  const IRIS_WEIGHT = 0.7;
  const ORIENTATION_WEIGHT = 0.3;
  const YAW_WEIGHT = 0.6;
  const PITCH_WEIGHT = 0.4;
  const FOCUS_BUFFER_SIZE = 10;
  const ANGLE_SMOOTHING_WINDOW = 10;
  const NO_FACE_THRESHOLD = 30;

  // Landmark indices for various facial features
  const LEFT_EYE_INDICES = [33, 133, 159, 145, 153, 144, 160, 161];
  const RIGHT_EYE_INDICES = [263, 362, 386, 374, 380, 373, 387, 388];
  const LEFT_IRIS_INDICES = [468, 469, 470, 471];
  const RIGHT_IRIS_INDICES = [473, 474, 475, 476];
  const FACE_KEY_LANDMARKS = {
    noseTip: 1,
    chin: 152,
    leftEyeOuter: 33,
    rightEyeOuter: 263,
    leftMouth: 61,
    rightMouth: 291,
  };

  // Helper functions
  const average = (arr: number[]): number =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const addToBuffer = (
    buffer: number[],
    value: number,
    maxLength: number
  ): void => {
    buffer.push(value);
    if (buffer.length > maxLength) {
      buffer.shift();
    }
  };

  const getLandmarkPoints = (
    landmarks: Landmark[],
    width: number,
    height: number,
    indices: number[]
  ): [number, number][] | null => {
    const points: [number, number][] = [];
    for (const idx of indices) {
      const x = landmarks[idx].x * width;
      const y = landmarks[idx].y * height;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        points.push([Math.floor(x), Math.floor(y)]);
      } else {
        return null;
      }
    }
    return points.length === indices.length ? points : null;
  };

  const getEyeBox = (
    eyePoints: [number, number][] | null
  ): [number, number, number, number] => {
    if (!eyePoints || eyePoints.length === 0) {
      return [0, 0, 0, 0];
    }

    const xCoords = eyePoints.map((pt) => pt[0]);
    const yCoords = eyePoints.map((pt) => pt[1]);

    const minX = Math.max(0, Math.min(...xCoords));
    const maxX = Math.max(...xCoords);
    const minY = Math.max(0, Math.min(...yCoords));
    const maxY = Math.max(...yCoords);

    return [minX, minY, maxX, maxY];
  };

  const getIrisCenter = (
    landmarks: Landmark[],
    width: number,
    height: number,
    indices: number[]
  ): [number, number] | null => {
    const irisX: number[] = [];
    const irisY: number[] = [];

    for (const i of indices) {
      const ix = landmarks[i].x * width;
      const iy = landmarks[i].y * height;

      if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
        irisX.push(ix);
        irisY.push(iy);
      } else {
        return null;
      }
    }

    if (irisX.length !== indices.length) {
      return null;
    }

    return [
      Math.floor(irisX.reduce((a, b) => a + b, 0) / irisX.length),
      Math.floor(irisY.reduce((a, b) => a + b, 0) / irisY.length),
    ];
  };

  const computeIrisFocus = (
    irisPoint: [number, number] | null,
    eyeBox: [number, number, number, number]
  ): number => {
    if (!irisPoint) {
      return 0.0;
    }

    const [minX, minY, maxX, maxY] = eyeBox;
    const eyeWidth = maxX - minX;
    const eyeHeight = maxY - minY;

    if (eyeWidth === 0 || eyeHeight === 0) {
      return 0.0;
    }

    const eyeCenterX = (minX + maxX) / 2;
    const eyeCenterY = (minY + maxY) / 2;

    const hOffset = Math.abs(irisPoint[0] - eyeCenterX) / (eyeWidth / 2.0);
    const vOffset = Math.abs(irisPoint[1] - eyeCenterY) / (eyeHeight / 2.0);

    const hFocus = Math.max(0, Math.min(100, (1 - hOffset) * 100));
    const vFocus = Math.max(0, Math.min(100, (1 - vOffset) * 100));
    const rawFocus = (hFocus + vFocus) / 2.0;

    const adjustedFocus = (rawFocus / neutralIrisFocusRef.current) * 90;
    return Math.min(Math.max(adjustedFocus, 0), 100);
  };

  const crossProduct = (a: number[], b: number[]): number[] => {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  };

  const getFaceVectors = (landmarks: Landmark[]): FaceVectors => {
    const lIdx = FACE_KEY_LANDMARKS.leftEyeOuter;
    const rIdx = FACE_KEY_LANDMARKS.rightEyeOuter;
    const nIdx = FACE_KEY_LANDMARKS.noseTip;

    const L = landmarks[lIdx];
    const R = landmarks[rIdx];
    const N = landmarks[nIdx];

    const lx = L.x,
      ly = L.y,
      lz = L.z;
    const rx = R.x,
      ry = R.y,
      rz = R.z;
    const nx = N.x,
      ny = N.y,
      nz = N.z;

    // Vector from left eye to right eye
    const LR = [rx - lx, ry - ly, rz - lz];

    // Vector from left eye to nose
    const LN = [nx - lx, ny - ly, nz - lz];

    // Calculate normal vector using cross product
    const normal = crossProduct(LR, LN);
    let normLen = Math.sqrt(
      normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]
    );

    // Normalize normal vector
    if (normLen < 1e-7) {
      normal[0] = 0;
      normal[1] = 0;
      normal[2] = -1;
    } else {
      normal[0] /= normLen;
      normal[1] /= normLen;
      normal[2] /= normLen;
    }

    // Ensure normal points forward
    if (normal[2] > 0) {
      normal[0] = -normal[0];
      normal[1] = -normal[1];
      normal[2] = -normal[2];
    }

    return { LR, normal };
  };

  const getPitchYawRoll = (LR: number[], normal: number[]): PitchYawRoll => {
    // Yaw from LR vector (projected onto XZ plane)
    const [LR_x, LR_y, LR_z] = LR;
    const yawRad = Math.atan2(LR_x, LR_z);

    const [Nx, Ny, Nz] = normal;
    const denom = Math.sqrt(Nx * Nx + Nz * Nz);
    const pitchRad = denom > 1e-7 ? Math.atan2(Ny, denom) : 0.0;
    const rollRad = 0.0;

    let pitch = pitchRad * (180 / Math.PI);
    let yaw = yawRad * (180 / Math.PI);
    let roll = rollRad * (180 / Math.PI);

    pitch -= neutralPitchRef.current;
    yaw -= neutralYawRef.current;

    return { pitch, yaw, roll };
  };

  const computeAngleFocus = (angle: number, maxAngle: number): number => {
    const angleAbs = Math.abs(angle);
    return Math.max(0.0, (1 - angleAbs / maxAngle) * 100.0);
  };

  // Function to calibrate neutral position
  const calibrateNeutralPosition = (): void => {
    if (pitchBufferRef.current.length > 0 && yawBufferRef.current.length > 0) {
      neutralPitchRef.current = average(pitchBufferRef.current);
      neutralYawRef.current = average(yawBufferRef.current);
      alert(
        `Calibrated: Pitch ${neutralPitchRef.current.toFixed(
          2
        )}°, Yaw ${neutralYawRef.current.toFixed(2)}°`
      );
    } else {
      alert("Please look at screen directly for calibration");
    }
  };

  // Start/stop camera with enhanced handling
  const toggleCamera = async (): Promise<void> => {
    console.log("Toggle camera called, current state:", cameraActive);
    if (cameraActive) {
      console.log("Stopping camera");
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      console.log("Starting camera");
      // Check secure context
      if (!window.isSecureContext) {
        alert(
          "Camera access requires a secure context (HTTPS or localhost). Please run this extension on a secure origin."
        );
        console.error("Insecure context detected");
        return;
      }

      try {
        // Check available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("Available cameras:", videoDevices);
        if (videoDevices.length === 0) {
          alert("No cameras detected. Please connect a camera and try again.");
          console.error("No video input devices found");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        console.log("Camera stream acquired successfully");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .catch((err) => console.error("Video play error:", err));
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            alert(
              "Camera access was denied. Please click 'Allow' in the permission prompt, or go to chrome://settings/content/camera to enable access for this extension."
            );
          } else if (err.name === "NotFoundError") {
            alert(
              "No camera found. Please ensure a camera is connected and try again."
            );
          } else if (err.name === "SecurityError") {
            alert(
              "Camera access blocked due to security restrictions. Ensure this extension runs on a secure context (HTTPS or localhost)."
            );
          } else {
            alert(`Error accessing camera: ${err.message}`);
          }
        } else {
          alert(
            "Unexpected error accessing camera. Check console for details."
          );
        }
      }
    }
  };

  // Initialize MediaPipe FaceMesh and camera
  useEffect(() => {
    let faceMesh: any;
    let camera: any;

    const initializeFaceMesh = async (): Promise<void> => {
      console.log("Initializing FaceMesh");
      try {
        // Only load MediaPipe libraries when needed
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const { Camera } = await import("@mediapipe/camera_utils");
        const { drawConnectors } = await import("@mediapipe/drawing_utils");
        const {
          FACEMESH_TESSELATION,
          FACEMESH_RIGHT_EYE,
          FACEMESH_RIGHT_EYEBROW,
          FACEMESH_RIGHT_IRIS,
          FACEMESH_LEFT_EYE,
          FACEMESH_LEFT_EYEBROW,
          FACEMESH_LEFT_IRIS,
          FACEMESH_FACE_OVAL,
          FACEMESH_LIPS,
        } = await import("@mediapipe/face_mesh");

        if (!canvasRef.current || !videoRef.current) {
          console.error("Canvas or video ref missing");
          return;
        }

        const onResults = (results: FaceMeshResults): void => {
          const canvasCtx = canvasRef.current?.getContext("2d");
          if (!canvasCtx || !canvasRef.current) return;

          const canvasWidth = canvasRef.current.width;
          const canvasHeight = canvasRef.current.height;

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          canvasCtx.drawImage(results.image, 0, 0, canvasWidth, canvasHeight);

          let finalFocus = 0.0;
          let metricsText = "";

          if (
            results.multiFaceLandmarks &&
            results.multiFaceLandmarks.length > 0
          ) {
            // Reset no face counter
            noFaceCountRef.current = 0;

            const faceLandmarks = results.multiFaceLandmarks[0];

            // Get eye and iris landmarks
            const leftEye = getLandmarkPoints(
              faceLandmarks,
              canvasWidth,
              canvasHeight,
              LEFT_EYE_INDICES
            );
            const rightEye = getLandmarkPoints(
              faceLandmarks,
              canvasWidth,
              canvasHeight,
              RIGHT_EYE_INDICES
            );

            if (leftEye && rightEye) {
              const leftBox = getEyeBox(leftEye);
              const rightBox = getEyeBox(rightEye);

              const leftIrisCenter = getIrisCenter(
                faceLandmarks,
                canvasWidth,
                canvasHeight,
                LEFT_IRIS_INDICES
              );
              const rightIrisCenter = getIrisCenter(
                faceLandmarks,
                canvasWidth,
                canvasHeight,
                RIGHT_IRIS_INDICES
              );

              if (leftIrisCenter && rightIrisCenter) {
                // Calculate iris focus
                const leftIrisFocus = computeIrisFocus(leftIrisCenter, leftBox);
                const rightIrisFocus = computeIrisFocus(
                  rightIrisCenter,
                  rightBox
                );
                const irisFocus = (leftIrisFocus + rightIrisFocus) / 2.0;

                // Calculate head orientation
                const { LR, normal } = getFaceVectors(faceLandmarks);
                const { pitch, yaw, roll } = getPitchYawRoll(LR, normal);

                // Smooth angles with buffers
                addToBuffer(
                  pitchBufferRef.current,
                  pitch,
                  ANGLE_SMOOTHING_WINDOW
                );
                addToBuffer(yawBufferRef.current, yaw, ANGLE_SMOOTHING_WINDOW);
                addToBuffer(
                  rollBufferRef.current,
                  roll,
                  ANGLE_SMOOTHING_WINDOW
                );

                const smoothedPitch = average(pitchBufferRef.current);
                const smoothedYaw = average(yawBufferRef.current);

                // Calculate focus based on orientation
                const yawFocus = computeAngleFocus(smoothedYaw, MAX_YAW_ANGLE);
                const pitchFocus = computeAngleFocus(
                  smoothedPitch,
                  MAX_PITCH_ANGLE
                );

                const orientationFocus =
                  yawFocus * YAW_WEIGHT + pitchFocus * PITCH_WEIGHT;

                // Calculate final weighted focus score
                finalFocus =
                  irisFocus * IRIS_WEIGHT +
                  orientationFocus * ORIENTATION_WEIGHT;

                // Add to smoothing buffer
                addToBuffer(
                  focusScoresBufferRef.current,
                  finalFocus,
                  FOCUS_BUFFER_SIZE
                );
                const smoothedFocus = average(focusScoresBufferRef.current);

                // Update focus status
                const focused = smoothedFocus >= FOCUS_THRESHOLD;
                setIsFocused(focused);
                setFocusScore(Math.round(smoothedFocus));
                setFocusStatus(focused ? "Focused" : "Not Focused");

                metricsText =
                  `Iris Focus: ${Math.round(irisFocus)}%\n` +
                  `Yaw: ${Math.round(smoothedYaw)}° (Focus: ${Math.round(
                    yawFocus
                  )}%)\n` +
                  `Pitch: ${Math.round(smoothedPitch)}° (Focus: ${Math.round(
                    pitchFocus
                  )}%)\n` +
                  `Orientation Focus: ${Math.round(orientationFocus)}%`;
                setMetricsInfo(metricsText);

                // Draw landmarks
                // Draw eyes
                for (const point of [...leftEye, ...rightEye]) {
                  canvasCtx.beginPath();
                  canvasCtx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
                  canvasCtx.fillStyle = "rgba(0, 255, 0, 0.8)";
                  canvasCtx.fill();
                }

                // Draw iris centers
                if (leftIrisCenter) {
                  canvasCtx.beginPath();
                  canvasCtx.arc(
                    leftIrisCenter[0],
                    leftIrisCenter[1],
                    3,
                    0,
                    2 * Math.PI
                  );
                  canvasCtx.fillStyle = "rgba(255, 0, 0, 0.8)";
                  canvasCtx.fill();
                }

                if (rightIrisCenter) {
                  canvasCtx.beginPath();
                  canvasCtx.arc(
                    rightIrisCenter[0],
                    rightIrisCenter[1],
                    3,
                    0,
                    2 * Math.PI
                  );
                  canvasCtx.fillStyle = "rgba(255, 0, 0, 0.8)";
                  canvasCtx.fill();
                }
              }
            }

            // Draw face mesh landmarks
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_TESSELATION, {
              color: "#C0C0C070",
              lineWidth: 1,
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_RIGHT_EYE, {
              color: "#FF3030",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_RIGHT_EYEBROW, {
              color: "#FF3030",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_RIGHT_IRIS, {
              color: "#FF3030",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_LEFT_EYE, {
              color: "#30FF30",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_LEFT_EYEBROW, {
              color: "#30FF30",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_LEFT_IRIS, {
              color: "#30FF30",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_FACE_OVAL, {
              color: "#E0E0E0",
            });
            drawConnectors(canvasCtx, faceLandmarks, FACEMESH_LIPS, {
              color: "#E0E0E0",
            });
          } else {
            // No face detected
            noFaceCountRef.current++;

            if (noFaceCountRef.current > NO_FACE_THRESHOLD) {
              setIsFocused(false);
              addToBuffer(focusScoresBufferRef.current, 0, FOCUS_BUFFER_SIZE);
              const smoothedFocus = average(focusScoresBufferRef.current);
              setFocusScore(Math.round(smoothedFocus));
              setFocusStatus("No Face Detected");
              setMetricsInfo("");
            }
          }

          canvasCtx.restore();
        };

        // Initialize FaceMesh
        faceMesh = new FaceMesh({
          locateFile: (file: string): string => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        faceMesh.onResults(onResults);

        // Initialize camera
        camera = new Camera(videoRef.current, {
          onFrame: async (): Promise<void> => {
            if (videoRef.current && videoRef.current.srcObject) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        if (cameraActive) {
          console.log("Starting MediaPipe camera");
          camera.start();
        }
      } catch (err) {
        console.error("FaceMesh initialization error:", err);
        alert(
          "Failed to initialize face detection. Please refresh and try again."
        );
      }
    };

    if (cameraActive) {
      initializeFaceMesh();
    }

    return () => {
      console.log("Cleaning up FaceMesh and camera");
      if (camera) {
        camera.stop();
      }
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, [cameraActive]);

  return (
    <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col items-center justify-center">
      {/* Video element */}
      <div className="flex items-center justify-center gap-4">
        <video
          ref={videoRef}
          style={{
            width: "150px",
            height: "120px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          className="mr-3"
          autoPlay
          playsInline
        />

        {/* Canvas for displaying the video stream and face mesh */}
        <canvas
          ref={canvasRef}
          style={{
            width: "150px",
            height: "120px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          className="w-full h-full rounded-lg shadow-lg hidden"
          width={1280}
          height={720}
        />
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={toggleCamera}
          className={`flex items-center px-4 py-2 rounded-md ${
            cameraActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white font-medium transition-colors`}
        >
          <Camera className="mr-2 h-5 w-5" />
          {cameraActive ? "Stop Camera" : "Start Camera"}
        </button>
      </div>
    </div>
  );
}
