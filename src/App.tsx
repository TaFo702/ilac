import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  AlertCircle,
  History,
  Calendar,
  X,
  Play,
  BellRing,
  Info
} from 'lucide-react';
import { medications } from './data';
import { Medication, TakenRecord } from './types';
import { getCurrentTime, getTodayDate, parseTime, speak } from './utils';

const SPECIAL_INSTRUCTION = "Deltacortril: 2 hafta 2x1, 2 hafta sonra 1.5x1, 2 hafta sonra 1x1 e inilecek.";

export default function App() {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [today] = useState(getTodayDate());
  const [takenDoses, setTakenDoses] = useState<TakenRecord[]>(() => {
    const saved = localStorage.getItem('taken_doses_v4');
    return saved ? JSON.parse(saved) : [];
  });
  const [alarmActive, setAlarmActive] = useState(false);

  // Generate week dates (Monday to Sunday)
  const weekDates = useMemo(() => {
    const dates = [];
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(now.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  // Voice instruction twice a day
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Voice at 10:00 and 22:00
      if ((hours === 10 || hours === 22) && minutes === 0) {
        speak(`Önemli Hatırlatma: ${SPECIAL_INSTRUCTION}`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Update time and check alarms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = getCurrentTime();
      setCurrentTime(now);
      const dayOfWeek = new Date().getDay();
      
      const currentDoses = medications.filter(m => (!m.days || m.days.includes(dayOfWeek)) && m.times.includes(now));
      const untakenAtThisTime = currentDoses.some(m => !takenDoses.some(t => t.medicationId === m.id && t.time === now && t.date === today));
      
      if (untakenAtThisTime && !alarmActive) {
        setAlarmActive(true);
        const medsToSpeak = currentDoses
          .filter(m => !takenDoses.some(t => t.medicationId === m.id && t.time === now && t.date === today))
          .map(m => `${m.name} ${m.purpose}`)
          .join(', ');
        speak(`İlaç vakti geldi. Lütfen listenizi kontrol edin. Sıradaki ilaçlar: ${medsToSpeak}`);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [today, takenDoses, alarmActive]);

  const scheduleForSelectedDay = useMemo(() => {
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();
    const allDoses: { med: Medication; time: string }[] = [];

    medications.forEach(med => {
      if (med.days && !med.days.includes(dayOfWeek)) return;
      med.times.forEach(time => {
        allDoses.push({ med, time });
      });
    });

    return allDoses.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate]);

  const toggleDose = (medId: string, time: string, date: string = selectedDate) => {
    const isTaken = takenDoses.some(d => d.medicationId === medId && d.time === time && d.date === date);
    let newTaken;
    if (isTaken) {
      newTaken = takenDoses.filter(d => !(d.medicationId === medId && d.time === time && d.date === date));
    } else {
      newTaken = [{ medicationId: medId, time: time, date: date }, ...takenDoses];
      const med = medications.find(m => m.id === medId);
      if (med) {
        speak(`${med.name} ${med.purpose} alındı.`);
      }
      if (alarmActive) setAlarmActive(false);
    }
    setTakenDoses(newTaken);
    localStorage.setItem('taken_doses_v4', JSON.stringify(newTaken));
  };

  const getDoseStatus = (medId: string, time: string, date: string = selectedDate) => {
    const isTaken = takenDoses.some(d => d.medicationId === medId && d.time === time && d.date === date);
    if (isTaken) return 'taken';
    if (date === today) {
      const doseTime = parseTime(time);
      const now = new Date();
      if (doseTime < now) return 'overdue';
    }
    return 'upcoming';
  };

  const nextDose = useMemo(() => {
    if (selectedDate !== today) return null;
    return scheduleForSelectedDay.find(dose => {
      const status = getDoseStatus(dose.med.id, dose.time);
      return status !== 'taken';
    });
  }, [scheduleForSelectedDay, takenDoses, today, selectedDate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 overflow-x-hidden font-sans pb-32">
      {/* Header - Fixed top */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[16px] font-black text-slate-400 uppercase tracking-tight">İlaç Takip Sistemi</h1>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-black text-slate-900 tabular-nums leading-none">{currentTime}</span>
              <span className="text-[16px] font-black text-red-600 uppercase leading-none">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-28 px-4 max-w-[1400px] mx-auto space-y-4 pb-12">
        {/* Pinned Vital Instruction - Single Row Banner */}
        <button 
          onClick={() => speak(SPECIAL_INSTRUCTION)}
          className="w-full bg-white border border-red-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-red-400 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 shrink-0">
             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
               <AlertCircle size={20} />
             </div>
             <span className="text-red-600 uppercase text-[12px] font-black tracking-[0.2em] border-r border-red-100 pr-4">DOKTOR NOTU</span>
          </div>
          <p className="text-[15px] font-black text-slate-800 leading-tight italic">
            "{SPECIAL_INSTRUCTION}"
          </p>
          <Volume2 size={20} className="ml-auto text-red-300 group-hover:text-red-600" />
        </button>

        {/* Weekly Master Matrix */}
        <div className="bg-white rounded-3xl border-2 border-slate-400 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-5 text-xs font-black text-slate-600 uppercase tracking-widest border-b-2 border-r-2 border-slate-400 w-64 sticky left-0 z-20 bg-slate-100">İLAÇ / BİLGİ</th>
                  {weekDates.map((date, idx) => {
                    const d = new Date(date);
                    const isToday = date === today;
                    return (
                      <th key={date} className={`p-5 text-center border-b-2 border-slate-400 transition-colors ${idx !== weekDates.length - 1 ? 'border-r-2 border-slate-400' : ''} ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>
                        <div className={`text-[12px] font-black uppercase mb-1 ${isToday ? 'text-blue-100' : 'text-indigo-600'}`}>
                          {d.toLocaleDateString('tr-TR', { weekday: 'long' })}
                        </div>
                        <div className="text-xl font-black">
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-400">
                {medications.map((med) => (
                  <tr key={med.id} className="group hover:bg-slate-50 transition-colors">
                    <td 
                      className="p-6 border-r-2 border-slate-400 bg-white sticky left-0 z-10 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => speak(`${med.name} ${med.purpose}`)}
                    >
                      <div className="flex flex-col items-start gap-1 relative group/title">
                        <div className="absolute -right-2 top-0 p-2 text-blue-500 transition-all opacity-0 group-hover/title:opacity-100 group-hover/title:translate-x-1">
                          <Volume2 size={18} />
                        </div>
                        <div className="flex flex-col text-[16px] font-black text-slate-900 uppercase tracking-tight leading-[1.1] mb-1 pr-6">
                          {med.name.split(' ').map((part, pIdx) => (
                            <span key={pIdx}>{part}</span>
                          ))}
                        </div>
                        {med.purpose && (
                          <span className="text-[16px] font-black italic text-[#000080] uppercase tracking-tight leading-none mb-1">
                            {med.purpose}
                          </span>
                        )}
                        {med.dose && (
                          <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase leading-none">
                            {med.dose}
                          </span>
                        )}
                      </div>
                    </td>
                    {weekDates.map((date, idx) => {
                      const d = new Date(date);
                      const dayOfWeek = d.getDay();
                      const isScheduled = !med.days || med.days.includes(dayOfWeek);
                      const isToday = date === today;
                      
                      return (
                        <td key={`${date}-${med.id}`} className={`p-4 text-center ${idx !== weekDates.length - 1 ? 'border-r-2 border-slate-400' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}>
                          {isScheduled ? (
                            <div className="flex flex-col items-center gap-3 py-2">
                              {med.times.map((time, tIdx) => {
                                const isTaken = takenDoses.some(t => t.medicationId === med.id && t.time === time && t.date === date);
                                const isOverdue = isToday && !isTaken && parseTime(time) < new Date();
                                
                                return (
                                  <button
                                    key={`${time}-${tIdx}`}
                                    onClick={() => toggleDose(med.id, time, date)}
                                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all hover:scale-110 active:scale-95 border-2 ${
                                      isTaken 
                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200' 
                                        : isOverdue 
                                          ? 'bg-red-600 text-white animate-pulse border-red-500 shadow-xl shadow-red-200' 
                                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 shadow-sm'
                                    }`}
                                  >
                                    {isTaken ? <CheckCircle2 size={20} /> : time}
                                    {isToday && !isTaken && !isOverdue && nextDose?.med.id === med.id && nextDose?.time === time && (
                                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md animate-bounce" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="py-10 opacity-10 flex items-center justify-center">
                              <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / Status Info */}
        <div className="flex flex-wrap justify-center gap-4 px-2 py-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alındı</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white border border-slate-200 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bekliyor</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500 shadow-sm" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gecikmiş</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white ring-2 ring-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sıradaki</span>
           </div>
        </div>
      </main>

      {/* Alarm Overlay - High impact */}
      <AnimatePresence>
        {alarmActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-red-600/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-xs text-center shadow-2xl space-y-6"
            >
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <BellRing size={40} />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 leading-none">İLAÇ VAKTİ!</h2>
                  <p className="text-slate-500 font-bold">Listenizi kontrol edin ve ilaçlarınızı alın.</p>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                   {medications.filter(m => {
                      const dayOfWeek = new Date().getDay();
                      const isScheduled = !m.days || m.days.includes(dayOfWeek);
                      return isScheduled && m.times.includes(currentTime) && !takenDoses.some(t => t.medicationId === m.id && t.time === currentTime && t.date === today);
                   }).map(m => (
                      <div key={m.id} className="flex items-center justify-between gap-3 text-left">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-900 uppercase">{m.name}</span>
                           <span className="text-[10px] font-bold text-blue-600 uppercase italic">{m.purpose}</span>
                        </div>
                        <button 
                          onClick={() => speak(`${m.name} ${m.purpose}`)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                   ))}
                </div>
              </div>
              <button 
                onClick={() => setAlarmActive(false)}
                className="w-full py-5 bg-red-600 text-white rounded-[24px] text-xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all"
              >
                TAMAM, ANLADIM
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Help removed */}
    </div>
  );
}
