import React, { useState, useRef, useEffect, useCallback } from "react";

// Eye Aspect Ratio (EAR) landmark indices for MediaPipe FaceMesh
// Left eye: 362,385,387,263,373,380  |  Right eye: 33,160,158,133,153,144
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

// EAR < threshold for N frames = drowsy
const EAR_THRESHOLD = 0.22;
const DROWSY_FRAMES = 18; // ~0.6s at 30fps

function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function computeEAR(landmarks, indices) {
    const p = indices.map(i => landmarks[i]);
    const vertical1 = dist(p[1], p[5]);
    const vertical2 = dist(p[2], p[4]);
    const horizontal = dist(p[0], p[3]);
    return (vertical1 + vertical2) / (2.0 * horizontal);
}

const STATUS_CONFIG = {
    alert: { label: "Alert & Focused", color: "var(--bf-emerald)", bg: "#E6F5EC", icon: "✅" },
    caution: { label: "Slight Drowsiness", color: "var(--bf-amber)", bg: "#FEF3E2", icon: "⚠️" },
    drowsy: { label: "DROWSY — Rest Now!", color: "var(--bf-magenta)", bg: "#FCEAEC", icon: "😴" },
    idle: { label: "Camera Off", color: "var(--bf-slate)", bg: "#F2EDE0", icon: "📷" },
    loading: { label: "Loading AI Model…", color: "var(--bf-teal)", bg: "#E4F2F8", icon: "🔄" },
};

