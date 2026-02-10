
import React, { useState, useRef, useEffect } from 'react';
// Fix: Removed 'PlusMinus' as it is not an exported member of 'lucide-react' and was not being used.
import { Check, Trash2, Send, PenTool, AlertCircle } from 'lucide-react';
import { Fridge, DailyLog, Settings } from '../types';

interface Props {
  fridges: Fridge[];
  onSave: (log: DailyLog) => void;
  settings: Settings;
}

const TemperatureLog: React.FC<Props> = ({ fridges, onSave, settings }) => {
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReadingChange = (id: string, value: string) => {
    setReadings(prev => ({ ...prev, [id]: value }));
  };

  const toggleSign = (id: string) => {
    setReadings(prev => {
      const currentVal = prev[id] || '';
      if (currentVal === '') return { ...prev, [id]: '-' };
      if (currentVal === '-') return { ...prev, [id]: '' };
      
      const numVal = parseFloat(currentVal);
      if (isNaN(numVal)) return prev;
      
      return { ...prev, [id]: (numVal * -1).toString() };
    });
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL('image/jpeg', 0.5));
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
      }
      setSignature(null);
    }
  };

  const handleSubmit = async () => {
    if (!signature) {
      alert('Per favore, firma il registro.');
      return;
    }

    const hasValue = Object.values(readings).some(v => v !== '' && v !== '-');
    if (!hasValue) {
      alert('Inserisci almeno una temperatura valida.');
      return;
    }

    const logReadings = fridges.map(f => ({
      fridgeId: f.id,
      fridgeName: f.name,
      value: readings[f.id] && readings[f.id] !== '-' ? parseFloat(readings[f.id]) : 0
    }));

    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      readings: logReadings,
      signature,
      timestamp: Date.now()
    };

    setStatus('saving');
    setErrorMessage(null);

    try {
      if (settings.googleSheetsUrl && settings.googleSheetsUrl.startsWith('http')) {
        const payload = {
          date: new Date().toLocaleDateString('it-IT'),
          time: new Date().toLocaleTimeString('it-IT'),
          readings: logReadings,
          signature: signature
        };

        await fetch(settings.googleSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload)
        });
      }

      onSave(newLog);
      setStatus('success');
      
      setTimeout(() => {
        setReadings({});
        clearCanvas();
        setStatus('idle');
      }, 2000);

    } catch (err) {
      console.error("Errore invio dati:", err);
      setStatus('error');
      setErrorMessage("Errore di connessione. Verifica l'URL nelle impostazioni.");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Registro Temperature</h1>
        <p className="text-slate-600">Inserisci le letture giornaliere per ogni unità refrigerata.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Unità Refrigerata</th>
              <th className="px-4 md:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Temperatura (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fridges.map(fridge => (
              <tr key={fridge.id}>
                <td className="px-4 md:px-6 py-4 font-medium text-slate-800">{fridge.name}</td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSign(fridge.id)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold h-10 w-10 md:h-11 md:w-11 rounded-lg flex items-center justify-center transition-colors active:scale-90"
                      title="Cambia segno +/-"
                    >
                      <span className="text-lg">±</span>
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={readings[fridge.id] || ''}
                      onChange={(e) => handleReadingChange(fridge.id, e.target.value)}
                      placeholder="0.0"
                      className="w-20 md:w-24 text-right h-10 md:h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <PenTool size={16} /> Firma Responsabile
          </label>
          <button
            onClick={clearCanvas}
            className="text-red-500 text-xs font-bold uppercase hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 size={14} /> Cancella
          </button>
        </div>
        <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-white h-48 touch-none">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-100">
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={status === 'saving' || status === 'success'}
        className={`w-full font-bold py-5 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95 ${
          status === 'success' ? 'bg-green-600' : 
          status === 'error' ? 'bg-red-600' :
          'bg-slate-900 hover:bg-slate-800'
        } text-white`}
      >
        {status === 'saving' ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
        ) : status === 'success' ? (
          <>
            <Check size={24} />
            <span>Dati Inviati al Foglio!</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>Salva e Invia al Cloud</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TemperatureLog;
