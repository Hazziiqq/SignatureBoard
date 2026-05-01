/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const SignatureCanvas = forwardRef(({ onDrawStart, onDrawEnd, strokeColor = 'black', lineWidth = 2 }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      setRedoStack([]);
    },
    undo: () => {
      if (history.length === 0) return;
      const newHistory = [...history];
      const lastStroke = newHistory.pop();
      setRedoStack(prev => [...prev, lastStroke]);
      setHistory(newHistory);
      redraw(newHistory);
    },
    redo: () => {
      if (redoStack.length === 0) return;
      const newRedoStack = [...redoStack];
      const strokeToRestore = newRedoStack.pop();
      setHistory(prev => [...prev, strokeToRestore]);
      setRedoStack(newRedoStack);
      redraw([...history, strokeToRestore]);
    },
    getCanvas: () => canvasRef.current
  }));

  const redraw = (strokeHistory) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    strokeHistory.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke[0].color;
      ctx.lineWidth = stroke[0].width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length - 2; i++) {
        const xc = (stroke[i].x + stroke[i + 1].x) / 2;
        const yc = (stroke[i].y + stroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
      }
      // For the last 2 points
      if (stroke.length > 2) {
        ctx.quadraticCurveTo(
          stroke[stroke.length - 2].x,
          stroke[stroke.length - 2].y,
          stroke[stroke.length - 1].x,
          stroke[stroke.length - 1].y
        );
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    
    const resizeCanvas = () => {
      // Save current content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
      
      // Resize to parent width with high DPI support
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = (rect.width * 0.4) * dpr; // 5:2 Aspect ratio
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.width * 0.4}px`;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      // Restore content if any
      redraw(history);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [history]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setPoints([{ x, y, color: strokeColor, width: lineWidth }]);
    if (onDrawStart) onDrawStart();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw([...history, newPoints]);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHistory(prev => [...prev, points]);
    setRedoStack([]); // Clear redo stack on new stroke
    if (onDrawEnd) onDrawEnd();
  };

  return (
    <div className='w-full max-w-4xl mx-auto touch-none'> 
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="w-full bg-white rounded-lg shadow-inner cursor-crosshair border border-gray-200"
      />
    </div>
  );
});

export default SignatureCanvas;
