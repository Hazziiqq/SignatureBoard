  /* eslint-disable no-unused-vars */
import { useState } from "react"
import { SignProvider } from "./SignContext/SignContext"
import jsPDF from 'jspdf'
import SignatureCanvas from "./Canvas/SignatureCanvas";


function App() {
  const [reset, setReset] = useState('');
  const [download, setDownload] = useState('');
  const [canvasRef, setCanvasRef] = useState(null)
  const [format, setFormat] = useState('jpg')

  const signDownload = (canvasRef, format) =>{
    const canvas = canvasRef.current;

  if (format === 'png' || format === 'jpg') {
    const link = document.createElement('a');
    link.download = `signature.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  } else if (format === 'pdf') {
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10);
    pdf.save('signature.pdf');
  }
  }

  const signReset = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setReset('')
    setDownload('')
  }
  
  const formatHandling = (format) =>{
   setFormat(format)
   
  }

  const handleDownload = () => {
    signDownload(canvasRef,format)
  }

  return (
    <SignProvider className='bg-white' value={{ signDownload, signReset }}>
      <div className="flex flex-col items-center min-h-screen bg-no-repeat bg-center bg-cover bg-white" 
     style={{ backgroundImage: "url('https://i.ebayimg.com/00/s/MTEzMVgxNjAw/z/MPIAAOSw7a9c0VU7/$_57.JPG?set_id=8800005007')" }}>
    
    <div className="bg-gray-400 text-white font-bold rounded-xl text-center p-4 w-full max-w-lg">YOUR SIGNATURE MATTERS</div>
    
    <SignatureCanvas setCanvasRef={setCanvasRef} />
    
    <div className="flex flex-wrap justify-between items-center w-full mt-4 px-4 max-w-lg">
      <div className="flex items-center flex-wrap"> 
        {/* Download Button */}
        <button 
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2 w-full sm:w-auto">
          Download
        </button>

        {/* Format Selection Dropdown */}
        <select onChange={(e) => formatHandling(e.target.value)} value={format} className="ml-0 sm:ml-4 mt-2 sm:mt-0 rounded-sm w-full sm:w-auto">
          <option value="pdf">PDF</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
      </div>

      {/* Reset Button */}
      <button 
        onClick={signReset}
        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 mb-2 w-full sm:w-auto">
        Reset
      </button>
    </div>
</div>

    </SignProvider>
  


  )
}

export default App
