  import { useState, useRef } from "react"
import jsPDF from 'jspdf'
import SignatureCanvas from "./Canvas/SignatureCanvas";

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Navy', value: '#000080' },
  { name: 'Red', value: '#cc0000' },
  { name: 'Green', value: '#006600' },
];

function App() {
  const canvasRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [format, setFormat] = useState('png');
  const [isEmpty, setIsEmpty] = useState(true);

  const handleDownload = () => {
    const canvas = canvasRef.current.getCanvas();
    if (!canvas) return;

    if (format === 'png' || format === 'jpg') {
      const link = document.createElement('a');
      link.download = `signature.${format}`;
      
      // For JPG, we need a white background
      if (format === 'jpg') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        link.href = tempCanvas.toDataURL('image/jpeg', 1.0);
      } else {
        link.href = canvas.toDataURL('image/png');
      }
      link.click();
    } else if (format === 'pdf') {
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('signature.pdf');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-indigo-100">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10" />
        <img 
          src="/background.jfif" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 scale-105"
        />
      </div>

      <main className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] overflow-hidden">
        {/* Header */}
        <header className="p-8 pb-4 text-center">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase rounded-full mb-4">
            Digital Signature Tool
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Leave Your <span className="text-indigo-600">Mark</span>
          </h1>
          <p className="mt-2 text-slate-500 font-medium">Create and download professional signatures instantly.</p>
        </header>

        {/* Canvas Section */}
        <div className="px-8 py-4">
          <div className="relative group">
            <SignatureCanvas 
              ref={canvasRef} 
              strokeColor={strokeColor}
              lineWidth={lineWidth}
              onDrawStart={() => setIsEmpty(false)}
            />
            
            {/* View indicators */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => canvasRef.current.undo()}
                className="p-2 bg-white/90 shadow-sm border border-slate-200 rounded-lg hover:bg-white transition-colors"
                title="Undo"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
              </button>
              <button 
                onClick={() => canvasRef.current.redo()}
                className="p-2 bg-white/90 shadow-sm border border-slate-200 rounded-lg hover:bg-white transition-colors"
                title="Redo"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Appearance */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Appearance</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setStrokeColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${strokeColor === c.value ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Brush Weight</span>
                  <span className="text-xs font-bold text-indigo-600">{lineWidth}px</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1"
                  value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => { canvasRef.current.clear(); setIsEmpty(true); }}
                  className="flex-1 px-4 py-2.5 bg-white border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm text-sm"
                >
                  Clear All
                </button>
                <div className="flex-1 flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <select 
                    value={format} 
                    onChange={(e) => setFormat(e.target.value)}
                    className="flex-1 bg-transparent px-3 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer text-center"
                  >
                    <option value="png">PNG</option>
                    <option value="jpg">JPG</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleDownload}
                disabled={isEmpty}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 ${isEmpty ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Signature
              </button>
            </div>

            {/* Info Section (Optional/Hidden on small) */}
            <div className="hidden lg:block space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Help</label>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed italic">
                Pro Tip: Use a stylus on a tablet for the most natural experience. Undo (⌘Z) and Reset are available anytime.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-8 text-slate-400 text-xs font-semibold uppercase tracking-widest">
        Handcrafted for Excellence
      </footer>
    </div>
  )
}

export default App
