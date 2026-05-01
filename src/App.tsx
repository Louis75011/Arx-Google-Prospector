import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Store, Settings, Target, Beaker, Copy, Download,
  Save, RotateCcw, ChevronDown, ChevronUp, DownloadCloud,
  CheckCircle2, Mail, Phone, MessageSquare, Globe, Search, Plus, Facebook, Instagram, Linkedin, Map, AlignLeft, ExternalLink, Moon, Sun
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
    items: ["L'Étang-la-Ville", "Le Port-Marly", "Louveciennes", "Mareil-Marly", "Marly-le-Roi", "Fourqueux", "Bailly", "Saint-Germain-en-Laye", "Bougival", "Le Pecq"]
  },
  {
    id: 'c2', title: 'Proche (5–15 min)',
    items: ["Croissy-sur-Seine", "Le Vésinet", "La Celle-Saint-Cloud", "Saint-Nom-la-Bretèche", "Chambourcy", "Aigremont", "Montesson", "Chatou", "Fontenay-le-Fleury", "Villepreux", "Vaucresson", "Rocquencourt", "Le Chesnay-Rocquencourt"]
  },
  {
    id: 'c3', title: 'Inter. (15–25 min)',
    items: ["Versailles", "Saint-Cyr-l'École", "Vélizy-Villacoublay", "Guyancourt", "Buc", "Montigny-le-Bretonneux", "Trappes", "Villennes-sur-Seine", "Achères", "Orgeval", "Carrières-sous-Poissy", "Maisons-Laffitte", "Sartrouville", "Houilles", "Carrières-sur-Seine", "Garches", "Marnes-la-Coquette", "Ville-d'Avray", "Suresnes", "Chaville", "Sèvres"]
  },
  {
    id: 'c4', title: 'Ouest & 92 (25–30 min)',
    items: ["Rueil-Malmaison", "Nanterre", "Bezons", "Courbevoie", "Puteaux", "Boulogne-Billancourt", "Colombes", "Argenteuil", "La Défense"]
  }
];

const INTENT_FILTERS = [
  { id: 'no_website', label: 'Sans site web', icon: '🚫' },
  { id: 'has_website', label: 'Site web présent', icon: '🔗' },
  { id: 'rating_under_4', label: 'Note < 4', icon: '⭐' },
  { id: 'rating_under_3_5', label: 'Note < 3,5', icon: '⭐' },
  { id: 'few_reviews', label: '< 10 avis', icon: '📝' },
  { id: 'no_phone', label: 'Sans téléphone', icon: '📞' },
  { id: 'no_hours', label: 'Horaires manquants', icon: '🕐' },
  { id: 'no_photos', label: 'Sans photos', icon: '🖼️' },
  { id: 'open_weekend', label: 'Ouvert week-end', icon: '📅' },
];