export function DrowsinessDetector({ onDrowsinessAlert }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const faceMeshRef = useRef(null);
    const cameraRef = useRef(null);
    const drowsyFrames = useRef(0);
    const alertedRef = useRef(false);
    const animRef = useRef(null);

    const [status, setStatus] = useState("idle");
    const [ear, setEar] = useState(null);
    const [running, setRunning] = useState(false);
    const [modelReady, setModelReady] = useState(false);
    const [sessionStats, setSessionStats] = useState({ alerts: 0, duration: 0 });
    const startTimeRef = useRef(null);

    // Update session duration every second
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            if (startTimeRef.current) {
                setSessionStats(s => ({ ...s, duration: Math.floor((Date.now() - startTimeRef.current) / 1000) }));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [running]);

    const handleResults = useCallback((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];

            // Scale normalized to pixel coords
            const scaled = landmarks.map(lm => ({
                x: lm.x * canvas.width,
                y: lm.y * canvas.height,
            }));

            const leftEAR = computeEAR(scaled, LEFT_EYE);
            const rightEAR = computeEAR(scaled, RIGHT_EYE);
            const avgEAR = (leftEAR + rightEAR) / 2;
            setEar(avgEAR.toFixed(3));

            // Draw eye keypoints
            const allEyeIdx = [...LEFT_EYE, ...RIGHT_EYE];
            allEyeIdx.forEach(i => {
                ctx.beginPath();
                ctx.arc(scaled[i].x, scaled[i].y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = avgEAR < EAR_THRESHOLD ? "#E8435A" : "#28A065";
                ctx.fill();
            });

            // Draw connecting lines for eyes
            [LEFT_EYE, RIGHT_EYE].forEach(eyeIdx => {
                ctx.beginPath();
                eyeIdx.forEach((idx, j) => {
                    const p = scaled[idx];
                    j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
                });
                ctx.closePath();
                ctx.strokeStyle = avgEAR < EAR_THRESHOLD ? "rgba(232,67,90,0.8)" : "rgba(40,160,101,0.8)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            // EAR overlay text
            ctx.font = "bold 14px Outfit, sans-serif";
            ctx.fillStyle = avgEAR < EAR_THRESHOLD ? "#E8435A" : "#28A065";
            ctx.fillText(`EAR: ${avgEAR.toFixed(3)}`, 12, 28);

            // Drowsiness counter
            if (avgEAR < EAR_THRESHOLD) {
                drowsyFrames.current += 1;
                const pctDrowsy = Math.min(drowsyFrames.current / DROWSY_FRAMES, 1);
                setStatus(pctDrowsy > 0.5 ? "drowsy" : "caution");

                if (drowsyFrames.current >= DROWSY_FRAMES && !alertedRef.current) {
                    alertedRef.current = true;
                    setSessionStats(s => ({ ...s, alerts: s.alerts + 1 }));
                    if (onDrowsinessAlert) onDrowsinessAlert(avgEAR);
                }
            } else {
                drowsyFrames.current = Math.max(0, drowsyFrames.current - 2);
                alertedRef.current = false;
                setStatus("alert");
            }
        } else {
            setStatus("idle");
            setEar(null);
        }
    }, [onDrowsinessAlert]);

    const startDetection = useCallback(async () => {
        setStatus("loading");
        setRunning(true);
        startTimeRef.current = Date.now();

        // Dynamically load MediaPipe FaceMesh from CDN
        const script1 = document.createElement("script");
        script1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
        script1.crossOrigin = "anonymous";

        const script2 = document.createElement("script");
        script2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
        script2.crossOrigin = "anonymous";

        document.head.appendChild(script1);
        document.head.appendChild(script2);

        await new Promise(res => setTimeout(res, 2500)); // allow scripts to load

        if (!window.FaceMesh || !window.Camera) {
            setStatus("idle");
            setRunning(false);
            alert("Could not load MediaPipe. Please check your internet connection.");
            return;
        }

        const faceMesh = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        faceMesh.onResults(handleResults);
        faceMeshRef.current = faceMesh;

        const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
                if (faceMeshRef.current && videoRef.current) {
                    await faceMeshRef.current.send({ image: videoRef.current });
                }
            },
            width: 640,
            height: 480,
        });
        await camera.start();
        cameraRef.current = camera;
        setModelReady(true);
        setStatus("alert");
    }, [handleResults]);

    const stopDetection = useCallback(() => {
        if (cameraRef.current) cameraRef.current.stop();
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setRunning(false);
        setModelReady(false);
        setStatus("idle");
        setEar(null);
        drowsyFrames.current = 0;
        alertedRef.current = false;
    }, []);

    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
    const earNum = ear ? parseFloat(ear) : null;
    const gaugeWidth = earNum !== null ? Math.min(100, (earNum / 0.4) * 100) : 0;

    function formatDuration(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    }

    return (
        <div className="animate-emergence">
            <h2 className="bf-section-title">👁️ Drowsiness Detection AI</h2>
            <p className="bf-section-subtitle">
                Real-time Eye Aspect Ratio (EAR) analysis via MediaPipe FaceMesh — no server, entirely in-browser.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
                {/* Camera feed */}
                <div className="bf-card bf-card--teal" style={{ padding: "1.25rem", overflow: "hidden" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--bf-slate)", marginBottom: "0.75rem" }}>
                        Live Camera Feed + Eye Landmark Overlay
                    </div>
                    <div className="drowsy-canvas-wrap">
                        <video
                            ref={videoRef}
                            style={{ width: "100%", display: "block", borderRadius: "10px" }}
                            autoPlay
                            muted
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                position: "absolute",
                                top: 0, left: 0,
                                width: "100%",
                                height: "100%",
                                borderRadius: "10px",
                                pointerEvents: "none",
                            }}
                        />
                        {!running && (
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                background: "rgba(28,28,46,0.8)",
                                borderRadius: "10px",
                                color: "#FFF",
                                gap: "0.75rem",
                            }}>
                                <div style={{ fontSize: "3rem", animation: "petal-drift 3s ease-in-out infinite" }}>👁️</div>
                                <div style={{ fontWeight: 700 }}>Camera not active</div>
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Click Start Detection below</div>
                            </div>
                        )}
                    </div>

                    {/* EAR gauge */}
                    {running && (
                        <div style={{ marginTop: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--bf-slate)", marginBottom: "4px" }}>
                                <span>Eye Aspect Ratio (EAR)</span>
                                <span style={{ fontWeight: 700, color: earNum && earNum < EAR_THRESHOLD ? "var(--bf-magenta)" : "var(--bf-emerald)" }}>
                                    {ear ?? "—"}
                                </span>
                            </div>
                            <div style={{ height: "10px", background: "#E8E8E8", borderRadius: "99px", overflow: "hidden" }}>
                                <div
                                    className="drowsy-gauge"
                                    style={{ width: `${gaugeWidth}%` }}
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#AAA", marginTop: "3px" }}>
                                <span>Drowsy (&lt;{EAR_THRESHOLD})</span>
                                <span>Alert (&gt;0.35)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right panel — status + controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Status card */}
                    <div className="bf-card" style={{ padding: "1.5rem", background: cfg.bg, border: `2px solid ${cfg.color}` }}>
                        <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "0.5rem", animation: status === "drowsy" ? "wing-flutter 1.2s ease-in-out infinite" : "petal-drift 3s ease-in-out infinite" }}>
                            {cfg.icon}
                        </div>
                        <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1rem", color: cfg.color }}>
                            {cfg.label}
                        </div>
                        {status === "drowsy" && (
                            <div style={{
                                marginTop: "0.75rem",
                                background: "var(--bf-magenta)",
                                color: "#FFF",
                                padding: "0.6rem 1rem",
                                borderRadius: "8px",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                textAlign: "center",
                                animation: "antennae-pulse 1s ease-in-out infinite",
                            }}>
                                ⏸️ Take a 15-minute break now
                            </div>
                        )}
                    </div>

                    {/* Session stats */}
                    <div className="bf-card" style={{ padding: "1.25rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--bf-slate)", marginBottom: "0.75rem" }}>Session Stats</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {[
                                { label: "Session Duration", value: formatDuration(sessionStats.duration) },
                                { label: "Drowsiness Alerts", value: sessionStats.alerts, alert: sessionStats.alerts > 0 },
                                { label: "EAR Threshold", value: EAR_THRESHOLD },
                                { label: "Detection Frames", value: `${DROWSY_FRAMES} frames` },
                            ].map((row, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                    <span style={{ color: "var(--bf-slate)" }}>{row.label}</span>
                                    <span style={{ fontWeight: 700, color: row.alert ? "var(--bf-magenta)" : "var(--bf-charcoal)" }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bf-card bf-card--teal" style={{ padding: "1.25rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.6rem" }}>How It Works</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--bf-slate)", lineHeight: 1.7 }}>
                            Uses <strong>MediaPipe FaceMesh</strong> (478 landmarks) to detect eye openness.
                            Computes <strong>Eye Aspect Ratio (EAR)</strong> per frame — when eyes droop below{" "}
                            <strong>{EAR_THRESHOLD}</strong> for {DROWSY_FRAMES}+ consecutive frames, a fatigue alert is raised.
                            Runs entirely <strong>in-browser</strong> — no data leaves the device.
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        {!running ? (
                            <button
                                onClick={startDetection}
                                style={{
                                    flex: 1,
                                    background: "linear-gradient(135deg, #1A5F7A, #28A065)",
                                    color: "#FFF",
                                    border: "none",
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    borderRadius: "10px",
                                }}
                            >
                                🎬 Start Detection
                            </button>
                        ) : (
                            <button
                                onClick={stopDetection}
                                style={{
                                    flex: 1,
                                    background: "linear-gradient(135deg, #A8273A, #E8435A)",
                                    color: "#FFF",
                                    border: "none",
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    borderRadius: "10px",
                                }}
                            >
                                ⏹ Stop Detection
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
