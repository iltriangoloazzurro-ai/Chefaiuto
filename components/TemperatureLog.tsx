
import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Send, PenTool } from 'lucide-react';
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

  const handleReadingChange = (id: string, value: string) => {
    setReadings(prev => ({ ...prev, [id]: value }));
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
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

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.beginPath();
      setSignature(null);
    }
  };

  const handleSubmit = async () => {
    if (!signature) {
      alert('Per favore, firma il registro.');
      return;
    }

    const logReadings = fridges.map(f => ({
      fridgeId: f.id,
      fridgeName: f.name,
      value: parseFloat(readings[f.id] || '0')
    }));

    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      readings: logReadings,
      signature,
      timestamp: Date.now()
    };

    setStatus('saving');

    try {
      if (settings.googleSheetsUrl) {
        // Prepare data for Google Sheets
        const payload = {
          date: new Date().toLocaleDateString('it-IT'),
          readings: logReadings,
          signature: signature
        };

        // We use fetch with no-cors if it's a simple Apps Script redirect, 
        // but for structured response we normally need a proxy or proper CORS setup in Apps Script.
        await fetch(settings.googleSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
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
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Registro Temperature</h1>
        <p className="text-slate-600">Inserisci le letture giornaliere per ogni unità refrigerata.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Unità Refrigerata</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Temperatura (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fridges.map(fridge => (
              <tr key={fridge.id}>
                <td className="px-6 py-4 font-medium text-slate-800">{fridge.name}</td>
                <td className="px-6 py-4 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={readings[fridge.id] || ''}
                    onChange={(e) => handleReadingChange(fridge.id, e.target.value)}
                    placeholder="0.0"
                    className="w-24 text-right px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
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
        <div className="relative border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-48 touch-none">
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
        <p className="text-xs text-slate-400 text-center">Firma nell'area sopra per confermare le letture</p>
      </div>

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
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : status === 'success' ? (
          <>
            <Check size={24} />
            <span>Registrato con Successo!</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>Salva Registro e Invia</span>
          </>
        )}
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-center text-sm font-semibold">Errore durante il salvataggio. Riprova.</p>
      )}
    </div>
  );
};

export default TemperatureLog;
