/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';

export default function SignatureCanvas({ setCanvasRef }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (setCanvasRef) {
      setCanvasRef(canvasRef);
    }
    const ctx = canvas.getContext('2d');

    const handleMouseDown = (e) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      setLastX(e.clientX - rect.left);
      setLastY(e.clientY - rect.top);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();

      setLastX(currentX);
      setLastY(currentY);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    // Adding event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); 

    // Cleanup event listeners on component unmount
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDrawing, lastX, lastY, setCanvasRef]); // Added setCanvasRef to dependencies

  return (
   
    <div className='flex justify-center items-center mt-4'> 
  <canvas
    ref={canvasRef}
    width={1200}
    height={400} 
    className="border-2 border-gray-500 bg-white mb-2"
  />
</div>
  );
}
