// ===================================================
//   مستشفى المرج التخصصي — قاعدة البيانات المشتركة
// ===================================================

const MARJ_DAYS = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];

const MARJ_DAY_NAMES = {
  saturday:  { ar: 'السبت',    en: 'Saturday'  },
  sunday:    { ar: 'الأحد',    en: 'Sunday'    },
  monday:    { ar: 'الاثنين',  en: 'Monday'    },
  tuesday:   { ar: 'الثلاثاء', en: 'Tuesday'   },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday:  { ar: 'الخميس',  en: 'Thursday'  },
  friday:    { ar: 'الجمعة',   en: 'Friday'    }
};

// خريطة الأيقونات المتاحة
const MARJ_ICONS = [
  { value: 'stethoscope',      label: 'سماعة طبية (باطنة/عامة)' },
  { value: 'favorite',         label: 'قلب' },
  { value: 'monitor_heart',    label: 'قلب وأوعية' },
  { value: 'orthopedics',      label: 'عظام' },
  { value: 'child_care',       label: 'أطفال' },
  { value: 'visibility',       label: 'عيون' },
  { value: 'hearing',          label: 'أذن وأنف وحنجرة' },
  { value: 'psychology',       label: 'نفسية / مخ وأعصاب' },
  { value: 'neurology',        label: 'جراحة مخ وأعصاب' },
  { value: 'radiology',        label: 'أشعة وتصوير' },
  { value: 'medical_services', label: 'جراحة' },
  { value: 'pregnant_woman',   label: 'نساء وولادة' },
  { value: 'dermatology',      label: 'جلدية' },
  { value: 'vaccines',         label: 'مختبر / تحاليل' },
  { value: 'kidney',           label: 'مسالك بولية' },
  { value: 'local_hospital',   label: 'عام / طوارئ' },
  { value: 'dentistry',        label: 'أسنان' }
];

// خريطة ألوان الأيقونات
const MARJ_COLORS = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-700'  },
  red:    { bg: 'bg-red-50',    text: 'text-red-700'    },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700'   },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700'  },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700'  },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700'   },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700'   }
};

// ===================== CRUD Functions =====================

function marjGetDoctors() {
  try { return JSON.parse(localStorage.getItem('marj_doctors')) || []; }
  catch { return []; }
}

function marjSaveDoctors(doctors) {
  localStorage.setItem('marj_doctors', JSON.stringify(doctors));
}

function marjGetSchedules() {
  try {
    const raw = localStorage.getItem('marj_schedules');
    if (raw) return JSON.parse(raw);
  } catch {}
  return MARJ_DAYS.reduce((a, d) => { a[d] = []; return a; }, {});
}

function marjSaveSchedules(schedules) {
  localStorage.setItem('marj_schedules', JSON.stringify(schedules));
}

function marjGetDoctorById(id) {
  return marjGetDoctors().find(d => d.id === id) || null;
}

function marjGetDoctorName(id) {
  if (!id) return null;
  const doc = marjGetDoctorById(id);
  return doc ? doc.name : null;
}

// يُعيد مواعيد الطبيب من الجداول: [{day, dayName, period, clinicName}]
function marjGetDoctorSchedule(doctorId) {
  const schedules = marjGetSchedules();
  const result = [];
  for (const day of MARJ_DAYS) {
    for (const row of (schedules[day] || [])) {
      if (row.morning === doctorId)
        result.push({ day, dayName: MARJ_DAY_NAMES[day].ar, period: 'morning', periodLabel: 'صباح', clinicName: row.clinicName });
      if (row.evening === doctorId)
        result.push({ day, dayName: MARJ_DAY_NAMES[day].ar, period: 'evening', periodLabel: 'مساء', clinicName: row.clinicName });
    }
  }
  return result;
}

function marjGetIconClasses(color) {
  return MARJ_COLORS[color] || MARJ_COLORS['blue'];
}

function marjGenId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
}