const TARGET_COORDS = [
  { id: 'email', label: 'E-mail', icon: <Mail className="w-3 h-3" /> },
  { id: 'phone', label: 'Téléphone', icon: <Phone className="w-3 h-3" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3" /> },
  { id: 'website', label: 'Site web', icon: <Globe className="w-3 h-3" /> },
  { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-3 h-3" /> },
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-3 h-3" /> },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-3 h-3" /> },
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

// --- MAIN COMPONENT ---

export default function App() {
  // Theme state: defaults to light mode (false)
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('arx_theme_dark', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Copy State for Animation
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
        setCopiedUrl(id);
        setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

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

  // Calculate totals
  const totalQueries = generatedQueries.length;
  
  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-white dark:bg-[#0f1117] text-slate-800 dark:text-gray-300 font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Focus Mode */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[300px] bg-slate-50 border-r border-slate-200 dark:bg-[#161b2a] dark:border-gray-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="h-[60px] p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-slate-100 dark:bg-[#121622]">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center">
               <MapPin className="w-3.5 h-3.5 text-white" />
             </div>
             <div>
                <h1 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">Leads Gen</h1>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono tracking-tight uppercase">Arx Systema</p>
             </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          
          {/* SECTION 1: ENSEIGNES (COMPACT) */}
          <section>
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                   Enseignes ({selectedBusinesses.length})
                </h2>
             </div>
             <div className="space-y-1.5">
                {BUSINESS_FAMILIES.map(family => (
                   <div key={family.id} className="bg-white dark:bg-[#121622] rounded border border-slate-200 dark:border-gray-800/80 overflow-hidden">
                      <button 
                         onClick={() => toggleFamily(family.id)}
                         className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-gray-800/30 transition-colors text-left focus:outline-none"
                      >
                         <span className="flex items-center gap-1.5 truncate">
                           <span className="text-xs">{family.icon}</span> <span className="truncate">{family.title}</span>
                         </span>
                         {openFamilies[family.id] ? <ChevronUp className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />}
                      </button>
                      
                      {openFamilies[family.id] && (
                        <div className="px-2 pb-2 pt-1 border-t border-slate-200 dark:border-gray-800/80 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-[#0f1117]/50">
                           {family.items.map(item => {
                              const isActive = selectedBusinesses.includes(item);
                              return (
                                <button
                                   key={item}
                                   onClick={() => toggleBusiness(item)}
                                   className={`text-[10px] px-1.5 py-0.5 rounded transition-all focus:outline-none ${
                                     isActive 
                                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30' 
                                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-gray-800/40 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:border-gray-700/50'
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
                <div className="flex items-center gap-1 mt-1">
                   <input
                     type="text"
                     placeholder="Ajouter activité..."
                     value={customBusiness}
                     onChange={(e) => setCustomBusiness(e.target.value)}
                     onKeyDown={addCustomBusiness}
                     className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:bg-[#121622] dark:border-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600"
                   />
                   <button 
                      onClick={addCustomBusiness}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white px-2 py-1 rounded transition-colors focus:outline-none"
                   >
                     <Plus className="w-3 h-3" />
                   </button>
                </div>
                {/* Selected Custom Tags */}
                {selectedBusinesses.filter(b => !BUSINESS_FAMILIES.some(f => f.items.includes(b))).length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBusinesses.filter(b => !BUSINESS_FAMILIES.some(f => f.items.includes(b))).map(b => (
                         <button key={b} onClick={() => toggleBusiness(b)} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30 flex items-center gap-1">
                            {b} <span className="opacity-70 hover:opacity-100">&times;</span>
                         </button>
                      ))}
                   </div>
                )}
             </div>
          </section>

          <hr className="border-slate-200 dark:border-gray-800" />

          {/* SECTION 2: VILLES (COMPACT) */}
          <section>
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                   Villes ({selectedLocations.length})
                </h2>
             </div>

             {/* Tab Row */}
             <div className="flex overflow-x-auto no-scrollbar gap-1 mb-2 pb-1 border-b border-slate-200 dark:border-gray-800">
                {LOCATION_CIRCLES.map(circle => (
                   <button
                      key={circle.id}
                      onClick={() => setActiveLocationTab(circle.id)}
                      className={`px-2 py-1 text-[10px] whitespace-nowrap rounded-t-sm transition-colors focus:outline-none ${
                         activeLocationTab === circle.id 
                           ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500 dark:bg-teal-500/10 dark:text-teal-400' 
                           : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-b-2 border-transparent dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800/30'
                      }`}
                   >
                      {circle.title}
                   </button>
                ))}
             </div>

             <div className="space-y-2">
                {LOCATION_CIRCLES.map(circle => activeLocationTab === circle.id && (
                   <div key={circle.id}>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                         {circle.items.map(loc => {
                            const isActive = selectedLocations.includes(loc);
                            return (
                               <button
                                  key={loc}
                                  onClick={() => toggleLocation(loc)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded transition-all focus:outline-none ${
                                    isActive 
                                     ? 'bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30' 
                                     : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-[#121622] dark:text-gray-400 dark:hover:bg-gray-800 dark:border-gray-800/80'
                                  }`}
                               >
                                  {loc}
                               </button>
                            );
                         })}
                      </div>
                      <button 
                         onClick={() => selectAllLocationsInTab(circle.id)}
                         className="text-[10px] text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 underline decoration-teal-500/30"
                      >
                         Tout {selectedLocations.length === circle.items.length ? 'désélectionner' : 'sélectionner'}
                      </button>
                   </div>
                ))}
                
                {/* Custom Location Input */}
                <div className="flex items-center gap-1 mt-2">
                   <div className="relative flex-1">
                      <Search className="w-3 h-3 absolute left-2 top-1.5 text-slate-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Autre ville..."
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        onKeyDown={addCustomLocation}
                        className="w-full bg-white border border-slate-200 rounded pl-7 pr-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 dark:bg-[#121622] dark:border-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600"
                      />
                   </div>
                   <button 
                      onClick={addCustomLocation}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white px-2 py-1 rounded transition-colors focus:outline-none"
                   >
                     <Plus className="w-3 h-3" />
                   </button>
                </div>
                {/* Selected Custom Tags */}
                {selectedLocations.filter(l => !LOCATION_CIRCLES.some(c => c.items.includes(l))).length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocations.filter(l => !LOCATION_CIRCLES.some(c => c.items.includes(l))).map(l => (
                         <button key={l} onClick={() => toggleLocation(l)} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30 flex items-center gap-1">
                            {l} <span className="opacity-70 hover:opacity-100">&times;</span>
                         </button>
                      ))}
                   </div>
                )}
             </div>
          </section>

          <hr className="border-slate-200 dark:border-gray-800" />

          {/* SECTION 3: FILTRES (COMPACT) */}
          <section>
             <h2 className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                 Filtres & Scraping
             </h2>
             <div className="bg-white dark:bg-[#121622] rounded border border-slate-200 dark:border-gray-800/80 p-2 space-y-3">
                <div>
                   <span className="text-[10px] text-slate-500 dark:text-gray-500 mb-1.5 block">Filtres post-scraping (Claude)</span>
                   <div className="flex flex-wrap gap-1">
                       {INTENT_FILTERS.map(filter => {
                           const isActive = selectedFilters.includes(filter.id);
                           return (
                              <button
                                key={filter.id}
                                onClick={() => toggleFilter(filter.id)}
                                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors focus:outline-none flex items-center gap-1 ${
                                   isActive 
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' 
                                      : 'bg-transparent border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-gray-700 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-400'
                                }`}
                              >
                                 <span>{filter.icon}</span> {filter.label}
                              </button>
                           );
                       })}
                   </div>
                </div>
                <div>
                   <span className="text-[10px] text-slate-500 dark:text-gray-500 mb-1.5 block">Coordonnées à extraire</span>
                   <div className="flex flex-wrap gap-1.5">
                       {TARGET_COORDS.map(coord => {
                          const isChecked = selectedCoords.includes(coord.id);
                          return (
                             <label key={coord.id} className="flex items-center gap-1.5 cursor-pointer group">
                                <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors ${
                                   isChecked ? 'bg-amber-500 border-amber-500' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400 dark:bg-[#0f1117] dark:border-gray-600 dark:group-hover:border-gray-400'
                                }`}>
                                   {isChecked && <CheckCircle2 className="w-2.5 h-2.5 text-white dark:text-[#0f1117] stroke-[3]" />}
                                </div>
                                <span className="text-[10px] text-slate-600 group-hover:text-slate-800 dark:text-gray-400 dark:group-hover:text-gray-300 leading-none">
                                   {coord.label}
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
             </div>
          </section>

          {/* SESSION SAVE (Minimal) */}
          <section className="bg-gradient-to-br from-slate-100 to-white border border-slate-200 dark:from-[#161b2a] dark:to-[#121622] rounded dark:border-gray-800 p-2.5">
             <div className="flex gap-1.5">
                <input 
                  type="text" 
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Nommer cette cible..."
                  className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:bg-[#0f1117] dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-600"
                />
                <button 
                  onClick={saveSession}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-2 rounded transition-colors focus:outline-none"
                  disabled={!sessionName}
                  title="Sauvegarder"
                >
                   <Save className="w-3 h-3" />
                </button>
             </div>
             {sessions.length > 0 && (
                <div className="mt-2 text-[10px]">
                   <span className="text-slate-500 dark:text-gray-500">Récents:</span>
                   <div className="space-y-1 mt-1 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                      {sessions.map(s => (
                         <div key={s.id} className="flex justify-between items-center group cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800/50 p-1 rounded" onClick={() => loadSession(s)}>
                             <span className="text-slate-600 dark:text-gray-400 font-medium truncate pr-2" title={s.name}>{s.name}</span>
                             <span className="text-indigo-600/50 group-hover:text-indigo-600 dark:text-indigo-400/50 dark:group-hover:text-indigo-400 transition-colors">Load</span>
                         </div>
                      ))}
                   </div>
                </div>
             )}
          </section>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f1117]">
        
        {/* Main Header */}
        <header className="h-[60px] border-b border-slate-200 dark:border-gray-800 flex items-center px-4 lg:px-6 shrink-0 justify-between bg-slate-50 dark:bg-[#131722]">
          
          <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white mr-2">
                <AlignLeft className="w-5 h-5" />
             </button>
             <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 dark:bg-gray-800/50 dark:border-gray-700/50 rounded-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-gray-300">
                   <strong className="text-slate-800 dark:text-white">{totalQueries}</strong> urls <span className="opacity-50">/</span> <strong className="text-slate-800 dark:text-white">{selectedLocations.length}</strong> villes <span className="opacity-50">/</span> <strong className="text-slate-800 dark:text-white">{selectedBusinesses.length}</strong> types
                </span>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center justify-center p-1.5 bg-slate-200/50 hover:bg-slate-200 dark:bg-gray-800/40 dark:hover:bg-gray-700/60 rounded focus:outline-none"
             >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
             <button onClick={clearSession} className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1.5 bg-slate-200/50 hover:bg-slate-200 dark:bg-gray-800/40 dark:hover:bg-gray-700/60 px-2 py-1 rounded">
                 <RotateCcw className="w-3 h-3" /> <span className="hidden sm:inline">Reset</span>
             </button>
             <button onClick={exportAll} className="flex items-center gap-1.5 bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-200 px-3 py-1.5 rounded text-[11px] font-bold transition-all shadow-sm">
                <DownloadCloud className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export (Txt)</span>
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 lg:p-6 bg-white dark:bg-[#0f1117] h-full">
           
           {/* Outputs Panel spanning full remaining height */}
           <div className="flex-1 bg-slate-50 border border-slate-200 dark:bg-[#161b2a]/50 dark:border-gray-800/80 rounded-lg shadow-sm flex flex-col min-h-0">
              
              <div className="flex items-center gap-1 border-b border-slate-200 dark:border-gray-800 p-1.5 overflow-x-auto no-scrollbar shrink-0 bg-slate-100 dark:bg-[#121622] rounded-t-lg">
                 <button 
                    onClick={() => setActiveOutputTab('maps')}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded transition-colors focus:outline-none ${
                       activeOutputTab === 'maps' ? 'bg-white text-indigo-700 border-b-2 border-indigo-500 shadow-sm dark:bg-[#2a3045] dark:text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                    }`}
                 >
                    URLs Google Maps
                 </button>
                 <button 
                    onClick={() => setActiveOutputTab('phantom')}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded transition-colors focus:outline-none ${
                       activeOutputTab === 'phantom' ? 'bg-white text-indigo-700 border-b-2 border-indigo-500 shadow-sm dark:bg-[#2a3045] dark:text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                    }`}
                 >
                    Charge PhantomBuster
                 </button>
                 <button 
                    onClick={() => setActiveOutputTab('claude')}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded transition-colors focus:outline-none ${
                       activeOutputTab === 'claude' ? 'bg-white text-indigo-700 border-b-2 border-indigo-500 shadow-sm dark:bg-[#2a3045] dark:text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                    }`}
                 >
                    Prompt IA d'Enrichissement
                 </button>
                 <div className="flex-1"></div>
                 {/* Lead estimation Counter */}
                 <div className="text-[10px] font-mono text-indigo-600 mr-3 px-2 py-0.5 bg-indigo-50 rounded hidden sm:block dark:text-indigo-400/70 dark:bg-indigo-500/10">
                    ~ {estimationText} leads potentiels
                 </div>
              </div>

              <div className="flex-1 flex flex-col p-4 bg-slate-50 dark:bg-[#0f1117] rounded-b-lg overflow-hidden relative">
                 {totalQueries === 0 ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-gray-600">
                     <Map className="w-8 h-8 mb-2 opacity-50" />
                     <p className="text-[12px] font-medium">Sélectionnez des enseignes et des villes</p>
                   </div>
                 ) : (
                    <>
                       {activeOutputTab === 'maps' && (
                          <div className="flex flex-col h-full absolute inset-4">
                             <div className="flex justify-between items-center mb-3 shrink-0">
                                <p className="text-[11px] text-slate-500 dark:text-gray-500">Copiez cette liste d'URLs pour la source d'entrée de PhantomBuster (Search Maps).</p>
                                <button 
                                  onClick={() => {
                                     const allUrls = generatedQueries.map(q => `https://www.google.com/maps/search/${encodeURIComponent(q.business)}+${encodeURIComponent(q.location)}`).join('\n');
                                     copyToClipboard(allUrls, 'all-urls');
                                  }}
                                  className="bg-indigo-100 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-medium px-2 py-1 rounded flex items-center gap-1.5 transition-colors border border-indigo-200 hover:border-indigo-600 dark:bg-indigo-600/20 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white dark:border-indigo-500/30"
                                >
                                   {copiedUrl === 'all-urls' ? <CheckCircle2 className="w-3 h-3 text-green-500 dark:text-green-400" /> : <Copy className="w-3 h-3" />} Pack complet
                                </button>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                                {generatedQueries.map((q, i) => {
                                   const urlStr = `https://www.google.com/maps/search/${encodeURIComponent(q.business)}+${encodeURIComponent(q.location)}`;
                                   const isCopied = copiedUrl === urlStr;
                                   
                                   return (
                                      <div key={i} className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded group transition-colors dark:bg-[#121622] dark:hover:bg-[#1a1f2e] dark:border-gray-800">
                                         <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-slate-800 dark:text-gray-300 truncate leading-none mb-1">{q.business} <span className="text-slate-500 dark:text-gray-500 font-normal">dans</span> {q.location}</p>
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400/60 font-mono truncate leading-none">{urlStr}</p>
                                         </div>
                                         <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={() => copyToClipboard(urlStr, urlStr)}
                                                className={`p-1.5 rounded transition-colors focus:outline-none ${isCopied ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10' : 'text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 dark:text-gray-600 dark:hover:text-indigo-400 dark:bg-gray-800/50 dark:hover:bg-indigo-500/20'}`}
                                                title="Copier l'URL"
                                            >
                                                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                            <a 
                                                href={urlStr}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded transition-colors focus:outline-none dark:text-gray-600 dark:hover:text-indigo-400 dark:bg-gray-800/50 dark:hover:bg-indigo-500/20"
                                                title="Ouvrir dans un nouvel onglet"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                         </div>
                                      </div>
                                   )
                                })}
                             </div>
                          </div>
                       )}

                       {activeOutputTab === 'phantom' && (
                          <div className="flex flex-col h-full absolute inset-4">
                             <div className="flex justify-between items-center mb-3 shrink-0">
                                <p className="text-[11px] text-slate-500 dark:text-gray-500">Payload JSON pour injection API ou bulk list.</p>
                             </div>
                             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {generatedQueries.map((q, i) => {
                                   const jsonStr = JSON.stringify({
                                      "Search Query": `${q.business} ${q.location}`,
                                      "Max Results": 100,
                                      "Export Fields": "name, address, phone, website, rating, reviewCount, category, hours",
                                      "Language": "fr"
                                    }, null, 2);
                                   const isCopied = copiedUrl === `json-${i}`;
                                   return (
                                      <div key={i} className="relative group bg-white border border-slate-200 rounded p-3 font-mono text-[10px] leading-relaxed text-slate-600 overflow-x-auto dark:bg-[#121622] dark:border-gray-800 dark:text-gray-400">
                                         <pre>{jsonStr}</pre>
                                         <button 
                                            onClick={() => copyToClipboard(jsonStr, `json-${i}`)}
                                            className={`absolute top-2 right-2 p-1.5 rounded transition-all focus:outline-none ${isCopied ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30' : 'bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-[#0f1117] dark:border-gray-700 dark:text-gray-500 dark:hover:text-white'}`}
                                            title="Copier JSON"
                                         >
                                            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                         </button>
                                      </div>
                                   )
                                })}
                             </div>
                          </div>
                       )}

                       {activeOutputTab === 'claude' && (
                          <div className="flex flex-col h-full absolute inset-4">
                             <div className="flex justify-between items-center mb-3 shrink-0">
                                <p className="text-[11px] text-slate-500 dark:text-gray-500">Prompt d'enrichissement pour le fichier exporté de PhantomBuster.</p>
                                <button 
                                  onClick={() => copyToClipboard(claudePrompt, 'prompt')}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
                                >
                                   {copiedUrl === 'prompt' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} Copier Prompt
                                </button>
                             </div>
                             <div className="bg-white border border-slate-200 p-4 rounded flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-slate-600 whitespace-pre-wrap selection:bg-indigo-500/30 dark:bg-[#121622] dark:border-gray-800 dark:text-gray-400">
                                {claudePrompt}
                             </div>
                          </div>
                       )}
                    </>
                 )}
              </div>
           </div>

           {/* Workflow Mini-Guide */}
           <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 shrink-0 shadow-sm overflow-x-auto dark:bg-[#161b2a]/50 dark:border-gray-800/80">
             <div className="flex items-center gap-2 min-w-max">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mr-2 dark:text-gray-500">Workflow</span>
                <div className="flex items-center gap-2">
                   <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold text-slate-500 border border-slate-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">1</span>
                   <span className="text-[11px] text-slate-500 dark:text-gray-400">Extraire Maps</span>
                </div>
                <div className="w-4 h-[1px] bg-slate-200 dark:bg-gray-800"></div>
                <div className="flex items-center gap-2">
                   <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold text-slate-500 border border-slate-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">2</span>
                   <span className="text-[11px] text-slate-500 dark:text-gray-400">Scraping site web (Optionnel)</span>
                </div>
                <div className="w-4 h-[1px] bg-slate-200 dark:bg-gray-800"></div>
                <div className="flex items-center gap-2">
                   <span className="flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30">3</span>
                   <span className="text-[11px] text-slate-800 font-medium dark:text-gray-300">Nettoyage IA Claude</span>
                </div>
             </div>
           </div>

        </div>
      </main>
    </div>
  );
}
