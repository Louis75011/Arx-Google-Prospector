import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Store, Settings, Target, Beaker, Copy, Download,
  Save, RotateCcw, ChevronDown, ChevronUp, DownloadCloud,
  CheckCircle2, Mail, Phone, MessageSquare, Globe, Search, Plus, Facebook, Instagram, Linkedin, Map
} from 'lucide-react';

// --- DATA CONSTANTS ---

const BUSINESS_FAMILIES = [
  {
    id: 'f1', title: 'Alimentaire & bouche', icon: '🥖',
    items: ['Boulangerie', 'Boucherie', 'Poissonnerie', 'Primeur', 'Fromagerie', 'Épicerie', 'Traiteur', 'Glacier', 'Cave à vins']
  },
  {
    id: 'f2', title: 'Beauté & bien-être', icon: '💆',
    items: ['Coiffure', 'Barbier', 'Institut de beauté', 'Onglerie', 'Spa & massage', 'Optique', 'Audioprothésiste']
  },
  {
    id: 'f3', title: 'Santé & pharmacie', icon: '🏥',
    items: ['Pharmacie', 'Parapharmacie', 'Dentiste', 'Ostéopathe', 'Kinésithérapeute', 'Médecin généraliste']
  },
  {
    id: 'f4', title: 'Artisanat & services', icon: '🔧',
    items: ['Plombier', 'Électricien', 'Peintre', 'Menuisier', 'Serrurier', 'Cordonnier', 'Pressing', 'Garage auto', 'Carrosserie']
  },
  {
    id: 'f5', title: 'Maison & décoration', icon: '🏠',
    items: ['Fleuriste', 'Bijouterie-horlogerie', 'Animalerie', 'Jardinerie', 'Droguerie-quincaillerie', 'Décoration intérieure']
  },
  {
    id: 'f6', title: 'Restauration & loisirs', icon: '🍽️',
    items: ['Restaurant', 'Pizzeria', 'Brasserie-café', 'Fast food', 'Bar', 'Salle de sport', 'École de danse', 'Auto-école', 'Photographe']
  }
];

const LOCATION_CIRCLES = [
  {
    id: 'c1', title: 'Immédiat (< 5 min)',
    items: ['Marly-le-Roi', 'Mareil-Marly', 'Fourqueux', 'Le Port-Marly', 'Noisy-le-Roi', 'Saint-Nom-la-Bretèche', "L'Étang-la-Ville"]
  },
  {
    id: 'c2', title: 'Proche (5–15 min)',
    items: ['Saint-Germain-en-Laye', 'Louveciennes', 'Chambourcy', 'Aigremont', 'Bougival', 'Croissy-sur-Seine', 'Le Pecq', 'Le Vésinet', 'La Celle-Saint-Cloud', 'Rocquencourt', 'Bailly']
  },
  {
    id: 'c3', title: 'Paris Ouest (15–30 min)',
    items: ['Versailles', 'Le Chesnay', 'Viroflay', 'Chaville', 'Sèvres', 'Saint-Cloud', 'Rueil-Malmaison', 'Chatou', 'Maisons-Laffitte', 'Poissy', 'Sartrouville', 'Nanterre']
  }
];

const INTENT_FILTERS = [
  { id: 'no_website', label: 'Sans site web', icon: '🚫', type: 'filter' },
  { id: 'has_website', label: 'Site web présent', icon: '🔗', type: 'filter' },
  { id: 'rating_under_4', label: 'Note < 4', icon: '⭐', type: 'filter' },
  { id: 'rating_under_3_5', label: 'Note < 3,5', icon: '⭐', type: 'filter' },
  { id: 'few_reviews', label: 'Moins de 10 avis', icon: '📝', type: 'filter' },
  { id: 'no_phone', label: 'Sans téléphone affiché', icon: '📞', type: 'filter' },
  { id: 'no_hours', label: 'Horaires manquants', icon: '🕐', type: 'filter' },
  { id: 'no_photos', label: 'Sans photos', icon: '🖼️', type: 'filter' },
  { id: 'open_weekend', label: 'Ouvert le week-end', icon: '📅', type: 'filter' },
];

