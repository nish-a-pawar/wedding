// Wedding Website - Enhanced JavaScript
(()=>{
  // ===== PETAL SHOWER =====
  let layer = document.querySelector('.petal-shower');
  if(!layer){
    const ev = document.getElementById('wedding-events');
    if(ev){
      layer = document.createElement('div');
      layer.className = 'petal-shower';
      layer.setAttribute('aria-hidden','true');
      ev.appendChild(layer);
    }
  }
  if(layer){
    const colors = [
      'conic-gradient(from 0deg at 60% 30%,#8B1A2A,#A83040,#C94060,#8B1A2A)',
      'conic-gradient(from 0deg at 50% 40%,#6B1020,#9B2535,#6B1020)',
      'conic-gradient(from 0deg at 55% 35%,#B84060,#D05070,#B84060)',
      'conic-gradient(from 0deg at 50% 50%,#7a1a2a,#aa3050,#7a1a2a)',
      'conic-gradient(from 0deg at 45% 35%,#901828,#C03858,#901828)'
    ];
    for(let i=0;i<28;i++){
      const p=document.createElement('span');
      p.className='petal';
      p.style.setProperty('--x',((i*37+11)%100)+'%');
      p.style.setProperty('--sz',(8+(i*7)%11)+'px');
      p.style.setProperty('--duration',(9+(i*5)%12)+'s');
      p.style.setProperty('--delay',(-((i*7)%22))+'s');
      p.style.setProperty('--drift',(((i*13)%160)-80)+'px');
      p.style.setProperty('--rot',((i*47)%360)+'deg');
      p.style.background=colors[i%colors.length];
      layer.appendChild(p);
    }
    // Intersection Observer for petals
    const petalObs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        layer.querySelectorAll('.petal').forEach(p=>{
          p.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
        });
      });
    },{threshold:0.1});
    const eventsSection = document.getElementById('wedding-events');
    if(eventsSection) petalObs.observe(eventsSection);
  }

  // ===== SCRATCH HINT HIDE =====
  const hint = document.getElementById('scratchHint');
  const canvas = document.getElementById('scratchCanvas');
  const revealBtn = document.getElementById('revealBtn');
  if(hint && canvas){
    let hintHidden = false;
    function hideHint(){
      if(!hintHidden){
        hintHidden=true;
        hint.classList.add('hidden');
        setTimeout(()=>{hint.style.display='none'},500);
      }
    }
    canvas.addEventListener('pointerdown',hideHint,{once:true});
    canvas.addEventListener('mousedown',hideHint,{once:true});
    canvas.addEventListener('touchstart',hideHint,{passive:true,once:true});
    if(revealBtn) revealBtn.addEventListener('click',hideHint,{once:true});
  }

  // ===== EVENT CARD SCROLL ANIMATION =====
  const cards = document.querySelectorAll('.event-card');
  if(cards.length){
    const cardObs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting) e.target.classList.add('visible');
      });
    },{threshold:0.15,rootMargin:'0px 0px -50px 0px'});
    cards.forEach(c=>cardObs.observe(c));
  }

  // ===== GENERAL SCROLL REVEALS =====
  const revealTargets = document.querySelectorAll([
    '.ceremony-heading',
    '.ceremony-stage',
    '.ceremony-next',
    '#wedding-events .events-kicker',
    '#wedding-events .events-title',
    '#wedding-events .events-intro',
    '#wedding-events .events-ornament',
    '#wedding-events .venue-box'
  ].join(','));
  if(revealTargets.length){
    const revealImmediately = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    revealTargets.forEach((element, index)=>{
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
      if(revealImmediately) element.classList.add('is-visible');
    });

    if(!revealImmediately && 'IntersectionObserver' in window){
      const revealObs = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            revealObs.unobserve(entry.target);
          }
        });
      },{threshold:0.12, rootMargin:'0px 0px -45px 0px'});
      revealTargets.forEach(element=>revealObs.observe(element));
    }else if(!revealImmediately){
      revealTargets.forEach(element=>element.classList.add('is-visible'));
    }
  }

  // ===== PREVENT SCROLL DURING SCRATCH =====
  if(canvas){
    canvas.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  }

  // ===== REDUCED MOTION =====
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    if(hint) hint.style.display='none';
  }


  // ===== FIREWORKS CHROMA KEY (GREEN SCREEN REMOVED) =====
  (function initFireworks() {
    const eventsSec = document.getElementById('wedding-events');
    const canvas = document.getElementById('fireworksCanvas');
    if (!eventsSec || !canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const video = document.createElement('video');
    video.src = 'images/fireworks.mp4';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.autoplay = true;

    let isPlaying = false;
    let animId = null;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: false });
    } catch (e) {}

    if (gl) {
      const vsSource = [
        'attribute vec2 a_pos;',
        'attribute vec2 a_tex;',
        'varying vec2 v_tex;',
        'void main() {',
        '  gl_Position = vec4(a_pos, 0.0, 1.0);',
        '  v_tex = a_tex;',
        '}'
      ].join('\n');

      const fsSource = [
        'precision mediump float;',
        'uniform sampler2D u_vid;',
        'varying vec2 v_tex;',
        'void main() {',
        '  vec4 c = texture2D(u_vid, v_tex);',
        '  float maxRB = max(c.r, c.b);',
        '  float diff = c.g - maxRB;',
        '  if (diff > 0.10) {',
        '    float a = clamp(1.0 - (diff - 0.10) / 0.12, 0.0, 1.0);',
        '    vec3 desat = vec3(c.r, maxRB * 0.95, c.b);',
        '    gl_FragColor = vec4(mix(desat, c.rgb, a) * a, a);',
        '  } else {',
        '    gl_FragColor = c;',
        '  }',
        '}'
      ].join('\n');

      function makeShader(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, makeShader(gl, gl.VERTEX_SHADER, vsSource));
      gl.attachShader(prog, makeShader(gl, gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const texBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1, 1,1, 0,0, 0,0, 1,1, 1,0]), gl.STATIC_DRAW);
      const aTex = gl.getAttribLocation(prog, 'a_tex');
      gl.enableVertexAttribArray(aTex);
      gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      function renderGL() {
        if (isPlaying && video.readyState >= 2) {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 360;
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        if (isPlaying) animId = requestAnimationFrame(renderGL);
      }

      function start() {
        if (!isPlaying) {
          isPlaying = true;
          video.play().catch(function() {});
          renderGL();
        }
      }
      function stop() {
        isPlaying = false;
        video.pause();
        if (animId) cancelAnimationFrame(animId);
      }

      const obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.05 });
      obs.observe(eventsSec);

    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      function render2D() {
        if (isPlaying && video.readyState >= 2) {
          const w = 480;
          const h = Math.round(w * (video.videoHeight / video.videoWidth || 0.5625));
          if (canvas.width !== w) { canvas.width = w; canvas.height = h; }
          ctx.drawImage(video, 0, 0, w, h);
          const frame = ctx.getImageData(0, 0, w, h);
          const d = frame.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const maxRB = Math.max(r, b);
            const diff = g - maxRB;
            if (diff > 25) {
              d[i + 3] = diff > 50 ? 0 : Math.round(255 * (1 - (diff - 25) / 25));
            }
          }
          ctx.putImageData(frame, 0, 0);
        }
        if (isPlaying) animId = requestAnimationFrame(render2D);
      }

      const obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            isPlaying = true;
            video.play().catch(function() {});
            render2D();
          } else {
            isPlaying = false;
            video.pause();
            if (animId) cancelAnimationFrame(animId);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(eventsSec);
    }
  })();

})();
