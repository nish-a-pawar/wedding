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

  // ===== BACKGROUND MUSIC CONTROLLER =====
  const bgMusic = document.getElementById('weddingMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const TARGET_VOLUME = 0.22; // Mand aavaj (soft/soothing ambient volume, not harsh)
  let isMusicPlaying = false;
  let fadeInterval = null;

  function updateMusicUI(playing){
    isMusicPlaying = playing;
    if(musicToggleBtn){
      if(playing){
        musicToggleBtn.classList.add('is-playing');
        musicToggleBtn.setAttribute('aria-label', 'Pause background music (currently playing softly)');
      } else {
        musicToggleBtn.classList.remove('is-playing');
        musicToggleBtn.setAttribute('aria-label', 'Play soft background music');
      }
    }
    if(musicStatusText){
      musicStatusText.textContent = playing ? 'Music: ON' : 'Music: OFF';
    }
  }

  function playMusicSoftly(){
    if(!bgMusic) return;
    clearInterval(fadeInterval);
    bgMusic.volume = 0.04;
    const playPromise = bgMusic.play();
    if(playPromise !== undefined){
      playPromise.then(()=>{
        updateMusicUI(true);
        // Smooth gentle fade-in to soft volume
        let currentVol = bgMusic.volume;
        fadeInterval = setInterval(()=>{
          if(currentVol < TARGET_VOLUME){
            currentVol = Math.min(TARGET_VOLUME, currentVol + 0.02);
            bgMusic.volume = currentVol;
          } else {
            clearInterval(fadeInterval);
          }
        }, 80);
      }).catch(err=>{
        console.log('Autoplay waiting for user gesture:', err);
        updateMusicUI(false);
      });
    }
  }

  function pauseMusicGently(){
    if(!bgMusic) return;
    clearInterval(fadeInterval);
    let currentVol = bgMusic.volume;
    fadeInterval = setInterval(()=>{
      if(currentVol > 0.04){
        currentVol = Math.max(0, currentVol - 0.03);
        bgMusic.volume = currentVol;
      } else {
        clearInterval(fadeInterval);
        bgMusic.pause();
        bgMusic.volume = TARGET_VOLUME;
        updateMusicUI(false);
      }
    }, 40);
  }

  function toggleMusic(){
    if(!bgMusic) return;
    if(bgMusic.paused || !isMusicPlaying){
      playMusicSoftly();
    } else {
      pauseMusicGently();
    }
  }

  if(musicToggleBtn){
    musicToggleBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Expose global play function for palace gate opening
  window.playWeddingMusic = function(){
    if(!isMusicPlaying){
      playMusicSoftly();
    }
  };

  // Auto-start smoothly on first user interaction if not started yet
  const firstGestureStart = () => {
    if(!isMusicPlaying){
      playMusicSoftly();
    }
    document.removeEventListener('pointerdown', firstGestureStart);
  };
  document.addEventListener('pointerdown', firstGestureStart, { once: true });

  // ===== EVENT DETAILS DIALOG =====
  const eventDialog = document.getElementById('eventDetailsDialog');
  const eventTriggers = document.querySelectorAll('.event-card-interactive');
  const closeEventDialogBtn = document.getElementById('eventDetailsClose');
  const eventDialogFields = {
    title: document.getElementById('eventDetailsTitle'),
    date: document.getElementById('eventDetailsDate'),
    time: document.getElementById('eventDetailsTime'),
    venue: document.getElementById('eventDetailsVenue'),
    directions: document.getElementById('eventDetailsDirections')
  };
  const copyEventVenueBtn = document.getElementById('eventDetailsCopy');
  const eventActionStatus = document.getElementById('eventActionStatus');

  if(eventDialog && closeEventDialogBtn){
    eventTriggers.forEach(trigger=>{
      trigger.addEventListener('click', ()=>{
        eventDialogFields.title.textContent = trigger.dataset.eventTitle;
        eventDialogFields.date.textContent = trigger.dataset.eventDate;
        eventDialogFields.time.textContent = trigger.dataset.eventTime;
        eventDialogFields.venue.textContent = trigger.dataset.eventVenue;
        eventDialogFields.directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' +
          encodeURIComponent(trigger.dataset.mapQuery);
        eventDialog.showModal();
      });
    });

    closeEventDialogBtn.addEventListener('click', ()=>eventDialog.close());
    if(copyEventVenueBtn){
      copyEventVenueBtn.addEventListener('click', async ()=>{
        const venue = eventDialogFields.venue?.textContent || '';
        try{
          await window.copyToClipboard(venue);
          copyEventVenueBtn.textContent = 'Address Copied';
          if(eventActionStatus) eventActionStatus.textContent = 'Venue address copied to clipboard.';
          setTimeout(()=>{copyEventVenueBtn.textContent='Copy Address'},1800);
        }catch(error){
          copyEventVenueBtn.textContent = 'Unable to Copy';
          if(eventActionStatus) eventActionStatus.textContent = 'Could not copy the address. Please select and copy it manually.';
          setTimeout(()=>{copyEventVenueBtn.textContent='Copy Address'},1800);
        }
      });
    }
    eventDialog.addEventListener('click', event=>{
      if(event.target === eventDialog) eventDialog.close();
    });
  }

  // Direct Calendar Links
  (function initDirectCalendarLinks(){
    const year = 2026;
    const wedBtn = document.getElementById('weddingGCalDirect');
    if(wedBtn){
      wedBtn.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent('Neha & Basavaraj Wedding Muhurtham') +
        '&dates=' + year + '1220T023000Z/' + year + '1220T070000Z' +
        '&details=' + encodeURIComponent('Auspicious Wedding Muhurtam of Neha & Basavaraj.\n\nDate: 20 December 2026\nTime: 8:00 AM\nVenue: Shivagange Conventional Hall, Davangere') +
        '&location=' + encodeURIComponent('Shivagange Conventional Hall, Kundavada Road, Vinayaka Badavane, Davangere, Karnataka 577006');
    }
    const recBtn = document.getElementById('receptionGCalDirect');
    if(recBtn){
      recBtn.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent('Neha & Basavaraj Wedding Reception') +
        '&dates=' + year + '1225T140000Z/' + year + '1225T180000Z' +
        '&details=' + encodeURIComponent('Grand Wedding Reception of Neha & Basavaraj.\n\nDate: 25 December 2026\nTime: 7:30 PM onwards\nVenue: Vijaypur, Karnataka') +
        '&location=' + encodeURIComponent('Vijaypur, Karnataka');
    }
  })();

})();
