// supabase.js - المشروع الجديد
const SUPABASE_URL = 'https://bcjhxjelaqirormcflms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamh4amVsYXFpcm9ybWNmbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzkzNTMsImV4cCI6MjA3ODUxNTM1M30.aDJ-dR70zJEQJYoUc2boZOtoJevEtPRj_UFAMlEwZpc';

// تهيئة Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دوال قاعدة البيانات
const Database = {
    // ========== دوال الموظفين ==========
    async getStaff() {
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting staff:', error);
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
                }]);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error adding staff:', error);
            return { data: null, error };
        }
    },

    async updateStaff(id, updates) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .update(updates)
                .eq('id', id);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating staff:', error);
            return { data: null, error };
        }
    },

    async deleteStaff(id) {
        try {
            const { data, error } = await supabase
                .from('staff')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error deleting staff:', error);
            return { data: null, error };
        }
    },

    // ========== دوال الملفات ==========
    async getFiles() {
        try {
            const { data, error } = await supabase
                .from('files')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting files:', error);
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
                    file_name: file.file_name || null
                }]);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error adding file:', error);
            return { data: null, error };
        }
    },

    async deleteFile(id) {
        try {
            const { data, error } = await supabase
                .from('files')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error deleting file:', error);
            return { data: null, error };
        }
    },

    // ========== دوال الأحداث ==========
    async getEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting events:', error);
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
                }]);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error adding event:', error);
            return { data: null, error };
        }
    },

    async updateEvent(id, updates) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating event:', error);
            return { data: null, error };
        }
    },

    async deleteEvent(id) {
        try {
            const { data, error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error deleting event:', error);
            return { data: null, error };
        }
    },

    // ========== دوال جداول الحصص ==========
    async getSchedules() {
        try {
            const { data, error } = await supabase
                .from('schedules')
                .select('*');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting schedules:', error);
            return [];
        }
    },

    async upsertSchedule(schedule) {
        try {
            const { data, error } = await supabase
                .from('schedules')
                .upsert({
                    teacher_id: schedule.teacher_id,
                    schedule: schedule.schedule
                }, { 
                    onConflict: 'teacher_id' 
                });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error upserting schedule:', error);
            return { data: null, error };
        }
    },

    // ========== دوال توقيت الدوام ==========
    async getWorkSchedules() {
        try {
            const { data, error } = await supabase
                .from('work_schedules')
                .select('*');
            
            if (error) {
                console.error('Error getting work schedules:', error);
                return {};
            }
            
            const schedules = {};
            (data || []).forEach(item => {
                schedules[item.time_type] = item.schedule_data;
            });
            return schedules;
        } catch (error) {
            console.error('Error getting work schedules:', error);
            return {};
        }
    },

    async saveWorkSchedule(timeType, scheduleData) {
        try {
            const { data, error } = await supabase
                .from('work_schedules')
                .upsert({
                    time_type: timeType,
                    schedule_data: scheduleData
                }, { 
                    onConflict: 'time_type' 
                });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error saving work schedule:', error);
            return { data: null, error };
        }
    },

    // ========== دوال حالة الاطلاع ==========
    async getFileReadStatus() {
        try {
            const { data, error } = await supabase
                .from('file_read_status')
                .select('*');
            
            if (error) {
                console.error('Error getting file read status:', error);
                return {};
            }
            
            return this.formatFileReadStatus(data || []);
        } catch (error) {
            console.error('Error getting file read status:', error);
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
                    staff_name: status.staff_name || null,
                    downloaded: status.downloaded || false
                }, { 
                    onConflict: 'file_id,staff_id' 
                });
            
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating file read status:', error);
            return { data: null, error };
        }
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
    },

    // ========== دوال المساعدة ==========
    async initializeSampleData() {
        try {
            // التحقق من وجود بيانات الموظفين
            const staff = await this.getStaff();
            if (staff.length === 0) {
                const sampleStaff = [
                    { 
                        id: "1234567890", 
                        name: "أحمد محمد", 
                        phone: "0551234567", 
                        jobs: ["معلم"], 
                        subjects: ["رياضيات"], 
                        classes: ["1/4", "2/4"] 
                    },
                    { 
                        id: "0987654321", 
                        name: "سارة عبدالله", 
                        phone: "0557654321", 
                        jobs: ["وكيل"], 
                        subjects: [], 
                        classes: [] 
                    },
                    { 
                        id: "1122334455", 
                        name: "محمد علي", 
                        phone: "0551122334", 
                        jobs: ["معلم", "موجه طلابي"], 
                        subjects: ["انجليزي", "عربي"], 
                        classes: ["3/4", "4/4"] 
                    }
                ];
                
                for (const staffMember of sampleStaff) {
                    await this.addStaff(staffMember);
                }
            }
            
            // التحقق من وجود بيانات الملفات
            const files = await this.getFiles();
            if (files.length === 0) {
                const sampleFiles = [
                    { 
                        id: "1", 
                        title: "التعميم الأسبوعي", 
                        category: "التعاميم الداخلية", 
                        note: "يتعلق بالأنشطة الأسبوعية", 
                        date: new Date().toLocaleDateString('ar-SA'),
                        target_staff: ["1234567890"],
                        target_subjects: [],
                        target_classes: [],
                        file_name: null
                    }
                ];
                
                for (const file of sampleFiles) {
                    await this.addFile(file);
                }
            }
            
            // التحقق من وجود بيانات الأحداث
            const events = await this.getEvents();
            if (events.length === 0) {
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                
                const sampleEvents = [
                    { 
                        id: "1", 
                        title: "بداية الفصل الدراسي الثاني", 
                        date: today.toISOString().split('T')[0] 
                    },
                    { 
                        id: "2", 
                        title: "اختبارات منتصف الفصل", 
                        date: nextWeek.toISOString().split('T')[0] 
                    }
                ];
                
                for (const event of sampleEvents) {
                    await this.addEvent(event);
                }
            }
            
            // التحقق من وجود جداول توقيت الدوام
            const workSchedules = await this.getWorkSchedules();
            if (Object.keys(workSchedules).length === 0) {
                const defaultSchedule = [
                    { activity: "الاصطفاف الصباحي", start: "07:00", end: "07:15" },
                    { activity: "الحصة الأولى", start: "07:15", end: "08:00" },
                    { activity: "الحصة الثانية", start: "08:00", end: "08:45" },
                    { activity: "الحصة الثالثة", start: "08:45", end: "09:30" },
                    { activity: "الفسحة", start: "09:30", end: "10:00" },
                    { activity: "الحصة الرابعة", start: "10:00", end: "10:45" },
                    { activity: "الحصة الخامسة", start: "10:45", end: "11:30" },
                    { activity: "الصلاة", start: "11:30", end: "11:45" },
                    { activity: "الحصة السادسة", start: "11:45", end: "12:30" },
                    { activity: "الحصة السابعة", start: "12:30", end: "13:15" }
                ];
                
                await this.saveWorkSchedule('summer', defaultSchedule);
                await this.saveWorkSchedule('winter', defaultSchedule);
                await this.saveWorkSchedule('ramadan', defaultSchedule);
            }
            
            console.log('Sample data initialized successfully');
        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
window.Database = Database;

// تهيئة البيانات الافتراضية عند التحميل
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await Database.initializeSampleData();
    } catch (error) {
        console.error('Error in initial data setup:', error);
    }
});
