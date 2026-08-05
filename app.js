
// --- Distributor Global State ---
window.distributorState = {
    draftItems: [
        // Initial static items that were hardcoded
        {
            id: 'item-1',
            name: 'XtendiMax',
            type: 'erp',
            location: 'Montreal DC',
            qty: 8000,
            price: 12.00
        },
        {
            id: 'item-2',
            name: 'Prosaro Pro',
            type: 'ai',
            location: 'Toronto DC',
            qty: 4500,
            price: 18.50
        }
    ],
    totalSavings: 0,
    eligibleRebates: 0,
    inventoryUploaded: false,
    acceptedRecs: 0,
    dismissedRecs: 0
};

window.addToDraftOrder = function(productName, defaultQty) {
    // Check if already in draft
    const exists = window.distributorState.draftItems.find(i => i.name === productName);
    if (!exists) {
        window.distributorState.draftItems.push({
            id: 'item-' + Date.now(),
            name: productName,
            type: 'manual',
            location: 'Auto-Assigned DC',
            qty: parseInt(defaultQty.toString().replace(/,/g, '')) || 1000,
            price: 15.00 // mock price
        });
    }
    if (window.showToast) window.showToast(`${productName} added to Draft Order.`);
    if (window.renderDraftOrderTable) window.renderDraftOrderTable();
    if (window.switchScreen) window.switchScreen('order-placement');
};

window.acceptRecommendation = function(cardId, productName, qty, savings, marginStr) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    // Add to state
    window.distributorState.acceptedRecs++;
    const exists = window.distributorState.draftItems.find(i => i.name === productName);
    if (!exists) {
        window.distributorState.draftItems.push({
            id: 'item-rec-' + Date.now(),
            name: productName,
            type: 'ai',
            location: 'Optimal DC',
            qty: qty,
            price: 20.00
        });
    }
    window.distributorState.totalSavings += savings;
    window.distributorState.eligibleRebates += 1;
    
    // Update Card UI
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';
    const actionRow = card.querySelector('.rec-actions-row');
    if (actionRow) {
        actionRow.innerHTML = `<div style="display:flex; align-items:center; gap:8px; color:var(--status-green); font-weight:600;"><i data-lucide="check-circle" style="width:18px;height:18px;"></i> Accepted & Added to Draft</div>`;
    }
    
    if (window.showToast) window.showToast('Recommendation Accepted.');
    if (window.renderDecisionSummary) window.renderDecisionSummary();
    if (window.renderDraftOrderTable) window.renderDraftOrderTable();
    if (window.lucide) window.lucide.createIcons();
};

window.dismissRecommendation = function(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    window.distributorState.dismissedRecs++;
    card.style.display = 'none';
    
    if (window.showToast) window.showToast('Recommendation Dismissed.');
    if (window.renderDecisionSummary) window.renderDecisionSummary();
};

window.renderDecisionSummary = function() {
    const acceptedEl = document.getElementById('ai-ds-accepted');
    const savingsEl = document.getElementById('ai-ds-savings');
    const rebatesEl = document.getElementById('ai-ds-rebates');
    const ctaBtn = document.getElementById('ai-ds-cta');
    
    if (acceptedEl) acceptedEl.textContent = window.distributorState.acceptedRecs;
    if (savingsEl) savingsEl.textContent = '$' + (15975 + window.distributorState.totalSavings).toLocaleString();
    if (rebatesEl) rebatesEl.textContent = (2 + window.distributorState.eligibleRebates) + ' Programs';
    
    if (ctaBtn) {
        if (window.distributorState.acceptedRecs > 0) {
            ctaBtn.classList.remove('secondary-btn');
            ctaBtn.classList.add('primary-btn');
            ctaBtn.disabled = false;
        }
    }
};

