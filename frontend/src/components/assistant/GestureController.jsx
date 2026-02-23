import React, { useEffect, useRef, useState } from 'react';
// MediaPipe imports moved to dynamic import inside useEffect
import { useAssistant } from '../../context/AssistantContext';
import { ASSISTANT_ACTIONS, dispatchAssistantAction } from '../../services/assistantActions';
import { useNavigate } from 'react-router-dom';

const GestureController = () => {
    const { isGestureModeEnabled, updatePermission, openAssistant, isAssistantOpen } = useAssistant();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const handsRef = useRef(null);
    const cameraRef = useRef(null);

    // State for Virtual Cursor
    const cursorRef = useRef(null);
    const [cursorActive, setCursorActive] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    // Refs for gesture logic
    const lastActionTimeRef = useRef(null);
    const palmHoldStartRef = useRef(0);
    const swipeStartRef = useRef(null);

    // Constants
    const COOLDOWN = 800; // ms
    const CLICK_COOLDOWN = 500;
    const PALM_HOLD_DURATION = 2000;
    const SWIPE_THRESHOLD = 0.15; // Normalized distance

    useEffect(() => {
        let isMounted = true;
        let camera = null;
        let hands = null;

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.crossOrigin = "anonymous";
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        const loadMediaPipe = async () => {
            if (!isGestureModeEnabled) return;

            try {
                // Dynamically load official MediaPipe CDN scripts to bypass Vite CommonJS bugs
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

                if (!isMounted) return;

                const Hands = window.Hands;
                const Camera = window.Camera;

                if (!Hands || !Camera) {
                    throw new Error("MediaPipe libraries failed to attach to the window object.");
                }

                const onResults = (results) => {
                    if (!isMounted) return;
                    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
                        setCursorActive(false);
                        return;
                    }

                    const landmarks = results.multiHandLandmarks[0];
                    detectGesture(landmarks);
                };

                hands = new Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                hands.onResults(onResults);

                if (videoRef.current) {
                    camera = new Camera(videoRef.current, {
                        onFrame: async () => {
                            if (hands && isMounted) await hands.send({ image: videoRef.current });
                        },
                        width: 640,
                        height: 480
                    });

                    // Assign refs before starting so cleanup can catch them
                    handsRef.current = hands;
                    cameraRef.current = camera;

                    await camera.start();
                    if (isMounted) updatePermission('camera', 'granted');
                }
            } catch (error) {
                console.error("Failed to load MediaPipe via CDN:", error);
                if (isMounted) updatePermission('camera', 'denied');
            }
        };

        if (isGestureModeEnabled) {
            loadMediaPipe();
        }

        return () => {
            isMounted = false;
            // Cleanup refs safely
            if (cameraRef.current) {
                // Wrap in try-catch just in case the library throws on stop()
                try { cameraRef.current.stop(); } catch (e) { console.warn("Error stopping camera:", e); }
                cameraRef.current = null;
            }
            if (handsRef.current) {
                try { handsRef.current.close(); } catch (e) { console.warn("Error closing hands:", e); }
                handsRef.current = null;
            }
            setCursorActive(false);
        };
    }, [isGestureModeEnabled]);


    const detectGesture = (landmarks) => {
        const now = Date.now();

        // --- 1. VIRTUAL CURSOR (Index Finger Tip) ---
        // Landmark 8: Index Tip
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Map normalized coordinates to screen
        // Mirror X because it's a webcam
        const x = (1 - indexTip.x) * window.innerWidth;
        const y = indexTip.y * window.innerHeight;

        // Update Cursor UI directly for performance
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
            setCursorActive(true);
        }

        // --- 2. PINCH TO CLICK ---
        // Distance between Thumb(4) and Index(8)
        const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

        if (pinchDist < 0.05) { // Threshold for pinch
            if (!isClicking && (now - lastActionTimeRef.current > CLICK_COOLDOWN)) {
                setIsClicking(true);
                console.log("Action: Click");

                // Perform Click
                const element = document.elementFromPoint(x, y);
                if (element) {
                    // Enhanced Click Logic: Find the "real" interactive target
                    // elementFromPoint often returns a span/div inside a button/label.
                    // We want the interactive parent.
                    const interactiveElement = element.closest('button, a, input, label, select, [role="button"]');
                    const target = interactiveElement || element;

                    target.focus();

                    const eventOptions = {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    };

                    target.dispatchEvent(new MouseEvent('mousedown', eventOptions));
                    target.dispatchEvent(new MouseEvent('mouseup', eventOptions));
                    target.dispatchEvent(new MouseEvent('click', eventOptions));

                    // If we clicked a label that wraps an input, React sometimes needs extra help?
                    // Usually label.click() is enough, but let's be safe.
                    if (target.tagName === 'LABEL') {
                        const input = target.querySelector('input');
                        if (input) {
                            input.click();
                        } else if (target.htmlFor) {
                            const htmlForInput = document.getElementById(target.htmlFor);
                            if (htmlForInput) htmlForInput.click();
                        }
                    }
                }
                lastActionTimeRef.current = now;
            }
        } else {
            setIsClicking(false);
        }

        // --- GESTURE RECOGNITION (Requires Cooldown) ---
        // We only check these if we aren't clicking/dragging

        // Helper: Check finger extension
        // Tips: 8, 12, 16, 20. PIPs: 6, 10, 14, 18.
        const isFingerUp = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;

        const indexUp = isFingerUp(8, 6);
        const middleUp = isFingerUp(12, 10);
        const ringUp = isFingerUp(16, 14);
        const pinkyUp = isFingerUp(20, 18);
        const thumbUp = landmarks[4].x < landmarks[3].x; // Simple check for right hand

        const fingersUpCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

        // --- Helper: Find Scrollable Parent ---
        const getScrollParent = (node) => {
            if (node == null) return window;
            if (node === document.body || node === document.documentElement) return window;

            const regex = /(auto|scroll)/;
            const style = getComputedStyle(node);

            if (regex.test(style.overflow + style.overflowY + style.overflowX)) {
                return node;
            }
            return getScrollParent(node.parentNode);
        };

        const performScroll = (dy) => {
            const element = document.elementFromPoint(x, y);
            const scrollable = getScrollParent(element);

            if (scrollable === window) {
                window.scrollBy({ top: dy, behavior: 'auto' });
            } else {
                scrollable.scrollBy({ top: dy, behavior: 'auto' });
            }
        };

        // --- 3. SCROLLING (2 Fingers Up / 3 Fingers Down) ---
        // 2 Fingers (Index + Middle) -> Scroll Up
        if (indexUp && middleUp && !ringUp && !pinkyUp) {
            performScroll(-40); // Scroll Up
        }

        // 3 Fingers (Index + Middle + Ring) -> Scroll Down
        if (indexUp && middleUp && ringUp && !pinkyUp) {
            performScroll(40); // Scroll Down
        }

        // --- 4. FIST SWIPE (Navigation) ---
        if (fingersUpCount === 0) { // Fist
            const wristX = landmarks[0].x;

            if (!swipeStartRef.current) {
                swipeStartRef.current = { x: wristX, time: now };
            } else {
                const deltaX = wristX - swipeStartRef.current.x;
                const dt = now - swipeStartRef.current.time;

                if (dt < 500 && Math.abs(deltaX) > SWIPE_THRESHOLD && (now - lastActionTimeRef.current > COOLDOWN)) {
                    if (deltaX < -0.15) {
                        // Image X decreased (Moved Left in Mirror -> User Moved Right)
                        // "Fist swipe right logic" - User moves hand to Right
                        console.log("Swipe: Next/Forward");
                        dispatchAssistantAction(ASSISTANT_ACTIONS.NAVIGATE_CART, navigate); // Using Cart as Forward/Next
                        lastActionTimeRef.current = now;
                    } else if (deltaX > 0.15) {
                        // Image X increased (Moved Right in Mirror -> User Moved Left)
                        console.log("Swipe: Back");
                        dispatchAssistantAction(ASSISTANT_ACTIONS.NAVIGATE_BACK, navigate);
                        lastActionTimeRef.current = now;
                    }
                }
            }
        }
        else {
            swipeStartRef.current = null;
        }
    };

    if (!isGestureModeEnabled) return null;

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-50">
                <video
                    ref={videoRef}
                    className="w-32 h-24 rounded-lg border border-white/20 hidden"
                    playsInline
                />
            </div>

            {/* Virtual Cursor */}
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 w-6 h-6 rounded-full border-2 z-[9999] pointer-events-none transition-transform duration-75 ease-out
                    ${cursorActive ? 'opacity-100' : 'opacity-0'}
                    ${isClicking ? 'bg-vaquah-orange border-vaquah-orange scale-90' : 'bg-transparent border-vaquah-blue'}
                `}
                style={{
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
            >
                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
        </>
    );
};

export default GestureController;
