import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/Button';

interface SignatureCanvasProps {
    onSave: (signature: string) => void;
    savedSignature?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave, savedSignature }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && savedSignature) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx?.drawImage(img, 0, 0);
            };
            img.src = savedSignature;
        }
    }, [savedSignature]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            ctx?.beginPath();
            ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            ctx!.lineWidth = 2;
            ctx!.lineCap = 'round';
            ctx!.strokeStyle = '#000';
            ctx?.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx?.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            onSave(dataUrl);
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4">
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-200 rounded cursor-crosshair bg-white"
            />
            <div className="flex gap-2 mt-3">
                <Button variant="secondary" onClick={clearCanvas}>
                    Clear
                </Button>
                <Button variant="primary" onClick={saveSignature}>
                    Save Signature
                </Button>
            </div>
        </div>
    );
};
