// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const viewToggle = document.getElementById('view-toggle');
const viewMenu = document.getElementById('view-menu');
const viewToggleText = document.getElementById('view-toggle-text');
const themeToggle = document.getElementById('theme-toggle');
const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');
const logoutButton = document.getElementById('logout-button');
const staticView = document.getElementById('static-view');
const dynamicView = document.getElementById('dynamic-view');
const searchFilter = document.getElementById('search-filter');
const exportButton = document.getElementById('export-button');
const staticDateFilter = document.getElementById('static-date-filter');
const staticResetFilter = document.getElementById('static-reset-filter');
const dynamicDateFilter = document.getElementById('dynamic-date-filter');
const dynamicResetFilter = document.getElementById('dynamic-reset-filter');

// Global variables to store CSV data
let allPRData = [];
let filteredPRData = [];
let charts = {
    trend: null,
    status: null,
    contributor: null,
    mergeTime: null
};

// Mock data for demo purposes
const prData = {
    development: 12,
    master: 8,
    release: 5,
    trailsb: 3,
    trendData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        data: [5, 10, 8, 15, 12, 20, 18]
    },
    statusData: {
        labels: ['Open', 'Closed', 'Merged', 'Draft'],
        data: [15, 20, 35, 10],
        colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B']
    },
    contributorData: {
        labels: ['Dev1', 'Dev2', 'Dev3', 'Dev4', 'Dev5'],
        data: [12, 8, 15, 7, 10],
        colors: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F97316']
    },
    mergeTimeData: {
        labels: ['<1h', '1-4h', '4-8h', '8-24h', '1-3d', '>3d'],
        data: [10, 15, 12, 8, 5, 2],
        colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5']
    }
};

// Function to parse CSV data
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        const row = {};
        
        for (let j = 0; j < headers.length; j++) {
            row[headers[j].trim()] = values[j] ? values[j].trim() : '';
        }
        
        data.push(row);
    }
    
    return data;
}

// Function to load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('data/pr_data.csv');
        const csvText = await response.text();
        allPRData = parseCSV(csvText);
        filteredPRData = [...allPRData];
        updateDashboard();
    } catch (error) {
        console.error('Error loading CSV data:', error);
        // Fallback to mock data if CSV fails to load
        alert('Error loading CSV data. Using sample data instead.');
    }
}

// Function to filter data by date
function filterDataByDate(dateString) {
    if (!dateString) {
        filteredPRData = [...allPRData];
    } else {
        const filterDate = new Date(dateString).toISOString().split('T')[0];
        filteredPRData = allPRData.filter(pr => {
            const prDate = new Date(pr.created_at).toISOString().split('T')[0];
            return prDate === filterDate;
        });
    }
    updateDashboard();
}

// Function to count PRs by BaseBranch
function countPRsByBranch() {
    const counts = {
        development: 0,
        master: 0,
        release: 0,
        feature: 0
    };
    
    filteredPRData.forEach(pr => {
        const branch = pr.BaseBranch.toLowerCase();
        if (counts.hasOwnProperty(branch)) {
            counts[branch]++;
        }
    });
    
    return counts;
}

