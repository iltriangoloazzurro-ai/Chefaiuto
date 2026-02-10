
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Printer, Calendar, Tag } from 'lucide-react';
import { format, addDays } from 'date-fns';

const LabelMaker: React.FC = () => {
  const [ingredient, setIngredient] = useState('');
  const [prepDate, setPrepDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));

  const generatePDF = () => {
    // 60x40mm PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [60, 40]
    });

    // Styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ChefAiuto HACCP', 30, 8, { align: 'center' });
    
    doc.setLineWidth(0.3);
    doc.line(5, 10, 55, 10);

    doc.setFontSize(10);
    doc.text('Ingrediente:', 5, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(ingredient || 'N/A', 5, 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Prep:', 5, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(prepDate), 'dd/MM/yyyy'), 15, 32);

    doc.setFont('helvetica', 'bold');
    doc.text('Scad:', 32, 32);
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text(format(new Date(expiryDate), 'dd/MM/yyyy'), 42, 32);

    doc.save(`etichetta_${ingredient.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Etichette</h1>
        <p className="text-slate-600">Genera etichette professionali 60x40mm per i tuoi ingredienti.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generatePDF(); }}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ingrediente</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="es. Pomodoro San Marzano"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data Preparazione</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={prepDate}
                  onChange={(e) => setPrepDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data Scadenza</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <Printer size={20} />
            <span>Genera PDF Etichetta</span>
          </button>
        </form>
      </div>

      <div className="bg-slate-100 p-8 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center">
        <p className="text-slate-500 text-sm mb-4 uppercase font-bold tracking-widest">Anteprima Etichetta</p>
        <div className="bg-white w-[300px] h-[200px] shadow-md border rounded p-4 flex flex-col justify-between">
          <div className="text-center border-b pb-2 mb-2 font-bold text-blue-800">ChefAiuto HACCP</div>
          <div className="flex-1 flex flex-col justify-center">
             <div className="text-xs text-slate-400">Ingrediente</div>
             <div className="text-2xl font-bold truncate">{ingredient || 'Esempio'}</div>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <div>PREP: {format(new Date(prepDate), 'dd/MM/yy')}</div>
            <div className="text-red-600 font-bold">SCAD: {format(new Date(expiryDate), 'dd/MM/yy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelMaker;
