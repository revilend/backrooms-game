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
          cas_shady: {
            uz: "Bu yerda barcha ranglar o'chib ketgan... Faqat kulrang tuman, kulrang devorlar va sukunat. Qancha uzoq qolsangiz, atrof shuncha xiralashib, xotirangiz ham o'chib boradi. O'zingizni butunlay yo'qotmasdan oldin chiqish portalini topishingiz shart.",
            en: "All color has faded from this place... Only gray fog, gray walls, and silence. The longer you stay, the blurrier the world becomes and the faster your memory fades. You must find the exit portal before losing yourself completely.",
            ru: "Здесь исчезли все краски... Только серый туман, серые стены и тишина. Чем дольше вы остаётесь, тем сильнее всё расплывается и стирается ваша память. Вы обязаны найти портал выхода, пока не потеряли себя."
          },
          metro_welcome: {
            uz: "[E'lon]: Diqqat! Yerosti bekatiga xush kelibsiz. Iltimos, sariq chiziqdan o'tmang. Bu yerda vaqt o'lchanmaydi.",
            en: "[PA System]: Attention! Welcome to the Underground Station. Please do not cross the yellow line. Time is not measured here.",
            ru: "[Объявление]: Внимание! Добро пожаловать на подземную станцию. Пожалуйста, не переступайте жёлтую линию. Время здесь не измеряется."
          },
          vox_exit_open: {
            uz: "Nihoyat! Chiqish eshigi ochildi! Tezroq o'sha yerga!",
            en: "At last! The exit door is open! Hurry over there!",
            ru: "Наконец-то! Выход открыт! Быстрее туда!"
          },
          vox_intro_walk: {
            uz: "Har kun bir xil... Ish, muammolar, charchoq... Hech narsaga ulgurmayapman. Qaniydi bir zumga hamma narsadan uzoqlashib, tinch joyga ketib qolsam... To'xta, men qayoqqa burildim? Orqamdagi yo'l qani?!",
            en: "Every day is the same... Work, problems, exhaustion... I can't keep up with anything. If only I could get away from it all to a quiet place... Wait—where did I turn? Where is the road behind me?!",
            ru: "Каждый день одно и то же... Работа, проблемы, усталость... Ничего не успеваю. Хоть бы на миг уйти от всего в тихое место... Постой, куда я свернул? Где дорога позади меня?!"
          },
          cas_8: {
            uz: "Chuqur tosh g'orlar... Devorlardagi moviy kristallar xira nur sochib yo'lni ko'rsatyapti. Bu yerda har bir tosh qadam sadosini yuz metrga tarqatadi. Shiftga qarang: g'or devorlariga yopishib turgan o'rgimchaksifat maxluqlar ovozga qarab tashlanadi.",
            en: "Deep stone caves... Blue crystals on the walls cast a faint glow to light the path. Every rock carries footsteps a hundred meters. Look at the ceiling: spider-like creatures clinging to the cave walls lunge at any sound.",
            ru: "Глубокие каменные пещеры... Голубые кристаллы на стенах слабо освещают путь. Здесь каждый камень разносит эхо шагов на сто метров. Смотрите на потолок: паукообразные твари на стенах пещеры бросаются на любой звук."
          },
          cas_9: {
            uz: "Tungi tashlandiq mahalla... Ko'cha chiroqlari miltillab turibdi, uylar esa bo'm-bo'sh. Asfaltda yurish xavfli, chunki ko'chalarda to'rt oyoqli itga o'xshash maxluqlar ov qilyapti. Ularning uvillashi yaqinlashsa, darhol uylar orasiga yoki ichkariga yashirining.",
            en: "An abandoned neighborhood at night... Streetlights flicker and the houses stand empty. Walking the asphalt is dangerous—four-legged hound-like creatures prowl the streets. If their howling draws near, hide between or inside the houses at once.",
            ru: "Ночной заброшенный квартал... Уличные фонари мигают, дома пусты. Идти по асфальту опасно — по улицам рыщут четвероногие твари, похожие на псов. Если их вой приближается, немедленно прячьтесь между домами или внутри."
          },
          cas_922: {
            uz: "Cheksiz qorong'u bo'shliq ustida osilib turgan ulkan zinapoya... Pastga qarasangiz, tubsizlikdan boshingiz aylanadi. Har bir qavatda maxluqlar yo'lni to'sishi mumkin. Pastga tushishni xayolingizga ham keltirmang — faqat yuqoriga, cho'qqidagi nurga qarab ko'tariling.",
            en: "A colossal staircase suspended over an endless dark void... Looking down makes your head spin from the abyss. Creatures can block the path on every landing. Never even think about going down—climb only upward toward the light at the summit.",
            ru: "Гигантская лестница, парящая над бездонной тьмой... Посмотрите вниз — от пропасти закружится голова. На каждом пролёте путь могут преградить твари. Даже не думайте спускаться — поднимайтесь только вверх, к свету на вершине."
          },
          cas_94: {
            uz: "Multfilmdagidek yashil tepaliklar va oppoq uylar... Kunduzi bu yer tinch va g'alati darajada go'zal ko'rinadi. Ammo osmon qorayishi bilan tepaliklar orasidan g'alati maxluqlar chiqadi. Uylarning eshigini yoping va tunda tashqarida qolib ketmang.",
            en: "Cartoon-like green hills and snow-white houses... By day it looks peaceful and uncannily beautiful. Yet the moment the sky darkens, strange creatures emerge from the hills. Shut the doors and never get caught outside at night.",
            ru: "Зелёные холмы и белоснежные дома, как в мультфильме... Днём здесь тихо и пугающе красиво. Но как только небо темнеет, из-за холмов выходят странные существа. Закрывайте двери и не оставайтесь снаружи ночью."
          },
          cas_974: {
            uz: "Pushti devorlar, yumshoq gilam va hamma joyda o'yinchoqlar — bu Kitty uyi. Tashqaridan juda begunoh ko'rinsa ham, ichkarida bo'yi uch metrdan oshadigan qop-qora yuzsiz mavjudot yashaydi. U shirinlik izlaydi; unga yaqinlashmang, tezda chiqish eshigini oching.",
            en: "Pink walls, soft carpet, and toys everywhere—this is Kitty's House. Innocent as it looks from outside, a pitch-black faceless entity over three meters tall lives within. It wants something sweet; keep your distance and open the exit door fast.",
            ru: "Розовые стены, мягкий ковёр и повсюду игрушки — это Дом Китти. Каким бы безобидным он ни казался снаружи, внутри обитает чёрное безликое существо выше трёх метров. Оно ищет сладости — не приближайтесь и скорее открывайте выход."
          },
          cas_end: {
            uz: "Ulkan kutubxona... Javonlarda millionlab bo'sh kitoblar turibdi va devorda 'THE END' deb yozilgan. Lekin aldanmang: bu haqiqiy oxir emas, shunchaki tuzoq. Chiqish uchun zaldagi eski kompyuterni topib, maxfiy qayta yuklash kodini ishga tushiring.",
            en: "A massive library... Millions of blank books line the shelves, and 'THE END' is written on the wall. Do not be fooled: this isn't the real ending, just a trap. Find the old computer in the hall and run the secret reboot code to escape.",
            ru: "Огромная библиотека... На полках миллионы пустых книг, а на стене написано 'THE END'. Но не обманывайтесь: это не настоящий финал, а ловушка. Найдите старый компьютер в зале и запустите секретный код перезагрузки."
          },
          cas_fun: {
            uz: "Rang-barang devorlar, sharlar va bayram musiqasi... Lekin bu yerdagi kulgi chinakam emas. Sariq rangli, doim tabassum qilib turadigan maxluqlar sizni ziyofatga chaqiradi. Ularga qo'lingizni tekkizmang — bir teksa tamom, chiqish eshigiga qoching.",
            en: "Colorful walls, balloons, and party music... Yet the laughter here isn't real. Yellow, endlessly smiling creatures invite you to their party. Never let them touch you—one touch and it's over. Run for the exit door!",
            ru: "Разноцветные стены, шары и праздничная музыка... Но смех здесь фальшивый. Жёлтые существа с вечной улыбкой зовут вас на праздник. Не прикасайтесь к ним — одно касание и всё кончено. Бегите к выходу!"
          },
          cas_manila: {
            uz: "Manilla xonasiga yetib keldim... Nihoyat chiroqlar miltillamayapti va havosi sokin. Stol ustida eski qog'ozlar bilan xaritalar qoldirilgan ekan, ularni diqqat bilan o'qing. Ammo eshik ortidan g'alati nafas eshitilsa, shu zahoti bu yerdan chiqib keting.",
            en: "I've reached the Manila Room... Finally the lights aren't flickering and the air is calm. Old papers and maps were left on the table—read them carefully. But if you hear strange breathing behind the door, get out immediately.",
            ru: "Я добрался до комнаты Манила... Наконец-то свет не мигает, и воздух спокоен. На столе оставлены старые бумаги и карты — внимательно прочтите их. Но если за дверью послышится странное дыхание, немедленно уходите."
          },
          cas_mirror: {
            uz: "Hamma joy oynadan yasalgan cheksiz labirint... Qaysi yo'lak haqiqiy, qaysi biri aks ekanini ajratish qiyin. Ko'zgularda ba'zan o'zingizdan boshqa soya ham ko'rinadi. Agar birorta oyna to'satdan sinib ketsa, orqangizga qaramay yuguring!",
            en: "An endless labyrinth made entirely of mirrors... It's hard to tell which corridor is real and which is a reflection. Sometimes another shadow appears in the glass beside you. If a mirror suddenly shatters, run without looking back!",
            ru: "Бесконечный лабиринт из зеркал... Трудно отличить настоящий коридор от отражения. Иногда в зеркалах мелькает чужая тень рядом с вами. Если стекло внезапно разобьётся — бегите не оглядываясь!"
          },
          cas_run: {
            uz: "Qizil favqulodda chiroqlar! Kasalxona yo'lagi oxirsizdek ko'rinadi, orqamda esa o'nlab maxluqlar yugurib kelyapti. Hozir o'ylashga ham, orqaga qarashga ham vaqt yo'q. To'siqlar va g'ildirakli karavotlardan sakrab, oldinga qarab yuguring!",
            en: "Red emergency lights! The hospital corridor seems endless, and dozens of creatures are sprinting behind me. There's no time to think or look back. Vault the obstacles and wheeled hospital beds—just keep running forward!",
            ru: "Красные аварийные огни! Больничный коридор кажется бесконечным, а позади бегут десятки тварей. Нет времени думать или оглядываться. Перепрыгивайте через препятствия и каталки — бегите только вперёд!"
          },
          cas_33: {
            uz: "Cheksiz tashlandiq savdo markazi... Bo'sh do'konlar, singan vitrinalar va eski aravachalar. Shiftdagi karnaylardan hali ham sekin, buzilgan musiqa yangrayapti. Lekin sotuvchilar o'rnida terisidan ajralgan maxluqlar kezib yuribdi. Do'konlar ichidan aylanib o'ting.",
            en: "An endless abandoned mall... Empty shops, shattered displays, and old carts. Distorted slow music still plays from ceiling speakers. Instead of clerks, skinless creatures roam the halls. Detour through the stores.",
            ru: "Бесконечный заброшенный торговый центр... Пустые магазины, разбитые витрины и старые тележки. Из динамиков на потолке всё ещё играет искажённая медленная музыка. Вместо продавцов здесь бродят существа без кожи. Обходите через магазины."
          },
          cas_36: {
            uz: "Bo'm-bo'sh aeroport terminali... Parvozlar jadvalida faqat xato yozuvlar yonib turibdi. Kutish zallaridagi o'rindiqlar chang bosgan, derazadan esa tuman ichidagi samolyotlar ko'rinadi. Chiqish uchun samolyotlar turgan angar tomondagi darvozani topishingiz kerak.",
            en: "An empty airport terminal... Departure boards flash nothing but errors. Dust covers the waiting-hall seats, and planes sit in the mist outside. To escape, find the gate leading toward the hangar.",
            ru: "Пустой терминал аэропорта... На табло вылетов горят одни ошибки. Кресла в зале ожидания покрыты пылью, а за окнами в тумане видны самолёты. Чтобы выбраться, найдите ворота в сторону ангара."
          },
          cas_37: {
            uz: "Poolrooms... Hamma joy moviy kafel va iliq tiniq suv, xuddi sokin hammomdek. Ammo suvdagi aks-sado juda g'alati — siz to'xtasangiz ham suvda qadam tovushi eshitiladi. Chuqur hovuzlarga tushmang va quyosh nuri tushayotgan chiqish zinapoyasini qidiring.",
            en: "The Poolrooms... Blue tiles and warm clear water everywhere, like a quiet bathhouse. Yet the echoes are strange—even when you stop, footsteps splash in the water. Stay out of deep pools and look for the sunlit exit stairs.",
            ru: "Бассейны... Повсюду голубая плитка и тёплая прозрачная вода, словно в тихой купальне. Но эхо странное: даже когда вы стоите на месте, в воде слышны шаги. Не заходите в глубокие бассейны и ищите лестницу к солнечному свету."
          },
          cas_3999: {
            uz: "Nihoyat! Neon chiroqlar, orqada o'yin avtomatlari va sokin musiqa... Bu haqiqiy oxir! Siz barcha dahshatlardan omon o'tdingiz. Avtomatlar yonidagi so'nggi topshiriqlarni bajaring va chiqish darvozasidan haqiqiy dunyoga qayting.",
            en: "At last! Neon lights, arcade machines behind me, and calm music... This is the true end! You survived every nightmare. Complete the final tasks by the arcades and return through the exit gate to the real world.",
            ru: "Наконец-то! Неоновый свет, игровые автоматы и спокойная музыка... Это настоящий финал! Вы пережили все кошмары. Выполните последние задания у автоматов и вернитесь в реальный мир."
          },
          cas_4: {
            uz: "Bo'sh ofis xonalari... Derazalardan tashqarida tinmay yomg'ir yog'yapti, lekin oynaga tegmang — bu oddiy suv emas. Javonlar va stollar ichidan ko'k shishadagi bodom suvini qidiring. U holdan toyganingizda kuch beradi va aqldan ozishdan saqlaydi.",
            en: "Empty office rooms... Rain pours endlessly outside the windows, but don't touch the glass—that isn't ordinary water. Search shelves and desks for blue bottles of Almond Water. It restores strength and protects your sanity.",
            ru: "Пустые офисные кабинеты... За окнами не прекращается дождь, но не прикасайтесь к стеклу — это не обычная вода. Ищите на полках и столах синие бутылки миндальной воды. Она вернёт силы и спасёт рассудок."
          },
          cas_46: {
            uz: "Qaynoq arab cho'li... Qum bo'roni ko'zni ochirmaydi, shamol esa xuddi qichqirayotgandek uvillaydi. Uzoqda palma daraxtlari va voha ko'rinyapti, lekin bu sarob bo'lishi ham mumkin. Qum tepalar orasida adashmaslik uchun vohadagi chiqish portalini tezroq toping.",
            en: "A scorching Arabian desert... The sandstorm blinds you, and the wind howls like a scream. Palm trees and an oasis appear in the distance, though it may be a mirage. Find the oasis exit portal quickly before getting lost in the dunes.",
            ru: "Раскалённая арабская пустыня... Песчаная буря слепит глаза, а ветер воет как крик. Вдалеке видны пальмы и оазис, но это может быть мираж. Скорее найдите портал выхода в оазисе, чтобы не сгинуть в барханах."
          },
          cas_5: {
            uz: "Eski hashamatli mehmonxona... Gilamlar qizil, devorlarda esa sirli suratlar osilgan. Eshiklar o'z-o'zidan yopilib qolyapti, xuddi kimdir meni kuzatayotgandek. Agar yo'lak oxirida qora kiyimli xizmatkorni ko'rsangiz, to'xtamang va aslo ko'ziga qaramang.",
            en: "An old luxury hotel... Red carpets and eerie portraits lining the walls. Doors slam shut on their own, as if someone is watching me. If you spot a black-suited butler at the end of the hall, do not stop—and never look him in the eyes.",
            ru: "Старый роскошный отель... Красные ковры и загадочные картины на стенах. Двери захлопываются сами по себе, будто за мной следят. Если увидите в конце коридора слугу в чёрном — не останавливайтесь и не смотрите ему в глаза."
          },
          cas_6: {
            uz: "Bu qavatda chiroq umuman yo'q. Ko'zingizni ochsangiz ham, yumsangiz ham bir xil qop-qora zulmat. Faqat fonar batareyasiga ishoning; batareya topsangiz darrov oling. Qorong'uda oltita favqulodda mayaqni yoqmasdan turib chiqish eshigini topa olmaysiz.",
            en: "There is no light on this floor at all. Eyes open or shut, it is the same pitch-black darkness. Rely only on your flashlight battery—grab any battery you find. You cannot find the exit without lighting all six emergency beacons in the dark.",
            ru: "На этом этаже нет никакого света. С открытыми или закрытыми глазами — вокруг одна кромешная тьма. Надейтесь только на батарею фонарика и сразу берите запасные. Без шести аварийных маяков в темноте выход не найти."
          },
          cas_61: {
            uz: "Nihoyat, tinch va yorug' joy — Snackrooms! Javonlarda ichimliklar va yeguliklar to'la, chiroqlar esa iliq yonib turibdi. Bu yerda maxluqlar yo'q. Biroz nafas rostlab, batareya va bodom suvi to'plab oling, lekin keyingi qavatga o'tishni unutmang.",
            en: "At last, a quiet, bright place—The Snackrooms! Shelves are stocked with drinks and snacks under warm lights. There are no monsters here. Catch your breath, stock up on batteries and Almond Water, and don't forget to move on to the next floor.",
            ru: "Наконец-то тихое и светлое место — Snackrooms! Полки полны еды и напитков, горит тёплый свет. Монстров здесь нет. Переведите дух, соберите батарейки и миндальную воду, но не забудьте перейти на следующий уровень."
          },
          cas_7: {
            uz: "Cheksiz sovuq okean... Oyoq ostimda quruqlik yo'q, faqat to'lqinlar va muzdek suv. Suv ostida bahaybat bir narsa suzib yurganini his qilyapman. Uzoqda miltillayotgan suzuvchi belgilarga qarab suzing — faqat ular sizni quruq orolga olib chiqadi.",
            en: "An endless freezing ocean... No solid ground beneath me, only waves and icy water. I can feel something massive swimming below. Swim toward the distant blinking buoys—only they will guide you to dry land.",
            ru: "Бескрайний ледяной океан... Под ногами нет суши, только волны и ледяная вода. Я чувствую, как под водой кружит что-то огромное. Плывите к далёким мигающим буйкам — только они выведут вас на остров."
          },
          cas_0: {
            uz: "M.E.G. 1-raqamli arxiv yozuvi. Uch kundan beri shu sariq devorlar va nam gilam orasida adashib yuribman. Chiroqlarning g'uvillashi boshimni yorib yuboryapti. Ba'zi xonalarda shiftdagi yog'och narvonlarni ko'rdim. Tepaga chiqish mumkin, lekin zinhor pastga qaramang.",
            en: "M.E.G. Archive Log #1. For three days I've been lost among these yellow walls and damp carpet. The buzzing lights are splitting my head. In some rooms I saw wooden ladders to the ceiling. You can climb up, but never look down.",
            ru: "Архивная запись M.E.G. №1. Уже три дня я блуждаю среди жёлтых стен и сырого ковра. Гул ламп раскалывает голову. В некоторых комнатах я видел деревянные лестницы наверх. Можно подняться, но ни в коем случае не смотрите вниз."
          },
          cas_1: {
            uz: "Tashlandiq omborxona... Har burchakda zanglagan temir javonlar va beton ustunlar. Bir soat oldin zulmatda ikki oyoqli qop-qora soya menga qarab yugurdi. Chiqish uchun qizil chiroqli eshikni topishingiz shart. Qadam tovushi yaqinlashsa, darrov yashirining.",
            en: "Abandoned warehouse... Rusted metal shelves and concrete pillars in every corner. An hour ago, a pitch-black two-legged shadow sprinted toward me in the dark. You must find the red-lit exit door. If footsteps get close, hide immediately.",
            ru: "Заброшенный склад... В каждом углу ржавые железные стеллажи и бетонные колонны. Час назад во тьме на меня бросилась чёрная двуногая тень. Чтобы выйти, нужно найти дверь с красным светом. Если шаги приближаются — сразу прячьтесь."
          },
          cas_10: {
            uz: "Cheksiz bug'doy dalasi va qalin tuman. Bu yerda abadiy kechqurun hukmron. Zanglagan traktorlar va eski omborlar yonidan ehtiyotkorlik bilan o'ting. Tuman ichida ko'zingizga qizil nuqtalar ko'rinsa, darrov boshqa tomonga buriling. Ular izingizga tushgan.",
            en: "Endless wheat fields and thick fog. Eternal dusk rules here. Pass the rusted tractors and old barns with caution. If you spot red dots in the mist, turn the other way immediately. They are hunting you.",
            ru: "Бесконечное пшеничное поле и густой туман. Здесь царят вечные сумерки. Осторожно проходите мимо ржавых тракторов и старых амбаров. Если увидите в тумане красные точки — сразу сворачивайте в другую сторону. Они идут по вашему следу."
          },
          cas_11: {
            uz: "Abadiy bo'sh shahar... Osmono'par binolar bulutlarga tegib turibdi. Lekin ko'chalarda birorta tirik jon yo'q. Mashinalar joyida toshdek qotib qolgan. Agar uzoqdan metro bekatining yashil belgisini ko'rsangiz, o'sha yerga shoshiling. Najot o'sha yerda.",
            en: "An eternally empty city... Skyscrapers touch the clouds, yet not a single living soul walks the streets. Cars sit frozen like stone. If you spot the green metro sign in the distance, hurry there. Salvation is there.",
            ru: "Вечно пустой город... Небоскрёбы упираются в облака, но на улицах нет ни одной живой души. Машины застыли как камень. Если увидите вдалеке зелёный знак метро — спешите туда. Спасение там."
          },
          cas_14: {
            uz: "Bu yer go'yoki jannat o'rmonidek ko'rinadi. Qizil osmon ostida baland daraxtlar shovullaydi. Lekin aldanmang — o'tlar orasida oldingi sayohatchilarning izlari va qon dog'lari bor. Bu o'rmon ongni chalg'itadi; faqat kompas va chiqish belgisiga ishoning.",
            en: "This place looks like a paradise forest. Tall trees rustle beneath a crimson sky. Don't be fooled — among the grass lie footprints and bloodstains of past wanderers. This forest deceives the mind; trust only your compass and the exit sign.",
            ru: "Это место кажется райским лесом. Под алым небом шумят высокие деревья. Но не обманывайтесь: в траве есть следы и пятна крови прошлых путников. Этот лес туманит разум — доверяйте только компасу и знаку выхода."
          },
          cas_15: {
            uz: "Oppoq futuristik koridorlar va sovuq neon chiroqlar... Xuddi kosmik kemaning ichidek. Devordagi kompyuterlar hali ham ishlab turibdi, lekin tizim xato beryapti. Chiqish shlyuzini ochish uchun zallardagi terminallardan maxfiy kodlarni topib, tizimni qayta ishga tushiring.",
            en: "Pure white futuristic corridors and cold neon lights... Like the inside of a spaceship. Wall computers are still running, but the system is throwing errors. Find the secret codes at the hall terminals to reboot the system and open the airlock.",
            ru: "Белоснежные футуристические коридоры и холодный неон... Будто внутри космического корабля. Компьютеры на стенах всё ещё работают, но система выдаёт сбой. Найдите секретные коды на терминалах в залах, перезапустите систему и откройте шлюз."
          },
          cas_188: {
            uz: "Kvadrat shaklidagi ulkan hovli... To'rt tomondan yuzlab qop-qora derazalar sizga qarab turibdi. Ba'zi derazalar ortida nimadir harakatlanayotganini ko'rdim. Hovlining o'rtasidagi yorug' maydonga chiqmang. Devor bo'ylab yurib chiqish eshigini toping.",
            en: "A massive square courtyard... Hundreds of pitch-black windows stare down at you from all four sides. I saw something moving behind some of them. Stay out of the bright center of the courtyard. Follow the walls to find the exit door.",
            ru: "Огромный квадратный двор... Со всех четырёх сторон на вас смотрят сотни чёрных окон. За некоторыми из них я видел движение. Не выходите на светлую площадку в центре двора. Идите вдоль стен и найдите выход."
          },
          cas_2: {
            uz: "Bu tor yo'lakda nafas olish qiyin... Devorlardagi issiq quvurlar har daqiqada yorilib, qaynoq bug' purkayapti. Suv sizib chiqayotgan joylardan chetroq yuring. Orqamdan kimdir emas, xuddi devorni tirnayotgan bir narsa sudralib kelyapti. Yugurish kerak!",
            en: "It's hard to breathe in this narrow corridor... Hot pipes along the walls burst every minute, spraying scalding steam. Stay clear of leaking water. Something isn't walking behind me — it's crawling, clawing at the walls. I have to run!",
            ru: "В этом узком коридоре трудно дышать... Горячие трубы на стенах прорывает каждую минуту, выбрасывая обжигающий пар. Обходите места протечек. За мной не просто идут — что-то ползёт, царапая стены. Надо бежать!"
          },
          cas_22: {
            uz: "Qulab tushgan beton devorlar, singan mashinalar va chang... Bu yerda hamma narsa vayron bo'lgan. Qadam tashlashda ehtiyot bo'ling — pol har joyda sinib ketishi mumkin. Vayronalar orasidan chiqish yo'lini toping, lekin qorong'u burchaklarda yashiringan sharpalarni unutmang.",
            en: "Collapsed concrete walls, wrecked cars, and dust... Everything here is in ruins. Watch your step — the floor can give way anywhere. Find the exit through the rubble, and don't forget the shadows lurking in dark corners.",
            ru: "Рухнувшие бетонные стены, разбитые машины и пыль... Здесь всё разрушено. Осторожнее с каждым шагом — пол может провалиться в любой точке. Найдите выход среди руин и не забывайте о тенях в тёмных углах."
          },
          cas_3: {
            uz: "Elektr stansiyasi... Havo ozon va kuygan sim hidiga to'lgan. Chiqish eshigini ochish uchun koridorlardagi barcha elektr shkaflarni yoqish kerak ekan. Lekin ehtiyot bo'ling: har safar tok ulanganda shovqin kuchayib, qorong'udagi maxluqlar shu tomonga keladi.",
            en: "The electrical station... The air smells of ozone and burnt wire. To open the exit door, all breaker panels in the corridors must be switched on. Be careful: every time power kicks in, the noise draws the creatures from the dark.",
            ru: "Электростанция... Воздух пропитан озоном и гарью проводов. Чтобы открыть выход, нужно включить все электрощитки в коридорах. Но осторожнее: каждый раз при подаче тока шум усиливается и притягивает тварей из темноты."
          },
          vox_wake: {
            uz: "Boshim... Qayerdaman o'zi? Bu qanaqa joy?! Chiqish yo'lini topishim kerak.",
            en: "My head... Where am I? What is this place?! I need to find a way out.",
            ru: "Голова... Где я вообще? Что это за место?! Мне нужно найти выход."
          },
          vox_monster: {
            uz: "Yo Xudo! U meni ko'rdi! Yugur!",
            en: "Oh God! It saw me! Run!",
            ru: "Боже! Оно меня увидело! Беги!"
          },
          vox_hide: {
            uz: "Tss... Nafas olma... U yaqinda yuribdi.",
            en: "Shh... Don't breathe... It's walking nearby.",
            ru: "Тсс... Не дыши... Оно ходит рядом."
          },
          vox_almond: {
            uz: "Oh... Bodom suvi! O'zimga keldim, kuchim qaytdi!",
            en: "Ah... Almond Water! I'm back to myself, my strength returned!",
            ru: "Ох... Миндальная вода! Я пришёл в себя, силы вернулись!"
          },
          vox_battery_low: {
            uz: "Jin ursin... Fonar batareyasi tugayapti! Tezroq batareya topish kerak.",
            en: "Damn it... Flashlight battery is dying! Need to find a battery fast.",
            ru: "Чёрт... Батарея фонарика садится! Нужно срочно найти батарейку."
          },
          vox_caught: {
            uz: "Yo'q! Yaqinlashma!",
            en: "No! Stay back!",
            ru: "Нет! Не подходи!"
          },
          vox_win: {
            uz: "Uddaladim! Nihoyat bu dahshatdan qutuldim!",
            en: "I did it! I finally escaped this nightmare!",
            ru: "Я справился! Наконец-то я выбрался из этого кошмара!"
          },
          vox_train_arrive: {
            uz: "Nima?! Bu tashlandiq joyda poyezd qayerdan kelyapti?!",
            en: "What?! Where is a train coming from in this abandoned place?!",
            ru: "Что?! Откуда в этом заброшенном месте едет поезд?!"
          },
          metro_arrive_vox: {
            uz: "[E'lon]: Diqqat! Noma'lum yo'nalishdagi poyezd birinchi yo'lga kirib kelmoqda. Ehtiyot bo'ling!",
            en: "[PA System]: Attention! An unknown-bound train is arriving on Track 1. Please stand clear!",
            ru: "[Объявление]: Внимание! Поезд неизвестного следования прибывает на первый путь. Будьте осторожны!"
          },
          metro_depart_vox: {
            uz: "[E'lon]: Ehtiyot bo'ling, eshiklar yopilmoqda. Keyingi bekat — Zulmat qatlami. Orqaga qaytish yo'q.",
            en: "[PA System]: Stand clear, doors closing. Next stop — The Dark Layer. There is no turning back.",
            ru: "[Объявление]: Осторожно, двери закрываются. Следующая станция — Слой Тьмы. Пути назад нет."
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