// Function to get PR trend data (last 7 days, weeks, or months)
function getPRTrendData() {
    const dateGroups = {};
    
    filteredPRData.forEach(pr => {
        const date = new Date(pr.created_at).toISOString().split('T')[0];
        dateGroups[date] = (dateGroups[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dateGroups).sort();
    const labels = sortedDates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const data = sortedDates.map(date => dateGroups[date]);
    
    return { labels, data };
}

// Function to get PR status distribution
function getPRStatusData() {
    const statusCounts = {};
    
    filteredPRData.forEach(pr => {
        const status = pr.pr_state || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    return { labels, data, colors: colors.slice(0, labels.length) };
}

// Function to get contributor data
function getContributorData() {
    const contributorCounts = {};
    
    filteredPRData.forEach(pr => {
        const actor = pr.Actor || 'Unknown';
        contributorCounts[actor] = (contributorCounts[actor] || 0) + 1;
    });
    
    // Sort and get top 10 contributors
    const sorted = Object.entries(contributorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);
    const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#EAB308', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'];
    
    return { labels, data, colors: colors.slice(0, labels.length) };
}

// Function to get merge time distribution
function getMergeTimeData() {
    const timeBuckets = {
        '<1h': 0,
        '1-4h': 0,
        '4-8h': 0,
        '8-24h': 0,
        '1-3d': 0,
        '>3d': 0
    };
    
    filteredPRData.forEach(pr => {
        const hours = parseFloat(pr.age_hours) || 0;
        
        if (hours < 1) timeBuckets['<1h']++;
        else if (hours < 4) timeBuckets['1-4h']++;
        else if (hours < 8) timeBuckets['4-8h']++;
        else if (hours < 24) timeBuckets['8-24h']++;
        else if (hours < 72) timeBuckets['1-3d']++;
        else timeBuckets['>3d']++;
    });
    
    const labels = Object.keys(timeBuckets);
    const data = Object.values(timeBuckets);
    const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'];
    
    return { labels, data, colors };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Update theme icon immediately
    setTimeout(() => {
        updateThemeIcon();
    }, 100);

    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUsername = localStorage.getItem('username');
    const savedLoginTime = localStorage.getItem('loginTime');
    
    if (isLoggedIn === 'true' && savedUsername) {
        // User was logged in, restore the session
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        document.getElementById('logged-in-user').textContent = savedUsername;
        if (savedLoginTime) {
            document.getElementById('login-time').textContent = savedLoginTime;
        }
    }

    // Load CSV data
    loadCSVData();

    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts (for demo, would be dynamic in real app)
    initCharts();
    
    // Handle window resize for responsive charts
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!dynamicView.classList.contains('hidden')) {
                updateCharts();
            }
        }, 250);
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const savedTheme = localStorage.getItem('theme');
        // Only apply system theme if user hasn't manually set a preference
        if (!savedTheme) {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            updateThemeIcon();
            if (!dynamicView.classList.contains('hidden')) {
                setTimeout(() => {
                    updateCharts();
                }, 100);
            }
        }
    });
});

function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'password') {
            // Successful login
            loginError.classList.add('hidden');
            loginScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            
            // Set login time
            const now = new Date();
            const loginTime = now.toLocaleTimeString();
            document.getElementById('login-time').textContent = loginTime;
            document.getElementById('logged-in-user').textContent = username;
            
            // Save login state to localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', loginTime);
        } else {
            // Failed login
            loginError.textContent = 'Invalid credentials. Please try again.';
            loginError.classList.remove('hidden');
        }
    });
    // View toggle dropdown
    viewToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMenu.classList.toggle('hidden');
    });
    
    // View selection
    document.querySelectorAll('[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const view = e.target.getAttribute('data-view');
            viewToggleText.textContent = view === 'static' ? 'Static View' : 'Dynamic View';
            viewMenu.classList.add('hidden');
            
            if (view === 'static') {
                staticView.classList.remove('hidden');
                dynamicView.classList.add('hidden');
            } else {
                staticView.classList.add('hidden');
                dynamicView.classList.remove('hidden');
                // Reinitialize charts when switching to dynamic view
                setTimeout(() => {
                    updateCharts();
                    feather.replace();
                }, 100);
            }
        });
    });
// Theme toggle
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    
    // Update icons
    updateThemeIcon();
    
    // Update charts with new theme colors if in dynamic view
    if (!dynamicView.classList.contains('hidden')) {
        setTimeout(() => {
            updateCharts();
        }, 100);
    }
});

function updateThemeIcon() {
    const themeToggleIcon = themeToggle.querySelector('i');
    if (themeToggleIcon) {
        const iconName = document.documentElement.classList.contains('dark') ? 'sun' : 'moon';
        themeToggleIcon.setAttribute('data-feather', iconName);
        feather.replace();
    }
}

