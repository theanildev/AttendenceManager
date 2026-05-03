document.addEventListener('DOMContentLoaded', () => {
    // State
    let targetPercentage = 75;
    let subjects = [];
    let editingSubjectId = null;

    // DOM Elements
    const targetDisplay = document.getElementById('targetDisplay');
    const totalAttendanceDisplay = document.getElementById('totalAttendanceDisplay');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const subjectList = document.getElementById('subjectList');

    // Buttons
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const editTargetBtn = document.getElementById('editTargetBtn');

    // Modals
    const addSubjectModal = document.getElementById('addSubjectModal');
    const aboutModal = document.getElementById('aboutModal');
    const editTargetModal = document.getElementById('editTargetModal');

    // Close buttons
    const closeAddModal = document.getElementById('closeAddModal');
    const closeAboutModal = document.getElementById('closeAboutModal');
    const closeTargetModal = document.getElementById('closeTargetModal');

    // Form inputs
    const subjectNameInput = document.getElementById('subjectName');
    const totalClassesInput = document.getElementById('totalClasses');
    const attendedClassesInput = document.getElementById('attendedClasses');
    const newTargetInput = document.getElementById('newTarget');

    // Save buttons
    const saveSubjectBtn = document.getElementById('saveSubjectBtn');
    const saveTargetBtn = document.getElementById('saveTargetBtn');

    // Auth DOM Elements
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const nameGroup = document.getElementById('nameGroup');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Auth State
    let isLoginMode = true;

    // Check Login Status
    const currentUser = localStorage.getItem('attendanceCurrentUser');
    if (currentUser) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
    } else {
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
    }

    // Toggle Login/Signup
    if (authSwitchLink) {
        authSwitchLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            
            if (isLoginMode) {
                authTitle.textContent = 'Login';
                nameGroup.style.display = 'none';
                document.getElementById('authName').required = false;
                authSubmitBtn.textContent = 'Login';
                authSwitchText.textContent = "Don't have an account?";
                authSwitchLink.textContent = 'Sign Up';
            } else {
                authTitle.textContent = 'Sign Up';
                nameGroup.style.display = 'block';
                document.getElementById('authName').required = true;
                authSubmitBtn.textContent = 'Sign Up';
                authSwitchText.textContent = 'Already have an account?';
                authSwitchLink.textContent = 'Login';
            }
        });
    }

    // Handle Auth Submit
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const users = JSON.parse(localStorage.getItem('attendanceUsers')) || [];
            
            if (isLoginMode) {
                // Login logic
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    localStorage.setItem('attendanceCurrentUser', JSON.stringify(user));
                    authContainer.style.display = 'none';
                    appContainer.style.display = 'flex';
                    authForm.reset();
                } else {
                    alert('Invalid email or password!');
                }
            } else {
                // Signup logic
                if (users.find(u => u.email === email)) {
                    alert('Email already exists!');
                    return;
                }
                
                const name = document.getElementById('authName').value;
                const newUser = { name, email, password };
                users.push(newUser);
                localStorage.setItem('attendanceUsers', JSON.stringify(users));
                localStorage.setItem('attendanceCurrentUser', JSON.stringify(newUser));
                
                authContainer.style.display = 'none';
                appContainer.style.display = 'flex';
                authForm.reset();
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('attendanceCurrentUser');
                appContainer.style.display = 'none';
                authContainer.style.display = 'flex';
                
                // Switch back to login mode if not already
                if (!isLoginMode) {
                    authSwitchLink.click();
                }
            }
        });
    }

    // Initialize date
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Load Data
    function loadData() {
        const storedTarget = localStorage.getItem('attendanceTarget');
        if (storedTarget) targetPercentage = parseFloat(storedTarget);
        
        const storedSubjects = localStorage.getItem('attendanceSubjects');
        if (storedSubjects) {
            subjects = JSON.parse(storedSubjects);
        }
        updateUI();
    }

    // Save Data
    function saveData() {
        localStorage.setItem('attendanceTarget', targetPercentage);
        localStorage.setItem('attendanceSubjects', JSON.stringify(subjects));
    }

    // Open Modal
    function openModal(modal) {
        modal.classList.add('show');
    }

    // Close Modal
    function closeModal(modal) {
        modal.classList.remove('show');
    }

    // Event Listeners for Modals
    addSubjectBtn.addEventListener('click', () => {
        editingSubjectId = null;
        document.querySelector('#addSubjectModal h2').textContent = 'Add New Subject';
        subjectNameInput.value = '';
        totalClassesInput.value = '';
        attendedClassesInput.value = '';
        openModal(addSubjectModal);
    });
    aboutBtn.addEventListener('click', () => openModal(aboutModal));
    editTargetBtn.addEventListener('click', () => {
        newTargetInput.value = targetPercentage;
        openModal(editTargetModal);
    });

    closeAddModal.addEventListener('click', () => closeModal(addSubjectModal));
    closeAboutModal.addEventListener('click', () => closeModal(aboutModal));
    closeTargetModal.addEventListener('click', () => closeModal(editTargetModal));

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addSubjectModal) closeModal(addSubjectModal);
        if (e.target === aboutModal) closeModal(aboutModal);
        if (e.target === editTargetModal) closeModal(editTargetModal);
        
        // Close dropdowns if clicked outside
        if (!e.target.closest('.card-menu-container')) {
            document.querySelectorAll('.menu-dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });

    // Save Target
    saveTargetBtn.addEventListener('click', () => {
        const target = parseFloat(newTargetInput.value);
        if (target > 0 && target <= 100) {
            targetPercentage = target;
            saveData();
            updateUI();
            closeModal(editTargetModal);
        } else {
            alert('Please enter a valid percentage (1-100)');
        }
    });

    // Save Subject
    saveSubjectBtn.addEventListener('click', () => {
        const name = subjectNameInput.value.trim();
        const total = parseInt(totalClassesInput.value);
        const attended = parseInt(attendedClassesInput.value);

        if (!name || isNaN(total) || isNaN(attended) || attended > total || total <= 0) {
            alert('Please enter valid subject details. Attended classes cannot be greater than total classes.');
            return;
        }

        if (editingSubjectId !== null) {
            const subject = subjects.find(s => s.id === editingSubjectId);
            if (subject) {
                subject.name = name;
                subject.total = total;
                subject.attended = attended;
            }
        } else {
            const newSubject = {
                id: Date.now(),
                name,
                total,
                attended
            };
            subjects.push(newSubject);
        }

        saveData();
        updateUI();
        closeModal(addSubjectModal);
    });

    // Toggle Dropdown Menu
    window.toggleMenu = function(id) {
        // Close others
        document.querySelectorAll('.menu-dropdown.show').forEach(dropdown => {
            if (dropdown.id !== `dropdown-${id}`) dropdown.classList.remove('show');
        });
        const dropdown = document.getElementById(`dropdown-${id}`);
        if (dropdown) dropdown.classList.toggle('show');
    };

    // Edit Subject Function
    window.editSubject = function(id) {
        const subject = subjects.find(s => s.id === id);
        if (subject) {
            editingSubjectId = subject.id;
            document.querySelector('#addSubjectModal h2').textContent = 'Edit Subject';
            subjectNameInput.value = subject.name;
            totalClassesInput.value = subject.total;
            attendedClassesInput.value = subject.attended;
            
            // Close dropdown
            const dropdown = document.getElementById(`dropdown-${id}`);
            if (dropdown) dropdown.classList.remove('show');
            
            openModal(addSubjectModal);
        }
    };

    // Update Attendance Function
    window.updateAttendance = function(id, isPresent) {
        const subject = subjects.find(s => s.id === id);
        if (subject) {
            if (isPresent) {
                subject.attended++;
                subject.total++;
            } else {
                subject.total++;
            }
            saveData();
            updateUI();
        }
    };

    // Delete Subject Function
    window.deleteSubject = function(id) {
        if (confirm('Are you sure you want to delete this subject?')) {
            subjects = subjects.filter(s => s.id !== id);
            saveData();
            updateUI();
        }
    };

    // Calculate Status text
    function getStatusText(attended, total, target) {
        const currentPercentage = (attended / total);
        const targetFraction = target / 100;

        if (currentPercentage < targetFraction) {
            // Need to attend
            const classesToAttend = Math.ceil((targetFraction * total - attended) / (1 - targetFraction));
            return `Status: You have to attend next ${classesToAttend} class${classesToAttend > 1 ? 'es' : ''} to reach target`;
        } else if (currentPercentage > targetFraction) {
            // Can leave
            const classesCanLeave = Math.floor(attended / targetFraction - total);
            if (classesCanLeave === 0) {
                 return `Status: On Track, You can't miss the next class`;
            }
            return `Status: On Track, You may leave next ${classesCanLeave} class${classesCanLeave > 1 ? 'es' : ''}`;
        } else {
            // Exactly on target
            return `Status: On Track, You can't miss the next class`;
        }
    }

    // Update UI
    function updateUI() {
        targetDisplay.textContent = `${targetPercentage}%`;
        subjectList.innerHTML = '';
        
        let totalAttended = 0;
        let totalClassesAll = 0;

        subjects.forEach(subject => {
            totalAttended += subject.attended;
            totalClassesAll += subject.total;

            const percentage = subject.total === 0 ? 0 : ((subject.attended / subject.total) * 100).toFixed(1);
            const status = getStatusText(subject.attended, subject.total, targetPercentage);
            
            // Determine color based on target
            const isBelowTarget = parseFloat(percentage) < targetPercentage;
            const progressColor = isBelowTarget ? 'var(--accent-red)' : 'var(--accent-green)';

            const card = document.createElement('div');
            card.className = 'subject-card';
            if (isBelowTarget) {
                card.style.borderLeftColor = 'var(--accent-red)';
            }

            card.innerHTML = `
                <div class="card-menu-container">
                    <button class="menu-btn" onclick="toggleMenu(${subject.id})">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <div class="menu-dropdown" id="dropdown-${subject.id}">
                        <button onclick="editSubject(${subject.id})"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="delete-text" onclick="deleteSubject(${subject.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                </div>
                <div class="subject-info">
                    <h3>${subject.name}</h3>
                    <p>Attendance: ${subject.attended}/${subject.total}</p>
                    <p class="status">${status}</p>
                </div>
                <div class="card-actions-right">
                    <div class="progress-circle" style="background: conic-gradient(${progressColor} ${percentage * 3.6}deg, var(--bg-dark) 0deg);">
                        <span class="progress-value">${percentage}%</span>
                    </div>
                    <div class="quick-actions">
                        <button class="action-btn present" onclick="updateAttendance(${subject.id}, true)" title="Mark Present">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="action-btn absent" onclick="updateAttendance(${subject.id}, false)" title="Mark Absent">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            `;
            subjectList.appendChild(card);
        });

        const overallPercentage = totalClassesAll === 0 ? 0 : ((totalAttended / totalClassesAll) * 100).toFixed(2);
        totalAttendanceDisplay.textContent = `${overallPercentage}%`;
    }

    // Initial Load
    loadData();
});
