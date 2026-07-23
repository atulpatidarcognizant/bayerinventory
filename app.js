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

    // --- Regional Heatmap Logic ---
    const heatmapCountry = document.getElementById('heatmap-country');
    const heatmapProduct = document.getElementById('heatmap-product');
    const heatmapLayer = document.getElementById('heatmap-layer');

    const regionData = {
        'all': [
            { cx: 200, cy: 150, name: 'North America', status: 'high' },
            { cx: 450, cy: 180, name: 'Europe', status: 'high' },
            { cx: 600, cy: 120, name: 'APAC', status: 'low' },
            { cx: 350, cy: 250, name: 'LATAM', status: 'med' }
        ],
        'us': [
            { cx: 160, cy: 140, name: 'Midwest (Corn Belt)', status: 'high' },
            { cx: 240, cy: 160, name: 'Southeast', status: 'med' },
            { cx: 120, cy: 170, name: 'West Coast', status: 'low' }
        ],
        'br': [
            { cx: 330, cy: 230, name: 'Mato Grosso', status: 'high' },
            { cx: 370, cy: 270, name: 'São Paulo', status: 'med' }
        ],
        'de': [
            { cx: 440, cy: 170, name: 'North Rhine-Westphalia', status: 'high' },
            { cx: 460, cy: 190, name: 'Bavaria', status: 'med' }
        ],
        'in': [
            { cx: 580, cy: 130, name: 'Punjab/Haryana', status: 'med' },
            { cx: 610, cy: 160, name: 'Maharashtra', status: 'low' }
        ]
    };

    const renderHeatmap = () => {
        if (!heatmapLayer) return;
        // Use default 'all' region and 'all' product
        const country = heatmapCountry ? heatmapCountry.value : 'all';
        const product = heatmapProduct ? heatmapProduct.value : 'all';
        
        heatmapLayer.innerHTML = ''; // Clear previous
        
        const regions = regionData[country] || regionData['all'];
        
        regions.forEach(region => {
            // Adjust status randomly slightly if a specific product is selected to simulate filtering
            let renderStatus = region.status;
            if (product !== 'all') {
                const statuses = ['high', 'med', 'low'];
                // Pseudo-random but consistent based on name length + product length
                const idx = (region.name.length + product.length) % 3;
                renderStatus = statuses[idx];
            }

            // Colors for spots
            const colors = {
                'high': 'rgba(16, 185, 129, 0.5)',
                'med': 'rgba(0, 58, 112, 0.4)',
                'low': 'rgba(239, 68, 68, 0.5)'
            };
            const strokeColors = {
                'high': '#10B981',
                'med': '#003A70',
                'low': '#EF4444'
            };

            // Draw blurry heat spot
            const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            spot.setAttribute('cx', region.cx);
            spot.setAttribute('cy', region.cy);
            spot.setAttribute('r', renderStatus === 'low' ? 30 : (renderStatus === 'high' ? 50 : 40));
            spot.setAttribute('fill', colors[renderStatus]);
            spot.setAttribute('filter', 'blur(12px)');
            heatmapLayer.appendChild(spot);

            // Draw Marker Group
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${region.cx}, ${region.cy})`);
            
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', 0);
            marker.setAttribute('cy', 0);
            marker.setAttribute('r', 6);
            marker.setAttribute('fill', strokeColors[renderStatus]);
            marker.setAttribute('stroke', 'white');
            marker.setAttribute('stroke-width', 2);
            g.appendChild(marker);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 12);
            text.setAttribute('y', 4);
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', '#1E293B');
            
            // Text values based on status
            const val = renderStatus === 'high' ? '>90%' : (renderStatus === 'med' ? '70-90%' : '<70%');
            text.textContent = `${region.name} (${val})`;
            g.appendChild(text);

            heatmapLayer.appendChild(g);
        });
    };

    if (heatmapCountry) {
        heatmapCountry.addEventListener('change', renderHeatmap);
    }
    if (heatmapProduct) {
        heatmapProduct.addEventListener('change', renderHeatmap);
    }
    // Always render initially
    renderHeatmap();
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
