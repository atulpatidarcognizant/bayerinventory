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
            if(window.switchScreen) window.switchScreen('dashboard');
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
            if(window.switchScreen) window.switchScreen('dashboard');
            if(window.lucide) window.lucide.createIcons();
        });
        
        // Initialize default persona
        document.body.setAttribute('data-persona', 'account-manager');
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
    const distributorTbody = document.getElementById('distributor-tbody');
    const territoryRegionSelect = document.getElementById('territory-region');
    const territoryMapSvg = document.getElementById('territory-map-svg');

    // Abstract paths representing the general shape of the regions
    const paths = {
        'gta': 'M100,50 Q150,20 200,60 T300,40 T400,80 T500,30 T600,70 T700,50 L750,150 L650,250 L550,300 L450,280 L350,350 L250,300 L150,250 L50,150 Z',
        'ottawa': 'M150,50 L700,100 L650,350 L100,300 Z',
        'sw': 'M50,100 Q150,50 300,150 T600,100 T750,250 L700,350 L400,300 L200,350 Z',
        'central': 'M100,100 L400,50 L700,100 L750,300 L400,350 L50,250 Z',
        'eastern': 'M300,50 L700,150 L650,300 L100,350 L150,150 Z',
        'northern': 'M50,50 L750,50 L700,350 L100,350 Z'
    };

    const territoryData = {
        'gta': {
            path: paths.gta,
            health: { healthy: '89%', overstock: '3%', warning: '7%', critical: '1%' },
            distributors: [
                { id: 'abc', name: 'ABC Seeds (Toronto)', cx: 200, cy: 120, status: 'high', orders: 5 },
                { id: 'greencrop', name: 'GreenCrop (Mississauga)', cx: 350, cy: 180, status: 'high', orders: 2 },
                { id: 'farmpro', name: 'FarmPro (Brampton)', cx: 500, cy: 100, status: 'med', orders: 3 },
                { id: 'agromax', name: 'AgroMax (Vaughan)', cx: 620, cy: 160, status: 'low', orders: 7 },
                { id: 'valleycrop', name: 'Valley Crop (Markham)', cx: 280, cy: 260, status: 'high', orders: 1 },
                { id: 'midwest', name: 'Midwest Ag (Burlington)', cx: 480, cy: 280, status: 'med', orders: 4 }
            ]
        },
        'ottawa': {
            path: paths.ottawa,
            health: { healthy: '92%', overstock: '2%', warning: '5%', critical: '1%' },
            distributors: [
                { id: 'ott1', name: 'Capital Ag (Ottawa)', cx: 250, cy: 150, status: 'high', orders: 4 },
                { id: 'ott2', name: 'Valley Seeds (Kanata)', cx: 400, cy: 120, status: 'high', orders: 2 },
                { id: 'ott3', name: 'Eastern Crop (Orleans)', cx: 550, cy: 200, status: 'med', orders: 5 },
                { id: 'ott4', name: 'River Farms (Cornwall)', cx: 300, cy: 250, status: 'high', orders: 1 },
                { id: 'ott5', name: 'Seaway Ag (Brockville)', cx: 500, cy: 280, status: 'low', orders: 8 }
            ]
        },
        'sw': {
            path: paths.sw,
            health: { healthy: '78%', overstock: '5%', warning: '12%', critical: '5%' },
            distributors: [
                { id: 'sw1', name: 'Forest City (London)', cx: 200, cy: 180, status: 'med', orders: 6 },
                { id: 'sw2', name: 'Border Ag (Windsor)', cx: 100, cy: 280, status: 'low', orders: 9 },
                { id: 'sw3', name: 'Dairy Capital (Woodstock)', cx: 350, cy: 150, status: 'high', orders: 2 },
                { id: 'sw4', name: 'Bluewater (Sarnia)', cx: 150, cy: 100, status: 'med', orders: 4 },
                { id: 'sw5', name: 'Kent Seeds (Chatham)', cx: 250, cy: 250, status: 'high', orders: 1 },
                { id: 'sw6', name: 'Lake Erie Ag (St. Thomas)', cx: 450, cy: 220, status: 'high', orders: 3 }
            ]
        },
        'central': {
            path: paths.central,
            health: { healthy: '95%', overstock: '1%', warning: '4%', critical: '0%' },
            distributors: [
                { id: 'cen1', name: 'Simcoe Ag (Barrie)', cx: 300, cy: 150, status: 'high', orders: 2 },
                { id: 'cen2', name: 'Muskoka Farms (Bracebridge)', cx: 450, cy: 100, status: 'high', orders: 1 },
                { id: 'cen3', name: 'Kawartha Seeds (Peterborough)', cx: 550, cy: 250, status: 'med', orders: 3 },
                { id: 'cen4', name: 'Georgian Bay (Owen Sound)', cx: 200, cy: 200, status: 'high', orders: 4 },
                { id: 'cen5', name: 'Bruce Peninsula (Wiarton)', cx: 350, cy: 280, status: 'high', orders: 1 }
            ]
        },
        'eastern': {
            path: paths.eastern,
            health: { healthy: '85%', overstock: '4%', warning: '9%', critical: '2%' },
            distributors: [
                { id: 'eas1', name: 'Limestone Ag (Kingston)', cx: 250, cy: 280, status: 'med', orders: 5 },
                { id: 'eas2', name: 'Quinte Crop (Belleville)', cx: 400, cy: 220, status: 'high', orders: 3 },
                { id: 'eas3', name: 'Prince Edward (Picton)', cx: 550, cy: 300, status: 'low', orders: 6 },
                { id: 'eas4', name: 'Trent Valley (Trenton)', cx: 300, cy: 150, status: 'high', orders: 2 },
                { id: 'eas5', name: 'Shield Farms (Bancroft)', cx: 500, cy: 100, status: 'med', orders: 4 }
            ]
        },
        'northern': {
            path: paths.northern,
            health: { healthy: '80%', overstock: '5%', warning: '10%', critical: '5%' },
            distributors: [
                { id: 'nor1', name: 'Nickel Belt (Sudbury)', cx: 200, cy: 250, status: 'med', orders: 4 },
                { id: 'nor2', name: 'Gateway Ag (North Bay)', cx: 400, cy: 200, status: 'high', orders: 2 },
                { id: 'nor3', name: 'Algoma Crop (Sault Ste. Marie)', cx: 150, cy: 150, status: 'high', orders: 1 },
                { id: 'nor4', name: 'Clay Belt (Timmins)', cx: 350, cy: 100, status: 'low', orders: 5 },
                { id: 'nor5', name: 'Lakehead Seeds (Thunder Bay)', cx: 600, cy: 180, status: 'med', orders: 3 }
            ]
        }
    };

    const renderTerritoryMap = (regionId) => {
        if (!territoryLayer || !distributorTbody) return;
        
        const region = territoryData[regionId];
        if (!region) return;

        // 1. Update Map Shape
        const pathEl = territoryMapSvg.querySelector('path');
        if (pathEl) {
            pathEl.setAttribute('d', region.path);
        }

        // 2. Render Map Markers
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

        region.distributors.forEach(dist => {
            // Group to handle mouse events on the map itself
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', `map-group-${dist.id}`);
            group.style.cursor = 'pointer';

            // SVG native tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${dist.name} - Open Orders: ${dist.orders}`;
            group.appendChild(title);

            // Heat spot
            const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            spot.setAttribute('cx', dist.cx);
            spot.setAttribute('cy', dist.cy);
            const baseRadius = dist.status === 'low' ? 35 : (dist.status === 'high' ? 45 : 30);
            spot.setAttribute('r', baseRadius);
            spot.setAttribute('fill', colors[dist.status]);
            spot.setAttribute('filter', 'blur(10px)');
            spot.setAttribute('id', `spot-${dist.id}`);
            spot.style.transition = 'all 0.3s ease';
            group.appendChild(spot);

            // Marker translation group
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
            text.textContent = dist.name.split(' (')[0]; // Keep map label clean
            g.appendChild(text);

            group.appendChild(g);
            territoryLayer.appendChild(group);

            // Add hover effect from Map -> Table
            group.addEventListener('mouseenter', () => {
                const tr = document.querySelector(`tr[data-dist-id="${dist.id}"]`);
                if (tr) tr.style.background = '#F1F5F9';
                marker.setAttribute('r', 8);
                spot.setAttribute('r', baseRadius + 10);
                spot.style.opacity = '0.8';
            });
            group.addEventListener('mouseleave', () => {
                const tr = document.querySelector(`tr[data-dist-id="${dist.id}"]`);
                if (tr) tr.style.background = 'transparent';
                marker.setAttribute('r', 6);
                spot.setAttribute('r', baseRadius);
                spot.style.opacity = '1';
            });
        });

        // 3. Render Table
        distributorTbody.innerHTML = '';
        const badgeColors = {
            'high': '<span class="badge badge-high" style="background:#DCFCE7; color:var(--status-green); padding:2px 6px;">Healthy</span>',
            'med': '<span class="badge badge-med" style="padding:2px 6px;">Warning</span>',
            'low': '<span class="badge badge-low" style="padding:2px 6px;">Critical</span>'
        };
        const textColors = {
            'high': '<span class="text-green font-medium">Healthy</span>',
            'med': '<span class="text-yellow font-medium">Warning</span>',
            'low': '<span class="text-red font-medium">Critical</span>'
        };

        region.distributors.forEach(dist => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-dist-id', dist.id);
            tr.style.cursor = 'pointer';
            tr.style.transition = 'background 0.2s';
            tr.innerHTML = `
                <td class="font-medium text-dark" style="padding: 8px 12px;">${dist.name}</td>
                <td style="padding: 8px 12px;">${badgeColors[dist.status]}</td>
                <td style="padding: 8px 12px;">${dist.orders}</td>
                <td style="padding: 8px 12px;">${textColors[dist.status]}</td>
            `;
            
            // Add hover effect from Table -> Map
            tr.addEventListener('mouseenter', () => {
                tr.style.background = '#F1F5F9';
                const marker = document.getElementById(`marker-${dist.id}`);
                const spot = document.getElementById(`spot-${dist.id}`);
                const baseRadius = dist.status === 'low' ? 35 : (dist.status === 'high' ? 45 : 30);
                if (marker) marker.setAttribute('r', 8);
                if (spot) {
                    spot.setAttribute('r', baseRadius + 10);
                    spot.style.opacity = '0.8';
                }
            });
            tr.addEventListener('mouseleave', () => {
                tr.style.background = 'transparent';
                const marker = document.getElementById(`marker-${dist.id}`);
                const spot = document.getElementById(`spot-${dist.id}`);
                const baseRadius = dist.status === 'low' ? 35 : (dist.status === 'high' ? 45 : 30);
                if (marker) marker.setAttribute('r', 6);
                if (spot) {
                    spot.setAttribute('r', baseRadius);
                    spot.style.opacity = '1';
                }
            });
            distributorTbody.appendChild(tr);
        });

        // 4. Update Network Health Panel
        const hHealthy = document.getElementById('health-kpi-healthy');
        const hOverstock = document.getElementById('health-kpi-overstock');
        const hWarning = document.getElementById('health-kpi-warning');
        const hCritical = document.getElementById('health-kpi-critical');

        if (hHealthy) hHealthy.textContent = region.health.healthy;
        if (hOverstock) hOverstock.textContent = region.health.overstock;
        if (hWarning) hWarning.textContent = region.health.warning;
        if (hCritical) hCritical.textContent = region.health.critical;
    };

    if (territoryRegionSelect) {
        territoryRegionSelect.addEventListener('change', (e) => {
            renderTerritoryMap(e.target.value);
        });
        // Initial render
        renderTerritoryMap(territoryRegionSelect.value);
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

// --- Order Approval & Exception Management Logic ---
window.openOrderDrillDown = function(distributorName, orderCount) {
    const queueView = document.getElementById('om-queue-view');
    const drilldownView = document.getElementById('om-drilldown-view');
    const nameEl = document.getElementById('drilldown-distributor-name');
    const countEl = document.getElementById('drilldown-order-count');

    if (nameEl) nameEl.textContent = distributorName;
    if (countEl) countEl.textContent = orderCount;

    if (queueView && drilldownView) {
        queueView.style.display = 'none';
        drilldownView.style.display = 'block';
    }
};

window.closeOrderDrillDown = function() {
    const queueView = document.getElementById('om-queue-view');
    const drilldownView = document.getElementById('om-drilldown-view');

    if (queueView && drilldownView) {
        drilldownView.style.display = 'none';
        queueView.style.display = 'block';
    }
};

// --- Order Tracking Drilldown Logic ---
window.openTrackingDrillDown = function(distributorName) {
    const queueView = document.getElementById('ot-queue-view');
    const drilldownView = document.getElementById('ot-drilldown-view');
    const nameEl = document.getElementById('drilldown-tracking-distributor');

    if (nameEl) nameEl.textContent = distributorName;

    if (queueView && drilldownView) {
        queueView.style.display = 'none';
        drilldownView.style.display = 'block';
    }
};

window.closeTrackingDrillDown = function() {
    const queueView = document.getElementById('ot-queue-view');
    const drilldownView = document.getElementById('ot-drilldown-view');

    if (queueView && drilldownView) {
        drilldownView.style.display = 'none';
        queueView.style.display = 'block';
    }
};
