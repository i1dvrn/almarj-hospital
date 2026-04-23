// ===================================================
//   مستشفى المرج التخصصي — قاعدة البيانات (Supabase)
// ===================================================

const MARJ_SUPABASE_URL  = 'https://hbouyznuyvzjcevsalis.supabase.co';
const MARJ_SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib3V5em51eXZ6amNldnNhbGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDQxNzksImV4cCI6MjA5MTcyMDE3OX0.MpjZ1CrorDYRE4EL1SxWQw7jM5ukuL4bwrA5NpDaq74';

// تهيئة Supabase — يجب أن يكون <script> الـ SDK محمّلاً قبل هذا الملف
const _supabase = window.supabase.createClient(MARJ_SUPABASE_URL, MARJ_SUPABASE_KEY);

// ─────────────────────────────────────────────────
//   ثوابت الأيام والفترات والألوان
// ─────────────────────────────────────────────────

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

const MARJ_PERIODS = [
  { key: 'morning', label: 'صباحية', labelShort: 'صباح', icon: 'wb_sunny',    color: 'amber'  },
  { key: 'evening', label: 'مسائية', labelShort: 'مساء', icon: 'wb_twilight', color: 'indigo' },
  { key: 'night',   label: 'ليلية',  labelShort: 'ليل',  icon: 'nights_stay', color: 'slate'  }
];

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

// ─────────────────────────────────────────────────
//   دوال الأطباء
// ─────────────────────────────────────────────────

async function marjGetDoctors() {
  const { data, error } = await _supabase.from('doctors').select('*').order('name');
  if (error) { console.error('marjGetDoctors:', error.message); return []; }
  return data || [];
}

