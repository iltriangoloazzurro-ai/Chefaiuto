
import React, { useState } from 'react';
import { Settings, Fridge } from '../types';
import { Save, Plus, Trash2, Cloud, Info, Building2 } from 'lucide-react';

interface Props {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

const SettingsPage: React.FC<Props> = ({ settings, setSettings }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const addFridge = () => {
    const name = prompt('Nome del nuovo frigorifero:');
    if (name) {
      setLocalSettings(prev => ({
        ...prev,
        fridges: [...prev.fridges, { id: Date.now().toString(), name }]
      }));
    }
  };

  const removeFridge = (id: string) => {
    if (confirm('Sei sicuro di voler rimuovere questo frigorifero?')) {
      setLocalSettings(prev => ({
        ...prev,
        fridges: prev.fridges.filter(f => f.id !== id)
      }));
    }
  };

  const handleSave = () => {
    if (localSettings.googleSheetsUrl && !localSettings.googleSheetsUrl.includes('/exec')) {
      alert("Attenzione: l'URL di Google Sheets solitamente termina con '/exec'. Verifica di aver copiato l'URL della 'Web App'.");
    }
    setSettings(localSettings);
    alert('Impostazioni salvate localmente!');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Impostazioni</h1>
        <p className="text-slate-600">Configura i tuoi frigoriferi e i dati aziendali per i report.</p>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="text-blue-600" size={20} /> Dati Aziendali
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Ragione Sociale</label>
            <input
              type="text"
              value={localSettings.companyName || ''}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="es. Ristorante Da Mario S.r.l."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Indirizzo Sede Operativa</label>
            <input
              type="text"
              value={localSettings.companyAddress || ''}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
              placeholder="es. Via Roma 12, 00100 Roma (RM)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">Partita IVA / P.IVA</label>
            <input
              type="text"
              value={localSettings.companyVat || ''}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, companyVat: e.target.value }))}
              placeholder="es. IT01234567890"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Cloud className="text-blue-600" size={20} /> Sincronizzazione Google Sheets
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Web App URL (Google Apps Script)</label>
            <input
              type="text"
              value={localSettings.googleSheetsUrl}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, googleSheetsUrl: e.target.value }))}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
            <info className="text-blue-600 shrink-0" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Verifica l'integrazione:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Usa la funzione <strong>doPost(e)</strong> nello script.</li>
                <li>Pubblica come <strong>Web App</strong>.</li>
                <li>Accesso impostato su <strong>Anyone</strong> (Chiunque).</li>
                <li>Copia l'URL che termina con <code>/exec</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Elenco Frigoriferi</h2>
          <button
            onClick={addFridge}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} /> Aggiungi
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {localSettings.fridges.map(fridge => (
            <div key={fridge.id} className="p-4 flex justify-between items-center">
              <span className="font-medium text-slate-700">{fridge.name}</span>
              <button
                onClick={() => removeFridge(fridge.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {localSettings.fridges.length === 0 && (
            <div className="p-8 text-center text-slate-500">Nessun frigorifero configurato.</div>
          )}
        </div>
      </section>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <Save size={20} /> Salva Impostazioni
      </button>
    </div>
  );
};

export default SettingsPage;
