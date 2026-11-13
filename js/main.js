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

})();
