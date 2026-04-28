import colorData from './tanjoshoku_colors.json' with { type: "json" };

// Because standard ES modules with JSON might fail in some older browsers or local file protocols without a bundler,
// we'll fetch the JSON manually to be safe.
document.addEventListener("DOMContentLoaded", async () => {
    let colors = [];
    try {
        const response = await fetch('tanjoshoku_colors.json');
        const data = await response.json();
        colors = data.colors;
    } catch (e) {
        console.error("Failed to load JSON data", e);
    }

    // Populate date picker
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    
    for(let i=1; i<=12; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        monthSelect.appendChild(opt);
    }
    
    const updateDays = () => {
        const m = parseInt(monthSelect.value) || 1;
        const daysInMonth = new Date(2024, m, 0).getDate();
        daySelect.innerHTML = '';
        for(let i=1; i<=daysInMonth; i++) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = i;
            daySelect.appendChild(opt);
        }
    };
    
    monthSelect.addEventListener('change', updateDays);
    updateDays(); // init

    // Physics Engine Setup
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
        element: document.getElementById('physics-canvas'),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });
    
    engine.world.gravity.y = 0; // Starts with no gravity

    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls
    const t = 60;
    const ground = Matter.Bodies.rectangle(window.innerWidth/2, window.innerHeight+t/2, window.innerWidth, t, { isStatic: true, render: { fillStyle: 'transparent' } });
    const leftWall = Matter.Bodies.rectangle(0-t/2, window.innerHeight/2, t, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });
    const rightWall = Matter.Bodies.rectangle(window.innerWidth+t/2, window.innerHeight/2, t, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    window.addEventListener('resize', () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth/2, y: window.innerHeight+t/2 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth+t/2, y: window.innerHeight/2 });
    });

    // Interaction Flow
    const discoverBtn = document.getElementById('discover-btn');
    const landingLeft = document.getElementById('landing-left-content');
    const landingRight = document.getElementById('landing-right-content');
    const profileView = document.getElementById('profile-view');

    discoverBtn.addEventListener('click', () => {
        const m = monthSelect.value.padStart(2, '0');
        const d = daySelect.value.padStart(2, '0');
        const dateId = `${m}-${d}`;
        const colorRecord = colors.find(c => c.id === dateId);
        
        if(!colorRecord) return;

        // 1. Convert DOM elements to physical bodies
        const leftRect = landingLeft.getBoundingClientRect();
        const rightRect = landingRight.getBoundingClientRect();
        
        const leftBody = Matter.Bodies.rectangle(leftRect.left + leftRect.width/2, leftRect.top + leftRect.height/2, leftRect.width * 0.8, leftRect.height * 0.8, { restitution: 0.4, render: { fillStyle: '#e5e7eb' } });
        const rightBody = Matter.Bodies.rectangle(rightRect.left + rightRect.width/2, rightRect.top + rightRect.height/2, rightRect.width * 0.8, rightRect.height * 0.8, { restitution: 0.5, render: { fillStyle: '#d1d5db' } });
        
        Matter.World.add(engine.world, [leftBody, rightBody]);

        // Hide HTML elements
        landingLeft.classList.add('fade-out');
        landingRight.classList.add('fade-out');

        // Turn on gravity
        engine.world.gravity.y = 1.2;

        // Drop color tile
        const tileSize = Math.min(window.innerWidth * 0.4, 400);
        const colorTile = Matter.Bodies.rectangle(window.innerWidth/2, -tileSize, tileSize, tileSize, {
            restitution: 0.2,
            friction: 0.5,
            density: 0.005,
            render: { fillStyle: colorRecord.hex }
        });
        
        Matter.World.add(engine.world, colorTile);

        // Apply Antigravity
        setTimeout(() => {
            let reachedTop = false;
            Matter.Events.on(engine, 'beforeUpdate', function antigravityStep() {
                if(reachedTop) {
                    Matter.Events.off(engine, 'beforeUpdate', antigravityStep);
                    return;
                }
                
                Matter.Body.applyForce(colorTile, colorTile.position, { x: 0, y: -0.06 });
                
                if (colorTile.velocity.y < -4) {
                    Matter.Body.setVelocity(colorTile, { x: colorTile.velocity.x, y: -4 });
                }

                const forceX = (window.innerWidth / 4 - colorTile.position.x) * 0.0001;
                Matter.Body.applyForce(colorTile, colorTile.position, { x: forceX, y: 0 });

                if (colorTile.position.y < window.innerHeight / 2) {
                    reachedTop = true;
                    Matter.Body.setStatic(colorTile, true);
                    Matter.Body.setPosition(colorTile, { x: window.innerWidth * 0.25, y: window.innerHeight / 2 });
                    Matter.Body.setAngle(colorTile, 0);
                    
                    showProfile(colorRecord);
                }
            });
        }, 1500);
    });

    function showProfile(color) {
        // Stop rendering physics canvas to background
        document.getElementById('physics-canvas').style.opacity = '0';
        document.getElementById('physics-canvas').style.transition = 'opacity 1s ease';

        // Populate Profile Data
        document.getElementById('profile-jp-name').innerText = color.color_name_jp;
        document.getElementById('profile-en-name').innerText = color.color_name_en;
        document.getElementById('profile-date-en').innerText = `${color.season.toUpperCase()} ${color.date_en}`;
        document.getElementById('profile-season').innerText = `SEASON: ${color.season}`;
        document.getElementById('profile-features').innerText = color.features_en_clean;
        
        // Find a description or just fallback to color meanings
        const meaningsList = color.keywords_en && color.keywords_en.length > 0 
            ? color.keywords_en 
            : (color.keywords_jp || ['Unknown']);
        
        document.getElementById('profile-desc').innerText = `Color meaning: ${meaningsList.join(', ')}.`;
        
        document.getElementById('profile-hex').innerText = color.hex;
        document.getElementById('profile-rgb').innerText = `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`;

        const colorPanel = document.getElementById('profile-color-panel');
        colorPanel.style.backgroundColor = color.hex;
        
        // Calculate contrast color based on luminance
        const hexStr = color.hex.replace('#', '');
        const r = parseInt(hexStr.substring(0, 2), 16);
        const g = parseInt(hexStr.substring(2, 4), 16);
        const b = parseInt(hexStr.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const textColor = (yiq >= 128) ? '#1c1b1b' : '#ffffff';
        colorPanel.style.color = textColor;
        
        // Keywords
        const kwContainer = document.getElementById('profile-keywords');
        kwContainer.innerHTML = '';
        meaningsList.forEach(kw => {
            const span = document.createElement('span');
            span.className = 'px-4 py-1.5 border border-on-surface/20 text-on-surface font-label-caps text-label-caps bg-on-surface/5';
            span.innerText = kw.toUpperCase();
            kwContainer.appendChild(span);
        });

        // Ensure text is white for contrast against the potentially dark/light color.
        // Or we could use chroma-js. For now, white text over the color panel is standard in the stitch layout.

        // Fade in
        profileView.classList.remove('hidden');
        setTimeout(() => {
            profileView.classList.add('fade-in');
        }, 100);
    }
});
