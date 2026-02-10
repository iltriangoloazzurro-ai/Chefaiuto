
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailyLog, Settings } from '../types';
import { FileText, Download } from 'lucide-react';
// Fix: Import date-fns functions from their specific paths to resolve the "no exported member" error.
import format from 'date-fns/format';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import isWithinInterval from 'date-fns/isWithinInterval';
import { it } from 'date-fns/locale/it';

interface Props {
  logs: DailyLog[];
  settings: Settings;
}

const ReportPage: React.FC<Props> = ({ logs, settings }) => {
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

    // Intestazione Aziendale
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.companyName || 'AZIENDA NON CONFIGURATA', 14, 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(settings.companyAddress || 'Indirizzo non inserito', 14, 20);
    doc.text(`P.IVA: ${settings.companyVat || 'Non inserita'}`, 14, 24);

    // Titolo del Documento
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO CONTROLLO TEMPERATURE (HACCP)', 105, 35, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periodo: ${monthName.toUpperCase()}`, 105, 42, { align: 'center' });

    // Preparazione dati tabella
    const tableData = monthlyLogs.map(log => [
      format(new Date(log.date), 'dd/MM/yyyy\nHH:mm'),
      log.readings.map(r => `${r.fridgeName}: ${r.value}°C`).join('\n'),
      '' // Placeholder per la colonna firma
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Data e Ora', 'Dettaglio Letture', 'Firma Responsabile']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: 'center'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40, minCellHeight: 20 } // Spazio per la firma
      },
      didDrawCell: (data) => {
        // Se siamo nella colonna della firma (indice 2) e nel corpo della tabella
        if (data.section === 'body' && data.column.index === 2) {
          const logIndex = data.row.index;
          const signatureBase64 = monthlyLogs[logIndex].signature;
          
          if (signatureBase64) {
            const x = data.cell.x + 2;
            const y = data.cell.y + 2;
            const width = data.cell.width - 4;
            const height = data.cell.height - 4;
            
            try {
              doc.addImage(signatureBase64, 'JPEG', x, y, width, height);
            } catch (e) {
              console.error("Errore nell'inserimento della firma nel PDF", e);
            }
          }
        }
      }
    });

    // Footer con nota legale
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      'Documento generato digitalmente tramite ChefAiuto HACCP. Le firme apposte certificano la veridicità delle letture.',
      105, 
      finalY + 15, 
      { align: 'center' }
    );

    doc.save(`Registro_Temperature_${monthName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Report Mensile</h1>
        <p className="text-slate-600">Esporta il registro ufficiale con letture, firme e dati aziendali.</p>
      </header>

      {(!settings.companyName || !settings.companyVat) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-start gap-3">
          <div className="bg-amber-100 p-1 rounded-full">!</div>
          <p>
            <strong>Attenzione:</strong> I dati aziendali non sono completi. Vai nelle <strong>Impostazioni</strong> per configurarli affinché il report sia legalmente valido.
          </p>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-6">
        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <FileText className="text-blue-600" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Genera Registro PDF</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Il documento includerà i dati di <strong>{settings.companyName || 'Azienda da definire'}</strong>, orari, temperature e firme.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={generateMonthlyReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg flex items-center justify-center mx-auto space-x-2 transition-transform active:scale-95"
          >
            <Download size={24} />
            <span>Scarica Registro Firmato</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Dati Aziendali</h4>
          <p className="text-slate-500 text-xs">Intestazione automatica con Ragione Sociale e P.IVA.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Layout Ufficiale</h4>
          <p className="text-slate-500 text-xs">Formato ottimizzato per la stampa e l'archiviazione.</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-bold text-slate-800 text-sm mb-1">Pronto per ASL</h4>
          <p className="text-slate-500 text-xs">Conforme alle richieste di ispezione sanitaria.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
