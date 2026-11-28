      const state = {
        zone: 'level0',
        started: false,
        paused: false,
        ended: false,
        diff: 'normal',
        pos: spawnPos.clone(),
        yaw: 0,
        pitch: 0,
        camSens: 1.0,
        vhsOn: false,
        radarOn: false,
        gfxQuality: LSget('zulmat_gfx') || 'medium',
        sanity: 100,
        anomalyTimer: 16.0,
        whisperTimer: 11.0,
        phantomActive: false,
        phantomTimer: 0,
        noclipCooldown: 0,
        hasFlashlight: true,
        flashOn: true,
        battery: 100,
        stamina: 100,
        sprinting: false,
        hiding: false,
        hideLocker: null,
        keysCollected: 0,
        totalKeys: keysList.length,
        elapsed: 0,
        stepTimer: 0,
        heartTimer: 0,
        bobPhase: 0,
        monsterPos: monsterSpawn.clone(),
        monsterTarget: null,
        monsterChasing: false,
        monsterYaw: 0,
        killing: false,
        killTimer: 0,
        killSlash2: false,
        growlTimer: 2.5,
        mStepTimer: 0,
        currentLevel: 0,
        targetLevel: 0,
        completedLevels: (function () {
          try {
            const raw = LSget('zulmat_completed_levels');
            if (raw) return Object.assign({ 0: false, 1: false, 2: false, 37: false, run: false, fun: false }, JSON.parse(raw));
          } catch (e) {}
          return { 0: false, 1: false, 2: false, 37: false, run: false, fun: false };
        })(),
        level0Done: false,
        trainAnim: 'parked',
        trainTimer: 0,
        l1Blackout: false,
        l1BlackoutTimer: 20,
        l1GensDone: 0,
        l37ValvesDone: 0,
        l37ToxicTimer: 0,
        l2BreakersDone: 0,
        l2SteamBurn: 0,
        lRunAlarmTimer: 0,
        velY: 0,
        onGround: true,
        crouching: false,
        invAlmond: 0,
        invBattery: 0,
        invRadar: 0,
        radarTimer: 0,
        pebbles: 1,
        splashAlertTimer: 0,
        lastSplashPos: new THREE.Vector3(0, 0, -28),
        wasInWater: false,
        l0Pin: '4729',
        l0PinEntered: '',
        l0PinUnlocked: false,
        l1FuelHeld: 0,
        l37SwitchesDone: 0,
        lFunTickets: 0,
        l6SwitchesDone: 0,
        l7BuoysDone: 0,
        l8CrystalsDone: 0,
        l188TvsDone: 0,
        l974ItemsDone: 0,
        l3999TasksDone: 0,
        l33NodesDone: 0,
        l36TicketsDone: 0,
        lShadyDone: 0,
        vhsTapes: (function () { try { return parseInt(LSget('zulmat_vhs_tapes') || '0', 10) || 0; } catch (e) { return 0; } })(), l14Done: 0, l15Done: 0, l22Done: 0, l46Done: 0, lManilaDone: 0, lMirrorDone: 0,
        lFunMusicTimer: 0,
        lFunNoteIdx: 0,
        l94OrbsDone: 0,
        l94IsNight: false,
        l94CycleTimer: 60.0,
        l94InHouse: false,
        l94MusicTimer: 1.0,
        l94NoteIdx: 0,
        l922Floor: 0,
        l922PrevAng: 0,
        l922TotalAng: 0,
        l922Falling: false,
        l922FallWin: false,
        l922FallTimer: 0,
        l9FusesDone: 0,
        l10RadiosDone: 0,
        l11CardsDone: 0,
        lEndDisksDone: 0,
        lEndTrapActive: false,
        l61SnacksDone: 0,
        l3BreakersDone: 0,
        l3ShockCool: 0,
        l4BadgesDone: 0,
        l5KeysDone: 0
      };

      try {
        const s = parseFloat(LSget('zulmat_sens'));
        if (s >= 0.4 && s <= 2.5) state.camSens = s;
      } catch (e) {}

      // --- Orientation (Default Horizontal Landscape on Mobile) ---
      let forceLandscape = true;
      let isForcedLandscape = false;
      const orientLbl = document.getElementById('orient-lbl');
      function updateStageOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        isForcedLandscape = forceLandscape && isPortrait;
        stageRoot.classList.toggle('forced-landscape', isForcedLandscape);
        const w = isForcedLandscape ? window.innerHeight : window.innerWidth;
        const h = isForcedLandscape ? window.innerWidth : window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (orientLbl) orientLbl.textContent = forceLandscape ? 'Gorizontal' : 'Portret / Avto';
      }
      window.addEventListener('resize', updateStageOrientation);
      updateStageOrientation();

      // --- UI References ---
      const elHudTime = document.getElementById('hud-time');
      const elHudObj = document.getElementById('hud-obj');
      const elBatPct = document.getElementById('bat-pct');
      const elBatFill = document.getElementById('bat-fill');
      const elStamPct = document.getElementById('stam-pct');
      const elStamFill = document.getElementById('stam-fill');
      const elDangerVig = document.getElementById('danger-vignette');
      const elLockerOv = document.getElementById('locker-overlay');
      const elJumpFlash = document.getElementById('jumpscare-flash');
      const elKillSlashes = document.getElementById('kill-slashes');
      const elTrainFade = document.getElementById('train-fade');
      const elTrainFadeTag = document.getElementById('train-fade-tag');
      const elTrainFadeTitle = document.getElementById('train-fade-title');
      const elToast = document.getElementById('toast');
      const elInteractBtn = document.getElementById('btn-interact');
      const elInteractLbl = document.getElementById('interact-lbl');
      const elStartOv = document.getElementById('start-overlay');
      const elSetOv = document.getElementById('settings-overlay');
      const elStationOv = document.getElementById('station-overlay');
      const elEndOv = document.getElementById('end-overlay');
      const btnFlash = document.getElementById('btn-flash');
      const btnSprint = document.getElementById('btn-sprint');
      const btnJump = document.getElementById('btn-jump');
      const btnSound = document.getElementById('btn-sound');
      const radarCanvas = document.getElementById('radar-canvas');
      const radarCtx = radarCanvas.getContext('2d');

      let toastTimer = null;
      function translateToastMsg(raw) {
        const lang = window.__zulmatLang || 'uz';
        if (lang === 'uz' || !raw) return raw;
        const s = String(raw);
        const EXACT = {
          "Fonar batareyasi tugadi!": { en: "Flashlight battery depleted!", ru: "Батарея фонарика разрядилась!" },
          "Fonar batareyasi tugagan — yashil batareya toping!": { en: "Flashlight is dead — find a green battery!", ru: "Фонарик разряжен — найдите зелёную батарею!" },
          "Fonar quvvati allaqachon to'liq!": { en: "Flashlight battery is already full!", ru: "Фонарик уже полностью заряжен!" },
          "Bodom suvi ichildi! Fonar va kuch 100% tiklandi!": { en: "Almond Water drunk! Flashlight & stamina 100% restored!", ru: "Миндальная вода выпита! Фонарь и силы восстановлены на 100%!" },
          "Bodom suvi ichildi! Kuch va aql-idrok 100% tiklandi!": { en: "Almond Water drunk! Stamina & sanity 100% restored!", ru: "Миндальная вода выпита! Силы и рассудок восстановлены на 100%!" },
          "SOYA SIZNI SEZDI! YUGURING YOKI YASHIRINING!": { en: "THE ENTITY SPOTTED YOU! RUN OR HIDE!", ru: "СУЩНОСТЬ ЗАМЕТИЛА ВАС! БЕГИТЕ ИЛИ ПРЯЧЬТЕСЬ!" },
          "Shkafga yashirindingiz — jim turing!": { en: "You hid in the locker — stay quiet!", ru: "Вы спрятались в шкафу — не шумите!" },
          "Shkafdan chiqdingiz.": { en: "You stepped out of the locker.", ru: "Вы вышли из шкафа." },
          "Nafas yetishmayapti! Tezroq shkafdan chiqing!": { en: "Running out of breath! Leave the locker now!", ru: "Не хватает воздуха! Быстрее выходите из шкафа!" },
          "Shkafdan chiqishga majbur bo'ldingiz!": { en: "You were forced out of the locker!", ru: "Вам пришлось выйти из шкафа!" },
          "Tashlandiq Metro Lobbisi: Poyezdga chiqib bekat tanlang!": { en: "Abandoned Metro Hub: Board the train and pick a station!", ru: "Заброшенное метро: войдите в поезд и выберите станцию!" },
          "Eshik ortida xona yo'q... siz labirintga tushib qoldingiz!": { en: "No room behind that door... you warped into a labyrinth!", ru: "За дверью нет комнаты... вы попали в лабиринт!" },
          "ESHIKDAN O'TDINGIZ... BU JOY BOSHQA DUNYO!": { en: "YOU CROSSED THE DOOR... THIS IS ANOTHER DIMENSION!", ru: "ВЫ ПРОШЛИ ЧЕРЕЗ ДВЕРЬ... ЭТО ДРУГОЕ ИЗМЕРЕНИЕ!" },
          "BU ESHIK ORTIDA FAQAT BO'SH DEVOR BOR... HECH QAYERGA OLIB BORMAYDI.": { en: "ONLY A BLANK WALL BEHIND THIS DOOR... IT LEADS NOWHERE.", ru: "ЗА ЭТОЙ ДВЕРЬЮ ЛИШЬ ПУСТАЯ СТЕНА... ОНА НИКУДА НЕ ВЕДЁТ." },
          "Bu eshik qulflangan... ortidan bo'shliq ovozi eshitilyapti.": { en: "This door is locked... a hollow void echoes behind it.", ru: "Дверь заперта... за ней слышен гул пустоты." },
          "TONG OTDI! Kunduzi xavfsiz — tush xotiralarini qidiring!": { en: "DAWN BROKE! Daytime is safe — find the exit!", ru: "РАССВЕТ! Днём безопасно — ищите выход!" },
          "TUN TUSHDI! UYLARGA KIRIB YASHIRINING — ANIMATSIYA OVGA CHIQDI!": { en: "NIGHT FELL! HIDE INSIDE HOUSES — ANIMATIONS ARE HUNTING!", ru: "НАСТУПИЛА НОЧЬ! ПРЯЧЬТЕСЬ В ДОМАХ — ОХОТА НАЧАЛАСЬ!" },
          "DERAZA TUZOG'I! Ochiq oq derazalarga yaqinlashmang!": { en: "WINDOW TRAP! Stay away from open white windows!", ru: "ЛОВУШКА ОКНА! Не подходите к открытым белым окнам!" },
          "SUV SACHRADI! U SIZNI ESHITDI — QURUQ PLATFORMAGA SAKRANG!": { en: "WATER SPLASHED! IT HEARD YOU — JUMP TO DRY GROUND!", ru: "ВСПЛЕСК ВОДЫ! ОНО УСЛЫШАЛО ВАС — ПРЫГАЙТЕ НА СУХУЮ ПЛАТФОРМУ!" },
          "QAYNOQ BUG' OQIMI! CHEKINING!": { en: "SCALDING STEAM LEAK! STEP BACK!", ru: "ГОРЯЧИЙ ПАР! ОТСТУПИТЕ!" },
          "TOK URDI! Fonar zaryadi kamaydi!": { en: "ELECTRIC SHOCK! Flashlight battery drained!", ru: "УДАР ТОКОМ! Заряд фонарика снизился!" },
          "CHAQNASH! MAXLUQ 3 SONIYAGA KO'R BO'LDI — QOCHING!": { en: "FLASH SURGE! ENTITY BLINDED FOR 3s — RUN!", ru: "ВСПЫШКА! СУЩНОСТЬ ОСЛЕПЛЕНА НА 3с — БЕГИТЕ!" },
          "Chaqnatish uchun kamida 15% batareya kerak!": { en: "Need at least 15% battery to flash!", ru: "Для вспышки нужно минимум 15% заряда!" },
          "Fonar chaqnadi!": { en: "Flash surge fired!", ru: "Вспышка сработала!" },
          "Fonar olindi! Yoqish: F • Chaqnatish: G": { en: "Flashlight picked up! Toggle: F • Flash Surge: G", ru: "Фонарик взят! Свет: F • Вспышка: G" },
          "KOD TO'G'RI! EXIT eshigi ochildi — tez qoching!": { en: "CODE ACCEPTED! EXIT door unlocked — run!", ru: "КОД ВЕРНЫЙ! Дверь EXIT открыта — бегите!" },
          "TO'G'RI! Shimoldagi Kutubxona Orqa Eshigi ochildi!": { en: "CORRECT! North Library Exit Door unlocked!", ru: "ВЕРНО! Северная дверь библиотеки открыта!" },
          "PASTGA QULAYAPSIZ...": { en: "FALLING INTO THE VOID...", ru: "ВЫ ПАДАЕТЕ В ПУСТОТУ..." },
          "CHUQUR BO'SHLIQQA QULADINGIZ!": { en: "YOU FELL INTO A DARK PIT!", ru: "ВЫ УПАЛИ В ТЁМНУЮ ПРОПАСТЬ!" },
          "94-QAVATDAN BO'SHLIQQA SAKRADINGIZ! HAQIQIY CHIQISH...": { en: "JUMPED FROM FLOOR 94! TRUE EXIT REACHED...", ru: "ПРЫЖОК С 94-ГО ЭТАЖА! ИСТИННЫЙ ВЫХОД..." },
          "NOTO'G'RI QAVATDAN SAKRADINGIZ! 94 raqamli qavatni toping!": { en: "WRONG FLOOR! Find floor 94 before jumping!", ru: "НЕ ТОТ ЭТАЖ! Найдите 94-й этаж перед прыжком!" },
          "Do'stingiz Co-op xonaga qo'shildi!": { en: "A friend joined the Co-op room!", ru: "Друг присоединился к комнате Co-op!" },
          "Onlayn Cheksiz server yaratildi — boshqa o'yinchilar ulanishi mumkin!": { en: "Online Endless room hosted — other players can join!", ru: "Онлайн-сервер Бесконечного режима создан — игроки могут зайти!" },
          "Yangi o'yinchi onlayn Cheksiz dunyoga kirdi!": { en: "A new player entered Online Endless!", ru: "Новый игрок вошёл в Бесконечный онлайн-мир!" },
          "Yuqori ventilyatsiya yo'lagiga chiqdingiz!": { en: "Climbed into the upper ventilation duct!", ru: "Вы забрались в верхнюю вентиляцию!" },
          "Pastki qavatga tushdingiz!": { en: "Dropped down to the lower floor!", ru: "Вы спустились на нижний уровень!" },
          "Zaxira chiroqlar vaqtincha yondi — generatorlarni tezroq yoqing!": { en: "Backup lights on briefly — power the generators!", ru: "Аварийный свет включился — скорее запустите генераторы!" }
        };
        if (EXACT[s]) return EXACT[s][lang] || s;
        let m;
        if ((m = s.match(/^(.+) ga yetib keldingiz!$/))) return lang === 'ru' ? ('Вы прибыли в ' + m[1] + '!') : ('Arrived at ' + m[1] + '!');
        if ((m = s.match(/^Eshiklar yopilmoqda! Keyingi bekat: (.+)$/))) return lang === 'ru' ? ('Двери закрываются! Следующая станция: ' + m[1]) : ('Doors closing! Next station: ' + m[1]);
        if ((m = s.match(/^Kalit topildi! \(\+40 TANGA • (\d+) ta\)$/))) return lang === 'ru' ? ('Ключ найден! (+40 МОНЕТ • ' + m[1] + ')') : ('Key collected! (+40 COINS • ' + m[1] + ')');
        if ((m = s.match(/^Sirli kaseta topildi! \(\+60 TANGA • (\d+) \/ 31\)$/))) return lang === 'ru' ? ('Кассета найдена! (+60 МОНЕТ • ' + m[1] + ' / 31)') : ('Archive cassette found! (+60 COINS • ' + m[1] + ' / 31)');
        if ((m = s.match(/^Xona (\d+) (ochildi|yopildi)$/))) return lang === 'ru' ? ('Комната ' + m[1] + (m[2] === 'ochildi' ? ' открыта' : ' закрыта')) : ('Room ' + m[1] + (m[2] === 'ochildi' ? ' opened' : ' closed'));
        if ((m = s.match(/^CHEKSIZ REJIM • Qavat #(\d+)/))) return lang === 'ru' ? ('БЕСКОНЕЧНЫЙ РЕЖИМ • Этаж #' + m[1]) : ('ENDLESS MODE • Floor #' + m[1]);
        if ((m = s.match(/^AI O'lcham: (.+)$/))) return lang === 'ru' ? ('ИИ Измерение: ' + m[1]) : ('AI Dimension: ' + m[1]);
        if (s.startsWith("Batareya sumkaga olindi!")) return lang === 'ru' ? "Батарея добавлена в инвентарь! Нажмите (2) для замены." : "Battery stored in inventory! Tap slot (2) to recharge.";
        if (s.startsWith("Bodom suvi sumkaga olindi!")) return lang === 'ru' ? "Миндальная вода в инвентаре! Нажмите (1), чтобы выпить." : "Almond Water stored! Tap slot (1) to drink.";
        if (s.startsWith("Yangi batareya qo'yildi!")) return lang === 'ru' ? "Новая батарея установлена! (+50% Фонарь)" : "New battery installed! (+50% Flashlight)";
        if (s.startsWith("DIQQAT! CHIROQLAR O'CHDI")) return lang === 'ru' ? "ВНИМАНИЕ! СВЕТ ПОГАС (БЛЭКАУТ)!" : "WARNING! LIGHTS OUT (BLACKOUT)!";
        if (s.startsWith("SIGNAL TOPILDI // ")) return s.replace("SIGNAL TOPILDI // ", lang === 'ru' ? "СИГНАЛ НАЙДЕН // " : "SIGNAL LOCKED // ").replace("BU YERDAN CHIQISH YO'LI BOR...", lang === 'ru' ? "ЗДЕСЬ ЕСТЬ ВЫХОД..." : "THERE IS A WAY OUT...");
        if (s.startsWith("50,000m x 50,000m CHEKSIZ DUNYO!")) return lang === 'ru' ? "БЕСКОНЕЧНЫЙ МИР 50,000м! Все биомы — найдите зелёный портал выхода!" : "50,000m ENDLESS WORLD! Mixed biomes — find the green exit portal!";
        if ((m = s.match(/^(Generator|Tugma|Mayoq|Obelisk|Terminal|Elektr uzgichi) yoqildi! \((.+)\)$/))) return lang === 'ru' ? ('Объект активирован! (' + m[2] + ')') : ('Objective activated! (' + m[2] + ')');
        if ((m = s.match(/^(.+) (topildi|olindi|yig'ildi|tuzatildi)! \((.+)\)$/))) return lang === 'ru' ? ('Предмет получен! (' + m[3] + ')') : ('Item collected! (' + m[3] + ')');
        if (s.includes("ochildi!") || s.includes("yuguring!")) return lang === 'ru' ? "Выход открыт! Бегите к двери EXIT!" : "Exit unlocked! Head to the EXIT door!";
        return s;
      }

      function showToast(msg, danger = false) {
        elToast.textContent = translateToastMsg(msg);
        elToast.className = 'toast show' + (danger ? ' danger' : '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => elToast.classList.remove('show'), 2600);
      }

      function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }

      function pickMonsterPatrolTarget() {
        const cell = openCells[Math.floor(Math.random() * openCells.length)];
        state.monsterTarget = new THREE.Vector3(cell.x, 0, cell.z);
      }

      const STORY_BRIEFS = {
        0: {
          uz: "[M.E.G. RATSIA]: Siz 0-qavatdasiz. Oldindagi shkafdan fonarni oling va 8 ta kalitni topib metroni oching.",
          en: "[M.E.G. RADIO]: You fell into Level 0. Grab the flashlight from the cabinet ahead and find 8 keys for the Metro.",
          ru: "[РАЦИЯ M.E.G.]: Вы на Уровне 0. Возьмите фонарик со шкафа впереди и найдите 8 ключей к метро."
        },
        1: {
          uz: "[M.E.G. RATSIA]: 1-qavat — Omborxona. Chiroqlar o'chishi mumkin, Skin-Stealer ga yaqinlashmang.",
          en: "[M.E.G. RADIO]: Level 1 — Habitable Zone. Watch for power blackouts and avoid the Skin-Stealer.",
          ru: "[РАЦИЯ M.E.G.]: Уровень 1 — Обитаемая зона. Следите за светом и избегайте Кожекрада."
        },
        37: {
          uz: "[M.E.G. RATSIA]: 37-qavat — Poolrooms. Suv tinch ko'rinsa ham, chuqur basseynlarda yolg'iz emassiz.",
          en: "[M.E.G. RADIO]: Level 37 — Poolrooms. The water looks calm, but something lurks in the pools.",
          ru: "[РАЦИЯ M.E.G.]: Уровень 37 — Бассейны. Вода кажется тихой, но в глубине кто-то есть."
        },
        fun: {
          uz: "[OGOHLANTIRISH]: Level Fun =). Partygoer larning tabassumiga ishonmang — tezda chiqishni toping!",
          en: "[WARNING]: Level Fun =). Do not trust the Partygoers' smiles — find the exit fast!",
          ru: "[ТРЕВОГА]: Уровень Веселье =). Не верьте улыбкам Тусовщиков — бегите к выходу!"
        },
        run: {
          uz: "[FAVQULODDA SIGNAL]: Level ! — ORQAGA QARAMANG! Qizil koridorda faqat oldinga yuguring!",
          en: "[EMERGENCY]: Level ! — DO NOT LOOK BACK! Sprint down the red corridor now!",
          ru: "[ТРЕВОГА]: Уровень ! — НЕ ОГЛЯДЫВАЙТЕСЬ! Бегите вперёд по красному коридору!"
        },
        3999: {
          uz: "[M.E.G. RATSIA]: 3999-qavat — Haqiqiy Dunyo darvozasi. Oxirgi kalitlarni yig'ing va uyga qayting!",
          en: "[M.E.G. RADIO]: Level 3999 — The True Exit awaits. Gather the final keys and return home!",
          ru: "[РАЦИЯ M.E.G.]: Уровень 3999 — Выход в реальный мир. Соберите ключи и вернитесь домой!"
        },
        end: {
          uz: "[TERMINAL]: The End. Siz Backrooms ning oxiriga yetdingiz — kompyuterdan qochish kodini ishga tushiring.",
          en: "[TERMINAL]: The End. You reached the final archive — run the escape sequence.",
          ru: "[ТЕРМИНАЛ]: Конец. Вы добрались до финала — запустите выход на терминале."
        }
      };
      function showStoryBrief(lvl) {
        const b = STORY_BRIEFS[lvl];
        if (!b || typeof Sound === 'undefined' || !Sound.showVoiceSubtitle) return;
        const lang = window.__zulmatLang || 'uz';
        const delay = (lvl === 0) ? 5200 : 1800;
        setTimeout(() => {
          if (!state.started || state.ended || state.killing) return;
          if (Sound.activeVoice) return;
          if (Sound.playRadioBeep) Sound.playRadioBeep();
          Sound.showVoiceSubtitle('story_' + lvl, 6500, b[lang] || b.uz);
        }, delay);
      }

      window.__zulmatEndlessStreak = 0;
      window.__zulmatEndlessBest = parseInt(LSget('zulmat_endless_best') || '0', 10) || 0;
      window.__zulmatPickNextEndless = function(prevLvl) {
        const pool = (typeof CAMPAIGN_ORDER !== 'undefined' && CAMPAIGN_ORDER.length > 1)
          ? CAMPAIGN_ORDER.filter((x) => x !== prevLvl && x !== 'manila' && x !== 61 && x !== 3999)
          : [0, 1, 2, 3, 5, 6, 37, 'run', 'fun', 94];
        return pool[Math.floor(Math.random() * pool.length)];
      };
      // ============================================================
      // 50,000m x 50,000m SEAMLESS MULTI-BIOME ENDLESS WORLD (CHUNK STREAMING)
      // ============================================================
      const Endless50K = (function() {
        const CHUNK = 32;
        const HALF_WORLD = 25000; // -25,000m to +25,000m = 50,000m x 50,000m!
        const activeChunks = new Map();
        // AI Dimension Generator (supports optional live AI JSON endpoint in localStorage 'zulmat_ai_url' + rich Offline AI Director)
        let activeAiDimension = null;
        const AI_ADJ = ['Qizil', 'Sovuq', 'Unutilgan', 'Cheksiz', 'Shishali', 'Tumanli', 'Zanglagan', 'Jimjit', 'Aks-sadoli', 'Xira', "Qorong'u", 'Sirli'];
        const AI_NOUN = ["O'lcham", 'Arxiv', 'Koridor', 'Basseyn', 'Tunel', 'Mehmonxona', 'Ombor', 'Sektor', 'Zulmat', "Bo'shliq", 'Labirint', 'Stansiya'];
        const AI_LAYOUTS = ['tight_maze', 'pillar_hall', 'long_corridors', 'open_void'];
        const AI_ARCH = ['pillars_classic', 'pool_chambers', 'abyss_bridges', 'cathedral_arches', 'neon_server_corridors', 'ruined_sanctuary'];
        const AI_LIGHT_STYLES = ['fluorescent', 'neon_strips', 'lantern_glow', 'minimal_dark'];
        const AI_CEIL_HEIGHTS = [3.2, 4.4, 7.0];
        const AI_ANOMALIES = [
          { id: 'none', lore: "M.E.G. xabari: sokin sektor, lekin yolg'iz emassiz." },
          { id: 'blackout', lore: "ANOMALIYA: Chiroqlar o'chgan — fonarni tejang!" },
          { id: 'low_gravity', lore: 'ANOMALIYA: Past gravitatsiya — qadamlaringiz yengil.' },
          { id: 'dense_fog', lore: "ANOMALIYA: Qalin tuman — yaqin masofani ham ko'rish qiyin." },
          { id: 'fast_stalker', lore: 'ANOMALIYA: Maxluq odatdagidan tezroq harakatlanadi!' },
          { id: 'flicker_storm', lore: 'ANOMALIYA: Elektr bo\'roni — chiroqlar uzluksiz miltillaydi!' },
          { id: 'toxic_haze', lore: 'ANOMALIYA: Zaharli tuman — yugurish chidamlilikni tezroq yeydi.' }
        ];
        const AI_MONSTERS = [0, 1, 2, 974, 94];
        const MONSTER_NAME_TO_LVL = { bacteria: 0, skinstealer: 1, hound: 2, kitty: 974, wolf: 94 };
        function synthOfflineDimension(seedNum) {
          const code = 'DIM-' + (100 + ((seedNum * 73) % 899));
          const adj = AI_ADJ[Math.floor(Math.random() * AI_ADJ.length)];
          const noun = AI_NOUN[Math.floor(Math.random() * AI_NOUN.length)];
          const layout = AI_LAYOUTS[Math.floor(Math.random() * AI_LAYOUTS.length)];
          const arch = AI_ARCH[Math.floor(Math.random() * AI_ARCH.length)];
          const lightStyle = AI_LIGHT_STYLES[Math.floor(Math.random() * AI_LIGHT_STYLES.length)];
          const ceilHeight = arch === 'cathedral_arches' ? 7.0 : AI_CEIL_HEIGHTS[Math.floor(Math.random() * AI_CEIL_HEIGHTS.length)];
          const an = AI_ANOMALIES[Math.floor(Math.random() * AI_ANOMALIES.length)];
          const monLvl = AI_MONSTERS[Math.floor(Math.random() * AI_MONSTERS.length)];
          const hue = Math.random();
          const cFloor = new THREE.Color().setHSL(hue, 0.32, 0.22).getHex();
          const cWall = new THREE.Color().setHSL((hue + 0.04) % 1, 0.36, 0.38).getHex();
          const cCeil = new THREE.Color().setHSL(hue, 0.24, 0.16).getHex();
          const cAcc = new THREE.Color().setHSL((hue + 0.5) % 1, 0.85, 0.65).getHex();
          return {
            name: code + ': ' + adj + ' ' + noun,
            lore: an.lore,
            layout,
            arch,
            lightStyle,
            ceilHeight,
            anomaly: an.id,
            monsterLvl: monLvl,
            floor: cFloor, wall: cWall, ceil: cCeil, accent: cAcc,
            fogDens: an.id === 'dense_fog' ? 0.056 : (0.024 + Math.random() * 0.018)
          };
        }
        if (!window.__zulmatAiEndpoint) window.__zulmatAiEndpoint = 'https://backrooms-ai.vercel.app/api/dimension';
        window.__zulmatGetSavedAiDims = function() {
          try {
            const raw = LSget('zulmat_saved_ai_dims');
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
          } catch (e) { return []; }
        };
        window.__zulmatSaveAiDim = function(d) {
          if (!d || !d.name || typeof d.wall !== 'number') return;
          try {
            const list = window.__zulmatGetSavedAiDims();
            if (list.some((x) => x && x.name === d.name)) return;
            const mLvl = (typeof d.monsterLvl === 'number')
              ? d.monsterLvl
              : ((d.monster && MONSTER_NAME_TO_LVL[d.monster] !== undefined) ? MONSTER_NAME_TO_LVL[d.monster] : 0);
            const entry = {
              id: d.id || ('ai_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 999)),
              name: String(d.name).slice(0, 64),
              lore: String(d.lore || '').slice(0, 180),
              layout: d.layout || 'mixed',
              arch: d.arch || 'pillars_classic',
              lightStyle: d.lightStyle || 'fluorescent',
              ceilHeight: typeof d.ceilHeight === 'number' ? d.ceilHeight : 3.2,
              anomaly: d.anomaly || 'none',
              monsterLvl: mLvl,
              floor: d.floor, wall: d.wall, ceil: d.ceil, accent: d.accent,
              fogDens: typeof d.fogDens === 'number' ? d.fogDens : 0.028,
              discoveredBy: d.discoveredBy || ''
            };
            list.unshift(entry);
            if (list.length > 50) list.length = 50;
            LSset('zulmat_saved_ai_dims', JSON.stringify(list));
            if (window.__zulmatRefreshStationThumbs) window.__zulmatRefreshStationThumbs(); if (window.__zulmatSyncGlobalAiDims) window.__zulmatSyncGlobalAiDims();
          } catch (e) {}
        };
        window.__zulmatSyncGlobalAiDims = function() {
          try {
            const ep = LSget('zulmat_ai_url') || window.__zulmatAiEndpoint || '';
            if (!ep || typeof fetch !== 'function') return;
            fetch(ep, { method: 'GET' })
              .then((r) => r.json())
              .then((data) => {
                if (!data || !Array.isArray(data.dimensions) || !data.dimensions.length) return;
                const local = window.__zulmatGetSavedAiDims();
                const byName = new Map();
                data.dimensions.forEach((d) => {
                  if (d && d.name && typeof d.wall === 'number') {
                    const mLvl = (typeof d.monsterLvl === 'number')
                      ? d.monsterLvl
                      : ((d.monster && MONSTER_NAME_TO_LVL[d.monster] !== undefined) ? MONSTER_NAME_TO_LVL[d.monster] : 0);
                    byName.set(d.name, Object.assign({}, d, { monsterLvl: mLvl }));
                  }
                });
                local.forEach((d) => { if (d && d.name && !byName.has(d.name)) byName.set(d.name, d); });
                const merged = Array.from(byName.values()).slice(0, 50);
                LSset('zulmat_saved_ai_dims', JSON.stringify(merged));
                if (window.__zulmatRefreshStationThumbs) window.__zulmatRefreshStationThumbs();
              }).catch(() => {});
          } catch (e) {}
        };
        setTimeout(() => { if (window.__zulmatSyncGlobalAiDims) window.__zulmatSyncGlobalAiDims(); }, 1800);
        window.__zulmatSetActiveAiDim = function(d) {
          if (d) activeAiDimension = d;
        };
        window.__zulmatGenerateAiDimension = function(streak) {
          activeAiDimension = synthOfflineDimension((streak || 0) + Date.now());
          try {
            const ep = LSget('zulmat_ai_url') || window.__zulmatAiEndpoint || '';
            if (ep && typeof fetch === 'function') {
              const pName = (document.getElementById('coop-name') && document.getElementById('coop-name').value.trim()) || '';
              fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ streak: streak || 0, lang: window.__zulmatLang || 'uz', player: pName }) })
                .then((r) => r.json())
                .then((d) => {
                  if (d && d.name && typeof d.wall === 'number') {
                    if (d.monster && MONSTER_NAME_TO_LVL[d.monster] !== undefined) d.monsterLvl = MONSTER_NAME_TO_LVL[d.monster];
                    activeAiDimension = d;
                    window.__zulmatSaveAiDim(d);
                    if (typeof setMonsterVariant === 'function' && d.monsterLvl !== undefined && state.zone === 'levelendless') {
                      setMonsterVariant(d.monsterLvl);
                    }
                    if (state.zone === 'levelendless' && typeof Endless50K !== 'undefined' && Endless50K.rebuildActiveChunks) {
                      Endless50K.rebuildActiveChunks();
                    }
                    showToast('AI Dimension: ' + d.name + ' (Bekatlarga saqlandi!)');
                  }
                }).catch(() => {});
            }
          } catch (e) {}
          return activeAiDimension;
        };
        const BIOMES = [
          { name: 'Level 0: Sariq Labirint', floor: 0x8f8248, wall: 0xc2b262, ceil: 0xb5a866, accent: 0xfef08a },
          { name: 'Level 37: Poolrooms', floor: 0x0e7490, wall: 0x67e8f9, ceil: 0x155e75, accent: 0x22d3ee },
          { name: 'Level 1: Omborxona', floor: 0x334155, wall: 0x475569, ceil: 0x1e293b, accent: 0xef4444 },
          { name: 'Level 5: Terror Hotel', floor: 0x5c1919, wall: 0x4a2c20, ceil: 0x2b1710, accent: 0xf59e0b },
          { name: 'Level 6: Mutlaq Zulmat', floor: 0x0b0b0e, wall: 0x18181b, ceil: 0x050507, accent: 0xdc2626 },
          { name: 'Level Fun: Bayram', floor: 0x3b82f6, wall: 0xfacc15, ceil: 0xec4899, accent: 0x4ade80 },
          { name: 'Level 46: Qum Cho\'li', floor: 0xc29b5a, wall: 0xa17638, ceil: 0x7c2d12, accent: 0xfbbf24 },
          { name: 'Level Infinity: Oynalar', floor: 0x1e293b, wall: 0x94a3b8, ceil: 0x0f172a, accent: 0x38bdf8 }
        ];
        const matCache = {};
        function getMat(hex, rough = 0.8, metal = 0.08) {
          const k = hex + '_' + rough + '_' + metal;
          if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });
          return matCache[k];
        }
        const floorGeo = new THREE.PlaneGeometry(CHUNK, CHUNK);
        const ceilGeo = new THREE.PlaneGeometry(CHUNK, CHUNK);
        const pillarGeo = new THREE.BoxGeometry(3.2, 4.4, 3.2);
        const wallHGeo = new THREE.BoxGeometry(10.0, 4.4, 1.0);
        const wallVGeo = new THREE.BoxGeometry(1.0, 4.4, 10.0);
        const lightGeo = new THREE.BoxGeometry(2.8, 0.12, 0.8);

        function hash2(cx, cz) {
          let h = Math.imul(cx, 374761393) + Math.imul(cz, 668265263);
          h = Math.imul(h ^ (h >>> 13), 1274126177);
          return ((h ^ (h >>> 16)) >>> 0);
        }
        function biomeAt(cx, cz) {
          const bx = Math.floor(cx / 2), bz = Math.floor(cz / 2);
          if (activeAiDimension && (hash2(bx, bz) % 3 === 0)) return activeAiDimension;
          return BIOMES[hash2(bx, bz) % BIOMES.length];
        }

        // Random glowing Exit Portal inside the 50,000m x 50,000m world
        const exitPortal = new THREE.Group();
        const pFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.8, 0.45), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        pFrame.position.y = 1.9;
        const pCore = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.2, 0.55), new THREE.MeshBasicMaterial({ color: 0xbbf7d0 }));
        pCore.position.y = 1.8;
        const pBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.9, 18, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
        pBeam.position.y = 9;
        const pLight = new THREE.PointLight(0x22c55e, 2.5, 26);
        pLight.position.y = 2.6;
        exitPortal.add(pFrame, pCore, pBeam, pLight);
        levelEndlessGroup.add(exitPortal);

        let exitPos = { x: 180, z: -160 };
        let lastCx = 999999, lastCz = 999999;

        let activeEndlessPits = [];
        function buildChunk(cx, cz) {
          const grp = new THREE.Group();
          const wx = cx * CHUNK, wz = cz * CHUNK;
          grp.position.set(wx, 0, wz);
          const bm = biomeAt(cx, cz);
          const h = hash2(cx, cz);
          const isAiChunk = (bm === activeAiDimension);
          const arch = (isAiChunk && bm.arch) ? bm.arch : (activeAiDimension && activeAiDimension.arch ? activeAiDimension.arch : 'pillars_classic');
          const cH = (isAiChunk && bm.ceilHeight) ? bm.ceilHeight : (arch === 'cathedral_arches' ? 7.0 : 4.4);
          const lightStyle = (isAiChunk && bm.lightStyle) ? bm.lightStyle : 'fluorescent';

          const boxes = [];
          const pits = [];
          const wMat = getMat(bm.wall, bm.wall === 0x94a3b8 ? 0.15 : 0.78, bm.wall === 0x94a3b8 ? 0.85 : 0.08);
          const fMat = getMat(bm.floor, 0.85, 0.05);
          const cMat = getMat(bm.ceil, 0.9, 0.05);
          const lampMat = new THREE.MeshBasicMaterial({ color: bm.accent });

          // Floor & Architecture Preset
          const isSpawnSafe = (Math.abs(cx) <= 1 && Math.abs(cz) <= 1);
          if (arch === 'abyss_bridges' && !isSpawnSafe && (h % 3 !== 0)) {
            // Cross-bridges over a deep dark void with glowing edge rails
            const abyssFl = new THREE.Mesh(floorGeo, getMat(0x040507, 0.95, 0));
            abyssFl.rotation.x = -Math.PI / 2; abyssFl.position.y = -7.5;
            grp.add(abyssFl);
            const brNS = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, CHUNK), fMat);
            brNS.position.set(0, -0.22, 0); brNS.receiveShadow = true;
            const brEW = new THREE.Mesh(new THREE.BoxGeometry(CHUNK, 0.45, 5.6), fMat);
            brEW.position.set(0, -0.22, 0); brEW.receiveShadow = true;
            grp.add(brNS, brEW);
            // Glowing bridge edge strips
            [-2.75, 2.75].forEach((off) => {
              const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, CHUNK), lampMat);
              s1.position.set(off, 0.06, 0);
              const s2 = new THREE.Mesh(new THREE.BoxGeometry(CHUNK, 0.12, 0.14), lampMat);
              s2.position.set(0, 0.06, off);
              grp.add(s1, s2);
            });
            // 4 corner abyss pit zones
            [[-9.5, -9.5], [9.5, -9.5], [-9.5, 9.5], [9.5, 9.5]].forEach(([px, pz]) => {
              pits.push({ x: wx + px, z: wz + pz, halfX: 6.1, halfZ: 6.1 });
            });
          } else {
            const fl = new THREE.Mesh(floorGeo, fMat);
            fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true;
            grp.add(fl);
          }

          if (arch === 'pool_chambers' && (h % 2 === 0)) {
            // Sunken glowing pool basin in chunk center with tiled border
            const waterMat = new THREE.MeshStandardMaterial({ color: bm.accent, transparent: true, opacity: 0.46, roughness: 0.1, metalness: 0.25 });
            const pool = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 11.5), waterMat);
            pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.06, 0);
            grp.add(pool);
            const rimN = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.28, 0.45), wMat); rimN.position.set(0, 0.14, -6.0);
            const rimS = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.28, 0.45), wMat); rimS.position.set(0, 0.14, 6.0);
            const rimW = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 11.6), wMat); rimW.position.set(-6.0, 0.14, 0);
            const rimE = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 11.6), wMat); rimE.position.set(6.0, 0.14, 0);
            grp.add(rimN, rimS, rimW, rimE);
          }

          const cl = new THREE.Mesh(ceilGeo, cMat);
          cl.rotation.x = Math.PI / 2;
          cl.position.y = cH;
          grp.add(cl);

          // Lighting styles
          if (lightStyle === 'lantern_glow') {
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), lampMat);
            orb.position.set(0, cH - 0.9, 0);
            const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), wMat);
            cord.position.set(0, cH - 0.45, 0);
            grp.add(orb, cord);
          } else if (lightStyle === 'neon_strips') {
            const stripA = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 18), lampMat);
            stripA.position.set(0, cH - 0.08, 0);
            const stripB = new THREE.Mesh(new THREE.BoxGeometry(18, 0.12, 0.18), lampMat);
            stripB.position.set(0, cH - 0.08, 0);
            grp.add(stripA, stripB);
          } else if (lightStyle !== 'minimal_dark') {
            const lamp = new THREE.Mesh(lightGeo, lampMat);
            lamp.position.set(0, cH - 0.08, 0);
            grp.add(lamp);
          }

          // Architecture-specific structural details
          if (arch === 'cathedral_arches') {
            [-10, 10].forEach((az) => {
              const beam = new THREE.Mesh(new THREE.BoxGeometry(CHUNK, 0.9, 1.3), wMat);
              beam.position.set(0, cH - 0.75, az);
              grp.add(beam);
            });
          } else if (arch === 'neon_server_corridors') {
            [[-14.5, 0], [14.5, 0]].forEach(([nx, nz]) => {
              const tube = new THREE.Mesh(new THREE.BoxGeometry(0.16, cH - 0.4, 0.16), lampMat);
              tube.position.set(nx, (cH - 0.4) * 0.5, nz);
              grp.add(tube);
            });
          } else if (arch === 'ruined_sanctuary' && (h & 1)) {
            const rubble = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 2.4), wMat);
            rubble.position.set(4.5, 0.5, -3.5);
            rubble.rotation.set(0.12, 0.45, -0.08);
            grp.add(rubble);
            boxes.push({ x: wx + 4.5, z: wz - 3.5, halfX: 1.6, halfZ: 1.2 });
          } else if ((h & 3) === 1) {
            const archBeam = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.85, 1.1), wMat);
            archBeam.position.set(0, cH - 0.5, 0);
            grp.add(archBeam);
          }

          // Deterministic obstacles per chunk scaled to cH
          const lay = (activeAiDimension && activeAiDimension.layout) ? activeAiDimension.layout : 'pillar_hall';
          const slots = lay === 'tight_maze'
            ? [[-10, -10], [0, -10], [10, -10], [-10, 0], [10, 0], [-10, 10], [0, 10], [10, 10]]
            : [[-9, -9], [9, -9], [-9, 9], [9, 9]];
          slots.forEach(([sx, sz], idx) => {
            if (arch === 'abyss_bridges' && !isSpawnSafe && (h % 3 !== 0)) return;
            const bit = (h >>> ((idx * 3) % 24)) & 7;
            if (lay === 'open_void' && bit < 5) return;
            if (lay === 'pillar_hall' && bit < 2) return;
            const ax = wx + sx, az = wz + sz;
            if (arch === 'neon_server_corridors') {
              const rack = new THREE.Mesh(new THREE.BoxGeometry(2.2, cH, 4.4), wMat);
              rack.position.set(sx, cH * 0.5, sz);
              const led = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.14, 3.8), lampMat);
              led.position.set(sx, cH * 0.65, sz);
              grp.add(rack, led);
              boxes.push({ x: ax, z: az, halfX: 1.1, halfZ: 2.2 });
            } else if (lay === 'long_corridors') {
              const wv = new THREE.Mesh(new THREE.BoxGeometry(1.0, cH, 10.0), wMat);
              wv.position.set(sx, cH * 0.5, sz);
              grp.add(wv);
              boxes.push({ x: ax, z: az, halfX: 0.5, halfZ: 5.0 });
            } else if (lay === 'pillar_hall' || bit < 4) {
              const pil = new THREE.Mesh(new THREE.BoxGeometry(3.2, cH, 3.2), wMat);
              pil.position.set(sx, cH * 0.5, sz);
              grp.add(pil);
              boxes.push({ x: ax, z: az, halfX: 1.6, halfZ: 1.6 });
            } else if (bit === 5) {
              const wh = new THREE.Mesh(new THREE.BoxGeometry(10.0, cH, 1.0), wMat);
              wh.position.set(sx, cH * 0.5, sz);
              grp.add(wh);
              boxes.push({ x: ax, z: az, halfX: 5.0, halfZ: 0.5 });
            } else {
              const wv = new THREE.Mesh(new THREE.BoxGeometry(1.0, cH, 10.0), wMat);
              wv.position.set(sx, cH * 0.5, sz);
              grp.add(wv);
              boxes.push({ x: ax, z: az, halfX: 0.5, halfZ: 5.0 });
            }
          });
          levelEndlessGroup.add(grp);
          return { grp, boxes, pits };
        }

        function syncEndlessCollisionCache() {
          const flat = [];
          const flatPits = [];
          for (const ch of activeChunks.values()) {
            for (let i = 0; i < ch.boxes.length; i++) flat.push(ch.boxes[i]);
            if (ch.pits) for (let j = 0; j < ch.pits.length; j++) flatPits.push(ch.pits[j]);
          }
          lEndlessBoxes.length = 0;
          for (let i = 0; i < flat.length; i++) lEndlessBoxes.push(flat[i]);
          activeEndlessPits = flatPits;
        }

        function rebuildActiveChunks() {
          for (const ch of activeChunks.values()) levelEndlessGroup.remove(ch.grp);
          activeChunks.clear();
          lastCx = 999999; lastCz = 999999;
          updateChunks(state.pos.x, state.pos.z);
        }

        function updateChunks(px, pz) {
          const cx = Math.round(px / CHUNK);
          const cz = Math.round(pz / CHUNK);
          if (cx === lastCx && cz === lastCz) return;
          lastCx = cx; lastCz = cz;
          const needed = new Set();
          for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
              const k = (cx + dx) + ',' + (cz + dz);
              needed.add(k);
              if (!activeChunks.has(k)) activeChunks.set(k, buildChunk(cx + dx, cz + dz));
            }
          }
          for (const [k, ch] of activeChunks.entries()) {
            if (!needed.has(k)) {
              levelEndlessGroup.remove(ch.grp);
              activeChunks.delete(k);
            }
          }
          syncEndlessCollisionCache();
        }

        function spawnRandomRun() {
          // Spawn near shared central hub (x: -18..18, z: -18..18) so all online players meet & see each other!
          const rx = Math.floor((Math.random() * 2 - 1) * 16);
          const rz = Math.floor((Math.random() * 2 - 1) * 16);
          state.pos.set(rx, 1.65, rz);
          const ang = Math.random() * Math.PI * 2;
          const dist = 160 + Math.random() * 160;
          exitPos.x = Math.max(-HALF_WORLD + 60, Math.min(HALF_WORLD - 60, Math.round(rx + Math.cos(ang) * dist)));
          exitPos.z = Math.max(-HALF_WORLD + 60, Math.min(HALF_WORLD - 60, Math.round(rz + Math.sin(ang) * dist)));
          exitPortal.position.set(exitPos.x, 0, exitPos.z);
          state.monsterPos.set(rx + 36, 0, rz - 36);
          for (const ch of activeChunks.values()) levelEndlessGroup.remove(ch.grp);
          activeChunks.clear();
          lastCx = 999999; lastCz = 999999;
          updateChunks(rx, rz);
        }

        function tick(dt, animT, cfg) {
          // Clamp to 50,000m x 50,000m world bounds
          state.pos.x = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, state.pos.x));
          state.pos.z = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, state.pos.z));
          updateChunks(state.pos.x, state.pos.z);

          const bm = biomeAt(Math.round(state.pos.x / CHUNK), Math.round(state.pos.z / CHUNK));
          pBeam.rotation.y += dt * 1.6;
          const dExit = Math.hypot(state.pos.x - exitPos.x, state.pos.z - exitPos.z);

          // Roaming Stalker across 50km
          const dMon = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
          if (dMon > 85) {
            const a = Math.random() * Math.PI * 2;
            state.monsterPos.set(state.pos.x + Math.cos(a) * 44, 0, state.pos.z + Math.sin(a) * 44);
          }
          state.monsterChasing = canMonsterDetect(dMon, 26, state.sprinting);
          if (state.monsterChasing) {
            state._endlessPatrol = { x: state.pos.x, z: state.pos.z };
          } else if (!state._endlessPatrol || Math.hypot(state._endlessPatrol.x - state.monsterPos.x, state._endlessPatrol.z - state.monsterPos.z) < 2.5) {
            const ang = Math.random() * Math.PI * 2;
            state._endlessPatrol = { x: state.pos.x + Math.cos(ang) * 28, z: state.pos.z + Math.sin(ang) * 28 };
          }
          const tx = state.monsterChasing ? state.pos.x : state._endlessPatrol.x;
          const tz = state.monsterChasing ? state.pos.z : state._endlessPatrol.z;
          const dx = tx - state.monsterPos.x, dz = tz - state.monsterPos.z;
          const anId = (activeAiDimension && activeAiDimension.anomaly) ? activeAiDimension.anomaly : 'none';
          if (anId === 'blackout') { hemiLight.intensity = 0.24; ambientLight.intensity = 0.12; }
          else if (anId === 'flicker_storm') {
            const flk = (Math.sin(animT * 19.0) * Math.sin(animT * 7.3) > 0.25) ? 0.56 : 0.22;
            hemiLight.intensity = flk; ambientLight.intensity = flk * 0.50;
          } else if (anId === 'toxic_haze') {
            hemiLight.intensity = 0.44; ambientLight.intensity = 0.22;
            scene.fog.density = 0.036 + Math.sin(animT * 1.4) * 0.006;
            if (state.sprinting) state.stamina = Math.max(0, state.stamina - dt * 10);
          } else if (anId === 'dense_fog') { hemiLight.intensity = 0.44; ambientLight.intensity = 0.22; scene.fog.density = 0.044; }
          else { hemiLight.intensity = 0.50; ambientLight.intensity = 0.26; }
          // Abyss bridge fall check
          if (!state._fallingPit && !state.killing && activeEndlessPits.length > 0) {
            for (let pi = 0; pi < activeEndlessPits.length; pi++) {
              const pt = activeEndlessPits[pi];
              if (Math.abs(state.pos.x - pt.x) < pt.halfX - 0.15 && Math.abs(state.pos.z - pt.z) < pt.halfZ - 0.15) {
                state._fallingPit = true; state._fallPitT = 0;
                if (typeof Sound !== 'undefined' && Sound.playSfx) Sound.playSfx('fall_abyss', 0.92);
                showToast("Tubsizlikka quladingiz!", true);
                break;
              }
            }
          }
          const anMult = anId === 'fast_stalker' ? 1.24 : 1.0;
          const spd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * anMult * (1 + Math.min(0.45, window.__zulmatEndlessStreak * 0.05));
          steerMonsterStep(state.monsterPos, state.monsterPos.x + dx, state.monsterPos.z + dz, spd, dt);
          monsterGroup.visible = true;
          monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
          const tgtYaw = Math.atan2(dx, dz);
          let yDiff = ((tgtYaw - (monsterGroup.rotation.y || 0) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          monsterGroup.rotation.y = (monsterGroup.rotation.y || 0) + yDiff * Math.min(1, dt * 7.5);
          state.mStepTimer = (state.mStepTimer || 0) - dt;
          if (state.mStepTimer <= 0 && typeof Sound !== 'undefined' && Sound.monsterStep) {
            state.mStepTimer = state.monsterChasing ? 0.32 : 0.62;
            Sound.monsterStep(dMon, state.monsterPos.x, state.monsterPos.z);
          }
          if (typeof monsterMixer !== 'undefined' && monsterMixer) monsterMixer.update(dt * (state.monsterChasing ? 1.5 : 1.0));
          if (dMon < 1.35 && !state.killing && !state.ended) {
            showToast("Cheksiz 50,000m dunyoda maxluq sizni tutdi! (Rekord: " + window.__zulmatEndlessBest + ")", true);
            startKillAnimation();
          }

          if (dExit < 2.8) {
            window.__zulmatEndlessStreak++;
            if (window.__zulmatEndlessStreak > window.__zulmatEndlessBest) {
              window.__zulmatEndlessBest = window.__zulmatEndlessStreak;
              try { LSset('zulmat_endless_best', String(window.__zulmatEndlessBest)); } catch (e) {}
            }
            Sound.playSfx('no_clip_glitch', 0.85);
            state.battery = Math.min(100, state.battery + 40);
            state.stamina = 100;
            if (window.__zulmatAddCoins) window.__zulmatAddCoins(100);
            const nextDim = window.__zulmatGenerateAiDimension ? window.__zulmatGenerateAiDimension(window.__zulmatEndlessStreak) : null;
            if (nextDim && typeof setMonsterVariant === 'function' && nextDim.monsterLvl !== undefined) setMonsterVariant(nextDim.monsterLvl);
            spawnRandomRun();
            if (typeof showToast === 'function') {
              showToast((nextDim ? nextDim.name + ' • ' + nextDim.lore : "Yangi o'lcham") + ' (+100 Tanga)', 5200);
            }
          }

          if (typeof elHudObj !== 'undefined' && elHudObj) {
            elHudObj.textContent = '50,000m CHEKSIZ • ' + bm.name + ' • Chiqish: ' + Math.round(dExit) + 'm • Hisob: ' + window.__zulmatEndlessStreak + ' (X:' + Math.round(state.pos.x) + ' Z:' + Math.round(state.pos.z) + ')';
          }
          if (typeof drawRadar === 'function') drawRadar(dMon);
          if (typeof updateVhsGrain === 'function') updateVhsGrain(0.18 + Math.max(0, 1 - dMon / 25) * 0.35);
        }

        return { spawnRandomRun, tick, rebuildActiveChunks, getActivePits: () => activeEndlessPits };
      })();

      window.__zulmatStartEndless = function(fixedDim) {
        window.__zulmatGameMode = 'endless';
        window.__zulmatEndlessStreak = 0;
        const stOv = document.getElementById('start-overlay');
        if (stOv) stOv.classList.add('hidden');
        document.body.classList.add('game-started');
        state.started = true;
        state.paused = false;
        state.ended = false;
        state.invAlmond = state.invAlmond || 0;
        state.invBattery = state.invBattery || 0;
        if (typeof bonusPickups !== 'undefined') {
          for (let bi = 0; bi < bonusPickups.length; bi++) {
            const bp = bonusPickups[bi];
            if (bp && bp.zone === state.zone) {
              bp.taken = false;
              if (bp.mesh) bp.mesh.visible = true;
            }
          }
        }
        if (window.__zulmatShowLevelLoading) window.__zulmatShowLevelLoading('CHEKSIZ REJIM');
        state.killing = false; state._fallingPit = false; state._fallPitT = 0; state.monsterStunTimer = 0; state.flashStunCd = 0;
        if (state.zone === 'level0') {
          if (window.l0FlashPickup) { window.l0FlashPickup.taken = false; if (window.l0FlashPickup.mesh) window.l0FlashPickup.mesh.visible = true; }
          if (window.l0UpperPickups) window.l0UpperPickups.forEach((u) => { u.taken = false; if (u.mesh) u.mesh.visible = true; });
        }
        state.hasFlashlight = !(state.zone === 'level0' && window.l0FlashPickup && !window.l0FlashPickup.taken);
        state.flashOn = !!state.hasFlashlight;
        if (btnFlash) { btnFlash.style.display = state.hasFlashlight ? '' : 'none'; btnFlash.classList.toggle('on', state.flashOn); }
        const _bfs0 = document.getElementById('btn-flash-stun'); if (_bfs0) _bfs0.style.display = state.hasFlashlight ? '' : 'none';
        state.currentLevel = 'endless50k';
        state.zone = 'levelendless';
        // Hide all story level groups & show levelEndlessGroup
        [level0Group, level1Group, level2Group, level3Group, level4Group, level5Group, level6Group, level7Group, level8Group, level9Group, level10Group, level11Group, level14Group, level15Group, level22Group, level33Group, level36Group, level37Group, level46Group, level61Group, level94Group, level188Group, level922Group, level974Group, level3999Group, levelRunGroup, levelFunGroup, levelEndGroup, levelShadyGroup, levelManilaGroup, levelMirrorGroup, metroLobbyGroup].forEach((g) => { if (g) g.visible = false; });
        levelEndlessGroup.visible = true;
        scene.background.setHex(0x0b0d12);
        scene.fog.color.setHex(0x0b0d12);
        scene.fog.density = 0.024;
        camera.far = 90; camera.updateProjectionMatrix();
        hemiLight.intensity = 0.35;
        ambientLight.intensity = 0.18;
        Sound.init();
        Sound.stopAllClips();
        Sound.playZoneBgm('level922_void');
        Sound.playSfx('no_clip_glitch', 0.85);
        let aiDim = null;
        if (fixedDim && fixedDim.name) {
          if (window.__zulmatSetActiveAiDim) window.__zulmatSetActiveAiDim(fixedDim);
          if (typeof setMonsterVariant === 'function' && fixedDim.monsterLvl !== undefined) setMonsterVariant(fixedDim.monsterLvl);
          aiDim = fixedDim;
        } else {
          aiDim = window.__zulmatGenerateAiDimension ? window.__zulmatGenerateAiDimension(window.__zulmatEndlessStreak || 0) : null;
        }
        Endless50K.spawnRandomRun();
        if (!fixedDim && window.__zulmatJoinPublicEndless) window.__zulmatJoinPublicEndless();
        if (aiDim) showToast((fixedDim ? "Saqlangan AI Bekat: " : "AI O'lcham: ") + aiDim.name, 4800);
        else if (typeof showToast === 'function') {
          showToast("50,000m x 50,000m CHEKSIZ DUNYO! Barcha biomlar aralash — yashil chiqish portalini toping!", 5200);
        }
      };

      function enterMetroLobby(fromVictory = true) {
        if (fromVictory && window.__zulmatGameMode === 'endless') {
          window.__zulmatEndlessStreak++;
          if (window.__zulmatEndlessStreak > window.__zulmatEndlessBest) {
            window.__zulmatEndlessBest = window.__zulmatEndlessStreak;
            try { LSset('zulmat_endless_best', String(window.__zulmatEndlessBest)); } catch (e) {}
          }
          Sound.playSfx('no_clip_glitch', 0.85);
          if (typeof elTrainFade !== 'undefined' && elTrainFade) elTrainFade.classList.add('active');
          const nextLvl = window.__zulmatPickNextEndless(state.currentLevel);
          setTimeout(() => {
            if (typeof elTrainFade !== 'undefined' && elTrainFade) elTrainFade.classList.remove('active');
            resetGame(nextLvl);
            state.battery = Math.min(100, Math.max(state.battery, 65));
            state.stamina = 100;
            if (typeof showToast === 'function') {
              showToast("CHEKSIZ REJIM • Qavat #" + (window.__zulmatEndlessStreak + 1) + " • Rekord: " + window.__zulmatEndlessBest, 4500);
            }
          }, 650);
          return;
        }
        state.zone = 'metro_lobby';
        state.ended = false;
        state.paused = false;
        state.killing = false;
        state.hiding = false;
        state.monsterChasing = false;
        if (state.hideLocker && state.hideLocker.mesh) state.hideLocker.mesh.visible = true;
        state.hideLocker = null;
        elLockerOv.classList.remove('active');
        elDangerVig.style.opacity = '0';
        elEndOv.classList.add('hidden');
        elTrainFade.classList.remove('active');
        elInteractBtn.style.display = '';
        elInteractBtn.classList.remove('visible');
        Sound.stopAllClips();
        Sound.playZoneBgm('metro_lobby');
        if (fromVictory && state.currentLevel === 3999 && window.__zulmatPlayStoryVideo) {
          state.paused = true;
          Sound.stopAllClips();
          window.__zulmatPlayStoryVideo('outro.mp4', () => {
            const cr = document.getElementById('credits-overlay');
            if (cr) cr.classList.remove('hidden');
            state.paused = false;
            Sound.playZoneBgm('metro_lobby');
          });
        } else if (fromVictory && state.currentLevel === 3999) {
          setTimeout(() => Sound.playVoice('vox_win', 0.95, 10000), 500);
        } else {
          if (!window.__zulmatTrainIntroPlayed && state.currentLevel === 0 && !fromVictory) {
            window.__zulmatTrainIntroPlayed = true;
            setTimeout(() => Sound.playVoice('vox_train_arrive', 0.96, 20000), 650);
          } else {
            setTimeout(() => Sound.playVoice('metro_arrive_vox', 0.92, 12000), 900);
          }
        }

        if (fromVictory) {
          state.completedLevels[state.currentLevel] = true;
          state.level0Done = !!state.completedLevels[0];
          try {
            LSset('zulmat_completed_levels', JSON.stringify(state.completedLevels));
            LSset('zulmat_vhs_tapes', String(state.vhsTapes || 0));
          } catch (e) {}
          let best = parseFloat(LSget('zulmat_best_time') || '0') || 0;
          if (best === 0 || state.elapsed < best) {
            try { LSset('zulmat_best_time', String(state.elapsed.toFixed(1))); } catch (e) {}
          }
        }

        disposeLevelGroup(state.currentLevel);
        // Switch 3D world to Abandoned Metro Lobby!
        level0Group.visible = false;
        level1Group.visible = false;
        level2Group.visible = false;
        level37Group.visible = false;
        levelRunGroup.visible = false;
        levelFunGroup.visible = false;
        level94Group.visible = false;
        level922Group.visible = false;
        level9Group.visible = false;
        level10Group.visible = false;
        level11Group.visible = false;
        levelEndGroup.visible = false;
        level61Group.visible = false;
        level3Group.visible = false;
        level4Group.visible = false;
        level5Group.visible = false;
        level6Group.visible = false;
        level7Group.visible = false;
        level8Group.visible = false;
        level188Group.visible = false;
        level974Group.visible = false;
        level3999Group.visible = false;
        level33Group.visible = false;
        level36Group.visible = false;
        levelShadyGroup.visible = false;
        [level14Group, level15Group, level22Group, level46Group, levelManilaGroup, levelMirrorGroup, levelEndlessGroup].forEach((g) => { g.visible = false; });
        metroLobbyGroup.visible = true;
        if (btnJump) btnJump.style.display = 'flex';
        scene.background.setHex(0x13171b);
        scene.fog.color.setHex(0x13171b);
        scene.fog.density = 0.032;
        camera.far = 75; camera.updateProjectionMatrix();
        hemiLight.color.setHex(0xcfe0dc);
        hemiLight.groundColor.setHex(0x2d3238);
        hemiLight.intensity = 0.44;
        ambientLight.intensity = 0.16;

        // Roll the metro train dramatically into the station from the left dark tunnel!
        state.trainAnim = 'arriving';
        state.trainTimer = -0.45;
        metroTrain.openAmt = 0;
        if (metroTrain.group) metroTrain.group.position.x = -58;
        if (metroTrain.doorL) metroTrain.doorL.position.x = -0.4;
        if (metroTrain.doorR) metroTrain.doorR.position.x = 0.4;

        // Spawn on the metro platform facing the approaching train
        state.pos.set(0, 1.65, 3.8);
        state.yaw = 0;
        state.pitch = 0;
        state.battery = 100;
        state.stamina = 100;
        const doneCnt = Object.values(state.completedLevels).filter(Boolean).length;
        const nxtL = getNextCampaignLevel();
        const nxtTh = LEVEL_THEMES[nxtL] || LEVEL_THEMES[0];
        elHudObj.textContent = 'KEYINGI: ' + nxtTh.name + ' (' + doneCnt + '/31)';

        if (fromVictory) {
          Sound.win(); if (window.__zulmatAddCoins) window.__zulmatAddCoins(150);
          setTimeout(() => Sound.trainBrake(), 260);
          const nextMsg = state.currentLevel === 0
            ? "LEVEL 0 TUGADI! Endi poyezdda LEVEL 1 (Habitable Zone) ochildi!"
            : (state.currentLevel === 1
              ? "LEVEL 1 TUGADI! Endi poyezdda LEVEL 37 (Poolrooms) ochildi!"
              : "TABRIKLAYMIZ! Barcha 3 ta Backrooms levelidan o'tdingiz!");
          showToast(nextMsg);
        } else {
          Sound.trainBrake();
          showToast("Tashlandiq Metro Lobbisi: Poyezdga chiqib bekat tanlang!");
        }
      }

      const CAMPAIGN_ORDER = [0, 'manila', 1, 2, 3, 4, 5, 6, 7, 8, 61, 9, 10, 11, 14, 15, 22, 33, 36, 37, 46, 188, 974, 'mirror', 'run', 'fun', 94, 'end', 'shady', 922, 3999];
      function getNextCampaignLevel() {
        for (let i = 0; i < CAMPAIGN_ORDER.length; i++) {
          if (!state.completedLevels[CAMPAIGN_ORDER[i]]) return CAMPAIGN_ORDER[i];
        }
        return CAMPAIGN_ORDER[0];
      }

      window.__zulmatIsLevelUnlocked = function(lvl) {
        if (window.__zulmatForceUnlockAll) return true;
        if (lvl === 0) return true;
        if (state.completedLevels && state.completedLevels[lvl]) return true;
        const nextLvl = getNextCampaignLevel();
        return lvl === nextLvl;
      };
      function openStationMenu(forceTest = false) {
        if (!forceTest && state.trainAnim !== 'parked') return;
        window.__zulmatForceUnlockAll = !!forceTest;
        state.paused = true;
        CAMPAIGN_ORDER.forEach((id) => {
          const el = document.getElementById('st-badge-' + id);
          const btn = document.getElementById('st-btn-' + id);
          const unlocked = window.__zulmatIsLevelUnlocked(id);
          const done = !!(state.completedLevels && state.completedLevels[id]);
          if (el) el.textContent = done ? 'BAJARILDI' : (unlocked ? 'OCHIQ' : 'QULFLANGAN');
          if (btn) {
            btn.style.opacity = unlocked ? '1' : '0.48';
            btn.dataset.stLocked = unlocked ? '0' : '1';
          }
        });
        if (window.__zulmatRefreshStationThumbs) window.__zulmatRefreshStationThumbs();
        elStationOv.classList.remove('hidden');
      }

      function startTrainDeparture(lvl = 0) {
        if (window.__zulmatIsLevelUnlocked && !window.__zulmatIsLevelUnlocked(lvl)) {
          if (typeof Sound !== 'undefined') Sound.click();
          showToast(window.__zulmatTr ? window.__zulmatTr("Avval oldingi bekatni yakunlang!", "Complete the previous station first!", "Сначала пройдите предыдущую станцию!") : "Avval oldingi bekatni yakunlang!");
          return;
        }
        if (window.__zulmatStopStartMenuBgm) window.__zulmatStopStartMenuBgm();
        if (!state.started) { state.started = true; document.body.classList.add('game-started'); elStartOv.classList.add('hidden'); }
        if (state.zone !== 'metro_lobby') {
          elStationOv.classList.add('hidden');
          state.paused = false;
          resetGame(lvl);
          return;
        }
        if (state.trainAnim === 'departing') return;
        if (metroTrain && metroTrain.group) metroTrain.group.position.x = 0;
        state.targetLevel = lvl;
        try { LSset('zulmat_last_level', String(lvl)); } catch (e) {}
        requestAnimationFrame(() => ensureLevelBuilt(lvl));
        state.paused = false;
        elStationOv.classList.add('hidden');
        state.trainAnim = 'departing';
        state.trainTimer = 0;
        elInteractBtn.classList.remove('visible');
        Sound.trainDoor();
        setTimeout(() => { Sound.trainDepart(); Sound.playVoice('metro_depart_vox', 0.92, 9000); }, 520);
        const th = LEVEL_THEMES[lvl] || LEVEL_THEMES[0];
        showToast("Eshiklar yopilmoqda! Keyingi bekat: " + th.title);
      }

      window.__zulmatShowLevelLoading = function(titleStr) {
        const ov = document.getElementById('level-loading-overlay');
        const ttl = document.getElementById('lvl-load-title');
        const bar = document.getElementById('lvl-load-bar');
        const sub = document.getElementById('lvl-load-sub');
        if (!ov) return;
        if (ttl) ttl.textContent = titleStr || 'ZULMAT';
        if (bar) bar.style.width = '24%';
        if (sub) sub.textContent = window.__zulmatTr ? window.__zulmatTr('TAYYORLANMOQDA...', 'ENTERING SECTOR...', 'ВХОД В СЕКТОР...') : 'TAYYORLANMOQDA...';
        ov.classList.remove('hidden');
        state.paused = true;
        const t0 = Date.now();
        let maxPend = Math.max(1, window.__zulmatPendingGlbs || 0);
        clearInterval(window.__zulmatLoadPoll);
        window.__zulmatLoadPoll = setInterval(() => {
          const pend = window.__zulmatPendingGlbs || 0;
          if (pend > maxPend) maxPend = pend;
          const elapsed = Date.now() - t0;
          const realRatio = pend === 0 ? 1 : Math.max(0.15, (maxPend - pend) / maxPend);
          const pct = pend === 0 ? 100 : Math.min(96, Math.round(realRatio * 96));
          if (bar) bar.style.width = pct + '%';
          if ((pend === 0 && elapsed >= 600) || elapsed >= 15000) {
            clearInterval(window.__zulmatLoadPoll);
            if (bar) bar.style.width = '100%';
            try { renderer.compile(scene, camera); renderer.render(scene, camera); } catch (e) {}
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                ov.classList.add('hidden');
                if (state.started && !state.ended) state.paused = false;
              });
            });
          }
        }, 100);
      };

      function resetGame(lvl) {
        if (!state.started || !window.__zulmatShowLevelLoading) return _resetGameNow(lvl);
        if (window.__zulmatResetPending) return;
        window.__zulmatResetPending = true;
        if (lvl !== undefined) state.currentLevel = lvl;
        const th0 = LEVEL_THEMES[state.currentLevel] || LEVEL_THEMES[0];
        window.__zulmatShowLevelLoading(th0.title || ('LEVEL ' + state.currentLevel));
        requestAnimationFrame(() => requestAnimationFrame(() => {
          try { _resetGameNow(lvl); } finally { window.__zulmatResetPending = false; }
        }));
      }
      function _resetGameNow(lvl) {
        if (lvl !== undefined) state.currentLevel = lvl;
        setTimeout(() => Sound.playZoneBgm(state.zone), 60);
        const cur = state.currentLevel;
        ensureLevelBuilt(cur);
        try { renderer.compile(scene, camera); } catch (e) {}
        const th = LEVEL_THEMES[cur] || LEVEL_THEMES[0];
        if (state.started && window.__zulmatShowLevelLoading) window.__zulmatShowLevelLoading(th.title || ('LEVEL ' + cur));
        state.zone = ({ 1: 'level1', 2: 'level2', 37: 'level37', run: 'levelrun', fun: 'levelfun', 94: 'level94', 922: 'level922', 9: 'level9', 10: 'level10', 11: 'level11', end: 'levelend', 61: 'level61', 3: 'level3', 4: 'level4', 5: 'level5', 6: 'level6', 7: 'level7', 8: 'level8', 188: 'level188', 974: 'level974', 14: 'level14', 15: 'level15', 22: 'level22', 46: 'level46', manila: 'levelmanila', mirror: 'levelmirror', 33: 'level33', 36: 'level36', shady: 'levelshady', 3999: 'level3999' })[cur] || 'level0';
        metroLobbyGroup.visible = false;
        level0Group.visible = (cur === 0);
        level1Group.visible = (cur === 1);
        level2Group.visible = (cur === 2);
        level37Group.visible = (cur === 37);
        levelRunGroup.visible = (cur === 'run');
        levelFunGroup.visible = (cur === 'fun');
        level94Group.visible = (cur === 94);
        level922Group.visible = (cur === 922);
        level9Group.visible = (cur === 9);
        level10Group.visible = (cur === 10);
        level11Group.visible = (cur === 11);
        levelEndGroup.visible = (cur === 'end');
        level61Group.visible = (cur === 61);
        level3Group.visible = (cur === 3);
        level4Group.visible = (cur === 4);
        level5Group.visible = (cur === 5);
        level6Group.visible = (cur === 6);
        level7Group.visible = (cur === 7);
        level8Group.visible = (cur === 8);
        level188Group.visible = (cur === 188);
        level974Group.visible = (cur === 974);
        level3999Group.visible = (cur === 3999);
        level33Group.visible = (cur === 33);
        level36Group.visible = (cur === 36);
        levelShadyGroup.visible = (cur === 'shady');
        level14Group.visible = (cur === 14); level15Group.visible = (cur === 15); level22Group.visible = (cur === 22); level46Group.visible = (cur === 46); levelManilaGroup.visible = (cur === 'manila'); levelMirrorGroup.visible = (cur === 'mirror'); levelEndlessGroup.visible = (cur === 'endless50k');

        if (btnJump) btnJump.style.display = 'flex';
        setMonsterVariant(cur);
        if (cur === 0) { level0Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 1) { level1Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 2) { level2Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 37) { level37Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 'run') { levelRunGroup.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 11) { level11Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 'end') { levelEndGroup.add(monsterGroup); monsterGroup.visible = false; }
        else if (cur === 3) { level3Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 5) { level5Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 6) { level6Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 7) { level7Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 8) { level8Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 188) { level188Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 974) { level974Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 33) { level33Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 36) { level36Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 'shady') { levelShadyGroup.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 14) { level14Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 15) { level15Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 22) { level22Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 46) { level46Group.add(monsterGroup); monsterGroup.visible = true; }
        else if (cur === 'mirror') { levelMirrorGroup.add(monsterGroup); monsterGroup.visible = true; }
        else { monsterGroup.visible = false; }

        scene.background.setHex(th.fog);
        scene.fog.color.setHex(th.fog);
        scene.fog.density = th.fogDens;
        camera.far = (cur === 94) ? 420 : ((cur === 11 || cur === 10 || cur === 922 || cur === 37 || cur === 7) ? 260 : 140); camera.updateProjectionMatrix();
        hemiLight.color.setHex(th.hemiSky);
        hemiLight.groundColor.setHex(th.hemiGnd);
        // Distinct per-level lighting & atmosphere (no uniform dark override!)
        hemiLight.intensity = th.hemiInt;
        if (cur === 6 || cur === 8) {
          ambientLight.intensity = 0.025;
          hemiLight.intensity = 0.08;
        } else if (cur === 0 || cur === 'manila') {
          ambientLight.intensity = 0.14;
          hemiLight.intensity = Math.max(0.22, th.hemiInt * 0.72);
        } else if (cur === 37 || cur === 61 || cur === 94 || cur === 3999 || cur === 46) {
          ambientLight.intensity = cur === 37 ? 0.38 : 0.28;
        } else {
          ambientLight.intensity = 0.11;
          hemiLight.intensity = Math.min(th.hemiInt, 0.26);
        }
        state.ended = false;
        state.paused = false;
        showToast('SIGNAL TOPILDI // ' + th.title + ' — BU YERDAN CHIQISH YO\'LI BOR...');

        if (cur === 1) {
          state.pos.copy(l1Spawn);
          state.yaw = 0;
          state.l1Blackout = false;
          state.l1BlackoutTimer = 18;
          state.l1GensDone = 0;
          state.l1FuelHeld = 0;
          l1FuelCans.forEach((fc) => { fc.taken = false; fc.mesh.visible = true; });
          l1Generators.forEach((g, idx) => {
            g.active = false;
            g.needsFuel = (idx % 2 === 1);
            g.lampMat.color.setHex(0xef4444);
            g.light.color.setHex(0xef4444);
          });
          l1Exit.unlocked = true;
          if (l1Exit.doorPivot) l1Exit.doorPivot.rotation.y = 0;
          if (l1Exit.signMat) l1Exit.signMat.color.setHex( 0x22c55e);
          if (l1Exit.light) l1Exit.light.color.setHex( 0x22c55e);
        } else if (cur === 2) {
          state.pos.copy(l2Spawn);
          state.yaw = Math.PI * 0.75;
          state.l2BreakersDone = 0;
          state.l2SteamBurn = 0;
          l2Breakers.forEach((b) => { b.active = false; b.lMat.color.setHex(0xef4444); b.light.color.setHex(0xef4444); });
          l2Exit.unlocked = true;
          if (l2Exit.signMat) l2Exit.signMat.color.setHex( 0x22c55e);
          if (l2Exit.light) l2Exit.light.color.setHex( 0x22c55e);
        } else if (cur === 'fun') {
          state.pos.copy(lFunSpawn);
          state.yaw = 0;
          state.lFunTickets = 0;
          state.lFunMusicTimer = 0.8;
          state.lFunNoteIdx = 0;
          lFunGifts.forEach((g) => { g.opened = false; g.mesh.visible = true; });
          lFunExit.unlocked = true;
          if (lFunExit.signMat) lFunExit.signMat.color.setHex( 0x22c55e);
          if (lFunExit.light) lFunExit.light.color.setHex( 0x22c55e);
        } else if (cur === 94) {
          state.pos.copy(l94Spawn);
          state.yaw = 0;
          state.l94OrbsDone = 0;
          state.l94IsNight = false;
          state.l94CycleTimer = 60.0;
          state.l94InHouse = false;
          state.l94MusicTimer = 0.8;
          state.l94NoteIdx = 0;
          l94Orbs.forEach((o) => { o.collected = false; o.mesh.visible = true; });
          l94Exit.unlocked = true;
          if (l94Exit.portalMat) l94Exit.portalMat.color.setHex(0x334155);
          if (l94Exit.ringMat) l94Exit.ringMat.color.setHex(0xef4444);
          if (l94Exit.light) l94Exit.light.color.setHex( 0x22c55e);
          if (l94Exit.beam) l94Exit.beam.visible = false;
          if (l94SunMesh) l94SunMesh.material.color.setHex(0xfef08a);
          animationGroup.visible = false;
        } else if (cur === 922) {
          refreshL922Plaques();
          state.pos.set(4.8, 1.65, 0);
          state.yaw = Math.PI;
          state.pitch = 0;
          state.velY = 0;
          state.onGround = true;
          state.l922Floor = 0;
          state.l922PrevAng = 0;
          state.l922TotalAng = 0;
          state.l922Falling = false;
          state.l922FallWin = false;
          state.l922FallTimer = 0;
          showToast("Cheksiz Spiral Zina: Yuqoriga chiqib 94-qavatni toping va markaziy bo'shliqqa sakrang!");
        } else if (cur === 9) {
          state.pos.copy(l9Spawn); state.yaw = 0; state.l9FusesDone = 0;
          l9FuseBoxes.forEach((f) => { f.fixed = false; f.lMat.color.setHex(0xf59e0b); });
          l9Exit.unlocked = true;
          if (l9Exit.signMat) l9Exit.signMat.color.setHex( 0x22c55e);
          if (l9Exit.light) l9Exit.light.color.setHex( 0x22c55e);
          l9WatcherPos.set(-40, 0, -20);
          Sound.stopAllClips(); Sound.playLoopClip('rain', 0.34); Sound.playLoopClip('wind', 0.22);
        } else if (cur === 10) {
          state.pos.copy(l10Spawn); state.yaw = 0; state.l10RadiosDone = 0;
          l10Radios.forEach((r) => { r.active = false; r.lMat.color.setHex(0xf59e0b); });
          l10Exit.unlocked = true;
          if (l10Exit.signMat) l10Exit.signMat.color.setHex( 0x22c55e);
          if (l10Exit.light) l10Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips(); Sound.playLoopClip('breeze', 0.36);
        } else if (cur === 11) {
          state.pos.copy(l11Spawn); state.yaw = 0; state.l11CardsDone = 0;
          l11Cards.forEach((c) => { c.taken = false; c.mesh.visible = true; });
          l11Exit.unlocked = true;
          if (l11Exit.signMat) l11Exit.signMat.color.setHex( 0x22c55e);
          if (l11Exit.light) l11Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips(); Sound.playLoopClip('wind', 0.28);
        } else if (cur === 'end') {
          state.pos.copy(lEndSpawn); state.yaw = 0; state.lEndDisksDone = 0; state.lEndTrapActive = false;
          lEndDisks.forEach((d) => { d.taken = false; d.mesh.visible = true; });
          lEndExit.unlocked = true;
          if (lEndExit.signMat) lEndExit.signMat.color.setHex( 0x22c55e);
          if (lEndExit.light) lEndExit.light.color.setHex( 0x22c55e);
          document.getElementById('end-terminal-overlay').classList.add('hidden');
          Sound.stopAllClips(); Sound.playLoopClip('windchime', 0.2);
        } else if (cur === 3) {
          state.pos.copy(l3Spawn); state.yaw = 0; state.l3BreakersDone = 0; state.l3ShockCool = 0;
          l3Breakers.forEach((b) => { b.active = false; b.lMat.color.setHex(0x38bdf8); });
          l3Exit.unlocked = true; l3Exit.signMat.color.setHex( 0x22c55e); l3Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips();
        } else if (cur === 4) {
          state.pos.copy(l4Spawn); state.yaw = 0; state.l4BadgesDone = 0;
          l4Badges.forEach((b) => { b.taken = false; b.mesh.visible = true; });
          l4Exit.unlocked = true; l4Exit.signMat.color.setHex( 0x22c55e); l4Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips(); Sound.playLoopClip('windchime', 0.16);
        } else if (cur === 5) {
          state.pos.copy(l5Spawn); state.yaw = 0; state.l5KeysDone = 0;
          l5Keys.forEach((k) => { k.taken = false; k.mesh.visible = true; });
          l5RoomDoors.forEach((rd) => { rd.open = false; rd.hinge.rotation.y = 0; });
          l5Exit.unlocked = true; l5Exit.signMat.color.setHex( 0x22c55e); l5Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips(); Sound.playLoopClip('windchime', 0.22);
        } else if (cur === 6) {
          state.pos.copy(l6Spawn); state.yaw = 0; state.l6SwitchesDone = 0;
          l6Switches.forEach((s) => { s.active = false; s.lMat.color.setHex(0xef4444); s.light.color.setHex(0xef4444); });
          l6Exit.unlocked = true; l6Exit.signMat.color.setHex( 0x22c55e); l6Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l6MonsterSpawn);
          ambientLight.intensity = 0.015; hemiLight.intensity = 0.05; scene.fog.density = 0.088;
          Sound.stopAllClips();
        } else if (cur === 7) {
          state.pos.copy(l7Spawn); state.yaw = 0; state.l7BuoysDone = 0;
          l7Buoys.forEach((b) => { b.active = false; b.lMat.color.setHex(0x38bdf8); b.light.color.setHex(0x38bdf8); });
          l7Exit.unlocked = true; l7Exit.signMat.color.setHex( 0x22c55e); l7Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l7MonsterSpawn);
          Sound.stopAllClips();
        } else if (cur === 8) {
          state.pos.copy(l8Spawn); state.yaw = 0; state.l8CrystalsDone = 0;
          l8Crystals.forEach((c) => { c.taken = false; c.mesh.visible = true; });
          l8Exit.unlocked = true; l8Exit.signMat.color.setHex( 0x22c55e); l8Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l8MonsterSpawn);
          Sound.stopAllClips();
        } else if (cur === 188) {
          state.pos.copy(l188Spawn); state.yaw = 0; state.l188TvsDone = 0;
          l188Tvs.forEach((t) => { t.taken = false; t.mesh.visible = true; });
          l188Exit.unlocked = true; l188Exit.signMat.color.setHex( 0x22c55e); l188Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l188MonsterSpawn);
          Sound.stopAllClips();
        } else if (cur === 974) {
          state.pos.copy(l974Spawn); state.yaw = 0; state.l974ItemsDone = 0;
          l974Items.forEach((it) => { it.taken = false; it.mesh.visible = true; });
          l974Exit.unlocked = true; l974Exit.signMat.color.setHex( 0x22c55e); l974Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l974MonsterSpawn);
          Sound.stopAllClips();
        } else if (cur === 33) {
          state.pos.copy(l33Spawn); state.yaw = 0; state.l33NodesDone = 0;
          l33Nodes.forEach((n) => { n.done = false; n.lMat.color.setHex(0x2dd4bf); n.light.color.setHex(0x2dd4bf); });
          l33Exit.unlocked = true; l33Exit.signMat.color.setHex( 0x22c55e); l33Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l33MonsterSpawn); Sound.stopAllClips();
        } else if (cur === 36) {
          state.pos.copy(l36Spawn); state.yaw = 0; state.l36TicketsDone = 0;
          l36Tickets.forEach((t) => { t.taken = false; t.mesh.visible = true; });
          l36Exit.unlocked = true; l36Exit.signMat.color.setHex( 0x22c55e); l36Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l36MonsterSpawn); Sound.stopAllClips();
        } else if (cur === 'shady') {
          state.pos.copy(lShadySpawn); state.yaw = 0; state.lShadyDone = 0;
          lShadyAnomalies.forEach((a) => { a.taken = false; a.mesh.visible = true; });
          lShadyExit.unlocked = true; lShadyExit.signMat.color.setHex( 0x22c55e); lShadyExit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(lShadyMonsterSpawn); Sound.stopAllClips();
        } else if (cur === 14) {
          state.pos.copy(l14Spawn); state.yaw = 0; state.l14Done = 0;
          l14Nodes.forEach((n) => { n.done = false; n.lMat.color.setHex(0xf87171); n.light.color.setHex(0xef4444); });
          l14Exit.unlocked = true; l14Exit.signMat.color.setHex( 0x22c55e); l14Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l14MonsterSpawn); Sound.stopAllClips();
        } else if (cur === 15) {
          state.pos.copy(l15Spawn); state.yaw = 0; state.l15Done = 0;
          l15Cores.forEach((c) => { c.done = false; c.lMat.color.setHex(0x22d3ee); c.light.color.setHex(0x22d3ee); });
          l15Exit.unlocked = true; l15Exit.signMat.color.setHex( 0x22c55e); l15Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l15MonsterSpawn); Sound.stopAllClips();
        } else if (cur === 22) {
          state.pos.copy(l22Spawn); state.yaw = 0; state.l22Done = 0;
          l22Switches.forEach((s) => { s.active = false; s.lMat.color.setHex(0xfacc15); s.light.color.setHex(0xfacc15); });
          l22Exit.unlocked = true; l22Exit.signMat.color.setHex( 0x22c55e); l22Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l22MonsterSpawn); Sound.stopAllClips();
        } else if (cur === 46) {
          state.pos.copy(l46Spawn); state.yaw = 0; state.l46Done = 0;
          l46Obelisks.forEach((o) => { o.active = false; o.lMat.color.setHex(0x38bdf8); o.light.color.setHex(0x38bdf8); });
          l46Exit.unlocked = true; l46Exit.signMat.color.setHex( 0x22c55e); l46Exit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(l46MonsterSpawn); Sound.stopAllClips(); Sound.playSfx('desert_wind', 0.45);
        } else if (cur === 'manila') {
          state.pos.copy(lManilaSpawn); state.yaw = 0; state.lManilaDone = 0;
          lManilaFiles.forEach((f) => { f.taken = false; f.mesh.visible = true; });
          lManilaExit.unlocked = true; lManilaExit.signMat.color.setHex( 0x22c55e); lManilaExit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips();
        } else if (cur === 'mirror') {
          state.pos.copy(lMirrorSpawn); state.yaw = 0; state.lMirrorDone = 0;
          lMirrorShards.forEach((s) => { s.taken = false; s.mesh.visible = true; });
          lMirrorExit.unlocked = true; lMirrorExit.signMat.color.setHex( 0x22c55e); lMirrorExit.light.color.setHex( 0x22c55e);
          state.monsterPos.copy(lMirrorMonsterSpawn); Sound.stopAllClips();
        } else if (cur === 3999) {
          state.pos.copy(l3999Spawn); state.yaw = 0; state.l3999TasksDone = 0;
          l3999Tasks.forEach((t) => { t.done = false; t.lMat.color.setHex(0x38bdf8); t.light.color.setHex(0x38bdf8); });
          l3999Exit.unlocked = true; l3999Exit.signMat.color.setHex( 0x22c55e); l3999Exit.light.color.setHex( 0x22c55e);
          Sound.stopAllClips();
        } else if (cur === 61) {
          state.pos.copy(l61Spawn); state.yaw = 0; state.l61SnacksDone = 0;
          l61Counters.forEach((c) => { c.used = false; });
          Sound.stopAllClips(); Sound.playClip('musicBox', 0.22);
        } else if (cur === 'run') {
          state.pos.copy(lRunSpawn);
          state.yaw = 0;
          state.lRunAlarmTimer = 0;
          Sound.alarm();
        } else if (cur === 37) {
          state.pos.copy(l37Spawn);
          state.yaw = 0;
          state.velY = 0;
          state.onGround = true;
          state.pebbles = 1;
          state.splashAlertTimer = 0;
          state.wasInWater = false;
          state.lastSplashPos.copy(l37MonsterSpawn);
          l37Platforms.forEach((p) => {
            p.x = p.baseX;
            p.topY = p.baseTopY;
            p.sinking = false;
            p.sinkTimer = 0;
            p.mesh.position.set(p.x, p.topY - p.h / 2, p.z);
          });
          l37Pebbles.forEach((pb) => { pb.taken = false; pb.mesh.visible = true; });
          state.l37SwitchesDone = 0;
          l37Switches.forEach((sw) => { sw.active = false; sw.orbMat.color.setHex(0xef4444); sw.light.color.setHex(0xef4444); });
          l37Exit.unlocked = true;
          if (l37Exit.portalMat) l37Exit.portalMat.color.setHex(0xef4444);
        } else {
          state.pos.copy(spawnPos);
          state.yaw = -Math.PI / 2;
          // Generate fresh 4-digit security PIN for Level 0 Exit Keypad!
          state.l0Pin = String(1000 + Math.floor(Math.random() * 8999));
          state.l0PinEntered = '';
          state.l0PinUnlocked = false;
          document.getElementById('keypad-overlay').classList.add('hidden');
        }
        state.pitch = 0;
        state.battery = 100;
        state.stamina = 100;
        state.flashOn = true;
        state.sprinting = false;
        state.hiding = false;
        if (state.hideLocker && state.hideLocker.mesh) state.hideLocker.mesh.visible = true;
        state.hideLocker = null;
        state.keysCollected = 0;
        state.elapsed = 0;
        if (state.currentLevel === 1) state.monsterPos.copy(l1MonsterSpawn);
        else if (state.currentLevel === 2) state.monsterPos.copy(l2MonsterSpawn);
        else if (state.currentLevel === 37) state.monsterPos.copy(l37MonsterSpawn);
        else if (state.currentLevel === 'fun') state.monsterPos.copy(lFunMonsterSpawn);
        else if (state.currentLevel === 94) state.monsterPos.copy(l94MonsterSpawn);
        else if (state.currentLevel === 11) state.monsterPos.copy(l11MonsterSpawn);
        else if (state.currentLevel === 'end') state.monsterPos.copy(lEndMonsterSpawn);
        else if (state.currentLevel === 3) state.monsterPos.copy(l3MonsterSpawn);
        else if (state.currentLevel === 5) state.monsterPos.copy(l5MonsterSpawn);
        else if (state.currentLevel === 'run') state.monsterPos.set(0, 0, 14);
        else state.monsterPos.copy(monsterSpawn);
        state.monsterChasing = false;
        pickMonsterPatrolTarget();

        keysList.forEach((k) => { k.collected = false; k.mesh.visible = true; });
        batteries.forEach((b) => { b.collected = false; b.mesh.visible = true; });
        exitInfo.unlocked = true;
        if (exitInfo.doorPivot) exitInfo.doorPivot.rotation.y = 0;
        if (exitInfo.signMat) exitInfo.signMat.color.setHex(cur === 0 ? 0x22c55e : 0xef4444);
        if (exitInfo.portalMat) exitInfo.portalMat.color.setHex(cur === 0 ? 0x16a34a : 0x181c24);
        if (exitInfo.light) exitInfo.light.color.setHex(cur === 0 ? 0x22c55e : 0xef4444);
        elInteractBtn.style.display = '';
        elInteractBtn.classList.remove('visible');
        elLockerOv.classList.remove('active');
        elJumpFlash.classList.remove('active');
        elKillSlashes.classList.remove('active');
        state.killing = false;
        state.killTimer = 0;
        state.killSlash2 = false;
        state.growlTimer = 2.0;
        state.mStepTimer = 0;
        camera.rotation.z = 0;
        elDangerVig.style.opacity = '0';
        elEndOv.classList.add('hidden');
        elSetOv.classList.add('hidden');
        btnFlash.classList.add('on');
        elHudObj.textContent = state.currentLevel === 1
          ? 'Level 1 • Generatorlar: 0 / 6'
          : (state.currentLevel === 2
            ? 'Level 2 • Uzgich: 0/7 • #1 QIZIL'
            : (state.currentLevel === 37
              ? "DON'T SPLASH • QURUQ JOYDA YURING!"
              : (state.currentLevel === 'fun'
                ? 'Level Fun =) • Chiptalar: 0 / 8'
                : (state.currentLevel === 922
                  ? 'Level 922... • Qavat: 0 • 94-qavatni qidiring!'
                  : (state.currentLevel === 94
                  ? 'Level 94 • KUNDUZ (60s) • Chiqishni toping'
                  : (state.currentLevel === 'run'
                ? 'LEVEL ! • YUGURING! 600m'
                : 'Level 0 • Chiqish eshigini toping'))))));
      }

      // --- Controls: Keyboard, Mouse Drag, Touch Camera Drag & Floating Dynamic Joystick ---
      const keys = {};
      window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'KeyF' && !e.repeat) toggleFlashlight();
        if (e.code === 'KeyE' && !e.repeat) triggerInteract();
        if (e.code === 'Space' && !e.repeat) triggerJump();
        if (e.code === 'KeyQ' && !e.repeat) placeFloorMark();
        if (e.code === 'KeyR' && !e.repeat && state.started) resetGame();
      });
      window.addEventListener('keyup', (e) => { keys[e.code] = false; });

      function toggleFlashlight() {
        if (!state.started || state.paused || state.ended || !state.hasFlashlight) return;
        Sound.init();
        if (state.battery <= 0) {
          state.flashOn = false;
          btnFlash.classList.remove('on');
          showToast('Fonar batareyasi tugagan — yashil batareya toping!', true);
          return;
        }
        state.flashOn = !state.flashOn;
        Sound.click();
        btnFlash.classList.toggle('on', state.flashOn);
      }

      let nearestLocker = null;
      let nearExit = false;
      let nearMetroReturn = false;
      let nearMetroTrain = false;
      let nearestL1Gen = null;
      let nearestL37Valve = null;
      let nearestL2Breaker = null;
      let nearestFunGift = null;

      function triggerInteract() {
        if (state.started && !state.paused && !state.ended && !state.killing && state.nearStrangeDoor) {
          const ld = state.nearStrangeDoor;
          state.nearStrangeDoor = null;
          Sound.trainDoor();
          if (ld.isFake || ld.destLvl === null) {
            showToast("BU ESHIK ORTIDA FAQAT BO'SH DEVOR BOR... HECH QAYERGA OLIB BORMAYDI.", true);
            return;
          }
          showToast("ESHIKDAN O'TDINGIZ... BU JOY BOSHQA DUNYO!", true);
          setTimeout(() => { resetGame(ld.destLvl); }, 550);
          return;
        }
        if (!state.started || state.paused || state.ended) return;
        Sound.init();
        if (state.hiding) {
          if (state.hideLocker && state.hideLocker.mesh) state.hideLocker.mesh.visible = true;
          state.hiding = false;
          state.hideLocker = null;
          elLockerOv.classList.remove('active');
          Sound.locker();
          showToast('Shkafdan chiqdingiz.');
          return;
        }
        if (state.zone === 'metro_lobby') {
          if (state.trainAnim !== 'parked') return;
          if (nearMetroTrain) {
            startTrainDeparture(getNextCampaignLevel());
            return;
          }
          if (nearMetroReturn) {
            startTrainDeparture(0);
            return;
          }
          return;
        }
        if (state.zone === 'level1') {
          if (nearestL1Gen && !nearestL1Gen.active) {
            if (nearestL1Gen.needsFuel) {
              if (state.l1FuelHeld <= 0) {
                Sound.click();
                showToast("Bu generatorda benzin yo'q! Avval qizil Benzin kanistrasini toping!", true);
                return;
              }
              state.l1FuelHeld -= 1;
              nearestL1Gen.needsFuel = false;
            }
            nearestL1Gen.active = true;
            nearestL1Gen.lampMat.color.setHex(0x22c55e);
            nearestL1Gen.light.color.setHex(0x22c55e);
            state.l1GensDone += 1;
            Sound.generatorStart();
            // Loud diesel startup noise alerts & draws the Stalker toward this generator!
            state.monsterTarget = new THREE.Vector3(nearestL1Gen.x, 0, nearestL1Gen.z);
            Sound.monsterGrowl(0.85);
            if (state.l1GensDone >= l1Generators.length) {
              l1Exit.unlocked = true;
              state.l1Blackout = false;
              if (l1Exit.signMat) l1Exit.signMat.color.setHex(0x22c55e);
              if (l1Exit.light) l1Exit.light.color.setHex(0x22c55e);
              elHudObj.textContent = 'CHIQISH OCHILDI! GARAGDAN QOCHING!';
              showToast("6/6 generator yoqildi! Chiroqlar tiklandi — Yashil EXIT eshigiga yuguring!");
            } else {
              elHudObj.textContent = 'Level 1 • Generatorlar: ' + state.l1GensDone + ' / 6';
              showToast('Generator yoqildi! (' + state.l1GensDone + '/6)');
            }
            return;
          }
          if (nearExit && l1Exit.unlocked) {
            enterMetroLobby(true);
            return;
          }
        }
        if (state.zone === 'level3') {
          for (let i = 0; i < l3Breakers.length; i++) {
            const b = l3Breakers[i];
            if (!b.active && Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 2.6) {
              b.active = true; b.lMat.color.setHex(0x22c55e); state.l3BreakersDone++;
              Sound.pickup();
              if (state.l3BreakersDone >= 8) {
                l3Exit.unlocked = true; l3Exit.signMat.color.setHex(0x22c55e); l3Exit.light.color.setHex(0x22c55e);
                showToast("8/8 elektr uzgichi yoqildi! Lift eshigi ochildi!");
              } else showToast("Elektr uzgichi yoqildi! (" + state.l3BreakersDone + "/8)");
              return;
            }
          }
          if (l3Exit.unlocked && Math.hypot(state.pos.x - l3Exit.x, state.pos.z - l3Exit.z) < 3.2) { enterMetroLobby(true); return; }
          if (window._nearLoreNote && window.__zulmatOpenLoreNote) {
          window.__zulmatOpenLoreNote(window._nearLoreNote);
          window._nearLoreNote = null;
          return;
        }
        if (nearestLocker) { toggleHideLocker(); return; }
          return;
        }
        if (state.zone === 'level4') {
          for (let i = 0; i < l4Badges.length; i++) {
            const b = l4Badges[i];
            if (!b.taken && Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 2.5) {
              b.taken = true; b.mesh.visible = false; state.l4BadgesDone++;
              Sound.pickup();
              if (state.l4BadgesDone >= 6) {
                l4Exit.unlocked = true; l4Exit.signMat.color.setHex(0x22c55e); l4Exit.light.color.setHex(0x22c55e);
                showToast("6/6 ofis ruxsatnomasi topildi! Level 5 lifti ochildi!");
              } else showToast("Ofis ruxsatnomasi olindi! (" + state.l4BadgesDone + "/6)");
              return;
            }
          }
          for (let i = 0; i < l4Coolers.length; i++) {
            if (Math.hypot(state.pos.x - l4Coolers[i].x, state.pos.z - l4Coolers[i].z) < 2.5) {
              state.battery = 100; state.stamina = 100; Sound.almondDrink();
              showToast("Bodom suvi ichildi! Fonar va kuch 100% tiklandi!");
              return;
            }
          }
          if (l4Exit.unlocked && Math.hypot(state.pos.x - l4Exit.x, state.pos.z - l4Exit.z) < 3.2) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level5') {
          for (let i = 0; i < l5Keys.length; i++) {
            const k = l5Keys[i];
            if (!k.taken && Math.hypot(state.pos.x - k.x, state.pos.z - k.z) < 2.5) {
              k.taken = true; k.mesh.visible = false; state.l5KeysDone++;
              Sound.pickup();
              if (state.l5KeysDone >= 7) {
                l5Exit.unlocked = true; l5Exit.signMat.color.setHex(0x22c55e); l5Exit.light.color.setHex(0x22c55e);
                showToast("7/7 oltin kalit topildi! Mehmonxona lifti ochildi!");
              } else showToast("Mehmonxona kaliti topildi! (" + state.l5KeysDone + "/7)");
              return;
            }
          }
          for (let i = 0; i < l5RoomDoors.length; i++) {
            const rd = l5RoomDoors[i];
            if (Math.hypot(state.pos.x - rd.x, state.pos.z - rd.z) < 2.8) {
              rd.open = !rd.open;
              Sound.trainDoor();
              showToast("Xona " + rd.num + (rd.open ? " ochildi" : " yopildi"));
              return;
            }
          }
          if (l5Exit.unlocked && Math.hypot(state.pos.x - l5Exit.x, state.pos.z - l5Exit.z) < 3.4) { enterMetroLobby(true); return; }
          if (nearestLocker) { toggleHideLocker(); return; }
          return;
        }
        if (state.zone === 'level6') {
          for (let i = 0; i < l6Switches.length; i++) {
            const s = l6Switches[i];
            if (!s.active && Math.hypot(state.pos.x - s.x, state.pos.z - s.z) < 2.8) {
              s.active = true; s.lMat.color.setHex(0x22c55e); s.light.color.setHex(0x22c55e); state.l6SwitchesDone++;
              Sound.breaker();
              if (state.l6SwitchesDone >= 6) {
                l6Exit.unlocked = true; l6Exit.signMat.color.setHex(0x22c55e); l6Exit.light.color.setHex(0x22c55e);
                showToast("6/6 qizil tugma yoqildi! Level 6 chiqish eshigi ochildi!");
              } else showToast("Tugma yoqildi! (" + state.l6SwitchesDone + "/6)");
              return;
            }
          }
          if (l6Exit.unlocked && Math.hypot(state.pos.x - l6Exit.x, state.pos.z - l6Exit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level7') {
          for (let i = 0; i < l7Buoys.length; i++) {
            const b = l7Buoys[i];
            if (!b.active && Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 3.2) {
              b.active = true; b.lMat.color.setHex(0x22c55e); b.light.color.setHex(0x22c55e); state.l7BuoysDone++;
              Sound.pickup();
              if (state.l7BuoysDone >= 5) {
                l7Exit.unlocked = true; l7Exit.signMat.color.setHex(0x22c55e); l7Exit.light.color.setHex(0x22c55e);
                showToast("5/5 mayoq yoqildi! Okean mayog'i chiqishi ochildi!");
              } else showToast("Mayoq yoqildi! (" + state.l7BuoysDone + "/5)");
              return;
            }
          }
          if (l7Exit.unlocked && Math.hypot(state.pos.x - l7Exit.x, state.pos.z - l7Exit.z) < 3.8) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level8') {
          for (let i = 0; i < l8Crystals.length; i++) {
            const c = l8Crystals[i];
            if (!c.taken && Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 2.8) {
              c.taken = true; c.mesh.visible = false; state.l8CrystalsDone++;
              Sound.pickup();
              if (state.l8CrystalsDone >= 6) {
                l8Exit.unlocked = true; l8Exit.signMat.color.setHex(0x22c55e); l8Exit.light.color.setHex(0x22c55e);
                showToast("6/6 kristall yig'ildi! G'or chiqishi ochildi!");
              } else showToast("Kristall olindi! (" + state.l8CrystalsDone + "/6)");
              return;
            }
          }
          if (l8Exit.unlocked && Math.hypot(state.pos.x - l8Exit.x, state.pos.z - l8Exit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level188') {
          for (let i = 0; i < l188Tvs.length; i++) {
            const t = l188Tvs[i];
            if (!t.taken && Math.hypot(state.pos.x - t.x, state.pos.z - t.z) < 3.0) {
              t.taken = true; t.mesh.visible = false; state.l188TvsDone++; Sound.pickup();
              if (state.l188TvsDone >= 4) {
                l188Exit.unlocked = true; l188Exit.signMat.color.setHex(0x22c55e); l188Exit.light.color.setHex(0x22c55e);
                showToast("4/4 CRT televizor topildi! Lift ochildi!");
              } else showToast("Televizor olindi! (" + state.l188TvsDone + "/4)");
              return;
            }
          }
          if (l188Exit.unlocked && Math.hypot(state.pos.x - l188Exit.x, state.pos.z - l188Exit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level974') {
          for (let i = 0; i < l974Items.length; i++) {
            const it = l974Items[i];
            if (!it.taken && Math.hypot(state.pos.x - it.x, state.pos.z - it.z) < 2.8) {
              it.taken = true; it.mesh.visible = false; state.l974ItemsDone++; Sound.pickup();
              if (state.l974ItemsDone >= 6) {
                l974Exit.unlocked = true; l974Exit.signMat.color.setHex(0x22c55e); l974Exit.light.color.setHex(0x22c55e);
                showToast("6/6 yulduzcha yig'ildi! Pushti eshik ochildi!");
              } else showToast("Yulduzcha topildi! (" + state.l974ItemsDone + "/6)");
              return;
            }
          }
          if (l974Exit.unlocked && Math.hypot(state.pos.x - l974Exit.x, state.pos.z - l974Exit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level3999') {
          for (let i = 0; i < l3999Tasks.length; i++) {
            const t = l3999Tasks[i];
            if (!t.done && Math.hypot(state.pos.x - t.x, state.pos.z - t.z) < 3.0) {
              t.done = true; t.lMat.color.setHex(0x22c55e); t.light.color.setHex(0x22c55e); state.l3999TasksDone++; Sound.crtBoot();
              if (state.l3999TasksDone >= 6) {
                l3999Exit.unlocked = true; l3999Exit.signMat.color.setHex(0x22c55e); l3999Exit.light.color.setHex(0x22c55e);
                showToast("6/6 arkada topshirig'i bajarildi! Haqiqiy chiqish ochildi!");
              } else showToast("Topshiriq bajarildi! (" + state.l3999TasksDone + "/6)");
              return;
            }
          }
          if (l3999Exit.unlocked && Math.hypot(state.pos.x - l3999Exit.x, state.pos.z - l3999Exit.z) < 3.6) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level33') {
          for (let i = 0; i < l33Nodes.length; i++) {
            const n = l33Nodes[i];
            if (!n.done && Math.hypot(state.pos.x - n.x, state.pos.z - n.z) < 3.0) {
              n.done = true; n.lMat.color.setHex(0x22c55e); n.light.color.setHex(0x22c55e); state.l33NodesDone++; Sound.crtBoot();
              if (state.l33NodesDone >= 6) {
                l33Exit.unlocked = true; l33Exit.signMat.color.setHex(0x22c55e); l33Exit.light.color.setHex(0x22c55e);
                showToast("6/6 kassa terminali yoqildi! Savdo markazi chiqishi ochildi!");
              } else showToast("Terminal yoqildi! (" + state.l33NodesDone + "/6)");
              return;
            }
          }
          if (l33Exit.unlocked && Math.hypot(state.pos.x - l33Exit.x, state.pos.z - l33Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level36') {
          for (let i = 0; i < l36Tickets.length; i++) {
            const t = l36Tickets[i];
            if (!t.taken && Math.hypot(state.pos.x - t.x, state.pos.z - t.z) < 2.8) {
              t.taken = true; t.mesh.visible = false; state.l36TicketsDone++; Sound.pickup();
              if (state.l36TicketsDone >= 5) {
                l36Exit.unlocked = true; l36Exit.signMat.color.setHex(0x22c55e); l36Exit.light.color.setHex(0x22c55e);
                showToast("5/5 chipta topildi! Aeroport darvozasi ochildi!");
              } else showToast("Chipta olindi! (" + state.l36TicketsDone + "/5)");
              return;
            }
          }
          if (l36Exit.unlocked && Math.hypot(state.pos.x - l36Exit.x, state.pos.z - l36Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'levelshady') {
          for (let i = 0; i < lShadyAnomalies.length; i++) {
            const a = lShadyAnomalies[i];
            if (!a.taken && Math.hypot(state.pos.x - a.x, state.pos.z - a.z) < 2.8) {
              a.taken = true; a.mesh.visible = false; state.lShadyDone++; Sound.pickup();
              if (state.lShadyDone >= 5) {
                lShadyExit.unlocked = true; lShadyExit.signMat.color.setHex(0x22c55e); lShadyExit.light.color.setHex(0x22c55e);
                showToast("5/5 kulrang anomaliya olindi! Chiqish ochildi!");
              } else showToast("Anomaliya olindi! (" + state.lShadyDone + "/5)");
              return;
            }
          }
          if (lShadyExit.unlocked && Math.hypot(state.pos.x - lShadyExit.x, state.pos.z - lShadyExit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level14') {
          for (let i = 0; i < l14Nodes.length; i++) {
            const n = l14Nodes[i];
            if (!n.done && Math.hypot(state.pos.x - n.x, state.pos.z - n.z) < 3.0) {
              n.done = true; n.lMat.color.setHex(0x22c55e); n.light.color.setHex(0x22c55e); state.l14Done++; Sound.pickup();
              if (state.l14Done >= 5) { l14Exit.unlocked = true; l14Exit.signMat.color.setHex(0x22c55e); l14Exit.light.color.setHex(0x22c55e); showToast("5/5 mayoq yoqildi! Level 14 chiqishi ochildi!"); }
              else showToast("Mayoq yoqildi! (" + state.l14Done + "/5)");
              return;
            }
          }
          if (l14Exit.unlocked && Math.hypot(state.pos.x - l14Exit.x, state.pos.z - l14Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level15') {
          for (let i = 0; i < l15Cores.length; i++) {
            const c = l15Cores[i];
            if (!c.done && Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 3.0) {
              c.done = true; c.lMat.color.setHex(0x22c55e); c.light.color.setHex(0x22c55e); state.l15Done++; Sound.crtBoot();
              if (state.l15Done >= 5) { l15Exit.unlocked = true; l15Exit.signMat.color.setHex(0x22c55e); l15Exit.light.color.setHex(0x22c55e); showToast("5/5 yadro yoqildi! Koinot eshigi ochildi!"); }
              else showToast("Energiya yadrosi! (" + state.l15Done + "/5)");
              return;
            }
          }
          if (l15Exit.unlocked && Math.hypot(state.pos.x - l15Exit.x, state.pos.z - l15Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level22') {
          for (let i = 0; i < l22Switches.length; i++) {
            const s = l22Switches[i];
            if (!s.active && Math.hypot(state.pos.x - s.x, state.pos.z - s.z) < 3.0) {
              s.active = true; s.lMat.color.setHex(0x22c55e); s.light.color.setHex(0x22c55e); state.l22Done++; Sound.breaker();
              if (state.l22Done >= 6) { l22Exit.unlocked = true; l22Exit.signMat.color.setHex(0x22c55e); l22Exit.light.color.setHex(0x22c55e); showToast("6/6 quti yoqildi! Garaj chiqishi ochildi!"); }
              else showToast("Elektr qutisi! (" + state.l22Done + "/6)");
              return;
            }
          }
          if (l22Exit.unlocked && Math.hypot(state.pos.x - l22Exit.x, state.pos.z - l22Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level46') {
          for (let i = 0; i < l46Obelisks.length; i++) {
            const o = l46Obelisks[i];
            if (!o.active && Math.hypot(state.pos.x - o.x, state.pos.z - o.z) < 3.2) {
              o.active = true; o.lMat.color.setHex(0x22c55e); o.light.color.setHex(0x22c55e); state.l46Done++; Sound.pickup();
              if (state.l46Done >= 5) { l46Exit.unlocked = true; l46Exit.signMat.color.setHex(0x22c55e); l46Exit.light.color.setHex(0x22c55e); showToast("5/5 obelisk yoqildi! Sahro eshigi ochildi!"); }
              else showToast("Obelisk yoqildi! (" + state.l46Done + "/5)");
              return;
            }
          }
          if (l46Exit.unlocked && Math.hypot(state.pos.x - l46Exit.x, state.pos.z - l46Exit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'levelmanila') {
          for (let i = 0; i < lManilaFiles.length; i++) {
            const f = lManilaFiles[i];
            if (!f.taken && Math.hypot(state.pos.x - f.x, state.pos.z - f.z) < 2.8) {
              f.taken = true; f.mesh.visible = false; state.lManilaDone++; Sound.pickup();
              if (state.lManilaDone >= 4) { lManilaExit.unlocked = true; lManilaExit.signMat.color.setHex(0x22c55e); lManilaExit.light.color.setHex(0x22c55e); showToast("4/4 hujjat o'qildi! Manila eshigi ochildi!"); }
              else showToast("M.E.G. hujjati! (" + state.lManilaDone + "/4)");
              return;
            }
          }
          if (lManilaExit.unlocked && Math.hypot(state.pos.x - lManilaExit.x, state.pos.z - lManilaExit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'levelmirror') {
          for (let i = 0; i < lMirrorShards.length; i++) {
            const s = lMirrorShards[i];
            if (!s.taken && Math.hypot(state.pos.x - s.x, state.pos.z - s.z) < 3.0) {
              s.taken = true; s.mesh.visible = false; state.lMirrorDone++; if (!Sound.playSfx('glass_shatter', 0.72)) Sound.pickup();
              if (state.lMirrorDone >= 5) { lMirrorExit.unlocked = true; lMirrorExit.signMat.color.setHex(0x22c55e); lMirrorExit.light.color.setHex(0x22c55e); showToast("5/5 parcha yig'ildi! Oynalar chiqishi ochildi!"); }
              else showToast("Reallik parchasi! (" + state.lMirrorDone + "/5)");
              return;
            }
          }
          if (lMirrorExit.unlocked && Math.hypot(state.pos.x - lMirrorExit.x, state.pos.z - lMirrorExit.z) < 3.5) { enterMetroLobby(true); return; }
          return;
        }

        if (state.zone === 'level9') {
          for (let i = 0; i < l9FuseBoxes.length; i++) {
            const f = l9FuseBoxes[i];
            if (!f.fixed && Math.hypot(state.pos.x - f.x, state.pos.z - f.z) < 2.8) {
              f.fixed = true; f.lMat.color.setHex(0x22c55e); state.l9FusesDone++;
              Sound.pickup();
              if (state.l9FusesDone >= 6) {
                l9Exit.unlocked = true; l9Exit.signMat.color.setHex(0x22c55e); l9Exit.light.color.setHex(0x22c55e);
                showToast("Barcha 6 elektr qutisi tuzatildi! Shimoldagi Metro darvozasi ochildi!");
              } else showToast("Elektr qutisi tuzatildi! (" + state.l9FusesDone + "/6)");
              return;
            }
          }
          if (l9Exit.unlocked && Math.hypot(state.pos.x - l9Exit.x, state.pos.z - l9Exit.z) < 3.6) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level10') {
          for (let i = 0; i < l10Radios.length; i++) {
            const r = l10Radios[i];
            if (!r.active && Math.hypot(state.pos.x - r.x, state.pos.z - r.z) < 3.2) {
              r.active = true; r.lMat.color.setHex(0x22c55e); state.l10RadiosDone++;
              Sound.pickup();
              if (state.l10RadiosDone >= 5) {
                l10Exit.unlocked = true; l10Exit.signMat.color.setHex(0x22c55e); l10Exit.light.color.setHex(0x22c55e);
                showToast("Barcha 5 radio minora yoqildi! Shimoldagi yerto'la lyuki ochildi!");
              } else showToast("Radio minora sozlandi! (" + state.l10RadiosDone + "/5)");
              return;
            }
          }
          if (l10Exit.unlocked && Math.hypot(state.pos.x - l10Exit.x, state.pos.z - l10Exit.z) < 3.8) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level11') {
          for (let i = 0; i < l11Cards.length; i++) {
            const c = l11Cards[i];
            if (!c.taken && Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 2.8) {
              c.taken = true; c.mesh.visible = false; state.l11CardsDone++;
              Sound.pickup();
              if (state.l11CardsDone >= 6) {
                l11Exit.unlocked = true; l11Exit.signMat.color.setHex(0x22c55e); l11Exit.light.color.setHex(0x22c55e);
                showToast("6/6 Metro kartasi topildi! Shimoldagi Grand Central bekatiga boring!");
              } else showToast("Metro kartasi olindi! (" + state.l11CardsDone + "/6)");
              return;
            }
          }
          if (l11Exit.unlocked && Math.hypot(state.pos.x - l11Exit.x, state.pos.z - l11Exit.z) < 4.0) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'levelend') {
          for (let i = 0; i < lEndDisks.length; i++) {
            const d = lEndDisks[i];
            if (!d.taken && Math.hypot(state.pos.x - d.x, state.pos.z - d.z) < 2.6) {
              d.taken = true; d.mesh.visible = false; state.lEndDisksDone++;
              Sound.pickup();
              showToast(state.lEndDisksDone >= 4 ? "4/4 disketa topildi! Markazdagi kompyuter terminalini oching!" : ("Disketa topildi! (" + state.lEndDisksDone + "/4)"));
              return;
            }
          }
          if (Math.hypot(state.pos.x - lEndTerminal.x, state.pos.z - lEndTerminal.z) < 3.2) {
            if (state.lEndDisksDone < 4) { showToast("Avval kutubxonadan 4 ta disketani toping! (" + state.lEndDisksDone + "/4)"); return; }
            state.paused = true;
            document.getElementById('end-term-msg').textContent = "Barcha 4 disketa o'qildi. Kerakli dasturni ishga tushiring (ehtiyot bo'ling — bittasi yolg'onchi tuzoq!):";
            document.getElementById('end-terminal-overlay').classList.remove('hidden');
            return;
          }
          if (lEndExit.unlocked && Math.hypot(state.pos.x - lEndExit.x, state.pos.z - lEndExit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level61') {
          for (let i = 0; i < l61Counters.length; i++) {
            const c = l61Counters[i];
            if (Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 3.2) {
              if (!c.used) { c.used = true; state.l61SnacksDone++; }
              state.battery = 100; state.stamina = 100;
              Sound.pickup();
              showToast(c.label + ": Bodom suvi ichildi! Fonar va kuch 100% tiklandi!");
              return;
            }
          }
          if (Math.hypot(state.pos.x - l61Exit.x, state.pos.z - l61Exit.z) < 3.4) { enterMetroLobby(true); return; }
          return;
        }
        if (state.zone === 'level94') {
          for (let i = 0; i < l94Orbs.length; i++) {
            const o = l94Orbs[i];
            if (!o.collected && Math.hypot(state.pos.x - o.x, state.pos.z - o.z) < 2.6) {
              o.collected = true;
              o.mesh.visible = false;
              state.l94OrbsDone += 1;
              Sound.pickup();
              if (state.l94OrbsDone >= l94Orbs.length) {
                l94Exit.unlocked = true;
                if (l94Exit.portalMat) l94Exit.portalMat.color.setHex(0x38bdf8);
                if (l94Exit.ringMat) l94Exit.ringMat.color.setHex(0x22c55e);
                if (l94Exit.light) l94Exit.light.color.setHex(0x22c55e);
                if (l94Exit.beam) l94Exit.beam.visible = true;
                showToast("Barcha 10 tush xotirasi yig'ildi! Shimoldagi OQ QASR DARVOZASIGA boring!");
              } else {
                showToast("Tush xotirasi topildi! (" + state.l94OrbsDone + " / " + l94Orbs.length + ")");
              }
              return;
            }
          }
          if (typeof l94TrapDoors !== 'undefined') {
            for (let i = 0; i < l94TrapDoors.length; i++) {
              const td = l94TrapDoors[i];
              if (Math.hypot(state.pos.x - td.x, state.pos.z - td.z) < 2.4) {
                if (td.isWarp) {
                  if (typeof Sound !== 'undefined') Sound.playSfx('no_clip_glitch', 0.9);
                  showToast("Eshik ortida xona yo'q... siz labirintga tushib qoldingiz!", true);
                  resetGame(td.targetLvl);
                } else {
                  if (typeof Sound !== 'undefined' && Sound.doorLocked) Sound.doorLocked();
                  showToast("Bu eshik qulflangan... ortidan bo'shliq ovozi eshitilyapti.");
                }
                return;
              }
            }
          }
          if (l94Exit.unlocked && Math.hypot(state.pos.x - l94Exit.x, state.pos.z - l94Exit.z) < 3.6) {
            enterMetroLobby(true);
            return;
          }
          return;
        }

        if (state.zone === 'levelfun') {
          if (nearestFunGift && !nearestFunGift.opened) {
            nearestFunGift.opened = true;
            nearestFunGift.mesh.visible = false;
            if (nearestFunGift.isTrap) {
              Sound.balloonPop();
              Sound.monsterGrowl(0.95);
              state.monsterTarget = new THREE.Vector3(state.pos.x, 0, state.pos.z);
              showToast("TUZOQ SOVG'A! SHAR YORILDI — PARTYGOER =) SIZGA YUGURMOQDA!", true);
            } else {
              state.lFunTickets += 1;
              Sound.pickup();
              if (state.lFunTickets >= 8) {
                lFunExit.unlocked = true;
                if (lFunExit.signMat) lFunExit.signMat.color.setHex(0x22c55e);
                if (lFunExit.light) lFunExit.light.color.setHex(0x22c55e);
                elHudObj.textContent = 'CHIQISH =) OCHILDI! QOCHING!';
                showToast("8/8 chipta topildi! Yashil tug'ilgan kun chiqish eshigiga yuguring!");
              } else {
                elHudObj.textContent = 'Level Fun =) • Chiptalar: ' + state.lFunTickets + ' / 8';
                showToast("Haqiqiy chipta topildi! (" + state.lFunTickets + "/8)");
              }
            }
            return;
          }
          if (nearExit && lFunExit.unlocked) { enterMetroLobby(true); return; }
        }
        if (state.zone === 'level2') {
          if (nearestL2Breaker && !nearestL2Breaker.active) {
            if (nearestL2Breaker.seqIdx !== state.l2BreakersDone) {
              Sound.steamHiss();
              Sound.monsterGrowl(0.95);
              state.monsterTarget = new THREE.Vector3(state.pos.x, 0, state.pos.z);
              showToast("XATO TARTIB! Avval " + L2_SEQ_NAMES[state.l2BreakersDone] + " uzgichini o'chiring!", true);
              return;
            }
            nearestL2Breaker.active = true;
            nearestL2Breaker.lMat.color.setHex(0x22c55e);
            nearestL2Breaker.light.color.setHex(0x22c55e);
            state.l2BreakersDone += 1;
            Sound.valveTurn();
            state.monsterTarget = new THREE.Vector3(nearestL2Breaker.x, 0, nearestL2Breaker.z);
            if (state.l2BreakersDone >= l2Breakers.length) {
              l2Exit.unlocked = true;
              if (l2Exit.signMat) l2Exit.signMat.color.setHex(0x22c55e);
              if (l2Exit.light) l2Exit.light.color.setHex(0x22c55e);
              elHudObj.textContent = 'LYUK OCHILDI! (64,-64) CHIQISHGA YUGURING!';
              showToast("7/7 bosim uzgichi o'chirildi! Yashil chiqish lyukiga yuguring!");
            } else {
              elHudObj.textContent = 'L2 (' + state.l2BreakersDone + '/7) • Keyingi: ' + L2_SEQ_NAMES[state.l2BreakersDone];
              showToast('Bosim uzgichi o\'chirildi! (' + state.l2BreakersDone + '/7)');
            }
            return;
          }
          if (nearExit && l2Exit.unlocked) { enterMetroLobby(true); return; }
        }

        if (state.zone === 'level37') {
          if (state.pebbles > 0) {
            state.pebbles -= 1;
            const tx = Math.max(-16, Math.min(16, state.pos.x - Math.sin(state.yaw) * 14));
            const tz = Math.max(-245, Math.min(18, state.pos.z - Math.cos(state.yaw) * 14));
            state.lastSplashPos.set(tx, 0, tz);
            state.splashAlertTimer = 5.5;
            spawnWaterRipple(tx, tz);
            Sound.bigSplash();
            showToast("Toshcha otildi! Ko'r mahluq chalg'idi (" + state.pebbles + " ta qoldi).");
            return;
          }
        }
        if (nearExit && exitInfo.unlocked) {
          enterMetroLobby(true);
          return;
        }
        if (state.zone === 'level0' && nearExit && state.keysCollected >= state.totalKeys && !state.l0PinUnlocked) {
          openKeypadModal();
          return;
        }
        if (state.zone === 'level0' && window.l0Ladders) {
          for (let i = 0; i < window.l0Ladders.length; i++) {
            const ld = window.l0Ladders[i];
            if (Math.hypot(state.pos.x - ld.x, state.pos.z - ld.z) < 2.6) {
              const up = state.pos.y < 3.2;
              state.pos.y = up ? ld.topY : ld.bottomY;
              Sound.click();
              showToast(up ? "Yuqori ventilyatsiya yo'lagiga chiqdingiz!" : "Pastki qavatga tushdingiz!");
              return;
            }
          }
        }
        if (nearestLocker) {
          state.hiding = true; Sound.playVoice('vox_hide', 0.88, 16000);
          state.hideLocker = nearestLocker;
          if (nearestLocker.mesh) nearestLocker.mesh.visible = false;
          state.sprinting = false;
          elLockerOv.classList.add('active');
          Sound.locker();
          showToast('Shkafga yashirindingiz — jim turing!');
        }
      }

      btnFlash.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); toggleFlashlight(); }, { passive: false });
      btnFlash.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); toggleFlashlight(); });

      function triggerJump() {
        if (!state.started || state.paused || state.ended || state.killing || state.hiding) return;
        if (state.crouching && typeof toggleCrouch === 'function') toggleCrouch(false);
        if (state.onGround) {
          state.velY = 7.8;
          state.onGround = false;
          Sound.jump();
        }
      }
      if (btnJump) {
        btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); triggerJump(); }, { passive: false });
        btnJump.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); triggerJump(); });
      }
      const btnCrouch = document.getElementById('btn-crouch');
      function toggleCrouch(forceState) {
        state.crouching = (forceState !== undefined) ? !!forceState : !state.crouching;
        if (btnCrouch) {
          btnCrouch.classList.toggle('on', state.crouching);
          btnCrouch.style.color = state.crouching ? '#fde047' : '#ffffff';
          const cs = document.getElementById('crouch-svg');
          if (cs) {
            cs.innerHTML = state.crouching
              ? '<circle cx="13.5" cy="7.2" r="2.1"/><path d="M11 10.2c-1.1.2-2.1 1-2.5 2.1l-1.4 3.4 2.1.8.8-2 2.2.8-1.5 3.6h-3v2h4.4l2.1-4.8 1.5.5 1.4 4.3h2.1l-1.7-5.5-2.6-1.1.6-2.1 2.2 1.1.9-1.8-3.4-1.7c-.8-.4-1.8-.5-2.8-.6z"/>'
              : '<circle cx="12" cy="4.5" r="2.2"/><path d="M9.5 8C8.2 8 7.2 9 7 10.3L6.2 15h2.2l.5-3.2.6 3.7L8 21h2.4l1.6-4.4 1.6 4.4H16l-1.5-5.5.6-3.7.5 3.2h2.2L17 10.3C16.8 9 15.8 8 14.5 8h-5z"/>';
          }
        }
      }
      if (btnCrouch) {
        btnCrouch.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); toggleCrouch(); }, { passive: false });
        btnCrouch.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); toggleCrouch(); });
      }
      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyC' || e.code === 'ControlLeft') toggleCrouch();
      });

      function toggleSprint() {
        if (!state.started || state.paused || state.ended) return;
        if (!state.sprinting && state.stamina <= 5) { showToast("Kuch tugagan, biroz dam oling!"); return; }
        state.sprinting = !state.sprinting;
        btnSprint.classList.toggle('on', state.sprinting);
      }
      btnSprint.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); toggleSprint(); }, { passive: false });
      btnSprint.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation(); toggleSprint(); });

      elInteractBtn.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); triggerInteract(); }, { passive: false });
      elInteractBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerInteract(); });

      // Mouse look drag
      let isMouseDrag = false, lastMX = 0, lastMY = 0;
      renderer.domElement.addEventListener('mousedown', (e) => {
        if (!state.started || state.paused || state.ended) return;
        Sound.init();
        isMouseDrag = true;
        lastMX = e.clientX; lastMY = e.clientY;
      });
      window.addEventListener('mousemove', (e) => {
        if (!isMouseDrag) return;
        const dx = e.clientX - lastMX;
        const dy = e.clientY - lastMY;
        lastMX = e.clientX; lastMY = e.clientY;
        state.yaw -= dx * 0.0052 * state.camSens;
        state.pitch = Math.max(-1.18, Math.min(0.85, state.pitch - dy * 0.0042 * state.camSens));
      });
      window.addEventListener('mouseup', () => { isMouseDrag = false; });

      // Touch Camera Drag
      let camTouchId = null, lastTX = 0, lastTY = 0;
      renderer.domElement.addEventListener('touchstart', (e) => {
        if (!state.started || state.paused || state.ended) return;
        Sound.init();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (camTouchId === null) {
            camTouchId = t.identifier;
            lastTX = t.clientX; lastTY = t.clientY;
          }
        }
      }, { passive: true });
      renderer.domElement.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === camTouchId) {
            const rdx = t.clientX - lastTX;
            const rdy = t.clientY - lastTY;
            lastTX = t.clientX; lastTY = t.clientY;
            const dx = isForcedLandscape ? rdy : rdx;
            const dy = isForcedLandscape ? -rdx : rdy;
            state.yaw -= dx * 0.0068 * state.camSens;
            state.pitch = Math.max(-1.18, Math.min(0.85, state.pitch - dy * 0.0046 * state.camSens));
          }
        }
      }, { passive: true });
      renderer.domElement.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === camTouchId) camTouchId = null;
        }
      }, { passive: true });

      // Floating Dynamic Left Joystick
      const joyPad = document.getElementById('joy-touch-pad');
      const joyZone = document.getElementById('joystick-zone');
      const joyKnob = document.getElementById('joystick-knob');
      const joyInput = { x: 0, y: 0 };
      let joyTouchId = null, joyOrigX = 0, joyOrigY = 0;
      const maxJoyR = 40;

      function placeJoy(cx, cy) {
        const lx = isForcedLandscape ? cy : cx;
        const ly = isForcedLandscape ? (window.innerWidth - cx) : cy;
        const sw = isForcedLandscape ? window.innerHeight : window.innerWidth;
        const sh = isForcedLandscape ? window.innerWidth : window.innerHeight;
        const clX = Math.max(64, Math.min(sw * 0.46, lx));
        const clY = Math.max(64, Math.min(sh - 64, ly));
        joyZone.style.left = (clX - 59) + 'px';
        joyZone.style.top = (clY - 59) + 'px';
        joyZone.style.bottom = 'auto';
        joyZone.classList.add('active');
      }

      function updateJoy(cx, cy) {
        const rdx = cx - joyOrigX;
        const rdy = cy - joyOrigY;
        let dx = isForcedLandscape ? rdy : rdx;
        let dy = isForcedLandscape ? -rdx : rdy;
        const d = Math.hypot(dx, dy);
        if (d > maxJoyR) { dx = (dx / d) * maxJoyR; dy = (dy / d) * maxJoyR; }
        joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
        joyInput.x = dx / maxJoyR;
        joyInput.y = dy / maxJoyR;
      }

      joyPad.addEventListener('touchstart', (e) => {
        if (!state.started || state.paused || state.ended) return;
        e.preventDefault(); e.stopPropagation();
        Sound.init();
        if (joyTouchId === null && e.changedTouches.length > 0) {
          const t = e.changedTouches[0];
          joyTouchId = t.identifier;
          joyOrigX = t.clientX; joyOrigY = t.clientY;
          placeJoy(t.clientX, t.clientY);
          joyKnob.style.transform = 'translate(0px, 0px)';
          joyInput.x = 0; joyInput.y = 0;
        }
      }, { passive: false });
      joyPad.addEventListener('touchmove', (e) => {
        e.preventDefault(); e.stopPropagation();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joyTouchId) {
            updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          }
        }
      }, { passive: false });
      const endJoy = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joyTouchId) {
            joyTouchId = null;
            joyInput.x = 0; joyInput.y = 0;
            joyKnob.style.transform = 'translate(0px, 0px)';
            joyZone.style.left = '24px';
            joyZone.style.top = 'auto';
            joyZone.style.bottom = '24px';
            joyZone.classList.remove('active');
          }
        }
      };
      joyPad.addEventListener('touchend', endJoy, { passive: true });
      joyPad.addEventListener('touchcancel', endJoy, { passive: true });

      // --- Menus & Settings Wiring ---
      document.querySelectorAll('.diff-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.diff = btn.dataset.diff;
        });
      });

      // --- Chalk/Spray Floor "X" Mark System ("Men bu yerda bo'lganmanmi?!") ---
      const floorMarks = [];
      const markCanvas = document.createElement('canvas'); markCanvas.width = 128; markCanvas.height = 128;
      const mctx = markCanvas.getContext('2d');
      mctx.strokeStyle = '#facc15'; mctx.lineWidth = 14; mctx.lineCap = 'round';
      mctx.beginPath(); mctx.moveTo(22, 22); mctx.lineTo(106, 106); mctx.moveTo(106, 22); mctx.lineTo(22, 106); mctx.stroke();
      const markTex = new THREE.CanvasTexture(markCanvas);
      const markMat = new THREE.MeshBasicMaterial({ map: markTex, transparent: true, opacity: 0.92, depthWrite: false });

      function placeFloorMark() {
        if (!state.started || state.paused || state.ended || state.killing || state.zone === 'metro_lobby') return;
        const grp = state.zone === 'level1' ? level1Group : (state.zone === 'level2' ? level2Group : (state.zone === 'levelfun' ? levelFunGroup : (state.zone === 'level94' ? level94Group : (state.zone === 'level9' ? level9Group : (state.zone === 'level10' ? level10Group : (state.zone === 'level11' ? level11Group : (state.zone === 'levelend' ? levelEndGroup : (state.zone === 'level61' ? level61Group : (state.zone === 'level3' ? level3Group : (state.zone === 'level4' ? level4Group : (state.zone === 'level5' ? level5Group : (state.zone === 'level6' ? level6Group : (state.zone === 'level7' ? level7Group : (state.zone === 'level8' ? level8Group : (state.zone === 'level188' ? level188Group : (state.zone === 'level974' ? level974Group : (state.zone === 'level3999' ? level3999Group : (state.zone === 'level33' ? level33Group : (state.zone === 'level36' ? level36Group : (state.zone === 'levelshady' ? levelShadyGroup : (state.zone === 'level37' ? level37Group : level0Group)))))))))))))))))))));
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), markMat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(state.pos.x, (state.zone === 'level37' ? state.pos.y - 1.62 : 0.04), state.pos.z);
        grp.add(m);
        floorMarks.push({ mesh: m, group: grp });
        if (floorMarks.length > 35) {
          const old = floorMarks.shift();
          old.group.remove(old.mesh);
        }
        Sound.click();
        showToast("Polga 'X' belgisi qo'yildi (yo'lingizni eslab qolish uchun)!");
      }
      document.getElementById('btn-mark').addEventListener('click', (e) => { e.stopPropagation(); placeFloorMark(); });

      function bindTap(el, fn) {
        if (!el) return;
        let lastT = 0;
        const wrap = (e) => {
          const now = Date.now();
          if (now - lastT < 260) return;
          lastT = now;
          if (e && e.cancelable) e.preventDefault();
          fn(e);
        };
        el.addEventListener('touchend', wrap, { passive: false });
        el.addEventListener('click', wrap);
      }
      const _bSt = document.getElementById('btn-start-stations');
      bindTap(_bSt, () => {
        Sound.init(); Sound.click();
        const stOv = document.getElementById('station-overlay');
        if (stOv) stOv.classList.remove('hidden');
      });
      const _bSet = document.getElementById('btn-start-settings');
      bindTap(_bSet, () => {
        Sound.init(); Sound.click();
        const mm = document.getElementById('start-main-menu');
        const sp = document.getElementById('start-settings-panel');
        const pp = document.getElementById('play-mode-panel');
        if (mm) mm.classList.add('hidden');
        if (pp) pp.classList.add('hidden');
        if (sp) sp.classList.remove('hidden');
        if (window.__zulmatSyncStartSettings) window.__zulmatSyncStartSettings();
      });
      let introTimers = [];
      window.__zulmatFinishIntro = finishIntroAndEnter;
      function finishIntroAndEnter() {
        introTimers.forEach((t) => clearTimeout(t));
        introTimers = [];
        const iv = document.getElementById('intro-overlay');
        if (iv) {
          iv.classList.add('fade-out');
          setTimeout(() => { iv.classList.add('hidden'); iv.classList.remove('fade-out'); }, 650);
        }
        if (!state.started) {
          if (typeof Sound !== 'undefined' && Sound.init) Sound.init();
          state.started = true; document.body.classList.add('game-started');
          enterMetroLobby(false);
        }
      }
      window.__zulmatPlayIntro = function () { enterLandscapeFullscreen(); playCinematicIntro(); };
      function playCinematicIntro() {
        const iv = document.getElementById('intro-overlay');
        const elCode = document.getElementById('intro-code');
        const elLine = document.getElementById('intro-line');
        const elSub = document.getElementById('intro-sub');
        const elBar = document.getElementById('intro-bar-fill');
        if (!iv || !elLine) { finishIntroAndEnter(); return; }
        elStartOv.classList.add('hidden');
        iv.classList.remove('hidden', 'fade-out');
        if (elBar) { elBar.style.width = '0%'; setTimeout(() => { elBar.style.width = '100%'; }, 40); }
        Sound.init();
        Sound.noclipGlitch();
        if (elCode) elCode.textContent = 'ANOMAL SIGNAL // NO-CLIP ANIQLANDI';
        elLine.textContent = "Oddiy kundan bir lahzada borliq chegarasidan tushib qoldingiz...";
        if (elSub) elSub.textContent = 'DARAXTLARSIZ ZULMAT • 16 QAVAT';
        introTimers.push(setTimeout(() => {
          elLine.classList.add('dim');
          setTimeout(() => {
            if (elCode) elCode.textContent = 'TASHLANDIQ METRO TARMOQ // BEKAT 00';
            elLine.textContent = "Nam sariq devorlar, cheksiz zinapoyalar va qorong'uda nafas olayotgan soyalar...";
            if (elSub) elSub.textContent = "KALITLARNI YIG'ING • SHKAFGA YASHIRINING";
            elLine.classList.remove('dim');
            Sound.monsterGrowl(0.45);
          }, 450);
        }, 2800));
        introTimers.push(setTimeout(() => {
          elLine.classList.add('dim');
          setTimeout(() => {
            if (elCode) elCode.textContent = 'POYEZD KELMOQDA...';
            elLine.textContent = "Tashlandiq Metro Bekatiga xush kelibsiz. Omon qolishga tayyormisiz?";
            if (elSub) elSub.textContent = 'ZULMAT: BACKROOMS';
            elLine.classList.remove('dim');
            Sound.trainBrake();
          }, 450);
        }, 5800));
        introTimers.push(setTimeout(() => finishIntroAndEnter(), 8600));
      }
      const _bSkip = document.getElementById('btn-skip-intro');
      bindTap(_bSkip, () => { Sound.click(); finishIntroAndEnter(); });

      function enterLandscapeFullscreen() {
        try {
          const el = document.documentElement;
          const req = el.requestFullscreen || el.webkitRequestFullscreen;
          if (req) {
            Promise.resolve(req.call(el)).then(() => {
              if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
              }
            }).catch(() => {});
          } else if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        } catch (e) {}
      }
      window.__zulmatEnterFullscreen = enterLandscapeFullscreen;
      ['pointerdown', 'touchend', 'click'].forEach((ev) => {
        document.addEventListener(ev, () => { enterLandscapeFullscreen(); }, { once: true, passive: true });
      });

      // --- Start Menu Ambient Audio + Personajlar Button ---

      // --- REVILEND STUDIO Splash & Loading Screen Controller ---
      (function runRevilendSplash() {
        const sp = document.getElementById('revilend-splash');
        const fill = document.getElementById('splash-bar-fill');
        const status = document.getElementById('splash-status');
        if (!sp) return;
        let pct = 12;
        const startAt = Date.now();
        const timer = setInterval(() => {
          const elapsed = Date.now() - startAt;
          const heroReady = !!(window.__zulmatMenuHero && window.__zulmatMenuHero.ready);
          const target = heroReady ? 100 : Math.min(88, 12 + Math.floor(elapsed / 42));
          pct = Math.min(100, Math.max(pct + 6, target));
          if (fill) fill.style.width = pct + '%';
          if (status) status.textContent = '';
          if ((heroReady && elapsed >= 1800) || elapsed >= 12000) {
            clearInterval(timer);
            if (fill) fill.style.width = '100%';
            sp.classList.add('fade-out');
            setTimeout(() => { sp.style.display = 'none'; }, 700);
          }
        }, 120);
      })();

      (function initStartMenuUpgrades() {
        let startMenuBgm = null;
        let menuAudioEnabled = true;
        const startOv = document.getElementById('start-overlay');
        function stopStartMenuBgm() {
          if (startMenuBgm) { try { startMenuBgm.pause(); } catch (e) {} }
        }
        function tryPlayStartMenuBgm() {
          if (!menuAudioEnabled || state.started) return;
          if (!startMenuBgm) {
            startMenuBgm = new Audio('https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/audio/music/metro_hub.m4a');
            startMenuBgm.loop = true;
            startMenuBgm.volume = 0.28;
          }
          if (startMenuBgm.paused) startMenuBgm.play().catch(() => {});
        }
        window.__zulmatStopStartMenuBgm = stopStartMenuBgm;
        if (startOv) {
          ['pointerdown', 'touchstart', 'click'].forEach((ev) => {
            startOv.addEventListener(ev, () => { tryPlayStartMenuBgm(); }, { once: true, passive: true });
          });
        }
        const btnSkins = document.getElementById('btn-start-skins');
        if (btnSkins) {
          btnSkins.addEventListener('click', () => {
            Sound.init(); Sound.click();
            const st = document.getElementById('start-overlay');
            const mm = document.getElementById('start-main-menu');
            const sk = document.getElementById('start-skins-panel');
            if (st) st.classList.add('skins-open');
            if (mm) mm.classList.add('hidden');
            if (sk) sk.classList.remove('hidden');
            if (window.__zulmatUpdateSkinPreview) window.__zulmatUpdateSkinPreview();
          });
        }
        const btnCloseSkins = document.getElementById('btn-close-skins');
        if (btnCloseSkins) {
          btnCloseSkins.addEventListener('click', () => {
            Sound.click();
            const st = document.getElementById('start-overlay');
            const mm = document.getElementById('start-main-menu');
            const sk = document.getElementById('start-skins-panel');
            if (st) st.classList.remove('skins-open');
            if (sk) sk.classList.add('hidden');
            if (mm) mm.classList.remove('hidden');
            if (window.__zulmatSyncCharSummary) window.__zulmatSyncCharSummary();
          });
        }
      })();

      // --- Station Carousel Cards: Procedural Preview + Danger Level ---
      (function initStationCarousel() {
        const DANGER_MAP = {
          0: ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'],
          1: ['XAVF: YUQORI', '#fb923c', 'rgba(251,146,60,0.18)'],
          2: ['XAVF: YUQORI', '#fb923c', 'rgba(251,146,60,0.18)'],
          3: ['XAVF: YUQORI', '#fb923c', 'rgba(251,146,60,0.18)'],
          4: ['XAVF: PAST', '#4ade80', 'rgba(74,222,128,0.16)'],
          5: ['XAVF: YUQORI', '#fb923c', 'rgba(251,146,60,0.18)'],
          6: ['XAVF: EKSTREMAL', '#f87171', 'rgba(239,68,68,0.24)'],
          7: ['XAVF: YUQORI', '#38bdf8', 'rgba(56,189,248,0.18)'],
          8: ['XAVF: YUQORI', '#c084fc', 'rgba(192,132,252,0.18)'],
          9: ['XAVF: EKSTREMAL', '#f87171', 'rgba(239,68,68,0.24)'],
          10: ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'],
          11: ['XAVF: PAST', '#4ade80', 'rgba(74,222,128,0.16)'],
          37: ['XAVF: PAST', '#22d3ee', 'rgba(34,211,238,0.18)'],
          run: ['XAVF: EKSTREMAL', '#ef4444', 'rgba(239,68,68,0.28)'],
          fun: ['XAVF: EKSTREMAL', '#facc15', 'rgba(250,204,21,0.22)'],
          94: ['XAVF: YUQORI', '#fb923c', 'rgba(251,146,60,0.18)'],
          922: ['XAVF: EKSTREMAL', '#f87171', 'rgba(239,68,68,0.24)'],
          188: ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'],
          974: ["XAVF: O'RTA", '#f472b6', 'rgba(244,114,182,0.18)'],
          33: ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'],
          36: ['XAVF: PAST', '#4ade80', 'rgba(74,222,128,0.16)'],
          14: ['XAVF: YUQORI', '#f87171', 'rgba(239,68,68,0.22)'],
          15: ['XAVF: YUQORI', '#38bdf8', 'rgba(56,189,248,0.18)'],
          22: ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'],
          46: ['XAVF: YUQORI', '#fbbf24', 'rgba(251,191,36,0.18)'],
          61: ['XAVF: XAVFSIZ', '#34d399', 'rgba(52,211,153,0.18)'],
          3999: ['XAVF: XAVFSIZ', '#67e8f9', 'rgba(103,232,249,0.2)'],
          manila: ['XAVF: XAVFSIZ', '#fde047', 'rgba(250,204,21,0.18)'],
          shady: ['XAVF: EKSTREMAL', '#f87171', 'rgba(239,68,68,0.24)'],
          end: ['XAVF: EKSTREMAL', '#4ade80', 'rgba(74,222,128,0.2)'],
          mirror: ['XAVF: EKSTREMAL', '#c084fc', 'rgba(192,132,252,0.22)']
        };

        const list = document.getElementById('station-list');
        if (!list) return;
        let selectedKey = 0;

        function hexStr(n, fb) {
          if (typeof n !== 'number') return fb;
          return '#' + ('000000' + n.toString(16)).slice(-6);
        }

        function drawThumb(cv, key) {
          const ctx = cv.getContext('2d');
          const w = cv.width, h = cv.height;
          const th = LEVEL_THEMES[key] || LEVEL_THEMES[0];
          const sky = hexStr(th.hemiSky, '#d6ce93');
          const gnd = hexStr(th.hemiGnd, '#6b5e36');
          const fog = hexStr(th.fog, '#1c180b');

          ctx.clearRect(0, 0, w, h);
          const bg = ctx.createLinearGradient(0, 0, 0, h);
          bg.addColorStop(0, fog); bg.addColorStop(0.55, sky); bg.addColorStop(1, gnd);
          ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

          if (key === 37) {
            // Poolrooms: turquoise tiles + pool water + bright pillars
            ctx.fillStyle = '#0ea5e9'; ctx.fillRect(0, h * 0.58, w, h * 0.42);
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            for (let x = 0; x < w; x += 20) ctx.fillRect(x, 0, 1, h * 0.58);
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(w * 0.18, h * 0.14, 14, h * 0.52); ctx.fillRect(w * 0.72, h * 0.14, 14, h * 0.52);
          } else if (key === 94) {
            // Dreamcore: blue sky, rolling green hills, pastel house & floating castle
            const sG = ctx.createLinearGradient(0, 0, 0, h * 0.65); sG.addColorStop(0, '#38bdf8'); sG.addColorStop(1, '#bae6fd');
            ctx.fillStyle = sG; ctx.fillRect(0, 0, w, h * 0.65);
            ctx.fillStyle = 'rgba(148,163,184,0.55)'; ctx.fillRect(w * 0.62, h * 0.10, 26, 22); ctx.fillRect(w * 0.68, h * 0.04, 14, 10);
            ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.moveTo(0, h); ctx.quadraticCurveTo(w * 0.35, h * 0.42, w, h * 0.68); ctx.lineTo(w, h); ctx.fill();
            ctx.fillStyle = '#fef3c7'; ctx.fillRect(w * 0.22, h * 0.45, 24, 18);
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(w * 0.20, h * 0.45); ctx.lineTo(w * 0.34, h * 0.33); ctx.lineTo(w * 0.48, h * 0.45); ctx.fill();
          } else if (key === 'fun') {
            // Level Fun: colorful balloons + confetti
            ['#ef4444', '#facc15', '#38bdf8', '#a855f7', '#22c55e'].forEach((col, i) => {
              ctx.fillStyle = col;
              ctx.beginPath(); ctx.ellipse(24 + i * 28, 28 + (i % 2) * 14, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.moveTo(24 + i * 28, 40 + (i % 2) * 14); ctx.lineTo(24 + i * 28, 65); ctx.stroke();
            });
          } else if (key === 'run') {
            // Level !: red emergency hospital corridor + silhouette
            ctx.fillStyle = '#450a0a'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(w * 0.40, 4, 32, 6);
            ctx.fillStyle = 'rgba(239,68,68,0.28)'; ctx.fillRect(w * 0.28, h * 0.22, w * 0.44, h * 0.56);
            ctx.fillStyle = '#09090b'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.46, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(w * 0.44, h * 0.54, 12, 22);
          } else if (key === 7) {
            // Ocean + lighthouse beam
            ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, w, h * 0.55);
            ctx.fillStyle = '#0c4a6e'; ctx.fillRect(0, h * 0.55, w, h * 0.45);
            ctx.fillStyle = 'rgba(186,230,253,0.35)'; ctx.beginPath(); ctx.moveTo(w * 0.75, h * 0.24); ctx.lineTo(0, h * 0.10); ctx.lineTo(0, h * 0.42); ctx.fill();
            ctx.fillStyle = '#334155'; ctx.fillRect(w * 0.72, h * 0.24, 10, h * 0.34);
          } else if (key === 2 || key === 3) {
            // Pipe Dreams / Electrical: horizontal rusty pipes + orange/blue sparks
            ctx.fillStyle = '#1c1917'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#78350f'; ctx.fillRect(0, 14, w, 9); ctx.fillRect(0, 32, w, 7); ctx.fillRect(0, h - 18, w, 10);
            ctx.fillStyle = key === 3 ? '#38bdf8' : '#f97316';
            ctx.beginPath(); ctx.arc(w * 0.65, h * 0.5, 10, 0, Math.PI * 2); ctx.fill();
          } else if (key === 974) {
            // Kitty's House: pastel pink room + Kitty ears silhouette
            ctx.fillStyle = '#fbcfe8'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#09090b';
            ctx.beginPath(); ctx.arc(w * 0.5, h * 0.56, 15, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(w * 0.40, h * 0.46); ctx.lineTo(w * 0.36, h * 0.28); ctx.lineTo(w * 0.48, h * 0.42); ctx.fill();
            ctx.beginPath(); ctx.moveTo(w * 0.60, h * 0.46); ctx.lineTo(w * 0.64, h * 0.28); ctx.lineTo(w * 0.52, h * 0.42); ctx.fill();
          } else if (key === 6 || key === 'shady' || key === 8) {
            // Pitch black + glowing eyes / crystals
            ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, w, h);
            if (key === 8) {
              ctx.fillStyle = '#a855f7';
              [34, 78, 122].forEach((cx, i) => { ctx.beginPath(); ctx.moveTo(cx, h * 0.72); ctx.lineTo(cx - 7, h * 0.48 + i * 4); ctx.lineTo(cx + 7, h * 0.72); ctx.fill(); });
            } else {
              ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(w * 0.44, h * 0.44, 3, 0, Math.PI * 2); ctx.arc(w * 0.56, h * 0.44, 3, 0, Math.PI * 2); ctx.fill();
              ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, 12, 0.2, Math.PI - 0.2); ctx.stroke();
            }
          } else {
            // Distinct Backrooms Level 0 / Office / City / Suburbs architectural view with pillars & lights
            ctx.fillStyle = 'rgba(0,0,0,0.32)';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.32, h * 0.22); ctx.lineTo(w * 0.32, h * 0.78); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.48)'; ctx.fillRect(w * 0.52, h * 0.24, w * 0.14, h * 0.54);
            ctx.fillStyle = sky; ctx.fillRect(w * 0.26, h * 0.16, 14, h * 0.68);
            ctx.fillStyle = 'rgba(255,250,220,0.9)'; ctx.fillRect(w * 0.42, 7, 24, 4);
          }

          if (window.__zulmatIsLevelUnlocked && !window.__zulmatIsLevelUnlocked(key)) {
            // Authentic CRT gray static screen for locked levels (matching 1000015661.jpg)
            ctx.fillStyle = 'rgba(128, 132, 140, 0.86)';
            ctx.fillRect(0, 0, w, h);
            for (let y = 0; y < h; y += 2) {
              ctx.fillStyle = (y % 4 === 0) ? 'rgba(30, 32, 38, 0.28)' : 'rgba(220, 224, 232, 0.14)';
              ctx.fillRect(0, y, w, 1);
            }
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
            for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
          }
        }

        const btns = Array.from(list.querySelectorAll('button[id^="st-btn-"]'));
        const infoEl = document.getElementById('st-selected-info');
        const dangerEl = document.getElementById('st-selected-danger');
        const pillEl = document.getElementById('st-selected-lvl-pill');

        let selectedAiDim = null;
        function selectCard(btn, key, aiDimObj) {
          selectedKey = key;
          selectedAiDim = aiDimObj || null;
          Array.from(list.querySelectorAll('button')).forEach((b) => b.classList.toggle('st-selected', b === btn));
          const title = btn.dataset.stTitle || 'Bekat';
          const desc = btn.dataset.stDesc || '';
          const dInfo = aiDimObj
            ? ["AI O'LCHAM", '#c084fc', 'rgba(192,132,252,0.22)']
            : (DANGER_MAP[key] || ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)']);
          if (infoEl) infoEl.textContent = desc || title;
          if (pillEl) pillEl.textContent = title.toUpperCase();
          if (dangerEl) { dangerEl.textContent = dInfo[0]; dangerEl.style.color = dInfo[1]; }
        }

        btns.forEach((btn) => {
          const rawKey = btn.id.replace('st-btn-', '');
          const key = isNaN(rawKey) ? rawKey : Number(rawKey);
          const strong = btn.querySelector('strong');
          const small = btn.querySelector('small');
          const badge = btn.querySelector('[id^="st-badge-"]');
          const titleText = strong ? strong.textContent : rawKey;
          const descText = small ? small.textContent : '';
          btn.dataset.stTitle = titleText;
          btn.dataset.stDesc = descText;

          const dInfo = DANGER_MAP[key] || ["XAVF: O'RTA", '#f59e0b', 'rgba(245,158,11,0.18)'];
          const cv = document.createElement('canvas');
          cv.className = 'st-thumb-canvas';
          cv.width = 160; cv.height = 92;
          drawThumb(cv, key);

          const tDiv = document.createElement('div');
          tDiv.className = 'st-card-title';
          tDiv.textContent = titleText;

          const dDiv = document.createElement('div');
          dDiv.className = 'st-danger-bar';
          dDiv.textContent = dInfo[0];
          dDiv.style.color = dInfo[1];
          dDiv.style.background = dInfo[2];

          btn.innerHTML = '';
          btn.appendChild(cv);
          btn.appendChild(tDiv);
          if (badge) {
            badge.style.alignSelf = 'center';
            badge.style.fontSize = '9.5px';
            btn.appendChild(badge);
          }
          btn.appendChild(dDiv);

          // Capturing click: first click selects, second click on selected launches
          btn.addEventListener('click', (e) => {
            if (!btn.classList.contains('st-selected')) {
              e.stopImmediatePropagation();
              Sound.click();
              selectCard(btn, key);
            }
          }, true);
        });

        function drawAiThumb(cv, d) {
          const ctx = cv.getContext('2d');
          const w = cv.width, h = cv.height;
          const wallC = hexStr(d.wall, '#6366f1');
          const floorC = hexStr(d.floor, '#1e1b4b');
          const ceilC = hexStr(d.ceil, '#0f172a');
          const accC = hexStr(d.accent, '#38bdf8');
          const bg = ctx.createLinearGradient(0, 0, 0, h);
          bg.addColorStop(0, ceilC); bg.addColorStop(0.55, wallC); bg.addColorStop(1, floorC);
          ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          ctx.fillRect(w * 0.16, h * 0.14, 14, h * 0.72);
          ctx.fillRect(w * 0.74, h * 0.14, 14, h * 0.72);
          ctx.fillStyle = accC;
          ctx.fillRect(w * 0.36, 10, w * 0.28, 4);
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
        }
        function renderSavedAiCards() {
          Array.from(list.querySelectorAll('.st-ai-saved-card')).forEach((el) => el.remove());
          const saved = window.__zulmatGetSavedAiDims ? window.__zulmatGetSavedAiDims() : [];
          const stBtnMenu = document.getElementById('btn-start-stations');
          if (stBtnMenu) {
            const lg = window.__zulmatLang || 'uz';
            const baseLbl = lg === 'en' ? 'STATIONS' : (lg === 'ru' ? 'СТАНЦИИ' : 'BEKATLAR');
            stBtnMenu.textContent = saved.length > 0 ? (baseLbl + ' (31 + ' + saved.length + ' AI)') : (baseLbl + ' (31)');
          }
          saved.forEach((d) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'station-card st-ai-saved-card';
            b.dataset.stTitle = d.name;
            b.dataset.stDesc = (d.lore || "AI kashf qilgan o'lcham") + (d.discoveredBy ? (' • Kashf etdi: ' + d.discoveredBy) : '');
            const cv = document.createElement('canvas');
            cv.className = 'st-thumb-canvas';
            cv.width = 160; cv.height = 92;
            drawAiThumb(cv, d);
            const tDiv = document.createElement('div');
            tDiv.className = 'st-card-title';
            tDiv.textContent = d.name;
            const dDiv = document.createElement('div');
            dDiv.className = 'st-danger-bar';
            dDiv.textContent = "AI O'LCHAM";
            dDiv.style.color = '#c084fc';
            dDiv.style.background = 'rgba(192,132,252,0.22)';
            b.appendChild(cv);
            b.appendChild(tDiv);
            b.appendChild(dDiv);
            b.addEventListener('click', (e) => {
              e.stopPropagation();
              Sound.click();
              if (!b.classList.contains('st-selected')) {
                selectCard(b, d.id, d);
              } else {
                if (elStationOv) elStationOv.classList.add('hidden');
                if (window.__zulmatStartEndless) window.__zulmatStartEndless(d);
              }
            });
            list.appendChild(b);
          });
        }
        window.__zulmatRefreshStationThumbs = function() {
          btns.forEach((b) => {
            const rk = b.id.replace('st-btn-', '');
            const k = isNaN(rk) ? rk : Number(rk);
            const cv = b.querySelector('.st-thumb-canvas');
            if (cv) drawThumb(cv, k);
          });
          renderSavedAiCards();
        };
        renderSavedAiCards();
        if (btns[0]) selectCard(btns[0], 0);
        const stDiffSel = document.getElementById('st-diff-select');
        const stDiffPills = Array.from(document.querySelectorAll('#st-diff-seg [data-st-diff]'));
        const syncStDiffUI = (v) => {
          if (stDiffSel) stDiffSel.value = v;
          stDiffPills.forEach((p) => p.classList.toggle('active', p.getAttribute('data-st-diff') === v));
        };
        syncStDiffUI(state.diff || 'normal');
        stDiffPills.forEach((p) => {
          p.addEventListener('click', () => {
            Sound.click();
            const v = p.getAttribute('data-st-diff') || 'normal';
            state.diff = v;
            syncStDiffUI(v);
            document.querySelectorAll('#settings-overlay [data-diff]').forEach((b) => {
              b.classList.toggle('selected', b.getAttribute('data-diff') === v);
            });
          });
        });
        const btnGo = document.getElementById('btn-station-go');
        const btnMetroBoard = document.getElementById('btn-metro-board');
        if (btnMetroBoard) {
          const openFromTrain = (e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            Sound.click();
            btnMetroBoard.classList.add('hidden');
            if (typeof openStationMenu === 'function') openStationMenu();
          };
          btnMetroBoard.addEventListener('click', openFromTrain);
          btnMetroBoard.addEventListener('touchend', (e) => { if (e && e.cancelable) e.preventDefault(); openFromTrain(e); });
        }
        if (btnGo) btnGo.addEventListener('click', () => {
          if (selectedAiDim) {
            const dimToLaunch = selectedAiDim;
            if (elStationOv) elStationOv.classList.add('hidden');
            if (window.__zulmatStartEndless) window.__zulmatStartEndless(dimToLaunch);
            return;
          }
          if (window.__zulmatIsLevelUnlocked && !window.__zulmatIsLevelUnlocked(selectedKey)) { startTrainDeparture(selectedKey); return; }
          if (elStationOv) elStationOv.classList.add('hidden');
          if (window.__zulmatOpenShop) window.__zulmatOpenShop(() => startTrainDeparture(selectedKey)); else startTrainDeparture(selectedKey);
        });
        const prev = document.getElementById('st-nav-prev');
        const next = document.getElementById('st-nav-next');
        if (prev) prev.addEventListener('click', () => { list.scrollBy({ left: -320, behavior: 'smooth' }); });
        if (next) next.addEventListener('click', () => { list.scrollBy({ left: 320, behavior: 'smooth' }); });
      })();

      // --- Live 3D Character Switcher & Coin Unlocks on Metro Platform ---
      (function initSkinPreview3D() {
        const lbl = document.getElementById('skin-preview-label');
        const coinsPill = document.getElementById('skins-coins-pill');
        const SKIN_LABELS = {
          businessman: 'Biznesmen • Asosiy Qahramon',
          tvman: 'TV-Man • Anomal Kuzatuvchi',
          casual: 'Sayohatchi • Yengil Kiyim',
          man: 'Yigit • Shahar Fuqarosi',
          girl: 'Qiz • Omon Qoluvchi',
          hazmat: 'Hazmat • M.E.G. Himoya Kostyumi',
          survivor: 'Omon Qoluvchi • Tajribali Tadqiqotchi'
        };
        const SKIN_PRICES = { tvman: 300, hazmat: 400, survivor: 500 };
        const SKIN_SHORT = { businessman: 'Biznesmen', tvman: 'TV-Man', casual: 'Sayohatchi', man: 'Yigit', girl: 'Qiz', hazmat: 'Hazmat', survivor: 'Omon Qoluvchi' };

        function getUnlockedSkins() {
          const base = { businessman: true, casual: true, man: true, girl: true };
          try {
            const raw = LSget('zulmat_unlocked_skins');
            if (raw) return Object.assign(base, JSON.parse(raw));
          } catch (e) {}
          return base;
        }
        function saveUnlockedSkins(obj) {
          try { LSset('zulmat_unlocked_skins', JSON.stringify(obj)); } catch (e) {}
        }
        window.__zulmatIsSkinUnlocked = (k) => !!getUnlockedSkins()[k];
        window.__zulmatTryUnlockSkin = (k) => {
          const unl = getUnlockedSkins();
          if (unl[k]) return true;
          const cost = SKIN_PRICES[k] || 0;
          const curCoins = parseInt(LSget('zulmat_coins') || '250', 10) || 0;
          if (curCoins < cost) {
            showToast("Yetarli tanga yo'q (" + cost + " kerak)! Kalit va kassetalar yig'ing.", true);
            return false;
          }
          if (window.__zulmatAddCoins) window.__zulmatAddCoins(-cost);
          unl[k] = true;
          saveUnlockedSkins(unl);
          Sound.win();
          showToast((SKIN_SHORT[k] || k) + " personaji ochildi!");
          syncSkinButtons();
          return true;
        };

        function syncSkinButtons() {
          const unl = getUnlockedSkins();
          const curCoins = parseInt(LSget('zulmat_coins') || '250', 10) || 0;
          if (coinsPill) coinsPill.textContent = String(curCoins);
          Object.keys(SKIN_SHORT).forEach((k) => {
            const b = document.getElementById('btn-skin-' + k);
            if (!b) return;
            const price = SKIN_PRICES[k] || 0;
            b.textContent = (!unl[k] && price > 0) ? (SKIN_SHORT[k] + ' • ' + price) : SKIN_SHORT[k];
            b.style.opacity = unl[k] ? '1' : '0.72';
          });
        }
        function showSkin(k) {
          syncSkinButtons();
          if (!getUnlockedSkins()[k]) return;
          if (lbl) lbl.textContent = SKIN_LABELS[k] || SKIN_LABELS.businessman;
          if (window.__zulmatSetMenuHeroSkin) window.__zulmatSetMenuHeroSkin(k);
        }
        window.__zulmatUpdateSkinPreview = () => {
          syncSkinButtons();
          const saved = LSget('zulmat_player_skin') || 'businessman';
          showSkin(getUnlockedSkins()[saved] ? saved : 'businessman');
        };
        Object.keys(SKIN_LABELS).forEach((k) => {
          const b = document.getElementById('btn-skin-' + k);
          if (b) b.addEventListener('click', () => {
            if (window.__zulmatTryUnlockSkin(k)) showSkin(k);
          });
        });
        setTimeout(syncSkinButtons, 150);
      })();


      (function initContinueButton() {
        const btnCont = document.getElementById('btn-continue');
        const btnNew = document.getElementById('btn-start');
        if (!btnCont) return;
        const doneCnt = Object.values(state.completedLevels || {}).filter(Boolean).length;
        const lastRaw = LSget('zulmat_last_level');
        if (doneCnt > 0 || lastRaw !== null) {
          btnCont.classList.remove('hidden');
          const targetLvl = (lastRaw !== null) ? (isNaN(lastRaw) ? lastRaw : Number(lastRaw)) : (typeof getNextCampaignLevel === 'function' ? getNextCampaignLevel() : 0);
          const th = (typeof LEVEL_THEMES !== 'undefined' && LEVEL_THEMES[targetLvl]) ? LEVEL_THEMES[targetLvl].name : 'Bekat ' + targetLvl;
          btnCont.lastChild.textContent = ' DAVOM ETISH (' + th.toUpperCase() + ')';
          btnCont.addEventListener('click', () => {
            if (window.__zulmatStopStartMenuBgm) window.__zulmatStopStartMenuBgm();
            if (window.__zulmatEnterFullscreen) window.__zulmatEnterFullscreen();
            Sound.init(); Sound.click();
            const st = document.getElementById('start-overlay');
            if (st) st.classList.add('hidden');
            document.body.classList.add('game-started');
            state.started = true;
            state.paused = false;
            resetGame(targetLvl);
          });
        }
      })();

      document.getElementById('st-btn-0').addEventListener('click', () => { startTrainDeparture(0); });
      document.getElementById('st-btn-1').addEventListener('click', () => { startTrainDeparture(1); });
      document.getElementById('st-btn-2').addEventListener('click', () => { startTrainDeparture(2); });
      document.getElementById('st-btn-37').addEventListener('click', () => { startTrainDeparture(37); });
      document.getElementById('st-btn-run').addEventListener('click', () => { startTrainDeparture('run'); });
      document.getElementById('st-btn-fun').addEventListener('click', () => { startTrainDeparture('fun'); });
      document.getElementById('st-btn-94').addEventListener('click', () => { startTrainDeparture(94); });
      document.getElementById('st-btn-922').addEventListener('click', () => { startTrainDeparture(922); });
      document.getElementById('st-btn-9').addEventListener('click', () => { startTrainDeparture(9); });
      document.getElementById('st-btn-10').addEventListener('click', () => { startTrainDeparture(10); });
      document.getElementById('st-btn-11').addEventListener('click', () => { startTrainDeparture(11); });
      document.getElementById('st-btn-end').addEventListener('click', () => { startTrainDeparture('end'); });
      document.getElementById('st-btn-61').addEventListener('click', () => { startTrainDeparture(61); });
      document.getElementById('st-btn-3').addEventListener('click', () => { startTrainDeparture(3); });
      document.getElementById('st-btn-4').addEventListener('click', () => { startTrainDeparture(4); });
      document.getElementById('st-btn-5').addEventListener('click', () => { startTrainDeparture(5); });
      document.getElementById('st-btn-6').addEventListener('click', () => { startTrainDeparture(6); });
      document.getElementById('st-btn-7').addEventListener('click', () => { startTrainDeparture(7); });
      document.getElementById('st-btn-8').addEventListener('click', () => { startTrainDeparture(8); });
      document.getElementById('st-btn-188').addEventListener('click', () => { startTrainDeparture(188); });
      document.getElementById('st-btn-974').addEventListener('click', () => { startTrainDeparture(974); });
      document.getElementById('st-btn-33').addEventListener('click', () => { startTrainDeparture(33); });
      document.getElementById('st-btn-36').addEventListener('click', () => { startTrainDeparture(36); });
      document.getElementById('st-btn-shady').addEventListener('click', () => { startTrainDeparture('shady'); });
      [14,15,22,46,'manila','mirror'].forEach((id) => { const b = document.getElementById('st-btn-' + id); if (b) b.addEventListener('click', () => { startTrainDeparture(id); }); });
      document.getElementById('st-btn-3999').addEventListener('click', () => { startTrainDeparture(3999); });
      const btnOpenCred = document.getElementById('btn-open-credits');
      const elCredOv = document.getElementById('credits-overlay');
      if (btnOpenCred && elCredOv) btnOpenCred.addEventListener('click', () => { elCredOv.classList.remove('hidden'); });
      const btnCloseCred = document.getElementById('btn-close-credits');
      if (btnCloseCred && elCredOv) btnCloseCred.addEventListener('click', () => { elCredOv.classList.add('hidden'); });

      document.getElementById('btn-end-reallife').addEventListener('click', () => {
        document.getElementById('end-terminal-overlay').classList.add('hidden');
        state.paused = false;
        state.lEndTrapActive = true;
        monsterGroup.visible = true;
        state.monsterPos.copy(lEndMonsterSpawn);
        Sound.blackout();
        showToast("TUZOQ! reallife.exe YOLG'ONCHI! Kutubxona maxluqi uyg'ondi — metro_link.exe ni ishlating!", true);
      });
      document.getElementById('btn-end-metro').addEventListener('click', () => {
        document.getElementById('end-terminal-overlay').classList.add('hidden');
        state.paused = false;
        lEndExit.unlocked = true;
        if (lEndExit.signMat) lEndExit.signMat.color.setHex(0x22c55e);
        if (lEndExit.light) lEndExit.light.color.setHex(0x22c55e);
        Sound.win();
        showToast("TO'G'RI! Shimoldagi Kutubxona Orqa Eshigi ochildi!");
      });
      document.getElementById('btn-end-close').addEventListener('click', () => {
        document.getElementById('end-terminal-overlay').classList.add('hidden');
        state.paused = false;
      });
      document.getElementById('btn-station-close').addEventListener('click', () => {
        elStationOv.classList.add('hidden');
        state.paused = false;
      });

      // Level 0 Exit Security Keypad Puzzle Logic
      const elKeypadOv = document.getElementById('keypad-overlay');
      const elKpDisp = document.getElementById('kp-display');
      const elKpHint = document.getElementById('kp-hint');
      function openKeypadModal() {
        state.paused = true;
        state.l0PinEntered = '';
        elKpDisp.textContent = '____';
        elKpHint.textContent = state.l0Pin;
        Sound.keypadBeep(); elKeypadOv.classList.remove('hidden');
      }
      document.querySelectorAll('.kp-num').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (state.l0PinEntered.length >= 4) return;
          Sound.click();
          state.l0PinEntered += btn.dataset.n;
          elKpDisp.textContent = state.l0PinEntered.padEnd(4, '_');
          if (state.l0PinEntered.length === 4) {
            if (state.l0PinEntered === state.l0Pin) {
              state.l0PinUnlocked = true;
              exitInfo.unlocked = true;
              if (exitInfo.signMat) exitInfo.signMat.color.setHex(0x22c55e);
              if (exitInfo.portalMat) exitInfo.portalMat.color.setHex(0xecfdf5);
              if (exitInfo.light) exitInfo.light.color.setHex(0x22c55e);
              elKeypadOv.classList.add('hidden');
              state.paused = false;
              Sound.pickup();
              showToast("KOD TO'G'RI! EXIT eshigi ochildi — tez qoching!");
            } else {
              Sound.blackout();
              state.l0PinEntered = '';
              elKpDisp.textContent = 'XATO';
              setTimeout(() => { elKpDisp.textContent = '____'; }, 450);
            }
          }
        });
      });
      document.getElementById('kp-clr').addEventListener('click', () => {
        state.l0PinEntered = ''; elKpDisp.textContent = '____'; Sound.click();
      });
      document.getElementById('kp-close').addEventListener('click', () => {
        elKeypadOv.classList.add('hidden'); state.paused = false;
      });

      document.getElementById('btn-retry').addEventListener('click', () => {
        resetGame();
        Sound.init();
      });

      btnSound.addEventListener('click', () => {
        Sound.muted = !Sound.muted;
        Sound.init();
        Sound.syncMute();
        btnSound.innerHTML = Sound.muted
          ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>'
          : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
      });

      if (!location.search.includes('debug')) {
        const _bts = document.getElementById('btn-test-station');
        const _bte = document.getElementById('btn-test-exit');
        if (_bts) _bts.style.display = 'none';
        if (_bte) _bte.style.display = 'none';
      }
      function pauseAllBackgroundAudio() {
        try {
          if (window.__zulmatStopStartMenuBgm) window.__zulmatStopStartMenuBgm();
          if (Sound.ctx && Sound.ctx.state === 'running') Sound.ctx.suspend();
          if (Sound.bgm && !Sound.bgm.paused) Sound.bgm.pause();
          if (Sound.stopAllClips) Sound.stopAllClips();
        } catch (e) {}
        if (state.started && !state.ended && !state.paused) {
          state.paused = true;
          if (typeof elPauseOv !== 'undefined' && elPauseOv) elPauseOv.classList.remove('hidden');
        }
      }
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          pauseAllBackgroundAudio();
        } else {
          try {
            if (Sound.ctx && Sound.ctx.state === 'suspended' && !Sound.muted) Sound.ctx.resume();
          } catch (e) {}
        }
      });
      window.addEventListener('pagehide', pauseAllBackgroundAudio);
      window.addEventListener('blur', pauseAllBackgroundAudio);
      document.addEventListener('pause', pauseAllBackgroundAudio);
      document.getElementById('btn-test-station').addEventListener('click', () => {
        if (!state.started || state.ended || state.killing) return;
        Sound.init();
        openStationMenu(true);
      });
      document.getElementById('btn-test-exit').addEventListener('click', () => {
        if (!state.started || state.ended || state.killing) return;
        Sound.init();
        if (state.zone === 'metro_lobby') {
          if (state.trainAnim === 'parked') openStationMenu();
          return;
        }
        if (state.zone === 'level1') {
          l1Generators.forEach((g) => { g.active = true; g.lampMat.color.setHex(0x22c55e); g.light.color.setHex(0x22c55e); });
          state.l1GensDone = l1Generators.length;
          l1Exit.unlocked = true;
          state.l1Blackout = false;
          if (l1Exit.signMat) l1Exit.signMat.color.setHex(0x22c55e);
          if (l1Exit.light) l1Exit.light.color.setHex(0x22c55e);
          elHudObj.textContent = 'CHIQISH OCHILDI! GARAGDAN QOCHING!';
          state.pos.set(0, 1.65, -62.5);
          state.yaw = 0;
          Sound.pickup();
          showToast("TEST: 5/5 generator yoqildi va Level 1 EXIT oldiga teleport!");
          return;
        }
        if (state.zone === 'level2') {
          l2Breakers.forEach((b) => { b.active = true; b.lMat.color.setHex(0x22c55e); b.light.color.setHex(0x22c55e); });
          state.l2BreakersDone = l2Breakers.length;
          l2Exit.unlocked = true;
          if (l2Exit.signMat) l2Exit.signMat.color.setHex(0x22c55e);
          if (l2Exit.light) l2Exit.light.color.setHex(0x22c55e);
          const near2 = l2OpenCells.find((c) => { const d = Math.hypot(c.x - l2Exit.x, c.z - l2Exit.z); return d > 2.5 && d < 6.0; }) || l2Exit;
          state.pos.set(near2.x, 1.65, near2.z);
          state.yaw = Math.atan2(-(l2Exit.x - near2.x), -(l2Exit.z - near2.z));
          Sound.pickup();
          showToast("TEST: Level 2 uzgichlari o'chirildi va chiqish oldiga teleport!");
          return;
        }
        if (state.zone === 'levelfun') {
          lFunGifts.forEach((g) => { if (!g.isTrap) { g.opened = true; g.mesh.visible = false; } });
          state.lFunTickets = 8;
          lFunExit.unlocked = true;
          if (lFunExit.signMat) lFunExit.signMat.color.setHex(0x22c55e);
          if (lFunExit.light) lFunExit.light.color.setHex(0x22c55e);
          elHudObj.textContent = 'CHIQISH =) OCHILDI! QOCHING!';
          const nearF = lFunOpenCells.find((c) => { const d = Math.hypot(c.x - lFunExit.x, c.z - lFunExit.z); return d > 2.5 && d < 6.0; }) || lFunExit;
          state.pos.set(nearF.x, 1.65, nearF.z);
          state.yaw = Math.atan2(-(lFunExit.x - nearF.x), -(lFunExit.z - nearF.z));
          Sound.pickup();
          showToast("TEST: Level Fun =) chiptalari yig'ildi va chiqish oldiga teleport!");
          return;
        }
        if (state.zone === 'levelrun') {
          state.pos.set(0, 1.65, -584);
          state.yaw = 0;
          Sound.pickup();
          showToast("TEST: Level ! chiqish eshigi oldiga teleport!");
          return;
        }
        if (state.zone === 'level37') {
          l37Switches.forEach((sw) => { sw.active = true; sw.orbMat.color.setHex(0x22c55e); sw.light.color.setHex(0x22c55e); });
          state.l37SwitchesDone = l37Switches.length;
          l37Exit.unlocked = true;
          if (l37Exit.portalMat) l37Exit.portalMat.color.setHex(0x4ade80);
          state.pos.set(0, 2.55, -223.5);
          state.velY = 0;
          state.yaw = 0;
          Sound.pickup();
          showToast("TEST: DON'T SPLASH chiqish platformasiga teleport!");
          return;
        }
        if (state.zone === 'level94') {
          l94Orbs.forEach((o) => { o.collected = true; o.mesh.visible = false; });
          state.l94OrbsDone = l94Orbs.length;
          l94Exit.unlocked = true;
          if (l94Exit.portalMat) l94Exit.portalMat.color.setHex(0x38bdf8);
          if (l94Exit.ringMat) l94Exit.ringMat.color.setHex(0x22c55e);
          if (l94Exit.light) l94Exit.light.color.setHex(0x22c55e);
          if (l94Exit.beam) l94Exit.beam.visible = true;
          state.pos.set(l94Exit.x, getDreamHillY(l94Exit.x, l94Exit.z + 5.5) + 1.65, l94Exit.z + 5.5);
          state.yaw = 0;
          Sound.pickup();
          showToast("TEST: Level 94 chiqish darvozasi oldiga teleport!");
          return;
        }
        if (state.zone === 'level922') {
          const tAng = l922TargetFloor * Math.PI * 2 + Math.PI * 1.15;
          const tY = (tAng / (Math.PI * 2)) * L922_FLOOR_H;
          state.l922TotalAng = tAng;
          state.l922PrevAng = Math.atan2(Math.sin(tAng), Math.cos(tAng));
          state.l922Floor = l922TargetFloor;
          state.l922Falling = false;
          state.pos.set(Math.cos(tAng) * 4.0, tY + 1.65, Math.sin(tAng) * 4.0);
          state.yaw = Math.atan2(state.pos.x, state.pos.z);
          Sound.pickup();
          showToast("TEST: 94-qavatga teleport! Endi markaziy bo'shliqqa sakrang!");
          return;
        }
        if (state.zone === 'level3') {
          l3Breakers.forEach((b) => { b.active = true; b.lMat.color.setHex(0x22c55e); });
          state.l3BreakersDone = 8; l3Exit.unlocked = true; l3Exit.signMat.color.setHex(0x22c55e); l3Exit.light.color.setHex(0x22c55e);
          const near3 = l3OpenCells.find((c) => { const d = Math.hypot(c.x - l3Exit.x, c.z - l3Exit.z); return d > 2.2 && d < 6.0; }) || l3OpenCells[l3OpenCells.length - 2];
          state.pos.set(near3.x, 1.65, near3.z); Sound.pickup(); showToast("TEST: Level 3 liftiga teleport!"); return;
        }
        if (state.zone === 'level4') {
          l4Badges.forEach((b) => { b.taken = true; b.mesh.visible = false; });
          state.l4BadgesDone = 6; l4Exit.unlocked = true; l4Exit.signMat.color.setHex(0x22c55e); l4Exit.light.color.setHex(0x22c55e);
          const near4 = l4OpenCells.find((c) => { const d = Math.hypot(c.x - l4Exit.x, c.z - l4Exit.z); return d > 2.2 && d < 6.0; }) || l4OpenCells[l4OpenCells.length - 2];
          state.pos.set(near4.x, 1.65, near4.z); Sound.pickup(); showToast("TEST: Level 4 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level5') {
          l5Keys.forEach((k) => { k.taken = true; k.mesh.visible = false; });
          state.l5KeysDone = 7; l5Exit.unlocked = true; l5Exit.signMat.color.setHex(0x22c55e); l5Exit.light.color.setHex(0x22c55e);
          const near5 = l5OpenCells.find((c) => { const d = Math.hypot(c.x - l5Exit.x, c.z - l5Exit.z); return d > 2.2 && d < 6.0; }) || l5OpenCells[l5OpenCells.length - 2];
          state.pos.set(near5.x, 1.65, near5.z); Sound.pickup(); showToast("TEST: Level 5 liftiga teleport!"); return;
        }
        if (state.zone === 'level6') {
          l6Switches.forEach((s) => { s.active = true; s.lMat.color.setHex(0x22c55e); s.light.color.setHex(0x22c55e); });
          state.l6SwitchesDone = 6; l6Exit.unlocked = true; l6Exit.signMat.color.setHex(0x22c55e); l6Exit.light.color.setHex(0x22c55e);
          const near6 = l6OpenCells.find((c) => { const d = Math.hypot(c.x - l6Exit.x, c.z - l6Exit.z); return d > 2.2 && d < 6.0; }) || l6OpenCells[l6OpenCells.length - 2];
          state.pos.set(near6.x, 1.65, near6.z); Sound.pickup(); showToast("TEST: Level 6 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level7') {
          l7Buoys.forEach((b) => { b.active = true; b.lMat.color.setHex(0x22c55e); b.light.color.setHex(0x22c55e); });
          state.l7BuoysDone = 5; l7Exit.unlocked = true; l7Exit.signMat.color.setHex(0x22c55e); l7Exit.light.color.setHex(0x22c55e);
          state.pos.set(l7Exit.x, 1.85, l7Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 7 mayog'iga teleport!"); return;
        }
        if (state.zone === 'level8') {
          l8Crystals.forEach((c) => { c.taken = true; c.mesh.visible = false; });
          state.l8CrystalsDone = 6; l8Exit.unlocked = true; l8Exit.signMat.color.setHex(0x22c55e); l8Exit.light.color.setHex(0x22c55e);
          const near8 = l8OpenCells.find((c) => { const d = Math.hypot(c.x - l8Exit.x, c.z - l8Exit.z); return d > 2.2 && d < 6.0; }) || l8OpenCells[l8OpenCells.length - 2];
          state.pos.set(near8.x, 1.65, near8.z); Sound.pickup(); showToast("TEST: Level 8 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level188') {
          l188Tvs.forEach((t) => { t.taken = true; t.mesh.visible = false; });
          state.l188TvsDone = 4; l188Exit.unlocked = true; l188Exit.signMat.color.setHex(0x22c55e); l188Exit.light.color.setHex(0x22c55e);
          state.pos.set(l188Exit.x, 1.65, l188Exit.z + 4.0); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 188 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level974') {
          l974Items.forEach((it) => { it.taken = true; it.mesh.visible = false; });
          state.l974ItemsDone = 6; l974Exit.unlocked = true; l974Exit.signMat.color.setHex(0x22c55e); l974Exit.light.color.setHex(0x22c55e);
          state.pos.set(l974Exit.x, 1.65, l974Exit.z + 4.0); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 974 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level33') {
          l33Nodes.forEach((n) => { n.done = true; n.lMat.color.setHex(0x22c55e); n.light.color.setHex(0x22c55e); });
          state.l33NodesDone = 6; l33Exit.unlocked = true; l33Exit.signMat.color.setHex(0x22c55e); l33Exit.light.color.setHex(0x22c55e);
          state.pos.set(l33Exit.x, 1.65, l33Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 33 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level36') {
          l36Tickets.forEach((t) => { t.taken = true; t.mesh.visible = false; });
          state.l36TicketsDone = 5; l36Exit.unlocked = true; l36Exit.signMat.color.setHex(0x22c55e); l36Exit.light.color.setHex(0x22c55e);
          state.pos.set(l36Exit.x, 1.65, l36Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 36 chiqishiga teleport!"); return;
        }
        if (state.zone === 'levelshady') {
          lShadyAnomalies.forEach((a) => { a.taken = true; a.mesh.visible = false; });
          state.lShadyDone = 5; lShadyExit.unlocked = true; lShadyExit.signMat.color.setHex(0x22c55e); lShadyExit.light.color.setHex(0x22c55e);
          const nearS = lShadyOpenCells.find((c) => { const d = Math.hypot(c.x - lShadyExit.x, c.z - lShadyExit.z); return d > 2.2 && d < 6.0; }) || lShadyOpenCells[lShadyOpenCells.length - 2];
          state.pos.set(nearS.x, 1.65, nearS.z); Sound.pickup(); showToast("TEST: TH3 SH4DY GR3Y chiqishiga teleport!"); return;
        }
        if (state.zone === 'level3999') {
          l3999Tasks.forEach((t) => { t.done = true; t.lMat.color.setHex(0x22c55e); t.light.color.setHex(0x22c55e); });
          state.l3999TasksDone = 6; l3999Exit.unlocked = true; l3999Exit.signMat.color.setHex(0x22c55e); l3999Exit.light.color.setHex(0x22c55e);
          state.pos.set(l3999Exit.x, 1.65, l3999Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 3999 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level9') {
          l9FuseBoxes.forEach((f) => { f.fixed = true; f.lMat.color.setHex(0x22c55e); });
          state.l9FusesDone = 6; l9Exit.unlocked = true; l9Exit.signMat.color.setHex(0x22c55e); l9Exit.light.color.setHex(0x22c55e);
          state.pos.set(l9Exit.x, 1.65, l9Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 9 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level10') {
          l10Radios.forEach((r) => { r.active = true; r.lMat.color.setHex(0x22c55e); });
          state.l10RadiosDone = 5; l10Exit.unlocked = true; l10Exit.signMat.color.setHex(0x22c55e); l10Exit.light.color.setHex(0x22c55e);
          state.pos.set(l10Exit.x, 1.65, l10Exit.z + 4.5); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 10 chiqishiga teleport!"); return;
        }
        if (state.zone === 'level11') {
          l11Cards.forEach((c) => { c.taken = true; c.mesh.visible = false; });
          state.l11CardsDone = 6; l11Exit.unlocked = true; l11Exit.signMat.color.setHex(0x22c55e); l11Exit.light.color.setHex(0x22c55e);
          state.pos.set(l11Exit.x, 1.65, l11Exit.z + 5.0); state.yaw = 0; Sound.pickup(); showToast("TEST: Level 11 chiqishiga teleport!"); return;
        }
        if (state.zone === 'levelend') {
          lEndDisks.forEach((d) => { d.taken = true; d.mesh.visible = false; });
          state.lEndDisksDone = 4; lEndExit.unlocked = true; lEndExit.signMat.color.setHex(0x22c55e); lEndExit.light.color.setHex(0x22c55e);
          state.pos.set(lEndExit.x, 1.65, lEndExit.z + 4.0); state.yaw = 0; Sound.pickup(); showToast("TEST: The End chiqishiga teleport!"); return;
        }
        if (state.zone === 'level61') {
          state.pos.set(l61Exit.x, 1.65, l61Exit.z + 4.0); state.yaw = 0; Sound.pickup(); showToast("TEST: Snackrooms VIP eshigiga teleport!"); return;
        }
        // Collect all 8 keys & unlock EXIT door
        keysList.forEach((k) => { k.collected = true; k.mesh.visible = false; });
        state.keysCollected = state.totalKeys;
        state.l0PinUnlocked = true;
        exitInfo.unlocked = true;
        if (exitInfo.signMat) exitInfo.signMat.color.setHex(0x22c55e);
        if (exitInfo.portalMat) exitInfo.portalMat.color.setHex(0xecfdf5);
        if (exitInfo.light) exitInfo.light.color.setHex(0x22c55e);
        elHudObj.textContent = "CHIQISH ESHIGI OCHILDI! QOCHING!";
        // Exit locker if hiding
        if (state.hiding) {
          if (state.hideLocker && state.hideLocker.mesh) state.hideLocker.mesh.visible = true;
          state.hiding = false;
          state.hideLocker = null;
          elLockerOv.classList.remove('active');
        }
        // Teleport to the closest open corridor cell ~3.8m in front of EXIT facing the door
        let bestSpot = null;
        let bestScore = Infinity;
        for (let i = 0; i < openCells.length; i++) {
          const c = openCells[i];
          const d = Math.hypot(c.x - exitInfo.x, c.z - exitInfo.z);
          if (d >= 2.6 && d <= 6.2) {
            const score = Math.abs(d - 4.0);
            if (score < bestScore) { bestScore = score; bestSpot = c; }
          }
        }
        if (bestSpot) {
          state.pos.set(bestSpot.x, 1.65, bestSpot.z);
          state.yaw = Math.atan2(-(exitInfo.x - bestSpot.x), -(exitInfo.z - bestSpot.z));
          state.pitch = 0;
        }
        Sound.pickup();
        showToast("TEST: 8/8 kalit yig'ildi va EXIT eshigi oldiga teleport qilindingiz!");
      });

      document.getElementById('btn-restart').addEventListener('click', () => {
        if (!state.started) return;
        resetGame();
        Sound.init();
      });

      const elPauseOv = document.getElementById('pause-overlay');
      document.getElementById('btn-settings').addEventListener('click', () => {
        if (!state.started || state.ended) return;
        state.paused = true;
        if (Sound.activeZoneBgm) { try { Sound.activeZoneBgm.volume = 0.12; } catch (e) {} }
        Sound.syncMute();
        if (elPauseOv) elPauseOv.classList.remove('hidden');
        else elSetOv.classList.remove('hidden');
      });
      const bPH = document.getElementById('btn-pause-home');
      const bPO = document.getElementById('btn-pause-opts');
      const bPR = document.getElementById('btn-pause-resume');
      if (bPR) bPR.addEventListener('click', () => {
        if (elPauseOv) elPauseOv.classList.add('hidden');
        state.paused = false;
        if (Sound.activeZoneBgm && !Sound.muted) { try { Sound.activeZoneBgm.volume = 0.42; } catch (e) {} }
        if (state.started) Sound.syncMute();
      });
      if (bPO) bPO.addEventListener('click', () => {
        if (elPauseOv) elPauseOv.classList.add('hidden');
        window.__zulmatReturnToPause = true;
        if (window.__zulmatSyncSettingsContext) window.__zulmatSyncSettingsContext();
        elSetOv.classList.remove('hidden');
      });
      if (bPH) bPH.addEventListener('click', () => {
        if (elPauseOv) elPauseOv.classList.add('hidden');
        state.paused = false;
        state.started = false;
        if (Sound.stopAllClips) Sound.stopAllClips();
        if (Sound.bgm) { try { Sound.bgm.pause(); } catch (e) {} }
        document.body.classList.remove('game-started');
        const stOv = document.getElementById('start-overlay');
        if (stOv) stOv.classList.remove('hidden');
      });

      document.getElementById('btn-close-settings').addEventListener('click', () => {
        elSetOv.classList.add('hidden');
        if (window.__zulmatReturnToPause && state.started && elPauseOv) {
          window.__zulmatReturnToPause = false;
          elPauseOv.classList.remove('hidden');
          return;
        }
        state.paused = false;
        if (Sound.activeZoneBgm && !Sound.muted) { try { Sound.activeZoneBgm.volume = 0.42; } catch (e) {} }
        if (state.started) Sound.syncMute();
      });

      document.getElementById('btn-orient').addEventListener('click', () => {
        forceLandscape = !forceLandscape;
        updateStageOrientation();
      });

      const vhsOv = document.getElementById('vhs-overlay');
      const vhsGrain = document.getElementById('vhs-grain');
      const vhsGrainCtx = vhsGrain.getContext('2d');
      const vhsGrainImg = vhsGrainCtx.createImageData(160, 120);
      const vhsStamp = document.getElementById('vhs-stamp');
      const vhsTc = document.getElementById('vhs-tc');
      const vhsLbl = document.getElementById('vhs-lbl');
      let vhsFrameTick = 0;

      function updateVhsGrain(danger) {
        if (!state.vhsOn) return;
        vhsFrameTick++;
        if (vhsFrameTick % 2 !== 0) return; // 30fps authentic VHS tape grain
        const d = vhsGrainImg.data;
        const len = d.length;
        for (let i = 0; i < len; i += 4) {
          const n = (Math.random() * 255) | 0;
          d[i] = n;
          d[i + 1] = n;
          d[i + 2] = (n * 0.88) | 0;
          d[i + 3] = 255;
        }
        vhsGrainCtx.putImageData(vhsGrainImg, 0, 0);
        // Horizontal VHS tracking tear glitches when Stalker is close!
        if (danger > 0.25 && Math.random() < 0.35 + danger * 0.45) {
          const gy = (Math.random() * 114) | 0;
          const gh = 2 + ((Math.random() * 7) | 0);
          vhsGrainCtx.fillStyle = 'rgba(255, 250, 210, 0.55)';
          vhsGrainCtx.fillRect(0, gy, 160, gh);
        }
        vhsGrain.style.opacity = String((0.18 + danger * 0.36).toFixed(2));
        if (vhsTc) {
          const hrs = Math.floor(state.elapsed / 3600);
          const mins = Math.floor((state.elapsed % 3600) / 60);
          const secs = Math.floor(state.elapsed % 60);
          vhsTc.textContent = String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }
      }

      document.getElementById('btn-vhs').addEventListener('click', () => {
        state.vhsOn = !state.vhsOn;
        vhsOv.classList.toggle('off', !state.vhsOn);
        vhsGrain.classList.toggle('off', !state.vhsOn);
        vhsStamp.classList.toggle('off', !state.vhsOn);
        container.classList.toggle('vhs-cam', state.vhsOn);
        vhsLbl.textContent = state.vhsOn ? 'Yoqiq' : "O'chiq";
      });
      const gfxLbl = document.getElementById('gfx-lbl');
      function applyGraphicsQuality(q) {
        state.gfxQuality = (q === 'low' || q === 'high') ? q : 'medium';
        const dpr = window.devicePixelRatio || 1;
        if (state.gfxQuality === 'low') {
          renderer.setPixelRatio(1);
          renderer.shadowMap.enabled = false;
          renderer.toneMappingExposure = 0.90;
          if (gfxLbl) gfxLbl.textContent = 'Past (Tez FPS)';
        } else if (state.gfxQuality === 'high') {
          renderer.setPixelRatio(Math.min(dpr, 2));
          renderer.shadowMap.enabled = true;
          renderer.toneMappingExposure = 1.0;
          if (gfxLbl) gfxLbl.textContent = 'Yuqori (HD)';
        } else {
          renderer.setPixelRatio(Math.min(dpr, 1.5));
          renderer.shadowMap.enabled = true;
          renderer.toneMappingExposure = 0.95;
          if (gfxLbl) gfxLbl.textContent = "O'rta (Balans)";
        }
        try { LSset('zulmat_gfx', state.gfxQuality); } catch (e) {}
      }
      applyGraphicsQuality(state.gfxQuality);
      const btnGfx = document.getElementById('btn-gfx');
      if (btnGfx) btnGfx.addEventListener('click', () => {
        const next = state.gfxQuality === 'low' ? 'medium' : (state.gfxQuality === 'medium' ? 'high' : 'low');
        applyGraphicsQuality(next);
        Sound.click();
      });

      const sensSlider = document.getElementById('sens-slider');
      const sensVal = document.getElementById('sens-val');
      sensSlider.value = state.camSens.toFixed(1);
      sensVal.textContent = state.camSens.toFixed(1) + 'x';
      sensSlider.addEventListener('input', () => {
        const v = Math.max(0.4, Math.min(2.5, parseFloat(sensSlider.value) || 1.0));
        state.camSens = v;
        sensVal.textContent = v.toFixed(1) + 'x';
        try { LSset('zulmat_sens', v.toFixed(1)); } catch (e) {}
      });


      // --- Inventory Hotbar & Settings Sound/Restart Controls ---
      (function initInvAndSettingsExtras() {
        const cAlm = document.getElementById('inv-cnt-almond');
        const cBat = document.getElementById('inv-cnt-battery');
        const cKey = document.getElementById('inv-cnt-keys');
        const cVhs = document.getElementById('inv-cnt-vhs');
        const sAlm = document.getElementById('inv-slot-almond');
        const sBat = document.getElementById('inv-slot-battery');
        const sKey = document.getElementById('inv-slot-keys');
        const sVhs = document.getElementById('inv-slot-vhs');
        const iAlm = document.getElementById('inv-img-almond');
        const iBat = document.getElementById('inv-img-battery');
        const iKey = document.getElementById('inv-img-keys');
        const iVhs = document.getElementById('inv-img-vhs');

        const glbThumbs = window.__zulmatGlbThumbs = window.__zulmatGlbThumbs || {};
        const glbThumbFiles = {
          almond: 'almond_water.glb',
          battery: 'battery.glb',
          keys: 'key.glb',
          vhs: 'cassette_1.glb',
          radar: 'radar.glb'
        };
        let thumbInited = false;
        function renderGlbThumbnails() {
          if (thumbInited) return;
          if (typeof THREE === 'undefined' || typeof gltfLoader === 'undefined' || typeof REPO_GLB_BASE === 'undefined') return;
          thumbInited = true;
          let thumbRenderer = null;
          try {
            thumbRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
            thumbRenderer.setSize(128, 128);
            thumbRenderer.setPixelRatio(1);
            if ('outputEncoding' in thumbRenderer && THREE.sRGBEncoding) thumbRenderer.outputEncoding = THREE.sRGBEncoding;
          } catch (e) { return; }
          const tScene = new THREE.Scene();
          const tCam = new THREE.PerspectiveCamera(34, 1, 0.05, 50);
          tCam.position.set(0, 0.35, 2.75);
          tCam.lookAt(0, 0, 0);
          tScene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.55));
          const kLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
          kLight.position.set(2.2, 3.0, 2.5);
          tScene.add(kLight);
          const rLight = new THREE.DirectionalLight(0x93c5fd, 0.85);
          rLight.position.set(-2.2, 1.2, -2.0);
          tScene.add(rLight);

          const keysList = Object.keys(glbThumbFiles);
          let remaining = keysList.length;
          keysList.forEach((slotKey) => {
            gltfLoader.load(REPO_GLB_BASE + glbThumbFiles[slotKey], (gltf) => {
              try {
                const mdl = gltf.scene.clone(true);
                const box = new THREE.Box3().setFromObject(mdl);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z, 0.001);
                const sc = 1.45 / maxDim;
                mdl.scale.setScalar(sc);
                mdl.position.set(-center.x * sc, -center.y * sc, -center.z * sc);
                const wrap = new THREE.Group();
                wrap.add(mdl);
                wrap.rotation.set(0.28, 0.58, 0);
                tScene.add(wrap);
                thumbRenderer.render(tScene, tCam);
                glbThumbs[slotKey] = thumbRenderer.domElement.toDataURL('image/png');
                tScene.remove(wrap);
                syncInv();
              } catch (e) {}
              remaining--;
              if (remaining <= 0 && thumbRenderer) {
                try { thumbRenderer.dispose(); thumbRenderer.forceContextLoss(); } catch (e) {}
                thumbRenderer = null;
              }
            }, undefined, () => {
              remaining--;
              if (remaining <= 0 && thumbRenderer) {
                try { thumbRenderer.dispose(); thumbRenderer.forceContextLoss(); } catch (e) {}
                thumbRenderer = null;
              }
            });
          });
        }
        setTimeout(renderGlbThumbnails, 1200);

        function applySlot(slotEl, cntEl, imgEl, count, thumbKey) {
          const n = count || 0;
          if (slotEl) slotEl.classList.toggle('empty', !(n > 0));
          if (cntEl) {
            cntEl.textContent = String(n);
            cntEl.style.display = n > 0 ? 'flex' : 'none';
          }
          if (imgEl) {
            const src = glbThumbs[thumbKey];
            if (n > 0 && src) {
              if (imgEl.src !== src) imgEl.src = src;
              imgEl.classList.add('ready');
            } else {
              imgEl.classList.remove('ready');
            }
          }
        }

        function syncInv() {
          if (!thumbInited) renderGlbThumbnails();
          applySlot(sAlm, cAlm, iAlm, state.invAlmond, 'almond');
          applySlot(sBat, cBat, iBat, state.invBattery, 'battery');
          applySlot(sKey, cKey, iKey, state.keysCollected, 'keys');
          applySlot(sVhs, cVhs, iVhs, state.vhsTapes, 'vhs');
        }
        window.__zulmatSyncInv = syncInv;
        syncInv();
        setInterval(syncInv, 450);

        function useAlmond() {
          if (!state.started || state.ended || state._drinkingAlmond || !(state.invAlmond > 0)) return;
          state.invAlmond--;
          if (typeof almondDrinkAnim !== 'undefined' && almondDrinkAnim.play) almondDrinkAnim.play();
          state.stamina = 100;
          state.sanity = 100;
          state.battery = Math.min(100, state.battery + 35);
          Sound.almondDrink();
          setTimeout(() => Sound.playVoice('vox_almond', 0.9, 12000), 2350);
          showToast("Bodom suvi ichildi! Kuch va aql-idrok 100% tiklandi!");
          syncInv();
        }
        function useBattery() {
          if (!state.started || state.ended || !(state.invBattery > 0)) return;
          if (state.battery >= 98) { showToast("Fonar quvvati allaqachon to'liq!"); return; }
          state.invBattery--;
          state.battery = Math.min(100, state.battery + 50);
          Sound.pickup();
          showToast("Yangi batareya qo'yildi! (+50% Fonar)");
          syncInv();
        }
        if (sAlm) sAlm.addEventListener('click', useAlmond);
        if (sBat) sBat.addEventListener('click', useBattery);
        window.addEventListener('keydown', (e) => {
          if (e.code === 'Digit1') useAlmond();
          if (e.code === 'Digit2') useBattery();
        });

        const bSetSnd = document.getElementById('btn-settings-sound');
        const bSetRes = document.getElementById('btn-settings-restart');
        const bSetCls = document.getElementById('btn-close-settings');
        function syncSettingsContext() {
          if (bSetRes) bSetRes.style.display = state.started ? '' : 'none';
          if (bSetCls) {
            bSetCls.textContent = state.started
              ? (window.__zulmatTr ? window.__zulmatTr('Davom etish', 'Resume', 'Продолжить') : 'Davom etish')
              : (window.__zulmatTr ? window.__zulmatTr('Yopish', 'Close', 'Закрыть') : 'Yopish');
          }
        }
        window.__zulmatSyncSettingsContext = syncSettingsContext;
  
      (function initStartInlineSettings() {
        const mm = document.getElementById('start-main-menu');
        const sp = document.getElementById('start-settings-panel');
        const bCls = document.getElementById('btn-close-start-settings');
        const bLang = document.getElementById('btn-ss-lang');
        const bDiff = document.getElementById('btn-ss-diff');
        const bGfx = document.getElementById('btn-ss-gfx');
        const bVhs = document.getElementById('btn-ss-vhs');
        const bSnd = document.getElementById('btn-ss-sound');

        function syncStartSettings() {
          const lang = window.__zulmatLang || 'uz';
          if (bLang) bLang.textContent = (lang === 'en' ? 'LANG: ENGLISH' : (lang === 'ru' ? 'ЯЗЫК: РУССКИЙ' : "TIL: O'ZBEKCHA"));
          if (bDiff) {
            const dn = state.diff === 'easy'
              ? (lang === 'en' ? 'EASY' : (lang === 'ru' ? 'ЛЁГКИЙ' : 'OSON'))
              : (state.diff === 'hard' ? (lang === 'en' ? 'HARD' : (lang === 'ru' ? 'СЛОЖНЫЙ' : "QO'RQINCHLI")) : (lang === 'en' ? 'NORMAL' : (lang === 'ru' ? 'СРЕДНИЙ' : "O'RTA")));
            bDiff.textContent = (lang === 'en' ? 'DIFFICULTY: ' : (lang === 'ru' ? 'СЛОЖНОСТЬ: ' : 'QIYINLIK: ')) + dn;
          }
          if (bGfx) {
            const gn = state.gfxQuality === 'low' ? (lang === 'en' ? 'LOW' : (lang === 'ru' ? 'НИЗК.' : 'PAST')) : (state.gfxQuality === 'high' ? (lang === 'en' ? 'HIGH' : (lang === 'ru' ? 'ВЫС.' : 'YUQORI')) : (lang === 'en' ? 'MEDIUM' : (lang === 'ru' ? 'СРЕДН.' : "O'RTA")));
            bGfx.textContent = (lang === 'en' ? 'GRAPHICS: ' : (lang === 'ru' ? 'ГРАФИКА: ' : 'GRAFIKA: ')) + gn;
          }
          if (bVhs) bVhs.textContent = 'VHS: ' + (state.vhsOn ? (lang === 'en' ? 'ON' : (lang === 'ru' ? 'ВКЛ' : 'YONIQ')) : (lang === 'en' ? 'OFF' : (lang === 'ru' ? 'ВЫКЛ' : "O'CHIQ")));
          if (bSnd) bSnd.textContent = (lang === 'en' ? 'SOUND: ' : (lang === 'ru' ? 'ЗВУК: ' : 'OVOZ: ')) + (Sound.muted ? (lang === 'en' ? 'OFF' : (lang === 'ru' ? 'ВЫКЛ' : "O'CHIQ")) : (lang === 'en' ? 'ON' : (lang === 'ru' ? 'ВКЛ' : 'YONIQ')));
          if (bCls) bCls.textContent = '< ' + (lang === 'en' ? 'BACK' : (lang === 'ru' ? 'НАЗАД' : 'ORQAGA'));
        }
        window.__zulmatSyncStartSettings = syncStartSettings;

        if (bCls) bCls.addEventListener('click', () => { Sound.click(); if (sp) sp.classList.add('hidden'); if (mm) mm.classList.remove('hidden'); });
        if (bLang) bLang.addEventListener('click', () => {
          Sound.click();
          const order = ['uz', 'en', 'ru'];
          const next = order[(order.indexOf(window.__zulmatLang || 'uz') + 1) % 3];
          const btn = document.querySelector('#lang-row [data-lang="' + next + '"]');
          if (btn) btn.click();
          syncStartSettings();
        });
        if (bDiff) bDiff.addEventListener('click', () => {
          Sound.click();
          const order = ['easy', 'normal', 'hard'];
          const next = order[(order.indexOf(state.diff || 'normal') + 1) % 3];
          const btn = document.querySelector('#settings-overlay [data-diff="' + next + '"]');
          if (btn) btn.click();
          syncStartSettings();
        });
        if (bGfx) bGfx.addEventListener('click', () => { const el = document.getElementById('btn-gfx'); if (el) el.click(); syncStartSettings(); });
        if (bVhs) bVhs.addEventListener('click', () => { const el = document.getElementById('btn-vhs'); if (el) el.click(); syncStartSettings(); });
        if (bSnd) bSnd.addEventListener('click', () => { const el = document.getElementById('btn-settings-sound'); if (el) el.click(); syncStartSettings(); });
        setTimeout(syncStartSettings, 120);
      })();

      const _bSetOpen = document.getElementById('btn-start-settings');
        const _bHudSet = document.getElementById('btn-settings');
        if (_bSetOpen) _bSetOpen.addEventListener('click', syncSettingsContext);
        if (_bHudSet) _bHudSet.addEventListener('click', syncSettingsContext);
        syncSettingsContext();
        if (bSetSnd) {
          bSetSnd.addEventListener('click', () => {
            Sound.muted = !Sound.muted;
            Sound.syncMute();
            bSetSnd.textContent = Sound.muted ? "Ovoz: O'CHIQ" : 'Ovoz: YONIQ';
          });
        }
        if (bSetRes) {
          bSetRes.addEventListener('click', () => {
            const ov = document.getElementById('settings-overlay');
            if (ov) ov.classList.add('hidden');
            state.paused = false;
            resetGame(state.currentLevel);
          });
        }
      })();

      // --- Smart Monster AI: Line-of-Sight + Hearing + Wall-Corner Steering ---
      function canMonsterDetect(dist, sightRange, wantsSprintNow) {
        if (state.hiding) {
          state._smartChaseUntil = 0;
          return false;
        }
        const now = performance.now();
        const stealthMult = state.crouching ? 0.6 : 1.0;
        const lightMult = (state.flashOn && state.battery > 1) ? 1.35 : 0.78;
        const effSight = sightRange * stealthMult * lightMult;
        const hearR = wantsSprintNow ? 15.5 : (state.crouching ? 2.4 : 4.8);
        const direct = (dist < hearR) || (dist < effSight && hasLineOfSight(state.monsterPos.x, state.monsterPos.z, state.pos.x, state.pos.z));
        if (direct) {
          if (!state.monsterChasing && (!state._lastSpotRoar || now - state._lastSpotRoar > 5000)) {
            state._lastSpotRoar = now;
            if (typeof Sound !== 'undefined' && Sound.playSfx3D) {
              Sound.playSfx3D('monster_roar', state.monsterPos.x, 1.5, state.monsterPos.z, 0.88);
            }
          }
          state._smartChaseUntil = now + 5000;
          return true;
        }
        if (state._smartChaseUntil && now < state._smartChaseUntil && dist < Math.max(26, sightRange * 1.4)) {
          return true;
        }
        if (state.monsterChasing && dist < 24 && (!state._lastLoseGrowl || now - state._lastLoseGrowl > 6000)) {
          state._lastLoseGrowl = now;
          if (typeof Sound !== 'undefined' && Sound.playSfx3D) {
            Sound.playSfx3D('monster_growl', state.monsterPos.x, 1.5, state.monsterPos.z, 0.72);
          }
        }
        return false;
      }
      function findNextWaypoint(sx, sz, tx, tz) {
        const CELL = 2.6;
        const bxs = (typeof getZoneBoxes === 'function') ? getZoneBoxes() : [];
        const isFree = (cx, cz) => {
          const wx = cx * CELL, wz = cz * CELL;
          for (let i = 0; i < bxs.length; i++) {
            const b = bxs[i];
            if (Math.abs(wx - b.x) < b.halfX + 0.48 && Math.abs(wz - b.z) < b.halfZ + 0.48) return false;
          }
          return true;
        };
        const scx = Math.round(sx / CELL), scz = Math.round(sz / CELL);
        const tcx = Math.round(tx / CELL), tcz = Math.round(tz / CELL);
        if (scx === tcx && scz === tcz) return null;
        const startK = scx + ',' + scz;
        const targetK = tcx + ',' + tcz;
        const q = [[scx, scz]];
        const parent = {};
        parent[startK] = null;
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        let foundKey = null;
        let qi = 0;
        while (qi < q.length && qi < 180) {
          const [cx, cz] = q[qi++];
          const ck = cx + ',' + cz;
          if (ck === targetK) { foundKey = ck; break; }
          for (let d = 0; d < 4; d++) {
            const nx = cx + dirs[d][0], nz = cz + dirs[d][1];
            const nk = nx + ',' + nz;
            if (parent[nk] !== undefined) continue;
            if (nk !== targetK && !isFree(nx, nz)) continue;
            parent[nk] = ck;
            q.push([nx, nz]);
          }
        }
        if (!foundKey) return null;
        let cur = foundKey;
        while (parent[cur] && parent[cur] !== startK) cur = parent[cur];
        const parts = cur.split(',');
        return { x: Number(parts[0]) * CELL, z: Number(parts[1]) * CELL };
      }
      function steerMonsterStep(mPos, tx, tz, spd, dt) {
        if (state.monsterStunTimer > 0) return;
        const nowWp = performance.now();
        if (typeof hasLineOfSight === 'function' && !hasLineOfSight(mPos.x, mPos.z, tx, tz)) {
          if (!mPos._wpUntil || nowWp > mPos._wpUntil) {
            mPos._wp = findNextWaypoint(mPos.x, mPos.z, tx, tz);
            mPos._wpUntil = nowWp + 360;
          }
          if (mPos._wp) { tx = mPos._wp.x; tz = mPos._wp.z; }
        } else {
          mPos._wp = null;
        }
        const dx = tx - mPos.x, dz = tz - mPos.z;
        const dd = Math.hypot(dx, dz) || 1;
        const ux = dx / dd, uz = dz / dd;
        const px = mPos.x, pz = mPos.z;
        const step = spd * dt;
        mPos.x += ux * step;
        mPos.z += uz * step;
        resolveWallCollision(mPos, 0.55, true);
        const moved = Math.hypot(mPos.x - px, mPos.z - pz);
        if (moved < step * 0.38) {
          // Probe 45-degree diagonals first for smooth doorway/pillar navigation, then 90-degree slide
          const c45 = 0.7071;
          const dLx = (ux * c45 - uz * c45) * step, dLz = (ux * c45 + uz * c45) * step;
          const dRx = (ux * c45 + uz * c45) * step, dRz = (-ux * c45 + uz * c45) * step;
          const pL = { x: px + dLx, z: pz + dLz };
          const pR = { x: px + dRx, z: pz + dRz };
          resolveWallCollision(pL, 0.55, true);
          resolveWallCollision(pR, 0.55, true);
          const mL = Math.hypot(pL.x - px, pL.z - pz);
          const mR = Math.hypot(pR.x - px, pR.z - pz);
          if (mL < step * 0.25 && mR < step * 0.25) {
            pL.x = px - uz * step; pL.z = pz + ux * step;
            pR.x = px + uz * step; pR.z = pz - ux * step;
            resolveWallCollision(pL, 0.55, true);
            resolveWallCollision(pR, 0.55, true);
          }
          const dL = Math.hypot(tx - pL.x, tz - pL.z);
          const dR = Math.hypot(tx - pR.x, tz - pR.z);
          const nowT = performance.now();
          if (!mPos._sideUntil || nowT > mPos._sideUntil) { mPos._side = dL < dR ? 1 : -1; mPos._sideUntil = nowT + 900; }
          let pick = mPos._side === 1 ? pL : pR;
          if (Math.hypot(pick.x - px, pick.z - pz) < step * 0.2) {
            mPos._side = -mPos._side; mPos._sideUntil = nowT + 900;
            pick = mPos._side === 1 ? pL : pR;
          }
          mPos.x = pick.x;
          mPos.z = pick.z;
        }
      }

      // --- Collision & Line-of-Sight Helpers ---
      const ZONE_BOXES_MAP = {
        metro_lobby: metroBoxes, level1: l1Boxes, level2: l2Boxes, level37: l37Boxes,
        levelrun: lRunBoxes, levelfun: lFunBoxes, level94: l94Boxes, level9: l9Boxes,
        level10: l10Boxes, level11: l11Boxes, levelend: lEndBoxes, level61: l61Boxes,
        level3: l3Boxes, level4: l4Boxes, level5: l5Boxes, level6: l6Boxes,
        level7: l7Boxes, level8: l8Boxes, level188: l188Boxes, level974: l974Boxes,
        level3999: l3999Boxes, level33: l33Boxes, level36: l36Boxes, levelshady: lShadyBoxes,
        level14: l14Boxes, level15: l15Boxes, level22: l22Boxes, level46: l46Boxes,
        levelmanila: lManilaBoxes, levelmirror: lMirrorBoxes, levelendless: lEndlessBoxes
      };
      function getZoneBoxes() {
        return ZONE_BOXES_MAP[state.zone] || wallBoxes;
      }

      function resolveWallCollision(pos, radius, forMonster) {
        if (!forMonster && typeof poltergeistChair !== 'undefined' && poltergeistChair.getCollisionBox) {
          const cb = poltergeistChair.getCollisionBox();
          if (cb) {
            const cMinX = cb.x - cb.halfX - radius, cMaxX = cb.x + cb.halfX + radius;
            const cMinZ = cb.z - cb.halfZ - radius, cMaxZ = cb.z + cb.halfZ + radius;
            if (pos.x > cMinX && pos.x < cMaxX && pos.z > cMinZ && pos.z < cMaxZ) {
              const pL = pos.x - cMinX, pR = cMaxX - pos.x, pT = pos.z - cMinZ, pB = cMaxZ - pos.z;
              const mp = Math.min(pL, pR, pT, pB);
              if (mp === pL) pos.x = cMinX;
              else if (mp === pR) pos.x = cMaxX;
              else if (mp === pT) pos.z = cMinZ;
              else pos.z = cMaxZ;
            }
          }
        }
        const _pitList = (forMonster && state.zone === 'level0' && window.l0PitTraps && pos.y < 3.6)
          ? window.l0PitTraps
          : ((forMonster && state.zone === 'levelendless' && typeof Endless50K !== 'undefined' && Endless50K.getActivePits) ? Endless50K.getActivePits() : null);
        if (_pitList) {
          for (let pi = 0; pi < _pitList.length; pi++) {
            const pt = _pitList[pi];
            const minX = pt.x - pt.halfX - radius, maxX = pt.x + pt.halfX + radius;
            const minZ = pt.z - pt.halfZ - radius, maxZ = pt.z + pt.halfZ + radius;
            if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
              const penL = pos.x - minX, penR = maxX - pos.x, penT = pos.z - minZ, penB = maxZ - pos.z;
              const minP = Math.min(penL, penR, penT, penB);
              if (minP === penL) pos.x = minX;
              else if (minP === penR) pos.x = maxX;
              else if (minP === penT) pos.z = minZ;
              else pos.z = maxZ;
            }
          }
        }
        if (false) {
          for (let pi = 0; pi < window.l0PitTraps.length; pi++) {
            const pt = window.l0PitTraps[pi];
            const minX = pt.x - pt.halfX - radius, maxX = pt.x + pt.halfX + radius;
            const minZ = pt.z - pt.halfZ - radius, maxZ = pt.z + pt.halfZ + radius;
            if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
              const penL = pos.x - minX, penR = maxX - pos.x, penT = pos.z - minZ, penB = maxZ - pos.z;
              const minP = Math.min(penL, penR, penT, penB);
              if (minP === penL) pos.x = minX;
              else if (minP === penR) pos.x = maxX;
              else if (minP === penT) pos.z = minZ;
              else pos.z = maxZ;
            }
          }
        }
        const boxes = getZoneBoxes();
        for (let i = 0, blen = boxes.length; i < blen; i++) {
          const b = boxes[i];
          if ((Math.abs(pos.x - b.x) > 8.5 || Math.abs(pos.z - b.z) > 8.5) && b.halfX === undefined && b.halfZ === undefined) continue;
          if (b.upperWall && (state.zone !== 'level0' || pos.y < 3.6)) continue;
          if (!b.upperWall && state.zone === 'level0' && pos.y >= 3.6) continue;
          if (b.lockerRef && state.hiding && state.hideLocker === b.lockerRef) continue;
          if (b.ventCeil && state.crouching) continue;
          const hx = b.halfX !== undefined ? b.halfX : b.half;
          const hz = b.halfZ !== undefined ? b.halfZ : b.half;
          const minX = b.x - hx - radius;
          const maxX = b.x + hx + radius;
          const minZ = b.z - hz - radius;
          const maxZ = b.z + hz + radius;
          if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
            const penL = pos.x - minX;
            const penR = maxX - pos.x;
            const penT = pos.z - minZ;
            const penB = maxZ - pos.z;
            const minP = Math.min(penL, penR, penT, penB);
            if (minP === penL) pos.x = minX;
            else if (minP === penR) pos.x = maxX;
            else if (minP === penT) pos.z = minZ;
            else pos.z = maxZ;
          }
        }
      }

      function hasLineOfSight(ax, az, bx, bz) {
        const boxes = getZoneBoxes();
        const steps = 10;
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const px = ax + (bx - ax) * t;
          const pz = az + (bz - az) * t;
          for (let i = 0; i < boxes.length; i++) {
            const w = boxes[i];
            if (w.lockerRef) continue;
            const hx = w.halfX !== undefined ? w.halfX : w.half;
            const hz = w.halfZ !== undefined ? w.halfZ : w.half;
            if (Math.abs(px - w.x) < hx && Math.abs(pz - w.z) < hz) return false;
          }
        }
        return true;
      }

      function startKillAnimation() {
        if (state.killing || state.ended) return;
        state.killing = true; Sound.playVoice('vox_caught', 0.95, 8000);
        state.killTimer = 0;
        state.killSlash2 = false;
        state.hiding = false;
        elLockerOv.classList.remove('active');
        elInteractBtn.classList.remove('visible');
        Sound.jumpscareKill();
        elJumpFlash.classList.add('active');
        setTimeout(() => { elJumpFlash.classList.remove('active'); }, 180);
        if (navigator.vibrate) {
          try { navigator.vibrate([120, 45, 220, 45, 340]); } catch (e) {}
        }
      }

      function finishGame(won) {
        state.killing = false;
        elKillSlashes.classList.remove('active');
        camera.rotation.z = 0;
        state.ended = true;
        state.hiding = false;
        elLockerOv.classList.remove('active');
        const badge = document.getElementById('end-badge');
        const title = document.getElementById('end-title');
        const desc = document.getElementById('end-desc');
        document.getElementById('end-keys').textContent = state.keysCollected + ' / ' + state.totalKeys;
        document.getElementById('end-time').textContent = formatTime(state.elapsed);

        let best = parseFloat(LSget('zulmat_best_time') || '0') || 0;
        if (won) {
          Sound.win();
          if (best === 0 || state.elapsed < best) {
            best = state.elapsed;
            try { LSset('zulmat_best_time', String(best.toFixed(1))); } catch (e) {}
          }
          badge.textContent = "G'ALABA!";
          badge.style.background = 'rgba(34, 197, 94, 0.2)';
          badge.style.color = '#86efac';
          badge.style.borderColor = 'rgba(34, 197, 94, 0.6)';
          title.textContent = "ZULMATDAN QOCHIB QUTULDINGIZ!";
          desc.textContent = "Level 0 dagi barcha 8 ta kalitni topib, Backrooms labirintidan sog'-salomat chiqib ketdingiz.";
        } else {
          elJumpFlash.classList.add('active');
          setTimeout(() => elJumpFlash.classList.remove('active'), 380);
          badge.textContent = "QO'LGA TUSHDINGIZ";
          badge.style.background = 'rgba(239, 68, 68, 0.2)';
          badge.style.color = '#fca5a5';
          badge.style.borderColor = 'rgba(239, 68, 68, 0.6)';
          title.textContent = "SOYA SIZNI TOPDI";
          desc.textContent = "Yurak urishi tezlashganda metall shkafga yashirining va fonar batareyasini tejang.";
        }
        document.getElementById('end-best').textContent = best > 0 ? formatTime(best) : '--:--';
        Sound.crtBoot(); elEndOv.classList.remove('hidden');
      }

      // --- Tactical Corner Radar Drawing ---
      function drawRadar(monsterDist) {
        const rc = document.getElementById('radar-canvas');
        if (rc) rc.style.opacity = state.radarOn ? '1' : '0';
        if (!state.radarOn) return;
        const w = 84, h = 84, cx = 42, cy = 42;
        radarCtx.clearRect(0, 0, w, h);
        // Clean transparent white concentric radar rings + sweep sector
        radarCtx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        radarCtx.beginPath();
        radarCtx.moveTo(cx, cy);
        radarCtx.arc(cx, cy, 38, -Math.PI / 2, 0);
        radarCtx.closePath();
        radarCtx.fill();

        radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        radarCtx.lineWidth = 1.6;
        [12, 22, 31, 39].forEach((r) => {
          radarCtx.beginPath();
          radarCtx.arc(cx, cy, r, 0, Math.PI * 2);
          radarCtx.stroke();
        });
        radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        radarCtx.lineWidth = 1.1;
        radarCtx.beginPath();
        radarCtx.moveTo(cx - 39, cy); radarCtx.lineTo(cx + 39, cy);
        radarCtx.moveTo(cx, cy - 39); radarCtx.lineTo(cx, cy + 39);
        radarCtx.stroke();

        const scale = (state.zone === 'level94' || state.zone === 'level11' || state.zone === 'level10') ? 0.55 : (state.zone === 'level9' ? 0.72 : 1.15);
        const cosY = Math.cos(state.yaw);
        const sinY = Math.sin(state.yaw);

        function worldToRadar(wx, wz) {
          const dx = wx - state.pos.x;
          const dz = wz - state.pos.z;
          // Rotate relative to player heading (forward = -Z in Three.js camera)
          const rx = dx * cosY - dz * sinY;
          const rz = dx * sinY + dz * cosY;
          return { x: cx + rx * scale, y: cy + rz * scale };
        }

        // Draw active level objectives (Keys in L0, Generators in L1, Valves in L37)
        if (state.zone === 'level1') {
          l1Generators.forEach((g) => {
            if (g.active || Math.hypot(g.x - state.pos.x, g.z - state.pos.z) > 30) return;
            const pt = worldToRadar(g.x, g.z);
            const d = Math.hypot(pt.x - cx, pt.y - cy);
            const cl = Math.min(d, 36) / (d || 1);
            radarCtx.fillStyle = '#eab308';
            radarCtx.beginPath();
            radarCtx.arc(cx + (pt.x - cx) * cl, cy + (pt.y - cy) * cl, 3.0, 0, Math.PI * 2);
            radarCtx.fill();
          });
          if (Math.hypot(l1Exit.x - state.pos.x, l1Exit.z - state.pos.z) <= 32) {
            const ePt1 = worldToRadar(l1Exit.x, l1Exit.z);
            const ed1 = Math.hypot(ePt1.x - cx, ePt1.y - cy);
            const ecl1 = Math.min(ed1, 36) / (ed1 || 1);
            radarCtx.fillStyle = l1Exit.unlocked ? '#22c55e' : '#f97316';
            radarCtx.fillRect(cx + (ePt1.x - cx) * ecl1 - 3, cy + (ePt1.y - cy) * ecl1 - 3, 6, 6);
          }
        } else if (state.zone === 'level2') {
          l2Breakers.forEach((b) => {
            if (b.active || Math.hypot(b.x - state.pos.x, b.z - state.pos.z) > 30) return;
            const pt = worldToRadar(b.x, b.z);
            const d = Math.hypot(pt.x - cx, pt.y - cy);
            const cl = Math.min(d, 36) / (d || 1);
            radarCtx.fillStyle = '#f97316';
            radarCtx.beginPath();
            radarCtx.arc(cx + (pt.x - cx) * cl, cy + (pt.y - cy) * cl, 3.0, 0, Math.PI * 2);
            radarCtx.fill();
          });
          const ePt2 = worldToRadar(l2Exit.x, l2Exit.z);
          const ed2 = Math.hypot(ePt2.x - cx, ePt2.y - cy);
          const ecl2 = Math.min(ed2, 36) / (ed2 || 1);
          radarCtx.fillStyle = l2Exit.unlocked ? '#22c55e' : '#ef4444';
          radarCtx.fillRect(cx + (ePt2.x - cx) * ecl2 - 3, cy + (ePt2.y - cy) * ecl2 - 3, 6, 6);
        } else if (state.zone === 'level3' || state.zone === 'level4' || state.zone === 'level5') {
          const items345 = state.zone === 'level3' ? l3Breakers.filter((x) => !x.active)
            : (state.zone === 'level4' ? l4Badges.filter((x) => !x.taken) : l5Keys.filter((x) => !x.taken));
          items345.forEach((it) => {
            if (Math.hypot(it.x - state.pos.x, it.z - state.pos.z) > 28) return;
            const pt = worldToRadar(it.x, it.z);
            radarCtx.fillStyle = state.zone === 'level5' ? '#facc15' : '#38bdf8';
            radarCtx.beginPath(); radarCtx.arc(pt.x, pt.y, 3.0, 0, Math.PI * 2); radarCtx.fill();
          });
          const ex345 = state.zone === 'level3' ? l3Exit : (state.zone === 'level4' ? l4Exit : l5Exit);
          const ePt = worldToRadar(ex345.x, ex345.z);
          if (ex345.unlocked || Math.hypot(ex345.x - state.pos.x, ex345.z - state.pos.z) < 28) {
            const dE = Math.hypot(ePt.x - cx, ePt.y - cy);
            const cl = Math.min(dE, 36) / (dE || 1);
            radarCtx.fillStyle = ex345.unlocked ? '#22c55e' : '#facc15';
            radarCtx.fillRect(cx + (ePt.x - cx) * cl - 3.5, cy + (ePt.y - cy) * cl - 3.5, 7, 7);
          }
        } else if (state.zone === 'level9' || state.zone === 'level10' || state.zone === 'level11' || state.zone === 'levelend' || state.zone === 'level61') {
          const items = state.zone === 'level9' ? l9FuseBoxes.filter((x) => !x.fixed)
            : (state.zone === 'level10' ? l10Radios.filter((x) => !x.active)
            : (state.zone === 'level11' ? l11Cards.filter((x) => !x.taken)
            : (state.zone === 'levelend' ? lEndDisks.filter((x) => !x.taken) : l61Counters)));
          items.forEach((it) => {
            if (Math.hypot(it.x - state.pos.x, it.z - state.pos.z) > 65) return;
            const pt = worldToRadar(it.x, it.z);
            radarCtx.fillStyle = state.zone === 'level61' ? '#f472b6' : '#38bdf8';
            radarCtx.beginPath(); radarCtx.arc(pt.x, pt.y, 3.0, 0, Math.PI * 2); radarCtx.fill();
          });
          const exObj = state.zone === 'level9' ? l9Exit : (state.zone === 'level10' ? l10Exit : (state.zone === 'level11' ? l11Exit : (state.zone === 'levelend' ? lEndExit : l61Exit)));
          const ePtX = worldToRadar(exObj.x, exObj.z);
          const dEX = Math.hypot(ePtX.x - cx, ePtX.y - cy);
          const clX = Math.min(dEX, 36) / (dEX || 1);
          radarCtx.fillStyle = (exObj.unlocked || state.zone === 'level61') ? '#22c55e' : '#facc15';
          radarCtx.fillRect(cx + (ePtX.x - cx) * clX - 3.5, cy + (ePtX.y - cy) * clX - 3.5, 7, 7);
        } else if (state.zone === 'level6' || state.zone === 'level7' || state.zone === 'level8' || state.zone === 'level188' || state.zone === 'level974' || state.zone === 'level3999') {
          const itemsNew = state.zone === 'level6' ? l6Switches.filter((x) => !x.active)
            : (state.zone === 'level7' ? l7Buoys.filter((x) => !x.active)
            : (state.zone === 'level8' ? l8Crystals.filter((x) => !x.taken)
            : (state.zone === 'level188' ? l188Tvs.filter((x) => !x.taken)
            : (state.zone === 'level974' ? l974Items.filter((x) => !x.taken) : l3999Tasks.filter((x) => !x.done)))));
          itemsNew.forEach((it) => {
            const pt = worldToRadar(it.x, it.z);
            const dx = pt.x - cx, dy = pt.y - cy, d = Math.hypot(dx, dy);
            const cl = Math.min(d, 36) / (d || 1);
            radarCtx.fillStyle = state.zone === 'level974' ? '#f472b6' : (state.zone === 'level8' ? '#a78bfa' : '#38bdf8');
            radarCtx.beginPath(); radarCtx.arc(cx + dx * cl, cy + dy * cl, 3.0, 0, Math.PI * 2); radarCtx.fill();
          });
          const exNew = state.zone === 'level6' ? l6Exit
            : (state.zone === 'level7' ? l7Exit
            : (state.zone === 'level8' ? l8Exit
            : (state.zone === 'level188' ? l188Exit
            : (state.zone === 'level974' ? l974Exit : l3999Exit))));
          const ePt = worldToRadar(exNew.x, exNew.z);
          const dE = Math.hypot(ePt.x - cx, ePt.y - cy);
          const cl = Math.min(dE, 36) / (dE || 1);
          radarCtx.fillStyle = exNew.unlocked ? '#22c55e' : '#facc15';
          radarCtx.fillRect(cx + (ePt.x - cx) * cl - 3.5, cy + (ePt.y - cy) * cl - 3.5, 7, 7);
        } else if (state.zone === 'level94') {
          l94Houses.forEach((h) => {
            if (Math.hypot(h.x - state.pos.x, h.z - state.pos.z) > 80) return;
            const pt = worldToRadar(h.x, h.z);
            radarCtx.fillStyle = 'rgba(74, 222, 128, 0.65)';
            radarCtx.fillRect(pt.x - 3, pt.y - 3, 6, 6);
          });
          l94Orbs.forEach((o) => {
            if (o.collected || Math.hypot(o.x - state.pos.x, o.z - state.pos.z) > 78) return;
            const pt = worldToRadar(o.x, o.z);
            radarCtx.fillStyle = '#38bdf8';
            radarCtx.beginPath(); radarCtx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2); radarCtx.fill();
          });
          const ePt94 = worldToRadar(l94Exit.x, l94Exit.z);
          const dE94 = Math.hypot(ePt94.x - cx, ePt94.y - cy);
          if (l94Exit.unlocked || dE94 <= 38) {
            const cl = Math.min(dE94, 36) / (dE94 || 1);
            radarCtx.fillStyle = l94Exit.unlocked ? '#22c55e' : '#facc15';
            radarCtx.fillRect(cx + (ePt94.x - cx) * cl - 3.5, cy + (ePt94.y - cy) * cl - 3.5, 7, 7);
          }
        } else if (state.zone === 'levelfun') {
          lFunGifts.forEach((g) => {
            if (g.opened || Math.hypot(g.x - state.pos.x, g.z - state.pos.z) > 28) return;
            const pt = worldToRadar(g.x, g.z);
            const d = Math.hypot(pt.x - cx, pt.y - cy);
            const cl = Math.min(d, 36) / (d || 1);
            radarCtx.fillStyle = '#ec4899';
            radarCtx.beginPath();
            radarCtx.arc(cx + (pt.x - cx) * cl, cy + (pt.y - cy) * cl, 2.8, 0, Math.PI * 2);
            radarCtx.fill();
          });
          const ePtF = worldToRadar(lFunExit.x, lFunExit.z);
          const edF = Math.hypot(ePtF.x - cx, ePtF.y - cy);
          const eclF = Math.min(edF, 36) / (edF || 1);
          radarCtx.fillStyle = lFunExit.unlocked ? '#22c55e' : '#facc15';
          radarCtx.fillRect(cx + (ePtF.x - cx) * eclF - 3, cy + (ePtF.y - cy) * eclF - 3, 6, 6);
        } else if (state.zone === 'levelrun') {
          const ePtR = worldToRadar(lRunExit.x, lRunExit.z);
          const edR = Math.hypot(ePtR.x - cx, ePtR.y - cy);
          const eclR = Math.min(edR, 36) / (edR || 1);
          radarCtx.fillStyle = '#22c55e';
          radarCtx.fillRect(cx + (ePtR.x - cx) * eclR - 3, cy + (ePtR.y - cy) * eclR - 3, 6, 6);
        } else if (state.zone === 'level37') {
          const ePt37 = worldToRadar(l37Exit.x, l37Exit.z);
          const ed37 = Math.hypot(ePt37.x - cx, ePt37.y - cy);
          const ecl37 = Math.min(ed37, 36) / (ed37 || 1);
          radarCtx.fillStyle = '#22c55e';
          radarCtx.fillRect(cx + (ePt37.x - cx) * ecl37 - 3, cy + (ePt37.y - cy) * ecl37 - 3, 6, 6);
        } else if (state.zone === 'level0') keysList.forEach((k) => {
          if (k.collected) return;
          if (Math.hypot(k.x - state.pos.x, k.z - state.pos.z) > 28) return;
          const pt = worldToRadar(k.x, k.z);
          const d = Math.hypot(pt.x - cx, pt.y - cy);
          const cl = Math.min(d, 36) / (d || 1);
          radarCtx.fillStyle = '#facc15';
          radarCtx.beginPath();
          radarCtx.arc(cx + (pt.x - cx) * cl, cy + (pt.y - cy) * cl, 2.8, 0, Math.PI * 2);
          radarCtx.fill();
        });

        // Draw Exit gate (on Level 0 only visible when within 30m so the maze stays mysterious!)
        if (state.radarTimer > 0 || state.zone !== 'level0' || Math.hypot(exitInfo.x - state.pos.x, exitInfo.z - state.pos.z) <= 30) {
          const ePt = worldToRadar(exitInfo.x, exitInfo.z);
          const ed = Math.hypot(ePt.x - cx, ePt.y - cy);
          const ecl = Math.min(ed, 36) / (ed || 1);
          radarCtx.fillStyle = exitInfo.unlocked ? '#22c55e' : '#f97316';
          radarCtx.fillRect(cx + (ePt.x - cx) * ecl - 3, cy + (ePt.y - cy) * ecl - 3, 6, 6);
        }

        // Draw Stalker blip when within 18m (pulses red!)
        if (monsterDist < 26) {
          const mPt = worldToRadar(state.monsterPos.x, state.monsterPos.z);
          radarCtx.fillStyle = '#ef4444';
          radarCtx.beginPath();
          radarCtx.arc(mPt.x, mPt.y, 3.6, 0, Math.PI * 2);
          radarCtx.fill();
        }

        // Player center arrow
        radarCtx.fillStyle = '#38bdf8';
        radarCtx.beginPath();
        radarCtx.moveTo(cx, cy - 4);
        radarCtx.lineTo(cx - 3.2, cy + 3.5);
        radarCtx.lineTo(cx + 3.2, cy + 3.5);
        radarCtx.closePath();
        radarCtx.fill();
      }

      // --- Main Game Loop ---
      const clock = new THREE.Clock();
      let animT = 0;

      
      // ============================================================
      // ONLINE CO-OP MULTIPLAYER + PROXIMITY VOICE + 3D HAZMAT AVATAR
      // ============================================================

      // --- Two-Step Start Menu & Multi-Language Switcher (UZ / EN / RU) ---
      (function initPlayModesAndLang() {
        const mainMenu = document.getElementById('start-main-menu');
        const pmPanel = document.getElementById('play-mode-panel');
        const btnOpenPm = document.getElementById('btn-open-play-modes');
        const btnClosePm = document.getElementById('btn-close-play-modes');
        const btnOnlineAll = document.getElementById('btn-play-online-all');
        const showMain = () => { if (pmPanel) pmPanel.classList.add('hidden'); if (mainMenu) mainMenu.classList.remove('hidden'); };
        const showModes = () => { if (mainMenu) mainMenu.classList.add('hidden'); if (pmPanel) pmPanel.classList.remove('hidden'); };
        if (btnOpenPm) {
          btnOpenPm.addEventListener('click', () => {
            if (typeof Sound !== 'undefined') { Sound.init(); Sound.click(); }
            showModes();
          });
        }
        if (btnClosePm) {
          btnClosePm.addEventListener('click', () => {
            if (typeof Sound !== 'undefined') Sound.click();
            showMain();
          });
        }
        if (btnOnlineAll) {
          btnOnlineAll.addEventListener('click', () => {
            showMain();
            if (window.__zulmatStartEndless) window.__zulmatStartEndless();
          });
        }
        ['btn-start', 'btn-continue', 'btn-start-stations'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.addEventListener('click', () => {
            showMain();
            window.__zulmatGameMode = 'story';
            if (window.__zulmatLeaveCoop) window.__zulmatLeaveCoop();
          });
        });
        const _bCoopMenu = document.getElementById('btn-start-coop');
        if (_bCoopMenu) _bCoopMenu.addEventListener('click', showMain);

        const I18N = {
          uz: {
            play: "O'YNASH", skins: 'PERSONAJLAR', settings: 'SOZLAMALAR',
            pmBadge: 'REJIM TANLASH', pmTitle: "QAYSI REJIMDA O'YNAYSIZ?",
            offline: '1. OFLAYN (SYUJET)', onlineAll: '2. ONLAYN (HAMMA BILAN)',
            friends: "3. DO'STLAR BILAN (CO-OP)", endless: '4. CHEKSIZ REJIM',
            stations: 'BEKATLAR (31)', back: 'ORQAGA',
            setBadge: 'TIZIM SOZLAMALARI', setTitle: 'GRAFIKA VA BOSHQARUV',
            diffEasy: 'Oson', diffNorm: "O'rta", diffHard: "Qo'rqinchli",
            setOrient: "Ekran yo'nalishi", setVhs: 'VHS Kamera', setGfx: 'Grafika sifati',
            setFov: "Ko'rish burchagi (FOV)", setSens: 'Kamera tezligi',
            setRestart: 'Qayta Boshlash', setCredits: 'Mualliflar', setClose: 'Davom etish',
            coopBadge: 'Onlayn Co-op • Masofali Ovoz', coopTitle: "DO'STLAR BILAN O'YNASH",
            coopHost: 'XONA YARATISH', coopStart: 'BOSHLASH', coopJoin: 'KIRISH',
            coopSend: 'YUBORISH', coopClose: 'Yopish',
            stGo: 'BEKATGA BORISH >', stBack: '< ORQAGA',
            endBadge: "QO'LGA TUSHDINGIZ", endTitle: 'SOYA SIZNI TOPDI',
            endDesc: "Qorong'ida fonaringizni tejang va xavf yaqinlashganda metall shkafga yashirinib qoling.",
            endRetry: 'QAYTADAN URINISH', kpClr: 'TOZALASH', kpClose: 'YOPISH',
            lvlLoadTitle: 'BEKAT TAYYORLANMOQDA...', lvlLoadSub: 'TAYYORLANMOQDA...',
            skip: "O'TKAZIB YUBORISH"
          },
          en: {
            play: 'PLAY', skins: 'CHARACTERS', settings: 'SETTINGS',
            pmBadge: 'SELECT MODE', pmTitle: 'CHOOSE YOUR GAME MODE',
            offline: '1. OFFLINE (STORY)', onlineAll: '2. ONLINE (PUBLIC)',
            friends: '3. WITH FRIENDS (CO-OP)', endless: '4. ENDLESS MODE',
            stations: 'STATIONS (31)', back: 'BACK',
            setBadge: 'SYSTEM SETTINGS', setTitle: 'GRAPHICS & CONTROLS',
            diffEasy: 'Easy', diffNorm: 'Normal', diffHard: 'Nightmare',
            setOrient: 'Screen Orientation', setVhs: 'VHS Camera', setGfx: 'Graphics Quality',
            setFov: 'Field of View (FOV)', setSens: 'Camera Sensitivity',
            setRestart: 'Restart Level', setCredits: 'Credits', setClose: 'Resume',
            coopBadge: 'Online Co-op • Voice Chat', coopTitle: 'PLAY WITH FRIENDS',
            coopHost: 'CREATE ROOM', coopStart: 'START', coopJoin: 'JOIN',
            coopSend: 'SEND', coopClose: 'Close',
            stGo: 'GO TO STATION >', stBack: '< BACK',
            endBadge: 'YOU WERE CAUGHT', endTitle: 'THE ENTITY FOUND YOU',
            endDesc: 'Save your flashlight battery in the dark and hide inside a metal locker when danger approaches.',
            endRetry: 'TRY AGAIN', kpClr: 'CLEAR', kpClose: 'CLOSE',
            lvlLoadTitle: 'PREPARING STATION...', lvlLoadSub: 'ENTERING SECTOR...',
            skip: 'SKIP'
          },
          ru: {
            play: 'ИГРАТЬ', skins: 'ПЕРСОНАЖИ', settings: 'НАСТРОЙКИ',
            pmBadge: 'ВЫБОР РЕЖИМА', pmTitle: 'ВЫБЕРИТЕ РЕЖИМ ИГРЫ',
            offline: '1. ОФЛАЙН (СЮЖЕТ)', onlineAll: '2. ОНЛАЙН (СО ВСЕМИ)',
            friends: '3. С ДРУЗЬЯМИ (CO-OP)', endless: '4. БЕСКОНЕЧНЫЙ РЕЖИМ',
            stations: 'СТАНЦИИ (31)', back: 'НАЗАД',
            setBadge: 'СИСТЕМНЫЕ НАСТРОЙКИ', setTitle: 'ГРАФИКА И УПРАВЛЕНИЕ',
            diffEasy: 'Легко', diffNorm: 'Средне', diffHard: 'Кошмар',
            setOrient: 'Ориентация экрана', setVhs: 'VHS Камера', setGfx: 'Качество графики',
            setFov: 'Угол обзора (FOV)', setSens: 'Чувствительность',
            setRestart: 'Заново', setCredits: 'Авторы', setClose: 'Продолжить',
            coopBadge: 'Онлайн Co-op • Голосовой чат', coopTitle: 'ИГРА С ДРУЗЬЯМИ',
            coopHost: 'СОЗДАТЬ КОМНАТУ', coopStart: 'НАЧАТЬ', coopJoin: 'ВОЙТИ',
            coopSend: 'ОТПРАВИТЬ', coopClose: 'Закрыть',
            stGo: 'НА СТАНЦИЮ >', stBack: '< НАЗАД',
            endBadge: 'ВАС ПОЙМАЛИ', endTitle: 'СУЩНОСТЬ НАШЛА ВАС',
            endDesc: 'Берегите заряд фонарика в темноте и прячьтесь в металлический шкаф при приближении опасности.',
            endRetry: 'ПОПРОБОВАТЬ СНОВА', kpClr: 'ОЧИСТИТЬ', kpClose: 'ЗАКРЫТЬ',
            lvlLoadTitle: 'ПОДГОТОВКА СТАНЦИИ...', lvlLoadSub: 'ВХОД В СЕКТОР...',
            skip: 'ПРОПУСТИТЬ'
          }
        };
        window.__zulmatTr = function(uz, en, ru) {
          const l = window.__zulmatLang || 'uz';
          return l === 'en' ? (en || uz) : (l === 'ru' ? (ru || uz) : uz);
        };
        function applyLang(lang) {
          const t = I18N[lang] || I18N.uz;
          window.__zulmatLang = lang;
          try { LSset('zulmat_lang', lang); } catch (e) {}
          const setTxt = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
          const setSel = (sel, v) => { const e = document.querySelector(sel); if (e) e.textContent = v; };
          setTxt('lbl-menu-play', t.play);
          setTxt('btn-start-skins', t.skins);
          setTxt('btn-start-settings', t.settings);
          const bOff = document.getElementById('btn-start');
          if (bOff && bOff.lastChild) bOff.lastChild.textContent = ' ' + t.offline;
          setTxt('btn-play-online-all', t.onlineAll);
          setTxt('btn-start-coop', t.friends);
          setTxt('btn-start-stations', t.stations);
          setTxt('btn-close-play-modes', '< ' + t.back);

          setSel('#settings-overlay .badge-pill', t.setBadge);
          setSel('#settings-overlay h2', t.setTitle);
          setSel('#settings-overlay [data-diff="easy"]', t.diffEasy);
          setSel('#settings-overlay [data-diff="normal"]', t.diffNorm);
          setSel('#settings-overlay [data-diff="hard"]', t.diffHard);
          setSel('#btn-orient .set-title', t.setOrient);
          setSel('#btn-vhs .set-title', t.setVhs);
          setSel('#btn-gfx .set-title', t.setGfx);
          setTxt('btn-settings-restart', t.setRestart);
          setTxt('btn-open-credits', t.setCredits);
          setTxt('btn-close-settings', t.setClose);

          setSel('#coop-overlay .badge-pill', t.coopBadge);
          setSel('#coop-overlay h2', t.coopTitle);
          setTxt('btn-close-skins', lang === 'en' ? '< SAVE & BACK' : (lang === 'ru' ? '< СОХРАНИТЬ И НАЗАД' : '< SAQLASH VA ORQAGA'));
          setTxt('btn-coop-open-skins', lang === 'en' ? 'Change' : (lang === 'ru' ? 'Изменить' : "O'zgartirish"));
          setTxt('btn-coop-host', t.coopHost);
          setTxt('btn-coop-start', t.coopStart);
          setTxt('btn-coop-join', t.coopJoin);
          setTxt('btn-coop-send', t.coopSend);
          setTxt('btn-close-coop', t.coopClose);
          setTxt('btn-coop-net-online', lang === 'en' ? 'ONLINE' : (lang === 'ru' ? 'ОНЛАЙН' : 'ONLAYN'));
          setTxt('btn-coop-net-lan', lang === 'en' ? 'LOCAL WI-FI' : (lang === 'ru' ? 'ЛОКАЛЬНЫЙ WI-FI' : 'MAHALLIY WI-FI'));
          setTxt('btn-coop-leave', lang === 'en' ? 'LEAVE' : (lang === 'ru' ? 'ВЫЙТИ' : 'CHIQISH'));
          setTxt('coop-char-lbl', lang === 'en' ? 'Character:' : (lang === 'ru' ? 'Персонаж:' : 'Personaj:'));
          setTxt('coop-wait-lbl', lang === 'en' ? 'Waiting...' : (lang === 'ru' ? 'Ожидание...' : 'Kutilmoqda...'));
          setTxt('coop-players-hdr', lang === 'en' ? 'IN ROOM' : (lang === 'ru' ? 'В КОМНАТЕ' : 'XONADAGILAR'));
          setTxt('coop-chat-hdr', lang === 'en' ? 'ROOM CHAT' : (lang === 'ru' ? 'ЧАТ КОМНАТЫ' : 'XONA CHATI'));
          const rnI = document.getElementById('coop-room-name-inp');
          if (rnI) rnI.placeholder = lang === 'en' ? 'Room name (e.g. Zulmat)' : (lang === 'ru' ? 'Название комнаты' : 'Xona nomi (masalan: Zulmat)');
          const rpI = document.getElementById('coop-room-pass-inp');
          if (rpI) rpI.placeholder = lang === 'en' ? 'Password (optional)' : (lang === 'ru' ? 'Пароль (необяз.)' : 'Parol (ixtiyoriy)');
          const jpI = document.getElementById('coop-join-pass-inp');
          if (jpI) jpI.placeholder = lang === 'en' ? 'Password (if any)' : (lang === 'ru' ? 'Пароль (если есть)' : "Parol (bo'lsa)");
          const chI = document.getElementById('coop-chat-input');
          if (chI) chI.placeholder = lang === 'en' ? 'Type a message...' : (lang === 'ru' ? 'Напишите сообщение...' : 'Xabar yozing...');
          const modeOpts = {
            '0': lang === 'en' ? 'Story: Level 0 (The Lobby)' : (lang === 'ru' ? 'Сюжет: Уровень 0 (Лабиринт)' : 'Syujet: Level 0 (Labirint)'),
            'metro': lang === 'en' ? 'Story: Metro Hub (31 Stations)' : (lang === 'ru' ? 'Сюжет: Метро Хаб (31 станция)' : 'Syujet: Metro Hub (31 Bekat)'),
            'endless': lang === 'en' ? 'Endless Mode (50KM)' : (lang === 'ru' ? 'Бесконечный режим (50КМ)' : 'Cheksiz Rejim (50KM)')
          };
          document.querySelectorAll('#coop-mode-menu .z-dd-opt').forEach((o) => {
            const v = o.getAttribute('data-val');
            if (modeOpts[v]) o.textContent = modeOpts[v];
            if (o.classList.contains('active')) setTxt('coop-mode-label', o.textContent);
          });
          if (window.__zulmatRefreshCoopLang) window.__zulmatRefreshCoopLang();

          setTxt('btn-station-go', lang === 'en' ? 'DEPART >' : (lang === 'ru' ? 'ОТПРАВИТЬСЯ >' : 'BEKATGA BORISH >'));
          setTxt('btn-station-close', lang === 'en' ? '< BACK' : (lang === 'ru' ? '< НАЗАД' : '< ORQAGA'));
          setTxt('st-main-title', lang === 'en' ? 'SELECT STATION' : (lang === 'ru' ? 'ВЫБОР СТАНЦИИ' : 'BEKAT TANLASH'));
          setTxt('btn-metro-board', lang === 'en' ? 'SELECT STATION' : (lang === 'ru' ? 'ВЫБРАТЬ СТАНЦИЮ' : 'BEKAT TANLASH'));
          const stPills = document.querySelectorAll('#st-diff-seg [data-st-diff]');
          stPills.forEach((p) => {
            const k = p.getAttribute('data-st-diff');
            if (k === 'easy') p.textContent = lang === 'en' ? 'EASY' : (lang === 'ru' ? 'ЛЁГКИЙ' : 'OSON');
            else if (k === 'normal') p.textContent = lang === 'en' ? 'NORMAL' : (lang === 'ru' ? 'СРЕДНИЙ' : "O'RTA");
            else if (k === 'hard') p.textContent = lang === 'en' ? 'HARD' : (lang === 'ru' ? 'СЛОЖНЫЙ' : "QO'RQINCHLI");
          });
          document.querySelectorAll('.st-danger-bar').forEach((el) => {
            const tx = el.textContent || '';
            if (tx.includes('PAST') || tx.includes('LOW') || tx.includes('НИЗК')) el.textContent = lang === 'en' ? 'DANGER: LOW' : (lang === 'ru' ? 'ОПАСНОСТЬ: НИЗКАЯ' : 'XAVF: PAST');
            else if (tx.includes("O'RTA") || tx.includes('MEDIUM') || tx.includes('СРЕДН')) el.textContent = lang === 'en' ? 'DANGER: MEDIUM' : (lang === 'ru' ? 'ОПАСНОСТЬ: СРЕДНЯЯ' : "XAVF: O'RTA");
            else if (tx.includes('YUQORI') || tx.includes('HIGH') || tx.includes('ВЫСОК')) el.textContent = lang === 'en' ? 'DANGER: HIGH' : (lang === 'ru' ? 'ОПАСНОСТЬ: ВЫСОКАЯ' : 'XAVF: YUQORI');
            else if (tx.includes('EKSTREMAL') || tx.includes('EXTREME') || tx.includes('ЭКСТРЕМ')) el.textContent = lang === 'en' ? 'DANGER: EXTREME' : (lang === 'ru' ? 'ОПАСНОСТЬ: ЭКСТРЕМ.' : 'XAVF: EKSTREMAL');
          });
          const loreEl = document.getElementById('st-crt-lore');
          if (loreEl && (!loreEl.dataset.custom || loreEl.dataset.custom === '0')) {
            loreEl.innerHTML = lang === 'en'
              ? 'The Backrooms — endless liminal corridors beyond reality.<br>Walk quietly. Stay alert. Never look back.'
              : (lang === 'ru'
                ? 'Закулисье — бесконечный лабиринт пустых комнат за гранью реальности.<br>Идите тихо. Будьте начеку. Не оглядывайтесь.'
                : "Backrooms — borliqdan tashqaridagi cheksiz bo'sh xonalar labirinti.<br>Jim yuring. Hushyor bo'ling. Orqaga qaramang.");
          }
          setTxt('end-badge', t.endBadge);
          setTxt('end-title', t.endTitle);
          setTxt('end-desc', t.endDesc);
          setTxt('btn-retry', t.endRetry);
          setTxt('kp-clr', t.kpClr);
          setTxt('kp-close', t.kpClose);
          setTxt('lvl-load-title', t.lvlLoadTitle);
          setTxt('lvl-load-sub', t.lvlLoadSub);
          setTxt('btn-skip-intro', t.skip);
          setTxt('btn-skip-story-video', t.skip + ' >>');

          document.querySelectorAll('#lang-row .diff-btn').forEach((b) => {
            b.classList.toggle('selected', b.getAttribute('data-lang') === lang);
          });
        }
        document.querySelectorAll('#lang-row .diff-btn').forEach((b) => {
          b.addEventListener('click', () => {
            if (typeof Sound !== 'undefined') Sound.click();
            applyLang(b.getAttribute('data-lang') || 'uz');
          });
        });
        let savedLang = 'uz';
        try { savedLang = LSget('zulmat_lang') || 'uz'; } catch (e) {}
        applyLang(savedLang);
      })();

      // --- Coins, Pre-Level Items Shop & 25s Timed Radar ---
      (function initShopAndTimedRadar() {
        function getCoins() {
          try {
            const raw = LSget('zulmat_coins');
            if (raw === null) { LSset('zulmat_coins', '250'); return 250; }
            return Math.max(0, parseInt(raw, 10) || 0);
          } catch (e) { return 250; }
        }
        function setCoins(v) {
          try { LSset('zulmat_coins', String(Math.max(0, v | 0))); } catch (e) {}
          const el = document.getElementById('shop-coins-val');
          if (el) el.textContent = String(Math.max(0, v | 0));
        }
        window.__zulmatAddCoins = function(delta) { setCoins(getCoins() + delta); };

        // Procedural fallback Radar thumbnail icon (used if models/radar.glb is not uploaded yet)
        if (window.__zulmatGlbThumbs && !window.__zulmatGlbThumbs.radar) {
          const rc = document.createElement('canvas'); rc.width = 64; rc.height = 64;
          const rg = rc.getContext('2d');
          rg.strokeStyle = '#38bdf8'; rg.lineWidth = 3;
          rg.strokeRect(18, 18, 28, 22);
          rg.fillStyle = '#0ea5e9'; rg.fillRect(22, 22, 20, 14);
          rg.fillStyle = '#94a3b8'; rg.fillRect(28, 40, 8, 16); rg.fillRect(24, 6, 4, 12);
          window.__zulmatGlbThumbs.radar = rc.toDataURL('image/png');
        }

        function activateRadar() {
          if (!state.started || state.ended) return;
          if (state.radarTimer > 0) return;
          if (!(state.invRadar > 0)) {
            showToast(window.__zulmatTr ? window.__zulmatTr("Sizda Radar yo'q! Do'kondan oling.", "No Radar! Buy one in the shop.", "Нет радара! Купите в магазине.") : "Sizda Radar yo'q!");
            return;
          }
          state.invRadar--;
          state.radarTimer = 25.0;
          state.radarOn = true;
          if (typeof Sound !== 'undefined') Sound.pickup();
          showToast(window.__zulmatTr ? window.__zulmatTr("Radar yoqildi (25 soniya)!", "Radar active (25s)!", "Радар включён (25 сек)!") : "Radar yoqildi (25s)!");
          if (window.__zulmatSyncInv) window.__zulmatSyncInv();
        }
        window.__zulmatActivateRadar = activateRadar;

        const rWrap = document.querySelector('.radar-wrap');
        const rSlot = document.getElementById('inv-slot-radar');
        if (rWrap) {
          rWrap.style.pointerEvents = 'auto';
          rWrap.style.cursor = 'pointer';
          rWrap.addEventListener('click', activateRadar);
        }
        if (rSlot) rSlot.addEventListener('click', activateRadar);
        window.addEventListener('keydown', (e) => { if (e.code === 'KeyR') activateRadar(); });

        // Hook Radar slot into __zulmatSyncInv
        setInterval(() => {
          const cntR = document.getElementById('inv-cnt-radar');
          const imgR = document.getElementById('inv-img-radar');
          const n = state.invRadar || 0;
          if (rSlot) rSlot.classList.toggle('empty', !(n > 0));
          if (cntR) { cntR.textContent = String(n); cntR.style.display = n > 0 ? 'flex' : 'none'; }
          if (imgR && window.__zulmatGlbThumbs && window.__zulmatGlbThumbs.radar) {
            if (imgR.src !== window.__zulmatGlbThumbs.radar) imgR.src = window.__zulmatGlbThumbs.radar;
            if (n > 0) imgR.classList.add('ready'); else imgR.classList.remove('ready');
          }
        }, 450);

        // Pre-Level Shop UI logic
        const shopOv = document.getElementById('shop-overlay');
        let shopSel = 'almond';
        let pendingAction = null;
        const ITEMS = {
          almond: { price: 100, uz: ['Bodom suvi', 'Kuch va aql-idrokni 100% tiklaydi hamda fonarni quvvatlaydi.'], en: ['Almond Water', 'Restores stamina and sanity, and tastes surprisingly good.'], ru: ['Миндальная вода', 'Восстанавливает силы, рассудок и немного заряд фонарика.'] },
          battery: { price: 100, uz: ["Batareya", "Fonar quvvatini +50% ga to'ldiradi."], en: ['Battery', 'Recharges your flashlight by +50%.'], ru: ['Батарейка', 'Заряжает фонарик на +50%.'] },
          radar: { price: 200, uz: ["Radar", "Adashib qolmaslik uchun 25 soniya chiqish eshigi va maxluqni ko'rsatadi."], en: ['Radar', 'Shows exit direction & nearby entities for 25 seconds.'], ru: ['Радар', 'Показывает направление к выходу и сущностей на 25 секунд.'] }
        };
        function renderShop() {
          const lang = window.__zulmatLang || 'uz';
          const info = ITEMS[shopSel] || ITEMS.almond;
          setCoins(getCoins());
          document.getElementById('shop-own-almond').textContent = String(state.invAlmond || 0);
          document.getElementById('shop-own-battery').textContent = String(state.invBattery || 0);
          document.getElementById('shop-own-radar').textContent = String(state.invRadar || 0);
          document.getElementById('shop-sel-name').textContent = (info[lang] || info.uz)[0];
          document.getElementById('shop-sel-desc').textContent = (info[lang] || info.uz)[1];
          const bBuy = document.getElementById('btn-shop-buy');
          if (bBuy) bBuy.textContent = (lang === 'en' ? 'BUY (' : (lang === 'ru' ? 'КУПИТЬ (' : 'SOTIB OLISH (')) + info.price + ')';
          ['almond', 'battery', 'radar'].forEach((k) => {
            const el = document.getElementById('shop-item-' + k);
            if (el) el.classList.toggle('selected', k === shopSel);
          });
        }
        window.__zulmatOpenShop = function(onContinue) {
          pendingAction = onContinue;
          renderShop();
          if (shopOv) shopOv.classList.remove('hidden');
        };
        ['almond', 'battery', 'radar'].forEach((k) => {
          const el = document.getElementById('shop-item-' + k);
          if (el) el.addEventListener('click', () => { shopSel = k; if (typeof Sound !== 'undefined') Sound.click(); renderShop(); });
        });
        const bBuy = document.getElementById('btn-shop-buy');
        if (bBuy) bBuy.addEventListener('click', () => {
          const cost = (ITEMS[shopSel] || ITEMS.almond).price;
          const c = getCoins();
          if (c < cost) { showToast(window.__zulmatTr ? window.__zulmatTr("Tanga yetarli emas!", "Not enough coins!", "Недостаточно монет!") : "Tanga yetarli emas!"); return; }
          setCoins(c - cost);
          if (shopSel === 'almond') state.invAlmond = (state.invAlmond || 0) + 1;
          else if (shopSel === 'battery') state.invBattery = (state.invBattery || 0) + 1;
          else if (shopSel === 'radar') state.invRadar = (state.invRadar || 0) + 1;
          if (typeof Sound !== 'undefined') Sound.pickup();
          if (window.__zulmatSyncInv) window.__zulmatSyncInv();
          renderShop();
        });
        const bCont = document.getElementById('btn-shop-continue');
        if (bCont) bCont.addEventListener('click', () => {
          if (shopOv) shopOv.classList.add('hidden');
          if (pendingAction) { const fn = pendingAction; pendingAction = null; fn(); }
        });
        const bBack = document.getElementById('btn-shop-back');
        if (bBack) bBack.addEventListener('click', () => {
          if (shopOv) shopOv.classList.add('hidden');
          pendingAction = null;
          if (typeof elStationOv !== 'undefined' && elStationOv) elStationOv.classList.remove('hidden');
        });
      })();

