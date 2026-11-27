      const CoopSystem = (function() {
        const peers = {}; // peerId -> { conn, call, audioEl, name, zone, targetPos, targetYaw, flashOn, walking, avatar }
        let peer = null;
        let roomCode = '';
        let isHost = false;
        let localStream = null;
        let micEnabled = false;
        let sendTimer = 0;
        let peerJsLoaded = false;

        function setStatus(msg, color = '#94a3b8') {
          const el = document.getElementById('coop-status');
          if (el) { el.textContent = msg; el.style.color = color; }
        }

        function getMyName() {
          const inp = document.getElementById('coop-name');
          const v = (inp && inp.value.trim()) ? inp.value.trim().slice(0, 16) : 'Sayohatchi';
          try { LSset('zulmat_player_name', v); } catch (e) {}
          return v;
        }

        function makeNameSprite(text) {
          const cv = document.createElement('canvas');
          cv.width = 256; cv.height = 64;
          const cx = cv.getContext('2d');
          cx.fillStyle = 'rgba(9,11,15,0.72)';
          cx.fillRect(16, 10, 224, 44);
          cx.strokeStyle = 'rgba(250,204,21,0.75)';
          cx.lineWidth = 3;
          cx.strokeRect(16, 10, 224, 44);
          cx.fillStyle = '#fef08a';
          cx.font = 'bold 26px system-ui, sans-serif';
          cx.textAlign = 'center';
          cx.textBaseline = 'middle';
          cx.fillText(text, 128, 33);
          const tex = new THREE.CanvasTexture(cv);
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
          const sp = new THREE.Sprite(mat);
          sp.scale.set(1.35, 0.34, 1);
          sp.position.set(0, 2.08, 0);
          return sp;
        }

        let mySkin = 'businessman';
        try { mySkin = LSget('zulmat_player_skin') || 'businessman'; } catch (e) {}
        function createHazmatAvatar(playerName, skinKey = 'man') {
          const root = new THREE.Group();
          const suitMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.65, metalness: 0.08 });
          const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.35 });
          const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.12, metalness: 0.85 });
          const bootMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });

          const procGroup = new THREE.Group();
          const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.28), suitMat);
          torso.position.y = 1.06;
          const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.44, 0.16), darkMat);
          pack.position.set(0, 1.1, 0.2);
          const hood = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), suitMat);
          hood.position.set(0, 1.58, 0);
          const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.12), visorMat);
          visor.position.set(0, 1.59, -0.17);

          const legL = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.72, 0.2), suitMat);
          legL.position.set(-0.14, 0.38, 0);
          const legR = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.72, 0.2), suitMat);
          legR.position.set(0.14, 0.38, 0);
          const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.14, 0.28), bootMat);
          bootL.position.set(0, -0.34, -0.04); legL.add(bootL);
          const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.14, 0.28), bootMat);
          bootR.position.set(0, -0.34, -0.04); legR.add(bootR);

          const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.62, 0.16), suitMat);
          armL.position.set(-0.35, 1.08, 0);
          const armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.62, 0.16), suitMat);
          armR.position.set(0.35, 1.08, -0.12);
          armR.rotation.x = 0.75;

          const torchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.22, 8), darkMat);
          torchBody.rotation.x = Math.PI / 2;
          torchBody.position.set(0, -0.26, -0.14);
          armR.add(torchBody);

          procGroup.add(torso, pack, hood, visor, legL, legR, armL, armR);
          root.add(procGroup);

          // Live flashlight beam cone + warm light
          const beamCone = new THREE.Mesh(
            new THREE.ConeGeometry(1.1, 4.8, 12, 1, true),
            new THREE.MeshBasicMaterial({ color: 0xfff6d1, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })
          );
          beamCone.rotation.x = -Math.PI / 2;
          beamCone.position.set(0.35, 1.25, -2.6);
          const flashLight = new THREE.PointLight(0xfff6d1, 1.2, 11);
          flashLight.position.set(0.35, 1.32, -0.8);
          root.add(beamCone, flashLight);

          const label = makeNameSprite(playerName || 'Do\'st');
          root.add(label);

          const skinFiles = {
            businessman: 'player_businessman.glb', tvman: 'player_tvman.glb', casual: 'player_casual.glb',
            man: 'player_man.glb', girl: 'player_girl.glb', hazmat: 'player_hazmat.glb', survivor: 'player_survivor.glb'
          };
          const glbFile = skinFiles[skinKey] || 'player_businessman.glb';
          const avatarObj = { root, legL, legR, armL, beamCone, flashLight, label, mixer: null, walkAct: null, idleAct: null, isWalking: false };
          if (typeof gltfLoader !== 'undefined' && gltfLoader && typeof REPO_GLB_BASE !== 'undefined') {
            gltfLoader.load(REPO_GLB_BASE + glbFile, (gltf) => {
              try {
                const mdl = gltf.scene;
                const bx = new THREE.Box3().setFromObject(mdl);
                const sz = new THREE.Vector3(); bx.getSize(sz);
                const sc = 1.75 / Math.max(sz.y || 1, 0.01);
                mdl.scale.setScalar(sc);
                mdl.updateMatrixWorld(true);
                const bx2 = new THREE.Box3().setFromObject(mdl);
                const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
                mdl.position.set(-ctr.x, -bx2.min.y, -ctr.z);
                root.add(mdl);
                procGroup.visible = false;
                if (gltf.animations && gltf.animations.length > 0) {
                  const mx = new THREE.AnimationMixer(mdl);
                  const wClip = gltf.animations.find((a) => /walk|run|mixamo|take/i.test(a.name)) || gltf.animations[0];
                  const iClip = gltf.animations.find((a) => /idle|standing_01|pose/i.test(a.name)) || wClip;
                  avatarObj.mixer = mx;
                  avatarObj.walkAct = mx.clipAction(wClip);
                  avatarObj.idleAct = mx.clipAction(iClip);
                  avatarObj.idleAct.play();
                }
              } catch (e) {}
            }, undefined, () => {});
          }

          root.visible = false;
          scene.add(root);
          return avatarObj;
        }

        function ensurePeerJs(cb) {
          if (window.Peer) { cb(); return; }
          if (peerJsLoaded) { setStatus("PeerJS kutubxonasi yuklanmoqda...", "#facc15"); return; }
          peerJsLoaded = true;
          setStatus("Onlayn modul yuklanmoqda...", "#facc15");
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
          s.onload = () => cb();
          s.onerror = () => { peerJsLoaded = false; setStatus("Internet aloqasi yo'q — yolg'iz oflayn rejimda o'ynashingiz mumkin.", "#f87171"); };
          document.head.appendChild(s);
        }

        function setupConn(conn) {
          const pid = conn.peer;
          if (!peers[pid]) {
            peers[pid] = {
              conn, call: null, audioEl: null, name: 'Do\'st', zone: '',
              targetPos: new THREE.Vector3(0, 0, 0), targetYaw: 0, flashOn: true, walking: false,
              avatar: createHazmatAvatar('Do\'st'), phase: Math.random() * 6
            };
          } else {
            peers[pid].conn = conn;
          }
          conn.on('open', () => {
            conn.send({ t: 'hello', name: getMyName(), skin: mySkin, zone: state.zone });
            updatePeerCount();
            if (micEnabled && localStream && peer) {
              try {
                const call = peer.call(pid, localStream);
                attachCall(pid, call);
              } catch (e) {}
            }
            if (typeof showToast === 'function') showToast("Do'stingiz Co-op xonaga qo'shildi!", 3500);
          });
          conn.on('data', (d) => {
              if (d && (d.t === 'chat' || d.t === 'start') && window.__zulmatOnCoopMsg) { window.__zulmatOnCoopMsg(d); return; }
              if (d && d.t === 'pos' && !isHost && d.z === state.zone && typeof d.mx === 'number' && state.monsterPos) {
                state.monsterPos.x += (d.mx - state.monsterPos.x) * 0.45;
                state.monsterPos.z += (d.mz - state.monsterPos.z) * 0.45;
                state.monsterYaw = d.my || state.monsterYaw;
                state.monsterChasing = !!d.mc;
              }
            const p = peers[pid];
            if (!p || !d) return;
            if (d.t === 'hello' && d.name) {
              p.name = String(d.name).slice(0, 16);
              const sk = ['businessman','tvman','casual','man','girl','hazmat','survivor'].includes(d.skin) ? d.skin : 'businessman';
              if (p.avatar) scene.remove(p.avatar.root);
              p.avatar = createHazmatAvatar(p.name, sk);
              updatePeerCount();
            } else if (d.t === 'pos') {
              p.zone = d.z || '';
              p.targetPos.set(d.x || 0, (d.y || 1.65) - 1.65, d.zz || 0);
              p.targetYaw = d.yaw || 0;
              p.flashOn = !!d.fl;
              p.walking = !!d.wk;
              // Relay to other peers if host
              if (isHost) {
                Object.keys(peers).forEach((otherId) => {
                  if (otherId !== pid && peers[otherId].conn && peers[otherId].conn.open) {
                    peers[otherId].conn.send({ t: 'relay', from: pid, name: p.name, data: d });
                  }
                });
              }
            } else if (d.t === 'relay' && d.from && d.from !== (peer && peer.id)) {
              const rid = d.from;
              if (!peers[rid]) {
                peers[rid] = {
                  conn: null, call: null, audioEl: null, name: d.name || 'Do\'st', zone: '',
                  targetPos: new THREE.Vector3(), targetYaw: 0, flashOn: true, walking: false,
                  avatar: createHazmatAvatar(d.name || 'Do\'st'), phase: Math.random() * 6
                };
              }
              const rp = peers[rid];
              const rd = d.data || {};
              rp.zone = rd.z || '';
              rp.targetPos.set(rd.x || 0, (rd.y || 1.65) - 1.65, rd.zz || 0);
              rp.targetYaw = rd.yaw || 0;
              rp.flashOn = !!rd.fl;
              rp.walking = !!rd.wk;
            }
          });
          conn.on('close', () => {
            if (peers[pid]) {
              if (peers[pid].avatar) scene.remove(peers[pid].avatar.root);
              if (peers[pid].audioEl) { peers[pid].audioEl.pause(); peers[pid].audioEl.srcObject = null; }
              delete peers[pid];
              updatePeerCount();
            }
          });
        }

        function attachCall(pid, call) {
          if (!call) return;
          call.on('stream', (remoteStream) => {
            if (!peers[pid]) return;
            let a = peers[pid].audioEl;
            if (!a) {
              a = new Audio();
              a.autoplay = true;
              peers[pid].audioEl = a;
            }
            a.srcObject = remoteStream;
            a.play().catch(() => {});
          });
        }

        function updatePeerCount() {
          const igW = document.getElementById('ingame-chat-wrap');
          if (igW) igW.classList.toggle('hidden', Object.keys(conns).length === 0);
          const names = Object.values(peers).map((p) => p.name);
          if (isHost) {
            setStatus("Xona kodi: " + roomCode + " • Ulanganlar (" + names.length + "): " + (names.length ? names.join(', ') : "Do'stingiz kutilmoqda..."), "#4ade80");
          } else if (roomCode) {
            setStatus("Xona " + roomCode + " ga ulandi! Jamoa: " + (names.length ? names.join(', ') : 'Host'), "#4ade80");
          }
        }

        function hostRoom() {
          ensurePeerJs(() => {
            if (peer) { try { peer.destroy(); } catch (e) {} }
            roomCode = String(Math.floor(1000 + Math.random() * 9000));
            isHost = true;
            setStatus("Xona yaratilmoqda (" + roomCode + ")...", "#facc15");
            peer = new window.Peer('zulmat-br-' + roomCode, { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
            peer.on('open', () => {
              updatePeerCount();
              if (navigator.clipboard) navigator.clipboard.writeText(roomCode).catch(() => {});
            });
            peer.on('connection', (conn) => setupConn(conn));
            peer.on('call', (call) => {
              call.answer(localStream || undefined);
              attachCall(call.peer, call);
            });
            peer.on('error', (err) => setStatus("Xato: " + (err.type || err.message), "#f87171"));
          });
        }

        function joinRoom(code) {
          const clean = String(code || '').replace(/[^0-9A-Za-z]/g, '').trim();
          if (clean.length < 4) { setStatus("4 xonali xona kodini kiriting!", "#facc15"); return; }
          ensurePeerJs(() => {
            if (peer) { try { peer.destroy(); } catch (e) {} }
            roomCode = clean;
            isHost = false;
            setStatus("Xona " + clean + " ga ulanilmoqda...", "#facc15");
            peer = new window.Peer({ config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
            peer.on('open', () => {
              const conn = peer.connect('zulmat-br-' + clean, { reliable: false });
              setupConn(conn);
            });
            peer.on('call', (call) => {
              call.answer(localStream || undefined);
              attachCall(call.peer, call);
            });
            let retried = false;
            peer.on('error', (err) => {
              if (!retried && err && err.type === 'peer-unavailable') {
                retried = true;
                setStatus("Xona izlanmoqda (" + clean + ")...", "#facc15");
                setTimeout(() => {
                  try {
                    const c2 = peer.connect('zulmat-br-' + clean, { reliable: false });
                    setupConn(c2);
                  } catch (e) {}
                }, 1200);
                return;
              }
              setStatus("Ulanib bo'lmadi (" + (err.type || 'kod xato') + ")", "#f87171");
            });
          });
        }

        function toggleMic() {
          const btn = document.getElementById('btn-coop-mic');
          if (micEnabled) {
            micEnabled = false;
            if (localStream) { localStream.getTracks().forEach((t) => t.stop()); localStream = null; }
            if (btn) btn.textContent = "MIKROFON: O'CHIQ";
            return;
          }
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setStatus("Brauzerda mikrofon ruxsati mavjud emas.", "#f87171");
            return;
          }
          navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
            localStream = stream;
            micEnabled = true;
            if (btn) btn.textContent = "MIKROFON: YONIQ";
            if (peer) {
              Object.keys(peers).forEach((pid) => {
                if (peers[pid].conn && peers[pid].conn.open) {
                  try { attachCall(pid, peer.call(pid, localStream)); } catch (e) {}
                }
              });
            }
          }).catch(() => setStatus("Mikrofon ruxsati berilmadi.", "#f87171"));
        }

        function tick(dt) {
          if (!peer) return;
          sendTimer += dt;
          if (sendTimer >= 0.065) {
            sendTimer = 0;
            const pkt = {
              t: 'pos',
              z: state.zone,
              x: Number(state.pos.x.toFixed(2)),
              y: Number(state.pos.y.toFixed(2)),
              zz: Number(state.pos.z.toFixed(2)),
              yaw: Number(state.yaw.toFixed(2)),
              fl: !!state.flashlightOn,
              wk: Math.hypot(state.vel ? state.vel.x : 0, state.vel ? state.vel.z : 0) > 0.25
            };
            if (isHost && state.monsterPos) {
              pkt.mx = Number(state.monsterPos.x.toFixed(2));
              pkt.mz = Number(state.monsterPos.z.toFixed(2));
              pkt.my = Number((state.monsterYaw || 0).toFixed(2));
              pkt.mc = !!state.monsterChasing;
            }
            Object.values(peers).forEach((p) => {
              if (p.conn && p.conn.open) { try { p.conn.send(pkt); } catch (e) {} }
            });
          }
          Object.values(peers).forEach((p) => {
            if (!p.avatar) return;
            const sameZone = (p.zone === state.zone);
            p.avatar.root.visible = sameZone;
            if (sameZone) {
              p.avatar.root.position.lerp(p.targetPos, Math.min(1, dt * 12));
              p.avatar.root.rotation.y = p.targetYaw;
              p.avatar.beamCone.visible = p.flashOn;
              p.avatar.flashLight.intensity = p.flashOn ? 1.2 : 0;
              if (p.avatar.mixer) {
                p.avatar.mixer.update(dt);
                if (p.walking && !p.avatar.isWalking && p.avatar.walkAct) {
                  p.avatar.isWalking = true;
                  if (p.avatar.idleAct && p.avatar.idleAct !== p.avatar.walkAct) p.avatar.idleAct.stop();
                  p.avatar.walkAct.reset().play();
                } else if (!p.walking && p.avatar.isWalking && p.avatar.idleAct) {
                  p.avatar.isWalking = false;
                  if (p.avatar.walkAct && p.avatar.idleAct !== p.avatar.walkAct) p.avatar.walkAct.stop();
                  p.avatar.idleAct.reset().play();
                }
              }
              if (p.walking) {
                p.phase += dt * 9;
                const sw = Math.sin(p.phase) * 0.45;
                p.avatar.legL.rotation.x = sw;
                p.avatar.legR.rotation.x = -sw;
                p.avatar.armL.rotation.x = -sw * 0.6;
              } else {
                p.avatar.legL.rotation.x *= 0.85;
                p.avatar.legR.rotation.x *= 0.85;
                p.avatar.armL.rotation.x *= 0.85;
              }
            }
            // Proximity Voice Chat distance attenuation (0m..30m)
            if (p.audioEl) {
              if (!sameZone) { p.audioEl.volume = 0.05; }
              else {
                const dist = Math.hypot(state.pos.x - p.targetPos.x, state.pos.z - p.targetPos.z);
                p.audioEl.volume = Math.max(0, Math.min(1, 1 - (dist - 3) / 27));
              }
            }
          });
        }

        // Bind UI
        const coopOv = document.getElementById('coop-overlay');
        const nameInp = document.getElementById('coop-name');
        try {
          const savedName = LSget('zulmat_player_name');
          if (savedName && nameInp) nameInp.value = savedName;
        } catch (e) {}
        const bOpen = document.getElementById('btn-start-coop');
        const bClose = document.getElementById('btn-close-coop');
        const bHost = document.getElementById('btn-coop-host');
        const bJoin = document.getElementById('btn-coop-join');
        const bMic = document.getElementById('btn-coop-mic');
        const cInp = document.getElementById('coop-code-input');
        const SKIN_LABELS = { businessman: 'Biznesmen', tvman: 'TV-Man', casual: 'Sayohatchi', man: 'Yigit', girl: 'Qiz', hazmat: 'Hazmat', survivor: 'Omon Qoluvchi' };
        window.__zulmatSyncCharSummary = () => {
          const el = document.getElementById('coop-char-summary');
          if (!el) return;
          const nm = (nameInp && nameInp.value.trim()) ? nameInp.value.trim().slice(0, 16) : (LSget('zulmat_player_name') || 'Murodjon');
          el.textContent = nm + ' • ' + (SKIN_LABELS[mySkin] || 'Biznesmen');
        };
        if (nameInp) nameInp.addEventListener('input', () => {
          const v = nameInp.value.trim().slice(0, 16);
          if (v) try { LSset('zulmat_player_name', v); } catch (e) {}
          window.__zulmatSyncCharSummary();
        });
        const bCoopOpenSkins = document.getElementById('btn-coop-open-skins');
        if (bCoopOpenSkins) bCoopOpenSkins.addEventListener('click', () => {
          if (coopOv) coopOv.classList.add('hidden');
          const st = document.getElementById('start-overlay');
          const mm = document.getElementById('start-main-menu');
          const sk = document.getElementById('start-skins-panel');
          if (st) st.classList.add('skins-open');
          if (mm) mm.classList.add('hidden');
          if (sk) sk.classList.remove('hidden');
          if (window.__zulmatUpdateSkinPreview) window.__zulmatUpdateSkinPreview();
        });
        if (bOpen && coopOv) bOpen.addEventListener('click', () => {
          const pmp = document.getElementById('play-mode-panel');
          const smm = document.getElementById('start-main-menu');
          if (pmp) pmp.classList.add('hidden');
          if (smm) smm.classList.remove('hidden');
          window.__zulmatSyncCharSummary();
          coopOv.classList.remove('hidden');
        });
        if (bClose && coopOv) bClose.addEventListener('click', () => coopOv.classList.add('hidden'));
        if (bHost) bHost.addEventListener('click', hostRoom);
        if (bJoin) bJoin.addEventListener('click', () => joinRoom(cInp ? cInp.value : ''));
        if (bMic) bMic.addEventListener('click', toggleMic);
        const skinBtns = {
          businessman: document.getElementById('btn-skin-businessman'),
          tvman: document.getElementById('btn-skin-tvman'),
          casual: document.getElementById('btn-skin-casual'),
          man: document.getElementById('btn-skin-man'),
          girl: document.getElementById('btn-skin-girl'),
          hazmat: document.getElementById('btn-skin-hazmat'),
          survivor: document.getElementById('btn-skin-survivor')
        };
        const syncSkinUI = () => {
          Object.keys(skinBtns).forEach((k) => { if (skinBtns[k]) skinBtns[k].classList.toggle('active', mySkin === k); });
        };
        syncSkinUI();
        Object.keys(skinBtns).forEach((k) => {
          if (skinBtns[k]) skinBtns[k].addEventListener('click', () => {
            if (window.__zulmatIsSkinUnlocked && !window.__zulmatIsSkinUnlocked(k)) return;
            mySkin = k;
            try { LSset('zulmat_player_skin', mySkin); LSset('zulmat_skin', mySkin); } catch (e) {}
            syncSkinUI();
            if (window.__zulmatSyncCharSummary) window.__zulmatSyncCharSummary();
          });
        });

        const chatLog = document.getElementById('coop-chat-log');
        const chatInp = document.getElementById('coop-chat-input');
        const btnSend = document.getElementById('btn-coop-send');
        const btnStartCoop = document.getElementById('btn-coop-start');
        const modeSel = document.getElementById('coop-mode-select');
        const modeBtn = document.getElementById('coop-mode-btn');
        const modeLbl = document.getElementById('coop-mode-label');
        const modeMenu = document.getElementById('coop-mode-menu');
        if (modeBtn && modeMenu) {
          modeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = modeMenu.classList.toggle('hidden') === false;
            modeBtn.classList.toggle('open', open);
          });
          modeMenu.querySelectorAll('.z-dd-opt').forEach((opt) => {
            opt.addEventListener('click', (e) => {
              e.stopPropagation();
              const v = opt.getAttribute('data-val') || '0';
              if (modeSel) modeSel.value = v;
              if (modeLbl) modeLbl.textContent = opt.textContent;
              modeMenu.querySelectorAll('.z-dd-opt').forEach((o) => o.classList.toggle('active', o === opt));
              modeMenu.classList.add('hidden');
              modeBtn.classList.remove('open');
            });
          });
          document.addEventListener('click', () => {
            if (!modeMenu.classList.contains('hidden')) {
              modeMenu.classList.add('hidden');
              modeBtn.classList.remove('open');
            }
          });
        }
        const igWrap = document.getElementById('ingame-chat-wrap');
        const igMsgs = document.getElementById('ingame-chat-msgs');
        const igInp = document.getElementById('ingame-chat-inp');
        const igBtn = document.getElementById('btn-ingame-chat-send');
        let _lastChatT = 0;
        function chatRateOk() {
          const n = Date.now();
          if (n - _lastChatT < 700) return false;
          _lastChatT = n;
          return true;
        }
        function mkChatRow(sender, text, color) {
          const row = document.createElement('div');
          const st = document.createElement('strong');
          st.style.color = color;
          st.textContent = String(sender).slice(0, 24) + ':';
          row.appendChild(st);
          row.appendChild(document.createTextNode(' ' + String(text).slice(0, 200)));
          return row;
        }
        function appendChat(sender, text) {
          if (!chatLog || !text) return;
          chatLog.appendChild(mkChatRow(sender, text, '#fde047'));
          while (chatLog.children.length > 60) chatLog.removeChild(chatLog.firstChild);
          chatLog.scrollTop = chatLog.scrollHeight;
          if (igMsgs) {
            igMsgs.appendChild(mkChatRow(sender, text, '#7dd3fc'));
            while (igMsgs.children.length > 60) igMsgs.removeChild(igMsgs.firstChild);
            igMsgs.scrollTop = igMsgs.scrollHeight;
          }
        }
        function sendInGameChat() {
          if (!igInp) return;
          const txt = igInp.value.trim().slice(0, 200);
          if (!txt || !chatRateOk()) return;
          igInp.value = '';
          const myN = (document.getElementById('coop-name') && document.getElementById('coop-name').value.trim()) || 'Men';
          appendChat(myN, txt);
          Object.values(conns).forEach((c) => { if (c && c.open) { try { c.send({ t: 'chat', name: myN, text: txt }); } catch (e) {} } });
        }
        if (igBtn) igBtn.addEventListener('click', sendInGameChat);
        if (igInp) igInp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') sendInGameChat(); });
        function sendChatMsg() {
          if (!chatInp) return;
          const txt = chatInp.value.trim().slice(0, 200);
          if (!txt || !chatRateOk()) return;
          chatInp.value = '';
          const myN = (document.getElementById('coop-name') && document.getElementById('coop-name').value.trim()) || 'Men';
          appendChat(myN, txt);
          Object.values(conns).forEach((c) => { if (c && c.open) { try { c.send({ t: 'chat', name: myN, text: txt }); } catch (e) {} } });
        }
        if (btnSend) btnSend.addEventListener('click', sendChatMsg);
        if (chatInp) chatInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMsg(); });

        function launchCoopMode(modeVal) {
          const co = document.getElementById('coop-overlay');
          const st = document.getElementById('start-overlay');
          if (co) co.classList.add('hidden');
          if (st) st.classList.add('hidden');
          if (window.__zulmatStopStartMenuBgm) window.__zulmatStopStartMenuBgm();
          document.body.classList.add('game-started');
          state.started = true;
          state.paused = false;
          if (modeVal === 'endless' && window.__zulmatStartEndless) { window.__zulmatStartEndless(); return; }
          if (modeVal === 'metro') { enterMetroLobby(false); return; }
          const lvlKey = isNaN(modeVal) ? modeVal : Number(modeVal);
          resetGame(lvlKey);
        }
        if (btnStartCoop) btnStartCoop.addEventListener('click', () => {
          const mv = modeSel ? modeSel.value : '0';
          Object.values(conns).forEach((c) => { if (c && c.open) { try { c.send({ t: 'start', mode: mv }); } catch (e) {} } });
          launchCoopMode(mv);
        });
        window.__zulmatOnCoopMsg = (d) => {
          if (!d) return;
          if (d.t === 'chat') appendChat(d.name || "Do'st", d.text || '');
          if (d.t === 'start') launchCoopMode(d.mode || '0');
        };
        function joinPublicEndless() {
          ensurePeerJs(() => {
            if (peer) { try { peer.destroy(); } catch (e) {} }
            const pubId = 'zulmat-br-ENDLESSPUBLIC';
            roomCode = 'ENDLESSPUBLIC';
            isHost = false;
            peer = new window.Peer({ config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
            peer.on('open', () => {
              const conn = peer.connect(pubId, { reliable: false });
              setupConn(conn);
              const cw = document.getElementById('ingame-chat-wrap');
              if (cw) cw.classList.remove('hidden');
            });
            peer.on('call', (call) => {
              call.answer(localStream || undefined);
              attachCall(call.peer, call);
            });
            peer.on('error', (err) => {
              if (err && err.type === 'peer-unavailable') {
                // No public host yet -> become the shared Endless host automatically!
                try { peer.destroy(); } catch (e) {}
                isHost = true;
                peer = new window.Peer(pubId, { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } });
                peer.on('open', () => {
                  const cw = document.getElementById('ingame-chat-wrap');
                  if (cw) cw.classList.remove('hidden');
                  if (typeof showToast === 'function') showToast("Onlayn Cheksiz server yaratildi — boshqa o'yinchilar ulanishi mumkin!");
                });
                peer.on('connection', (conn) => {
                  setupConn(conn);
                  if (typeof showToast === 'function') showToast("Yangi o'yinchi onlayn Cheksiz dunyoga kirdi!");
                });
                peer.on('call', (call) => {
                  call.answer(localStream || undefined);
                  attachCall(call.peer, call);
                });
              }
            });
          });
        }
        window.__zulmatJoinPublicEndless = joinPublicEndless;

        return { tick, joinPublicEndless };
      })();

      
      // ============================================================
      // FIRST-PERSON 3D GLB BODY & LEGS (Only visible when looking down!)
      // ============================================================
      const fpBody = (function() {
        const root = new THREE.Group();
        const glbWrap = new THREE.Group();
        // Shift slightly behind camera eye (+Z in local Three.js space) so forward view stays 100% clear
        glbWrap.position.set(0, 0, 0.24);
        glbWrap.rotation.y = Math.PI;
        glbWrap.visible = false;
        const fpShadow = makeContactShadow(0.56, 0.56);
        fpShadow.position.set(0, 0.025, 0);
        root.add(glbWrap, fpShadow);
        root.visible = false;
        scene.add(root);

        let mixer = null, walkAct = null, glbLoaded = false, loadedSkinId = null;
        let rArmBone = null, rForeBone = null, rHandBone = null;
        window.__zulmatGetGlbHand = () => rHandBone ? { hand: rHandBone, arm: rArmBone, fore: rForeBone } : null;
        function ensureGlbBody() {
          if (typeof gltfLoader === 'undefined' || typeof REPO_GLB_BASE === 'undefined') return;
          let sid = 'businessman';
          try { sid = LSget('zulmat_player_skin') || LSget('zulmat_skin') || 'businessman'; } catch (e) {}
          if (loadedSkinId === sid) return;
          loadedSkinId = sid;
          glbLoaded = false;
          rHandBone = null; rForeBone = null; rArmBone = null; mixer = null; walkAct = null;
          while (glbWrap.children.length) glbWrap.remove(glbWrap.children[0]);
          const map = {
            businessman: 'player_businessman.glb',
            tvman: 'player_tvman.glb',
            casual: 'player_casual.glb',
            man: 'player_man.glb',
            girl: 'player_girl.glb',
            hazmat: 'player_hazmat.glb',
            explorer: 'player_explorer.glb',
            survivor: 'player_survivor.glb'
          };
          const skinFile = map[sid] || 'player_businessman.glb';
          gltfLoader.load(REPO_GLB_BASE + skinFile, (gltf) => {
            try {
              const mdl = gltf.scene;
              if (window.__zulmatNormalizeRigged) window.__zulmatNormalizeRigged(mdl, 1.70);
              mdl.traverse((o) => {
                if (o.isMesh || o.isSkinnedMesh) {
                  o.castShadow = true;
                  o.frustumCulled = false;
                }
                if (o.isBone) {
                  const bn = o.name || '';
                  if (/head|neck/i.test(bn)) o.scale.setScalar(0.0001);
                  if (!rHandBone && /(righthand|hand_r|wrist_r)/i.test(bn)) rHandBone = o;
                  else if (!rForeBone && /(rightforearm|forearm_r|lowerarm_r)/i.test(bn)) rForeBone = o;
                  else if (!rArmBone && /(rightarm|upperarm_r|arm_r)/i.test(bn) && !/fore/i.test(bn)) rArmBone = o;
                }
              });
              glbWrap.add(mdl);
              if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(mdl);
                walkAct = mixer.clipAction(gltf.animations[0]);
                walkAct.play();
                walkAct.paused = true;
              }
              glbLoaded = true;
            } catch (e) {}
          }, undefined, () => {});
        }

        let prevX = 0, prevZ = 0, hasPrev = false;
        function update(dt) {
          root.visible = state.started && !state.hiding && !state.ended && state.zone !== 'levelendless_hide';
          if (!root.visible) { hasPrev = false; return; }
          if (!glbStarted) ensureGlbBody();
          const vx = hasPrev && dt > 0.0005 ? (state.pos.x - prevX) / dt : 0;
          const vz = hasPrev && dt > 0.0005 ? (state.pos.z - prevZ) / dt : 0;
          prevX = state.pos.x; prevZ = state.pos.z; hasPrev = true;
          state.vel = { x: vx, z: vz };

          const groundY = Math.max(0, state.pos.y - (state.crouching ? 0.92 : 1.65));
          root.position.set(state.pos.x, groundY, state.pos.z);
          root.rotation.y = state.yaw;

          // Show real 3D GLB body when looking down OR when raising GLB right arm to hold Radar
          const radarActive = (state.radarTimer > 0);
          glbWrap.visible = glbLoaded && (state.pitch < -0.35 || radarActive);
          glbWrap.scale.y = state.crouching ? 0.62 : 1.0;

          const spd = Math.hypot(vx, vz);
          if (mixer && walkAct) {
            if (spd > 0.25) {
              walkAct.paused = false;
              walkAct.timeScale = spd > 5.0 ? 1.45 : 0.95;
            } else {
              walkAct.paused = true;
            }
            mixer.update(dt);
          }
          if (radarActive && rArmBone) {
            rArmBone.rotation.x = -0.95;
            rArmBone.rotation.z = -0.18;
            if (rForeBone) rForeBone.rotation.x = -0.55;
          }
        }
        return { update };
      })();


      // ============================================================
      // POLTERGEIST FLYING CHAIR SCREAMER (Sudden toppled/flung chair!)
      // ============================================================
      const poltergeistChair = (function () {
        const g = new THREE.Group();
        const woodM = new THREE.MeshLambertMaterial({ color: 0x7c5338 });
        const darkWoodM = new THREE.MeshLambertMaterial({ color: 0x5c3a24 });
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.52), woodM);
        seat.position.y = 0.48;
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.06), darkWoodM);
        back.position.set(0, 0.76, -0.23);
        const legGeo = new THREE.BoxGeometry(0.06, 0.48, 0.06);
        [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, darkWoodM);
          leg.position.set(lx, 0.24, lz);
          leg.castShadow = true;
          g.add(leg);
        });
        seat.castShadow = true;
        back.castShadow = true;
        g.add(seat, back);
        g.visible = false;
        scene.add(g);

        let active = false, life = 0, nextCD = 32 + Math.random() * 24;
        let vx = 0, vy = 0, vz = 0, rvx = 0, rvy = 0, rvz = 0, bounced = false;
        const SAFE_ZONES = { metro_lobby: 1, level61: 1, level3999: 1, levelmanila: 1, level37: 1, level7: 1, level922: 1 };

        function trigger() {
          const sinY = Math.sin(state.yaw), cosY = Math.cos(state.yaw);
          const fwdX = -sinY, fwdZ = -cosY;
          const rightX = cosY, rightZ = -sinY;
          const side = Math.random() < 0.5 ? -1 : 1;
          // Spawn 6.5m ahead & 2.2m to the side, then fling violently across player's view!
          g.position.set(state.pos.x + fwdX * 6.8 + rightX * side * 2.4, 0.45, state.pos.z + fwdZ * 6.8 + rightZ * side * 2.4);
          g.rotation.set(0, Math.random() * Math.PI * 2, 0);
          vx = -rightX * side * 7.8 - fwdX * 1.4;
          vy = 3.2;
          vz = -rightZ * side * 7.8 - fwdZ * 1.4;
          rvx = (Math.random() > 0.5 ? 1 : -1) * 7.5;
          rvy = (Math.random() - 0.5) * 6.0;
          rvz = side * 6.8;
          active = true;
          bounced = false;
          life = 0;
          g.visible = true;
          if (typeof Sound !== 'undefined') {
            const cSfx = 'chair_throw_' + (1 + Math.floor(Math.random() * 3));
            if (!Sound.playSfx(cSfx, 0.95)) {
              Sound.playSfx('locker_hide', 0.92);
              setTimeout(() => Sound.playSfx('locker_hide', 0.65, { rate: 0.78 }), 260);
            }
          }
          state.sanity = Math.max(0, state.sanity - 6);
          if (typeof elDangerVig !== 'undefined' && elDangerVig) {
            elDangerVig.style.opacity = '0.55';
            setTimeout(() => { if (!state.killing) elDangerVig.style.opacity = '0'; }, 280);
          }
        }

        function update(dt) {
          if (!state.started || state.paused || state.ended || state.hiding || SAFE_ZONES[state.zone]) {
            if (active && SAFE_ZONES[state.zone]) { active = false; g.visible = false; }
            return;
          }
          if (!active) {
            nextCD -= dt;
            if (nextCD <= 0) {
              nextCD = 38 + Math.random() * 28;
              trigger();
            }
            return;
          }
          life += dt;
          if (life < 2.2) {
            vy -= 14.5 * dt;
            g.position.x += vx * dt;
            g.position.y += vy * dt;
            g.position.z += vz * dt;
            g.rotation.x += rvx * dt;
            g.rotation.y += rvy * dt;
            g.rotation.z += rvz * dt;
            if (g.position.y <= 0.28) {
              g.position.y = 0.28;
              if (!bounced) {
                bounced = true;
                vy = Math.abs(vy) * 0.36;
                vx *= 0.58; vz *= 0.58;
                rvx *= 0.45; rvy *= 0.45; rvz *= 0.45;
              } else {
                vy = 0;
                vx *= Math.pow(0.08, dt);
                vz *= Math.pow(0.08, dt);
                rvx *= Math.pow(0.05, dt);
                rvy *= Math.pow(0.05, dt);
                rvz *= Math.pow(0.05, dt);
              }
            }
          } else if (life > 18.0) {
            active = false;
            g.visible = false;
          }
        }
        return { update };
      })();

      // ============================================================
      // FIRST-PERSON HANDHELD RADAR VIEWMODEL (GLB + Live Map/Exit/Monster Screen!)
      // ============================================================
      const handheldRadar = (function() {
        const root = new THREE.Group();
        root.position.set(0.27, -0.58, -0.48);
        root.rotation.set(-0.22, -0.28, 0.06);
        root.visible = false;
        camera.add(root);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a322c, roughness: 0.65, metalness: 0.35 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x111518, roughness: 0.8, metalness: 0.5 });
        const proc = new THREE.Group();
        const caseM = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.045), bodyMat);
        const gripM = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.11, 0.04), darkMat);
        gripM.position.set(0, -0.15, 0.01);
        const antM = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.14, 8), darkMat);
        antM.position.set(-0.055, 0.17, 0);
        proc.add(caseM, gripM, antM);

        // Live Radar LCD Screen mounted on root so it displays BOTH on procedural body AND on radar.glb's LCD!
        const scrCv = document.createElement('canvas'); scrCv.width = 128; scrCv.height = 128;
        const scrCtx = scrCv.getContext('2d');
        const scrTex = new THREE.CanvasTexture(scrCv);
        const scrM = new THREE.Mesh(new THREE.PlaneGeometry(0.092, 0.068), new THREE.MeshBasicMaterial({ map: scrTex }));
        scrM.position.set(0, 0.046, 0.029);
        const scrLight = new THREE.PointLight(0x22c55e, 0.35, 1.1);
        scrLight.position.set(0, 0.03, 0.12);
        root.add(proc, scrM, scrLight);

        let glbTried = false;
        function tryLoadRadarGlb() {
          if (glbTried || typeof gltfLoader === 'undefined' || typeof REPO_GLB_BASE === 'undefined') return;
          glbTried = true;
          gltfLoader.load(REPO_GLB_BASE + 'radar.glb', (gltf) => {
            try {
              const mdl = gltf.scene.clone(true);
              if (typeof stripGltfLights === 'function') stripGltfLights(mdl);
              mdl.updateMatrixWorld(true);
              const b = new THREE.Box3().setFromObject(mdl);
              const sz = b.getSize(new THREE.Vector3());
              const sc = 0.26 / Math.max(sz.x, sz.y, sz.z, 0.01);
              mdl.scale.setScalar(sc);
              mdl.updateMatrixWorld(true);
              const b2 = new THREE.Box3().setFromObject(mdl);
              const ctr = b2.getCenter(new THREE.Vector3());
              mdl.position.set(-ctr.x, -ctr.y, -ctr.z);
              proc.visible = false;
              // Position live radar LCD flush on the front face of geiger_counter.glb
              scrM.position.set(0, 0.044, b2.max.z - ctr.z + 0.002);
              root.add(mdl);
            } catch (e) {}
          }, undefined, () => {});
        }

        let lift = 0, attachedToGlbHand = false;
        const _wsTmp = new THREE.Vector3();
        function update(dt, animT) {
          const active = state.started && !state.ended && !state.hiding && (state.radarTimer > 0);
          if (active && !glbTried) tryLoadRadarGlb();
          if (!attachedToGlbHand && window.__zulmatGetGlbHand) {
            const gh = window.__zulmatGetGlbHand();
            if (gh && gh.hand) {
              attachedToGlbHand = true;
              gh.hand.updateMatrixWorld(true);
              gh.hand.getWorldScale(_wsTmp);
              const invS = 1 / Math.max(0.001, _wsTmp.y);
              root.scale.setScalar(invS);
              root.position.set(0, 0.04 * invS, 0.06 * invS);
              root.rotation.set(-0.35, Math.PI, 0);
              gh.hand.add(root);
            }
          }
          lift += ((active ? 1 : 0) - lift) * Math.min(1, dt * 8.5);
          root.visible = lift > 0.03;
          if (!root.visible) return;
          if (!attachedToGlbHand) {
            const bob = Math.sin(state.bobPhase || 0) * 0.012;
            root.position.set(0.27, -0.58 + lift * 0.33 + bob, -0.48);
          }

          // Render live map (Exit direction + Monster blip + Sweep) right onto the 3D screen!
          scrCtx.fillStyle = '#04140a';
          scrCtx.fillRect(0, 0, 128, 128);
          scrCtx.strokeStyle = 'rgba(74, 222, 128, 0.48)';
          scrCtx.lineWidth = 1.6;
          [20, 38, 56].forEach((r) => { scrCtx.beginPath(); scrCtx.arc(64, 64, r, 0, Math.PI * 2); scrCtx.stroke(); });
          const ang = (animT * 3.2) % (Math.PI * 2);
          scrCtx.fillStyle = 'rgba(74, 222, 128, 0.28)';
          scrCtx.beginPath(); scrCtx.moveTo(64, 64); scrCtx.arc(64, 64, 56, ang, ang + 0.65); scrCtx.closePath(); scrCtx.fill();

          const cosY = Math.cos(state.yaw), sinY = Math.sin(state.yaw);
          function toScr(wx, wz) {
            const dx = wx - state.pos.x, dz = wz - state.pos.z;
            const rx = dx * cosY - dz * sinY, rz = dx * sinY + dz * cosY;
            const d = Math.hypot(rx, rz);
            const cl = Math.min(d * 1.6, 52) / (d || 1);
            return [64 + rx * cl, 64 + rz * cl];
          }
          // Exit blip (green square)
          if (typeof exitInfo !== 'undefined') {
            const [ex, ey] = toScr(exitInfo.x, exitInfo.z);
            scrCtx.fillStyle = '#22c55e';
            scrCtx.fillRect(ex - 4, ey - 4, 8, 8);
          }
          // Monster blip (red dot)
          if (state.monsterPos) {
            const [mx, my] = toScr(state.monsterPos.x, state.monsterPos.z);
            scrCtx.fillStyle = '#ef4444';
            scrCtx.beginPath(); scrCtx.arc(mx, my, 4.5, 0, Math.PI * 2); scrCtx.fill();
          }
          // Player center triangle
          scrCtx.fillStyle = '#38bdf8';
          scrCtx.beginPath(); scrCtx.moveTo(64, 57); scrCtx.lineTo(59, 69); scrCtx.lineTo(69, 69); scrCtx.closePath(); scrCtx.fill();
          scrCtx.fillStyle = '#fef08a';
          scrCtx.font = 'bold 14px monospace';
          scrCtx.fillText(Math.ceil(state.radarTimer) + 's', 6, 18);
          scrTex.needsUpdate = true;
        }
        return { update };
      })();


      // ============================================================
      // FIRST-PERSON 3D ALMOND WATER DRINKING ANIMATION (almond_water.glb)
      // ============================================================
      const almondDrinkAnim = (function() {
        const root = new THREE.Group();
        root.visible = false;
        const bottleWrap = new THREE.Group();
        // Crisp fallback bottle visible immediately if GLB is still loading
        const fbBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.036, 0.04, 0.19, 14),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.15, transparent: true, opacity: 0.88 })
        );
        const fbCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.02, 0.035, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
        );
        fbCap.position.y = 0.112;
        const fbLbl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.039, 0.041, 0.07, 14),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 })
        );
        const fbGroup = new THREE.Group();
        fbGroup.add(fbBody, fbCap, fbLbl);
        bottleWrap.add(fbGroup);

        const fillLight = new THREE.PointLight(0xbae6fd, 1.1, 2.2);
        fillLight.position.set(0.08, 0.14, 0.18);
        root.add(bottleWrap, fillLight);
        camera.add(root);

        let glbStarted = false;
        function ensureBottleGlb() {
          if (glbStarted || typeof gltfLoader === 'undefined' || typeof REPO_GLB_BASE === 'undefined') return;
          glbStarted = true;
          gltfLoader.load(REPO_GLB_BASE + 'almond_water.glb', (gltf) => {
            try {
              const bm = gltf.scene.clone(true);
              if (typeof stripGltfLights === 'function') stripGltfLights(bm);
              bm.updateMatrixWorld(true);
              const bx = new THREE.Box3().setFromObject(bm);
              const sz = new THREE.Vector3(); bx.getSize(sz);
              const sc = 0.24 / Math.max(0.01, sz.y);
              bm.scale.setScalar(sc);
              bm.updateMatrixWorld(true);
              const bx2 = new THREE.Box3().setFromObject(bm);
              const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
              bm.position.set(-ctr.x, -ctr.y, -ctr.z);
              bm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
              fbGroup.visible = false;
              bottleWrap.add(bm);
            } catch (e) {}
          }, undefined, () => {});
        }

        let active = false, t = 0;
        const DUR = 2.65;
        function play() {
          ensureBottleGlb();
          active = true;
          t = 0;
          state._drinkingAlmond = true;
          ensureFlashGlb();
          root.visible = true;
        }
        function update(dt) {
          if (!active) return;
          t += dt;
          if (t >= DUR || !state.started || state.ended || state.killing) {
            active = false;
            state._drinkingAlmond = false;
            root.visible = false;
            return;
          }
          if (t < 0.95) {
            // Phase 1: Raise & uncap bottle (synced to opening sound)
            const p = t / 0.95;
            const e = 1 - Math.pow(1 - p, 3);
            const twist = Math.sin(p * Math.PI * 4.0) * 0.08 * (p > 0.35 ? 1 : 0);
            root.position.set(0.26 - e * 0.16, -0.46 + e * 0.32, -0.44 + e * 0.11);
            bottleWrap.rotation.set(e * 0.28, -0.35 + e * 0.25 + twist, e * 0.26);
          } else if (t < 2.25) {
            // Phase 2: Tilt bottle & gulp (synced to gulping sound)
            const p = (t - 0.95) / 1.30;
            const tilt = Math.sin(Math.min(1, p * 1.35) * Math.PI * 0.5);
            const gulp = Math.sin(p * Math.PI * 4.0) * 0.026;
            root.position.set(0.10 - tilt * 0.04, -0.14 + tilt * 0.05 + gulp, -0.33 + tilt * 0.05);
            bottleWrap.rotation.set(0.28 + tilt * 0.86 + gulp * 2.2, -0.10, 0.26 + tilt * 0.46);
          } else {
            // Phase 3: Lower empty bottle smoothly back down
            const p = (t - 2.25) / (DUR - 2.25);
            const e = p * p;
            root.position.set(0.06 + e * 0.22, -0.09 - e * 0.44, -0.28 - e * 0.16);
            bottleWrap.rotation.set(1.14 * (1 - e), -0.10, 0.72 * (1 - e));
          }
        }
        return { play, update };
      })();


      // ============================================================
      // FIRST-PERSON 3D FLASHLIGHT & HAND (Left-hand tactical beam)
      // ============================================================
      const fpFlashlight = (function() {
        const root = new THREE.Group();
        root.visible = false;
        const sleeve = new THREE.Mesh(
          new THREE.CylinderGeometry(0.038, 0.044, 0.24, 10),
          new THREE.MeshLambertMaterial({ color: 0x1e293b })
        );
        sleeve.rotation.x = Math.PI / 2;
        sleeve.position.set(0, -0.015, 0.14);
        const glove = new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 10, 10),
          new THREE.MeshLambertMaterial({ color: 0x0f172a })
        );
        glove.position.set(0, 0, 0.03);
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.024, 0.17, 12),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.3 })
        );
        body.rotation.x = Math.PI / 2;
        body.position.set(0, 0.008, -0.02);
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(0.034, 0.024, 0.055, 14),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.22 })
        );
        head.rotation.x = Math.PI / 2;
        head.position.set(0, 0.008, -0.12);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3 });
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.029, 14), lensMat);
        lens.rotation.y = Math.PI;
        lens.position.set(0, 0.008, -0.149);
        const procFlash = new THREE.Group();
        procFlash.add(body, head, lens);
        root.add(sleeve, glove, procFlash);
        camera.add(root);

        let glbTried = false;
        function ensureFlashGlb() {
          if (glbTried || typeof gltfLoader === 'undefined' || typeof REPO_GLB_BASE === 'undefined') return;
          glbTried = true;
          gltfLoader.load(REPO_GLB_BASE + 'flashlight.glb', (gltf) => {
            try {
              const fm = gltf.scene.clone(true);
              if (typeof stripGltfLights === 'function') stripGltfLights(fm);
              fm.updateMatrixWorld(true);
              const bx = new THREE.Box3().setFromObject(fm);
              const sz = new THREE.Vector3(); bx.getSize(sz);
              const longest = Math.max(sz.x, sz.y, sz.z, 0.01);
              if (sz.y >= sz.x && sz.y >= sz.z) fm.rotation.x = -Math.PI / 2;
              else if (sz.x > sz.z && sz.x >= sz.y) fm.rotation.y = Math.PI / 2;
              fm.scale.setScalar(0.24 / longest);
              fm.updateMatrixWorld(true);
              const bx2 = new THREE.Box3().setFromObject(fm);
              const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
              fm.position.set(-ctr.x, -ctr.y, -ctr.z - 0.05);
              fm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
              procFlash.visible = false;
              root.add(fm);
            } catch (e) {}
          }, undefined, () => {});
        }

        function update(dt) {
          if (!state.started || state.ended || state.hiding || state.killing || state._drinkingAlmond || !state.hasFlashlight || state.zone === 'metro_lobby') {
            root.visible = false;
            return;
          }
          root.visible = true;
          const swayX = Math.cos(state.bobPhase * 0.5) * 0.009;
          const swayY = Math.sin(state.bobPhase) * 0.011;
          root.position.set(-0.23 + swayX, -0.19 + swayY, -0.34);
          root.rotation.set(0.04 + swayY * 0.6, 0.08 - swayX * 0.8, 0.08);
          lensMat.color.setHex((state.flashOn && state.battery > 0) ? 0xfef9c3 : 0x1e293b);
        }
        return { update };
      })();
