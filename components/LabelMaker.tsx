
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Printer, Calendar, Tag, List } from 'lucide-react';
import { format, addDays } from 'date-fns';

const LabelMaker: React.FC = () => {
  const [preparation, setPreparation] = useState('');
  const [ingredientsList, setIngredientsList] = useState('');
  const [prepDate, setPrepDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expiryDate, setExpiryDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));

  const generatePDF = () => {
    // 60x40mm PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [60, 40]
    });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('ChefAiuto HACCP', 30, 6, { align: 'center' });
    
    doc.setLineWidth(0.2);
    doc.line(5, 8, 55, 8);

    // Preparazione
    doc.setFontSize(8);
    doc.text('PREPARAZIONE:', 5, 12);
    doc.setFontSize(12);
    doc.text(preparation.toUpperCase() || 'N/A', 5, 17);

    // Lista Ingredienti (Font piccolo per far stare tutto)
    doc.setFontSize(7);
    doc.text('INGREDIENTI:', 5, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    
    // Split text for ingredients list to wrap
    const splitIngredients = doc.splitTextToSize(ingredientsList || 'Nessun ingrediente inserito', 50);
    doc.text(splitIngredients, 5, 25);

    // Footer con Date
    doc.setLineWidth(0.1);
    doc.line(5, 33, 55, 33);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('PROD:', 5, 37);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(prepDate), 'dd/MM/yyyy'), 13, 37);

    doc.setFont('helvetica', 'bold');
    doc.text('SCAD:', 32, 37);
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text(format(new Date(expiryDate), 'dd/MM/yyyy'), 41, 37);

    doc.save(`etichetta_${preparation.replace(/\s+/g, '_') || 'preparazione'}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Etichette</h1>
        <p className="text-slate-600">Genera etichette professionali 60x40mm con lista ingredienti.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); generatePDF(); }}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Preparazione</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={preparation}
                onChange={(e) => setPreparation(e.target.value)}
                placeholder="es. Ragù alla Bolognese"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Lista Ingredienti e Allergeni</label>
            <div className="relative">
              <List className="absolute left-3 top-4 text-slate-400" size={18} />
              <textarea
                value={ingredientsList}
                onChange={(e) => setIngredientsList(e.target.value)}
                placeholder="es. Carne bovina, pomodoro, sedano, carote, cipolle, vino rosso, sale, pepe."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] text-sm"
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
        <p className="text-slate-500 text-sm mb-4 uppercase font-bold tracking-widest">Anteprima Etichetta (60x40mm)</p>
        <div className="bg-white w-[300px] h-[200px] shadow-md border rounded-md p-3 flex flex-col relative overflow-hidden">
          <div className="text-center border-b border-slate-100 pb-1 mb-2 text-[10px] font-bold text-blue-800 uppercase tracking-tight">
            ChefAiuto HACCP
          </div>
          <div className="mb-1">
            <div className="text-[8px] text-slate-400 font-bold uppercase">Preparazione:</div>
            <div className="text-sm font-black text-slate-900 leading-tight truncate">
              {preparation || 'ESEMPIO PRODOTTO'}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[8px] text-slate-400 font-bold uppercase">Ingredienti:</div>
            <div className="text-[9px] text-slate-600 leading-none line-clamp-4 italic">
              {ingredientsList || 'Inserisci qui la lista degli ingredienti...'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-end text-[10px] font-mono">
            <div>
              <span className="font-bold">PROD:</span> {format(new Date(prepDate), 'dd/MM/yy')}
            </div>
            <div className="text-red-600 font-bold">
              <span>SCAD:</span> {format(new Date(expiryDate), 'dd/MM/yy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelMaker;