window.renderDraftOrderTable = function() {
    const tbody = document.getElementById('draft-order-tbody');
    const totalEl = document.getElementById('op-order-summary-total');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let totalValue = 0;
    
    if (window.distributorState.draftItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-secondary);">No items in draft order.</td></tr>';
        if (totalEl) totalEl.textContent = '$0';
        return;
    }
    
    window.distributorState.draftItems.forEach(item => {
        const itemTotal = item.qty * item.price;
        totalValue += itemTotal;
        
        let typeBadge = '';
        if (item.type === 'erp') {
            typeBadge = `<span class="badge" style="background:#0F172A; color:white; font-size:10px;"><i data-lucide="database" style="width:10px;height:10px;margin-right:4px;"></i> ERP Imported</span>`;
        } else if (item.type === 'ai') {
            typeBadge = `<span class="badge" style="background:var(--primary-blue); color:white; font-size:10px;"><i data-lucide="sparkles" style="width:10px;height:10px;margin-right:4px;"></i> AI Recommended</span>`;
        } else {
            typeBadge = `<span class="badge" style="background:#E2E8F0; color:var(--text-dark); font-size:10px;">Manual Entry</span>`;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 16px;">
                <div class="font-medium" style="font-size: 15px; margin-bottom: 4px;">${item.name}</div>
                <div style="display:flex; align-items:center; gap:8px;">
                    ${typeBadge}
                </div>
            </td>
            <td style="padding: 16px;">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span class="font-medium text-sm">${item.location}</span>
                        <span class="text-xs text-green" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:12px; display:flex; align-items:center; gap:2px;"><i data-lucide="check" style="width:10px;height:10px;"></i> Available</span>
                    </div>
                </div>
            </td>
            <td style="padding: 16px;">
                <div style="display:flex; align-items:center; background:#F8FAFC; border: 1px solid var(--border-color); border-radius: 6px; width:fit-content; padding: 2px;">
                    <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);" onclick="updateDraftQty('${item.id}', -100)"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                    <input type="number" value="${item.qty}" style="width: 70px; padding: 4px; border:none; background:none; text-align:center; font-weight:500; font-family:inherit; outline:none;" readonly>
                    <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);" onclick="updateDraftQty('${item.id}', 100)"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                </div>
            </td>
            <td style="padding: 16px;">$${item.price.toFixed(2)}</td>
            <td class="font-medium" style="padding: 16px;">$${itemTotal.toLocaleString()}</td>
            <td style="text-align: right; padding: 16px;">
                <button class="btn btn-icon text-secondary" onclick="removeDraftItem('${item.id}')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (totalEl) totalEl.textContent = '$' + totalValue.toLocaleString();
    if (window.lucide) window.lucide.createIcons();
};

window.updateDraftQty = function(id, delta) {
    const item = window.distributorState.draftItems.find(i => i.id === id);
    if (item) {
        item.qty = Math.max(0, item.qty + delta);
        window.renderDraftOrderTable();
    }
};