// Initialize theme icon on load
updateThemeIcon();
// Settings menu toggle
    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });
    // Close menus when clicking outside
    document.addEventListener('click', () => {
        settingsMenu.classList.add('hidden');
        viewMenu.classList.add('hidden');
    });
    
    // Prevent closing when clicking inside menus
    viewMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
// Logout button
    logoutButton.addEventListener('click', () => {
        loginScreen.classList.remove('hidden');
        dashboard.classList.add('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Clear login state from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
    });
    
    // Export button
    exportButton.addEventListener('click', () => {
        alert('Export functionality would be implemented here');
    });
    
    // Static view date filter
    staticDateFilter.addEventListener('change', (e) => {
        filterDataByDate(e.target.value);
    });
    
    staticResetFilter.addEventListener('click', () => {
        staticDateFilter.value = '';
        filterDataByDate('');
    });
    
    // Dynamic view date filter
    dynamicDateFilter.addEventListener('change', (e) => {
        filterDataByDate(e.target.value);
    });
    
    dynamicResetFilter.addEventListener('click', () => {
        dynamicDateFilter.value = '';
        filterDataByDate('');
    });
}

// Function to update dashboard with current filtered data
function updateDashboard() {
    // Update static view counters
    const branchCounts = countPRsByBranch();
    document.getElementById('dev-count').textContent = branchCounts.development;
    document.getElementById('master-count').textContent = branchCounts.master;
    document.getElementById('release-count').textContent = branchCounts.release;
    document.getElementById('trailsb-count').textContent = branchCounts.feature;
    
    // Update dynamic view charts
    updateCharts();
}

function updateCharts() {
    const trendData = getPRTrendData();
    const statusData = getPRStatusData();
    const contributorData = getContributorData();
    const mergeTimeData = getMergeTimeData();
    
    // Destroy existing charts before creating new ones
    if (charts.trend) charts.trend.destroy();
    if (charts.status) charts.status.destroy();
    if (charts.contributor) charts.contributor.destroy();
    if (charts.mergeTime) charts.mergeTime.destroy();
    
    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#E5E7EB' : '#374151';
    const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
    
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColor,
                    font: {
                        size: window.innerWidth < 768 ? 9 : 11
                    }
                },
                grid: {
                    color: gridColor
                }
            },
            y: {
                ticks: {
                    color: textColor,
                    font: {
                        size: window.innerWidth < 768 ? 10 : 12
                    }
                },
                grid: {
                    color: gridColor
                }
            }
        }
    };
    
    // PR Trend Chart (Line)
    const trendCtx = document.getElementById('pr-trend-chart');
    if (trendCtx) {
        charts.trend = new Chart(trendCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'PRs Created',
                    data: trendData.data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 11
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // PR Status Chart (Doughnut)
    const statusCtx = document.getElementById('pr-status-chart');
    if (statusCtx) {
        charts.status = new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: statusData.labels,
                datasets: [{
                    data: statusData.data,
                    backgroundColor: statusData.colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'right',
                        labels: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            padding: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                }
            }
        });
    }
    
    // Contributor Chart (Bar)
    const contributorCtx = document.getElementById('contributor-chart');
    if (contributorCtx) {
        charts.contributor = new Chart(contributorCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: contributorData.labels,
                datasets: [{
                    label: 'PRs Created',
                    data: contributorData.data,
                    backgroundColor: contributorData.colors,
                    borderRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 11
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Merge Time Chart (Bar)
    const mergeTimeCtx = document.getElementById('merge-time-chart');
    if (mergeTimeCtx) {
        charts.mergeTime = new Chart(mergeTimeCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: mergeTimeData.labels,
                datasets: [{
                    label: 'PRs',
                    data: mergeTimeData.data,
                    backgroundColor: mergeTimeData.colors,
                    borderRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 11
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

function initCharts() {
    // Update counters and charts with current data
    updateDashboard();
}