      window.__zulmatBooted = true;
        window.onerror = function (msg, url, line) {
          try { console.error('[ZULMAT]', line, msg); } catch (e) {}
        };
      // Optional Telegram Mini App fullscreen support
      if (window.Telegram && window.Telegram.WebApp) {
        try {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
          if (window.Telegram.WebApp.disableVerticalSwipes) {
            window.Telegram.WebApp.disableVerticalSwipes();
          }
        } catch (e) {}
      }

      var REPO_GLB_BASE = 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/models/';
      var REPO_VIDEO_BASE = 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/video/';
      window.__zulmatPlayStoryVideo = function(filename, onDone) {
        const ov = document.getElementById('story-video-overlay');
        const vid = document.getElementById('story-video-el');
        const skipBtn = document.getElementById('btn-skip-story-video');
        const stLbl = document.getElementById('story-video-status');
        if (!ov || !vid) { if (onDone) onDone(); return; }
        if (window.__zulmatStopStartMenuBgm) window.__zulmatStopStartMenuBgm();
        let finished = false;
        let loadTimer = null;
        let triedFallback = false;
        const isLocalApp = (location.protocol === 'capacitor:' || location.protocol === 'file:' || location.hostname === 'localhost');
        const urls = isLocalApp
          ? ['./video/' + filename, (typeof REPO_VIDEO_BASE !== 'undefined' ? REPO_VIDEO_BASE : './video/') + filename]
          : [(typeof REPO_VIDEO_BASE !== 'undefined' ? REPO_VIDEO_BASE : './video/') + filename, 'https://raw.githubusercontent.com/revilend/backrooms-game/main/video/' + filename];
        const finish = () => {
          if (finished) return;
          finished = true;
          if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
          try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}
          ov.classList.add('hidden');
          if (onDone) onDone();
        };
        const tryUrl = (idx) => {
          if (finished) return;
          if (idx >= urls.length) { finish(); return; }
          vid.src = urls[idx];
          vid.currentTime = 0;
          vid.muted = false;
          const p = vid.play();
          if (p && p.catch) {
            p.catch(() => {
              vid.muted = true;
              const p2 = vid.play();
              if (p2 && p2.catch) p2.catch(() => tryUrl(idx + 1));
            });
          }
        };
        if (skipBtn) skipBtn.onclick = finish;
        vid.onended = finish;
        vid.onerror = () => {
          if (!triedFallback) { triedFallback = true; tryUrl(1); }
          else finish();
        };
        vid.onplaying = () => {
          if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
          if (stLbl) stLbl.style.display = 'none';
        };
        loadTimer = setTimeout(() => {
          if (!finished && vid.readyState < 2) {
            if (!triedFallback) { triedFallback = true; tryUrl(1); }
            else finish();
          }
        }, 4500);
        if (stLbl) stLbl.style.display = 'block';
        ov.classList.remove('hidden');
        tryUrl(0);
      };

      var repoGlbCache = {};
      var repoGlbCallbacks = {};
      var activeMonsterMixers = [];
      var activeRiggedMonsters = [];
      var riggedWalkPhase = 0;
      var l94WolfLoaded = false;
      var partygoerLoaded = false;

      // --- Clean Horror Audio Engine (Single-element Studio MP3 + Crisp Web Audio SFX) ---
      const Sound = {
        ctx: null,
        noiseBuf: null,
        muted: false,
        bgm: null,
        bgmUrl: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/music/level0_ambience.m4a',
        // 100% Self-Hosted Commercial Audio Clips (zero Wikimedia/Incompetech external hotlinks!)
        realClips: {
          trainBrake: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/metro_arrive.m4a',
          doorOpen: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/locker_hide.m4a',
          doorClose: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/locker_hide.m4a',
          fireAlarm: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/electric_zap.m4a',
          heartbeat: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/monster_growl.m4a',
          musicBox: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/music/level_fun_musicbox.m4a',
          wind: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/desert_wind.m4a',
          rain: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/wade_water.m4a',
          windchime: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/music/level94_dreamcore.m4a',
          breeze: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/sfx/desert_wind.m4a',
          metroHub: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/music/metro_hub.m4a'
        },
        clipCache: {},
        sfxBuffers: {},
        sfxLoading: {},
        sfxNames: [
          'monster_growl', 'monster_roar', 'footstep_carpet', 'footstep_concrete', 'footstep_grass', 'footstep_water', 'radio_beep', 'fall_abyss', 'distant_scream',
          'pickup_item', 'switch_breaker', 'splash_water', 'wade_water',
          'flashlight_click', 'electric_zap', 'no_clip_glitch', 'locker_hide',
          'almond_drink', 'keypad_beep', 'steam_hiss', 'crt_boot',
          'metro_arrive', 'metro_depart', 'desert_wind', 'glass_shatter', 'chair_throw_1', 'chair_throw_2', 'chair_throw_3'
        ],
        ghAudioFallback: 'https://raw.githubusercontent.com/revilend/backrooms-game/main/audio/',
        loadSfx(name) {
          if (!this.ctx || this.sfxBuffers[name] || this.sfxLoading[name]) return;
          this.sfxLoading[name] = true;
          const decodeBuf = (ab) => ab ? this.ctx.decodeAudioData(ab) : null;
          const tryRaw = () => fetch(this.ghAudioFallback + 'sfx/' + name + '.m4a')
            .then((r) => r.ok ? r.arrayBuffer() : null)
            .then(decodeBuf)
            .then((buf) => { if (buf) this.sfxBuffers[name] = buf; })
            .catch(() => {});
          fetch(this.ghAudioBase + 'sfx/' + name + '.m4a')
            .then((r) => r.ok ? r.arrayBuffer() : Promise.reject(new Error('cdn')))
            .then(decodeBuf)
            .then((buf) => { if (buf) this.sfxBuffers[name] = buf; else return tryRaw(); })
            .catch(() => tryRaw());
        },
        preloadSfxAll() {
          if (!this.ctx) return;
          const core = ['footstep_carpet', 'footstep_concrete', 'pickup_item', 'flashlight_click', 'monster_growl', 'monster_roar', 'locker_hide', 'switch_breaker'];
          const rest = this.sfxNames.filter((n) => core.indexOf(n) === -1);
          core.forEach((n) => this.loadSfx(n));
          for (let i = 0; i < rest.length; i += 4) {
            const batch = rest.slice(i, i + 4);
            setTimeout(() => batch.forEach((n) => this.loadSfx(n)), 450 * (1 + i / 4));
          }
        },
        updateListener(pos, yaw) {
          if (!this.ctx || !this.ctx.listener || !pos) return;
          const L = this.ctx.listener;
          const fx = -Math.sin(yaw || 0), fz = -Math.cos(yaw || 0);
          try {
            if (L.positionX) {
              const t = this.ctx.currentTime;
              L.positionX.setValueAtTime(pos.x, t);
              L.positionY.setValueAtTime(pos.y || 1.6, t);
              L.positionZ.setValueAtTime(pos.z, t);
              L.forwardX.setValueAtTime(fx, t);
              L.forwardY.setValueAtTime(0, t);
              L.forwardZ.setValueAtTime(fz, t);
              L.upX.setValueAtTime(0, t);
              L.upY.setValueAtTime(1, t);
              L.upZ.setValueAtTime(0, t);
            } else if (L.setPosition) {
              L.setPosition(pos.x, pos.y || 1.6, pos.z);
              L.setOrientation(fx, 0, fz, 0, 1, 0);
            }
          } catch (e) {}
        },
        _makePanner(wx, wy, wz, maxD = 32) {
          if (!this.ctx || !this.ctx.createPanner) return null;
          try {
            const p = this.ctx.createPanner();
            p.panningModel = 'HRTF';
            p.distanceModel = 'inverse';
            p.refDistance = 2.6;
            p.maxDistance = maxD;
            p.rolloffFactor = 1.45;
            if (p.positionX) {
              const t = this.ctx.currentTime;
              p.positionX.setValueAtTime(wx, t);
              p.positionY.setValueAtTime(wy, t);
              p.positionZ.setValueAtTime(wz, t);
            } else if (p.setPosition) {
              p.setPosition(wx, wy, wz);
            }
            return p;
          } catch (e) { return null; }
        },
        playSfx3D(name, wx, wy, wz, vol = 0.75, opts = {}) {
          if (this.muted || !this.ctx) return false;
          const buf = this.sfxBuffers[name];
          if (!buf) { this.loadSfx(name); return false; }
          try {
            const s = this.ctx.createBufferSource();
            s.buffer = buf;
            if (opts.rate) s.playbackRate.value = opts.rate;
            const g = this.ctx.createGain();
            g.gain.value = vol;
            const pan = this._makePanner(wx, wy, wz, opts.maxDist || 34);
            if (pan) { s.connect(g); g.connect(pan); pan.connect(this.ctx.destination); }
            else { s.connect(g); g.connect(this.ctx.destination); }
            const offset = opts.offset !== undefined ? Math.min(opts.offset, Math.max(0, buf.duration - 0.15)) : 0;
            if (opts.dur) s.start(0, offset, opts.dur);
            else s.start(0, offset);
            return true;
          } catch (e) { return false; }
        },
        playSfx(name, vol = 0.6, opts = {}) {
          if (this.muted || !this.ctx) return false;
          const buf = this.sfxBuffers[name];
          if (!buf) { this.loadSfx(name); return false; }
          try {
            const s = this.ctx.createBufferSource();
            s.buffer = buf;
            if (opts.rate) s.playbackRate.value = opts.rate;
            const g = this.ctx.createGain();
            g.gain.value = vol;
            s.connect(g);
            g.connect(this.ctx.destination);
            const offset = opts.offset !== undefined ? Math.min(opts.offset, Math.max(0, buf.duration - 0.15)) : 0;
            if (opts.dur) s.start(0, offset, opts.dur);
            else s.start(0, offset);
            return true;
          } catch (e) { return false; }
        },
        init() {
          if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
              this.ctx = new AC();
              setTimeout(() => this.preloadSfxAll(), 150);
              const sr = this.ctx.sampleRate;
              const buf = this.ctx.createBuffer(1, sr * 2, sr);
              const d = buf.getChannelData(0);
              for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
              this.noiseBuf = buf;
            }
          }
          if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
          if (!this.bgm) {
            const a = new Audio(this.bgmUrl);
            a.loop = true;
            a.volume = 0.34;
            this.bgm = a;
          }
          if (!this.muted && state.started && !state.paused) {
            this.playZoneBgm(state.zone);
          }
        },
        playClip(key, vol = 0.45, maxMs = 0, startSec = 0) {
          if (this.muted) return false;
          const url = this.realClips[key];
          if (!url) return false;
          try {
            let a = this.clipCache[key];
            if (!a) {
              a = new Audio(url);
              a.preload = 'auto';
              this.clipCache[key] = a;
            }
            a.volume = Math.min(1, Math.max(0, vol));
            a.currentTime = startSec;
            a.play().catch(() => {});
            if (maxMs > 0) {
              clearTimeout(a._stopT);
              a._stopT = setTimeout(() => { try { a.pause(); } catch (e) {} }, maxMs);
            }
            return true;
          } catch (e) { return false; }
        },
        playLoopClip(key, vol = 0.32) {
          if (this.muted) return false;
          const url = this.realClips[key];
          if (!url) return false;
          try {
            let a = this.clipCache[key];
            if (!a) { a = new Audio(url); a.preload = 'auto'; this.clipCache[key] = a; }
            a.loop = true;
            a.volume = Math.min(1, Math.max(0, vol));
            if (a.paused) a.play().catch(() => {});
            return true;
          } catch (e) { return false; }
        },
        ghAudioBase: 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/',
        zoneBgmMap: {
          metro_lobby: 'metro_hub',
          level0: 'level0_lobby',
          level4: 'level0_lobby',
          level1: 'industrial_dark',
          level2: 'industrial_dark',
          level3: 'industrial_dark',
          level5: 'level5_hotel',
          levelend: 'level5_hotel',
          level37: 'level37_poolrooms',
          levelrun: 'level_run_chase',
          levelfun: 'level_fun',
          level94: 'level94_dreamcore',
          level10: 'level94_dreamcore',
          level9: 'level9_11_city',
          level11: 'level9_11_city',
          level6: 'industrial_dark',
          level7: 'level37_poolrooms',
          level8: 'industrial_dark',
          level188: 'level5_hotel',
          level974: 'level94_dreamcore',
          level33: 'level61_snackrooms',
          level36: 'level9_11_city',
          levelshady: 'level922_void',
          level14: 'level922_void',
          level15: 'industrial_dark',
          level22: 'industrial_dark',
          level46: 'level94_dreamcore',
          levelmanila: 'level0_lobby',
          levelmirror: 'level922_void',
          level3999: 'level61_snackrooms',
          level922: 'level922_void',
          level61: 'level61_snackrooms'
        },
        activeZoneBgm: null,
        _fadeOutAudio(a) {
          if (!a) return;
          try {
            let ticks = 0;
            const step = () => {
              if (!a || a.paused || ++ticks > 14) {
                try { a.pause(); a.volume = 0.42; } catch (e) {}
                return;
              }
              const prev = a.volume;
              const next = Math.max(0, prev - 0.06);
              a.volume = next;
              if (Math.abs(a.volume - prev) < 0.001 || a.volume <= 0.04) {
                a.pause();
                a.volume = 0.42;
              } else {
                setTimeout(step, 45);
              }
            };
            step();
          } catch (e) { try { a.pause(); } catch (e2) {} }
        },
        _fadeInAudio(a, target = 0.42) {
          if (!a) return;
          try {
            let ticks = 0;
            a.volume = 0.02;
            if (Math.abs(a.volume - 0.02) > 0.01) return; // iOS read-only volume
            const step = () => {
              if (!a || a.paused || this.muted || ++ticks > 14) {
                try { a.volume = target; } catch (e) {}
                return;
              }
              if (a.volume < target - 0.03) {
                a.volume = Math.min(target, a.volume + 0.04);
                setTimeout(step, 50);
              } else {
                a.volume = target;
              }
            };
            step();
          } catch (e) {}
        },
        playZoneBgm(zone) {
          if (this.muted || !state.started || state.paused) return;
          const baseName = this.zoneBgmMap[zone];
          if (this.activeZoneBgm) { this._fadeOutAudio(this.activeZoneBgm); this.activeZoneBgm = null; }
          if (!baseName) {
            if (this.bgm && this.bgm.paused) this.bgm.play().catch(() => {});
            return;
          }
          const tryUrls = [
            this.ghAudioBase + 'music/' + baseName + '.m4a',
            this.ghAudioFallback + 'music/' + baseName + '.m4a'
          ];
          const playIdx = (idx) => {
            if (idx >= tryUrls.length) {
              if (this.bgm && !this.muted && !state.paused) this.bgm.play().catch(() => {});
              return;
            }
            const url = tryUrls[idx];
            let a = this.clipCache['zbgm_' + url];
            if (!a) {
              a = new Audio(url);
              a.loop = true;
              a.volume = 0.42;
              this.clipCache['zbgm_' + url] = a;
            }
            a.onerror = () => playIdx(idx + 1);
            const p = a.play();
            if (p && p.then) {
              p.then(() => {
                if (this.bgm) this.bgm.pause();
                this.activeZoneBgm = a;
                this._fadeInAudio(a, this.activeVoice ? 0.16 : 0.42);
              }).catch(() => playIdx(idx + 1));
            }
          };
          playIdx(0);
        },
        activeVoice: null,
        _voiceCooldowns: {},
        _voiceCache: {},
        _subTimer: null,
        _voiceSubtitles: {
          vox_wake: {
            en: "Where am I...? These endless yellow walls... I have to find a way out.",
            ru: "Где я?.. Эти бесконечные жёлтые стены... Мне нужно найти выход."
          },
          vox_monster: {
            en: "Something is following me! Don't look back — run or hide!",
            ru: "За мной кто-то идёт! Не оглядывайся — беги или прячься!"
          },
          vox_hide: {
            en: "Quiet... Hold your breath until it passes.",
            ru: "Тише... Задержи дыхание, пока оно не пройдёт мимо."
          },
          vox_almond: {
            en: "Almond Water... My strength and mind are clearing up.",
            ru: "Миндальная вода... Силы и рассудок возвращаются."
          },
          vox_battery_low: {
            en: "My flashlight battery is almost dead!",
            ru: "Заряд фонарика почти на нуле!"
          },
          vox_caught: {
            uz: "Yo'q! U meni topdi!",
            en: "No! It found me!",
            ru: "Нет! Оно нашло меня!"
          },
          vox_win: {
            uz: "Chiqish eshigiga yetib keldim!",
            en: "I made it through the exit!",
            ru: "Я добрался до выхода!"
          },
          vox_train_arrive: {
            uz: "Bekatga metro poyezdi keldi... Ichiga kiramiz.",
            en: "A subway train just pulled into the station... Let's get on.",
            ru: "На станцию прибыл поезд метро... Нужно зайти внутрь."
          },
          metro_arrive_vox: {
            uz: "[E'lon]: Poyezd M.E.G. Markaziy Bekatiga yetib keldi. Vagonga chiqing.",
            en: "[PA System]: Train arriving at M.E.G. Transit Hub. Please step inside the carriage.",
            ru: "[Объявление]: Поезд прибыл на пересадочный узел M.E.G. Просьба пройти в вагон."
          },
          metro_depart_vox: {
            uz: "[E'lon]: Eshiklar yopilmoqda. Keyingi Backrooms sektoriga jo'naymiz.",
            en: "[PA System]: Doors closing. Departing for the next Backrooms sector.",
            ru: "[Объявление]: Двери закрываются. Отправление к следующему уровню Закулисья."
          }
        },
        showVoiceSubtitle(name, durMs, customTxt) {
          const lang = window.__zulmatLang || 'uz';
          const el = document.getElementById('voice-subtitle');
          if (!el) return;
          let txt = customTxt || '';
          if (!txt) {
            const entry = this._voiceSubtitles[name];
            txt = entry ? (entry[lang] || entry.uz || entry.en) : '';
            if (!txt && String(name).startsWith('cas_')) {
              txt = lang === 'ru' ? '[Аудиозапись M.E.G. воспроизводится...]' : (lang === 'en' ? '[M.E.G. Archive Cassette playing...]' : "[M.E.G. arxiv kasetasi yangramoqda...]");
            }
          }
          if (!txt) return;
          el.textContent = txt;
          el.classList.remove('hidden');
          clearTimeout(this._subTimer);
          this._subTimer = setTimeout(() => { el.classList.add('hidden'); }, Math.max(3400, durMs || 5500));
        },
        playVoice(name, vol = 0.92, cooldownMs = 0) {
          if (this.muted || !name) return false;
          const now = Date.now();
          if (cooldownMs > 0 && this._voiceCooldowns[name] && (now - this._voiceCooldowns[name]) < cooldownMs) return false;
          this._voiceCooldowns[name] = now;
          try {
            if (this.activeVoice) {
              try { this.activeVoice.pause(); this.activeVoice.currentTime = 0; } catch (e) {}
            }
            const a = new Audio(this.ghAudioBase + 'voice/' + name + '.m4a');
            a.onerror = () => {
              if (!a._triedRaw) {
                a._triedRaw = true;
                a.src = this.ghAudioFallback + 'voice/' + name + '.m4a';
                a.play().catch(restoreBgm);
              } else { restoreBgm(); }
            };
            a.volume = Math.min(1, Math.max(0, vol));
            this.activeVoice = a;
            this._voiceCache[name] = a;
            if (this.activeZoneBgm) this.activeZoneBgm.volume = 0.16;
            this.showVoiceSubtitle(name, 6500);
            const restoreBgm = () => {
              if (this.activeVoice === a) this.activeVoice = null;
              if (this.activeZoneBgm) this.activeZoneBgm.volume = 0.42;
              const subEl = document.getElementById('voice-subtitle');
              if (subEl) subEl.classList.add('hidden');
            };
            a.onloadedmetadata = () => {
              if (isFinite(a.duration) && a.duration > 0.5) this.showVoiceSubtitle(name, a.duration * 1000 + 600);
            };
            a.onended = restoreBgm;
            a.play().catch(restoreBgm);
            return true;
          } catch (e) { return false; }
        },
        stopAllClips() {
          Object.values(this.clipCache).forEach((a) => { try { a.loop = false; a.pause(); } catch (e) {} });
          if (this.activeVoice) { try { this.activeVoice.pause(); } catch (e) {} this.activeVoice = null; }
          this.activeZoneBgm = null;
        },
        syncMute() {
          if (this.muted || state.paused || !state.started) {
            if (this.bgm) this.bgm.pause();
            this.stopAllClips();
          } else {
            this.playZoneBgm(state.zone);
          }
        },
        // Pure soft sine/triangle only (NO harsh sawtooth or square buzz!)
        softTone(f1, f2, dur, vol = 0.12) {
          if (this.muted || !this.ctx) return;
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f1, now);
            osc.frequency.exponentialRampToValueAtTime(Math.max(22, f2), now + dur);
            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(vol, now + Math.min(0.02, dur * 0.15));
            g.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
          } catch (e) {}
        },
        noiseBurst(dur, freq, q, vol, filterType = 'bandpass', fEnd = null) {
          if (this.muted || !this.ctx || !this.noiseBuf) return;
          try {
            const now = this.ctx.currentTime;
            const srcN = this.ctx.createBufferSource();
            srcN.buffer = this.noiseBuf;
            const flt = this.ctx.createBiquadFilter();
            flt.type = filterType;
            flt.frequency.setValueAtTime(freq, now);
            if (fEnd) flt.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), now + dur);
            flt.Q.value = q;
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(vol, now + Math.min(0.018, dur * 0.2));
            g.gain.exponentialRampToValueAtTime(0.001, now + dur);
            srcN.connect(flt);
            flt.connect(g);
            g.connect(this.ctx.destination);
            srcN.start(now, Math.random() * 0.8, dur);
          } catch (e) {}
        },
        playRadioBeep() {
          if (this.muted || !this.ctx) return;
          if (this.playSfx('radio_beep', 0.45, { dur: 1.0 })) return;
          try {
            this.noiseBurst(0.08, 2200, 1.8, 0.08, 'bandpass', 2200);
            this.softTone(1380, 1180, 0.07, 0.06);
          } catch (e) {}
        },
        footstep(sprint = false) { this.step(sprint); },
        step(sprint) {
          const carpetZones = ['level0', 'level4', 'level5', 'levelfun', 'levelend', 'level61', 'level974'];
          const grassZones = ['level9', 'level10', 'level94'];
          const waterZones = ['level37', 'level7'];
          const sfxName = waterZones.includes(state.zone) ? 'footstep_water' : (grassZones.includes(state.zone) ? 'footstep_grass' : (carpetZones.includes(state.zone) ? 'footstep_carpet' : 'footstep_concrete'));
          const off = (Math.floor(Math.random() * 6)) * 0.55;
          if (this.playSfx(sfxName, sprint ? 0.36 : 0.24, { offset: off, dur: 0.32, rate: sprint ? 1.12 : 0.96 })) return;
          const v = sprint ? 0.14 : 0.075;
          this.noiseBurst(sprint ? 0.075 : 0.06, sprint ? 520 : 380, 1.4, v, 'bandpass', 180);
          this.softTone(sprint ? 82 : 64, 30, 0.06, sprint ? 0.09 : 0.05);
        },
        monsterStep(dist, mx, mz) {
          if (this.muted || !this.ctx || dist > 20) return;
          const wx = (mx !== undefined) ? mx : (typeof state !== 'undefined' && state.monsterPos ? state.monsterPos.x : null);
          const wz = (mz !== undefined) ? mz : (typeof state !== 'undefined' && state.monsterPos ? state.monsterPos.z : null);
          if (wx !== null && wz !== null && this.sfxBuffers['footstep_concrete']) {
            const off = (Math.floor(Math.random() * 5)) * 0.55;
            if (this.playSfx3D('footstep_concrete', wx, 0.25, wz, 0.85, { offset: off, dur: 0.34, rate: 0.58, maxDist: 22 })) return;
          }
          const att = Math.max(0, 1 - dist / 20);
          const v = att * att * 0.28;
          if (v < 0.01) return;
          const pan = (wx !== null && wz !== null) ? this._makePanner(wx, 0.3, wz, 22) : null;
          if (pan) {
            try {
              const t = this.ctx.currentTime;
              const o = this.ctx.createOscillator(), g = this.ctx.createGain();
              o.type = 'sine'; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(22, t + 0.15);
              g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
              o.connect(g); g.connect(pan); pan.connect(this.ctx.destination);
              o.start(t); o.stop(t + 0.17);
              return;
            } catch (e) {}
          }
          this.softTone(58, 22, 0.14, v);
          this.noiseBurst(0.09, 220, 1.2, v * 0.65, 'lowpass', 85);
        },
        heartbeat(intensity) {
          const v = 0.1 + intensity * 0.24;
          this.softTone(58, 26, 0.13, v, 0);
          this.softTone(48, 24, 0.11, v * 0.78, 0.155);
        },
        // Organic breathy monster snarl & hiss (filtered noise + deep sub-thump — ZERO buzzy sawtooth!)
        monsterGrowl(intensity = 0.7) {
          if (this.playSfx('monster_growl', Math.min(0.75, 0.28 + intensity * 0.45), { offset: Math.random() * 4, dur: 2.2 })) return;
          const v = Math.min(0.28, 0.1 + intensity * 0.18);
          this.noiseBurst(0.65, 320, 2.8, v, 'bandpass', 150);
          this.noiseBurst(0.55, 920, 1.8, v * 0.45, 'bandpass', 380);
          this.softTone(56, 32, 0.52, v * 0.8);
        },
        slash() {
          this.noiseBurst(0.24, 3200, 1.5, 0.34, 'bandpass', 520);
          this.softTone(120, 34, 0.18, 0.24);
        },
        // Visceral horror impact + shrieky breath-noise burst (NO buzzy synth!)
        jumpscareKill() {
          if (this.playSfx('monster_roar', 0.85)) return;
          this.softTone(95, 22, 1.05, 0.44);
          this.noiseBurst(0.85, 2400, 1.4, 0.36, 'bandpass', 480);
          setTimeout(() => this.noiseBurst(0.55, 1350, 2.2, 0.30, 'bandpass', 320), 120);
          setTimeout(() => this.softTone(74, 24, 0.65, 0.32), 180);
        },
        click() {
          this.noiseBurst(0.03, 2200, 2.5, 0.08, 'highpass');
        },
        pickup() {
          if (this.playSfx('pickup_item', 0.62)) return;
          this.softTone(660, 880, 0.12, 0.11);
          setTimeout(() => this.softTone(990, 1320, 0.16, 0.09), 75);
        },
        locker() {
          if (this.playSfx('locker_hide', 0.65)) return;
          this.noiseBurst(0.14, 880, 2.2, 0.14, 'bandpass', 260);
          this.softTone(110, 48, 0.14, 0.11);
        },
        scare() { this.jumpscareKill(); },
        jump() {
          this.noiseBurst(0.06, 620, 1.4, 0.07, 'bandpass', 280);
        },
        tileStep(sprint) {
          const v = sprint ? 0.11 : 0.065;
          this.noiseBurst(0.032, 2100, 2.2, v, 'bandpass', 950);
          setTimeout(() => { this.noiseBurst(0.028, 1650, 2.4, v * 0.35, 'bandpass', 800); }, 85);
        },
        waterBubble(delayMs, baseFreq, vol) {
          setTimeout(() => {
            if (this.muted || !this.ctx) return;
            try {
              const now = this.ctx.currentTime;
              const osc = this.ctx.createOscillator();
              const g = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(baseFreq, now);
              osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.85, now + 0.065);
              g.gain.setValueAtTime(0.001, now);
              g.gain.linearRampToValueAtTime(vol, now + 0.012);
              g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
              osc.connect(g);
              g.connect(this.ctx.destination);
              osc.start(now);
              osc.stop(now + 0.08);
            } catch (e) {}
          }, delayMs);
        },
        bigSplash() {
          if (this.playSfx('splash_water', 0.72)) return;
          this.softTone(155, 42, 0.22, 0.26);
          this.noiseBurst(0.18, 420, 0.9, 0.24, 'lowpass', 160);
          this.noiseBurst(0.52, 2600, 0.75, 0.32, 'bandpass', 480);
          setTimeout(() => this.noiseBurst(0.36, 1550, 1.1, 0.18, 'bandpass', 380), 95);
          for (let i = 0; i < 6; i++) {
            this.waterBubble(45 + i * 62 + Math.random() * 30, 520 + Math.random() * 780, 0.085 - i * 0.01);
          }
        },
        waterStep(sprint) {
          if (this.playSfx('wade_water', sprint ? 0.48 : 0.34, { offset: Math.random() * 0.6, dur: 0.45 })) return;
          const v = sprint ? 0.19 : 0.12;
          this.noiseBurst(sprint ? 0.20 : 0.16, sprint ? 1750 : 1200, 0.95, v, 'bandpass', 380);
          this.noiseBurst(0.12, 540, 1.3, v * 0.75, 'lowpass', 220);
          this.waterBubble(25, 460 + Math.random() * 280, v * 0.45);
          this.waterBubble(75, 680 + Math.random() * 420, v * 0.35);
        },
        flashlight() {
          if (this.playSfx('flashlight_click', 0.65)) return;
          this.click();
        },
        electricZap() {
          if (this.playSfx('electric_zap', 0.72)) return;
          this.blackout();
        },
        noclipGlitch() {
          if (this.playSfx('no_clip_glitch', 0.78)) return;
          this.blackout();
        },
        almondDrink() {
          if (this.playSfx('almond_drink', 0.72)) return;
          this.pickup();
        },
        keypadBeep() {
          if (this.playSfx('keypad_beep', 0.65)) return;
          this.pickup();
        },
        crtBoot() {
          if (this.playSfx('crt_boot', 0.68)) return;
          this.pickup();
        },
        generatorStart() {
          if (this.playSfx('switch_breaker', 0.72)) return;
          // Mechanical heavy thud + pneumatic chug (ZERO sawtooth buzz!)
          [0, 160, 320, 480].forEach((ms, idx) => {
            setTimeout(() => {
              this.softTone(68 + idx * 8, 34, 0.14, 0.16);
              this.noiseBurst(0.12, 420 + idx * 90, 1.4, 0.14, 'bandpass', 180);
            }, ms);
          });
        },
        blackout() {
          // Heavy breaker relay clunk + deep power-down thump (ZERO sawtooth!)
          this.noiseBurst(0.14, 1400, 1.8, 0.24, 'bandpass', 260);
          this.softTone(90, 26, 0.55, 0.26);
        },
        musicBox(stepIdx) {
          // Real recorded wind-up music box on first beat, soft bell chime fallback
          if (stepIdx === 0) this.playClip('musicBox', 0.38, 0, 0);
        },
        balloonPop() {
          this.noiseBurst(0.08, 1900, 0.85, 0.34, 'bandpass', 420);
          this.softTone(240, 55, 0.09, 0.2);
        },
        alarm() {
          // Real recorded Wikimedia fire alarm!
          this.playClip('fireAlarm', 0.36, 1300, 0);
        },
        steamHiss() {
          if (this.playSfx('steam_hiss', 0.62)) return;
          this.noiseBurst(0.55, 2400, 1.2, 0.18, 'highpass', 1200);
        },
        valveTurn() {
          if (this.playSfx('switch_breaker', 0.68)) return;
          this.noiseBurst(0.22, 1150, 2.2, 0.14, 'bandpass', 420);
          this.softTone(220, 340, 0.16, 0.09);
        },
        trainDoor() {
          // Real recorded Shanghai Metro door open/close sound!
          this.playClip(state.trainAnim === 'departing' ? 'doorClose' : 'doorOpen', 0.55, 2400, 0);
        },
        trainBrake() {
          if (this.playSfx('metro_arrive', 0.65)) return;
          this.playClip('trainBrake', 0.45, 2800, 8);
        },
        trainDepart() {
          if (this.playSfx('metro_depart', 0.65)) return;
          this.playClip('trainBrake', 0.38, 2600, 1);
          [420, 760, 1080, 1340, 1580, 1800, 2000].forEach((ms) => {
            setTimeout(() => {
              this.softTone(74, 34, 0.06, 0.12);
              this.noiseBurst(0.055, 680, 2.0, 0.1, 'bandpass', 240);
            }, ms);
          });
        },
        win() {
          [523, 659, 784, 1046].forEach((n, i) => {
            setTimeout(() => this.softTone(n, n * 1.01, 0.24, 0.12), i * 110);
          });
        }
      };

      // --- MASSIVE 39 x 39 (164m x 164m) Authentic Backrooms Level 0 Architectural Generator ---
      const GRID_ROWS = 125;
      const GRID_COLS = 125;
      const CELL = 4.2;
      const WALL_H = 3.8;

      function gridToWorld(r, c) {
        return {
          x: (c - GRID_COLS / 2 + 0.5) * CELL,
          z: (r - GRID_ROWS / 2 + 0.5) * CELL
        };
      }

      // Deterministic PRNG so the mega Backrooms Level 0 architecture is always balanced & 100% connected
      let rngSeed = ((Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 77713;
      function rng() {
        rngSeed = (rngSeed * 1664525 + 1013904223) % 4294967296;
        return rngSeed / 4294967296;
      }

      const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill('#'));

      // Step 1: Carve full connected labyrinth (recursive backtracker)
      const stack = [[1, 1]];
      grid[1][1] = '.';
      while (stack.length > 0) {
        const [cr, cc] = stack[stack.length - 1];
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
        for (let i = dirs.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
        }
        let carved = false;
        for (let i = 0; i < dirs.length; i++) {
          const nr = cr + dirs[i][0], nc = cc + dirs[i][1];
          if (nr > 0 && nr < GRID_ROWS - 1 && nc > 0 && nc < GRID_COLS - 1 && grid[nr][nc] === '#') {
            grid[cr + dirs[i][0] / 2][cc + dirs[i][1] / 2] = '.';
            grid[nr][nc] = '.';
            stack.push([nr, nc]);
            carved = true;
            break;
          }
        }
        if (!carved) stack.pop();
      }

      // Step 2: Carve 10 HUGE Varied Backrooms Level 0 Zones (800m x 800m: Open Pillar Halls, Long Sightlines, Blackout Sectors & Atriums)
      const PILLAR_HALLS = [
        { r0: 3, c0: 3, h: 13, w: 17 },      // North-West Bright Spawn Pillar Hall
        { r0: 22, c0: 6, h: 15, w: 21 },     // West Glass Partition Office Hall
        { r0: 12, c0: 34, h: 5, w: 42 },     // North Long Straight Corridor
        { r0: 6, c0: 84, h: 21, w: 25 },     // North-East Red-Carpeted Office Wing
        { r0: 48, c0: 48, h: 23, w: 25 },    // Grand Central High-Ceiling Atrium
        { r0: 46, c0: 86, h: 23, w: 25 },    // East Pitch-Black Warehouse Hall
        { r0: 48, c0: 10, h: 21, w: 9 },     // West-Central Dark Connecting Hall
        { r0: 84, c0: 8, h: 25, w: 27 },     // South-West Pitch-Black Blackout Sector
        { r0: 88, c0: 48, h: 19, w: 25 },    // South-Central Bright Fluorescent Hall
        { r0: 84, c0: 84, h: 27, w: 27 }     // South-East Deep Labyrinth Pillar Hall
      ];
      PILLAR_HALLS.forEach((hl) => {
        for (let r = hl.r0; r < hl.r0 + hl.h; r++) {
          for (let c = hl.c0; c < hl.c0 + hl.w; c++) {
            // Leave iconic evenly-spaced yellow wallpaper pillars inside the open hall
            const isPillar = ((r - hl.r0) % 3 === 1 && (c - hl.c0) % 3 === 1 && r > hl.r0 && r < hl.r0 + hl.h - 1 && c > hl.c0 && c < hl.c0 + hl.w - 1);
            grid[r][c] = isPillar ? '#' : '.';
          }
        }
      });

      // Step 3: Punch extra doorway loops so corridors feel authentically liminal & non-linear
      for (let r = 2; r < GRID_ROWS - 2; r++) {
        for (let c = 2; c < GRID_COLS - 2; c++) {
          if (grid[r][c] === '#' && rng() < 0.14) {
            const horiz = grid[r][c - 1] === '.' && grid[r][c + 1] === '.';
            const vert = grid[r - 1][c] === '.' && grid[r + 1][c] === '.';
            if (horiz || vert) grid[r][c] = '.';
          }
        }
      }

      // Place Player Spawn (top-left hall), Exit Gate (far bottom-right corner), 8 Keys, 14 Batteries, 16 Lockers & 2 Stalkers!
      grid[2][2] = 'S';
      grid[1][2] = '.'; grid[2][1] = '.'; grid[2][3] = '.'; grid[3][2] = '.';
      // Place Exit Door at a RANDOM far location (>= 72 cells away from spawn)
      const farExitCandidates = [];
      for (let r = 3; r < GRID_ROWS - 3; r++) {
        for (let c = 3; c < GRID_COLS - 3; c++) {
          if (grid[r][c] === '.' && Math.hypot(r - 2, c - 2) >= 72) {
            farExitCandidates.push([r, c]);
          }
        }
      }
      const chosenExit = farExitCandidates.length
        ? farExitCandidates[Math.floor(rng() * farExitCandidates.length)]
        : [GRID_ROWS - 2, GRID_COLS - 2];
      const [er, ec] = chosenExit;
      grid[er][ec] = 'E';
      if (er > 1) grid[er - 1][ec] = '.';
      if (er < GRID_ROWS - 2) grid[er + 1][ec] = '.';
      if (ec > 1) grid[er][ec - 1] = '.';
      if (ec < GRID_COLS - 2) grid[er][ec + 1] = '.';

      const keyCoords = [[5, 9], [6, 30], [18, 5], [19, 19], [16, 35], [31, 9], [31, 29], [23, 33]];
      keyCoords.forEach(([r, c]) => { grid[r][c] = 'K'; });

      const batCoords = [[3, 6], [9, 15], [5, 27], [13, 7], [17, 15], [19, 24], [11, 33], [24, 12], [28, 7], [33, 14], [29, 27], [35, 22], [22, 29], [35, 33]];
      batCoords.forEach(([r, c]) => { if (grid[r][c] === '.') grid[r][c] = 'B'; });

      const lockCoords = [[4, 3], [8, 11], [4, 25], [11, 29], [16, 3], [16, 14], [22, 24], [27, 5], [35, 11], [27, 25], [34, 33], [13, 21], [25, 19], [9, 21]];
      lockCoords.forEach(([r, c]) => { if (grid[r][c] === '.') grid[r][c] = 'L'; });

      grid[8][9] = 'M';
      const monster2Spawn = gridToWorld(104, 98);
      grid[30][28] = '.';

      const MAZE_MAP = grid.map((row) => row.join(''));

      // --- Exact Original Backrooms Level 0 Color-Matched Textures (Wikipedia Reference Palette) ---
      function makeBackroomsWallTex() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        // Authentic muted mustard-olive Backrooms wallpaper base
        g.fillStyle = '#a69d64';
        g.fillRect(0, 0, 512, 512);

        // Subtle vertical striped bands + soft chevron arrows (zero harsh grid!)
        for (let x = 0; x < 512; x += 32) {
          g.fillStyle = (x % 64 === 0) ? 'rgba(126, 118, 72, 0.24)' : 'rgba(176, 168, 118, 0.14)';
          g.fillRect(x, 0, 14, 512);
          g.strokeStyle = 'rgba(84, 78, 44, 0.36)';
          g.lineWidth = 1.9;
          g.lineCap = 'round';
          for (let y = 10; y < 512; y += 28) {
            g.beginPath();
            g.moveTo(x + 11, y + 8);
            g.lineTo(x + 16, y + 2);
            g.lineTo(x + 21, y + 8);
            g.stroke();
          }
        }
        // Fine organic wallpaper grain & subtle moisture/aging blotches
        for (let i = 0; i < 3600; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(65, 58, 32, 0.08)' : 'rgba(215, 206, 152, 0.06)';
          g.fillRect((i * 73) % 512, (i * 139) % 512, 2, 2);
        }
        // Subtle vertical wallpaper panel seams
        g.fillStyle = 'rgba(58, 52, 30, 0.18)';
        for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 2, 512);

        // Strong baked Ambient Occlusion gradient near ceiling & floor for realistic depth
        const grad = g.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, 'rgba(26, 23, 12, 0.56)');
        grad.addColorStop(0.14, 'rgba(26, 23, 12, 0.14)');
        grad.addColorStop(0.32, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.76, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.92, 'rgba(24, 20, 10, 0.28)');
        grad.addColorStop(1, 'rgba(18, 15, 8, 0.66)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 512, 512);

        // Subtle recessed wall outlet
        g.fillStyle = '#8b8358';
        g.fillRect(248, 434, 15, 24);
        g.strokeStyle = 'rgba(60, 56, 36, 0.65)';
        g.lineWidth = 1.2;
        g.strokeRect(248, 434, 15, 24);
        g.fillStyle = '#403c26';
        g.fillRect(252, 439, 7, 4);
        g.fillRect(252, 448, 7, 4);

        // Darkened baseboard trim
        g.fillStyle = '#6c6440';
        g.fillRect(0, 488, 512, 24);
        g.fillStyle = 'rgba(24, 20, 10, 0.55)';
        g.fillRect(0, 486, 512, 3);

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function makeCarpetTex() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        // Damp mottled mustard-brown Backrooms carpet (fine organic fibers, no blocky squares)
        g.fillStyle = '#756339';
        g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 14000; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(54, 44, 22, 0.22)' : (i % 3 === 1 ? 'rgba(138, 118, 72, 0.16)' : 'rgba(92, 78, 42, 0.18)');
          g.fillRect((i * 97) % 512, (i * 193) % 512, 2, 2);
        }
        // Subtle damp stain patches
        for (let i = 0; i < 12; i++) {
          const sx = (i * 137) % 512, sy = (i * 211) % 512, sr = 28 + (i % 4) * 14;
          const rg = g.createRadialGradient(sx, sy, 2, sx, sy, sr);
          rg.addColorStop(0, 'rgba(42, 34, 18, 0.16)');
          rg.addColorStop(1, 'rgba(42, 34, 18, 0)');
          g.fillStyle = rg;
          g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      function makeCeilingTex() {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        // Soft acoustic ceiling tiles with thin muted seams (no thick black grid!)
        g.fillStyle = '#a59e78';
        g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 5000; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(72, 68, 48, 0.12)' : 'rgba(205, 198, 165, 0.10)';
          g.fillRect((i * 89) % 512, (i * 167) % 512, 2, 2);
        }
        g.strokeStyle = 'rgba(76, 72, 52, 0.52)';
        g.lineWidth = 2.4;
        for (let i = 0; i <= 512; i += 128) {
          g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
          g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      // --- Level 1 (Habitable Zone: Dark Stained Concrete) & Level 37 (Poolrooms: Ceramic Tiles & Turquoise Water) ---
      function makeLevel1WallTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#5c6166'; g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4500; i++) {
          g.fillStyle = i % 2 === 0 ? 'rgba(30,34,38,0.24)' : 'rgba(130,136,142,0.16)';
          g.fillRect((i * 89) % 512, (i * 149) % 512, 4, 6);
        }
        g.strokeStyle = 'rgba(28,31,35,0.55)'; g.lineWidth = 4;
        g.strokeRect(4, 4, 504, 250); g.strokeRect(4, 258, 504, 250);
        g.fillStyle = '#a16207'; g.fillRect(0, 420, 512, 34);
        g.fillStyle = '#18181b';
        for (let sx = -24; sx < 540; sx += 36) {
          g.beginPath(); g.moveTo(sx, 454); g.lineTo(sx + 18, 454);
          g.lineTo(sx + 36, 420); g.lineTo(sx + 18, 420); g.closePath(); g.fill();
        }
        g.fillStyle = 'rgba(215, 220, 225, 0.32)';
        g.font = 'bold 34px monospace';
        g.fillText('L1-B', 22, 74);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function makeLevel1FloorTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#3b4046'; g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 5000; i++) {
          g.fillStyle = i % 3 === 0 ? 'rgba(18,22,26,0.28)' : 'rgba(95,102,110,0.14)';
          g.fillRect((i * 73) % 512, (i * 131) % 512, 4, 4);
        }
        g.fillStyle = 'rgba(24, 34, 44, 0.35)';
        g.beginPath(); g.ellipse(260, 250, 120, 75, 0.3, 0, Math.PI * 2); g.fill();
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      function makeLevel1CeilTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#343940'; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = '#1f242a'; g.lineWidth = 10;
        for (let i = 0; i <= 512; i += 128) {
          g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
          g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      function makePoolWallTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#b9d4d8'; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = '#6f9aa2'; g.lineWidth = 3;
        for (let y = 0; y < 512; y += 32) {
          for (let x = 0; x < 512; x += 32) {
            const v = ((x * 7 + y * 13) % 14) - 7;
            g.fillStyle = `rgb(${184 + v}, ${210 + v}, ${214 + v})`;
            g.fillRect(x + 2, y + 2, 28, 28);
            g.strokeRect(x, y, 32, 32);
          }
        }
        const wg = g.createLinearGradient(0, 360, 0, 512);
        wg.addColorStop(0, 'rgba(34, 166, 184, 0)');
        wg.addColorStop(1, 'rgba(22, 128, 148, 0.55)');
        g.fillStyle = wg; g.fillRect(0, 360, 512, 152);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function makePoolFloorTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#258ea0'; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = 'rgba(14, 96, 114, 0.55)'; g.lineWidth = 3;
        for (let i = 0; i <= 512; i += 64) {
          g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
          g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
        }
        for (let i = 0; i < 45; i++) {
          g.strokeStyle = 'rgba(186, 244, 252, 0.24)';
          g.lineWidth = 3;
          g.beginPath();
          g.arc((i * 113) % 512, (i * 179) % 512, 18 + (i % 24), 0, Math.PI * 2);
          g.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      function makePoolCeilTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#9ec4cc'; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = '#628d96'; g.lineWidth = 4;
        for (let i = 0; i <= 512; i += 64) {
          g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
          g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(GRID_COLS, GRID_ROWS);
        return tex;
      }

      // --- Three.js Scene Setup ---
      const stageRoot = document.getElementById('stage-root');
      const container = document.getElementById('game-container');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x4b462e);
      scene.fog = new THREE.FogExp2(0x4b462e, 0.036);

      const savedFov = 72;

      const camera = new THREE.PerspectiveCamera(savedFov, window.innerWidth / window.innerHeight, 0.1, 70);
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 0.95;
      const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4;
      container.appendChild(renderer.domElement);

      // Balanced Backrooms Level 0 fluorescent lighting (strictly calibrated so walls NEVER blow out to white!)
      const hemiLight = new THREE.HemisphereLight(0xf2eed6, 0x9c8b5e, 0.56);
      scene.add(hemiLight);
      const ambientLight = new THREE.AmbientLight(0xdcd6b8, 0.28);
      scene.add(ambientLight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const dirLight = new THREE.DirectionalLight(0xfffbe6, 0.24);
      dirLight.position.set(10, 18, 7);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.near = 2;
      dirLight.shadow.camera.far = 42;
      dirLight.shadow.camera.left = -14;
      dirLight.shadow.camera.right = 14;
      dirLight.shadow.camera.top = 14;
      dirLight.shadow.camera.bottom = -14;
      dirLight.shadow.bias = -0.0008;
      dirLight.shadow.normalBias = 0.04;
      scene.add(dirLight);
      scene.add(dirLight.target);

      // Fixed 4-light overhead ceiling pool (moves to nearest bright room cells across ALL levels — zero shader recompile!)
      const roomLightPool = [];
      for (let rli = 0; rli < 4; rli++) {
        const rl = new THREE.PointLight(0xfff5d6, 0, 15, 1.7);
        rl.position.set(0, 3.2, 0);
        scene.add(rl);
        roomLightPool.push(rl);
      }

      // Soft radial contact shadow material (darkens in bright areas, fades in dark areas)
      const contactShadowMat = (function () {
        const c = document.createElement('canvas');
        c.width = 128; c.height = 128;
        const g = c.getContext('2d');
        const gr = g.createRadialGradient(64, 64, 6, 64, 64, 60);
        gr.addColorStop(0, 'rgba(0,0,0,0.78)');
        gr.addColorStop(0.55, 'rgba(0,0,0,0.34)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(c);
        return new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.45, depthWrite: false });
      })();
      function makeContactShadow(rx = 0.65, rz = 0.65) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), contactShadowMat);
        m.rotation.x = -Math.PI / 2;
        m.position.y = 0.025;
        return m;
      }

      const flashLight = new THREE.SpotLight(0xfff6d1, 2.85, 32, Math.PI / 4.2, 0.48, 1.45);
      (function applyFlashlightGobo() {
        const fc = document.createElement('canvas');
        fc.width = 128; fc.height = 128;
        const fg = fc.getContext('2d');
        const gr = fg.createRadialGradient(64, 64, 4, 64, 64, 62);
        gr.addColorStop(0.0, 'rgba(255,255,255,1)');
        gr.addColorStop(0.28, 'rgba(255,250,232,0.92)');
        gr.addColorStop(0.55, 'rgba(255,244,210,0.42)');
        gr.addColorStop(0.76, 'rgba(255,248,225,0.22)');
        gr.addColorStop(0.84, 'rgba(255,248,225,0.34)');
        gr.addColorStop(1.0, 'rgba(0,0,0,0)');
        fg.fillStyle = gr; fg.fillRect(0, 0, 128, 128);
        const fTex = new THREE.CanvasTexture(fc);
        flashLight.map = fTex;
      })();

      // Atmospheric floating dust motes around player
      const dustMotes = (function () {
        const cnt = 220;
        const pos = new Float32Array(cnt * 3);
        for (let i = 0; i < cnt; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 18;
          pos[i * 3 + 1] = 0.2 + Math.random() * 3.4;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
          color: 0xfef3c7, size: 0.036, transparent: true, opacity: 0.30,
          depthWrite: false, blending: THREE.AdditiveBlending
        });
        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        scene.add(pts);
        return pts;
      })();
      flashLight.position.set(0, 0, 0);
      const flashTarget = new THREE.Object3D();
      flashTarget.position.set(0, 0, -5);
      camera.add(flashLight);
      camera.add(flashTarget);
      flashLight.target = flashTarget;
      scene.add(camera);

      // Subtle close personal glow so corridors remain readable even if battery dies
      const nearLight = new THREE.PointLight(0xf2eed8, 0.08, 4.5);
      camera.add(nearLight);

      // Root zone groups: Level 0 Backrooms vs Abandoned Metro Station Safe Lobby
      const level0Group = new THREE.Group();
      scene.add(level0Group);