window.removeDraftItem = function(id) {
    window.distributorState.draftItems = window.distributorState.draftItems.filter(i => i.id !== id);
    window.renderDraftOrderTable();
};

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
        
        // Dynamic re-rendering
        if (targetId === 'order-placement' && window.renderDraftOrderTable) {
            window.renderDraftOrderTable();
        }
        if ((targetId === 'dashboard' || targetId === 'inventory') && window.distributorState && window.distributorState.inventoryUploaded) {
            const timeEls = document.querySelectorAll('.upload-time-indicator');
            timeEls.forEach(el => el.innerHTML = 'Just Now <span style="color:var(--status-green);"><i data-lucide="check-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;"></i> Validated</span>');
        }

        if(window.lucide) window.lucide.createIcons();
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

    // --- Distributor Upload Simulation ---
    const distBtnUpload = document.getElementById('dist-btn-upload');
    const distDropZone = document.getElementById('dist-drop-zone');
    const distPipeline = document.getElementById('dist-upload-pipeline');
    const distValidation = document.getElementById('dist-validation-results');
    const distAi = document.getElementById('dist-ai-assistant');
    const distProgressBar = document.getElementById('dist-progress-bar');

    if (distBtnUpload && distPipeline) {
        distBtnUpload.addEventListener('click', () => {
            if(window.showToast) window.showToast('Uploading file...');
            
            distDropZone.style.display = 'none';
            distPipeline.style.display = 'block';
            distValidation.style.display = 'none';
            distAi.style.display = 'none';
            
            const steps = distPipeline.querySelectorAll('.dist-step');
            let currentStep = 0;
            
            const interval = setInterval(() => {
                if (currentStep < steps.length) {
                    const stepIcon = steps[currentStep].querySelector('div');
                    stepIcon.style.background = 'var(--status-green)';
                    steps[currentStep].querySelector('span').style.color = 'var(--status-green)';
                    
                    if (currentStep > 0) {
                        distProgressBar.style.width = (currentStep / (steps.length - 1) * 100) + '%';
                    }
                    
                    currentStep++;
                } else {
                    clearInterval(interval);
                    if(window.showToast) window.showToast('Validation Complete');
                    distValidation.style.display = 'block';
                    distAi.style.display = 'block';
                }
            }, 800);
        });
        
        window.simulateFixUpload = function() {
            if(window.showToast) window.showToast('Fixing issues and re-uploading...');
            distValidation.style.display = 'none';
            distAi.style.display = 'none';
            distPipeline.style.display = 'block';
            
            const steps = distPipeline.querySelectorAll('.dist-step');
            steps.forEach(step => {
                step.querySelector('div').style.background = '#E2E8F0';
                step.querySelector('span').style.color = 'var(--text-dark)';
            });
            distProgressBar.style.width = '0%';

            let currentStep = 0;
            const interval = setInterval(() => {
                if (currentStep < steps.length) {
                    const stepIcon = steps[currentStep].querySelector('div');
                    stepIcon.style.background = 'var(--status-green)';
                    steps[currentStep].querySelector('span').style.color = 'var(--status-green)';
                    
                    if (currentStep > 0) {
                        distProgressBar.style.width = (currentStep / (steps.length - 1) * 100) + '%';
                    }
                    
                    currentStep++;
                } else {
                    
                    clearInterval(interval);
                    if(window.distributorState) window.distributorState.inventoryUploaded = true;
                    if(window.showToast) window.showToast('Upload Successfully Processed!');

                    distValidation.innerHTML = `
                        <h3 style="margin-bottom: 16px; font-size:16px; display:flex; align-items:center; gap:8px;">
                            <i data-lucide="file-check" style="color:var(--status-green); width:18px;height:18px;"></i> Upload Successful
                        </h3>
                        <p style="font-size:14px; color:var(--text-dark);">Your inventory file has been fully processed and all issues are resolved. Product matching issues have been logged for Account Manager review.</p>
                        <button class="primary-btn btn-sm" style="margin-top:16px;" onclick="switchScreen('dashboard')">Return to Dashboard</button>
                    `;
                    distValidation.style.display = 'block';
                    if(window.lucide) window.lucide.createIcons();
                }
            }, 500);
        };
    }

    
    // --- ERP Import Simulation (Refined) ---
    window.simulateErpImport = function() {
        if(window.showToast) window.showToast('Importing order from ERP...', 2000);
        
        setTimeout(() => {
            const tbody = document.querySelector('#draft-order-table tbody');
            const duplicateBanner = document.getElementById('duplicate-warning-banner');
            const aiInsights = document.getElementById('op-ai-insights');
            const submitBtn = document.getElementById('op-submit-btn');
            const submitHelper = document.getElementById('op-submit-helper');
            const fbtSection = document.getElementById('op-fbt-section');
            const checklist = document.getElementById('op-checklist');
            const orderSummaryTotal = document.getElementById('op-order-summary-total');
            const productsCount = document.getElementById('op-products-count');
            
            if (tbody && !document.getElementById('erp-conflict-row')) {
                // Add non-duplicate row (New Product)
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td style="padding: 16px;">
                        <div class="font-medium" style="font-size: 15px; margin-bottom: 4px;">XtendiMax</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="badge" style="background:#0F172A; color:white; font-size:10px;"><i data-lucide="database" style="width:10px;height:10px;margin-right:4px;"></i> ERP Imported</span>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="font-medium text-sm">Montreal DC</span>
                                <span class="text-xs text-green" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:12px; display:flex; align-items:center; gap:2px;"><i data-lucide="check" style="width:10px;height:10px;"></i> Available</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; align-items:center; background:#F8FAFC; border: 1px solid var(--border-color); border-radius: 6px; width:fit-content; padding: 2px;">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                            <input type="number" value="8000" style="width: 70px; padding: 4px; border:none; background:none; text-align:center; font-weight:500; font-family:inherit; outline:none;" onchange="showToast('Updating totals...')">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                        </div>
                    </td>
                    <td style="padding: 16px;">$12.00</td>
                    <td class="font-medium" style="padding: 16px;">$96,000</td>
                    <td style="text-align: right; padding: 16px;">
                        <button class="btn btn-icon text-secondary" onclick="showToast('Removed item')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                    </td>
                `;
                
                tbody.appendChild(newRow);
                
                // Consolidate duplicate into a conflict row
                const originalRow = tbody.children[0];
                if (originalRow) {
                    originalRow.id = 'erp-conflict-row';
                    originalRow.style.backgroundColor = '#FEF2F2';
                    originalRow.innerHTML = `
                         <td style="padding: 16px; border-left: 4px solid #DC2626;">
                            <div class="font-medium" style="font-size: 15px; margin-bottom: 8px;">Roundup PowerMAX</div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:white; border:1px solid #E2E8F0; border-radius:4px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="badge badge-high" style="background:#DCFCE7; color:var(--status-green); font-size:10px;">AI Recommended</span>
                                        <span class="text-xs" style="color:#991B1B; background:#FEF2F2; padding:2px 6px; border-radius:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="alert-triangle" style="width:10px;height:10px;"></i> High Risk (3 Days Left)</span>
                                    </div>
                                    <span class="font-medium text-sm">Qty: 15,000 L</span>
                                </div>
                                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:white; border:1px solid #E2E8F0; border-radius:4px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <span class="badge" style="background:#0F172A; color:white; font-size:10px;"><i data-lucide="database" style="width:10px;height:10px;margin-right:4px;"></i> ERP Imported</span>
                                    </div>
                                    <span class="font-medium text-sm">Qty: 15,000 L</span>
                                </div>
                            </div>
                         </td>
                         <td colspan="5" style="padding: 16px;">
                            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; gap:12px;">
                                <div style="color:#991B1B; font-size:14px; font-weight:500; display:flex; align-items:center; gap:6px;">
                                    <i data-lucide="alert-circle" style="width:16px;height:16px;"></i> Conflict Detected
                                </div>
                                <div style="display:flex; gap:8px;">
                                     <button class="primary-btn btn-sm" style="background:#DC2626; border-color:#DC2626;" onclick="resolveDuplicate(this, 'merge')">Merge Quantities (Recommended)</button>
                                     <button class="secondary-btn btn-sm" style="border-color:#DC2626; color:#DC2626;" onclick="resolveDuplicate(this, 'replace')">Replace Existing Quantity</button>
                                     <button class="secondary-btn btn-sm" style="border-color:#DC2626; color:#DC2626;" onclick="resolveDuplicate(this, 'keep_both')">Keep Both (Not Recommended)</button>
                                </div>
                            </div>
                         </td>
                    `;
                }
                

                // Update UI Constraints
                document.getElementById('erp-success-banner').style.display = 'block';
                duplicateBanner.style.display = 'block';
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.disabled = true;
                submitHelper.style.display = 'block';
                fbtSection.style.display = 'none';
                productsCount.textContent = '3 Items'; // 2 original + 1 new (duplicate counts as 1)
                
                // Update Checklist
                checklist.innerHTML = `
                    <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Inventory Available</li>
                    <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Commercial Schemes Applied</li>
                    <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Fulfillment Confirmed</li>
                    <li style="display:flex; align-items:center; gap:6px; color:#DC2626; font-weight:500;"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#DC2626;"></i> Duplicate Review Required</li>
                `;
                
                // Update Order Summary Message
                orderSummaryTotal.innerHTML = `
                    <div style="width:100%; text-align:center; padding: 8px; background:#FEF2F2; color:#991B1B; font-size:13px; border-radius:4px; font-weight:500;">
                        Estimated total will be finalized after duplicate resolution.
                    </div>
                `;
                
                // Update AI Insights
                aiInsights.innerHTML = `
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);margin-top:2px;"></i> ERP order imported successfully.</li>
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="alert-triangle" style="width:14px;height:14px;color:#DC2626;margin-top:2px;"></i> One imported product duplicates an AI recommended item.</li>
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="info" style="width:14px;height:14px;color:var(--primary-blue);margin-top:2px;"></i> Review highlighted products before submitting.</li>
                `;
                
                if(window.lucide) window.lucide.createIcons();
                if(window.showToast) window.showToast('Import successful. Duplicates detected.', 3000);
            }
        }, 800);
    };

    window.resolveDuplicate = function(btn, action) {
        if(window.showToast) window.showToast('Duplicate resolved.');
        const conflictRow = document.getElementById('erp-conflict-row');
        
        if (conflictRow) {
            conflictRow.style.backgroundColor = 'transparent';
            conflictRow.style.borderLeft = 'none';
            conflictRow.id = '';
            
            let qty = 15000;
            let total = "$127,500";
            let badge = `<span class="badge badge-high" style="background:#DCFCE7; color:var(--status-green); font-size:10px;">AI Recommended</span>
                         <span class="text-xs" style="color:#991B1B; background:#FEF2F2; padding:2px 6px; border-radius:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="alert-triangle" style="width:10px;height:10px;"></i> High Risk (3 Days Left)</span>`;
                         
            if (action === 'replace') {
                badge = `<span class="badge" style="background:#0F172A; color:white; font-size:10px;"><i data-lucide="database" style="width:10px;height:10px;margin-right:4px;"></i> ERP Imported</span>`;
            } else if (action === 'merge') {
                qty = 30000;
                total = "$255,000";
                badge = `<span class="badge badge-high" style="background:#DCFCE7; color:var(--status-green); font-size:10px;">Merged Item</span>`;
            } else if (action === 'keep_both') {
                qty = 30000;
                total = "$255,000";
                badge = `<span class="badge" style="background:#E2E8F0; color:var(--text-dark); font-size:10px;">Multiple Sources (AI & ERP)</span>`;
            }

            conflictRow.innerHTML = `
                <td style="padding: 16px;">
                    <div class="font-medium" style="font-size: 15px; margin-bottom: 4px;">Roundup PowerMAX</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${badge}
                    </div>
                </td>
                <td style="padding: 16px;">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="font-medium text-sm">Montreal DC</span>
                            <span class="text-xs text-green" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:12px; display:flex; align-items:center; gap:2px;"><i data-lucide="check" style="width:10px;height:10px;"></i> Available</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; font-size:12px; color:var(--secondary-text);">
                            <span>ATP: <strong>15K L</strong></span>
                            <span>|</span>
                            <span>ETA: <strong>2 Days</strong></span>
                        </div>
                    </div>
                </td>
                <td style="padding: 16px;">
                    <div style="display:flex; align-items:center; background:#F8FAFC; border: 1px solid var(--border-color); border-radius: 6px; width:fit-content; padding: 2px;">
                        <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                        <input type="number" value="${qty}" style="width: 70px; padding: 4px; border:none; background:none; text-align:center; font-weight:500; font-family:inherit; outline:none;" onchange="showToast('Updating totals...')">
                        <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                    </div>
                </td>
                <td style="padding: 16px;">$8.50</td>
                <td class="font-medium" style="padding: 16px;">${total}</td>
                <td style="text-align: right; padding: 16px;">
                    <button class="btn btn-icon text-secondary" onclick="showToast('Removed item')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                </td>
            `;
            if(window.lucide) window.lucide.createIcons();
        }
        
        // Restore UI state
        document.getElementById('duplicate-warning-banner').style.display = 'none';
        document.getElementById('op-fbt-section').style.display = 'block';
        
        const submitBtn = document.getElementById('op-submit-btn');
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.disabled = false;
        document.getElementById('op-submit-helper').style.display = 'none';
        
        const checklist = document.getElementById('op-checklist');
        if (checklist) {
            checklist.innerHTML = `
                <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Inventory Available</li>
                <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Commercial Schemes Applied</li>
                <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> Fulfillment Confirmed</li>
                <li style="display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);"></i> No Approval Exceptions Detected</li>
            `;
        }
        
        const orderSummaryTotal = document.getElementById('op-order-summary-total');
        if (orderSummaryTotal) {
            let finalTotal = action === 'merge' ? "$359,025" : "$231,525"; // Fake calculation update
            orderSummaryTotal.innerHTML = `
                <strong style="font-size:16px;">Estimated Total</strong>
                <strong style="font-size:16px;">${finalTotal}</strong>
            `;
        }

        const aiInsights = document.getElementById('op-ai-insights');
        if (aiInsights) {
             aiInsights.innerHTML = `
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--status-green);margin-top:2px;"></i> All duplicates resolved.</li>
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--primary-blue);margin-top:2px;"></i> Your order qualifies for the Early Booking Bonus.</li>
                    <li style="display:flex; align-items:start; gap:6px;"><i data-lucide="check" style="width:14px;height:14px;color:var(--primary-blue);margin-top:2px;"></i> Inventory has been reserved at the selected fulfillment centers.</li>
                `;
             if(window.lucide) window.lucide.createIcons();
        }
    };


    // --- Product Catalog & FBT Interactions ---
    window.addCatalogProduct = function(btn, name, price) {
        if(window.showToast) window.showToast(`Adding ${name} to order...`);
        document.getElementById('catalog-modal').classList.add('hidden');
        
        setTimeout(() => {
            const tbody = document.querySelector('#draft-order-table tbody');
            if (tbody) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td style="padding: 16px;">
                        <div class="font-medium" style="font-size: 15px; margin-bottom: 4px;">${name}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="badge" style="background:#F1F5F9; color:var(--text-dark); font-size:10px;">Catalog Item</span>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="font-medium text-sm">Montreal DC</span>
                                <span class="text-xs text-green" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:12px; display:flex; align-items:center; gap:2px;"><i data-lucide="check" style="width:10px;height:10px;"></i> Available</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; align-items:center; background:#F8FAFC; border: 1px solid var(--border-color); border-radius: 6px; width:fit-content; padding: 2px;">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                            <input type="number" value="1000" style="width: 70px; padding: 4px; border:none; background:none; text-align:center; font-weight:500; font-family:inherit; outline:none;" onchange="showToast('Updating totals...')">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                        </div>
                    </td>
                    <td style="padding: 16px;">$${price.toFixed(2)}</td>
                    <td class="font-medium" style="padding: 16px;">$${(price * 1000).toLocaleString()}</td>
                    <td style="text-align: right; padding: 16px;">
                        <button class="btn btn-icon text-secondary" onclick="showToast('Removed item')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                    </td>
                `;
                tbody.appendChild(newRow);
                if(window.lucide) window.lucide.createIcons();
                
                // Update Order Summary
                const summaryTotal = document.getElementById('op-order-summary-total');
                if (summaryTotal && !document.getElementById('erp-conflict-row')) {
                    summaryTotal.innerHTML = `
                        <strong style="font-size:16px;">Estimated Total</strong>
                        <strong style="font-size:16px;">$259,425</strong>
                    `;
                }
                
                // Update top KPI
                const countElem = document.getElementById('op-products-count');
                if (countElem) countElem.textContent = '3 Items';
                
                if(window.showToast) window.showToast(`${name} added to draft.`, 2000);
            }
        }, 500);
    };

    window.addFbtProduct = function(btn, name, price) {
        btn.disabled = true;
        btn.textContent = 'Adding...';
        
        setTimeout(() => {
            const tbody = document.querySelector('#draft-order-table tbody');
            if (tbody) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td style="padding: 16px;">
                        <div class="font-medium" style="font-size: 15px; margin-bottom: 4px;">${name}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="badge" style="background:#E0E7FF; color:#4338CA; font-size:10px;"><i data-lucide="sparkles" style="width:10px;height:10px;margin-right:4px;"></i> Bundle Optimization</span>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="font-medium text-sm">Montreal DC</span>
                                <span class="text-xs text-green" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:2px 6px; border-radius:12px; display:flex; align-items:center; gap:2px;"><i data-lucide="check" style="width:10px;height:10px;"></i> Available</span>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px;">
                        <div style="display:flex; align-items:center; background:#F8FAFC; border: 1px solid var(--border-color); border-radius: 6px; width:fit-content; padding: 2px;">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                            <input type="number" value="2000" style="width: 70px; padding: 4px; border:none; background:none; text-align:center; font-weight:500; font-family:inherit; outline:none;" onchange="showToast('Updating totals...')">
                            <button style="border:none; background:none; cursor:pointer; padding:4px; color:var(--secondary-text);"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                        </div>
                    </td>
                    <td style="padding: 16px;">$${price.toFixed(2)}</td>
                    <td class="font-medium" style="padding: 16px;">$${(price * 2000).toLocaleString()}</td>
                    <td style="text-align: right; padding: 16px;">
                        <button class="btn btn-icon text-secondary" onclick="showToast('Removed item')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                    </td>
                `;
                tbody.appendChild(newRow);
                
                // Update Order Summary
                const summaryTotal = document.getElementById('op-order-summary-total');
                if (summaryTotal && !document.getElementById('erp-conflict-row')) {
                    summaryTotal.innerHTML = `
                        <strong style="font-size:16px;">Estimated Total</strong>
                        <strong style="font-size:16px;">$249,000</strong>
                    `;
                }
                
                // Update top KPI
                const countElem = document.getElementById('op-products-count');
                if (countElem) countElem.textContent = '3 Items';
                
                // Update Estimated Savings
                const savingsEl = document.getElementById('op-kpi-savings');
                if (savingsEl) {
                    savingsEl.innerHTML = `$22,500 <i data-lucide="trending-up" style="width:16px;height:16px;display:inline-block;margin-left:4px;"></i>`;
                }
                
                // Add AI Insight
                const aiInsights = document.getElementById('op-ai-insights');
                if (aiInsights) {
                    const insight = document.createElement('li');
                    insight.style = "display:flex; align-items:start; gap:6px; animation: fadeIn 0.5s;";
                    insight.innerHTML = `<i data-lucide="check" style="width:14px;height:14px;color:var(--primary-blue);margin-top:2px;"></i> Adding ${name} qualifies this order for an additional rebate.`;
                    aiInsights.appendChild(insight);
                }
                
                btn.textContent = 'Added';
                btn.style.background = 'var(--status-green)';
                btn.style.color = 'white';
                
                if(window.lucide) window.lucide.createIcons();
                if(window.showToast) window.showToast(`${name} bundle added to order!`, 2000);
            }
        }, 600);
    };

    // --- Order Submission Flow ---
    window.simulateSubmitOrder = function() {
        const loadingOverlay = document.getElementById('submit-loading-overlay');
        const successModal = document.getElementById('submit-success-modal');
        
        if (loadingOverlay && successModal) {
            loadingOverlay.classList.remove('hidden');
            
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                successModal.classList.remove('hidden');
                if(window.lucide) window.lucide.createIcons();
            }, 1500);
        }
    };

    // --- Order Details Modal (My Orders) ---
    window.openOrderDetails = function(orderId) {
        const modal = document.getElementById('order-details-modal');
        const title = document.getElementById('od-title');
        const statusBadge = document.getElementById('od-status');
        
        if (modal && title && statusBadge) {
            title.textContent = `Order Details #${orderId}`;
            
            // Simple logic to mock different states based on order ID
            if (orderId === '4905') {
                statusBadge.textContent = 'Awaiting Approval - Under Review';
                statusBadge.style.background = '#E0F2FE';
                statusBadge.style.color = '#0369A1';
            } else if (orderId === '4902') {
                statusBadge.textContent = 'Action Required - Missing document';
                statusBadge.style.background = '#FEF2F2';
                statusBadge.style.color = '#DC2626';
            } else if (orderId === '4899') {
                statusBadge.textContent = 'Approved - Inventory Reserved';
                statusBadge.style.background = '#DCFCE7';
                statusBadge.style.color = '#16A34A';
            } else if (orderId === '4895') {
                statusBadge.textContent = 'In Transit - Out for Delivery';
                statusBadge.style.background = '#E0F2FE';
                statusBadge.style.color = '#0369A1';
            } else if (orderId === '4880') {
                statusBadge.textContent = 'Delivered - Completed';
                statusBadge.style.background = '#F1F5F9';
                statusBadge.style.color = '#475569';
            }

            modal.classList.remove('hidden');
            if(window.lucide) window.lucide.createIcons();
        }
    };