async function marjGetDoctorById(id) {
  const { data, error } = await _supabase.from('doctors').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

async function marjGetDoctorName(id) {
  if (!id) return null;
  const doc = await marjGetDoctorById(id);
  return doc ? doc.name : null;
}

// إضافة طبيب جديد
async function marjAddDoctor(doctor) {
  doctor.id = doctor.id || marjGenId();
  const { data, error } = await _supabase.from('doctors').insert([doctor]).select().single();
  if (error) { console.error('marjAddDoctor:', error.message); return null; }
  return data;
}

// تعديل طبيب موجود
async function marjUpdateDoctor(id, updates) {
  const { data, error } = await _supabase.from('doctors').update(updates).eq('id', id).select().single();
  if (error) { console.error('marjUpdateDoctor:', error.message); return null; }
  return data;
}

// حذف طبيب
async function marjDeleteDoctor(id) {
  const { error } = await _supabase.from('doctors').delete().eq('id', id);
  if (error) { console.error('marjDeleteDoctor:', error.message); return false; }
  return true;
}

// ─────────────────────────────────────────────────
//   دوال الجداول
// ─────────────────────────────────────────────────

// يُعيد الجداول مرتبة حسب الـ id لضمان ثبات الترتيب
async function marjGetSchedules() {
  const { data, error } = await _supabase.from('schedules').select('*').order('row_index');
  if (error) { console.error('marjGetSchedules:', error.message); }

  // تحويل الصفوف المسطّحة إلى الهيكل القديم
  const result = MARJ_DAYS.reduce((a, d) => { a[d] = []; return a; }, {});
  for (const row of (data || [])) {
    if (result[row.day] !== undefined) {
      result[row.day].push({
        id:          row.id,
        clinicName:  row.clinic_name,
        morning:     row.morning || null,
        evening:     row.evening || null,
        night:       row.night   || null
      });
    }
  }
  return result;
}

// إضافة صف جديد في الجدول
async function marjAddScheduleRow(day, row) {
  const record = {
    id:          row.id || marjGenId(),
    day:         day,
    clinic_name: row.clinicName || '',
    morning:     row.morning    || null,
    evening:     row.evening    || null,
    night:       row.night      || null
  };
  const { data, error } = await _supabase.from('schedules').insert([record]).select().single();
  if (error) { console.error('marjAddScheduleRow:', error.message); return null; }
  return data;
}

// تعديل صف موجود
async function marjUpdateScheduleRow(id, updates) {
  const record = {};
  if (updates.clinicName !== undefined) record.clinic_name = updates.clinicName;
  if (updates.morning    !== undefined) record.morning     = updates.morning;
  if (updates.evening    !== undefined) record.evening     = updates.evening;
  if (updates.night      !== undefined) record.night       = updates.night;

  const { data, error } = await _supabase.from('schedules').update(record).eq('id', id).select().single();
  if (error) { console.error('marjUpdateScheduleRow:', error.message); return null; }
  return data;
}

// حذف صف
async function marjDeleteScheduleRow(id) {
  const { error } = await _supabase.from('schedules').delete().eq('id', id);
  if (error) { console.error('marjDeleteScheduleRow:', error.message); return false; }
  return true;
}

// حفظ جدول يوم واحد فقط (أسرع وأكثر أماناً ويحافظ على ترتيب الأيام الأخرى)
async function marjSaveDaySchedule(day, rows) {
  // حذف صفوف اليوم المعني فقط
  await _supabase.from('schedules').delete().eq('day', day);

  const newRows = rows.map(r => ({
    id:          r.id || marjGenId(),
    day:         day,
    clinic_name: r.clinicName || '',
    morning:     r.morning    || null,
    evening:     r.evening    || null,
    night:       r.night      || null
  }));

  if (newRows.length > 0) {
    const { error } = await _supabase.from('schedules').insert(newRows);
    if (error) { console.error('marjSaveDaySchedule:', error.message); return false; }
  }
  return true;
}

// حفظ كامل الجدول (يمسح القديم ويكتب الجديد) — للتوافق مع الكود القديم
async function marjSaveSchedules(schedules) {
  // حذف كل الصفوف القديمة
  await _supabase.from('schedules').delete().neq('id', '___none___');

  const rows = [];
  for (const day of MARJ_DAYS) {
    for (const row of (schedules[day] || [])) {
      rows.push({
        id:          row.id || marjGenId(),
        day:         day,
        clinic_name: row.clinicName || '',
        morning:     row.morning    || null,
        evening:     row.evening    || null,
        night:       row.night      || null
      });
    }
  }
  if (rows.length > 0) {
    const { error } = await _supabase.from('schedules').insert(rows);
    if (error) { console.error('marjSaveSchedules:', error.message); return false; }
  }
  return true;
}

// حفظ كامل قائمة الأطباء (للتوافق مع الكود القديم)
async function marjSaveDoctors(doctors) {
  await _supabase.from('doctors').delete().neq('id', '___none___');
  if (doctors.length > 0) {
    const { error } = await _supabase.from('doctors').insert(doctors);
    if (error) { console.error('marjSaveDoctors:', error.message); return false; }
  }
  return true;
}

// ─────────────────────────────────────────────────
//   دوال التحليلات (Analytics)
// ─────────────────────────────────────────────────

/**
 * تتبع زيارة جديدة. يتم حساب الزيارة مرة واحدة لكل جلسة متصفح في اليوم.
 */
async function marjTrackVisit() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const sessionKey = `marj_visit_${today}`;
    
    // منع احتساب الزيارة المتكررة في نفس الجلسة
    if (sessionStorage.getItem(sessionKey)) return;

    // استدعاء الوظيفة التي أنشأناها في Supabase (RPC)
    // ملاحظة: يجب أن تكون الوظيفة increment_visitor_count موجودة في Supabase
    const { error } = await _supabase.rpc('increment_visitor_count', { target_date: today });
    
    if (error) {
      // إذا فشل الـ RPC (ربما غير موجود)، نحاول التحديث اليدوي كبديل
      console.warn('RPC failed, falling back to manual update:', error.message);
      const { data: existing } = await _supabase.from('visitor_stats').select('count').eq('date', today).single();
      
      if (existing) {
        await _supabase.from('visitor_stats').update({ count: existing.count + 1 }).eq('date', today);
      } else {
        await _supabase.from('visitor_stats').insert([{ date: today, count: 1 }]);
      }
    }
    
    sessionStorage.setItem(sessionKey, '1');
  } catch (err) {
    console.error('marjTrackVisit Error:', err);
  }
}

/**
 * جلب إحصائيات الزوار لآخر عدد من الأيام.
 */
async function marjGetVisitorStats(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await _supabase
    .from('visitor_stats')
    .select('*')
    .gte('date', dateStr)
    .order('date', { ascending: true });

  if (error) {
    console.error('marjGetVisitorStats:', error.message);
    return [];
  }
  return data || [];
}

// ─────────────────────────────────────────────────
//   دوال مساعدة
// ─────────────────────────────────────────────────

// يُعيد مواعيد طبيب معين من كل الجداول
async function marjGetDoctorSchedule(doctorId) {
  const { data, error } = await _supabase
    .from('schedules')
    .select('*')
    .or(`morning.eq.${doctorId},evening.eq.${doctorId},night.eq.${doctorId}`);

  if (error) { console.error('marjGetDoctorSchedule:', error.message); return []; }

  const result = [];
  for (const row of (data || [])) {
    for (const p of MARJ_PERIODS) {
      if (row[p.key] === doctorId) {
        result.push({
          day:          row.day,
          dayName:      MARJ_DAY_NAMES[row.day]?.ar || row.day,
          period:       p.key,
          periodLabel:  p.labelShort,
          periodIcon:   p.icon,
          periodColor:  p.color,
          clinicName:   row.clinic_name
        });
      }
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
