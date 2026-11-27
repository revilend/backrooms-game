      if (!window.__zulmatNormalizeRigged) {
        window.__zulmatNormalizeRigged = function(m, targetH) {
          m.traverse((o) => {
            if (o.isMesh || o.isSkinnedMesh) {
              o.frustumCulled = false;
              if (o.geometry && !o.geometry.boundingBox) o.geometry.computeBoundingBox();
            }
          });
          m.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(m);
          const sz = box.getSize(new THREE.Vector3());
          let armScale = 1;
          m.traverse((o) => {
            if (o !== m && o.scale && o.scale.y > 50) armScale = Math.max(armScale, o.scale.y);
          });
          let effH = (isFinite(sz.y) && sz.y > 0.001) ? sz.y : 1.8;
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
      const monsterGroup = new THREE.Group();
      if (typeof makeContactShadow === 'function') { const mcs = makeContactShadow(0.78, 0.78); mcs.position.y = 0.02; monsterGroup.add(mcs); monsterGroup._hasCS = true; }
      monsterGroup.position.copy(monsterSpawn);
      monsterGroup.add(makeContactShadow(0.95, 0.95));
      level0Group.add(monsterGroup);

      function makeWolfFurTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#141519'; g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 3200; i++) {
          const x = Math.random() * 256, y = Math.random() * 256;
          const r = Math.random();
          g.fillStyle = r < 0.12 ? 'rgba(120,16,20,0.45)' : (r < 0.55 ? 'rgba(42,45,52,0.55)' : 'rgba(8,9,12,0.7)');
          g.fillRect(x, y, 2, 7 + Math.random() * 10);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      const wolfFurMat = new THREE.MeshLambertMaterial({ map: makeWolfFurTex(), color: 0x262830 });
      const wolfManeMat = new THREE.MeshLambertMaterial({ color: 0x0d0e12 });
      const wolfFangMat = new THREE.MeshBasicMaterial({ color: 0xf8f5eb });
      const wolfEyeGlow = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
      const wolfMouthMat = new THREE.MeshBasicMaterial({ color: 0x5c080c });

      function buildHorrorWolf3D(scaleMult = 1.28) {
        const root = new THREE.Group();
        const legs = [];

        // Muscular hunched wolf torso & chest mane
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 1.05), wolfManeMat);
        chest.position.set(0, 1.08, 0.34); root.add(chest);
        const belly = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.54, 1.0), wolfFurMat);
        belly.position.set(0, 0.98, -0.42); root.add(belly);

        // Jagged spine ridge spikes along wolf back
        for (let s = 0; s < 6; s++) {
          const sp = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.24, 5), wolfManeMat);
          sp.position.set(0, 1.46 - s * 0.04, 0.65 - s * 0.28);
          sp.rotation.x = -0.35; root.add(sp);
        }

        // Thick neck + predatory wolf head group
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 0.55, 8), wolfManeMat);
        neck.position.set(0, 1.32, 0.88); neck.rotation.x = 0.65; root.add(neck);

        const headG = new THREE.Group();
        headG.position.set(0, 1.46, 1.12);
        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.46, 0.56), wolfFurMat);
        headG.add(skull);

        // Sharp pointed wolf ears
        [-0.2, 0.2].forEach((ex) => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 4), wolfManeMat);
          ear.position.set(ex, 0.36, -0.06);
          ear.rotation.z = ex > 0 ? -0.18 : 0.18;
          headG.add(ear);
        });

        // Piercing glowing blood-red wolf eyes
        [-0.15, 0.15].forEach((ex) => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), wolfEyeGlow);
          eye.position.set(ex, 0.09, 0.27); headG.add(eye);
        });

        // Elongated upper snout + black nose + upper razor fangs
        const upperSnout = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.19, 0.54), wolfFurMat);
        upperSnout.position.set(0, -0.01, 0.46); headG.add(upperSnout);
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.1), wolfManeMat);
        nose.position.set(0, 0.04, 0.74); headG.add(nose);
        for (let f = -2; f <= 2; f++) {
          const fang = new THREE.Mesh(new THREE.ConeGeometry(0.024, Math.abs(f) === 2 ? 0.15 : 0.09, 4), wolfFangMat);
          fang.rotation.x = Math.PI;
          fang.position.set(f * 0.06, -0.13, 0.58 - Math.abs(f) * 0.04);
          headG.add(fang);
        }

        // Articulated snapping lower jaw with fangs + blood-red inner throat
        const jawG = new THREE.Group();
        jawG.position.set(0, -0.13, 0.22);
        const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.11, 0.48), wolfFurMat);
        lowerJaw.position.set(0, -0.04, 0.22); jawG.add(lowerJaw);
        const throat = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.36), wolfMouthMat);
        throat.position.set(0, 0.02, 0.18); jawG.add(throat);
        for (let f = -2; f <= 2; f++) {
          const fang = new THREE.Mesh(new THREE.ConeGeometry(0.022, Math.abs(f) === 2 ? 0.13 : 0.08, 4), wolfFangMat);
          fang.position.set(f * 0.055, 0.05, 0.36 - Math.abs(f) * 0.04);
          jawG.add(fang);
        }
        jawG.rotation.x = 0.32;
        headG.add(jawG);
        root.add(headG);

        // 4 Articulated Clawed Wolf Legs (FL, FR, BL, BR)
        const legCoords = [
          [-0.32, 0.92, 0.62], [0.32, 0.92, 0.62],
          [-0.28, 0.92, -0.68], [0.28, 0.92, -0.68]
        ];
        legCoords.forEach(([lx, ly, lz]) => {
          const lp = new THREE.Group();
          lp.position.set(lx, ly, lz);
          const upper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.22), wolfFurMat);
          upper.position.y = -0.24; lp.add(upper);
          const lower = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.16), wolfManeMat);
          lower.position.set(0, -0.68, 0.04); lp.add(lower);
          const paw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.26), wolfManeMat);
          paw.position.set(0, -0.88, 0.1); lp.add(paw);
          // 3 sharp white/crimson claws on each paw
          [-0.055, 0, 0.055].forEach((cx) => {
            const cl = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.11, 4), wolfFangMat);
            cl.rotation.x = Math.PI / 2; cl.position.set(cx, -0.88, 0.25); lp.add(cl);
          });
          root.add(lp);
          legs.push(lp);
        });

        // Bushy ragged wolf tail
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 6), wolfManeMat);
        tail.position.set(0, 1.05, -1.25); tail.rotation.x = -1.25; root.add(tail);

        // Eerie crimson predator aura light
        const eLight = new THREE.PointLight(0xdc2626, 1.2, 10);
        eLight.position.set(0, 1.5, 1.3); root.add(eLight);

        root.scale.setScalar(scaleMult);
        return { root, legs, headG, jawG, tail };
      }

      // Procedural charred necrotic flesh & dried-blood scar texture
      const obsSkinCanvas = document.createElement('canvas');
      obsSkinCanvas.width = 256;
      obsSkinCanvas.height = 256;
      const octx = obsSkinCanvas.getContext('2d');
      octx.fillStyle = '#332c28';
      octx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2000; i++) {
        const x = (i * 73) % 256;
        const y = (i * 137) % 256;
        octx.fillStyle = i % 5 === 0
          ? 'rgba(115, 16, 18, 0.42)'
          : (i % 2 === 0 ? 'rgba(18, 14, 14, 0.35)' : 'rgba(122, 110, 94, 0.22)');
        octx.fillRect(x, y, 2 + (i % 4), 8 + (i % 16));
      }
      const obsSkinTex = new THREE.CanvasTexture(obsSkinCanvas);
      obsSkinTex.wrapS = obsSkinTex.wrapT = THREE.RepeatWrapping;

      const obsSkinMat = new THREE.MeshStandardMaterial({
        map: obsSkinTex,
        color: 0x4d433c,
        roughness: 0.52,
        metalness: 0.08
      });
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0xa69c84,
        roughness: 0.65,
        metalness: 0.05
      });
      const fangMat = new THREE.MeshStandardMaterial({
        color: 0xede6d2,
        emissive: 0x261a14,
        emissiveIntensity: 0.35,
        roughness: 0.25
      });
      const clawMat = new THREE.MeshStandardMaterial({
        color: 0x240708,
        emissive: 0x4a080a,
        emissiveIntensity: 0.45,
        roughness: 0.35,
        metalness: 0.2
      });
      const obsVoidMat = new THREE.MeshBasicMaterial({ color: 0x050102 });
      const eyeRedMat = new THREE.MeshBasicMaterial({ color: 0xff2424 });
      const eyeCoreMat = new THREE.MeshBasicMaterial({ color: 0xfff0f0 });

      const observerBody = new THREE.Group();

      // Hunched muscular-skeletal torso + narrow waist
      const obsChest = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.16, 0.80, 12), obsSkinMat);
      obsChest.scale.set(1.28, 1, 0.78);
      obsChest.position.set(0, 1.92, 0.04);
      obsChest.rotation.x = 0.2;
      observerBody.add(obsChest);

      // Exposed pale curved ribcage wrapping around chest
      for (let r = 0; r < 5; r++) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.24 - r * 0.015, 0.022, 6, 16, Math.PI * 1.25), boneMat);
        rib.position.set(0, 2.12 - r * 0.105, 0.10 - r * 0.01);
        rib.rotation.x = Math.PI * 0.52;
        rib.rotation.z = -Math.PI * 0.125;
        observerBody.add(rib);
      }

      // Jagged dorsal spine spikes along hunched back
      for (let s = 0; s < 6; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.18, 5), boneMat);
        spike.position.set(0, 2.26 - s * 0.14, -0.18 - s * 0.01);
        spike.rotation.x = -1.1;
        observerBody.add(spike);
      }

      const obsAbdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.46, 10), obsSkinMat);
      obsAbdomen.scale.set(1.06, 1, 0.78);
      obsAbdomen.position.set(0, 1.38, 0);
      observerBody.add(obsAbdomen);

      const obsNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.12, 0.28, 8), obsSkinMat);
      obsNeck.position.set(0, 2.30, 0.14);
      obsNeck.rotation.x = 0.35;
      observerBody.add(obsNeck);

      // Predatory stalking legs
      const obsLegs = [];
      [-1, 1].forEach((side) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(side * 0.17, 1.26, 0);
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.062, 0.70, 8), obsSkinMat);
        thigh.position.set(0, -0.34, 0.06);
        thigh.rotation.x = -0.22;
        legPivot.add(thigh);
        const knee = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), boneMat);
        knee.position.set(0, -0.66, 0.13);
        legPivot.add(knee);
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.042, 0.64, 8), obsSkinMat);
        shin.position.set(0, -0.96, 0.03);
        shin.rotation.x = 0.18;
        legPivot.add(shin);
        observerBody.add(legPivot);
        obsLegs.push(legPivot);
      });
      const mainWolf = buildHorrorWolf3D(1.32);
      monsterGroup.add(mainWolf.root);
      if (typeof gltfLoader !== 'undefined') {
        gltfLoader.load(REPO_GLB_BASE + 'wolf.glb', (gltf) => {
          const wm = gltf.scene;
          stripGltfLights(wm);
          wm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
          window.__zulmatNormalizeRigged(wm, 2.05);
          while (mainWolf.root.children.length > 0) mainWolf.root.remove(mainWolf.root.children[0]);
          mainWolf.root.add(wm);
          if (gltf.animations && gltf.animations.length > 0) {
            const mx = new THREE.AnimationMixer(wm);
            const walkClip = gltf.animations.find((a) => /02_walk|walk/i.test(a.name)) || gltf.animations[0];
            const runClip = gltf.animations.find((a) => /01_run|run/i.test(a.name)) || walkClip;
            const walkAct = mx.clipAction(walkClip);
            const runAct = mx.clipAction(runClip);
            walkAct.play();
            activeMonsterMixers.push({ mixer: mx, walkAct, runAct, current: 'walk', walkRate: 1.0, chaseRate: 1.25 });
          }
        }, undefined, () => {});
      }

      // --- DISTINCT PER-LEVEL 3D HORROR ENTITIES ---
      const monsterVariants = { wolf: mainWolf.root };

      // 1) Level 0: BACTERIA (Kane Pixels Wire-Limb Tall Shadow Stalker)
      (function buildBacteria() {
        const g = new THREE.Group();
        const wireM = new THREE.MeshBasicMaterial({ color: 0x050507 });
        const eyeW = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.55, 6), wireM);
        spine.position.y = 1.85; g.add(spine);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.24), wireM);
        head.position.set(0, 2.75, 0.06); head.rotation.z = 0.14; g.add(head);
        [-0.06, 0.06].forEach((ex) => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), eyeW);
          e.position.set(ex, 2.78, 0.19); g.add(e);
        });
        [-1, 1].forEach((s) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 1.25, 6), wireM);
          leg.position.set(s * 0.22, 0.62, 0); g.add(leg);
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.025, 1.55, 6), wireM);
          arm.position.set(s * 0.44, 1.65, 0.24); arm.rotation.x = -0.6; arm.rotation.z = s * 0.22; g.add(arm);
        });
        g.visible = false; monsterGroup.add(g); monsterVariants.bacteria = g;
        // Load REAL Animated Bacteria 3D GLB from GitHub CDN (mixamo.com run loop)
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'bacteria.glb', (gltf) => {
            const bm = gltf.scene;
            stripGltfLights(bm);
            bm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(bm, 2.05);
            while (g.children.length > 0) g.remove(g.children[0]);
            g.add(bm);
            if (gltf.animations && gltf.animations.length > 0) {
              const mx = new THREE.AnimationMixer(bm);
              const act = mx.clipAction(gltf.animations[0]);
              act.play();
              activeMonsterMixers.push({ mixer: mx, walkAct: act, runAct: act, current: 'walk', walkRate: 0.95, chaseRate: 1.45 });
            }
          }, undefined, () => {});
        }
      })();

      // 2) Level 1: SMILER (Pitch-Black Void Entity with Glowing White Crescent Grin & Eyes!)
      (function buildSmiler() {
        const g = new THREE.Group();
        const voidM = new THREE.MeshBasicMaterial({ color: 0x020204 });
        const glowW = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const aura = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 12), voidM);
        aura.scale.set(0.95, 1.45, 0.75); aura.position.y = 1.75; g.add(aura);
        [-0.24, 0.24].forEach((ex) => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), glowW);
          eye.position.set(ex, 2.05, 0.56); g.add(eye);
        });
        for (let t = -4; t <= 4; t++) {
          const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.17, 4), glowW);
          tooth.rotation.x = Math.PI;
          tooth.position.set(t * 0.1, 1.66 + (t * t) * 0.014, 0.6);
          g.add(tooth);
        }
        const sLight = new THREE.PointLight(0xffffff, 0.9, 8); sLight.position.set(0, 1.9, 0.9); g.add(sLight);
        g.visible = false; monsterGroup.add(g); monsterVariants.smiler = g;
      })();

      // 3) Level 2: SKIN-STEALER (Pale Ashen Elongated Humanoid with Glowing Amber Eyes)
      (function buildSkinStealer() {
        const g = new THREE.Group();
        const paleM = new THREE.MeshLambertMaterial({ color: 0xcbd5c0 });
        const ambE = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 1.25, 8), paleM);
        torso.position.y = 1.55; g.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 10), paleM);
        head.scale.set(0.85, 1.25, 0.9); head.position.set(0, 2.42, 0.1); g.add(head);
        [-0.09, 0.09].forEach((ex) => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ambE);
          e.position.set(ex, 2.45, 0.32); g.add(e);
        });
        [-1, 1].forEach((s) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 1.05, 8), paleM);
          leg.position.set(s * 0.18, 0.52, 0); g.add(leg);
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.35, 8), paleM);
          arm.position.set(s * 0.42, 1.45, 0.28); arm.rotation.x = -0.8; g.add(arm);
        });
        g.visible = false; monsterGroup.add(g); monsterVariants.skinstealer = g;
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'skinstealer.glb', (gltf) => {
            const sm = gltf.scene;
            stripGltfLights(sm);
            sm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(sm, 2.28);
            const rig = {};
            sm.traverse((o) => {
              if (!o.isBone) return;
              const n = o.name.toLowerCase();
              if (!rig.thighL && /thigh_l/.test(n)) rig.thighL = o;
              else if (!rig.thighR && /thigh_r/.test(n)) rig.thighR = o;
              else if (!rig.shinL && /shin_l/.test(n)) rig.shinL = o;
              else if (!rig.shinR && /shin_r/.test(n)) rig.shinR = o;
              else if (!rig.upperArmL && /upper_arm_l/.test(n)) rig.upperArmL = o;
              else if (!rig.upperArmR && /upper_arm_r/.test(n)) rig.upperArmR = o;
              else if (!rig.forearmL && /forearm_l/.test(n)) rig.forearmL = o;
              else if (!rig.forearmR && /forearm_r/.test(n)) rig.forearmR = o;
              else if (!rig.spine && /spine_002/.test(n)) rig.spine = o;
              else if (!rig.head && /spine_006|spine_005/.test(n)) rig.head = o;
            });
            activeRiggedMonsters.push(rig);
            while (g.children.length > 0) g.remove(g.children[0]);
            g.add(sm);
          }, undefined, () => {});
        }
      })();

      // 4) Level 3: VOLT HOUND (Electric Blue-Arcing Mutated Quadruped Beast!)
      (function buildVoltHound() {
        const w = buildHorrorWolf3D(1.18);
        const blueMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        for (let i = 0; i < 4; i++) {
          const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), blueMat);
          sp.position.set(0, 1.48, 0.5 - i * 0.45); w.root.add(sp);
        }
        const vl = new THREE.PointLight(0x38bdf8, 1.4, 12); vl.position.set(0, 1.6, 0.8); w.root.add(vl);
        w.root.visible = false; monsterGroup.add(w.root); monsterVariants.volthound = w.root;
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'hound.glb', (gltf) => {
            const hm = gltf.scene;
            stripGltfLights(hm);
            hm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(hm, 2.15);
            while (w.root.children.length > 0) w.root.remove(w.root.children[0]);
            w.root.add(hm);
            if (gltf.animations && gltf.animations.length > 0) {
              const mx = new THREE.AnimationMixer(hm);
              const bodyClip = gltf.animations.find((a) => !/camera/i.test(a.name)) || gltf.animations[0];
              const act = mx.clipAction(bodyClip);
              act.play();
              activeMonsterMixers.push({ mixer: mx, walkAct: act, runAct: act, current: 'walk', walkRate: 0.95, chaseRate: 1.45 });
            }
          }, undefined, () => {});
        }
      })();

      // 5) Level 5: HOTEL SHADOW BUTLER (Tall 1930s Tuxedo Phantom with Top Hat & Red Eyes!)
      (function buildHotelButler() {
        const g = new THREE.Group();
        const suitM = new THREE.MeshLambertMaterial({ color: 0x111318 });
        const faceM = new THREE.MeshBasicMaterial({ color: 0x050507 });
        const redE = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 1.75, 10), suitM);
        body.position.y = 1.25; g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 10), faceM);
        head.position.y = 2.38; g.add(head);
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 12), suitM);
        brim.position.y = 2.62; g.add(brim);
        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.48, 12), suitM);
        hat.position.y = 2.88; g.add(hat);
        [-0.09, 0.09].forEach((ex) => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), redE);
          e.position.set(ex, 2.4, 0.24); g.add(e);
        });
        g.visible = false; monsterGroup.add(g); monsterVariants.butler = g;
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'butler.glb', (gltf) => {
            const bm = gltf.scene;
            stripGltfLights(bm);
            bm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(bm, 2.38);
            while (g.children.length > 0) g.remove(g.children[0]);
            g.add(bm);
            if (gltf.animations && gltf.animations.length > 0) {
              const mx = new THREE.AnimationMixer(bm);
              const act = mx.clipAction(gltf.animations[0]);
              act.play();
              activeMonsterMixers.push({ mixer: mx, walkAct: act, runAct: act, current: 'walk', walkRate: 1.0, chaseRate: 1.6 });
            }
          }, undefined, () => {});
        }
      })();

      // 6) Level 37 & Level 7: UPGRADED BLIND AQUATIC STALKER (Ribbed Wet Stalker + Sonar Fins + Claws + Fangs)
      (function buildPoolStalker() {
        const g = new THREE.Group();
        const wetM = new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.18, metalness: 0.12 });
        const deepM = new THREE.MeshLambertMaterial({ color: 0x0f766e });
        const jawM = new THREE.MeshBasicMaterial({ color: 0x020617 });
        const toothM = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 1.48, 10), wetM);
        torso.position.y = 1.55; torso.rotation.x = 0.16; g.add(torso);
        for (let r = 0; r < 4; r++) {
          const rib = new THREE.Mesh(new THREE.TorusGeometry(0.24 - r * 0.02, 0.032, 6, 12, Math.PI * 1.4), deepM);
          rib.position.set(0, 1.95 - r * 0.22, 0.05); rib.rotation.x = Math.PI / 2; rib.rotation.z = -0.5; g.add(rib);
        }
        const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.72, 4), deepM);
        dorsal.position.set(0, 1.95, -0.26); dorsal.rotation.x = -0.65; g.add(dorsal);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), wetM);
        head.scale.set(0.9, 1.05, 1.18); head.position.set(0, 2.46, 0.16); g.add(head);
        [-0.36, 0.36].forEach((ex) => {
          const fin = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.62, 5), deepM);
          fin.position.set(ex, 2.52, 0.08); fin.rotation.z = ex > 0 ? -1.15 : 1.15; fin.rotation.x = -0.2; g.add(fin);
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.045, 1.32, 8), wetM);
          arm.position.set(ex * 1.08, 1.48, 0.22); arm.rotation.x = -0.55; arm.rotation.z = ex > 0 ? -0.15 : 0.15; g.add(arm);
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), toothM);
          claw.position.set(ex * 1.18, 0.92, 0.62); claw.rotation.x = 2.1; g.add(claw);
        });
        const maw = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), jawM);
        maw.scale.set(0.95, 1.25, 0.7); maw.position.set(0, 2.34, 0.42); g.add(maw);
        for (let t = -2; t <= 2; t++) {
          const fang = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 4), toothM);
          fang.position.set(t * 0.045, 2.44, 0.48); fang.rotation.x = Math.PI; g.add(fang);
        }
        g.visible = false; monsterGroup.add(g); monsterVariants.poolstalker = g;
      })();

      // 7) The End: UPGRADED HOODED LIBRARY WRAITH (Tattered Cloak + Skeletal Claws + Void Hood + Emerald Glow)
      (function buildWraith() {
        const g = new THREE.Group();
        const robeM = new THREE.MeshLambertMaterial({ color: 0x18181b });
        const trimM = new THREE.MeshLambertMaterial({ color: 0x09090b });
        const boneM = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 });
        const eyeG = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
        const robe = new THREE.Mesh(new THREE.ConeGeometry(0.56, 2.45, 12), robeM);
        robe.position.y = 1.28; g.add(robe);
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const tat = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 4), trimM);
          tat.position.set(Math.cos(ang) * 0.42, 0.42, Math.sin(ang) * 0.42); tat.rotation.x = Math.PI; g.add(tat);
        }
        const hood = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.76, 10), robeM);
        hood.position.set(0, 2.62, 0.04); hood.rotation.x = 0.14; g.add(hood);
        const voidFace = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), trimM);
        voidFace.position.set(0, 2.42, 0.16); g.add(voidFace);
        [-0.085, 0.085].forEach((ex) => {
          const e = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), eyeG);
          e.position.set(ex, 2.44, 0.34); g.add(e);
        });
        [-0.42, 0.42].forEach((sx) => {
          const sleeve = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.92, 6), robeM);
          sleeve.position.set(sx, 1.85, 0.25); sleeve.rotation.x = -1.1; g.add(sleeve);
          const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.24), boneM);
          hand.position.set(sx * 1.05, 1.56, 0.66); g.add(hand);
        });
        const wLight = new THREE.PointLight(0x22c55e, 1.1, 7.5);
        wLight.position.set(0, 2.2, 0.45); g.add(wLight);
        g.visible = false; monsterGroup.add(g); monsterVariants.wraith = g;
      })();

      // 8) Level 974: KITTY (3.1m Pitch-Black Faceless Entity)
      (function buildKitty() {
        const g = new THREE.Group();
        const blk = new THREE.MeshLambertMaterial({ color: 0x050507 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 1.5, 8), blk);
        body.position.y = 1.65; g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), blk);
        head.scale.set(0.9, 1.15, 0.95); head.position.y = 2.65; g.add(head);
        g.visible = false; monsterGroup.add(g); monsterVariants.kitty = g;
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'kitty.glb', (gltf) => {
            const km = gltf.scene;
            stripGltfLights(km);
            km.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(km, 3.1);
            while (g.children.length > 0) g.remove(g.children[0]);
            g.add(km);
          }, undefined, () => {});
        }
      })();

      function setMonsterVariant(cur) {
        const pick = cur === 0 ? 'bacteria'
          : ((cur === 1 || cur === 6 || cur === 'mirror') ? 'smiler'
          : ((cur === 2 || cur === 33 || cur === 15) ? 'skinstealer'
          : ((cur === 3 || cur === 36 || cur === 22) ? 'volthound'
          : (cur === 5 ? 'butler'
          : (cur === 974 ? 'kitty'
          : ((cur === 37 || cur === 7) ? 'poolstalker'
          : ((cur === 'end' || cur === 'shady' || cur === 14) ? 'wraith' : 'wolf')))))));
        Object.keys(monsterVariants).forEach((k) => {
          monsterVariants[k].visible = (k === pick);
        });
      }
      observerBody.visible = false;
      monsterGroup.add(observerBody);

      // Terrifying Cracked Skull + Piercing Pinpoint Eyes + Articulated Snapping Jaw with 14 Razor Fangs!
      const obsHeadGroup = new THREE.Group();
      obsHeadGroup.position.set(0, 2.48, 0.22);

      // Upper cranium
      const obsSkull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), boneMat);
      obsSkull.scale.set(0.92, 1.15, 1.08);
      obsSkull.position.set(0, 0.06, 0);
      obsHeadGroup.add(obsSkull);

      // Dark sinew hood/crest over skull
      const skullCrest = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10), obsSkinMat);
      skullCrest.scale.set(0.98, 1.05, 1.04);
      skullCrest.position.set(0, 0.11, -0.05);
      obsHeadGroup.add(skullCrest);

      // Deep sunken pitch-black eye sockets + piercing glowing pinpoint eyes
      [-1, 1].forEach((side) => {
        const socket = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), obsVoidMat);
        socket.scale.set(1.15, 0.85, 0.55);
        socket.position.set(side * 0.088, 0.09, 0.21);
        obsHeadGroup.add(socket);

        const glowEye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeRedMat);
        glowEye.position.set(side * 0.088, 0.09, 0.235);
        obsHeadGroup.add(glowEye);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), eyeCoreMat);
        pupil.position.set(side * 0.088, 0.09, 0.256);
        obsHeadGroup.add(pupil);
      });

      // Pitch-black screaming throat cavity
      const throatVoid = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), obsVoidMat);
      throatVoid.scale.set(0.92, 1.05, 0.8);
      throatVoid.position.set(0, -0.08, 0.12);
      obsHeadGroup.add(throatVoid);

      // 7 Upper Razor-Sharp Needle Fangs
      for (let f = -3; f <= 3; f++) {
        const ang = f * 0.24;
        const fLen = Math.abs(f) === 2 ? 0.095 : 0.072;
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.015, fLen, 5), fangMat);
        fang.position.set(Math.sin(ang) * 0.135, -0.045, 0.12 + Math.cos(ang) * 0.115);
        fang.rotation.x = Math.PI;
        obsHeadGroup.add(fang);
      }

      // Articulated Hinged Lower Jaw (snaps wide open during chase & Kill Animation!)
      const jawPivot = new THREE.Group();
      jawPivot.position.set(0, -0.07, 0.06);
      const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.24), boneMat);
      lowerJaw.position.set(0, -0.08, 0.09);
      jawPivot.add(lowerJaw);
      // 7 Lower Razor-Sharp Needle Fangs
      for (let f = -3; f <= 3; f++) {
        const ang = f * 0.24;
        const fLen = Math.abs(f) === 2 ? 0.088 : 0.065;
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.014, fLen, 5), fangMat);
        fang.position.set(Math.sin(ang) * 0.12, -0.015, 0.07 + Math.cos(ang) * 0.11);
        jawPivot.add(fang);
      }
      obsHeadGroup.add(jawPivot);
      obsHeadGroup.visible = false;
      monsterGroup.add(obsHeadGroup);

      // Long Predatory Slashing Arms with Curved Blood-Tipped Razor Claws
      const obsArms = [];
      [-1, 1].forEach((side) => {
        const armPivot = new THREE.Group();
        armPivot.position.set(side * 0.40, 2.20, 0.06);
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.105, 8, 8), obsSkinMat);
        armPivot.add(shoulder);

        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.92, 8), obsSkinMat);
        upperArm.position.set(side * 0.06, -0.46, 0.08);
        upperArm.rotation.z = side * 0.12;
        upperArm.rotation.x = -0.18;
        armPivot.add(upperArm);

        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), boneMat);
        elbow.position.set(side * 0.12, -0.90, 0.16);
        armPivot.add(elbow);

        const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.94, 8), obsSkinMat);
        foreArm.position.set(side * 0.14, -1.32, 0.34);
        foreArm.rotation.x = -0.36;
        armPivot.add(foreArm);

        // Gaunt Clawed Hand with 5 curved bloody razor claws
        const handGroup = new THREE.Group();
        handGroup.position.set(side * 0.15, -1.76, 0.50);
        const palm = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), obsSkinMat);
        palm.scale.set(1.1, 1.25, 0.6);
        handGroup.add(palm);

        const fingerAngles = [-0.55, -0.26, 0.02, 0.28, 0.56];
        fingerAngles.forEach((fAng, fi) => {
          const fLen = fi === 2 ? 0.38 : 0.32;
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.017, fLen, 5), clawMat);
          claw.position.set(Math.sin(fAng) * 0.11, -fLen * 0.32, Math.cos(fAng) * 0.12 + 0.06);
          claw.rotation.z = -fAng * 0.85;
          claw.rotation.x = 1.05;
          handGroup.add(claw);
        });
        armPivot.add(handGroup);
        monsterGroup.add(armPivot);
        obsArms.push(armPivot);
      });

      // Subtle eerie blood-crimson aura illuminating fangs & claws (kept low so walls never blow out)
      const mAura = new THREE.PointLight(0x991111, 0.72, 5.8);
      mAura.position.set(0, 2.2, 0.55);
      monsterGroup.add(mAura);

      let monsterMixer = null;
      let monsterWalkAct = null;
      let monsterRunAct = null;
      let obsWalkPhase = 0;
      // gltfLoader initialized before Level 0 grid loop
      // Strip any embedded Blender/KHR_lights_punctual lights or cameras from downloaded GLB files
      function stripGltfLights(root) {
        const drop = [];
        root.traverse((o) => {
          if (o.isLight || o.isCamera) drop.push(o);
        });
        drop.forEach((o) => { if (o.parent) o.parent.remove(o); });
      }


      function updateActiveMonsterMixers(dt, isChasing) {
        riggedWalkPhase += dt * (isChasing ? 9.5 : 5.2);
        for (let j = 0; j < activeRiggedMonsters.length; j++) {
          const b = activeRiggedMonsters[j];
          const sw = Math.sin(riggedWalkPhase);
          const cw = Math.cos(riggedWalkPhase);
          if (b.thighL) b.thighL.rotation.x = sw * (isChasing ? 0.72 : 0.45);
          if (b.thighR) b.thighR.rotation.x = -sw * (isChasing ? 0.72 : 0.45);
          if (b.shinL) b.shinL.rotation.x = Math.max(0, -cw) * (isChasing ? 0.75 : 0.45);
          if (b.shinR) b.shinR.rotation.x = Math.max(0, cw) * (isChasing ? 0.75 : 0.45);
          if (b.upperArmL) { b.upperArmL.rotation.z = 0.85; b.upperArmL.rotation.x = -0.35 - sw * (isChasing ? 0.65 : 0.35); }
          if (b.upperArmR) { b.upperArmR.rotation.z = -0.85; b.upperArmR.rotation.x = -0.35 + sw * (isChasing ? 0.65 : 0.35); }
          if (b.forearmL) b.forearmL.rotation.x = -0.55;
          if (b.forearmR) b.forearmR.rotation.x = -0.55;
          if (b.spine) { b.spine.rotation.x = isChasing ? 0.22 : 0.10; b.spine.rotation.z = sw * 0.06; }
          if (b.head) b.head.rotation.z = Math.sin(riggedWalkPhase * 0.5) * 0.14;
        }
        for (let i = 0; i < activeMonsterMixers.length; i++) {
          const item = activeMonsterMixers[i];
          if (!item || !item.mixer) continue;
          if (item.walkAct && item.runAct && item.walkAct !== item.runAct) {
            const wantRun = Boolean(isChasing);
            if (wantRun && item.current !== 'run') {
              item.walkAct.fadeOut(0.18);
              item.runAct.reset().fadeIn(0.18).play();
              item.current = 'run';
            } else if (!wantRun && item.current !== 'walk') {
              item.runAct.fadeOut(0.18);
              item.walkAct.reset().fadeIn(0.18).play();
              item.current = 'walk';
            }
          }
          item.mixer.update(dt * (isChasing ? (item.chaseRate || 1.35) : (item.walkRate || 1.0)));
        }
      }

      function spawnRepoProp(parentGroup, fileName, x, y, z, targetH, rotY = 0, opts = {}) {
        if (!parentGroup || typeof THREE === 'undefined') return;
        const _base = 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/models/';
        if (!repoGlbCache) repoGlbCache = {};
        if (!repoGlbCallbacks) repoGlbCallbacks = {};
        const applyInstance = (srcObj) => {
          const obj = srcObj.clone();
          if (opts.tintHex !== undefined) {
            obj.traverse((o) => {
              if (o.isMesh && o.material) {
                o.material = o.material.clone();
                if (o.material.color) o.material.color.setHex(opts.tintHex);
                if (opts.emissiveHex !== undefined && o.material.emissive) {
                  o.material.emissive.setHex(opts.emissiveHex);
                  o.material.emissiveIntensity = opts.emissiveIntensity || 0.7;
                }
              }
            });
          }
          obj.updateMatrixWorld(true);
          let box = new THREE.Box3().setFromObject(obj);
          let sz = new THREE.Vector3(); box.getSize(sz);
          if (opts.flatZ && sz.z > sz.x) {
            obj.rotation.y += Math.PI / 2;
            obj.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(obj);
            box.getSize(sz);
          }
          const ref = opts.useMaxDim ? Math.max(sz.x, sz.y, sz.z) : sz.y;
          const sc = targetH / Math.max(0.05, ref);
          obj.scale.setScalar(sc);
          obj.updateMatrixWorld(true);
          const box2 = new THREE.Box3().setFromObject(obj);
          const ctr2 = new THREE.Vector3(); box2.getCenter(ctr2);
          obj.position.set(
            x - (opts.centerXZ ? ctr2.x : 0),
            opts.centerY ? (y - ctr2.y) : (y - box2.min.y),
            z - (opts.centerXZ ? ctr2.z : 0)
          );
          obj.rotation.y += rotY;
          if (opts.hideOldChildren) {
            parentGroup.children.forEach((c) => {
              if (!c.isLight && !c.userData.keepOverlay) c.visible = false;
            });
          }
          parentGroup.add(obj);
        };
        if (repoGlbCache[fileName]) {
          applyInstance(repoGlbCache[fileName]);
          return;
        }
        if (repoGlbCallbacks[fileName]) {
          repoGlbCallbacks[fileName].push(applyInstance);
          return;
        }
        repoGlbCallbacks[fileName] = [applyInstance];
        (typeof gltfLoader !== 'undefined' ? gltfLoader : new THREE.GLTFLoader()).load(_base + fileName, (gltf) => {
          const root = gltf.scene;
          stripGltfLights(root);
          repoGlbCache[fileName] = root;
          const cbs = repoGlbCallbacks[fileName] || [];
          delete repoGlbCallbacks[fileName];
          cbs.forEach((fn) => fn(root));
        }, undefined, () => {
          delete repoGlbCallbacks[fileName];
        });
      }

      // --- Load REAL High-Poly Sculpted 3D Horror Monster GLB from Internet ---
      // Includes DRACO decoding + official CORS-verified BabylonJS animated Alien horror creature fallback!
      let loadedMonsterModel = null;
      const monBones = { spine: null, head: null, armL: null, armR: null, legL: null, legR: null };
      const REAL_MONSTER_URLS = []; const _DISABLED_MONSTER_URLS = [
        REPO_GLB_BASE + 'bacteria.glb',
        REPO_GLB_BASE + 'skinstealer.glb',
        REPO_GLB_BASE + 'butler.glb',
        REPO_GLB_BASE + 'bacteria.glb',
        REPO_GLB_BASE + 'skinstealer.glb',
        REPO_GLB_BASE + 'wolf.glb'
      ];

      function loadRealMonsterGLB(idx) {
        if (idx >= REAL_MONSTER_URLS.length) return;
        gltfLoader.load(
          REAL_MONSTER_URLS[idx],
          (gltf) => {
            const m = gltf.scene;
            stripGltfLights(m);
            // Auto-normalize height to terrifying 2.48m Backrooms stature and ground feet at y = 0
            m.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(m);
            const sz = new THREE.Vector3();
            const ctr = new THREE.Vector3();
            box.getSize(sz);
            box.getCenter(ctr);
            const maxDim = Math.max(sz.y, sz.x, sz.z);
            if (maxDim > 0.001) {
              const refH = sz.y > 0.01 ? sz.y : maxDim;
              const s = Math.max(0.004, Math.min(120, 2.45 / refH));
              m.scale.setScalar(s);
              m.updateMatrixWorld(true);
              const nb = new THREE.Box3().setFromObject(m);
              const nctr = new THREE.Vector3();
              nb.getCenter(nctr);
              m.position.x -= nctr.x;
              m.position.z -= nctr.z;
              m.position.y -= nb.min.y;
            }
            // Capture skeleton bones (Mixamo / standard humanoid names) for live walk, chase & kill animation
            m.traverse((o) => {
              if (o.isMesh) {
                o.frustumCulled = false;
              }
              if (o.isBone) {
                const n = o.name.toLowerCase();
                if (!monBones.head && /head/.test(n) && !/top|end/.test(n)) monBones.head = o;
                else if (!monBones.spine && /spine1|spine2|spine/.test(n)) monBones.spine = o;
                else if (!monBones.armL && /(leftarm|arm_l|upperarm_l|leftshoulder)/.test(n)) monBones.armL = o;
                else if (!monBones.armR && /(rightarm|arm_r|upperarm_r|rightshoulder)/.test(n)) monBones.armR = o;
                else if (!monBones.legL && /(leftupleg|thigh_l|leg_l)/.test(n)) monBones.legL = o;
                else if (!monBones.legR && /(rightupleg|thigh_r|leg_r)/.test(n)) monBones.legR = o;
              }
            });

            // Hide primitive fallback completely — show ONLY the real high-poly 3D horror monster!
            observerBody.visible = false;
            obsHeadGroup.visible = false;
            obsArms.forEach((a) => { a.visible = false; });

            loadedMonsterModel = m;
            monsterGroup.add(m);

            if (gltf.animations && gltf.animations.length > 0) {
              monsterMixer = new THREE.AnimationMixer(m);
              const wClip = gltf.animations.find((a) => /walk|idle|crawl/i.test(a.name)) || gltf.animations[0];
              const rClip = gltf.animations.find((a) => /run|chase|attack/i.test(a.name)) || wClip;
              monsterWalkAct = monsterMixer.clipAction(wClip);
              monsterRunAct = monsterMixer.clipAction(rClip);
              monsterWalkAct.play();
            }
          },
          undefined,
          () => {
            // Try next real 3D horror monster URL automatically
            loadRealMonsterGLB(idx + 1);
          }
        );
      }
      loadRealMonsterGLB(0);

      // --- Load Real Internet 3D Backrooms Furniture & Abandoned Office Props (KhronosGroup + Webaverse via jsDelivr!) ---
      const KHR_BASE = REPO_GLB_BASE;
      const PROP_CATALOG = [
        { url: REPO_GLB_BASE + 'bench.glb', h: 1.05 },
        { url: REPO_GLB_BASE + 'bench.glb', h: 1.0 },
        { url: REPO_GLB_BASE + 'vending_machine.glb', h: 2.05 },
        { url: REPO_GLB_BASE + 'streetlamp.glb', h: 0.75, ceiling: true },
        { url: REPO_GLB_BASE + 'crt_pc.glb', h: 0.45 },
        { url: REPO_GLB_BASE + 'cabinet.glb', h: 0.85 }
      ];

      // Replace ALL Hiding Lockers ("Shkaf") with real internet 3D metal cabinet GLB model (dark-steel industrial finish)!
      try {
        gltfLoader.load(
          REPO_GLB_BASE + 'locker.glb',
          (gltf) => {
            const srcCab = gltf.scene;
            stripGltfLights(srcCab);
            srcCab.traverse((o) => {
              if (o.isMesh && o.material) {
                o.material = o.material.clone();
                if (o.material.color) o.material.color.multiplyScalar(0.42);
              }
            });
            srcCab.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(srcCab);
            const sz = new THREE.Vector3(), ctr = new THREE.Vector3();
            b.getSize(sz); b.getCenter(ctr);
            const sc = 2.35 / (sz.y || 1);
            lockers.forEach((lk) => {
              lk.mesh.children.forEach((c) => { c.visible = false; });
              const cl = srcCab.clone();
              cl.scale.setScalar(sc);
              cl.position.set(-ctr.x * sc, -b.min.y * sc, -ctr.z * sc);
              lk.mesh.add(cl);

            });
          },
          undefined,
          () => {}
        );
      } catch (e) {}

      // Level 0 keys are already grounded on cabinet.glb via spawnKeyAt()

      PROP_CATALOG.forEach((item, pIdx) => {
        try {
          gltfLoader.load(
            item.url,
            (gltf) => {
              const srcObj = gltf.scene;
              stripGltfLights(srcObj);
              srcObj.updateMatrixWorld(true);
              const box = new THREE.Box3().setFromObject(srcObj);
              const sz = new THREE.Vector3();
              const ctr = new THREE.Vector3();
              box.getSize(sz);
              box.getCenter(ctr);
              const sc = item.h / (sz.y || 1);

              // Scatter across dedicated spots in the 164m x 164m Level 0 map (offset slightly toward edges so hallways stay walkable!)
              for (let i = pIdx; i < propSpots.length; i += PROP_CATALOG.length) {
                const sp = propSpots[i];
                const clone = srcObj.clone();
                clone.scale.setScalar(sc);
                const yPos = item.ceiling ? (WALL_H - sz.y * sc - 0.05) : (-box.min.y * sc);
                // Keep spawn & exit clear so props never block start or exit door
                if (Math.hypot(sp.x - spawnPos.x, sp.z - spawnPos.z) < 2.6 || Math.hypot(sp.x - exitInfo.x, sp.z - exitInfo.z) < 2.8) continue;
                clone.position.set(sp.x - ctr.x * sc, yPos, sp.z - ctr.z * sc);
                clone.rotation.y = sp.rot;
                level0Group.add(clone);
                if (!item.ceiling) {
                  clone.updateMatrixWorld(true);
                  const pb = new THREE.Box3().setFromObject(clone);
                  const psz = new THREE.Vector3(), pctr = new THREE.Vector3();
                  pb.getSize(psz); pb.getCenter(pctr);
                  wallBoxes.push({
                    x: pctr.x,
                    z: pctr.z,
                    halfX: Math.min(1.15, Math.max(0.32, psz.x * 0.44)),
                    halfZ: Math.min(1.15, Math.max(0.32, psz.z * 0.44)),
                    isProp: true
                  });
                }
              }
            },
            undefined,
            () => {}
          );
        } catch (e) {}
      });

      // Helper for crisp station sign plaques
