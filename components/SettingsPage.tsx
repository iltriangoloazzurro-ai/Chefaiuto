
import React, { useState } from 'react';
import { Settings, Fridge } from '../types';
import { Save, Plus, Trash2, Cloud } from 'lucide-react';

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
    setSettings(localSettings);
    alert('Impostazioni salvate con successo!');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Impostazioni</h1>
        <p className="text-slate-600">Configura i tuoi frigoriferi e la sincronizzazione cloud.</p>
      </header>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Cloud className="text-blue-600" size={20} /> Sincronizzazione Google Sheets
        </h2>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Web App URL (Google Apps Script)</label>
          <input
            type="text"
            value={localSettings.googleSheetsUrl}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, googleSheetsUrl: e.target.value }))}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <p className="text-xs text-slate-400">Inserisci l'URL della Web App fornito dal tuo script per salvare i dati nel cloud.</p>
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
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700"
      >
        <Save size={20} /> Salva Tutte le Impostazioni
      </button>

      <div className="bg-slate-900 text-white p-6 rounded-xl">
        <h3 className="font-bold mb-2">Nota per Google Sheets</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Per far funzionare la persistenza, devi creare un Google Apps Script con una funzione <code>doPost(e)</code> che estragga i dati dal corpo della richiesta e li aggiunga a un foglio di lavoro. Assicurati di pubblicare lo script come Web App con accesso "Anyone".
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
