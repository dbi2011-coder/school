// supabase.js - مع دعم التشفير
const SUPABASE_URL = 'https://bhquruemuzuulyoqwxln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocXVydWVtdXp1dWx5b3F3eGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjY0MjAsImV4cCI6MjA3ODQ0MjQyMH0.2zsLWUAv0w7SJb7EUR5fPPHnOg6WaROMfiu_0yayeWw';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دوال قاعدة البيانات مع التشفير
const Database = {
    // دالة للتحقق من بيانات المدير مع التشفير
    async verifyAdminLogin(username, password) {
        const { data, error } = await supabase
            .rpc('verify_admin_login', {
                input_username: username,
                input_password: password
            });
        
        if (error) {
            console.error('خطأ في التحقق من المدير:', error);
            return { isValid: false, schoolName: '' };
        }
        
        return data[0] || { isValid: false, schoolName: '' };
    },

    // دوال الموظفين
    async getStaff() {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('name');
        return error ? [] : data;
    },

    async addStaff(staff) {
        const { data, error } = await supabase
            .from('staff')
            .insert([staff]);
        return { data, error };
    },

    async updateStaff(id, updates) {
        const { data, error } = await supabase
            .from('staff')
            .update(updates)
            .eq('id', id);
        return { data, error };
    },

    async deleteStaff(id) {
        const { data, error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال الملفات
    async getFiles() {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    },

    async addFile(file) {
        const { data, error } = await supabase
            .from('files')
            .insert([file]);
        return { data, error };
    },

    async deleteFile(id) {
        const { data, error } = await supabase
            .from('files')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال الأحداث
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date');
        return error ? [] : data;
    },

    async addEvent(event) {
        const { data, error } = await supabase
            .from('events')
            .insert([event]);
        return { data, error };
    },

    async updateEvent(id, updates) {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id);
        return { data, error };
    },

    async deleteEvent(id) {
        const { data, error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        return { data, error };
    },

    // دوال جداول الحصص
    async getSchedules() {
        const { data, error } = await supabase
            .from('schedules')
            .select('*');
        return error ? [] : data;
    },

    async upsertSchedule(schedule) {
        const { data, error } = await supabase
            .from('schedules')
            .upsert(schedule, { onConflict: 'teacher_id' });
        return { data, error };
    },

    // دوال توقيت الدوام
    async getWorkSchedules() {
        const { data, error } = await supabase
            .from('work_schedules')
            .select('*');
        
        if (error) return {};
        
        const schedules = {};
        data.forEach(item => {
            schedules[item.time_type] = item.schedule_data;
        });
        return schedules;
    },

    async saveWorkSchedule(timeType, scheduleData) {
        const { data, error } = await supabase
            .from('work_schedules')
            .upsert({
                time_type: timeType,
                schedule_data: scheduleData
            }, { onConflict: 'time_type' });
        return { data, error };
    },

    // دوال حالة الاطلاع
    async getFileReadStatus() {
        const { data, error } = await supabase
            .from('file_read_status')
            .select('*');
        return error ? {} : this.formatFileReadStatus(data);
    },

    async updateFileReadStatus(fileId, staffId, status) {
        const { data, error } = await supabase
            .from('file_read_status')
            .upsert({
                file_id: fileId,
                staff_id: staffId,
                ...status
            }, { onConflict: 'file_id,staff_id' });
        return { data, error };
    },

    formatFileReadStatus(data) {
        const status = {};
        data.forEach(item => {
            if (!status[item.file_id]) {
                status[item.file_id] = {};
            }
            status[item.file_id][item.staff_id] = {
                read: item.read,
                read_date: item.read_date,
                staff_name: item.staff_name,
                downloaded: item.downloaded
            };
        });
        return status;
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;
