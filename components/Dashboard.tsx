
import React from 'react';
import { DailyLog } from '../types';
import { format } from 'date-fns';
// Fix: Import 'it' from the specific locale path to resolve the "no exported member" error.
// Depending on date-fns version, this might need to be a default import or a named import.
// In TypeScript environments, the specific path /it is often more reliable.
import { it } from 'date-fns/locale/it';

interface Props {
  logs: DailyLog[];
}

const Dashboard: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Benvenuto, Chef</h1>
        <p className="text-slate-600">Panoramica della tua gestione HACCP oggi.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Ultime Letture</h2>
          <div className="text-4xl font-bold text-blue-600">{logs.length}</div>
          <p className="text-slate-500 text-sm mt-1">Voci totali nel registro</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Stato Frigoriferi</h2>
          <div className="text-4xl font-bold text-green-600">OK</div>
          <p className="text-slate-500 text-sm mt-1">Tutte le ultime temperature a norma</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Attività Recente</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nessuna registrazione presente.</div>
          ) : (
            logs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div>
                  <div className="font-medium text-slate-900">
                    {format(new Date(log.date), 'EEEE d MMMM yyyy', { locale: it })}
                  </div>
                  <div className="text-sm text-slate-500">
                    {log.readings.length} frigoriferi controllati
                  </div>
                </div>
                <img src={log.signature} alt="Firma" className="h-10 w-20 object-contain border border-slate-100 rounded" />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;