const TARGET_COORDS = [
  { id: 'email', label: 'E-mail', icon: <Mail className="w-4 h-4" /> },
  { id: 'phone', label: 'Téléphone', icon: <Phone className="w-4 h-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'website', label: 'Site web', icon: <Globe className="w-4 h-4" /> },
  { id: 'facebook', label: 'Page Facebook', icon: <Facebook className="w-4 h-4" /> },
  { id: 'instagram', label: 'Compte Instagram', icon: <Instagram className="w-4 h-4" /> },
  { id: 'linkedin', label: 'Profil LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
];

// --- HOOKS ---

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(error);
    }
  };

  return [storedValue, setValue] as const;
}

// --- MAIN COMPONENTS ---

export default function App() {
  // State
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [customBusiness, setCustomBusiness] = useState('');
  
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState('');
  const [activeLocationTab, setActiveLocationTab] = useState(LOCATION_CIRCLES[0].id);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<string[]>(['email', 'phone', 'website']);
  
  const [activeOutputTab, setActiveOutputTab] = useState<'maps' | 'phantom' | 'claude'>('maps');
  
  const [openFamilies, setOpenFamilies] = useState<Record<string, boolean>>({
    f1: true, f2: false, f3: false, f4: false, f5: false, f6: false
  });

  // Sessions History State
  const [sessions, setSessions] = useLocalStorage<any[]>('arx_lead_sessions', []);
  const [sessionName, setSessionName] = useState('');

  // Toggles
  const toggleBusiness = (b: string) => {
    setSelectedBusinesses(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };
  
  const toggleLocation = (l: string) => {
    setSelectedLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const selectAllLocationsInTab = (circleId: string) => {
    const circle = LOCATION_CIRCLES.find(c => c.id === circleId);
    if (!circle) return;
    const allInTab = circle.items;
    const allSelected = allInTab.every(i => selectedLocations.includes(i));
    if (allSelected) {
      setSelectedLocations(prev => prev.filter(l => !allInTab.includes(l)));
    } else {
      setSelectedLocations(prev => Array.from(new Set([...prev, ...allInTab])));
    }
  };

  const toggleFilter = (f: string) => setSelectedFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const toggleCoord = (c: string) => setSelectedCoords(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const addCustomBusiness = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      const val = customBusiness.trim().replace(/^./, (str) => str.toUpperCase());
      if (val && !selectedBusinesses.includes(val)) {
        setSelectedBusinesses([...selectedBusinesses, val]);
        setCustomBusiness('');
      }
    }
  };

  const addCustomLocation = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      const val = customLocation.trim().replace(/^./, (str) => str.toUpperCase());
      if (val && !selectedLocations.includes(val)) {
        setSelectedLocations([...selectedLocations, val]);
        setCustomLocation('');
      }
    }
  };

  const toggleFamily = (id: string) => {
    setOpenFamilies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Generation Logic
  const generatedQueries = useMemo(() => {
    const queries: { business: string; location: string }[] = [];
    selectedBusinesses.forEach(b => {
      selectedLocations.forEach(l => {
        queries.push({ business: b, location: l });
      });
    });
    return queries;
  }, [selectedBusinesses, selectedLocations]);

  const estimationText = useMemo(() => {
    const total = generatedQueries.length * 100;
    return new Intl.NumberFormat('fr-FR').format(total);
  }, [generatedQueries]);

  const claudePrompt = useMemo(() => {
    let prompt = `Tu vas analyser ce fichier CSV exporté de Google Maps.\n\nPour chaque ligne :\n`;
    let stepCount = 1;

    // Filters logic
    if (selectedFilters.includes('has_website')) {
      prompt += `${stepCount++}) Vérifie si le site web est accessible et lisible.\n`;
    }
    
    if (selectedCoords.length > 0) {
      const coordsText = selectedCoords.map(c => {
        const item = TARGET_COORDS.find(tc => tc.id === c);
        return item?.label;
      }).join(', ');
      prompt += `${stepCount++}) Trouve et extrais les informations suivantes depuis la fiche ou le site web : ${coordsText}.\n`;
    }

    if (selectedFilters.includes('no_website')) {
      prompt += `${stepCount++}) Écarte les leads ayant déjà un site web renseigné ou accessible.\n`;
    }
    if (selectedFilters.includes('rating_under_4')) {
      prompt += `${stepCount++}) Filtre ou marque les leads ayant une note strictement inférieure à 4 étoiles.\n`;
    }
    if (selectedFilters.includes('no_phone')) {
        prompt += `${stepCount++}) Isole les leads qui n'ont pas de numéro de téléphone affiché.\n`;
    }

    const outputCols = ['name', 'address', 'rating', ...selectedCoords].join(', ');
    prompt += `\nRetourne un CSV tabulaire propre et qualifié avec les colonnes suivantes : ${outputCols}, notes_additionnelles.`;
    
    return prompt;
  }, [selectedFilters, selectedCoords]);


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportAll = () => {
    let content = `=== RÉCAPITULATIF DE RECHERCHE ARX SYSTEMA ===\n\n`;
    content += `URL MAPS GÉNÉRÉES:\n`;
    generatedQueries.forEach(q => {
      content += `https://www.google.com/maps/search/${encodeURIComponent(q.business)}+${encodeURIComponent(q.location)}\n`;
    });
    content += `\n\nREQUÊTES PHANTOMBUSTER:\n`;
    generatedQueries.forEach(q => {
      content += JSON.stringify({
        "Search Query": `${q.business} ${q.location}`,
        "Max Results": 100,
        "Export Fields": "name, address, phone, website, rating, reviewCount, category, hours",
        "Language": "fr"
      }, null, 2) + `\n\n`;
    });
    content += `\nPROMPT CLAUDE:\n${claudePrompt}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arx_leads_export_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSession = () => {
    if (!sessionName) return;
    const newSession = {
      id: Date.now().toString(),
      name: sessionName,
      date: new Date().toISOString(),
      state: { selectedBusinesses, selectedLocations, selectedFilters, selectedCoords }
    };
    setSessions([newSession, ...sessions].slice(0, 10)); // Keep last 10
    setSessionName('');
  };

  const loadSession = (s: any) => {
    setSelectedBusinesses(s.state.selectedBusinesses || []);
    setSelectedLocations(s.state.selectedLocations || []);
    setSelectedFilters(s.state.selectedFilters || []);
    setSelectedCoords(s.state.selectedCoords || []);
  };

  const clearSession = () => {
      setSelectedBusinesses([]);
      setSelectedLocations([]);
      setSelectedFilters([]);
      setSelectedCoords(['email', 'phone', 'website']);
      setCustomBusiness('');
      setCustomLocation('');
  }


  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-[#1a1f2e]/90 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <MapPin className="w-4 h-4 text-white" />
             </div>
             <div>
                <h1 className="text-sm lg:text-base font-bold text-white leading-tight">Google Maps Leads Generator</h1>
                <p className="text-xs text-slate-400">Arx Systema Workflow</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Dynamic Badge */}
             <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-300">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
               {generatedQueries.length} URLs / {selectedLocations.length} Villes / {selectedBusinesses.length} Types
             </div>

             <button onClick={clearSession} className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">
                 <RotateCcw className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Réinitialiser</span>
             </button>
             <button onClick={exportAll} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20">
                <DownloadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter la session</span>
             </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 outline-none" role="main">
        
        {/* LEFT SIDEBAR (Inputs) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECTION 1: ENSEIGNES */}
          <section className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                   <Store className="w-4 h-4 text-indigo-400" />
                   1. Types d'enseignes
                </h2>
                <span className="bg-slate-800 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                   {selectedBusinesses.length} choisis
                </span>
             </div>

             <div className="space-y-3">
                {BUSINESS_FAMILIES.map(family => (
                   <div key={family.id} className="border border-slate-800/60 rounded-lg overflow-hidden bg-[#141824]">
                      <button 
                         onClick={() => toggleFamily(family.id)}
                         className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-slate-800/50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                         <span className="flex items-center gap-2">
                           <span className="text-base">{family.icon}</span> {family.title}
                         </span>
                         {openFamilies[family.id] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>
                      
                      {openFamilies[family.id] && (
                        <div className="p-3 border-t border-slate-800/60 flex flex-wrap gap-2">
                           {family.items.map(item => {
                              const isActive = selectedBusinesses.includes(item);
                              return (
                                <button
                                   key={item}
                                   onClick={() => toggleBusiness(item)}
                                   className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                     isActive 
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                                   }`}
                                >
                                   {item}
                                </button>
                              );
                           })}
                        </div>
                      )}
                   </div>
                ))}

                {/* Custom Business Input */}
                <div className="flex items-center gap-2 mt-2">
                   <input
                     type="text"
                     placeholder="Ajouter une activité (ex: Plaquiste)..."
                     value={customBusiness}
                     onChange={(e) => setCustomBusiness(e.target.value)}
                     onKeyDown={addCustomBusiness}
                     className="flex-1 bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                   />
                   <button 
                      onClick={addCustomBusiness}
                      className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      aria-label="Ajouter champ personnalisé"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>

                {/* Selected Custom Tags (if they don't belong to a predefined list it's good to show them) */}
                {selectedBusinesses.filter(b => !BUSINESS_FAMILIES.some(f => f.items.includes(b))).length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                      {selectedBusinesses.filter(b => !BUSINESS_FAMILIES.some(f => f.items.includes(b))).map(b => (
                         <button key={b} onClick={() => toggleBusiness(b)} className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-indigo-600 text-white shadow-sm flex items-center gap-1 group">
                            {b} <span className="opacity-60 group-hover:opacity-100">×</span>
                         </button>
                      ))}
                   </div>
                )}
             </div>
          </section>

          {/* SECTION 2: VILLES */}
          <section className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                   <Target className="w-4 h-4 text-teal-400" />
                   2. Zone géographique
                </h2>
                <span className="bg-slate-800 text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                   {selectedLocations.length} choisies
                </span>
             </div>

             <div className="flex border-b border-slate-800 mb-3 overflow-x-auto no-scrollbar">
                {LOCATION_CIRCLES.map(circle => (
                   <button
                      key={circle.id}
                      onClick={() => setActiveLocationTab(circle.id)}
                      className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                         activeLocationTab === circle.id 
                           ? 'border-teal-500 text-teal-400' 
                           : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                   >
                      {circle.title}
                   </button>
                ))}
             </div>

             <div className="space-y-3">
                {LOCATION_CIRCLES.map(circle => activeLocationTab === circle.id && (
                   <div key={circle.id} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex flex-wrap gap-2 mb-3">
                         {circle.items.map(loc => {
                            const isActive = selectedLocations.includes(loc);
                            return (
                               <button
                                  key={loc}
                                  onClick={() => toggleLocation(loc)}
                                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                                    isActive 
                                     ? 'bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50' 
                                     : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                                  }`}
                               >
                                  {loc}
                               </button>
                            );
                         })}
                      </div>
                      <button 
                         onClick={() => selectAllLocationsInTab(circle.id)}
                         className="text-xs text-teal-400 font-medium hover:text-teal-300 underline underline-offset-2 decoration-teal-500/30"
                      >
                         Tout sélectionner / désélectionner
                      </button>
                   </div>
                ))}

                 {/* Custom Location Input */}
                 <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
                   <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1.5 lg:top-2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Autre ville (ex: Saint-Cyr)..."
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        onKeyDown={addCustomLocation}
                        className="w-full bg-[#0f1117] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
                      />
                   </div>
                   <button 
                      onClick={addCustomLocation}
                      className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
                {/* Selected Custom Tags */}
                {selectedLocations.filter(l => !LOCATION_CIRCLES.some(c => c.items.includes(l))).length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2">
                      {selectedLocations.filter(l => !LOCATION_CIRCLES.some(c => c.items.includes(l))).map(l => (
                         <button key={l} onClick={() => toggleLocation(l)} className="text-xs px-2.5 py-1.5 rounded-md font-medium bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/50 flex items-center gap-1 group">
                            {l} <span className="opacity-60 group-hover:opacity-100">×</span>
                         </button>
                      ))}
                   </div>
                )}
             </div>
          </section>

          {/* SECTION 3 & 4: FILTRES ET COORDONNÉES */}
          <section className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
             
             {/* Section 3 Options */}
             <div>
                 <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                   <Settings className="w-4 h-4 text-emerald-400" />
                   3. Filtres d'intention (Prompt)
                </h2>
                <div className="flex flex-wrap gap-2">
                   {INTENT_FILTERS.map(filter => {
                       const isActive = selectedFilters.includes(filter.id);
                       return (
                          <button
                            key={filter.id}
                            onClick={() => toggleFilter(filter.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                               isActive 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                  : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                             <span>{filter.icon}</span> {filter.label}
                          </button>
                       );
                   })}
                </div>
             </div>

             <div className="border-t border-slate-800 pt-4">
                 <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                   <Beaker className="w-4 h-4 text-amber-400" />
                   4. Coordonnées à extraire
                </h2>
                <div className="grid grid-cols-2 gap-3">
                   {TARGET_COORDS.map(coord => {
                      const isChecked = selectedCoords.includes(coord.id);
                      return (
                         <label key={coord.id} className="flex items-center gap-2.5 group cursor-pointer">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                               isChecked ? 'bg-amber-500 border-amber-500' : 'bg-[#0f1117] border-slate-600 group-hover:border-slate-400'
                            }`}>
                               {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs text-slate-300 group-hover:text-white flex items-center gap-1.5 font-medium transition-colors">
                               <span className="text-slate-500">{coord.icon}</span> {coord.label}
                            </span>
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={isChecked}
                              onChange={() => toggleCoord(coord.id)} 
                           />
                         </label>
                      )
                   })}
                </div>
             </div>

          </section>

          {/* SESSION SAVE */}
          <section className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white mb-3">Sauvegardes de session</h2>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Nom de la cible (ex: Santé 78)..."
                  className="flex-1 bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={saveSession}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 shrink-0 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  disabled={!sessionName}
                  title="Sauvegarder"
                >
                   <Save className="w-4 h-4" />
                </button>
             </div>
             {sessions.length > 0 && (
                <div className="mt-3">
                   <p className="text-xs text-slate-400 mb-2 font-medium">Historique récent :</p>
                   <div className="space-y-1.5">
                      {sessions.map(s => (
                         <div key={s.id} className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <span className="text-xs text-slate-300 font-medium truncate pr-2" title={s.name}>{s.name}</span>
                            <button 
                              onClick={() => loadSession(s)}
                              className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                            >
                               Charger
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </section>

        </div>


        {/* RIGHT MAIN PANEL (Outputs) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
           
           {/* SECTION 6: WORKFLOW GUIDE */}
           <div className="bg-[#1a1f2e] border border-indigo-500/20 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white mb-4">Le Workflow Arx Systema</h2>
             <div className="flex flex-col md:flex-row gap-3">
                
                <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 relative">
                   <div className="absolute -top-2.5 left-3 bg-[#1a1f2e] text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">STEP 1</div>
                   <p className="text-xs text-slate-300 mt-2">Copier une <b>URL Maps</b> et la coller dans PhantomBuster (Google Maps Search).</p>
                </div>
                
                <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 relative">
                   <div className="absolute -top-2.5 left-3 bg-[#1a1f2e] text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">STEP 2</div>
                   <p className="text-xs text-slate-300 mt-2">Extraire (Max 100) et exporter le CSV. Si site requis, lancer Data Scraping Crawler.</p>
                </div>

                <div className="flex-1 bg-slate-900/50 rounded-lg p-3 border border-slate-800/50 relative">
                   <div className="absolute -top-2.5 left-3 bg-[#1a1f2e] text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">STEP 3</div>
                   <p className="text-xs text-slate-300 mt-2">Coller le CSV dans l'<b>Enrichissement Claude</b> avec le prompt généré ci-dessous.</p>
                </div>

             </div>
           </div>

           {/* SECTION 5: SORTIES */}
           <div className="flex-1 bg-[#1a1f2e] border border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[400px]">
              
              <div className="flex items-center gap-1 border-b border-slate-800 p-2 overflow-x-auto no-scrollbar">
                 <button 
                    onClick={() => setActiveOutputTab('maps')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                       activeOutputTab === 'maps' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                 >
                    URLs Maps ({generatedQueries.length})
                 </button>
                 <button 
                    onClick={() => setActiveOutputTab('phantom')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                       activeOutputTab === 'phantom' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                 >
                    JSON PhantomBuster
                 </button>
                 <button 
                    onClick={() => setActiveOutputTab('claude')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                       activeOutputTab === 'claude' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                 >
                    Prompt Claude
                 </button>
                 <div className="flex-1"></div>
                 {/* Lead estimation Counter */}
                 <div className="text-[11px] text-slate-500 mr-2 flex items-center gap-1 hidden sm:flex">
                    <Target className="w-3 h-3" />
                    ~{estimationText} leads max
                 </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                 
                 {generatedQueries.length === 0 && (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
                     <Map className="w-12 h-12 opacity-20" />
                     <p className="text-sm">Sélectionnez au moins un type d'enseigne et une zone pour générer les sorties.</p>
                   </div>
                 )}

                 {generatedQueries.length > 0 && activeOutputTab === 'maps' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-400">URLs prêtes à être copiées dans <em>Google Maps Search Export</em>.</p>
                          <button 
                            onClick={() => {
                               const allUrls = generatedQueries.map(q => `https://www.google.com/maps/search/${encodeURIComponent(q.business)}+${encodeURIComponent(q.location)}`).join('\n');
                               copyToClipboard(allUrls);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                             <Copy className="w-3 h-3" /> Tout copier
                          </button>
                       </div>
                       <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[500px]">
                          {generatedQueries.map((q, i) => {
                             const urlStr = `https://www.google.com/maps/search/${encodeURIComponent(q.business)}+${encodeURIComponent(q.location)}`;
                             return (
                                <div key={i} className="flex items-center gap-2 bg-[#0f1117] border border-slate-800 p-2.5 rounded-lg group hover:border-slate-600 transition-colors">
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-slate-300 truncate mb-0.5">{q.business} - {q.location}</p>
                                      <p className="text-[10px] text-indigo-400/80 font-mono truncate">{urlStr}</p>
                                   </div>
                                   <button 
                                      onClick={() => copyToClipboard(urlStr)}
                                      className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                      title="Copier"
                                   >
                                      <Copy className="w-4 h-4" />
                                   </button>
                                </div>
                             )
                          })}
                       </div>
                    </div>
                 )}

                 {generatedQueries.length > 0 && activeOutputTab === 'phantom' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-400">Format JSON pour configuration PhantomBuster via API ou bulk.</p>
                       </div>
                       <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
                          {generatedQueries.map((q, i) => {
                             const jsonStr = JSON.stringify({
                                "Search Query": `${q.business} ${q.location}`,
                                "Max Results": 100,
                                "Export Fields": "name, address, phone, website, rating, reviewCount, category, hours",
                                "Language": "fr"
                              }, null, 2);
                             return (
                                <div key={i} className="relative group bg-[#0f1117] border border-slate-800 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
                                   <pre>{jsonStr}</pre>
                                   <button 
                                      onClick={() => copyToClipboard(jsonStr)}
                                      className="absolute top-2 right-2 p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                      title="Copier le bloc"
                                   >
                                      <Copy className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             )
                          })}
                       </div>
                    </div>
                 )}

                 {generatedQueries.length > 0 && activeOutputTab === 'claude' && (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-xs text-slate-400">Prompt optimisé pour le nettoyage et l'enrichissement de votre export CSV.</p>
                          <button 
                            onClick={() => copyToClipboard(claudePrompt)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-md shadow-indigo-600/20"
                          >
                             <Copy className="w-3 h-3" /> Copier le Prompt
                          </button>
                       </div>
                       <div className="bg-[#0f1117] border border-slate-800 rounded-lg p-5 flex-1 relative font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                          {claudePrompt}
                       </div>
                    </div>
                 )}

              </div>
           </div>
           
           <footer className="text-center text-xs text-slate-500 py-4">
              &copy; {new Date().getFullYear()} Arx Systema. Outil interne de génération de configurations de prospection logicielle.
           </footer>

        </div>
      </main>
    </div>
  );
}

