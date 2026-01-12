// Dummy Forms Data
const formsData = {
    today: [
        { id: 1, title: 'Form 1', time: '12:06' },
        { id: 2, title: 'Old 2', time: '13:06', highlighted: true },
        { id: 3, title: 'Form 3', time: '14:14' },
        { id: 4, title: 'Form 4', time: '15:05' },
        { id: 5, title: 'Form 5', time: '16:71' },
        { id: 6, title: 'Form 6', time: '17:02' },
        { id: 7, title: 'Form 7', time: '18:00' },
        { id: 8, title: 'Super senor', time: '67:67' }
    ],
    yesterday: [
        { id: 9, title: 'Customer Survey', time: '10:30' },
        { id: 10, title: 'Employee Feedback', time: '14:45' },
        { id: 11, title: 'Product Review', time: '16:20' }
    ],
    '2days': [
        { id: 12, title: 'Event Registration', time: '09:15' },
        { id: 13, title: 'Feedback Form', time: '11:30' }
    ]
};

// Render Table
function renderForms(tab = 'today') {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    const forms = formsData[tab] || [];

    forms.forEach(form => {
        const row = document.createElement('div');
        row.className = `table-row ${form.highlighted ? 'highlighted' : ''}`;
        
        row.innerHTML = `
            <div class="row-title">
                <div class="row-icon">
                    <img src="../assets/icons/homepage/doc-icon.svg" alt="Form" style="width: 16px; height: 16px;" class="row-doc-icon">
                </div>
                <span class="row-title-text">${form.title}</span>
            </div>
            <div class="row-time">${form.time}</div>
            <div class="row-action">
                <img src="../assets/icons/homepage/more-vertical.svg" alt="More">
            </div>
        `;

        tableBody.appendChild(row);

        // Add click event for more options
        row.querySelector('.row-action')?.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('More options for:', form.title);
        });

        // Add click event for row
        row.addEventListener('click', () => {
            console.log('Opened form:', form.title);
        });
    });
}

// Tab Switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');

            // Render forms for selected tab
            const tab = btn.dataset.tab;
            renderForms(tab);
        });
    });
}

// Create New Form Card Click
function setupCreateCard() {
    const createCard = document.querySelector('.create-card');
    
    if (createCard) {
        createCard.addEventListener('click', () => {
            console.log('Navigate to create new form');
            // window.location.href = 'create-form.html';
        });
    }
}

// Recent Form Card Click
function setupRecentCard() {
    const recentCard = document.querySelector('.recent-card');
    
    if (recentCard) {
        recentCard.addEventListener('click', () => {
            console.log('Navigate to recent form');
            // window.location.href = 'form-details.html';
        });
    }
}

// More Vertical Icon Hover
function setupMoreVerticalHover() {
    const tableBody = document.getElementById('table-body');
    
    if (tableBody) {
        tableBody.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.table-row')) {
                const row = e.target.closest('.table-row');
                const img = row.querySelector('.row-action img');
                if (img && img.src.includes('more-vertical.svg') && !img.src.includes('hover')) {
                    img.src = '../assets/icons/homepage/more-vertical-hover.svg';
                }
            }
        }, true);

        tableBody.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.table-row')) {
                const row = e.target.closest('.table-row');
                const img = row.querySelector('.row-action img');
                if (img && img.src.includes('more-vertical-hover.svg')) {
                    img.src = '../assets/icons/homepage/more-vertical.svg';
                }
            }
        }, true);
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            console.log('Searching for:', query);
            
            const rows = document.querySelectorAll('.table-row');
            rows.forEach(row => {
                const title = row.querySelector('.row-title-text').textContent.toLowerCase();
                if (title.includes(query)) {
                    row.style.display = 'grid';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Setup Form Cards
function setupFormCards() {
    const formWrappers = document.querySelectorAll('.form-image-wrapper');
    
    formWrappers.forEach(wrapper => {
        wrapper.addEventListener('mouseenter', () => {
            const moreHover = wrapper.querySelector('.icon-more-hover');
            const more = wrapper.querySelector('.icon-more');
            if (moreHover) {
                moreHover.style.display = 'block';
            }
            if (more) {
                more.style.display = 'none';
            }
        });
        
        wrapper.addEventListener('mouseleave', () => {
            const moreHover = wrapper.querySelector('.icon-more-hover');
            const more = wrapper.querySelector('.icon-more');
            if (moreHover) {
                moreHover.style.display = 'block';
            }
            if (more) {
                more.style.display = 'block';
            }
        });
    });
}

// Profile Icon Click
function setupProfile() {
    const profileIcon = document.querySelector('.header-right img');
    
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            console.log('Open profile menu');
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderForms('today');
    setupTabs();
    setupCreateCard();
    setupRecentCard();
    setupFormCards();
    setupMoreVerticalHover();
    setupSearch();
    setupProfile();
});
