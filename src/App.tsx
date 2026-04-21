/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  LayoutDashboard, 
  Plus, 
  Clock, 
  Info, 
  ChevronRight,
  LogOut,
  History,
  Settings,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  CreditCard,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type VehicleType = 'CAR' | 'BIKE' | 'TRUCK';

interface Vehicle {
  plate: string;
  type: VehicleType;
  entryTime: number;
}

interface Slot {
  id: number;
  level: 1 | 2;
  type: VehicleType;
  occupiedBy: Vehicle | null;
}

const VEHICLE_ICONS = {
  CAR: Car,
  BIKE: Bike,
  TRUCK: Truck
};

const VEHICLE_COLORS = {
  CAR: 'text-slate-600 bg-slate-50 border-slate-200',
  BIKE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  TRUCK: 'text-amber-700 bg-amber-50 border-amber-200'
};

const ACCENT_GRADIENT = "bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700";

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<1 | 2>(1);
  const [showParkModal, setShowParkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newVehicle, setNewVehicle] = useState<{ plate: string; type: VehicleType }>({
    plate: '',
    type: 'CAR'
  });
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchStatus = async () => {
  const initialSlots: Slot[] = [];

  for (let i = 1; i <= 36; i++) {
    initialSlots.push({
      id: i,
      level: i <= 18 ? 1 : 2,
      type: i % 3 === 0 ? 'CAR' : i % 3 === 1 ? 'BIKE' : 'TRUCK',
      occupiedBy: null,
    });
  }

  setSlots(initialSlots);

  setPrices({
    BIKE: 2,
    CAR: 5,
    TRUCK: 10,
  });

  setLoading(false);
};

 useEffect(() => {
  fetchStatus();
}, []);

  const handlePark = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newVehicle.plate) return;

  try {
    let allocatedSlotId: number | null = null;

    setSlots((prev) => {
      const emptySlot = prev.find(
        (s) =>
          !s.occupiedBy &&
          s.level === currentLevel &&
          s.type === newVehicle.type
      );

      if (!emptySlot) return prev;

      allocatedSlotId = emptySlot.id;

      return prev.map((slot) =>
        slot.id === emptySlot.id
          ? {
              ...slot,
              occupiedBy: {
                plate: newVehicle.plate,
                type: newVehicle.type,
                entryTime: Date.now(),
              },
            }
          : slot
      );
    });

    if (allocatedSlotId !== null) {
      showNotification(
        `Vehicle ${newVehicle.plate} secure at Bay ${allocatedSlotId}`,
        "success"
      );
      setNewVehicle({ plate: "", type: "CAR" });
      setShowParkModal(false);
    } else {
      showNotification("No available slots", "error");
    }
  } catch (err) {
    showNotification("Failed to process parking request", "error");
  }
};

  const handleRelease = (slotId: number) => {
  let found = false;

  setSlots((prev) =>
    prev.map((slot) => {
      if (slot.id === slotId && slot.occupiedBy) {
        found = true;

        const durationHours =
          (Date.now() - slot.occupiedBy.entryTime) / (1000 * 60 * 60);

        const rate = prices[slot.occupiedBy.type] || 0;
        const amount = durationHours * rate;

        showNotification(
          `Payment: ₹${amount.toFixed(2)} (${durationHours.toFixed(1)} hr)`,
          "success"
        );

        return { ...slot, occupiedBy: null };
      }
      return slot;
    })
  );

  if (!found) {
    showNotification("Slot already empty", "error");
  }
};

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const occupiedCount = slots.filter(s => s.occupiedBy).length;
  const filteredSlots = slots.filter(s => 
    s.id.toString().includes(searchQuery) || 
    s.occupiedBy?.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans text-brand-text overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col bg-[#111111] p-8 space-y-10 relative z-50 overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 ${ACCENT_GRADIENT} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50`}>
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <div>
                <h1 className="font-bold text-xl leading-tight font-display tracking-tight text-white">ParkFlow</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">Enterprise</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2 relative z-10">
              <NavItem icon={LayoutDashboard} label="Real-time Map" active />
              <NavItem icon={History} label="Audit Logs" />
              <NavItem icon={CreditCard} label="Revenue Hub" />
              <NavItem icon={ShieldCheck} label="Security" />
              <NavItem icon={Settings} label="Global Configuration" />
            </nav>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group z-10">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Link</span>
                </div>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">System ready. No critical errors detected in Zone A.</p>
              </div>
            </div>
            
            {/* Sidebar background flare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-brand-bg">
        {/* Top Header */}
        <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 flex items-center justify-between shrink-0 relative z-40">
          <div className="flex items-center gap-6 flex-1 max-w-3xl">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 text-brand-muted hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-1 group">
              <input 
                type="text" 
                placeholder="Search by plate, ID or zone..." 
                className="w-full bg-white/5 border border-transparent hover:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:bg-white/10 focus:border-emerald-500/30 focus:ring-8 focus:ring-emerald-500/5 transition-all font-medium text-white placeholder:text-brand-muted"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-emerald-400 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
              {[
                { type: 'BIKE', icon: Bike, color: 'text-emerald-400' },
                { type: 'CAR', icon: Car, color: 'text-slate-400' },
                { type: 'TRUCK', icon: Truck, color: 'text-amber-400' }
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2 pr-4 last:pr-0 border-r last:border-0 border-white/10">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-[10px] font-bold text-white">₹{prices[item.type]?.toFixed(2)}<span className="text-brand-muted">/hr</span></span>
                </div>
              ))}
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {[1, 2].map(l => (
                <button
                  key={l}
                  onClick={() => setCurrentLevel(l as 1 | 2)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentLevel === l 
                      ? 'bg-emerald-500 text-white shadow-lg' 
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  L{l}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowParkModal(true)}
              className={`${ACCENT_GRADIENT} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-xl shadow-emerald-900/50 active:scale-95 text-sm hover:shadow-emerald-300/60`}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Register Vehicle</span>
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 parking-grid-pattern">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* HUD Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard label="Live Occupancy" value={`${Math.round((occupiedCount / (slots.length || 1)) * 100)}%`} icon={Clock} accent="emerald" />
              <StatsCard label="Bays Occupied" value={occupiedCount} icon={AlertCircle} accent="amber" subtitle={`${slots.length - occupiedCount} vacant spots`} />
              
              {/* Prominent Pricing Card */}
              <div className="md:col-span-2 bg-[#181818] rounded-[32px] p-8 border border-emerald-500/10 relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">System Tariffs</h4>
                    <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Active Rates</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  {[
                    { type: 'BIKE', icon: Bike, rate: prices.BIKE, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
                    { type: 'CAR', icon: Car, rate: prices.CAR, color: 'text-slate-300', bg: 'bg-white/5' },
                    { type: 'TRUCK', icon: Truck, rate: prices.TRUCK, color: 'text-amber-400', bg: 'bg-amber-400/5' }
                  ].map(tariff => (
                    <div key={tariff.type} className={`${tariff.bg} rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2 group-hover:border-emerald-500/20 transition-all`}>
                      <tariff.icon className={`w-5 h-5 ${tariff.color}`} />
                      <div className="text-center">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">{tariff.type}</p>
                        <p className="text-xl font-bold text-white tracking-tight">₹{tariff.rate?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>

            {/* Parking Floor Plan View */}
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-4">
                    Floor Layout: Level {currentLevel}
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md uppercase tracking-tighter">
                      {currentLevel === 1 ? 'Bikes & Cars' : 'Cars & Trucks'}
                    </span>
                  </h2>
                  <p className="text-brand-muted text-sm mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Sector A-Z Monitoring Active
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                    <div className="w-3 h-3 bg-white/5 border border-white/10 rounded-full" /> Vacant
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                    <div className={`w-3 h-3 ${ACCENT_GRADIENT} rounded-full`} /> Occupied
                  </div>
                </div>
              </div>

              {/* The "Bay" Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-12">
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-52 bg-white/5 animate-pulse rounded-[28px] border-2 border-white/5 border-dashed" />
                  ))
                ) : (
                  filteredSlots
                    .filter(s => s.level === currentLevel)
                    .map((slot) => (
                    <ParkingBay 
                      key={slot.id} 
                      slot={slot} 
                      onRelease={() => handleRelease(slot.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed top-8 right-8 p-5 rounded-3xl shadow-2xl z-[100] flex items-center gap-4 border glass-card ${
              notif.type === 'success' ? 'border-emerald-500/20' : 'border-rose-500/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
              {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">System Update</p>
              <p className="font-bold text-sm text-white">{notif.msg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showParkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowParkModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-[#141414] rounded-[40px] shadow-3xl p-10 border border-white/5 overflow-hidden"
            >
              <div className="relative z-10">
                <header className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${ACCENT_GRADIENT} rounded-2xl flex items-center justify-center shadow-emerald-900/50`}>
                      <Plus className="text-white w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold font-display text-white">New Check-in</h3>
                      <p className="text-sm text-brand-muted">Initialize bay deployment</p>
                    </div>
                  </div>
                  <button onClick={() => setShowParkModal(false)} className="text-brand-muted hover:text-white p-2 rounded-2xl hover:bg-white/5 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </header>

                <form onSubmit={handlePark} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Plate Identifier</label>
                    <input 
                      autoFocus
                      required
                      placeholder="ENTER PLATE"
                      className="w-full bg-white/5 border-2 border-transparent rounded-[24px] px-6 py-5 placeholder:text-white/10 focus:outline-none focus:border-emerald-500/20 focus:bg-white/10 focus:ring-[12px] focus:ring-emerald-500/5 transition-all font-mono text-2xl font-bold uppercase tracking-[0.1em] text-white"
                      value={newVehicle.plate}
                      onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em] ml-1">Vehicle Classification</label>
                    <div className="grid grid-cols-3 gap-4">
                      {(currentLevel === 1 ? ['BIKE', 'CAR'] : ['CAR', 'TRUCK']).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewVehicle({ ...newVehicle, type: type as VehicleType })}
                          className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${
                            newVehicle.type === type 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-900/50' 
                              : 'bg-white/5 border-transparent text-brand-muted hover:bg-white/10'
                          }`}
                        >
                          {type === 'CAR' && <Car className="w-6 h-6" />}
                          {type === 'BIKE' && <Bike className="w-6 h-6" />}
                          {type === 'TRUCK' && <Truck className="w-6 h-6" />}
                          <div className="text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-widest">{type}</span>
                            <span className="block text-[8px] opacity-70 mt-0.5">₹{prices[type]}/hr</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full ${ACCENT_GRADIENT} hover:scale-[1.02] active:scale-95 text-white py-5 rounded-[24px] font-bold text-lg transition-all shadow-2xl shadow-emerald-200 mt-4`}
                  >
                    Authorize Entry
                  </button>
                </form>
              </div>
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavItemProps {
  key?: React.Key;
  icon: any;
  label: string;
  active?: boolean;
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all group relative overflow-hidden ${
      active ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}>
      <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-12 ${active ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'group-hover:text-emerald-400'}`} />
      <span className={`text-sm font-bold tracking-tight ${active ? '' : 'font-medium'}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-emerald-400/5 pointer-events-none"
        />
      )}
    </button>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: any;
  accent: string;
  trend?: string;
  subtitle?: string;
}

function StatsCard({ label, value, icon: Icon, accent, trend, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white/5 p-8 rounded-[32px] soft-shadow group hover:-translate-y-1 transition-all duration-500 cursor-default border border-white/5 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent === 'emerald' ? 'bg-emerald-400/10 text-emerald-400 shadow-inner' : 'bg-amber-400/10 text-amber-400 shadow-inner'} group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h4 className="text-4xl font-bold font-display tracking-tight text-white">{value}</h4>
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em]">{label}</p>
          {subtitle && <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
      
      {/* Decorative card flare */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-5 group-hover:scale-150 transition-transform duration-700 ${accent === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
    </div>
  );
}

interface ParkingBayProps {
  key?: React.Key;
  slot: Slot;
  onRelease: () => void | Promise<void>;
}

function ParkingBay({ slot, onRelease }: ParkingBayProps) {
  const Icon = VEHICLE_ICONS[slot.type];
  const themeClasses = VEHICLE_COLORS[slot.type];
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <motion.div 
      layout
      className="relative group pt-4"
    >
      {/* Bay Number Sign */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-surface border border-white/5 rounded-full shadow-sm z-20 text-[9px] font-bold text-brand-muted tracking-widest font-mono group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
        BAY-0{slot.id}
      </div>

      <div className={`relative w-full h-52 rounded-[28px] border-x-4 border-t-2 border-b-[10px] transition-all duration-500 flex flex-col items-center justify-center gap-4 ${
        slot.occupiedBy 
          ? 'bg-white/10 border-emerald-500 shadow-2xl shadow-emerald-500/20' 
          : 'bg-white/5 border-white/10 border-dashed hover:bg-emerald-400/5 hover:border-emerald-500/30'
      }`}>
        <div className={`absolute top-4 right-4 p-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${themeClasses} shadow-sm backdrop-blur-md`}>
          {slot.type}
        </div>

        <AnimatePresence mode="wait">
          {slot.occupiedBy ? (
            <motion.div 
              key="occupied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 px-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
                <Icon className="w-14 h-14 text-white mb-1 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-4 border-[#141414] shadow-md animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-black font-mono text-white tracking-[0.1em] uppercase leading-none">{slot.occupiedBy.plate}</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-muted font-bold uppercase mt-2 tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {Math.floor((Date.now() - slot.occupiedBy.entryTime) / 60000)}m
                </div>
              </div>

              {/* Action Trigger Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-[20px] opacity-0 group-hover:opacity-100 transition-all duration-300 px-4">
                {!isConfirming ? (
                  <button 
                    onClick={() => setIsConfirming(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-white/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Checkout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-[9px] font-black text-brand-muted uppercase text-center mb-1">Confirm Exit?</p>
                    <div className="flex gap-2">
                       <button onClick={() => setIsConfirming(false)} className="flex-1 py-3 bg-white/10 text-white text-[9px] font-bold uppercase rounded-xl hover:bg-white/20">No</button>
                       <button onClick={onRelease} className="flex-1 py-3 bg-emerald-500 text-white text-[9px] font-bold uppercase rounded-xl shadow-lg shadow-emerald-500/20">Yes</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              className="flex flex-col items-center gap-2 opacity-10 group-hover:opacity-30 transition-opacity"
            >
              <Icon className="w-10 h-10 text-brand-muted" />
              <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Vacant</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Floor Marking Subtle Lines */}
        <div className="absolute bottom-4 inset-x-4 h-px bg-white/5" />
      </div>
    </motion.div>
  );
}
