// تسجيل الخروج
function logout() {
    localStorage.removeItem("role");
    localStorage.removeItem("currentStaff");
    window.location.href = "index.html";
}

// تحميل الملفات
function loadFiles() {
    const files = JSON.parse(localStorage.getItem("files")) || [];
    const categories = [...new Set(files.map(f => f.category))];
    const container = document.getElementById("fileCategories");

    container.innerHTML = categories.map(cat => {
        const categoryFiles = files.filter(f => f.category === cat);
        return `
            <div class="category-card">
                <div class="category-header">
                    <i class="fas fa-folder"></i>
                    ${cat}
                </div>
                <div class="category-files">
                    ${categoryFiles.map(f => `
                        <div class="file-item" onclick="downloadFile(${f.id})" style="cursor: pointer;">
                            <div>
                                <strong>${f.title}</strong>
                                ${f.note ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${f.note}</div>` : ''}
                            </div>
                            <div class="file-date">${f.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// تحميل الأحداث
function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const container = document.getElementById("calendarList");

    // ترتيب الأحداث حسب التاريخ
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let dayText = "اليوم";
        let badgeClass = "event-days";
        
        if (diffDays > 1) {
            dayText = `باقي ${diffDays} يوم`;
        } else if (diffDays === 1) {
            dayText = "غدًا";
        } else if (diffDays < 0) {
            dayText = "منتهي";
            badgeClass = "event-days expired";
        }
        
        return `
            <div class="event-card">
                <div class="${badgeClass}">${dayText}</div>
                <div>
                    <strong>${event.title}</strong>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        ${eventDate.toLocaleDateString('ar-SA', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// عرض اسم المستخدم
function displayUserName() {
    const currentStaff = JSON.parse(localStorage.getItem("currentStaff"));
    const staffNameElement = document.getElementById("staffUserName");
    
    if (currentStaff && staffNameElement) {
        staffNameElement.textContent = currentStaff.name;
    }
}

// دالة تحميل الملف
async function downloadFile(fileId) {
    try {
        const currentStaff = JSON.parse(localStorage.getItem("currentStaff"));
        const currentTime = new Date().toISOString();

        // الحصول على معلومات الملف من قاعدة البيانات
        const { data: fileData, error: fileError } = await supabase
            .from("files")
            .select("*")
            .eq("id", fileId)
            .single();

        if (fileError || !fileData) {
            console.error("لم يتم العثور على الملف في قاعدة البيانات");
            alert("حدثت مشكلة في تحميل الملف.");
            return;
        }

        // جلب الملف من التخزين
        const { data: downloadData, error: downloadError } = await supabase
            .storage
            .from("files")
            .download(fileData.file_path);

        if (downloadError) {
            console.error("خطأ في التحميل:", downloadError);
            alert("تعذر تحميل الملف.");
            return;
        }

        // إنشاء رابط تحميل فعلي
        const url = URL.createObjectURL(downloadData);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // تسجيل حالة الاطلاع
        await Database.updateFileReadStatus(fileId, currentStaff.id, {
            read: true,
            read_date: currentTime,
            staff_name: currentStaff.name,
            downloaded: true
        });

        // تحديث القائمة الجانبية
        await loadCategoriesNav();

    } catch (error) {
        console.error("خطأ في تحميل الملف:", error);
        alert("تعذر تحميل الملف.");
    }
}

// دالة تحميل التصنيفات في القائمة الجانبية
async function loadCategoriesNav() {
    try {
        const { data: categories, error } = await supabase
            .from('files')
            .select('category')
            .not('category', 'is', null);

        if (error) {
            console.error('Error loading categories:', error);
            return;
        }

        const uniqueCategories = [...new Set(categories.map(c => c.category))];
        const navContainer = document.getElementById('categoriesNav');
        
        if (navContainer) {
            navContainer.innerHTML = uniqueCategories.map(category => `
                <a href="#" class="nav-category-item" onclick="filterByCategory('${category}')">
                    <i class="fas fa-folder"></i>
                    ${category}
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error in loadCategoriesNav:', error);
    }
}

// دالة التصفية حسب التصنيف
function filterByCategory(category) {
    const allFiles = document.querySelectorAll('.category-card');
    
    allFiles.forEach(file => {
        const categoryHeader = file.querySelector('.category-header');
        if (categoryHeader.textContent.includes(category)) {
            file.style.display = 'block';
        } else {
            file.style.display = 'none';
        }
    });
}

// دالة عرض كل الملفات
function showAllFiles() {
    const allFiles = document.querySelectorAll('.category-card');
    allFiles.forEach(file => {
        file.style.display = 'block';
    });
}

// تنسيقات إضافية للأحداث المنتهية
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    .event-days.expired {
        background-color: #6c757d !important;
    }
    
    .badge {
        background: #e9ecef;
        color: #495057;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .file-item:hover {
        background-color: #f8f9fa;
        transition: background-color 0.3s ease;
    }
    
    .nav-category-item {
        display: block;
        padding: 8px 16px;
        color: #333;
        text-decoration: none;
        border-radius: 4px;
        margin-bottom: 4px;
        transition: background-color 0.3s ease;
    }
    
    .nav-category-item:hover {
        background-color: #e9ecef;
        color: #007bff;
    }
`;
document.head.appendChild(additionalStyles);

// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", function() {
    // التحقق من صلاحية المنسوب
    if (localStorage.getItem("role") !== "staff") {
        window.location.href = "index.html";
        return;
    }
    
    displayUserName();
    loadFiles();
    loadEvents();
    loadCategoriesNav();
});
