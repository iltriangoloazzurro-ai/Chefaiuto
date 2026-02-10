
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog } from '../types';
import { FileText, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';

interface Props {
  logs: DailyLog[];
}

const ReportPage: React.FC<Props> = ({ logs }) => {
  const generateMonthlyReport = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthlyLogs = logs.filter(log => 
      isWithinInterval(new Date(log.date), { start, end })
    );

    if (monthlyLogs.length === 0) {
      alert("Nessun dato trovato per il mese corrente.");
      return;
    }

    const doc = new jsPDF();
    const monthName = format(now, 'MMMM yyyy', { locale: it });

    doc.setFontSize(22);
    doc.text('Registro HACCP Temperature', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Report Mensile: ${monthName}`, 105, 30, { align: 'center' });

    const tableData = monthlyLogs.map(log => [
      format(new Date(log.date), 'dd/MM/yyyy HH:mm'),
      log.readings.map(r => `${r.fridgeName}: ${r.value}°C`).join('\n')
    ]);

    // Use autoTable directly as a function instead of as a method on the jsPDF instance
    // to avoid module augmentation issues with 'jspdf'.
    autoTable(doc, {
      startY: 40,
      head: [['Data e Ora', 'Letture']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // Add signatures at the bottom or on a new page if needed
    doc.addPage();
    doc.text('Firme Responsabili', 105, 20, { align: 'center' });

    let currentY = 30;
    monthlyLogs.forEach((log, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(10);
      doc.text(`Data: ${format(new Date(log.date), 'dd/MM/yyyy')}`, 20, currentY);
      doc.addImage(log.signature, 'PNG', 120, currentY - 5, 40, 20);
      doc.line(20, currentY + 16, 190, currentY + 16);
      currentY += 25;
    });

    doc.save(`Report_HACCP_${monthName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Report Mensile</h1>
        <p className="text-slate-600">Esporta i dati del mese corrente per le autorità di controllo.</p>
      </header>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-6">
        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <FileText className="text-blue-600" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Genera Documento PDF</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Verrà creato un documento completo di tutte le letture effettuate questo mese, inclusi orari e firme digitali dei responsabili.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={generateMonthlyReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg flex items-center justify-center mx-auto space-x-2 transition-transform active:scale-95"
          >
            <Download size={24} />
            <span>Scarica Report Mensile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Dati nel Cloud</h4>
          <p className="text-slate-500 text-xs">Sincronizzati automaticamente con Google Sheets</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Formato A norma</h4>
          <p className="text-slate-500 text-xs">PDF generato secondo le direttive HACCP vigenti</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Conservazione</h4>
          <p className="text-slate-500 text-xs">Si consiglia di conservare i PDF per almeno 12 mesi</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
