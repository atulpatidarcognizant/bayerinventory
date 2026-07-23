// Initialize Lucide icons
lucide.createIcons();

// --- Toast Notification System ---
window.showToast = function(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    
    // Remove after animation completes (3s total)
    setTimeout(() => {
        if(toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            screens.forEach(screen => screen.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Hide Copilot Panel on Workflow and Inventory screens
            const copilotPanel = document.querySelector('.copilot-panel');
            if (copilotPanel) {
                if (targetId === 'workflow' || targetId === 'inventory') {
                    copilotPanel.style.display = 'none';
                } else {
                    copilotPanel.style.display = 'flex';
                }
            }
            
            lucide.createIcons();
            lucide.createIcons();
        });
    });

    // --- Helper to switch screens programmatically ---
    window.switchScreen = function(targetId) {
        navItems.forEach(nav => nav.classList.remove('active'));
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (targetNav) targetNav.classList.add('active');
        
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) targetScreen.classList.add('active');
        
        const copilotPanel = document.querySelector('.copilot-panel');
        if (copilotPanel) {
            if (targetId === 'workflow' || targetId === 'inventory') {
                copilotPanel.style.display = 'none';
            } else {
                copilotPanel.style.display = 'flex';
            }
        }
        lucide.createIcons();
        window.scrollTo(0,0);
    };

    // --- Role Toggling Logic ---
    const btnAccountManager = document.getElementById('btn-role-account-manager');
    const btnDistributor = document.getElementById('btn-role-distributor');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');

    if (btnAccountManager && btnDistributor) {
        btnAccountManager.addEventListener('click', () => {
            btnAccountManager.classList.add('active');
            btnDistributor.classList.remove('active');
            document.body.setAttribute('data-persona', 'account-manager');
            profileAvatar.textContent = 'AM';
            profileName.textContent = 'Sarah Jenkins';
            profileRole.textContent = 'Account Manager';
            if(window.showToast) window.showToast('Switched to Account Manager View.');
            if(window.lucide) window.lucide.createIcons();
        });
        
        btnDistributor.addEventListener('click', () => {
            btnDistributor.classList.add('active');
            btnAccountManager.classList.remove('active');
            document.body.setAttribute('data-persona', 'distributor');
            profileAvatar.textContent = 'DV';
            profileName.textContent = 'Demo Distributor';
            profileRole.textContent = 'Distributor Partner';
            if(window.showToast) window.showToast('Switched to Distributor View.');
            if(window.lucide) window.lucide.createIcons();
        });
        
        // Initialize default persona
        document.body.setAttribute('data-persona', 'distributor');
    }

    // --- Upload Pipeline Simulation ---
    const btnUpload = document.getElementById('btn-upload');
    const dropZone = document.getElementById('drop-zone');
    const uploadPipeline = document.getElementById('upload-pipeline');

    if (btnUpload && dropZone && uploadPipeline) {
        const triggerUpload = () => {
            dropZone.classList.add('hidden');
            uploadPipeline.classList.remove('hidden');
            
            const steps = uploadPipeline.querySelectorAll('.step');
            let currentStep = 0;
            
            const interval = setInterval(() => {
                if (currentStep < steps.length - 1) {
                    steps[currentStep].classList.remove('active');
                    currentStep++;
                    steps[currentStep].classList.add('active');
                } else {
                    clearInterval(interval);
                    showToast('AI Pipeline complete.');
                    setTimeout(() => {
                        document.getElementById('processing-results').classList.remove('hidden');
                    }, 500);
                }
            }, 800);
        };

        btnUpload.addEventListener('click', triggerUpload);
        
        // dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        // dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
        // dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); triggerUpload(); });
    }

    // --- AI Product Matching Interactions ---
    let currentRowContext = null;

    window.approveMapping = function(btn) {
        const row = btn.closest('tr');
        const reasonCell = row.querySelector('.ai-reason-cell');
        // If it wasn't manually overridden, we just mark it approved
        if(!reasonCell.querySelector('.badge').textContent.includes('Account Manager Approved')) {
            showToast('Mapping saved. Future uploads from this distributor will automatically use this Bayer product.');
            const actionsCell = row.querySelector('.actions');
            actionsCell.innerHTML = '<span class="text-sm text-green flex-align"><i data-lucide="check" class="mr-1"></i> Approved</span>';
            lucide.createIcons();
        }
    };

    window.markNoEquivalent = function(btn) {
        const row = btn.closest('tr');
        row.querySelector('.match-name').textContent = 'No Bayer Equivalent';
        row.querySelector('.match-name').classList.add('text-secondary');
        showToast('Mapping marked as No Equivalent.');
        const actionsCell = row.querySelector('.actions');
        actionsCell.innerHTML = '<span class="text-sm text-red flex-align"><i data-lucide="slash" class="mr-1"></i> No Equivalent</span>';
        lucide.createIcons();
    };

    window.openProductModal = function(btn) {
        currentRowContext = btn.closest('tr');
        document.getElementById('product-search-modal').classList.remove('hidden');
    };

    window.confirmProductSelection = function(productName) {
        if(currentRowContext) {
            // Update the suggested product name
            currentRowContext.querySelector('.match-name').innerHTML = `<strong>${productName}</strong>`;
            
            // Update the confidence badge to "Account Manager Approved" and add "Manual Selection by Account Manager"
            const reasonCell = currentRowContext.querySelector('.ai-reason-cell');
            const badge = reasonCell.querySelector('.badge');
            badge.className = 'badge badge-med mb-1';
            badge.innerHTML = '<i data-lucide="user" class="inline-icon"></i> Account Manager Approved';
            
            const manualNote = document.createElement('div');
            manualNote.className = 'text-xs text-blue mt-1 font-medium';
            manualNote.textContent = 'Manual Selection by Account Manager';
            reasonCell.insertBefore(manualNote, reasonCell.children[1]);

            // Show override note
            const overrideNote = reasonCell.querySelector('.override-note');
            if(overrideNote) overrideNote.classList.remove('hidden');

            // Show success toast
            showToast('Mapping saved. Future uploads from this distributor will automatically use this Bayer product.');
            
            // Update actions to show approved status
            const actionsCell = currentRowContext.querySelector('.actions');
            actionsCell.innerHTML = '<span class="text-sm text-green flex-align"><i data-lucide="check" class="mr-1"></i> Confirmed</span>';
            
            document.getElementById('product-search-modal').classList.add('hidden');
            lucide.createIcons();
        }
    };

    // --- AI Copilot Chat Logic ---
    window.sendPrompt = function(text) {
        if (!text.trim()) return;
        
        const history = document.getElementById('chat-history');
        const input = document.getElementById('chat-input');
        
        // Add User Bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble';
        userBubble.style.alignSelf = 'flex-end';
        userBubble.style.background = 'var(--primary-blue)';
        userBubble.style.color = 'white';
        userBubble.style.borderTopRightRadius = '4px';
        userBubble.textContent = text;
        history.appendChild(userBubble);
        
        input.value = '';
        history.scrollTop = history.scrollHeight;
        
        // Simulate AI Response
        setTimeout(() => {
            const aiBubble = document.createElement('div');
            aiBubble.className = 'chat-bubble ai-bubble';
            if (text.toLowerCase().includes('overdue')) {
                aiBubble.textContent = 'Navigating to the Dashboard. 18 distributors have not uploaded inventory in the last 7 days.';
                if (window.openAnalytics) {
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
                    document.querySelector('.nav-item[data-target="dashboard"]').classList.add('active');
                    document.getElementById('dashboard').classList.add('active');
                    if (window.filterDistributorTable) window.filterDistributorTable('overdue');
                }
            } else if (text.toLowerCase().includes('overstock') || text.toLowerCase().includes('transfers')) {
                aiBubble.textContent = 'Distributor Alpha has excess Luna Experience inventory that could support Distributor Omega. Opening Analytics view...';
                if (window.openAnalytics) window.openAnalytics('overstock');
            } else if (text.toLowerCase().includes('stock-out') || text.toLowerCase().includes('risks')) {
                aiBubble.textContent = 'Three distributors are projected to stock out within the next week. Navigating to Understock Analytics view...';
                if (window.openAnalytics) window.openAnalytics('understock');
            } else {
                aiBubble.textContent = 'I have analyzed that request. Navigating you to the relevant insights now...';
            }
            history.appendChild(aiBubble);
            history.scrollTop = history.scrollHeight;
        }, 1000);
    };

    // --- Territory Map Logic (Account Manager View) ---
    const territoryLayer = document.getElementById('territory-layer');
    const distributorTable = document.getElementById('distributor-table');

    const distributorData = [
        { id: 'abc', name: 'ABC Seeds', cx: 200, cy: 120, status: 'high' },
        { id: 'greencrop', name: 'GreenCrop Distribution', cx: 350, cy: 180, status: 'high' },
        { id: 'farmpro', name: 'FarmPro Solutions', cx: 500, cy: 100, status: 'med' },
        { id: 'agromax', name: 'AgroMax Partners', cx: 620, cy: 160, status: 'low' },
        { id: 'valleycrop', name: 'Valley Crop Services', cx: 280, cy: 260, status: 'high' },
        { id: 'midwest', name: 'Midwest Ag Supply', cx: 480, cy: 280, status: 'med' }
    ];

    const renderTerritoryMap = () => {
        if (!territoryLayer) return;
        territoryLayer.innerHTML = '';

        const colors = {
            'high': 'rgba(16, 185, 129, 0.5)',
            'med': 'rgba(245, 158, 11, 0.5)',
            'low': 'rgba(239, 68, 68, 0.5)'
        };
        const strokeColors = {
            'high': '#10B981',
            'med': '#F59E0B',
            'low': '#EF4444'
        };

        distributorData.forEach(dist => {
            // Heat spot
            const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            spot.setAttribute('cx', dist.cx);
            spot.setAttribute('cy', dist.cy);
            spot.setAttribute('r', dist.status === 'low' ? 35 : (dist.status === 'high' ? 45 : 30));
            spot.setAttribute('fill', colors[dist.status]);
            spot.setAttribute('filter', 'blur(10px)');
            spot.setAttribute('id', `spot-${dist.id}`);
            spot.style.transition = 'all 0.3s ease';
            territoryLayer.appendChild(spot);

            // Marker Group
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${dist.cx}, ${dist.cy})`);
            
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', 0);
            marker.setAttribute('cy', 0);
            marker.setAttribute('r', 6);
            marker.setAttribute('fill', strokeColors[dist.status]);
            marker.setAttribute('stroke', 'white');
            marker.setAttribute('stroke-width', 2);
            marker.setAttribute('id', `marker-${dist.id}`);
            marker.style.transition = 'all 0.3s ease';
            g.appendChild(marker);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 12);
            text.setAttribute('y', 4);
            text.setAttribute('font-size', '13');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', '#1E293B');
            text.textContent = dist.name;
            g.appendChild(text);

            territoryLayer.appendChild(g);
        });
    };

    if (territoryLayer) {
        renderTerritoryMap();

        // Wire up hover events from table to map
        if (distributorTable) {
            const rows = distributorTable.querySelectorAll('tbody tr[data-dist-id]');
            rows.forEach(row => {
                row.addEventListener('mouseenter', () => {
                    const id = row.getAttribute('data-dist-id');
                    row.style.background = '#F1F5F9';
                    
                    // Highlight marker
                    const marker = document.getElementById(`marker-${id}`);
                    const spot = document.getElementById(`spot-${id}`);
                    if (marker) marker.setAttribute('r', 8);
                    if (spot) {
                        const currentR = parseInt(spot.getAttribute('r'));
                        spot.setAttribute('r', currentR + 10);
                        spot.style.opacity = '0.8';
                    }
                });
                row.addEventListener('mouseleave', () => {
                    const id = row.getAttribute('data-dist-id');
                    row.style.background = 'transparent';
                    
                    // Reset marker
                    const marker = document.getElementById(`marker-${id}`);
                    const spot = document.getElementById(`spot-${id}`);
                    if (marker) marker.setAttribute('r', 6);
                    if (spot) {
                        const dist = distributorData.find(d => d.id === id);
                        const originalR = dist.status === 'low' ? 35 : (dist.status === 'high' ? 45 : 30);
                        spot.setAttribute('r', originalR);
                        spot.style.opacity = '1';
                    }
                });
            });
        }
    }

});

// --- Inventory Request Modal Logic ---
window.openRequestModal = function(distributorName) {
    document.getElementById('request-distributor-name').textContent = distributorName;
    document.getElementById('request-modal').classList.remove('hidden');
};

window.sendInventoryRequest = function(type) {
    document.getElementById('request-modal').classList.add('hidden');
    // Using the existing showToast function from app.js
    if (typeof window.showToast === 'function') {
        window.showToast(`Inventory Request Sent via ${type}`);
    } else {
        alert(`Inventory Request Sent via ${type}`);
    }
};

// --- Workflow Tabs Logic ---
window.switchMatchingTab = function(tabId) {
    // Update tab styling
    document.querySelectorAll('.workflow-tab').forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update table body
    document.getElementById('tbody-new').classList.add('hidden');
    document.getElementById('tbody-awaiting').classList.add('hidden');
    document.getElementById('tbody-completed').classList.add('hidden');
    
    document.getElementById('tbody-' + tabId).classList.remove('hidden');
    
    // Re-initialize lucide icons for the newly visible section
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// --- P2 Synchronization Logic ---
window.openAnalytics = function(viewType) {
    // Navigate to the inventory screen
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    // Ensure insights tab is active
    if(window.switchInventoryTab) window.switchInventoryTab('insights');

    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    
    const inventoryNav = document.querySelector('.nav-item[data-target="inventory"]');
    if (inventoryNav) inventoryNav.classList.add('active');
    
    document.getElementById('inventory').classList.add('active');

    // Toggle the correct view based on the card clicked
    const overstockView = document.getElementById('analytics-overstock');
    const understockView = document.getElementById('analytics-understock');
    
    if (viewType === 'overstock') {
        if(overstockView) overstockView.classList.remove('hidden');
        if(understockView) understockView.classList.add('hidden');
    } else if (viewType === 'understock' || viewType === 'critical') {
        if(overstockView) overstockView.classList.add('hidden');
        if(understockView) understockView.classList.remove('hidden');
    }
    
    if (window.lucide) window.lucide.createIcons();
};

window.filterDistributorTable = function(filterType) {
    const table = document.getElementById('distributor-coverage-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let hiddenCount = 0;
    
    rows.forEach(row => {
        // Simple logic for the prototype: if filterType is overdue, hide 'Healthy' rows
        if (filterType === 'overdue') {
            const statusCell = row.querySelector('td:nth-child(3)').textContent;
            if (statusCell.includes('Healthy')) {
                row.style.display = 'none';
                hiddenCount++;
            } else {
                row.style.display = '';
            }
        }
    });
    
    if (hiddenCount > 0) {
        if (typeof window.showToast === 'function') {
            window.showToast(`Filtered table to show overdue distributors.`);
        }
    }
};


window.switchInventoryTab = function(tabId) {
    // hide all tabs
    document.querySelectorAll('.inv-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.workflow-tab').forEach(tab => tab.classList.remove('active'));
    
    // show selected tab
    const targetTabContent = document.getElementById('inv-tab-' + tabId);
    if (targetTabContent) {
        targetTabContent.classList.remove('hidden');
    }
    
    // set active class on clicked tab button
    const tabs = document.querySelectorAll('.workflow-tabs .workflow-tab');
    for (const t of tabs) {
        if (t.textContent.toLowerCase().includes(tabId)) {
            t.classList.add('active');
        }
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
};
