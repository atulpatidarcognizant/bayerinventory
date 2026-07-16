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
            
            lucide.createIcons();
        });
    });

    // --- Role Toggling Logic ---
    const btnRegional = document.getElementById('btn-role-regional');
    const btnKAM = document.getElementById('btn-role-kam');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');

    if(btnRegional && btnKAM) {
        btnRegional.addEventListener('click', () => {
            btnRegional.classList.add('active');
            btnKAM.classList.remove('active');
            profileAvatar.textContent = 'AP';
            profileName.textContent = 'Atul Patidar';
            profileRole.textContent = 'Regional Lead';
            showToast('Switched to Regional Leadership view.');
        });
        
        btnKAM.addEventListener('click', () => {
            btnKAM.classList.add('active');
            btnRegional.classList.remove('active');
            profileAvatar.textContent = 'KAM';
            profileName.textContent = 'Key Account Manager';
            profileRole.textContent = 'Bayer Crop Science';
            showToast('Switched to KAM Review view.');
        });
    }

    // --- Upload Pipeline Simulation ---
    const btnInitiateUpload = document.getElementById('btn-initiate-upload');
    const btnUpload = document.getElementById('btn-upload');
    const btnCancelUpload = document.getElementById('btn-cancel-upload');
    const dropZone = document.getElementById('drop-zone');
    const uploadPipeline = document.getElementById('upload-pipeline');
    const uploadHistory = document.getElementById('upload-history');

    if (btnInitiateUpload && btnUpload && dropZone && uploadPipeline) {
        // Step 1 -> Step 2
        btnInitiateUpload.addEventListener('click', () => {
            uploadHistory.classList.add('hidden');
            dropZone.classList.remove('hidden');
            uploadPipeline.classList.add('hidden');
        });

        // Cancel Upload
        btnCancelUpload.addEventListener('click', () => {
            dropZone.classList.add('hidden');
            uploadHistory.classList.remove('hidden');
        });

        // Step 2 -> Step 3
        const triggerUpload = () => {
            dropZone.classList.add('hidden');
            uploadPipeline.classList.remove('hidden');
            
            const steps = uploadPipeline.querySelectorAll('.step');
            let currentStep = 0;
            
            // Reset steps just in case
            steps.forEach(s => s.classList.remove('active'));
            if(steps.length > 0) steps[0].classList.add('active');
            
            const interval = setInterval(() => {
                if (currentStep < steps.length - 1) {
                    steps[currentStep].classList.remove('active');
                    currentStep++;
                    steps[currentStep].classList.add('active');
                } else {
                    clearInterval(interval);
                    showToast('AI Pipeline complete. 420 products mapped successfully.');
                    // Reset UI back to history state after successful upload
                    setTimeout(() => {
                        uploadPipeline.classList.add('hidden');
                        uploadHistory.classList.remove('hidden');
                        document.querySelector('[data-target="matching"]').click();
                    }, 1500);
                }
            }, 800);
        };

        btnUpload.addEventListener('click', triggerUpload);
        
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
        dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); triggerUpload(); });
    }

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
            if (text.includes('harmonization')) {
                aiBubble.textContent = 'Harmonization pipeline initiated. I am processing 3 pending uploads from Distributor X and Y... I will notify you when the mappings are ready for KAM review.';
            } else if (text.includes('risks')) {
                aiBubble.textContent = 'There are currently 12 products at risk of low inventory. The most critical is Roundup PowerMAX for AgriSupplies Inc. Do you want me to draft a stock transfer request?';
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
        const country = heatmapCountry.value;
        const product = heatmapProduct.value;
        
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

    if(heatmapCountry && heatmapProduct) {
        heatmapCountry.addEventListener('change', renderHeatmap);
        heatmapProduct.addEventListener('change', renderHeatmap);
        renderHeatmap(); // Initial render
    }
});
