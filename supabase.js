// supabase.js - مع إصلاحات كاملة للأخطاء
const SUPABASE_URL = 'https://bcjhxjelaqirormcflms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamh4amVsYXFpcm9ybWNmbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzkzNTMsImV4cCI6MjA3ODUxNTM1M30.aDJ-dR70zJEQJYoUc2boZOtoJevEtPRj_UFAMlEwZpc';

// تهيئة Supabase مع إعدادات محسنة
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// دوال قاعدة البيانات مع معالجة محسنة للأخطاء
const Database = {
    // دوال الموظفين
    async getStaff() {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .order('name');
            
            if (error) {
                console.error('خطأ في جلب الموظفين:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الموظفين:', error);
            return [];
        }
    },

    async addStaff(staff) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .insert([{
                    id: staff.id,
                    name: staff.name,
                    phone: staff.phone || null,
                    jobs: staff.jobs || [],
                    subjects: staff.subjects || [],
                    classes: staff.classes || []
                }])
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في إضافة الموظف:', error);
            return { data: null, error };
        }
    },

    async updateStaff(id, updates) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .update({
                    name: updates.name,
                    phone: updates.phone || null,
                    jobs: updates.jobs || [],
                    subjects: updates.subjects || [],
                    classes: updates.classes || []
                })
                .eq('id', id)
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في تحديث الموظف:', error);
            return { data: null, error };
        }
    },

    async deleteStaff(id) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .delete()
                .eq('id', id);
            return { data, error };
        } catch (error) {
            console.error('خطأ في حذف الموظف:', error);
            return { data: null, error };
        }
    },

    // دوال الملفات
    async getFiles() {
        try {
            const { data, error } = await supabase
                .from('files')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('خطأ في جلب الملفات:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الملفات:', error);
            return [];
        }
    },

    async addFile(file) {
        try {
            const { data, error } = await supabase
                .from('files')
                .insert([{
                    id: file.id,
                    title: file.title,
                    category: file.category,
                    note: file.note || null,
                    date: file.date,
                    target_staff: file.target_staff || [],
                    target_subjects: file.target_subjects || [],
                    target_classes: file.target_classes || [],
                    file_name: file.file_name || null,
                    file_path: file.file_path || null,
                    file_url: file.file_url || null,
                    file_size: file.file_size || null,
                    file_type: file.file_type || null
                }])
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في إضافة الملف:', error);
            return { data: null, error };
        }
    },

    async deleteFile(id) {
        try {
            const { data, error } = await supabase
                .from('files')
                .delete()
                .eq('id', id);
            return { data, error };
        } catch (error) {
            console.error('خطأ في حذف الملف:', error);
            return { data: null, error };
        }
    },

    // دوال التخزين الفعلي للملفات
    async uploadFile(file, fileName, folder = 'school-files') {
        try {
            // إنشاء اسم فريد للملف
            const fileExt = fileName.split('.').pop();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${folder}/${uniqueFileName}`;

            console.log('بدء رفع الملف:', fileName, 'المسار:', filePath);

            // رفع الملف إلى التخزين
            const { data, error } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('خطأ في رفع الملف:', error);
                throw error;
            }

            console.log('تم رفع الملف بنجاح:', data);

            // الحصول على رابط التحميل
            const { data: urlData } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

            console.log('رابط الملف العام:', urlData);

            return {
                success: true,
                filePath: filePath,
                fileName: fileName,
                publicUrl: urlData.publicUrl,
                uniqueFileName: uniqueFileName
            };
        } catch (error) {
            console.error('خطأ في رفع الملف:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async downloadFile(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from('files')
                .download(filePath);

            if (error) throw error;
            return { success: true, data: data };
        } catch (error) {
            console.error('خطأ في تحميل الملف:', error);
            return { success: false, error: error.message };
        }
    },

    async getFileUrl(filePath) {
        try {
            const { data } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('خطأ في الحصول على رابط الملف:', error);
            return null;
        }
    },

    async deleteStorageFile(filePath) {
        try {
            const { data, error } = await supabase.storage
                .from('files')
                .remove([filePath]);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('خطأ في حذف الملف:', error);
            return { success: false, error: error.message };
        }
    },

    // دوال الأحداث
    async getEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date');
            
            if (error) {
                console.error('خطأ في جلب الأحداث:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الأحداث:', error);
            return [];
        }
    },

    async addEvent(event) {
        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    id: event.id,
                    title: event.title,
                    date: event.date
                }])
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في إضافة الحدث:', error);
            return { data: null, error };
        }
    },

    async updateEvent(id, updates) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update({
                    title: updates.title,
                    date: updates.date
                })
                .eq('id', id)
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في تحديث الحدث:', error);
            return { data: null, error };
        }
    },

    async deleteEvent(id) {
        try {
            const { data, error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);
            return { data, error };
        } catch (error) {
            console.error('خطأ في حذف الحدث:', error);
            return { data: null, error };
        }
    },

    // دوال جداول الحصص - مُصلحة
    async getSchedules() {
        try {
            const { data, error } = await supabase
                .from('schedules')
                .select('*');
            
            if (error) {
                console.error('خطأ في جلب جداول الحصص:', error);
                return [];
            }
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب جداول الحصص:', error);
            return [];
        }
    },

    async upsertSchedule(schedule) {
        try {
            // تنظيف البيانات قبل الحفظ
            const cleanedSchedule = {
                teacher_id: schedule.teacher_id,
                schedule: schedule.schedule || this.createEmptyScheduleObject()
            };

            console.log('محاولة حفظ الجدول:', cleanedSchedule);

            const { data, error } = await supabase
                .from('schedules')
                .upsert(cleanedSchedule, { 
                    onConflict: 'teacher_id',
                    ignoreDuplicates: false 
                })
                .select();

            if (error) {
                console.error('خطأ في حفظ الجدول:', error);
                throw error;
            }

            console.log('تم حفظ الجدول بنجاح:', data);
            return { data, error };
        } catch (error) {
            console.error('خطأ في حفظ الجدول:', error);
            return { data: null, error };
        }
    },

    // إنشاء جدول فارغ ككائن JSON
    createEmptyScheduleObject() {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
        const schedule = {};
        
        days.forEach(day => {
            schedule[day] = Array(7).fill().map(() => ({
                subject: '',
                class: ''
            }));
        });
        
        return schedule;
    },

    // دوال توقيت الدوام
    async getWorkSchedules() {
        try {
            const { data, error } = await supabase
                .from('work_schedules')
                .select('*');
            
            if (error) {
                console.error('خطأ في جلب توقيت الدوام:', error);
                return {};
            }
            
            const schedules = {};
            if (data) {
                data.forEach(item => {
                    schedules[item.time_type] = item.schedule_data;
                });
            }
            return schedules;
        } catch (error) {
            console.error('خطأ في جلب توقيت الدوام:', error);
            return {};
        }
    },

    async saveWorkSchedule(timeType, scheduleData) {
        try {
            const { data, error } = await supabase
                .from('work_schedules')
                .upsert({
                    time_type: timeType,
                    schedule_data: scheduleData || []
                }, { 
                    onConflict: 'time_type'
                })
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في حفظ توقيت الدوام:', error);
            return { data: null, error };
        }
    },

    // دوال حالة الاطلاع المحسنة
    async getFileReadStatus() {
        try {
            const { data, error } = await supabase
                .from('file_read_status')
                .select('*');
            
            if (error) {
                console.error('خطأ في جلب حالة الاطلاع:', error);
                return {};
            }
            return this.formatFileReadStatus(data);
        } catch (error) {
            console.error('خطأ في جلب حالة الاطلاع:', error);
            return {};
        }
    },

    async updateFileReadStatus(fileId, staffId, status) {
        try {
            const { data, error } = await supabase
                .from('file_read_status')
                .upsert({
                    file_id: fileId,
                    staff_id: staffId,
                    read: status.read || false,
                    read_date: status.read_date || null,
                    staff_name: status.staff_name || '',
                    downloaded: status.downloaded || false,
                    download_date: status.download_date || null,
                    read_count: status.read_count || 0,
                    download_count: status.download_count || 0,
                    last_access: new Date().toISOString()
                }, { 
                    onConflict: 'file_id,staff_id'
                })
                .select();
            return { data, error };
        } catch (error) {
            console.error('خطأ في تحديث حالة الاطلاع:', error);
            return { data: null, error };
        }
    },

    formatFileReadStatus(data) {
        const status = {};
        if (data) {
            data.forEach(item => {
                if (!status[item.file_id]) {
                    status[item.file_id] = {};
                }
                status[item.file_id][item.staff_id] = {
                    read: item.read,
                    read_date: item.read_date,
                    staff_name: item.staff_name,
                    downloaded: item.downloaded,
                    download_date: item.download_date,
                    read_count: item.read_count,
                    download_count: item.download_count,
                    last_access: item.last_access
                };
            });
        }
        return status;
    },

    // دالة مساعدة للتحقق من اتصال Supabase
    async checkConnection() {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('count')
                .limit(1);
            
            return {
                connected: !error,
                error: error ? error.message : null
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    },

    // دالة لتهيئة التخزين
    async initializeStorage() {
        try {
            // التحقق من وجود bucket
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) throw error;

            const bucketExists = buckets.some(bucket => bucket.name === 'files');
            
            if (!bucketExists) {
                console.log('إنشاء bucket جديد للتخزين...');
                const { error: createError } = await supabase.storage.createBucket('files', {
                    public: true,
                    fileSizeLimit: 52428800 // 50MB
                });
                if (createError) throw createError;
            }

            return { success: true };
        } catch (error) {
            console.error('خطأ في تهيئة التخزين:', error);
            return { success: false, error: error.message };
        }
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;

// التحقق من التحميل والاتصال
console.log('✅ Supabase.js loaded successfully');
console.log('📁 Database object:', typeof Database !== 'undefined' ? 'Loaded' : 'Not Loaded');

// التحقق من الاتصال عند التحميل
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const connection = await Database.checkConnection();
        if (connection.connected) {
            console.log('✅ Connected to Supabase successfully');
            
            // تهيئة التخزين
            const storageInit = await Database.initializeStorage();
            if (storageInit.success) {
                console.log('✅ Storage initialized successfully');
            } else {
                console.warn('⚠️ Storage initialization failed:', storageInit.error);
            }
        } else {
            console.error('❌ Failed to connect to Supabase:', connection.error);
        }
    } catch (error) {
        console.error('❌ Error checking Supabase connection:', error);
    }
});
