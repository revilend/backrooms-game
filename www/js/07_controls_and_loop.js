      // --- Joyga qarab yorug'lik o'zgarishi (qorong'u / yorug' hududlar, barcha darajalarda) ---
      const ZLV = { on: LSget('zulmat_lightvar') !== '0', minM: 0.55, maxM: 1.35, cellBig: 14, cellSmall: 6, base: renderer.toneMappingExposure, applied: null, mult: 1 };
      function zHash(ix, iz, seed) {
        let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iz | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
      }
      function zNoise(x, z, seed) {
        const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
        const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
        const a = zHash(ix, iz, seed), b = zHash(ix + 1, iz, seed), c = zHash(ix, iz + 1, seed), d = zHash(ix + 1, iz + 1, seed);
        return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
      }
      function zoneSeed(z) {
        let h = 7;
        const t = String(z || '');
        for (let i = 0; i < t.length; i++) h = (Math.imul(h, 31) + t.charCodeAt(i)) | 0;
        return h;
      }
      function smoothYaw(cur, tgt, rate) {
        let diff = ((tgt - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        return cur + diff * Math.min(1, rate);
      }
      function updateLightVariation(dt) {
        if (renderer.toneMappingExposure !== ZLV.applied) ZLV.base = renderer.toneMappingExposure;
        let target = 1;
        if (ZLV.on && state.started && !state.ended && state.zone !== 'metro_lobby') {
          const sd = zoneSeed(state.zone);
          const px = state.pos.x, pz = state.pos.z;
          const f = zNoise(px / ZLV.cellBig, pz / ZLV.cellBig, sd) * 0.7 + zNoise(px / ZLV.cellSmall, pz / ZLV.cellSmall, sd + 7) * 0.3;
          let u = Math.min(1, Math.max(0, (f - 0.28) / 0.44));
          u = u * u * (3 - 2 * u);
          const amp = (state.zone === 'level94' || state.zone === 'levelmanila' || state.zone === 'level922' || state.zone === 'levelend') ? 0.4 : 1;
          target = 1 + (ZLV.minM + (ZLV.maxM - ZLV.minM) * u - 1) * amp;
        }
        ZLV.mult += (target - ZLV.mult) * Math.min(1, dt * 1.8);
        ZLV.applied = ZLV.base * ZLV.mult;
        renderer.toneMappingExposure = ZLV.applied;
      }

      function animate() {
        requestAnimationFrame(animate);
        try {
        const dt = Math.min(clock.getDelta(), 0.05);
        animT += dt;
        updateLightVariation(dt);
        if (typeof dustMotes !== 'undefined' && dustMotes) {
          dustMotes.visible = state.started && !state.ended && state.zone !== 'level7';
          if (dustMotes.visible) {
            dustMotes.position.set(state.pos.x, Math.sin(animT * 0.45) * 0.14, state.pos.z);
            dustMotes.rotation.y = animT * 0.025;
          }
        }
        if (state.started && !state.paused && Sound && Sound.updateListener) Sound.updateListener(state.pos, state.yaw);
        if (state.started && !state.paused && !state.ended && !state.killing && state.zone !== 'metro_lobby') {
          state._distScreamT = (state._distScreamT === undefined) ? (22 + Math.random() * 20) : (state._distScreamT - dt);
          if (state._distScreamT <= 0) {
            state._distScreamT = 38 + Math.random() * 30;
            if (!state.monsterChasing && !state.hiding && typeof Sound !== 'undefined' && !Sound.activeVoice && Sound.playSfx3D) {
              const ang = Math.random() * Math.PI * 2;
              const r = 16 + Math.random() * 8;
              Sound.playSfx3D('distant_scream', state.pos.x + Math.cos(ang) * r, 1.6, state.pos.z + Math.sin(ang) * r, 0.72, { maxDist: 34 });
            }
          }
        }

        // Flickering Backrooms fluorescent lights
        for (let i = 0; i < flickLights.length; i++) {
          const fl = flickLights[i];
          const flick = Math.sin(animT * 9 + fl.phase) * Math.sin(animT * 23 + fl.phase) > 0.88 ? 0.25 : 1.0;
          if (fl.light) fl.light.intensity = 0.34 * flick;
          if (fl.panel) fl.panel.material.color.setHex(flick < 0.5 ? 0x524d38 : 0xfef3c7);
        }

        if (!state.started) {
          [
            level0Group, level1Group, level2Group, level37Group, levelRunGroup,
            levelFunGroup, level94Group, level922Group, level9Group, level10Group,
            level11Group, levelEndGroup, level61Group, level3Group, level4Group, level5Group, level6Group, level7Group, level8Group, level188Group, level974Group, level3999Group, level33Group, level36Group, levelShadyGroup, level14Group, level15Group, level22Group, level46Group, levelManilaGroup, levelMirrorGroup
          ].forEach((grp) => { if (grp) grp.visible = false; });
          if (typeof metroLobbyGroup !== 'undefined' && metroLobbyGroup) {
            metroLobbyGroup.visible = true;
          } else {
            level0Group.visible = true;
          }
          scene.background.setHex(0x05080f);
          scene.fog.color.setHex(0x05080f);
          scene.fog.density = 0.022;
          hemiLight.color.setHex(0xdce6f2);
          hemiLight.groundColor.setHex(0x2d3748);
          hemiLight.intensity = 0.78;
          ambientLight.intensity = 0.34;
          flashLight.intensity = 0.0;
          if (!window.__zulmatNormalizeRigged) {
            window.__zulmatNormalizeRigged = function(m, targetH) {
              m.traverse((o) => {
                if (o.isMesh || o.isSkinnedMesh) {
                  o.frustumCulled = false;
                  if (o.geometry && !o.geometry.boundingBox) o.geometry.computeBoundingBox();
                }
              });
              m.updateMatrixWorld(true);
              let box = new THREE.Box3().setFromObject(m);
              let sz = box.getSize(new THREE.Vector3());
              // Handle Mixamo/Blender 100x cm Armature where SkinnedMesh bounds read 100x smaller than world
              let armScale = 1;
              m.traverse((o) => {
                if (o !== m && o.scale && o.scale.y > 50) armScale = Math.max(armScale, o.scale.y);
              });
              let effH = (isFinite(sz.y) && sz.y > 0.001) ? sz.y : 1.7;
              if (armScale > 50) effH = effH * armScale;
              const sc = Math.min(2.5, Math.max(0.002, targetH / effH));
              m.scale.setScalar(sc);
              m.updateMatrixWorld(true);
              const b2 = new THREE.Box3().setFromObject(m);
              const ctr = b2.getCenter(new THREE.Vector3());
              if (isFinite(ctr.x) && isFinite(b2.min.y) && isFinite(ctr.z)) {
                m.position.set(-ctr.x, -b2.min.y, -ctr.z);
              }
            };
          }
          if (!window.__zulmatMenuHero) {
            window.__zulmatMenuHero = { loading: true, ready: false, group: new THREE.Group(), holder: new THREE.Group(), mixer: null, cache: {}, skin: null };
            const hg = window.__zulmatMenuHero.group;
            hg.position.set(-1.35, 0, 1.85);
            hg.rotation.y = 0.25;
            const rimL = new THREE.PointLight(0xfef08a, 1.75, 9);
            rimL.position.set(0.4, 2.3, 1.8);
            hg.add(rimL, window.__zulmatMenuHero.holder);
            if (typeof metroLobbyGroup !== 'undefined' && metroLobbyGroup) metroLobbyGroup.add(hg);
            else level0Group.add(hg);
            const SKIN_FILES = {
              businessman: 'player_businessman.glb', tvman: 'player_tvman.glb', casual: 'player_casual.glb',
              man: 'player_man.glb', girl: 'player_girl.glb', hazmat: 'player_hazmat.glb', survivor: 'player_survivor.glb'
            };
            window.__zulmatSetMenuHeroSkin = function(skinKey) {
              const mh = window.__zulmatMenuHero;
              const k = SKIN_FILES[skinKey] ? skinKey : 'businessman';
              if (mh.skin === k && mh.holder.children.length) return;
              mh.skin = k;
              const mount = (gltf) => {
                if (mh.skin !== k) return;
                while (mh.holder.children.length) mh.holder.remove(mh.holder.children[0]);
                const m = gltf.scene;
                window.__zulmatNormalizeRigged(m, 1.72);
                mh.holder.add(m);
                mh.mixer = null;
                if (gltf.animations && gltf.animations.length) {
                  mh.mixer = new THREE.AnimationMixer(m);
                  mh.mixer.clipAction(gltf.animations[0]).play();
                }
                mh.ready = true;
              };
              if (mh.cache[k]) { mount(mh.cache[k]); return; }
              if (THREE.GLTFLoader) {
                const ml = new THREE.GLTFLoader();
                if (typeof dracoLoader !== 'undefined') ml.setDRACOLoader(dracoLoader);
                const fname = SKIN_FILES[k];
                ml.load('https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/models/' + fname, (gltf) => {
                  mh.cache[k] = gltf; mount(gltf);
                }, undefined, () => {
                  ml.load('https://raw.githubusercontent.com/revilend/backrooms-game/main/models/' + fname, (gltf) => {
                    mh.cache[k] = gltf; mount(gltf);
                  }, undefined, () => { mh.ready = true; });
                });
              } else {
                mh.ready = true;
              }
            };
            window.__zulmatSetMenuHeroSkin(LSget('zulmat_player_skin') || 'businessman');
          }
          if (window.__zulmatMenuHero && window.__zulmatMenuHero.group) {
            window.__zulmatMenuHero.group.visible = true;
            const skOpen = document.getElementById('start-skins-panel');
            if (skOpen && !skOpen.classList.contains('hidden')) window.__zulmatMenuHero.holder.rotation.y += dt * 0.75;
            else window.__zulmatMenuHero.holder.rotation.y = 0;
            if (window.__zulmatMenuHero.mixer) window.__zulmatMenuHero.mixer.update(dt);
          }
          const skPanelOpen = document.getElementById('start-skins-panel');
          if (skPanelOpen && !skPanelOpen.classList.contains('hidden')) {
            // Character showcase camera: places large 3D character on the LEFT, compact selector on the RIGHT
            camera.position.set(-1.15, 1.26, 4.65);
            camera.rotation.order = 'YXZ';
            camera.lookAt(-0.48, 0.95, 1.85);
          } else {
            const pOff = Math.sin(animT * 0.16) * 0.55;
            camera.position.set(-4.35 + pOff * 0.45, 1.66 + Math.sin(animT * 0.6) * 0.018, 4.45 + pOff * 0.25);
            camera.rotation.order = 'YXZ';
            camera.lookAt(1.85, 1.22, -2.35);
          }
          renderer.render(scene, camera);
          return;
        }

                if (state.started && !state.paused && !state.ended && state.killing) {
          // --- VISCERAL 3D FIRST-PERSON JUMPSCARE (1.35s, zero-lag) ---
          if (!state._killInit) {
            state._killInit = true;
            if (Sound && Sound.playSfx) Sound.playSfx('monster_roar', 1.0, { rate: 0.92 });
            if (navigator && navigator.vibrate) { try { navigator.vibrate([140, 35, 220, 40, 320]); } catch (e) {} }
            elJumpFlash.classList.add('active');
            setTimeout(() => { elJumpFlash.classList.remove('active'); }, 140);
          }
          state.killTimer += dt;
          const kt = state.killTimer;
          const prog = Math.min(1, kt / 1.35);

          // Keep GLB monster actively lunging & thrashing instead of frozen!
          if (monsterMixer) monsterMixer.update(dt * 2.4);
          if (typeof updateActiveMonsterMixers === 'function') updateActiveMonsterMixers(dt * 1.8, true);

          // Position monster at face level lunging violently toward camera (1.22m -> 0.56m)
          const fwdX = -Math.sin(state.yaw);
          const fwdZ = -Math.cos(state.yaw);
          const easeLunge = 1 - Math.pow(1 - prog, 2.4);
          const lungeDist = 1.22 - easeLunge * 0.66;
          const mx = state.pos.x + fwdX * lungeDist;
          const mz = state.pos.z + fwdZ * lungeDist;
          monsterGroup.position.set(mx, 0.0, mz);
          monsterGroup.rotation.y = Math.atan2(state.pos.x - mx, state.pos.z - mz);

          // Snapping jaw wide open + frantic head shake
          jawPivot.rotation.x = 0.65 + Math.abs(Math.sin(kt * 30)) * 0.42;
          obsHeadGroup.rotation.z = Math.sin(kt * 38) * 0.26;
          obsHeadGroup.rotation.x = -0.06 + Math.sin(kt * 22) * 0.1;

          // Slashing clawed arms lunge across the camera
          obsArms[0].rotation.x = -1.7 + Math.sin(kt * 28) * 0.6;
          obsArms[1].rotation.x = -1.7 - Math.sin(kt * 28) * 0.6;
          obsArms[0].rotation.z = 0.28 + Math.cos(kt * 22) * 0.26;
          obsArms[1].rotation.z = -0.28 - Math.cos(kt * 22) * 0.26;
          if (loadedMonsterModel) {
            if (monBones.head) {
              monBones.head.rotation.z = Math.sin(kt * 38) * 0.36;
              monBones.head.rotation.x = -0.14 + Math.sin(kt * 26) * 0.18;
            }
            if (monBones.spine) monBones.spine.rotation.x = 0.28 + Math.sin(kt * 22) * 0.14;
            if (monBones.armL) monBones.armL.rotation.x = -1.35 + Math.sin(kt * 30) * 0.7;
            if (monBones.armR) monBones.armR.rotation.x = -1.35 - Math.sin(kt * 30) * 0.7;
          }

          // Crimson claw slashes & double strobe flash
          if (kt > 0.20 && kt < 0.54) {
            elKillSlashes.classList.add('active');
          } else if (kt >= 0.54 && kt < 0.72) {
            elKillSlashes.classList.remove('active');
          } else if (kt >= 0.72) {
            if (!state.killSlash2) {
              state.killSlash2 = true;
              Sound.slash();
              elJumpFlash.classList.add('active');
              setTimeout(() => { elJumpFlash.classList.remove('active'); }, 160);
            }
            elKillSlashes.classList.add('active');
          }

          // Violent FOV snap-zoom (72 -> 48) + harsh strobe light + face-locked camera shake
          camera.fov = 72 - Math.sin(Math.min(1, prog * 1.45) * Math.PI * 0.5) * 24;
          camera.updateProjectionMatrix();
          flashLight.intensity = (Math.sin(kt * 68) > -0.15) ? 2.4 : 0.14;
          elDangerVig.style.opacity = '1';
          const shake = (1 - prog * 0.2) * 0.15;
          camera.position.set(
            state.pos.x + (Math.random() - 0.5) * shake,
            state.pos.y - prog * 0.36 + (Math.random() - 0.5) * shake,
            state.pos.z + (Math.random() - 0.5) * shake
          );
          camera.rotation.order = 'YXZ';
          camera.rotation.y = state.yaw + (Math.random() - 0.5) * 0.18;
          camera.rotation.x = -0.02 + (Math.random() - 0.5) * 0.16;
          camera.rotation.z = Math.sin(kt * 44) * 0.24;

          if (kt >= 1.35) {
            state._killInit = false;
            camera.fov = 72;
            camera.updateProjectionMatrix();
            finishGame(false);
          }
        } else if (state.started && !state.paused && !state.ended) {
          if (window.__zulmatMenuHero && window.__zulmatMenuHero.group && window.__zulmatMenuHero.group.visible) {
            window.__zulmatMenuHero.group.visible = false;
          }
          const cfg = DIFFS[state.diff] || DIFFS.normal;
          state.elapsed += dt;
          elHudTime.textContent = formatTime(state.elapsed);
          const brightF = Math.min(1, Math.max(0, (hemiLight.intensity - 0.10) / 0.36));
          contactShadowMat.opacity = 0.24 + brightF * 0.48;
          dirLight.intensity = brightF * 0.34;
          const sx = Math.round(state.pos.x * 2) * 0.5;
          const sz = Math.round(state.pos.z * 2) * 0.5;
          dirLight.position.set(sx + 8, 16, sz + 6);
          dirLight.target.position.set(sx, 0, sz);
          if (state.hiding) {
            state.hideTimer = (state.hideTimer || 0) + dt;
            if (state.hideTimer > 14.0 && !state._hideWarned) {
              state._hideWarned = true;
              showToast("Nafas yetishmayapti! Tezroq shkafdan chiqing!", true);
            }
            if (state.hideTimer >= 19.0) {
              state.hiding = false;
              state.hideTimer = 0;
              state._hideWarned = false;
              if (state.hideLocker && state.hideLocker.mesh) state.hideLocker.mesh.visible = true;
              state.hideLocker = null;
              elLockerOv.classList.remove('active');
              Sound.playSfx('locker_hide', 0.8);
              showToast("Shkafdan chiqishga majbur bo'ldingiz!", true);
            }
          } else {
            state.hideTimer = 0;
            state._hideWarned = false;
          }
          if (state.sanity < 50 && !state.hiding) {
            const sanFactor = (50 - state.sanity) / 50;
            camera.rotation.z = Math.sin(animT * 2.6) * 0.035 * sanFactor;
          } else if (!state.killing) {
            camera.rotation.z *= 0.85;
          }

          // Keyboard camera turn Q/E
          if (keys['KeyQ']) state.yaw += dt * 2.0 * state.camSens;
          if (keys['KeyE'] && !nearestLocker && !nearExit) state.yaw -= dt * 2.0 * state.camSens;

          // Movement input
          let inX = 0, inZ = 0;
          if (!state.hiding) {
            if (keys['KeyW'] || keys['ArrowUp']) inZ -= 1;
            if (keys['KeyS'] || keys['ArrowDown']) inZ += 1;
            if (keys['KeyA'] || keys['ArrowLeft']) inX -= 1;
            if (keys['KeyD'] || keys['ArrowRight']) inX += 1;
            if (Math.hypot(joyInput.x, joyInput.y) > 0.08) {
              inX += joyInput.x;
              inZ += joyInput.y;
            }
          }

          const len = Math.hypot(inX, inZ);
          if (len > 1) { inX /= len; inZ /= len; }

          const wantsSprint = (state.sprinting || keys['ShiftLeft'] || keys['ShiftRight']) && len > 0.15 && state.stamina > 3;
          if (wantsSprint) {
            state.stamina = Math.max(0, state.stamina - 24 * dt);
          } else {
            state.stamina = Math.min(100, state.stamina + 15 * dt);
          }

          const moveSpeed = state.crouching ? 2.65 : (wantsSprint ? 6.8 : 4.15);
          if (len > 0.05) {
            const sinY = Math.sin(state.yaw);
            const cosY = Math.cos(state.yaw);
            const fwdX = -sinY, fwdZ = -cosY;
            const rgtX = cosY, rgtZ = -sinY;
            state.pos.x += (rgtX * inX - fwdX * inZ) * moveSpeed * dt;
            state.pos.z += (rgtZ * inX - fwdZ * inZ) * moveSpeed * dt;
            resolveWallCollision(state.pos, 0.52);

            state.bobPhase += dt * (wantsSprint ? 13 : 8.5);
            state.stepTimer -= dt;
            if (state.stepTimer <= 0) {
              state.stepTimer = wantsSprint ? 0.3 : 0.48;
              if (state.zone === 'level37') {
                if ((state.pos.y - 1.65) >= 0.52) Sound.tileStep(wantsSprint);
                else Sound.waterStep(wantsSprint);
              } else Sound.step(wantsSprint);
            }
          } else {
            state.bobPhase += dt * 1.4;
          }

          // Flashlight battery management
          if (state.flashOn && !state.hiding) {
            state.battery = Math.max(0, state.battery - cfg.batDrain * dt);
            if (state.battery <= 0) {
              state.flashOn = false;
              btnFlash.classList.remove('on');
              showToast('Fonar batareyasi tugadi!', true);
            }
          }
          const lowFlick = (state.battery < 18 && Math.random() < 0.14) ? 0.4 : 1.0;
          if (state.monsterStunTimer > 0) state.monsterStunTimer = Math.max(0, state.monsterStunTimer - dt);
          if (state.flashStunCd > 0) state.flashStunCd = Math.max(0, state.flashStunCd - dt);
          if (state.flashSurgeT > 0) state.flashSurgeT = Math.max(0, state.flashSurgeT - dt);
          const _bs = document.getElementById('btn-flash-stun');
          if (_bs) _bs.style.opacity = (state.flashStunCd > 0 || state.battery < 15) ? '0.36' : '0.92';
          flashLight.intensity = state.flashSurgeT > 0 ? 9.5 : ((state.hasFlashlight && state.flashOn && !state.hiding && state.battery > 0) ? (2.2 * lowFlick) : 0);
          if (typeof nearLight !== 'undefined') nearLight.intensity = state.hasFlashlight ? 0.08 : 0.18;

          // Update HUD bars
          elBatPct.textContent = Math.ceil(state.battery) + '%';
          elBatFill.style.width = state.battery + '%';
          const _rBat = document.getElementById('ring-battery');
          if (_rBat) {
            _rBat.style.strokeDashoffset = String(157 * (1 - Math.max(0, Math.min(100, state.battery)) / 100));
            _rBat.style.stroke = state.battery < 22 ? '#ef4444' : (state.battery < 50 ? '#facc15' : '#22c55e');
          }
          const _rStam = document.getElementById('ring-stamina');
          if (_rStam) {
            _rStam.style.strokeDashoffset = String(157 * (1 - Math.max(0, Math.min(100, state.stamina)) / 100));
            _rStam.style.stroke = state.stamina < 25 ? '#f97316' : '#22c55e';
          }
          elStamPct.textContent = Math.ceil(state.stamina) + '%';
          elStamFill.style.width = state.stamina + '%';
          if (state.battery < 20 && !state._lowBatSpoken) {
            state._lowBatSpoken = true;
            Sound.playVoice('vox_battery_low', 0.9, 45000);
          } else if (state.battery > 55) {
            state._lowBatSpoken = false;
          }
          if (state.zone !== 'level37' && state.zone !== 'level922' && state.zone !== 'level94') {
            let floorY = 0;
            for (let pi = 0; pi < walkPlatforms.length; pi++) {
              const wp = walkPlatforms[pi];
              if (wp.zone === state.zone && state.pos.x >= wp.minX && state.pos.x <= wp.maxX && state.pos.z >= wp.minZ && state.pos.z <= wp.maxZ) {
                if (wp.topY > floorY) floorY = wp.topY;
              }
            }
            const eyeH = state.crouching ? 0.92 : 1.65;
            const tgtY = floorY + eyeH;
            if (!state.onGround || state.velY > 0 || state.pos.y > tgtY + 0.08) {
              state.velY -= 19.5 * dt;
              state.pos.y += state.velY * dt;
              if (state.pos.y <= tgtY) {
                state.pos.y = tgtY;
                state.velY = 0;
                state.onGround = true;
              }
            } else {
              state.pos.y += (tgtY - state.pos.y) * Math.min(1, dt * 12);
              state.onGround = true;
            }
          }
          if (state.zone === 'level0' && !state._wakeSpoken && state.elapsed > 1.2) {
            state._wakeSpoken = true;
            Sound.playVoice('vox_wake', 0.92, 60000);
          }

          if (window._nearExtraLoreNote && state.zone !== 'level0') {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = (window.__zulmatLang === 'en' ? 'READ NOTE (E)' : (window.__zulmatLang === 'ru' ? 'ЧИТАТЬ ЗАПИСКУ (E)' : "XATNI O'QISH (E)"));
          }
          const _mbp = document.getElementById('btn-metro-board'); if (_mbp && state.zone !== 'metro_lobby') _mbp.classList.add('hidden');
          if (state.zone !== 'metro_lobby' && state.zone !== 'level61' && state.zone !== 'level3999' && state.zone !== 'level94') {
            const curTh = LEVEL_THEMES[state.currentLevel] || LEVEL_THEMES[0];
            const baseHemi = (state.currentLevel === 6 || state.currentLevel === 8) ? 0.08 : Math.min(0.42, (curTh.hemiInt || 0.45) * 0.72);
            const baseFog = curTh.fogDens || 0.036;
            const pocket = Math.sin(state.pos.x * 0.075) * Math.cos(state.pos.z * 0.075) + 0.42 * Math.sin(state.pos.x * 0.15 + state.pos.z * 0.11);
            const inPit = state.zone === 'level0' && state.pos.y < 1.35;
            const isDarkRoom = inPit || pocket < -0.35;
            const isBrightHall = !inPit && pocket > 0.38;
            const tgtHemi = isDarkRoom ? baseHemi * 0.14 : (isBrightHall ? Math.min(0.52, baseHemi * 1.38) : baseHemi * 0.65);
            const tgtAmb = isDarkRoom ? 0.010 : (isBrightHall ? 0.14 : 0.055);
            const tgtFog = isDarkRoom ? Math.min(0.095, baseFog * 1.82) : (isBrightHall ? Math.max(0.022, baseFog * 0.80) : baseFog * 1.12);
            hemiLight.intensity += (tgtHemi - hemiLight.intensity) * Math.min(1, dt * 2.8);
            ambientLight.intensity += (tgtAmb - ambientLight.intensity) * Math.min(1, dt * 2.8);
            scene.fog.density += (tgtFog - scene.fog.density) * Math.min(1, dt * 2.8);

            // Snap 4 localized overhead room lights to nearby bright ceiling pockets (dark rooms stay pitch black!)
            const cellStep = 14;
            const gx = Math.round(state.pos.x / cellStep);
            const gz = Math.round(state.pos.z / cellStep);
            const offsets = [[0, 0], [1, 0], [0, 1], [-1, 0]];
            for (let li = 0; li < roomLightPool.length; li++) {
              const lx = (gx + offsets[li][0]) * cellStep;
              const lz = (gz + offsets[li][1]) * cellStep;
              const lp = Math.sin(lx * 0.075) * Math.cos(lz * 0.075) + 0.42 * Math.sin(lx * 0.15 + lz * 0.11);
              const rl = roomLightPool[li];
              rl.color.setHex(curTh.hemiSky || 0xfff5d6);
              rl.position.set(lx, 3.1, lz);
              if (lp > -0.10 && state.currentLevel !== 6) {
                const flick = (Math.sin(animT * 11 + lx + lz) > 0.94) ? 0.22 : 1.0;
                rl.intensity = (lp > 0.35 ? 1.48 : 0.68) * flick;
              } else {
                rl.intensity = 0;
              }
            }
          } else {
            for (let li = 0; li < roomLightPool.length; li++) roomLightPool[li].intensity = 0;
          }
          if (state.monsterChasing && !state._monsterSpoken) {
            state._monsterSpoken = true;
            Sound.playVoice('vox_monster', 0.92, 35000);
          } else if (!state.monsterChasing) {
            state._monsterSpoken = false;
          }

          if (state.radarTimer > 0) {
            state.radarTimer = Math.max(0, state.radarTimer - dt);
            state.radarOn = (state.radarTimer > 0);
          } else {
            state.radarOn = false;
          }
          updatePsychologicalHorror(dt, animT); if (typeof CoopSystem !== 'undefined') CoopSystem.tick(dt); if (typeof fpBody !== 'undefined') fpBody.update(dt); if (typeof handheldRadar !== 'undefined') handheldRadar.update(dt, animT); if (typeof almondDrinkAnim !== 'undefined') almondDrinkAnim.update(dt); if (typeof fpFlashlight !== 'undefined') fpFlashlight.update(dt); if (typeof poltergeistChair !== 'undefined') poltergeistChair.update(dt);
          if (state.zone === 'levelendless') { Endless50K.tick(dt, animT, cfg); renderer.render(scene, camera); return; }
          for (let bi = 0; bi < bonusPickups.length; bi++) {
            const bp = bonusPickups[bi];
            if (bp.taken || bp.zone !== state.zone) continue;
            // Grounded on cabinet (no mid-air spin)
            if (Math.abs((state.pos.y - 1.65) - (bp.y || 0)) < 2.2 && Math.hypot(state.pos.x - bp.x, state.pos.z - bp.z) < 2.2) {
              bp.taken = true;
              bp.mesh.visible = false;
              if (bp.type === 'almond') {
                state.invAlmond = (state.invAlmond || 0) + 1;
                Sound.pickup();
                if (window.__zulmatSyncInv) window.__zulmatSyncInv();
                showToast("Bodom suvi sumkaga olindi! Ichish uchun pastdagi ikonni bosing (1).");
              } else {
                state.vhsTapes++;
                Sound.pickup();
                const casKey = (typeof ZONE_CASSETTE_KEY !== 'undefined' && ZONE_CASSETTE_KEY[bp.zone]) ? ZONE_CASSETTE_KEY[bp.zone] : 'cas_0';
                Sound.playVoice(casKey, 0.94);
                if (window.__zulmatAddCoins) window.__zulmatAddCoins(60);
                showToast("Sirli kaseta topildi! (+60 TANGA • " + state.vhsTapes + " / 31)", 6500);
              }
            }
          }

          window._nearExtraLoreNote = null;
          if (window.extraLoreNotes && state.zone !== 'level0' && state.zone !== 'metro_lobby') {
            for (let ei = 0; ei < window.extraLoreNotes.length; ei++) {
              const en = window.extraLoreNotes[ei];
              if (!en.read && en.zone === state.zone && Math.hypot(state.pos.x - en.x, state.pos.z - en.z) < 2.4) {
                window._nearExtraLoreNote = en;
                window._nearLoreNote = en;
                break;
              }
            }
          }

          if (state.zone === 'metro_lobby') {
            // Flickering abandoned metro ceiling tubes
            for (let i = 0; i < metroFlickLights.length; i++) {
              const ml = metroFlickLights[i];
              const fl = Math.sin(animT * 8 + ml.phase) * Math.sin(animT * 19 + ml.phase) > 0.90 ? 0.28 : 1.0;
              ml.light.intensity = 0.58 * fl;
              ml.mat.color.setHex(fl < 0.5 ? 0x52615c : 0xe6f2ec);
            }

            // Moving Metro Train Animation State Machine (Arriving -> Doors Open -> Departing Ride!)
            if (state.trainAnim === 'arriving') {
              state.trainTimer += dt;
              const p = Math.min(1, state.trainTimer / 2.6);
              const easeOut = 1 - Math.pow(1 - p, 3);
              if (metroTrain.group) metroTrain.group.position.x = -26 * (1 - easeOut);
              if (p >= 1) {
                state.trainAnim = 'parked';
                Sound.trainDoor();
              }
            } else if (state.trainAnim === 'parked') {
              // Smoothly slide GLB double subway doors open
              metroTrain.openAmt = Math.min(1, metroTrain.openAmt + dt * 1.6);
              if (metroTrain.doorL) metroTrain.doorL.position.x = -0.4 - metroTrain.openAmt * 0.68;
              if (metroTrain.doorR) metroTrain.doorR.position.x = 0.4 + metroTrain.openAmt * 0.68;
              if (metroTrain.glbMixer) metroTrain.glbMixer.setTime(3.875 + (4.250 - 3.875) * metroTrain.openAmt);
            } else if (state.trainAnim === 'departing') {
              state.trainTimer += dt;
              const t = state.trainTimer;
              const voxEl = (Sound && Sound._voiceCache) ? Sound._voiceCache['metro_depart_vox'] : null;
              const departDur = Math.max(4.5, (voxEl && isFinite(voxEl.duration) && voxEl.duration > 1.5) ? Math.min(voxEl.duration, 9.5) : 6.2);
              // 0.0s - 0.65s: GLB doors slide shut before departure
              metroTrain.openAmt = Math.max(0, 1 - t / 0.65);
              if (metroTrain.doorL) metroTrain.doorL.position.x = -0.4 - metroTrain.openAmt * 0.68;
              if (metroTrain.doorR) metroTrain.doorR.position.x = 0.4 + metroTrain.openAmt * 0.68;
              if (metroTrain.glbMixer) metroTrain.glbMixer.setTime(3.875 + (4.250 - 3.875) * metroTrain.openAmt);
              // 0.65s - departDur: train accelerates smoothly into the dark tunnel synced to voice duration!
              let tx = 0;
              if (t > 0.65) {
                const mp = Math.min(1, (t - 0.65) / (departDur - 0.65));
                tx = Math.pow(mp, 2.0) * 44;
                if (metroTrain.group) metroTrain.group.position.x = tx;
              }
              // Camera rides inside/alongside the moving metro car looking out at the streaking station!
              const rumble = t > 0.65 ? Math.sin(t * 36) * 0.025 : 0;
              camera.position.set(tx, 1.55 + rumble, -2.55);
              camera.rotation.order = 'YXZ';
              camera.rotation.y = Math.PI + Math.sin(t * 1.4) * 0.12;
              camera.rotation.x = 0.04;
              camera.rotation.z = rumble * 0.5;

              if (t > departDur - 1.05) {
                const th = LEVEL_THEMES[state.targetLevel] || LEVEL_THEMES[0];
                elTrainFadeTag.textContent = 'METRO HARAKATDA';
                elTrainFadeTitle.textContent = 'KEYINGI BEKAT: ' + th.title;
                elTrainFade.classList.add('active');
              }
              if (t >= departDur) {
                state.trainAnim = 'parked';
                resetGame(state.targetLevel);
                const th = LEVEL_THEMES[state.currentLevel] || LEVEL_THEMES[0];
                setTimeout(() => { elTrainFade.classList.remove('active'); }, 220);
                showToast(th.title + " ga yetib keldingiz!");
              }
              renderer.render(scene, camera);
              return;
            }

            // Let player walk around inside the Metro train carriage freely; show sleek BEKAT TANLASH pill inside
            const elBoardPill = document.getElementById('btn-metro-board');
            const insideTrain = (state.trainAnim === 'parked' && state.pos.z <= -2.30 && Math.abs(state.pos.x) < 7.6);
            if (elBoardPill) {
              const stOv = document.getElementById('station-overlay');
              const stOpen = stOv && !stOv.classList.contains('hidden');
              elBoardPill.classList.toggle('hidden', !insideTrain || stOpen);
            }

            nearMetroReturn = false;
            nearMetroTrain = false;
            elInteractBtn.classList.remove('visible');
            elDangerVig.style.opacity = '0';
            const bobY = Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.068 : 0.038) : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bobY, state.pos.z);
            camera.rotation.order = 'YXZ';
            camera.rotation.y = state.yaw;
            camera.rotation.x = state.pitch;
            drawRadar(999);
            updateVhsGrain(0);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'level1') {
            // --- LEVEL 1: HABITABLE ZONE (Periodic Blackouts + 5 Diesel Generators + Warehouse Stalker!) ---
            if (!l1Exit.unlocked) {
              state.l1BlackoutTimer -= dt;
              if (state.l1BlackoutTimer <= 0) {
                state.l1Blackout = !state.l1Blackout;
                state.l1BlackoutTimer = state.l1Blackout ? 11.5 : 15.5;
                if (state.l1Blackout) {
                  Sound.blackout();
                  showToast("DIQQAT! CHIROQLAR O'CHDI (BLACKOUT) — FONARNI YOQING YOKI YASHIRINING!", true);
                } else {
                  showToast("Zaxira chiroqlar vaqtincha yondi — generatorlarni tezroq yoqing!");
                }
              }
            } else {
              state.l1Blackout = false;
            }
            // Dim warehouse lights completely during Blackout!
            const targetHemi = state.l1Blackout ? 0.04 : 0.54;
            const targetAmb = state.l1Blackout ? 0.02 : 0.28;
            hemiLight.intensity += (targetHemi - hemiLight.intensity) * Math.min(1, dt * 6);
            ambientLight.intensity += (targetAmb - ambientLight.intensity) * Math.min(1, dt * 6);

            if (l1Exit.doorPivot) {
              const tRot = l1Exit.unlocked ? -Math.PI * 0.56 : 0;
              l1Exit.doorPivot.rotation.y += (tRot - l1Exit.doorPivot.rotation.y) * Math.min(1, dt * 4.5);
            }

            // Collect Red Gasoline Fuel Cans for empty generators!
            l1FuelCans.forEach((fc) => {
              if (fc.taken) return;
              fc.mesh.rotation.y += dt * 1.8;
              if (Math.hypot(state.pos.x - fc.x, state.pos.z - fc.z) < 1.55) {
                fc.taken = true;
                fc.mesh.visible = false;
                state.l1FuelHeld += 1;
                Sound.pickup();
                showToast("Benzin kanistrasi olindi! (Qo'lingizda: " + state.l1FuelHeld + " ta)");
              }
            });

            // Nearest Generator, Locker, or Exit
            nearestL1Gen = null;
            for (let i = 0; i < l1Generators.length; i++) {
              const g = l1Generators[i];
              if (!g.active && Math.hypot(state.pos.x - g.x, state.pos.z - g.z) < 2.9) { nearestL1Gen = g; break; }
            }
            nearestLocker = null;
            let minL1 = 2.9;
            for (let i = 0; i < l1Lockers.length; i++) {
              const d = Math.hypot(state.pos.x - l1Lockers[i].x, state.pos.z - l1Lockers[i].z);
              if (d < minL1) { minL1 = d; nearestLocker = l1Lockers[i]; }
            }
            const dEx1 = Math.hypot(state.pos.x - l1Exit.x, state.pos.z - l1Exit.z);
            nearExit = dEx1 < 3.4;
            if (l1Exit.unlocked && dEx1 < 1.85) { enterMetroLobby(true); return; }

            if (state.hiding) {
              elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)';
            } else if (nearExit && l1Exit.unlocked) {
              elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'GARAGDAN CHIQISH (E)';
            } else if (nearestL1Gen) {
              elInteractBtn.classList.add('visible'); elInteractLbl.textContent = nearestL1Gen.needsFuel ? 'BENZIN QUYISH VA YOQISH (E)' : 'GENERATORNI YOQISH (E)';
            } else if (nearestLocker) {
              elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)';
            } else if (!window._nearExtraLoreNote) {
              elInteractBtn.classList.remove('visible');
            }

            // Warehouse Stalker AI (becomes hyper-aggressive during Blackouts!)
            const dMon1 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            const aggroRange = state.l1Blackout ? 34.0 : 16.0;
            state.monsterChasing = canMonsterDetect(dMon1, aggroRange, wantsSprint);
            if (state.monsterChasing) {
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            } else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 1.5) {
              const wp = [[-20, 12], [20, 12], [48, 18], [56, -16], [-18, -52], [18, -52], [0, -18]];
              const pick = wp[Math.floor(Math.random() * wp.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(pick[0], 0, pick[1]); }
            }
            const mDx1 = state.monsterTarget.x - state.monsterPos.x;
            const mDz1 = state.monsterTarget.z - state.monsterPos.z;
            const mDist1 = Math.hypot(mDx1, mDz1) || 1;
            const mSpd1 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * (state.l1Blackout ? 1.14 : 1.05);
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (mDx1), state.monsterPos.z + (mDz1), mSpd1, dt);
            state.monsterYaw = Math.atan2(mDx1, mDz1);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = state.monsterYaw;
            if (monsterMixer) monsterMixer.update(dt * (state.monsterChasing ? 1.5 : 0.95)); updateActiveMonsterMixers(dt, state.monsterChasing);
            obsWalkPhase += dt * (state.monsterChasing ? 8.8 : 4.8);
            obsLegs[0].rotation.x = Math.sin(obsWalkPhase) * 0.48; if (typeof mainWolf !== 'undefined') { const g = Math.sin(obsWalkPhase * 1.45); mainWolf.legs[0].rotation.x = g * 0.72; mainWolf.legs[1].rotation.x = -g * 0.72; mainWolf.legs[2].rotation.x = -g * 0.72; mainWolf.legs[3].rotation.x = g * 0.72; mainWolf.jawG.rotation.x = 0.22 + Math.abs(Math.sin(obsWalkPhase * 2.0)) * 0.42; mainWolf.tail.rotation.z = Math.sin(obsWalkPhase * 1.6) * 0.35; }
            obsLegs[1].rotation.x = -Math.sin(obsWalkPhase) * 0.48;
            obsArms[0].rotation.x = -Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.92 : 0.18);
            obsArms[1].rotation.x = Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.92 : 0.18);
            jawPivot.rotation.x = state.monsterChasing ? (0.45 + Math.abs(Math.sin(animT * 12)) * 0.28) : 0.1;

            state.mStepTimer -= dt;
            if (state.mStepTimer <= 0) { state.mStepTimer = state.monsterChasing ? 0.32 : 0.6; Sound.monsterStep(dMon1); }
            state.growlTimer -= dt;
            if (state.growlTimer <= 0 && dMon1 < 20) {
              state.growlTimer = state.monsterChasing ? 2.0 : 5.0;
              Sound.monsterGrowl(Math.max(0.25, 1 - dMon1 / 20));
            }
            const df1 = Math.max(0, Math.min(1, 1 - (dMon1 - 2.0) / 14.0));
            elDangerVig.style.opacity = String(df1 * 0.88);
            if (df1 > 0.15) {
              state.heartTimer -= dt;
              if (state.heartTimer <= 0) { state.heartTimer = Math.max(0.35, 1.15 - df1 * 0.78); Sound.heartbeat(df1); }
            }
            if (!state.hiding && dMon1 < 1.38) { startKillAnimation(); }

            const bobY1 = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.075 : 0.042) : 0.012);
            camera.position.set(state.pos.x, state.pos.y + bobY1, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMon1);
            updateVhsGrain(df1);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'level3') {
            if (state.l3ShockCool > 0) state.l3ShockCool -= dt;
            for (let i = 0; i < l3Arcs.length; i++) {
              const a = l3Arcs[i];
              const on = Math.sin(animT * 2.4 + a.phase) > 0.25;
              a.mesh.visible = on;
              if (on && state.l3ShockCool <= 0 && Math.hypot(state.pos.x - a.x, state.pos.z - a.z) < 1.35) {
                state.l3ShockCool = 2.5; state.battery = Math.max(5, state.battery - 18); Sound.electricZap();
                showToast("TOK URDI! Fonar zaryadi kamaydi!", true);
              }
            }
            let nearB = false;
            for (let i = 0; i < l3Breakers.length; i++) {
              if (!l3Breakers[i].active && Math.hypot(state.pos.x - l3Breakers[i].x, state.pos.z - l3Breakers[i].z) < 2.6) nearB = true;
            }
            nearestLocker = null; let minL3 = 2.4;
            for (let i = 0; i < l3Lockers.length; i++) {
              const d = Math.hypot(state.pos.x - l3Lockers[i].x, state.pos.z - l3Lockers[i].z);
              if (d < minL3) { minL3 = d; nearestLocker = l3Lockers[i]; }
            }
            const dEx3 = Math.hypot(state.pos.x - l3Exit.x, state.pos.z - l3Exit.z);
            if (l3Exit.unlocked && dEx3 < 2.2) { enterMetroLobby(true); return; }
            if (state.hiding) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)'; }
            else if (nearB) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'UZGICHNI YOQISH (E)'; }
            else if (l3Exit.unlocked && dEx3 < 3.2) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'LIFTGA KIRISH (E)'; }
            else if (nearestLocker) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM3 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM3, 22, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = l3OpenCells[Math.floor(Math.random() * l3OpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const dx3 = state.monsterTarget.x - state.monsterPos.x, dz3 = state.monsterTarget.z - state.monsterPos.z;
            const dd3 = Math.hypot(dx3, dz3) || 1;
            const spd3 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.16;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx3), state.monsterPos.z + (dz3), spd3, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx3, dz3);
            const df3 = Math.max(0, Math.min(1, 1 - (dM3 - 2) / 14));
            elDangerVig.style.opacity = String(df3 * 0.85);
            if (!state.hiding && dM3 < 1.5) { startKillAnimation(); return; }

            elHudObj.textContent = 'Level 3 • Uzgichlar: ' + state.l3BreakersDone + ' / 8' + (l3Exit.unlocked ? ' • LIFT OCHILDI!' : '');
            const bob3 = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? 0.05 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob3, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM3); updateVhsGrain(0.26 + df3 * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level4') {
            let nearB4 = false, nearCool = false;
            for (let i = 0; i < l4Badges.length; i++) {
              const b = l4Badges[i]; if (b.taken) continue; b.mesh.rotation.y += dt * 2.2;
              if (Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 2.5) nearB4 = true;
            }
            for (let i = 0; i < l4Coolers.length; i++) {
              if (Math.hypot(state.pos.x - l4Coolers[i].x, state.pos.z - l4Coolers[i].z) < 2.5) nearCool = true;
            }
            for (let i = 0; i < l4WindowTraps.length; i++) {
              const w = l4WindowTraps[i];
              if (Math.hypot(state.pos.x - w.x, state.pos.z - w.z) < 1.55) {
                showToast("DERAZA TUZOG'I! Ochiq oq derazalarga yaqinlashmang!", true);
                startKillAnimation(); return;
              }
            }
            const dEx4 = Math.hypot(state.pos.x - l4Exit.x, state.pos.z - l4Exit.z);
            if (l4Exit.unlocked && dEx4 < 2.2) { enterMetroLobby(true); return; }
            if (nearB4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'RUXSATNOMANI OLISH (E)'; }
            else if (nearCool) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'BODOM SUVI ICHISH (E)'; }
            else if (l4Exit.unlocked && dEx4 < 3.2) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'OFISDAN CHIQISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            elHudObj.textContent = 'Level 4 • Ruxsatnoma: ' + state.l4BadgesDone + ' / 6' + (l4Exit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            elDangerVig.style.opacity = '0';
            const bob4 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob4, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(99); updateVhsGrain(0.12); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level5') {
            let nearDoor5 = null;
            for (let i = 0; i < l5RoomDoors.length; i++) {
              const rd = l5RoomDoors[i];
              const targetRot = rd.open ? (rd.side * 1.48) : 0;
              rd.hinge.rotation.y += (targetRot - rd.hinge.rotation.y) * Math.min(1, dt * 8);
              if (Math.hypot(state.pos.x - rd.x, state.pos.z - rd.z) < 2.8) nearDoor5 = rd;
            }
            let nearK5 = false;
            for (let i = 0; i < l5Keys.length; i++) {
              const k = l5Keys[i]; if (k.taken) continue; k.mesh.rotation.y += dt * 2.2;
              if (Math.hypot(state.pos.x - k.x, state.pos.z - k.z) < 2.5) nearK5 = true;
            }
            nearestLocker = null; let minL5 = 2.4;
            for (let i = 0; i < l5Lockers.length; i++) {
              const d = Math.hypot(state.pos.x - l5Lockers[i].x, state.pos.z - l5Lockers[i].z);
              if (d < minL5) { minL5 = d; nearestLocker = l5Lockers[i]; }
            }
            const dEx5 = Math.hypot(state.pos.x - l5Exit.x, state.pos.z - l5Exit.z);
            if (l5Exit.unlocked && dEx5 < 2.2) { enterMetroLobby(true); return; }
            if (state.hiding) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)'; }
            else if (nearK5) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'OLTIN KALITNI OLISH (E)'; }
            else if (nearDoor5) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'XONA ' + nearDoor5.num + (nearDoor5.open ? ' YOPISH (E)' : ' OCHISH (E)'); }
            else if (l5Exit.unlocked && dEx5 < 3.2) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'MEHMONXONA LIFTI (E)'; }
            else if (nearestLocker) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM5 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM5, 20, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = l5OpenCells[Math.floor(Math.random() * l5OpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const dx5 = state.monsterTarget.x - state.monsterPos.x, dz5 = state.monsterTarget.z - state.monsterPos.z;
            const dd5 = Math.hypot(dx5, dz5) || 1;
            const spd5 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.12;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx5), state.monsterPos.z + (dz5), spd5, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx5, dz5);
            const df5 = Math.max(0, Math.min(1, 1 - (dM5 - 2) / 14));
            elDangerVig.style.opacity = String(df5 * 0.85);
            if (!state.hiding && dM5 < 1.5) { startKillAnimation(); return; }

            elHudObj.textContent = 'Level 5 • Oltin kalitlar: ' + state.l5KeysDone + ' / 7' + (l5Exit.unlocked ? ' • LIFT OCHILDI!' : '');
            const bob5 = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? 0.048 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob5, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM5); updateVhsGrain(0.24 + df5 * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level6') {
            let nearS6 = false;
            for (let i = 0; i < l6Switches.length; i++) {
              if (!l6Switches[i].active && Math.hypot(state.pos.x - l6Switches[i].x, state.pos.z - l6Switches[i].z) < 2.8) nearS6 = true;
            }
            const dEx6 = Math.hypot(state.pos.x - l6Exit.x, state.pos.z - l6Exit.z);
            if (l6Exit.unlocked && dEx6 < 2.2) { enterMetroLobby(true); return; }
            if (nearS6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'TUGMANI YOQISH (E)'; }
            else if (l6Exit.unlocked && dEx6 < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'CHIQISH ESHIGI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM6 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM6, state.sprinting ? 24 : 15, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = l6OpenCells[Math.floor(Math.random() * l6OpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const dx6 = state.monsterTarget.x - state.monsterPos.x, dz6 = state.monsterTarget.z - state.monsterPos.z;
            const dd6 = Math.hypot(dx6, dz6) || 1;
            const spd6 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.15;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx6), state.monsterPos.z + (dz6), spd6, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx6, dz6);
            const df6 = Math.max(0, Math.min(1, 1 - (dM6 - 2) / 14));
            elDangerVig.style.opacity = String(df6 * 0.88);
            if (dM6 < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = 'Level 6 • Qizil tugmalar: ' + state.l6SwitchesDone + ' / 6' + (l6Exit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            const bob6 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.048 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob6, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM6); updateVhsGrain(0.32 + df6 * 0.4); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level7') {
            let onDock = false;
            for (let i = 0; i < l7Docks.length; i++) {
              const dk = l7Docks[i];
              if (Math.abs(state.pos.x - dk.x) <= dk.hw + 0.3 && Math.abs(state.pos.z - dk.z) <= dk.hd + 0.3) { onDock = true; break; }
            }
            const targetY = onDock ? 1.85 : 1.15;
            state.pos.y += (targetY - state.pos.y) * Math.min(1, dt * 7);
            state.pos.x = Math.max(-90, Math.min(90, state.pos.x));
            state.pos.z = Math.max(-90, Math.min(90, state.pos.z));
            let nearB7 = false;
            for (let i = 0; i < l7Buoys.length; i++) {
              if (!l7Buoys[i].active && Math.hypot(state.pos.x - l7Buoys[i].x, state.pos.z - l7Buoys[i].z) < 3.2) nearB7 = true;
            }
            const dEx7 = Math.hypot(state.pos.x - l7Exit.x, state.pos.z - l7Exit.z);
            if (l7Exit.unlocked && dEx7 < 2.5) { enterMetroLobby(true); return; }
            if (nearB7) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'MAYOQNI YOQISH (E)'; }
            else if (l7Exit.unlocked && dEx7 < 3.8) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'MAYOQ CHIQISHI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM7 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = (!onDock && dM7 < 34) || dM7 < 16;
            const tx7 = state.monsterChasing ? state.pos.x : Math.sin(animT * 0.25) * 28;
            const tz7 = state.monsterChasing ? state.pos.z : -40 + Math.cos(animT * 0.25) * 22;
            const dx7 = tx7 - state.monsterPos.x, dz7 = tz7 - state.monsterPos.z;
            const dd7 = Math.hypot(dx7, dz7) || 1;
            const spd7 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.05;
            state.monsterPos.x += (dx7 / dd7) * spd7 * dt; state.monsterPos.z += (dz7 / dd7) * spd7 * dt;
            monsterGroup.position.set(state.monsterPos.x, -0.35, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx7, dz7);
            const df7 = Math.max(0, Math.min(1, 1 - (dM7 - 2) / 16));
            elDangerVig.style.opacity = String(df7 * 0.85);
            if (dM7 < 1.65) { startKillAnimation(); return; }
            elHudObj.textContent = 'Level 7 • Mayoqlar: ' + state.l7BuoysDone + ' / 5' + (l7Exit.unlocked ? ' • MAYOQ OCHILDI!' : (!onDock ? ' • SUVDA!' : ''));
            const bob7 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.015);
            camera.position.set(state.pos.x, state.pos.y + bob7, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM7); updateVhsGrain(0.2 + df7 * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level8') {
            let nearC8 = false;
            for (let i = 0; i < l8Crystals.length; i++) {
              const c = l8Crystals[i]; if (c.taken) continue; c.mesh.rotation.y += dt * 1.8;
              if (Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 2.8) nearC8 = true;
            }
            const dEx8 = Math.hypot(state.pos.x - l8Exit.x, state.pos.z - l8Exit.z);
            if (l8Exit.unlocked && dEx8 < 2.2) { enterMetroLobby(true); return; }
            if (nearC8) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'KRISTALLNI OLISH (E)'; }
            else if (l8Exit.unlocked && dEx8 < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = "G'OR CHIQISHI (E)"; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM8 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM8, 22, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = l8OpenCells[Math.floor(Math.random() * l8OpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const dx8 = state.monsterTarget.x - state.monsterPos.x, dz8 = state.monsterTarget.z - state.monsterPos.z;
            const dd8 = Math.hypot(dx8, dz8) || 1;
            const spd8 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.12;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx8), state.monsterPos.z + (dz8), spd8, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx8, dz8);
            const df8 = Math.max(0, Math.min(1, 1 - (dM8 - 2) / 14));
            elDangerVig.style.opacity = String(df8 * 0.85);
            if (dM8 < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = "Level 8 • Kristallar: " + state.l8CrystalsDone + ' / 6' + (l8Exit.unlocked ? " • G'OR OCHILDI!" : '');
            const bob8 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.048 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob8, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM8); updateVhsGrain(0.24 + df8 * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level188') {
            let nearT188 = false;
            for (let i = 0; i < l188Tvs.length; i++) {
              if (!l188Tvs[i].taken && Math.hypot(state.pos.x - l188Tvs[i].x, state.pos.z - l188Tvs[i].z) < 3.0) nearT188 = true;
            }
            const dEx188 = Math.hypot(state.pos.x - l188Exit.x, state.pos.z - l188Exit.z);
            if (l188Exit.unlocked && dEx188 < 2.2) { enterMetroLobby(true); return; }
            if (nearT188) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'CRT TELEVIZORNI OLISH (E)'; }
            else if (l188Exit.unlocked && dEx188 < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'LIFTGA KIRISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM188 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM188, 24, wantsSprint);
            const tx188 = state.monsterChasing ? state.pos.x : Math.sin(animT * 0.4) * 14;
            const tz188 = state.monsterChasing ? state.pos.z : Math.cos(animT * 0.4) * 14;
            const dx188 = tx188 - state.monsterPos.x, dz188 = tz188 - state.monsterPos.z;
            const dd188 = Math.hypot(dx188, dz188) || 1;
            const spd188 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.1;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx188), state.monsterPos.z + (dz188), spd188, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx188, dz188);
            const df188 = Math.max(0, Math.min(1, 1 - (dM188 - 2) / 14));
            elDangerVig.style.opacity = String(df188 * 0.85);
            if (dM188 < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = 'Level 188 • Televizorlar: ' + state.l188TvsDone + ' / 4' + (l188Exit.unlocked ? ' • LIFT OCHILDI!' : '');
            const bob188 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.048 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob188, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM188); updateVhsGrain(0.22 + df188 * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level974') {
            let nearI974 = false;
            for (let i = 0; i < l974Items.length; i++) {
              const it = l974Items[i]; if (it.taken) continue; it.mesh.rotation.y += dt * 2.0;
              if (Math.hypot(state.pos.x - it.x, state.pos.z - it.z) < 2.8) nearI974 = true;
            }
            const dEx974 = Math.hypot(state.pos.x - l974Exit.x, state.pos.z - l974Exit.z);
            if (l974Exit.unlocked && dEx974 < 2.2) { enterMetroLobby(true); return; }
            if (nearI974) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'YULDUZCHANI OLISH (E)'; }
            else if (l974Exit.unlocked && dEx974 < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'PUSHTI ESHIK (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM974 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM974, 20, wantsSprint);
            const tx974 = state.monsterChasing ? state.pos.x : Math.sin(animT * 0.32) * 14;
            const tz974 = state.monsterChasing ? state.pos.z : -4 + Math.cos(animT * 0.32) * 12;
            const dx974 = tx974 - state.monsterPos.x, dz974 = tz974 - state.monsterPos.z;
            const dd974 = Math.hypot(dx974, dz974) || 1;
            const spd974 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.05;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx974), state.monsterPos.z + (dz974), spd974, dt);
            monsterGroup.position.set(state.monsterPos.x, Math.sin(animT * 1.8) * 0.06, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(dx974, dz974);
            monsterGroup.rotation.z = Math.sin(animT * 2.1) * 0.035;
            const df974 = Math.max(0, Math.min(1, 1 - (dM974 - 2) / 14));
            elDangerVig.style.opacity = String(df974 * 0.8);
            if (dM974 < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = "Level 974 • Yulduzchalar: " + state.l974ItemsDone + ' / 6' + (l974Exit.unlocked ? ' • ESHIK OCHILDI!' : '');
            const bob974 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob974, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM974); updateVhsGrain(0.15 + df974 * 0.3); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level3999') {
            let nearT3999 = false;
            for (let i = 0; i < l3999Tasks.length; i++) {
              const t = l3999Tasks[i]; if (!t.done) t.orb.rotation.y += dt * 2.2;
              if (!t.done && Math.hypot(state.pos.x - t.x, state.pos.z - t.z) < 3.0) nearT3999 = true;
            }
            const dEx3999 = Math.hypot(state.pos.x - l3999Exit.x, state.pos.z - l3999Exit.z);
            if (l3999Exit.unlocked && dEx3999 < 2.4) { enterMetroLobby(true); return; }
            if (nearT3999) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'TOPSHIRIQNI BAJARISH (E)'; }
            else if (l3999Exit.unlocked && dEx3999 < 3.8) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'HAQIQIY CHIQISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');
            elDangerVig.style.opacity = '0';
            elHudObj.textContent = 'Level 3999 • Topshiriqlar: ' + state.l3999TasksDone + ' / 6' + (l3999Exit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            const bob3999 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob3999, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(99); updateVhsGrain(0.10); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level33') {
            let near33 = false;
            for (let i = 0; i < l33Nodes.length; i++) {
              if (!l33Nodes[i].done) l33Nodes[i].orb.rotation.y += dt * 2.0;
              if (!l33Nodes[i].done && Math.hypot(state.pos.x - l33Nodes[i].x, state.pos.z - l33Nodes[i].z) < 3.0) near33 = true;
            }
            const dEx = Math.hypot(state.pos.x - l33Exit.x, state.pos.z - l33Exit.z);
            if (l33Exit.unlocked && dEx < 2.4) { enterMetroLobby(true); return; }
            if (near33) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'TERMINALNI YOQISH (E)'; }
            else if (l33Exit.unlocked && dEx < 3.6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'MALL CHIQISHI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');
            const dM = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM, 22, wantsSprint);
            const tx = state.monsterChasing ? state.pos.x : Math.sin(animT * 0.35) * 16;
            const tz = state.monsterChasing ? state.pos.z : Math.cos(animT * 0.35) * 16;
            const dx = tx - state.monsterPos.x, dz = tz - state.monsterPos.z, dd = Math.hypot(dx, dz) || 1;
            const spd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.1;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx), state.monsterPos.z + (dz), spd, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z); monsterGroup.rotation.y = Math.atan2(dx, dz);
            const df = Math.max(0, Math.min(1, 1 - (dM - 2) / 14)); elDangerVig.style.opacity = String(df * 0.85);
            if (dM < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = 'Level 33 • Terminallar: ' + state.l33NodesDone + ' / 6' + (l33Exit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            if (state.zone === 'levelmirror' && window.__zulmatMirrorRef && window.__zulmatMirrorRef.group) {
              const mr = window.__zulmatMirrorRef;
              let bestM = null, bestD = 14.0;
              for (let mi = 0; mi < mr.coords.length; mi++) {
                const [mx, mz] = mr.coords[mi];
                const md = Math.hypot(state.pos.x - mx, state.pos.z - mz);
                if (md < bestD) { bestD = md; bestM = [mx, mz]; }
              }
              if (bestM && Math.abs(state.pos.x - bestM[0]) < 4.5) {
                const [mx, mz] = bestM;
                const dz = state.pos.z - mz;
                mr.group.visible = true;
                mr.group.position.set(state.pos.x, 0, mz - dz);
                mr.group.rotation.y = Math.PI - state.yaw;
                if (mr.mixer) mr.mixer.update(dt * (len > 0.05 ? 1.35 : 0.5));
              } else {
                mr.group.visible = false;
              }
            }
            const bob = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM); updateVhsGrain(0.18 + df * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level36') {
            let near36 = false;
            for (let i = 0; i < l36Tickets.length; i++) {
              if (!l36Tickets[i].taken) l36Tickets[i].mesh.rotation.y += dt * 2.0;
              if (!l36Tickets[i].taken && Math.hypot(state.pos.x - l36Tickets[i].x, state.pos.z - l36Tickets[i].z) < 2.8) near36 = true;
            }
            const dEx = Math.hypot(state.pos.x - l36Exit.x, state.pos.z - l36Exit.z);
            if (l36Exit.unlocked && dEx < 2.4) { enterMetroLobby(true); return; }
            if (near36) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'CHIPTANI OLISH (E)'; }
            else if (l36Exit.unlocked && dEx < 3.6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'AEROPORT DARVOZASI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');
            const dM = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM, 22, wantsSprint);
            const tx = state.monsterChasing ? state.pos.x : Math.cos(animT * 0.38) * 18;
            const tz = state.monsterChasing ? state.pos.z : Math.sin(animT * 0.38) * 18;
            const dx = tx - state.monsterPos.x, dz = tz - state.monsterPos.z, dd = Math.hypot(dx, dz) || 1;
            const spd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.12;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx), state.monsterPos.z + (dz), spd, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z); monsterGroup.rotation.y = Math.atan2(dx, dz);
            const df = Math.max(0, Math.min(1, 1 - (dM - 2) / 14)); elDangerVig.style.opacity = String(df * 0.85);
            if (dM < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = 'Level 36 • Chiptalar: ' + state.l36TicketsDone + ' / 5' + (l36Exit.unlocked ? ' • DARVOZA OCHILDI!' : '');
            const bob = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM); updateVhsGrain(0.16 + df * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'levelshady') {
            let nearS = false;
            for (let i = 0; i < lShadyAnomalies.length; i++) {
              if (!lShadyAnomalies[i].taken) lShadyAnomalies[i].mesh.rotation.y += dt * 2.2;
              if (!lShadyAnomalies[i].taken && Math.hypot(state.pos.x - lShadyAnomalies[i].x, state.pos.z - lShadyAnomalies[i].z) < 2.8) nearS = true;
            }
            const dEx = Math.hypot(state.pos.x - lShadyExit.x, state.pos.z - lShadyExit.z);
            if (lShadyExit.unlocked && dEx < 2.2) { enterMetroLobby(true); return; }
            if (nearS) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'ANOMALIYANI OLISH (E)'; }
            else if (lShadyExit.unlocked && dEx < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'CHIQISH ESHIGI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');
            const dM = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dM, 22, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = lShadyOpenCells[Math.floor(Math.random() * lShadyOpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const dx = state.monsterTarget.x - state.monsterPos.x, dz = state.monsterTarget.z - state.monsterPos.z, dd = Math.hypot(dx, dz) || 1;
            const spd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.15;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx), state.monsterPos.z + (dz), spd, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z); monsterGroup.rotation.y = Math.atan2(dx, dz);
            const df = Math.max(0, Math.min(1, 1 - (dM - 2) / 14)); elDangerVig.style.opacity = String(df * 0.88);
            if (dM < 1.5) { startKillAnimation(); return; }
            elHudObj.textContent = 'TH3 SH4DY GR3Y • Anomaliyalar: ' + state.lShadyDone + ' / 5' + (lShadyExit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            const bob = Math.sin(state.bobPhase) * (len > 0.05 ? 0.048 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM); updateVhsGrain(0.30 + df * 0.4); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level14' || state.zone === 'level15' || state.zone === 'level22' || state.zone === 'level46' || state.zone === 'levelmanila' || state.zone === 'levelmirror') {
            const zCfg = state.zone === 'level14' ? { list: l14Nodes, key: 'done', ex: l14Exit, done: state.l14Done, tot: 5, lbl: 'MAYOQNI YOQISH (E)', hud: 'Level 14 • Mayoqlar: ', safe: false }
              : (state.zone === 'level15' ? { list: l15Cores, key: 'done', ex: l15Exit, done: state.l15Done, tot: 5, lbl: 'YADRONI YOQISH (E)', hud: 'Level 15 • Yadrolar: ', safe: false }
              : (state.zone === 'level22' ? { list: l22Switches, key: 'active', ex: l22Exit, done: state.l22Done, tot: 6, lbl: 'QUTINI YOQISH (E)', hud: 'Level 22 • Qutilar: ', safe: false }
              : (state.zone === 'level46' ? { list: l46Obelisks, key: 'active', ex: l46Exit, done: state.l46Done, tot: 5, lbl: 'OBELISKNI YOQISH (E)', hud: 'Level 46 • Obelisklar: ', safe: false }
              : (state.zone === 'levelmanila' ? { list: lManilaFiles, key: 'taken', ex: lManilaExit, done: state.lManilaDone, tot: 4, lbl: "HUJJATNI O'QISH (E)", hud: 'Manila Room • Hujjatlar: ', safe: true }
              : { list: lMirrorShards, key: 'taken', ex: lMirrorExit, done: state.lMirrorDone, tot: 5, lbl: 'PARCHANI OLISH (E)', hud: 'Level ∞ Oynalar • Parchalar: ', safe: false }))));
            let nearIt = false;
            for (let i = 0; i < zCfg.list.length; i++) {
              const it = zCfg.list[i];
              if (!it[zCfg.key] && Math.hypot(state.pos.x - it.x, state.pos.z - it.z) < 3.0) nearIt = true;
            }
            const dEx = Math.hypot(state.pos.x - zCfg.ex.x, state.pos.z - zCfg.ex.z);
            if (zCfg.ex.unlocked && dEx < 2.3) { enterMetroLobby(true); return; }
            if (nearIt) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = zCfg.lbl; }
            else if (zCfg.ex.unlocked && dEx < 3.5) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'CHIQISH ESHIGI (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');
            let dM = 99;
            if (!zCfg.safe) {
              dM = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
              state.monsterChasing = canMonsterDetect(dM, 24, wantsSprint);
              const tx = state.monsterChasing ? state.pos.x : Math.sin(animT * 0.35) * 22;
              const tz = state.monsterChasing ? state.pos.z : Math.cos(animT * 0.35) * 22;
              const dx = tx - state.monsterPos.x, dz = tz - state.monsterPos.z, dd = Math.hypot(dx, dz) || 1;
              // Zone-specific environmental hazards (makes each extra level feel distinct!)
              if (state.zone === 'level14' && len < 0.05) {
                state.sanity = Math.max(0, state.sanity - 2.4 * dt);
              } else if (state.zone === 'level15') {
                const pulse = Math.sin(animT * 0.42);
                if (pulse > 0.985 && !state.crouching && !state._l15Zapped) {
                  state._l15Zapped = true;
                  state.battery = Math.max(0, state.battery - 5);
                  if (Sound && Sound.playSfx) Sound.playSfx('electric_zap', 0.48);
                } else if (pulse < 0.5) { state._l15Zapped = false; }
              } else if (state.zone === 'level22') {
                state.stamina = Math.max(0, state.stamina - (wantsSprint ? 4.5 : 0) * dt);
              } else if (state.zone === 'level46') {
                scene.fog.density = 0.024 + Math.sin(animT * 0.55) * 0.011;
                if (!state.crouching) { state.pos.x += Math.sin(animT * 0.35) * 0.42 * dt; resolveWallCollision(state.pos, 0.38); }
              } else if (state.zone === 'levelmirror') {
                camera.rotation.z = Math.sin(animT * 1.35) * 0.025;
              }
              const spd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.12;
              steerMonsterStep(state.monsterPos, state.monsterPos.x + (dx), state.monsterPos.z + (dz), spd, dt);
              monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
              monsterGroup.rotation.y = smoothYaw(monsterGroup.rotation.y || 0, Math.atan2(dx, dz), dt * 7.5);
              if (dM < 1.5) { startKillAnimation(); return; }
            }
            const df = zCfg.safe ? 0 : Math.max(0, Math.min(1, 1 - (dM - 2) / 14));
            elDangerVig.style.opacity = String(df * 0.85);
            elHudObj.textContent = zCfg.hud + zCfg.done + ' / ' + zCfg.tot + (zCfg.ex.unlocked ? ' • CHIQISH OCHILDI!' : '');
            const bob = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM); updateVhsGrain(0.18 + df * 0.35); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level9') {
            for (let i = 0; i < l9Lamps.length; i++) {
              const lp = l9Lamps[i];
              const fl = Math.sin(animT * 13 + lp.phase) > -0.78 ? 1.25 : 0.2;
              lp.light.intensity = fl;
            }
            let nearF = false;
            for (let i = 0; i < l9FuseBoxes.length; i++) {
              if (!l9FuseBoxes[i].fixed && Math.hypot(state.pos.x - l9FuseBoxes[i].x, state.pos.z - l9FuseBoxes[i].z) < 2.8) nearF = true;
            }
            const dEx9 = Math.hypot(state.pos.x - l9Exit.x, state.pos.z - l9Exit.z);
            if (l9Exit.unlocked && dEx9 < 2.4) { enterMetroLobby(true); return; }
            if (nearF) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'ELEKTR QUTISINI TUZATISH (E)'; }
            else if (l9Exit.unlocked && dEx9 < 3.6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'METRONI OCHISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            // Neighborhood Watch Searchlight Entity Patrol & Chase
            const dW = Math.hypot(state.pos.x - l9WatcherPos.x, state.pos.z - l9WatcherPos.z);
            const chasingW = dW < 28;
            const tX = chasingW ? state.pos.x : Math.sin(animT * 0.22) * 52;
            const tZ = chasingW ? state.pos.z : Math.cos(animT * 0.19) * 52;
            const dxW = tX - l9WatcherPos.x, dzW = tZ - l9WatcherPos.z;
            const distW = Math.hypot(dxW, dzW) || 1;
            const spdW = (chasingW ? cfg.chaseSpeed : cfg.mSpeed) * 0.96;
            l9WatcherPos.x += (dxW / distW) * spdW * dt;
            l9WatcherPos.z += (dzW / distW) * spdW * dt;
            l9WatcherGroup.position.set(l9WatcherPos.x, Math.sin(animT * 3) * 0.25, l9WatcherPos.z);
            l9WatcherGroup.rotation.y = Math.atan2(dxW, dzW);
            const df9 = Math.max(0, Math.min(1, 1 - (dW - 2.5) / 18.0));
            elDangerVig.style.opacity = String(df9 * 0.85);
            if (dW < 1.8) { startKillAnimation(); return; }

            elHudObj.textContent = 'Level 9 • Elektr qutilari: ' + state.l9FusesDone + ' / 6' + (l9Exit.unlocked ? ' • CHIQISH OCHILDI!' : '');
            const bob9 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.05 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob9, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dW); updateVhsGrain(0.32 + df9 * 0.4); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level10') {
            let nearR = false;
            for (let i = 0; i < l10Radios.length; i++) {
              if (!l10Radios[i].active && Math.hypot(state.pos.x - l10Radios[i].x, state.pos.z - l10Radios[i].z) < 3.2) nearR = true;
            }
            const dEx10 = Math.hypot(state.pos.x - l10Exit.x, state.pos.z - l10Exit.z);
            if (l10Exit.unlocked && dEx10 < 2.6) { enterMetroLobby(true); return; }
            if (nearR) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'RADIO MINORANI SOZLASH (E)'; }
            else if (l10Exit.unlocked && dEx10 < 3.8) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = "YERTO'LADAN CHIQISH (E)"; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            elHudObj.textContent = 'Level 10 • Radio minoralar: ' + state.l10RadiosDone + ' / 5' + (l10Exit.unlocked ? ' • LYUK OCHILDI!' : '');
            elDangerVig.style.opacity = '0';
            const bob10 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.05 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob10, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(99); updateVhsGrain(0.14); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level11') {
            let nearC = false;
            for (let i = 0; i < l11Cards.length; i++) {
              const c = l11Cards[i];
              if (c.taken) continue;
              c.mesh.rotation.y += dt * 2.0;
              if (Math.hypot(state.pos.x - c.x, state.pos.z - c.z) < 2.8) nearC = true;
            }
            const dEx11 = Math.hypot(state.pos.x - l11Exit.x, state.pos.z - l11Exit.z);
            if (l11Exit.unlocked && dEx11 < 2.8) { enterMetroLobby(true); return; }
            if (nearC) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'METRO KARTANI OLISH (E)'; }
            else if (l11Exit.unlocked && dEx11 < 4.0) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'GRAND CENTRAL METRO (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            const dM11 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            const ch11 = dM11 < 26;
            const mDx11 = (ch11 ? state.pos.x : Math.sin(animT * 0.16) * 70) - state.monsterPos.x;
            const mDz11 = (ch11 ? state.pos.z : Math.cos(animT * 0.14) * 70) - state.monsterPos.z;
            const mD11 = Math.hypot(mDx11, mDz11) || 1;
            const spd11 = (ch11 ? cfg.chaseSpeed : cfg.mSpeed) * 1.05;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (mDx11), state.monsterPos.z + (mDz11), spd11, dt);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = Math.atan2(mDx11, mDz11);
            const df11 = Math.max(0, Math.min(1, 1 - (dM11 - 2.0) / 16.0));
            elDangerVig.style.opacity = String(df11 * 0.8);
            if (dM11 < 1.55) { startKillAnimation(); return; }

            elHudObj.textContent = 'Level 11 • Metro kartalar: ' + state.l11CardsDone + ' / 6' + (l11Exit.unlocked ? ' • BEKAT OCHILDI!' : '');
            const bob11 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.05 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bob11, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dM11); updateVhsGrain(0.18 + df11 * 0.3); renderer.render(scene, camera); return;
          }

          if (state.zone === 'levelend') {
            let nearD = false;
            for (let i = 0; i < lEndDisks.length; i++) {
              const d = lEndDisks[i];
              if (d.taken) continue;
              d.mesh.rotation.y += dt * 2.2;
              if (Math.hypot(state.pos.x - d.x, state.pos.z - d.z) < 2.6) nearD = true;
            }
            const nearTerm = Math.hypot(state.pos.x - lEndTerminal.x, state.pos.z - lEndTerminal.z) < 3.2;
            const dExE = Math.hypot(state.pos.x - lEndExit.x, state.pos.z - lEndExit.z);
            if (lEndExit.unlocked && dExE < 2.4) { enterMetroLobby(true); return; }
            if (nearD) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'DISKETANI OLISH (E)'; }
            else if (nearTerm) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'TERMINALNI OCHISH (E)'; }
            else if (lEndExit.unlocked && dExE < 3.4) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'ORQA ESHIKDAN CHIQISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            let dME = 99;
            if (state.lEndTrapActive) {
              dME = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
              const dxE = state.pos.x - state.monsterPos.x, dzE = state.pos.z - state.monsterPos.z;
              const ddE = Math.hypot(dxE, dzE) || 1;
              state.monsterPos.x += (dxE / ddE) * cfg.chaseSpeed * 1.05 * dt;
              state.monsterPos.z += (dzE / ddE) * cfg.chaseSpeed * 1.05 * dt;
              resolveWallCollision(state.monsterPos, 0.55);
              monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
              monsterGroup.rotation.y = Math.atan2(dxE, dzE);
              elDangerVig.style.opacity = String(Math.max(0, Math.min(0.88, 1 - (dME - 2) / 14)));
              if (dME < 1.55) { startKillAnimation(); return; }
            } else elDangerVig.style.opacity = '0';

            elHudObj.textContent = 'The End • Disketa: ' + state.lEndDisksDone + '/4' + (lEndExit.unlocked ? ' • ORQA ESHIK OCHILDI!' : (state.lEndDisksDone >= 4 ? ' • TERMINALNI OCHING!' : ''));
            const bobE = Math.sin(state.bobPhase) * (len > 0.05 ? 0.045 : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bobE, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dME); updateVhsGrain(0.18); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level61') {
            let nearBar = null;
            for (let i = 0; i < l61Counters.length; i++) {
              if (Math.hypot(state.pos.x - l61Counters[i].x, state.pos.z - l61Counters[i].z) < 3.2) nearBar = l61Counters[i];
            }
            const dEx61 = Math.hypot(state.pos.x - l61Exit.x, state.pos.z - l61Exit.z);
            if (dEx61 < 2.2) { enterMetroLobby(true); return; }
            if (nearBar) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'BODOM SUVI ICHISH (E)'; }
            else if (dEx61 < 3.6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'METROGA QAYTISH (E)'; }
            else if (!window._nearExtraLoreNote) elInteractBtn.classList.remove('visible');

            elHudObj.textContent = 'Level 6.1: Snackrooms (XAVFSIZ) • Barlar: ' + state.l61SnacksDone + '/3';
            elDangerVig.style.opacity = '0';
            const bob61 = Math.sin(state.bobPhase) * (len > 0.05 ? 0.04 : 0.008);
            camera.position.set(state.pos.x, state.pos.y + bob61, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(99); updateVhsGrain(0.06); renderer.render(scene, camera); return;
          }

          if (state.zone === 'level922') {
            elInteractBtn.classList.remove('visible');
            if (state.l922Falling) {
              state.velY -= 22.0 * dt;
              state.pos.y += state.velY * dt;
              state.l922FallTimer += dt;
              // Gently pull into exact center of abyss & look down/spin slightly
              state.pos.x *= Math.max(0, 1 - dt * 2.5);
              state.pos.z *= Math.max(0, 1 - dt * 2.5);
              if (state.l922FallWin) {
                const glow = Math.min(1, state.l922FallTimer / 1.8);
                scene.background.setRGB(0.08 + glow * 0.92, 0.09 + glow * 0.91, 0.11 + glow * 0.89);
                scene.fog.color.copy(scene.background);
                if (state.l922FallTimer > 1.85) {
                  state.l922Falling = false;
                  enterMetroLobby(true);
                  return;
                }
              } else if (state.pos.y <= 1.65) {
                // Landed back at Floor 0 from wrong floor!
                state.l922Falling = false;
                state.velY = 0;
                state.onGround = true;
                state.pos.set(4.1, 1.65, 0);
                state.l922TotalAng = 0;
                state.l922PrevAng = 0;
                state.l922Floor = 0;
                Sound.blackout();
                showToast("NOTO'G'RI QAVATDAN SAKRADINGIZ! 94 raqamli qavatni toping!", true);
              }
            } else {
              // Polar spiral coordinates around central shaft (0, 0)
              const r = Math.hypot(state.pos.x, state.pos.z);
              const curAng = Math.atan2(state.pos.z, state.pos.x);
              let dAng = curAng - state.l922PrevAng;
              if (dAng > Math.PI) dAng -= Math.PI * 2;
              if (dAng < -Math.PI) dAng += Math.PI * 2;
              state.l922PrevAng = curAng;

              // Outer concrete cylinder clamp + inner safety rail while walking on stairs!
              if (r > L922_R_OUT - 0.6) {
                const sc = (L922_R_OUT - 0.6) / (r || 1);
                state.pos.x *= sc;
                state.pos.z *= sc;
              }
              if (state.onGround && r < L922_R_IN + 0.35) {
                const sc = (L922_R_IN + 0.35) / (r || 1);
                state.pos.x *= sc;
                state.pos.z *= sc;
              }

              // Smooth brisk climbing (1.28x angle gain so climbing feels effortless!)
              state.l922TotalAng = Math.max(0, Math.min((L922_FLOORS - 1) * Math.PI * 2, state.l922TotalAng + dAng * 1.28));
              const stairY = (state.l922TotalAng / (Math.PI * 2)) * L922_FLOOR_H;
              state.l922Floor = Math.floor(state.l922TotalAng / (Math.PI * 2));

              // Only fall into the Central Void Abyss when JUMPING over the inner concrete lip!
              if (!state.onGround && r < L922_R_IN + 0.15) {
                state.l922Falling = true;
                state.l922FallTimer = 0;
                state.velY = Math.min(state.velY, -2.5);
                state.l922FallWin = (state.l922Floor >= l922TargetFloor);
                if (state.l922FallWin) {
                  Sound.win();
                  showToast("94-QAVATDAN BO'SHLIQQA SAKRADINGIZ! HAQIQIY CHIQISH...");
                } else {
                  showToast("PASTGA QULAYAPSIZ...");
                }
              } else {
                // Smooth stair walking + jumping physics
                if (!state.onGround || state.velY > 0) {
                  state.velY -= 19.5 * dt;
                  state.pos.y += state.velY * dt;
                  if (state.pos.y <= stairY + 1.65) {
                    state.pos.y = stairY + 1.65;
                    state.velY = 0;
                    state.onGround = true;
                  }
                } else {
                  state.pos.y += ((stairY + 1.65) - state.pos.y) * Math.min(1, dt * 16);
                }
              }
            }

            const dispFloor = (state.l922Floor === l922TargetFloor) ? '94 (!)' : String(state.l922Floor);
            elHudObj.textContent = 'Level 9223372036854775807 • Qavat: ' + dispFloor + (state.l922Floor === l922TargetFloor ? ' • MARKAZGA SAKRANG!' : ' • 94-qavatni toping');

            const bobY922 = state.l922Falling ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.065 : 0.038) : 0.01);
            camera.position.set(state.pos.x, state.pos.y + bobY922, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            elDangerVig.style.opacity = state.l922Floor === l922TargetFloor ? '0.25' : '0';
            drawRadar(99);
            updateVhsGrain(0.38);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'level94') {
            // Animate Floating Castle, Weirdcore Eyes, Clouds & Dream Orbs
            if (l94CastleGroup) l94CastleGroup.position.y = 68 + Math.sin(animT * 0.7) * 2.2;
            for (let i = 0; i < l94Eyes.length; i++) {
              const e = l94Eyes[i];
              e.mesh.position.y = e.baseY + Math.sin(animT * 1.1 + e.phase) * 1.1;
              e.mesh.lookAt(state.pos.x, state.pos.y, state.pos.z);
            }
            for (let i = 0; i < l94Clouds.length; i++) {
              const cl = l94Clouds[i];
              cl.mesh.position.x += cl.speed * dt;
              if (cl.mesh.position.x > 260) cl.mesh.position.x = -260;
            }

            // Day / Night Cycle (24s Day = Safe exploration, 18s Night = Animation Hunt!)
            state.l94CycleTimer -= dt;
            if (state.l94CycleTimer <= 0) {
              state.l94IsNight = !state.l94IsNight;
              state.l94CycleTimer = state.l94IsNight ? 25.0 : 60.0;
              if (state.l94IsNight) {
                Sound.stopAllClips();
                Sound.blackout();
                animationGroup.visible = true;
                // Spawn Animation 28m away from player on road
                const ang = Math.random() * Math.PI * 2;
                state.monsterPos.set(
                  Math.max(-235, Math.min(235, state.pos.x + Math.cos(ang) * 32)),
                  0,
                  Math.max(-235, Math.min(235, state.pos.z + Math.sin(ang) * 32))
                );
                showToast("TUN TUSHDI! UYLARGA KIRIB YASHIRINING — ANIMATSIYA OVGA CHIQDI!", true);
              } else {
                animationGroup.visible = false;
                state.monsterChasing = false;
                showToast("TONG OTDI! Kunduzi xavfsiz — tush xotiralarini qidiring!");
              }
            }

            // Smooth Sky / Fog / Lighting morph between Pastel Day & Void Night
            const targetSky = state.l94IsNight ? 0x080a16 : 0xb8cfe6;
            if (l94SkyDome) l94SkyDome.material.color.lerp(new THREE.Color(state.l94IsNight ? 0x11182c : 0xffffff), Math.min(1, dt * 2.5));
            if (l94SunDirLight) l94SunDirLight.intensity += ((state.l94IsNight ? 0.12 : 1.05) - l94SunDirLight.intensity) * Math.min(1, dt * 2.5);
            scene.background.lerp(new THREE.Color(targetSky), Math.min(1, dt * 2.5));
            scene.fog.color.copy(scene.background);
            scene.fog.density += ((state.l94IsNight ? 0.028 : 0.0046) - scene.fog.density) * Math.min(1, dt * 2.5);
            hemiLight.intensity += ((state.l94IsNight ? 0.22 : 0.92) - hemiLight.intensity) * Math.min(1, dt * 2.5);
            if (l94SunMesh) {
              l94SunMesh.material.color.setHex(state.l94IsNight ? 0xc084fc : 0xfef08a);
            }

            // Eerie nostalgic music box plays during Daytime from Siren Poles
            if (!state.l94IsNight) {
              state.l94MusicTimer -= dt;
              if (state.l94MusicTimer <= 0) {
                state.l94MusicTimer = 1.05;
                Sound.musicBox(state.l94NoteIdx++);
              }
            }

            // Check if player is safely inside any Pastel Cottage
            let insideHouse = false;
            for (let i = 0; i < l94Houses.length; i++) {
              const h = l94Houses[i];
              if (Math.abs(state.pos.x - h.x) < h.halfX && Math.abs(state.pos.z - h.z) < h.halfZ) {
                insideHouse = true;
                break;
              }
            }
            state.l94InHouse = insideHouse;

            // Check Dream Memory Orbs & Exit Portal
            let nearOrb = null;
            for (let i = 0; i < l94Orbs.length; i++) {
              const o = l94Orbs[i];
              if (o.collected) continue;
              o.mesh.rotation.y += dt * 1.8;
              o.ring.rotation.x += dt * 2.4;
              o.mesh.position.y = (o.y || 1.35) + Math.sin(animT * 2.8 + i) * 0.16;
              if (Math.hypot(state.pos.x - o.x, state.pos.z - o.z) < 2.5) nearOrb = o;
            }
            const dEx94 = Math.hypot(state.pos.x - l94Exit.x, state.pos.z - l94Exit.z);
            if (l94Exit.unlocked && dEx94 < 3.4) { enterMetroLobby(true); return; }

            let nearTrapDoor94 = false;
            if (typeof l94TrapDoors !== 'undefined') {
              for (let i = 0; i < l94TrapDoors.length; i++) {
                if (Math.hypot(state.pos.x - l94TrapDoors[i].x, state.pos.z - l94TrapDoors[i].z) < 2.4) { nearTrapDoor94 = true; break; }
              }
            }
            if (nearTrapDoor94) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'ESHIKNI OCHISH (E)'; }
            else if (l94Exit.unlocked && dEx94 < 3.6) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = "CHIQISH (E)"; }
            else { elInteractBtn.classList.remove('visible'); }

            // HUD Objective with Day/Night Timer & Safe House indicator
            const phaseTxt = state.l94IsNight
              ? (insideHouse ? 'TUN (UYDA XAVFSIZ)' : 'TUN! UYGA KIRING!')
              : 'KUNDUZ';
            elHudObj.textContent = 'Level 94 • ' + phaseTxt + ' (' + Math.ceil(state.l94CycleTimer) + 's)';

            // Stop-Motion "Animation" Entity AI (Active only at Night; cannot enter Pastel Houses)
            let dMon94 = 99;
            if (state.l94IsNight) {
              dMon94 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
              state.monsterChasing = !insideHouse;
              if (state.monsterChasing) {
                { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
              } else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 3.0) {
                state.monsterTarget = new THREE.Vector3((Math.random() - 0.5) * 420, 0, (Math.random() - 0.5) * 420);
              }
              const mDx = state.monsterTarget.x - state.monsterPos.x;
              const mDz = state.monsterTarget.z - state.monsterPos.z;
              const mDist = Math.hypot(mDx, mDz) || 1;
              const mSpd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.18;
              const nextX = state.monsterPos.x + (mDx / mDist) * mSpd * dt;
              const nextZ = state.monsterPos.z + (mDz / mDist) * mSpd * dt;
              // Block Animation from stepping into any safe Pastel House
              let blocksHouse = false;
              for (let i = 0; i < l94Houses.length; i++) {
                const h = l94Houses[i];
                if (Math.abs(nextX - h.x) < h.halfX + 0.9 && Math.abs(nextZ - h.z) < h.halfZ + 0.9) {
                  blocksHouse = true; break;
                }
              }
              if (!blocksHouse) {
                state.monsterPos.x = nextX;
                state.monsterPos.z = nextZ;
              }
              resolveWallCollision(state.monsterPos, 0.55);

              // Jerky 10fps Stop-Motion Claymation Pose!
              const smStep = Math.floor(animT * 10) / 10;
              const monHillY = getDreamHillY(state.monsterPos.x, state.monsterPos.z);
              animationGroup.position.set(state.monsterPos.x, monHillY + (l94WolfLoaded ? 0 : Math.abs(Math.sin(smStep * 12)) * 0.14), state.monsterPos.z);
              animationGroup.rotation.y = Math.atan2(mDx, mDz); updateActiveMonsterMixers(dt, true);
              const wGait = Math.sin(animT * 11);
              if (animLimbs.lLeg) animLimbs.lLeg.rotation.x = wGait * 0.72;
              if (animLimbs.rLeg) animLimbs.rLeg.rotation.x = -wGait * 0.72;
              if (animLimbs.lArm) animLimbs.lArm.rotation.x = -wGait * 0.72;
              if (animLimbs.rArm) animLimbs.rArm.rotation.x = wGait * 0.72;
              if (animLimbs.head) animLimbs.head.rotation.x = 0.22 + Math.abs(Math.sin(animT * 14)) * 0.45;

              const df94 = Math.max(0, Math.min(1, 1 - (dMon94 - 2.0) / 16.0));
              elDangerVig.style.opacity = String(insideHouse ? df94 * 0.25 : df94 * 0.9);
              if (!insideHouse && dMon94 < 1.55) {
                startKillAnimation();
                return;
              }
            } else {
              elDangerVig.style.opacity = '0';
            }

            const hillGroundY = getDreamHillY(state.pos.x, state.pos.z);
            state.pos.y += ((hillGroundY + 1.65) - state.pos.y) * Math.min(1, dt * 14);
            const bobY94 = Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.075 : 0.042) : 0.012);
            camera.position.set(state.pos.x, state.pos.y + bobY94, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMon94);
            updateVhsGrain(state.l94IsNight ? 0.45 : 0.12);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'levelfun') {
            // --- LEVEL FUN =) (Floating Balloons, Creepy Detuned Birthday Music Box, 10 Gift Boxes & Yellow Partygoer =)) ---
            for (let i = 0; i < lFunBalloons.length; i++) {
              const b = lFunBalloons[i];
              b.mesh.position.y = b.baseY + Math.sin(animT * 1.8 + b.phase) * 0.16;
            }
            state.lFunMusicTimer -= dt;
            if (state.lFunMusicTimer <= 0) {
              state.lFunMusicTimer = 0.72;
              Sound.musicBox(state.lFunNoteIdx++);
            }

            nearestFunGift = null;
            for (let i = 0; i < lFunGifts.length; i++) {
              const g = lFunGifts[i];
              if (!g.opened) {
                g.mesh.rotation.y += dt * 1.4;
                if (Math.hypot(state.pos.x - g.x, state.pos.z - g.z) < 2.6) nearestFunGift = g;
              }
            }
            nearestLocker = null;
            let minLF = 2.9;
            for (let i = 0; i < lFunLockers.length; i++) {
              const d = Math.hypot(state.pos.x - lFunLockers[i].x, state.pos.z - lFunLockers[i].z);
              if (d < minLF) { minLF = d; nearestLocker = lFunLockers[i]; }
            }
            const dExF = Math.hypot(state.pos.x - lFunExit.x, state.pos.z - lFunExit.z);
            nearExit = dExF < 3.4;
            if (lFunExit.unlocked && dExF < 2.1) { enterMetroLobby(true); return; }

            if (state.hiding) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)'; }
            else if (nearExit && lFunExit.unlocked) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'ZALDAN CHIQISH =) (E)'; }
            else if (nearestFunGift) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = "SOVG'A QUTISINI OCHISH (E)"; }
            else if (nearestLocker) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)'; }
            else { elInteractBtn.classList.remove('visible'); }

            // Yellow Partygoer =) Stalker AI
            const dMonF = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dMonF, 20.0, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = lFunOpenCells[Math.floor(Math.random() * lFunOpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const mDxF = state.monsterTarget.x - state.monsterPos.x, mDzF = state.monsterTarget.z - state.monsterPos.z;
            const mDistF = Math.hypot(mDxF, mDzF) || 1;
            const mSpdF = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.15;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (mDxF), state.monsterPos.z + (mDzF), mSpdF, dt);
            partygoerGroup.position.set(state.monsterPos.x, partygoerLoaded ? 0 : Math.abs(Math.sin(animT * 7)) * 0.08, state.monsterPos.z);
            partygoerGroup.rotation.y = Math.atan2(mDxF, mDzF); updateActiveMonsterMixers(dt, dMonF < 16);
            const dfF = Math.max(0, Math.min(1, 1 - (dMonF - 2.0) / 14.0));
            elDangerVig.style.opacity = String(dfF * 0.88);
            if (!state.hiding && dMonF < 1.45) {
              startKillAnimation();
              return;
            }

            const bobYF = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.075 : 0.042) : 0.012);
            camera.position.set(state.pos.x, state.pos.y + bobYF, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMonF);
            updateVhsGrain(dfF);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'level2') {
            // --- LEVEL 2: PIPE DREAMS (140m Steam-Pipe Tunnels, 5 Breakers, Scalding Steam Traps, Stalker!) ---
            let inSteam = false;
            for (let i = 0; i < l2SteamVents.length; i++) {
              const sv = l2SteamVents[i];
              const cycle = (animT + sv.phase) % 7.5;
              sv.active = cycle > 4.6;
              sv.mesh.visible = sv.active;
              if (sv.active) {
                sv.mesh.scale.setScalar(0.92 + Math.sin(animT * 24) * 0.08);
                if (Math.hypot(state.pos.x - sv.x, state.pos.z - sv.z) < 2.2) inSteam = true;
              }
            }
            if (inSteam) {
              state.l2SteamBurn += dt;
              if (state.l2SteamBurn > 0.15 && state.l2SteamBurn < 0.25) {
                Sound.steamHiss();
                showToast("QAYNOQ BUG' OQIMI! CHEKINING!", true);
              }
              if (state.l2SteamBurn >= 2.2) { startKillAnimation(); return; }
            } else {
              state.l2SteamBurn = Math.max(0, state.l2SteamBurn - dt * 1.6);
            }

            nearestL2Breaker = null;
            for (let i = 0; i < l2Breakers.length; i++) {
              const b = l2Breakers[i];
              if (!b.active && Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 2.9) { nearestL2Breaker = b; break; }
            }
            nearestLocker = null;
            let minL2 = 2.9;
            for (let i = 0; i < l2Lockers.length; i++) {
              const d = Math.hypot(state.pos.x - l2Lockers[i].x, state.pos.z - l2Lockers[i].z);
              if (d < minL2) { minL2 = d; nearestLocker = l2Lockers[i]; }
            }
            const dEx2 = Math.hypot(state.pos.x - l2Exit.x, state.pos.z - l2Exit.z);
            nearExit = dEx2 < 3.4;
            if (l2Exit.unlocked && dEx2 < 2.1) { enterMetroLobby(true); return; }

            if (state.hiding) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)'; }
            else if (nearExit && l2Exit.unlocked) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'LYUKDAN CHIQISH (E)'; }
            else if (nearestL2Breaker) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'BOSIM UZGICHINI O\'CHIRISH (E)'; }
            else if (nearestLocker) { elInteractBtn.classList.add('visible'); elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)'; }
            else { elInteractBtn.classList.remove('visible'); }

            const dMon2 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.monsterChasing = canMonsterDetect(dMon2, 22.0, wantsSprint);
            if (state.monsterChasing) { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(state.pos.x, 0, state.pos.z); }
            else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              const p = l2OpenCells[Math.floor(Math.random() * l2OpenCells.length)];
              { if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3(); state.monsterTarget.set(p.x, 0, p.z); }
            }
            const mDx2 = state.monsterTarget.x - state.monsterPos.x, mDz2 = state.monsterTarget.z - state.monsterPos.z;
            const mDist2 = Math.hypot(mDx2, mDz2) || 1;
            const mSpd2 = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * 1.18;
            steerMonsterStep(state.monsterPos, state.monsterPos.x + (mDx2), state.monsterPos.z + (mDz2), mSpd2, dt);
            state.monsterYaw = Math.atan2(mDx2, mDz2);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = state.monsterYaw;
            if (monsterMixer) monsterMixer.update(dt * (state.monsterChasing ? 1.5 : 0.95)); updateActiveMonsterMixers(dt, state.monsterChasing);
            obsWalkPhase += dt * (state.monsterChasing ? 8.6 : 4.8);
            obsLegs[0].rotation.x = Math.sin(obsWalkPhase) * 0.48; if (typeof mainWolf !== 'undefined') { const g = Math.sin(obsWalkPhase * 1.45); mainWolf.legs[0].rotation.x = g * 0.72; mainWolf.legs[1].rotation.x = -g * 0.72; mainWolf.legs[2].rotation.x = -g * 0.72; mainWolf.legs[3].rotation.x = g * 0.72; mainWolf.jawG.rotation.x = 0.22 + Math.abs(Math.sin(obsWalkPhase * 2.0)) * 0.42; mainWolf.tail.rotation.z = Math.sin(obsWalkPhase * 1.6) * 0.35; } obsLegs[1].rotation.x = -Math.sin(obsWalkPhase) * 0.48;
            obsArms[0].rotation.x = -Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.9 : 0.18);
            obsArms[1].rotation.x = Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.9 : 0.18);
            jawPivot.rotation.x = state.monsterChasing ? 0.55 : 0.12;
            state.mStepTimer -= dt;
            if (state.mStepTimer <= 0) { state.mStepTimer = state.monsterChasing ? 0.33 : 0.6; Sound.monsterStep(dMon2); }
            const df2 = Math.max(state.l2SteamBurn / 2.2, Math.max(0, Math.min(1, 1 - (dMon2 - 2.0) / 15.0)));
            elDangerVig.style.opacity = String(df2 * 0.9);
            if (!state.hiding && dMon2 < 1.38) { startKillAnimation(); }

            const bobY2 = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.075 : 0.042) : 0.012);
            camera.position.set(state.pos.x, state.pos.y + bobY2, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMon2);
            updateVhsGrain(df2);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'levelrun') {
            // --- LEVEL !: RUN FOR YOUR LIFE! (240m Red-Alarm Hospital Sprint + Relentless Pursuit!) ---
            state.stamina = 100; // Adrenaline infinite sprint!
            state.lRunAlarmTimer -= dt;
            if (state.lRunAlarmTimer <= 0) {
              state.lRunAlarmTimer = 1.45;
              Sound.alarm();
            }
            const pulse = Math.sin(animT * 9.5) > 0;
            hemiLight.intensity = pulse ? 0.68 : 0.24;
            for (let i = 0; i < lRunAlarmLights.length; i++) {
              lRunAlarmLights[i].mat.color.setHex(pulse ? 0xff2222 : 0x450a0a);
            }

            const rem = Math.max(0, Math.ceil(state.pos.z - lRunExit.z));
            elHudObj.textContent = 'LEVEL ! • YUGURING! ' + rem + 'm';
            elInteractBtn.classList.remove('visible');

            // Win when reaching the green EXIT door at z = -232m!
            if (state.pos.z <= lRunExit.z + 2.0) {
              enterMetroLobby(true);
              return;
            }

            // Relentless hyper-fast entity chasing straight down the 240m hospital corridor!
            const rDx = state.pos.x - state.monsterPos.x;
            const rDz = state.pos.z - state.monsterPos.z;
            const dMonR = Math.hypot(rDx, rDz) || 1;
            const chaseSpd = 6.95; // Just slightly below player sprint (7.8) so any hesitation or obstacle hit is deadly!
            state.monsterPos.x += (rDx / dMonR) * chaseSpd * dt;
            state.monsterPos.z += (rDz / dMonR) * chaseSpd * dt;
            state.monsterYaw = Math.atan2(rDx, rDz);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = state.monsterYaw;
            if (monsterMixer) monsterMixer.update(dt * 1.85); updateActiveMonsterMixers(dt, true);
            obsWalkPhase += dt * 10.5;
            obsLegs[0].rotation.x = Math.sin(obsWalkPhase) * 0.56; obsLegs[1].rotation.x = -Math.sin(obsWalkPhase) * 0.56;
            obsArms[0].rotation.x = -Math.sin(obsWalkPhase) * 0.42 - 1.05;
            obsArms[1].rotation.x = Math.sin(obsWalkPhase) * 0.42 - 1.05;
            jawPivot.rotation.x = 0.65 + Math.abs(Math.sin(animT * 16)) * 0.25;
            state.mStepTimer -= dt;
            if (state.mStepTimer <= 0) { state.mStepTimer = 0.26; Sound.monsterStep(dMonR); }
            const dfR = Math.max(0.25, Math.min(1, 1 - (dMonR - 2.0) / 18.0));
            elDangerVig.style.opacity = String(dfR * 0.92);
            if (dMonR < 1.55) { startKillAnimation(); }

            const bobYR = Math.sin(state.bobPhase) * (len > 0.05 ? 0.085 : 0.015);
            camera.position.set(state.pos.x, state.pos.y + bobYR, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMonR);
            updateVhsGrain(dfR);
            renderer.render(scene, camera);
            return;
          }

          if (state.zone === 'level37') {
            // --- LEVEL 37: DON'T SPLASH! (Dry Platforms, Moving Bridges, Sinking Blocks, Splash Ripples & Blind Sound-Hunting Monster "IT"!) ---
            if (l37WaterMesh) l37WaterMesh.position.y = 0.44 + Math.sin(animT * 2.2) * 0.025;

            // Update Moving Bridges & Sinking Blocks + detect player standing on a Dry Platform!
            let supportTopY = 0; // Pool floor y = 0 (underwater!)
            let carryDx = 0;
            const feetY = state.pos.y - 1.65;
            for (let i = 0; i < l37Platforms.length; i++) {
              const p = l37Platforms[i];
              const prevX = p.x;
              if (p.type === 'move') {
                p.x = p.baseX + Math.sin(animT * p.moveSpd + p.phase) * p.moveAmp;
                p.mesh.position.x = p.x;
              }
              const onPlatXZ = Math.abs(state.pos.x - p.x) <= p.w * 0.5 + 0.34 && Math.abs(state.pos.z - p.z) <= p.d * 0.5 + 0.34;
              if (p.type === 'sink') {
                if (onPlatXZ && feetY >= p.topY - 0.4 && feetY <= p.topY + 0.35 && state.velY <= 0) {
                  p.sinking = true;
                }
                if (p.sinking) {
                  p.sinkTimer += dt;
                  if (p.sinkTimer < 1.9) {
                    p.topY = Math.max(0.05, p.baseTopY - p.sinkTimer * 0.52);
                  } else if (p.sinkTimer > 3.8) {
                    p.topY = Math.min(p.baseTopY, p.topY + dt * 0.9);
                    if (p.topY >= p.baseTopY) { p.sinking = false; p.sinkTimer = 0; }
                  }
                  p.mesh.position.y = p.topY - p.h / 2;
                }
              }
              if (onPlatXZ && feetY >= p.topY - 0.42 && p.topY > supportTopY) {
                supportTopY = p.topY;
                carryDx = p.x - prevX;
              }
            }

            // Apply vertical jump/gravity physics & moving-bridge horizontal carry
            state.pos.x += carryDx;
            state.velY -= 19.0 * dt;
            state.pos.y += state.velY * dt;
            const targetEyeY = supportTopY + 1.65;
            if (state.pos.y <= targetEyeY) {
              state.pos.y = targetEyeY;
              state.velY = 0;
              state.onGround = true;
            } else {
              state.onGround = false;
            }

            // Check if player is on a DRY platform (topY >= 0.6) vs SPLASHING IN THE WATER!
            const onDry = (state.pos.y - 1.65) >= 0.52;
            const inWater = !onDry;
            if (inWater && (!state.wasInWater || len > 0.08)) {
              // SPLASH! Alert the blind monster "IT"!
              if (!state.wasInWater || Math.random() < dt * 2.8) {
                spawnWaterRipple(state.pos.x, state.pos.z);
                if (!state.wasInWater) {
                  Sound.bigSplash();
                  showToast("SUV SACHRADI! U SIZNI ESHITDI — QURUQ PLATFORMAGA SAKRANG!", true);
                }
              }
              state.lastSplashPos.set(state.pos.x, 0, state.pos.z);
              state.splashAlertTimer = 6.0;
            }
            state.wasInWater = inWater;

            // Animate expanding 3D water ripple rings
            for (let i = l37Ripples.length - 1; i >= 0; i--) {
              const rp = l37Ripples[i];
              rp.age += dt;
              const s = 1 + rp.age * 7.5;
              rp.mesh.scale.setScalar(s);
              rp.mesh.material.opacity = Math.max(0, 0.85 * (1 - rp.age / 1.1));
              if (rp.age >= 1.1) {
                level37Group.remove(rp.mesh);
                l37Ripples.splice(i, 1);
              }
            }

            // Activate 3 Dry-Island Pool Gate Switches (touching the glowing orb activates it!)
            l37Switches.forEach((sw) => {
              sw.orb.rotation.y += dt * 2.4;
              if (sw.active) return;
              if (Math.hypot(state.pos.x - sw.x, state.pos.z - sw.z) < 1.85 && onDry) {
                sw.active = true;
                sw.orbMat.color.setHex(0x22c55e);
                sw.light.color.setHex(0x22c55e);
                state.l37SwitchesDone += 1;
                Sound.valveTurn();
                if (state.l37SwitchesDone >= l37Switches.length) {
                  l37Exit.unlocked = true;
                  if (l37Exit.portalMat) l37Exit.portalMat.color.setHex(0x4ade80);
                  showToast("5/5 Poolrooms tugmasi yoqildi! Endi yashil CHIQISH portaliga boring!");
                } else {
                  showToast("Tugma yoqildi! (" + state.l37SwitchesDone + "/3) — Qolganlarini toping!");
                }
              }
            });

            // Collect Pebbles on Dry Islands
            l37Pebbles.forEach((pb) => {
              if (pb.taken) return;
              pb.mesh.rotation.y += dt * 2.5;
              if (Math.hypot(state.pos.x - pb.x, state.pos.z - pb.z) < 1.35) {
                pb.taken = true;
                pb.mesh.visible = false;
                state.pebbles += 1;
                Sound.pickup();
                showToast("Toshcha topildi! (E bilan otib mahluqni chalg'iting)");
              }
            });

            // Blind Sound-Hunting Monster ("IT"): CANNOT SEE YOU ON DRY PLATFORMS! Only charges toward SPLASHES!
            state.splashAlertTimer = Math.max(0, state.splashAlertTimer - dt);
            const huntingSplash = state.splashAlertTimer > 0;
            state.monsterChasing = huntingSplash;
            if (huntingSplash) {
              state.monsterTarget = state.lastSplashPos.clone();
            } else if (!state.monsterTarget || Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z) < 2.0) {
              state.monsterTarget = new THREE.Vector3((Math.random() - 0.5) * 24, 0, -Math.random() * 88);
            }
            const mDx37 = state.monsterTarget.x - state.monsterPos.x;
            const mDz37 = state.monsterTarget.z - state.monsterPos.z;
            const mDistT37 = Math.hypot(mDx37, mDz37) || 1;
            const mSpd37 = huntingSplash ? 7.6 : 3.2;
            state.monsterPos.x += (mDx37 / mDistT37) * mSpd37 * dt;
            state.monsterPos.z += (mDz37 / mDistT37) * mSpd37 * dt;
            state.monsterYaw = Math.atan2(mDx37, mDz37);
            monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
            monsterGroup.rotation.y = state.monsterYaw;
            if (monsterMixer) monsterMixer.update(dt * (huntingSplash ? 1.7 : 0.9)); updateActiveMonsterMixers(dt, huntingSplash);
            obsWalkPhase += dt * (huntingSplash ? 9.5 : 4.2);
            obsLegs[0].rotation.x = Math.sin(obsWalkPhase) * 0.5; obsLegs[1].rotation.x = -Math.sin(obsWalkPhase) * 0.5;
            obsArms[0].rotation.x = -Math.sin(obsWalkPhase) * 0.35 - (huntingSplash ? 0.95 : 0.2);
            obsArms[1].rotation.x = Math.sin(obsWalkPhase) * 0.35 - (huntingSplash ? 0.95 : 0.2);
            jawPivot.rotation.x = huntingSplash ? 0.62 : 0.12;

            const dMon37 = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
            state.mStepTimer -= dt;
            if (state.mStepTimer <= 0 && dMon37 < 20) {
              state.mStepTimer = huntingSplash ? 0.30 : 0.65;
              Sound.waterStep(huntingSplash);
            }
            // IT ONLY KILLS YOU IF YOU ARE IN THE WATER (Dry platforms keep you invisible & safe!)
            if (inWater && dMon37 < 1.55) {
              startKillAnimation();
            }

            const rem37 = Math.max(0, Math.ceil(state.pos.z - l37Exit.z));
            elHudObj.textContent = (inWater ? 'SUVDASIZ! ' : 'Tugma:' + state.l37SwitchesDone + '/5 • ') + rem37 + 'm • Tosh:' + state.pebbles;
            if (state.pos.z <= l37Exit.z + 1.8 && onDry) {
              if (l37Exit.unlocked) { enterMetroLobby(true); return; }
              else if (Math.random() < dt * 1.2) showToast("Chiqish qulflangan! Avval 5 ta qizil tugmani yoqing (" + state.l37SwitchesDone + "/3)", true);
            }

            if (state.pebbles > 0) {
              elInteractBtn.classList.add('visible');
              elInteractLbl.textContent = 'TOSHCHA OTISH (' + state.pebbles + ') (E)';
            } else if (!window._nearExtraLoreNote) {
              elInteractBtn.classList.remove('visible');
            }

            const df37 = inWater ? Math.max(0.3, Math.min(1, 1 - (dMon37 - 2) / 16)) : Math.max(0, Math.min(0.45, 1 - dMon37 / 12));
            elDangerVig.style.opacity = String(df37 * 0.85);
            const bobY37 = state.onGround ? Math.sin(state.bobPhase) * (len > 0.05 ? 0.042 : 0.01) : 0;
            camera.position.set(state.pos.x, state.pos.y + bobY37, state.pos.z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = state.yaw; camera.rotation.x = state.pitch;
            drawRadar(dMon37);
            updateVhsGrain(inWater ? 0.45 : 0);
            renderer.render(scene, camera);
            return;
          }


          // Level 0 Upper 100x100 Floor Pickups & Upper Stalker AI
          if (state.zone === 'level0' && state.pos.y >= 3.6) {
            if (window.l0UpperPickups) {
              for (let ui = 0; ui < window.l0UpperPickups.length; ui++) {
                const upk = window.l0UpperPickups[ui];
                if (upk.taken) continue;
                if (Math.hypot(state.pos.x - upk.x, state.pos.z - upk.z) < 1.55) {
                  upk.taken = true;
                  upk.mesh.visible = false;
                  state.invAlmond = (state.invAlmond || 0) + 1;
                  Sound.pickup();
                  if (window.__zulmatSyncInv) window.__zulmatSyncInv();
                  showToast("Bodom suvi sumkaga olindi! Ichish uchun pastdagi ikonni bosing (1).");
                }
              }
            }
            if (window.l0UpperStalker && !state.killing && !state.ended) {
              const us = window.l0UpperStalker;
              const du = Math.hypot(state.pos.x - us.pos.x, state.pos.z - us.pos.z);
              const sightU = (state.flashOn && state.battery > 1) ? 24 : 14;
              const seesU = (du < sightU) || (wantsSprint && du < 18);
              if (seesU) { us.tx = state.pos.x; us.tz = state.pos.z; }
              else if (Math.hypot(us.tx - us.pos.x, us.tz - us.pos.z) < 2.0) {
                us.tx = (Math.random() - 0.5) * 76;
                us.tz = (Math.random() - 0.5) * 76;
              }
              const uSpd = (seesU ? cfg.chaseSpeed * 0.92 : cfg.mSpeed * 0.85);
              steerMonsterStep(us.pos, us.tx, us.tz, uSpd, dt);
              us.group.position.set(us.pos.x, us.pos.y, us.pos.z);
              us.group.rotation.y = Math.atan2(us.tx - us.pos.x, us.tz - us.pos.z);
              if (du < 1.45) {
                startKillAnimation();
              }
            }
          }


          // Story Mode Starter Flashlight Pickup in Level 0
          if (state.zone === 'level0' && window.l0FlashPickup && !window.l0FlashPickup.taken) {
            const fp = window.l0FlashPickup;
            if (Math.hypot(state.pos.x - fp.x, state.pos.z - fp.z) < 1.55) {
              fp.taken = true;
              fp.mesh.visible = false;
              state.hasFlashlight = true;
              state.flashOn = true;
              if (btnFlash) { btnFlash.style.display = ''; btnFlash.classList.add('on'); }
              const _bfs1 = document.getElementById('btn-flash-stun');
              if (_bfs1) _bfs1.style.display = '';
              Sound.pickup();
              elHudObj.textContent = 'Level 0 • Chiqish eshigini toping';
              showToast("Fonar olindi! Yoqish: F • Chaqnatish: G");
            }
          }

          // Collect Keys
          keysList.forEach((k) => {
            if (k.collected) return;
            // Grounded flush on cabinet (no mid-air float or spin)
            if (state.pos.y < 3.6 && Math.hypot(state.pos.x - k.x, state.pos.z - k.z) < 1.35) {
              k.collected = true;
              k.mesh.visible = false;
              state.keysCollected += 1;
              Sound.pickup();
              elHudObj.textContent = 'Level 0 • Chiqish eshigini toping';
              if (window.__zulmatAddCoins) window.__zulmatAddCoins(40);
              showToast('Kalit topildi! (+40 TANGA • ' + state.keysCollected + ' ta)');
            }
          });

          // Collect Batteries
          batteries.forEach((b) => {
            if (b.collected) return;
            // Grounded flush on cabinet
            if (Math.abs((state.pos.y - 1.65) - (b.y || 0)) < 2.2 && Math.hypot(state.pos.x - b.x, state.pos.z - b.z) < 1.25) {
              b.collected = true;
              b.mesh.visible = false;
              state.invBattery = (state.invBattery || 0) + 1;
              Sound.pickup();
              if (window.__zulmatSyncInv) window.__zulmatSyncInv();
              showToast("Batareya sumkaga olindi! Almashtirish uchun pastdagi ikonni bosing (2).");
            }
          });

          // Smoothly swing open the steel fire-exit door once all keys are collected
          if (exitInfo.doorPivot) {
            const targetRot = exitInfo.unlocked ? -Math.PI * 0.56 : 0;
            exitInfo.doorPivot.rotation.y += (targetRot - exitInfo.doorPivot.rotation.y) * Math.min(1, dt * 4.5);
          }

          // Check nearby Locker or Exit Gate for Context Interact Button
          nearestLocker = null;
          let minL = 2.9;
          for (let i = 0; i < lockers.length; i++) {
            const d = Math.hypot(state.pos.x - lockers[i].x, state.pos.z - lockers[i].z);
            if (d < minL) { minL = d; nearestLocker = lockers[i]; }
          }
          const distExit = Math.hypot(state.pos.x - exitInfo.x, state.pos.z - exitInfo.z);
          nearExit = distExit < 3.2;
          window._nearLoreNote = null;
          if (window.l0LoreNotes && state.pos.y < 3.2) {
            for (let ni = 0; ni < window.l0LoreNotes.length; ni++) {
              const ln = window.l0LoreNotes[ni];
              if (!ln.read && Math.hypot(state.pos.x - ln.x, state.pos.z - ln.z) < 2.2) { window._nearLoreNote = ln; break; }
            }
          }

          // Seamless transition to Abandoned Metro Lobby when running through unlocked EXIT door!
          if (exitInfo.unlocked && distExit < 1.75) {
            enterMetroLobby();
            return;
          }

          if (state.hiding) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = 'SHKAFDAN CHIQISH (E)';
          } else if (nearExit && exitInfo.unlocked) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = 'CHIQISH VA QOCHISH (E)';
          } else if (nearExit && state.keysCollected >= state.totalKeys && !state.l0PinUnlocked) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = 'KODNI KIRITISH (E)';
          } else if (state.zone === 'level0' && window._nearLoreNote) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = (window.__zulmatLang === 'en' ? 'READ NOTE (E)' : (window.__zulmatLang === 'ru' ? 'ЧИТАТЬ ЗАПИСКУ (E)' : "XATNI O'QISH (E)"));
          } else if (state.zone === 'level0' && window.l0Ladders && window.l0Ladders.some((ld) => Math.hypot(state.pos.x - ld.x, state.pos.z - ld.z) < 2.6)) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = state.pos.y < 3.2 ? 'NARVONDAN CHIQISH (E)' : 'PASTGA TUSHISH (E)';
          } else if (nearestLocker) {
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = 'SHKAFGA YASHIRINISH (E)';
          } else {
            elInteractBtn.classList.remove('visible');
          }

          // --- Upgraded Stalker ("SOYA") AI: Flashlight, Crouch Stealth, Sprint Hearing & Investigation ---
          const dMon = Math.hypot(state.pos.x - state.monsterPos.x, state.pos.z - state.monsterPos.z);
          const stealthMult = state.crouching ? 0.6 : 1.0;
          const lightMult = (state.flashOn && state.battery > 1) ? 1.35 : 0.78;
          const effSight = cfg.sight * stealthMult * lightMult;
          const hearDist = wantsSprint ? 16.0 : (len > 0.05 && !state.crouching ? 4.8 : 0);
          const hearsPlayer = !state.hiding && hearDist > 0 && dMon < hearDist;
          const seesPlayer = !state.hiding && dMon < effSight && hasLineOfSight(state.monsterPos.x, state.monsterPos.z, state.pos.x, state.pos.z);

          if (seesPlayer || hearsPlayer) {
            if (!state.monsterChasing) {
              state.monsterChasing = true;
              state._monInvestigateT = 5.5;
              showToast('SOYA SIZNI SEZDI! YUGURING YOKI YASHIRINING!', true);
              if (Sound && Sound.playSfx3D) Sound.playSfx3D('monster_roar', state.monsterPos.x, 1.5, state.monsterPos.z, 0.92);
              if (monsterWalkAct && monsterRunAct) {
                monsterWalkAct.stop();
                monsterRunAct.play();
              }
            } else {
              state._monInvestigateT = 5.5;
            }
            if (!state.monsterTarget) state.monsterTarget = new THREE.Vector3();
            state.monsterTarget.set(state.pos.x, 0, state.pos.z);
            state._monFarT = 0;
          } else if (state.monsterChasing) {
            // Keep hunting toward last known position until reached or investigation timer expires
            state._monInvestigateT = Math.max(0, (state._monInvestigateT || 0) - dt);
            const dT = Math.hypot(state.monsterTarget.x - state.monsterPos.x, state.monsterTarget.z - state.monsterPos.z);
            if (dT < 1.35 || state._monInvestigateT <= 0 || state.hiding) {
              state.monsterChasing = false;
              if (Sound && Sound.playSfx3D && dMon < 24) Sound.playSfx3D('monster_growl', state.monsterPos.x, 1.5, state.monsterPos.z, 0.78);
              pickMonsterPatrolTarget();
              if (monsterWalkAct && monsterRunAct) {
                monsterRunAct.stop();
                monsterWalkAct.play();
              }
            }
          } else {
            // Stalker Director: if monster drifts >38m away for 18s, quietly relocate out-of-sight nearby
            if (dMon > 38) {
              state._monFarT = (state._monFarT || 0) + dt;
              if (state._monFarT > 18 && typeof openCells !== 'undefined' && openCells.length) {
                state._monFarT = 0;
                const cands = openCells.filter((c) => {
                  const dd = Math.hypot(c.x - state.pos.x, c.z - state.pos.z);
                  return dd >= 18 && dd <= 27 && !hasLineOfSight(c.x, c.z, state.pos.x, state.pos.z);
                });
                if (cands.length) {
                  const pick = cands[Math.floor(Math.random() * cands.length)];
                  state.monsterPos.set(pick.x, 0, pick.z);
                  pickMonsterPatrolTarget();
                  if (Sound && Sound.playSfx3D) Sound.playSfx3D('monster_growl', state.monsterPos.x, 1.5, state.monsterPos.z, 0.68);
                }
              }
            } else {
              state._monFarT = 0;
            }
          }

          if (!state.monsterTarget) pickMonsterPatrolTarget();
          const mDx = state.monsterTarget.x - state.monsterPos.x;
          const mDz = state.monsterTarget.z - state.monsterPos.z;
          const mDistT = Math.hypot(mDx, mDz);
          if (mDistT < 1.1) {
            pickMonsterPatrolTarget();
          } else {
            const lvlMult = (LEVEL_THEMES[state.currentLevel] ? LEVEL_THEMES[state.currentLevel].speedMult : 1.0);
            const mSpd = (state.monsterChasing ? cfg.chaseSpeed : cfg.mSpeed) * lvlMult;
            const prevMX = state.monsterPos.x, prevMZ = state.monsterPos.z;
            steerMonsterStep(state.monsterPos, state.monsterTarget.x, state.monsterTarget.z, mSpd, dt);
            // If stuck on corner while patrolling, pick a new corridor waypoint
            if (!state.monsterChasing && Math.hypot(state.monsterPos.x - prevMX, state.monsterPos.z - prevMZ) < mSpd * dt * 0.25) {
              pickMonsterPatrolTarget();
            }
            state.monsterYaw = smoothYaw(state.monsterYaw || 0, Math.atan2(mDx, mDz), dt * 7.5);
          }

          monsterGroup.position.set(state.monsterPos.x, 0, state.monsterPos.z);
          monsterGroup.rotation.y = state.monsterYaw;
          if (monsterMixer) monsterMixer.update(dt * (state.monsterChasing ? 1.45 : 0.95)); updateActiveMonsterMixers(dt, state.monsterChasing);

          // Predatory lurching gait, raised slashing arms & snapping jaw
          obsWalkPhase += dt * (state.monsterChasing ? 8.2 : 4.5);
          obsLegs[0].rotation.x = Math.sin(obsWalkPhase) * 0.48; if (typeof mainWolf !== 'undefined') { const g = Math.sin(obsWalkPhase * 1.45); mainWolf.legs[0].rotation.x = g * 0.72; mainWolf.legs[1].rotation.x = -g * 0.72; mainWolf.legs[2].rotation.x = -g * 0.72; mainWolf.legs[3].rotation.x = g * 0.72; mainWolf.jawG.rotation.x = 0.22 + Math.abs(Math.sin(obsWalkPhase * 2.0)) * 0.42; mainWolf.tail.rotation.z = Math.sin(obsWalkPhase * 1.6) * 0.35; }
          obsLegs[1].rotation.x = -Math.sin(obsWalkPhase) * 0.48;
          obsArms[0].rotation.x = -Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.88 : 0.18);
          obsArms[1].rotation.x = Math.sin(obsWalkPhase) * 0.32 - (state.monsterChasing ? 0.88 : 0.18);
          obsArms[0].rotation.z = 0;
          obsArms[1].rotation.z = 0;
          obsHeadGroup.rotation.z = Math.sin(obsWalkPhase * 0.5) * 0.11;
          obsHeadGroup.rotation.x = state.monsterChasing ? -0.10 : 0.14;
          jawPivot.rotation.x = state.monsterChasing
            ? (0.42 + Math.abs(Math.sin(animT * 11)) * 0.28)
            : (0.08 + Math.max(0, Math.sin(animT * 3.5)) * 0.14);
          // Animate real 3D GLB monster skeleton bones if it doesn't have built-in animation clips
          if (loadedMonsterModel && !monsterMixer) {
            monsterGroup.position.y = Math.abs(Math.sin(obsWalkPhase)) * (state.monsterChasing ? 0.11 : 0.05);
            if (monBones.spine) {
              monBones.spine.rotation.x = state.monsterChasing ? 0.26 : 0.12;
              monBones.spine.rotation.z = Math.sin(obsWalkPhase) * 0.08;
            }
            if (monBones.head) {
              monBones.head.rotation.z = Math.sin(obsWalkPhase * 0.5) * 0.14;
              monBones.head.rotation.x = state.monsterChasing ? -0.14 : 0.08;
            }
            if (monBones.armL) monBones.armL.rotation.x = -0.65 - (state.monsterChasing ? 0.55 : 0) + Math.sin(obsWalkPhase) * 0.35;
            if (monBones.armR) monBones.armR.rotation.x = -0.65 - (state.monsterChasing ? 0.55 : 0) - Math.sin(obsWalkPhase) * 0.35;
            if (monBones.legL) monBones.legL.rotation.x = Math.sin(obsWalkPhase) * 0.45;
            if (monBones.legR) monBones.legR.rotation.x = -Math.sin(obsWalkPhase) * 0.45;
          }

          // Heavy spatial monster footsteps & guttural snarls when nearby/chasing
          state.mStepTimer -= dt;
          if (state.mStepTimer <= 0) {
            state.mStepTimer = state.monsterChasing ? 0.34 : 0.62;
            Sound.monsterStep(dMon);
          }
          state.growlTimer -= dt;
          if (state.growlTimer <= 0 && dMon < 18) {
            state.growlTimer = state.monsterChasing ? (2.2 + Math.random() * 1.6) : (5.0 + Math.random() * 3.5);
            Sound.monsterGrowl(Math.max(0.25, 1 - dMon / 18));
          }

          // Heartbeat & Danger Vignette by Stalker proximity
          const dangerFactor = Math.max(0, Math.min(1, 1 - (dMon - 2.0) / 14.0));
          elDangerVig.style.opacity = String(dangerFactor * 0.88);
          if (dangerFactor > 0.15) {
            state.heartTimer -= dt;
            if (state.heartTimer <= 0) {
              state.heartTimer = Math.max(0.36, 1.15 - dangerFactor * 0.78);
              Sound.heartbeat(dangerFactor);
            }
          }

          // Caught check -> Launch terrifying 3D First-Person Kill Animation!
          if (!state.hiding && dMon < 1.38) {
            startKillAnimation();
          }

          // Level 0 Pitch-Black Pit Balance & Abyss Fall Check
          if (state.zone === 'level0' && window.l0PitTraps && !state._fallingPit && state.pos.y < 2.8) {
            let onEdge = false;
            for (let pi = 0; pi < window.l0PitTraps.length; pi++) {
              const pt = window.l0PitTraps[pi];
              const adx = Math.abs(state.pos.x - pt.x), adz = Math.abs(state.pos.z - pt.z);
              if (adx < pt.halfX && adz < pt.halfZ && state.pos.y < 2.15) {
                state._fallingPit = true;
                state._fallPitT = 0;
                if (Sound && Sound.playSfx) Sound.playSfx('fall_abyss', 0.92);
                showToast("CHUQUR BO'SHLIQQA QULADINGIZ!", true);
                if (Sound && Sound.playVoice) Sound.playVoice('vox_caught', 0.9, 6000);
                break;
              } else if (adx < 2.15 && adz < 2.15) {
                onEdge = true;
              }
            }
            if (onEdge && !state._fallingPit) {
              camera.rotation.z = Math.sin(animT * 5.2) * 0.048;
            }
          }
          if (state._fallingPit) {
            state._fallPitT = (state._fallPitT || 0) + dt;
            state.pos.y -= (6.5 + state._fallPitT * 18) * dt;
            elDangerVig.style.opacity = '1';
            camera.position.set(state.pos.x, state.pos.y, state.pos.z);
            camera.rotation.order = 'YXZ';
            camera.rotation.y = state.yaw + state._fallPitT * 0.8;
            camera.rotation.x = Math.min(1.2, state.pitch + state._fallPitT * 1.4);
            camera.rotation.z = Math.sin(state._fallPitT * 14) * 0.22;
            if (state._fallPitT >= 0.85) {
              state._fallingPit = false;
              finishGame(false);
            }
            renderer.render(scene, camera);
            return;
          }

          // Update First-Person Camera with subtle head-bob
          const bobY = state.hiding ? 0 : Math.sin(state.bobPhase) * (len > 0.05 ? (wantsSprint ? 0.075 : 0.042) : 0.012);
          camera.position.set(state.pos.x, state.pos.y + bobY, state.pos.z);
          camera.rotation.order = 'YXZ';
          camera.rotation.y = state.yaw;
          camera.rotation.x = state.pitch;

          const radDist = (state.pos.y >= 3.6 && window.l0UpperStalker) ? Math.hypot(state.pos.x - window.l0UpperStalker.pos.x, state.pos.z - window.l0UpperStalker.pos.z) : dMon;
          drawRadar(radDist);
          updateVhsGrain(dangerFactor);
        }

        renderer.render(scene, camera);
        } catch (animErr) { console.error(animErr); }
      }

      animate();
