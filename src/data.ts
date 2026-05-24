import { Medication } from './types';

export const medications: Medication[] = [
  {
    id: 'panto',
    name: 'PANTO',
    purpose: 'Mide Koruyucu',
    dose: '40 MG',
    form: 'TB',
    times: ['10:00'],
    notes: '1X1'
  },
  {
    id: 'iprasal',
    name: 'İPRASAL',
    purpose: 'Nefes Açıcı',
    dose: '',
    form: '',
    times: ['10:00', '14:30', '19:00', '23:50'],
    notes: '4X1'
  },
  {
    id: 'cortair',
    name: 'CORTAİR',
    purpose: 'Nefes Açıcı',
    dose: '',
    form: '',
    times: ['10:00', '19:00'],
    notes: '2X1'
  },
  {
    id: 'calcimax',
    name: 'CALCİMAX D3',
    purpose: 'Kemik Güçlendirici',
    dose: '',
    form: 'TB',
    times: ['10:00', '19:00'],
    notes: '2X1'
  },
  {
    id: 'deltacortril',
    name: 'DELTACORTRİL',
    purpose: 'Steroid',
    dose: '5 MG',
    form: 'TB',
    times: ['10:00'],
    notes: '2X1'
  },
  {
    id: 'daflon',
    name: 'DAFLON',
    purpose: 'Dolaşım',
    dose: '500 MG',
    form: 'TB',
    times: ['10:00', '19:00'],
    notes: '2X1'
  },
  {
    id: 'eliquis',
    name: 'ELİQUİS',
    purpose: 'Kan Sulandırıcı',
    dose: '5 MG',
    form: 'TB',
    times: ['11:00', '23:00'],
    notes: '2X1'
  },
  {
    id: 'dcolefor',
    name: 'D-COLEFOR',
    purpose: 'Vitamin D',
    dose: '20.000',
    form: 'TB',
    times: ['14:30'],
    notes: '1X1 - 2/7 (Haftalık)',
    days: [1, 4]
  },
  {
    id: 'procto',
    name: 'PROCTO GLYVENOL',
    purpose: 'Hemoroid',
    dose: '',
    form: '',
    times: ['11:00', '16:00', '22:00'],
    notes: '3X1'
  },
  {
    id: 'kolsisin',
    name: 'KOLŞİSİN',
    purpose: 'Gut/Eklemler',
    dose: '0,5 MG',
    form: 'TB',
    times: ['12:00'],
    notes: '1X1'
  },
  {
    id: 'tantum',
    name: 'TANTUM',
    purpose: 'Gargara',
    dose: '',
    form: '',
    times: ['11:00', '16:00', '22:00'],
    notes: '3X1'
  },
  {
    id: 'mikostatin',
    name: 'MİKOSTATİN',
    purpose: 'Mantar',
    dose: '',
    form: '',
    times: ['11:00', '16:00', '22:00'],
    notes: '3X1 - YUTULACAK'
  },
  {
    id: 'delix',
    name: 'DELİX',
    purpose: 'Tansiyon',
    dose: '2,5 MG',
    form: 'TB',
    times: ['11:00'],
    notes: '1X1'
  },
  {
    id: 'desal',
    name: 'DESAL',
    purpose: 'Ödem Atıcı',
    dose: '40 MG',
    form: 'TB',
    times: ['11:00'],
    notes: '1X1 - PZT-PERŞEMBE',
    days: [1, 4]
  }
];