function showProductDetails(productName) {
    const modal = document.getElementById('product-inventory-modal');
    if (!modal) return;
    
    document.getElementById('modal-product-name').innerText = productName;
    
    // Mock logic based on product name
    const statusEl = document.getElementById('modal-product-status');
    const replenishBtn = document.getElementById('modal-replenish-btn');
    
    if (productName === 'Roundup PowerMAX') {
        statusEl.className = 'badge badge-low flex-align';
        statusEl.innerHTML = 'Low Stock';
        statusEl.style.background = '#FEF2F2';
        statusEl.style.color = 'var(--status-red)';
        
        document.getElementById('modal-current-stock').innerText = '2,100 L';
        document.getElementById('modal-safety-stock').innerText = '5,000 L';
        document.getElementById('modal-daily-cons').innerText = '700 L';
        document.getElementById('modal-monthly-cons').innerText = '21,000 L';
        document.getElementById('modal-reorder-date').innerText = 'Immediate';
        
        replenishBtn.style.display = 'flex';
    } else if (productName === 'Prosaro Pro') {
        statusEl.className = 'badge badge-high flex-align';
        statusEl.innerHTML = 'Healthy';
        statusEl.style.background = '#DCFCE7';
        statusEl.style.color = 'var(--status-green)';
        
        document.getElementById('modal-current-stock').innerText = '4,500 L';
        document.getElementById('modal-safety-stock').innerText = '3,500 L';
        document.getElementById('modal-daily-cons').innerText = '200 L';
        document.getElementById('modal-monthly-cons').innerText = '6,000 L';
        document.getElementById('modal-reorder-date').innerText = 'In 8 Days';
        
        replenishBtn.style.display = 'none';
    } else {
        // Defaults
        statusEl.className = 'badge badge-high flex-align';
        statusEl.innerHTML = 'Healthy';
        statusEl.style.background = '#DCFCE7';
        statusEl.style.color = 'var(--status-green)';
        document.getElementById('modal-current-stock').innerText = '8,000 L';
        document.getElementById('modal-safety-stock').innerText = '4,000 L';
        document.getElementById('modal-daily-cons').innerText = '150 L';
        document.getElementById('modal-monthly-cons').innerText = '4,500 L';
        document.getElementById('modal-reorder-date').innerText = 'In 24 Days';
        
        replenishBtn.style.display = 'none';
    }
    
    modal.classList.remove('hidden');
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
