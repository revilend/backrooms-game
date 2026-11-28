      function makeMetroSign(title, sub, bg, fgColor) {
        const sc = document.createElement('canvas');
        sc.width = 512; sc.height = 140;
        const sg = sc.getContext('2d');
        sg.fillStyle = bg;
        sg.fillRect(0, 0, 512, 140);
        sg.strokeStyle = fgColor;
        sg.lineWidth = 6;
        sg.strokeRect(8, 8, 496, 124);
        sg.fillStyle = fgColor;
        sg.font = 'bold 42px sans-serif';
        sg.textAlign = 'center';
        sg.fillText(title, 256, 66);
        sg.font = 'bold 24px sans-serif';
        sg.fillStyle = '#e2e8f0';
        sg.fillText(sub, 256, 110);
        return new THREE.CanvasTexture(sc);
      }

      // --- BUILD 3D ABANDONED METRO STATION LOBBY ("TASHLANDIQ METRO — XAVFSIZ LOBBI") ---
      const metroPortalL0 = { x: 0, z: 5.7 };
      const metroTrainDoor = { x: 0, z: -1.4 };
      const metroFlickLights = [];
      const metroTrain = { group: null, doorL: null, doorR: null, openAmt: 0 };

      (function buildAbandonedMetroLobby() {
        // 1. Grimy subway tile wall texture
        const tc = document.createElement('canvas');
        tc.width = 512; tc.height = 512;
        const tg = tc.getContext('2d');
        tg.fillStyle = '#8b9088';
        tg.fillRect(0, 0, 512, 512);
        // Subway brick tiles
        tg.strokeStyle = '#4e544e';
        tg.lineWidth = 3;
        for (let y = 0; y < 512; y += 32) {
          const off = ((y / 32) % 2) * 32;
          for (let x = -32; x < 544; x += 64) {
            const shade = ((x * 7 + y * 13) % 18) - 9;
            tg.fillStyle = `rgb(${132 + shade}, ${137 + shade}, ${128 + shade})`;
            tg.fillRect(x + off + 2, y + 2, 60, 28);
            tg.strokeRect(x + off, y, 64, 32);
          }
        }
        // Faded dark-teal metro station stripe
        tg.fillStyle = 'rgba(30, 68, 72, 0.72)';
        tg.fillRect(0, 180, 512, 46);
        tg.fillStyle = 'rgba(202, 138, 4, 0.65)';
        tg.fillRect(0, 226, 512, 8);
        // Grime & water stain gradient
        const wg = tg.createLinearGradient(0, 0, 0, 512);
        wg.addColorStop(0, 'rgba(18, 22, 20, 0.55)');
        wg.addColorStop(0.25, 'rgba(0,0,0,0)');
        wg.addColorStop(0.8, 'rgba(0,0,0,0)');
        wg.addColorStop(1, 'rgba(22, 20, 16, 0.62)');
        tg.fillStyle = wg;
        tg.fillRect(0, 0, 512, 512);
        const tileTex = new THREE.CanvasTexture(tc);
        tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
        tileTex.repeat.set(5, 1);

        // 2. Cracked concrete platform floor texture
        const fc = document.createElement('canvas');
        fc.width = 512; fc.height = 512;
        const fg = fc.getContext('2d');
        fg.fillStyle = '#5c6064';
        fg.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4500; i++) {
          fg.fillStyle = i % 2 === 0 ? 'rgba(35,38,42,0.22)' : 'rgba(128,132,136,0.16)';
          fg.fillRect((i * 83) % 512, (i * 151) % 512, 4, 4);
        }
        fg.strokeStyle = 'rgba(32, 35, 38, 0.55)';
        fg.lineWidth = 4;
        for (let i = 0; i <= 512; i += 128) {
          fg.beginPath(); fg.moveTo(i, 0); fg.lineTo(i, 512); fg.stroke();
          fg.beginPath(); fg.moveTo(0, i); fg.lineTo(512, i); fg.stroke();
        }
        const platTex = new THREE.CanvasTexture(fc);
        platTex.wrapS = platTex.wrapT = THREE.RepeatWrapping;
        platTex.repeat.set(7, 3);

        const tileMat = new THREE.MeshLambertMaterial({ map: tileTex });
        const platMat = new THREE.MeshLambertMaterial({ map: platTex });
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0x3b4046 });
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x262b30, roughness: 0.6, metalness: 0.55 });
        const rustMat = new THREE.MeshStandardMaterial({ color: 0x523426, roughness: 0.82, metalness: 0.35 });

        // makeMetroSign hoisted to global window scope

        const procStationGroup = new THREE.Group();
        metroLobbyGroup.add(procStationGroup);

        // Main concrete passenger platform (28m x 8.4m, z: -1.8 to +6.6)
        const platform = new THREE.Mesh(new THREE.BoxGeometry(28, 1.2, 8.4), platMat);
        platform.position.set(0, -0.6, 2.4);
        procStationGroup.add(platform);

        // Iconic Yellow Tactile Safety Strip along platform edge (z = -1.55)
        const safetyStrip = new THREE.Mesh(
          new THREE.BoxGeometry(28, 0.04, 0.42),
          new THREE.MeshLambertMaterial({ color: 0xca8a04 })
        );
        safetyStrip.position.set(0, 0.01, -1.56);
        procStationGroup.add(safetyStrip);

        // Recessed Dark Track Pit (z: -7.2 to -1.8, y = -1.15)
        const trackBed = new THREE.Mesh(
          new THREE.PlaneGeometry(40, 6.2),
          new THREE.MeshLambertMaterial({ color: 0x1b1d1f })
        );
        trackBed.rotation.x = -Math.PI / 2;
        trackBed.position.set(0, -1.15, -4.6);
        procStationGroup.add(trackBed);

        // Wooden Railway Sleepers (Shpallar) & 2 Rusted Steel Rails
        const sleeperGeo = new THREE.BoxGeometry(0.28, 0.12, 2.4);
        const sleeperMat = new THREE.MeshLambertMaterial({ color: 0x3b2c22 });
        for (let sx = -18; sx <= 18; sx += 0.95) {
          const sl = new THREE.Mesh(sleeperGeo, sleeperMat);
          sl.position.set(sx, -1.08, -4.2);
          procStationGroup.add(sl);
        }
        [-3.45, -4.95].forEach((rz) => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(40, 0.14, 0.1), rustMat);
          rail.position.set(0, -0.96, rz);
          procStationGroup.add(rail);
        });

        // Back Tiled Wall (z = +6.6), Far Track Wall (z = -7.2), and Tunnel End Walls (x = +-14)
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 5.2), tileMat);
        backWall.rotation.y = Math.PI;
        backWall.position.set(0, 2.6, 6.6);
        procStationGroup.add(backWall);

        const farWall = new THREE.Mesh(new THREE.PlaneGeometry(34, 6.4), tileMat);
        farWall.position.set(0, 2.0, -7.2);
        procStationGroup.add(farWall);

        [-14, 14].forEach((wx) => {
          const endW = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 6.4), concreteMat);
          endW.rotation.y = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
          endW.position.set(wx, 2.0, -0.3);
          procStationGroup.add(endW);
          // Dark arched tunnel portal mouth over the tracks
          const tunnelMouth = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 4.9, 5.6),
            new THREE.MeshBasicMaterial({ color: 0x050608 })
          );
          tunnelMouth.position.set(wx + (wx < 0 ? 0.15 : -0.15), 1.35, -4.4);
          procStationGroup.add(tunnelMouth);
        });

        // Arched Vaulted Metro Ceiling & Concrete Support Ribs
        const metroCeil = new THREE.Mesh(new THREE.PlaneGeometry(30, 14.5), concreteMat);
        metroCeil.rotation.x = Math.PI / 2;
        metroCeil.position.set(0, 5.1, -0.3);
        procStationGroup.add(metroCeil);

        for (let rx = -12; rx <= 12; rx += 4) {
          const rib = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 14.4), darkMetalMat);
          rib.position.set(rx, 4.92, -0.3);
          procStationGroup.add(rib);
        }

        // Hanging Flickering Fluorescent Tube Fixtures along platform
        [-9, -3, 3, 9].forEach((lx, idx) => {
          const housing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.34), darkMetalMat);
          housing.position.set(lx, 4.65, 2.2);
          metroLobbyGroup.add(housing);
          const tubeMat = new THREE.MeshBasicMaterial({ color: 0xe6f2ec });
          const tube = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.16), tubeMat);
          tube.position.set(lx, 4.56, 2.2);
          metroLobbyGroup.add(tube);
          if (idx === 1 || idx === 2) {
            const pl = new THREE.PointLight(0xd9ece6, 0.58, 16, 1.5);
            pl.position.set(lx, 4.1, 2.2);
            metroLobbyGroup.add(pl);
            metroFlickLights.push({ light: pl, mat: tubeMat, phase: idx * 2.1 });
          }
        });

        // Heavy Tiled Metro Support Pillars along center of platform (with solid collision!)
        [-8, -2.8, 2.8, 8].forEach((px) => {
          const pil = new THREE.Mesh(new THREE.BoxGeometry(0.85, 5.1, 0.85), tileMat);
          pil.position.set(px, 2.55, 2.1);
          metroLobbyGroup.add(pil);
          metroBoxes.push({ x: px, z: 2.1, halfX: 0.48, halfZ: 0.48 });
        });

        // Real 3D GLB Metro Waiting Benches (bench.glb with collision!)
        [-5.4, 5.4].forEach((bx) => {
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('bench.glb', metroLobbyGroup, { x: bx, y: 0, z: 4.9, rotY: Math.PI, targetH: 0.92 });
          }
          metroBoxes.push({ x: bx, z: 4.9, halfX: 1.15, halfZ: 0.42 });
        });

        // Metro Station Upgrade: Ticket Turnstiles + Wall Tile Trim + Glowing Station Lightboxes
        const trimBand = new THREE.Mesh(new THREE.BoxGeometry(28, 0.24, 0.08), new THREE.MeshBasicMaterial({ color: 0xca8a04 }));
        trimBand.position.set(0, 2.2, 6.55);
        metroLobbyGroup.add(trimBand);
        [-10.5, -9.2, -7.9].forEach((tx) => {
          const gate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 1.15), darkMetalMat);
          gate.position.set(tx, 0.52, 5.4);
          const ind = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          ind.position.set(tx, 1.07, 4.95);
          metroLobbyGroup.add(gate, ind);
          metroBoxes.push({ x: tx, z: 5.4, halfX: 0.18, halfZ: 0.62 });
        });
        if (typeof loadGlbIntoGroup === 'function') {
          loadGlbIntoGroup('vending_machine.glb', metroLobbyGroup, { x: 11.4, y: 0, z: 5.4, rotY: -Math.PI / 2, targetH: 2.05 });
          metroBoxes.push({ x: 11.4, z: 5.4, halfX: 0.65, halfZ: 0.65 });
        }

        // Hyper-Detailed 3D Abandoned Metro Subway Carriage on the rails (z = -4.2)
        const trainGroup = new THREE.Group();
        trainGroup.position.set(0, -0.92, -4.55);

        // Corrugated weathered stainless-steel subway siding texture with grime, rust & blue-amber stripe
        const trc = document.createElement('canvas');
        trc.width = 512; trc.height = 256;
        const trg = trc.getContext('2d');
        trg.fillStyle = '#626c75';
        trg.fillRect(0, 0, 512, 256);
        // Horizontal brushed steel fluting ribs (classic subway car siding)
        for (let y = 0; y < 256; y += 8) {
          trg.fillStyle = y % 16 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.16)';
          trg.fillRect(0, y, 512, 3);
        }
        // Metro livery stripe (weathered teal-blue + amber-rust)
        trg.fillStyle = '#1e4d5c';
        trg.fillRect(0, 128, 512, 30);
        trg.fillStyle = '#b45309';
        trg.fillRect(0, 158, 512, 10);
        // Rust streaks & grime along bottom skirt
        for (let i = 0; i < 600; i++) {
          trg.fillStyle = i % 3 === 0 ? 'rgba(92,48,26,0.28)' : 'rgba(18,22,26,0.22)';
          trg.fillRect((i * 71) % 512, 168 + (i * 19) % 88, 4 + (i % 8), 8 + (i % 18));
        }
        const trainSkinTex = new THREE.CanvasTexture(trc);
        trainSkinTex.wrapS = trainSkinTex.wrapT = THREE.RepeatWrapping;
        trainSkinTex.repeat.set(3, 1);

        const bodyMat = new THREE.MeshStandardMaterial({ map: trainSkinTex, color: 0xb8c2cc, roughness: 0.56, metalness: 0.48 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x3b424b, roughness: 0.72, metalness: 0.35 });
        const chassisMat = new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.8, metalness: 0.5 });
        const doorSteelMat = new THREE.MeshStandardMaterial({ color: 0x7b8691, roughness: 0.42, metalness: 0.62 });
        const rubberMat = new THREE.MeshLambertMaterial({ color: 0x111317 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x16222c, emissive: 0x1c2f2a, emissiveIntensity: 0.45, roughness: 0.15, metalness: 0.35 });
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.6 });

        // Undercarriage steel chassis + 2 Bogie Wheel Trucks resting directly on the steel rails!
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.38, 2.55), chassisMat);
        chassis.position.y = 0.46;
        trainGroup.add(chassis);
        [-5.8, 5.8].forEach((bx) => {
          const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.36, 1.95), chassisMat);
          bogie.position.set(bx, 0.22, 0);
          trainGroup.add(bogie);
          [-0.85, 0.85].forEach((wx) => {
            [-0.78, 0.78].forEach((wz) => {
              const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 14), rustMat);
              wheel.rotation.x = Math.PI / 2;
              wheel.position.set(bx + wx, 0.24, wz);
              trainGroup.add(wheel);
            });
          });
        });

        // Main subway carriage hull (18.2m long, 2.8m tall, 2.75m wide)
        const trainBody = new THREE.Mesh(new THREE.BoxGeometry(18.2, 2.75, 2.75), bodyMat);
        trainBody.position.y = 2.02;
        trainGroup.add(trainBody);

        // Rounded vaulted subway roof + 3 roof AC / ventilation units
        const roofArch = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 18.1, 14, 1, false, 0, Math.PI), roofMat);
        roofArch.rotation.z = Math.PI / 2;
        roofArch.scale.set(0.32, 1, 1);
        roofArch.position.y = 3.38;
        trainGroup.add(roofArch);
        // High-detail 3D Metro Station split into 3 parts (<20MB each for GitHub upload) with raw GitHub fallback
        const RAW_GLB_BASE = 'https://raw.githubusercontent.com/revilend/backrooms-game/main/models/';
        const loadGlbWithFallback = (fname, onOk, onErr) => {
          if (typeof gltfLoader === 'undefined') { if (onErr) onErr(); return; }
          gltfLoader.load(REPO_GLB_BASE + fname, onOk, undefined, () => {
            gltfLoader.load(RAW_GLB_BASE + fname, onOk, undefined, () => { if (onErr) onErr(); });
          });
        };
        if (typeof gltfLoader !== 'undefined') {
          const stRoot = new THREE.Group();
          // Station raw bounds are cm: M_Tiled_Floor y=50 (0.50m), M_Wood track z=+310 (3.10m)
          stRoot.scale.setScalar(0.01);
          stRoot.position.set(0, -0.50, -7.70);
          metroLobbyGroup.add(stRoot);
          let stPartsLoaded = 0;
          let stPartsFailed = 0;
          const onStationGlb = (gltf) => {
            try {
              const st = gltf.scene;
              if (typeof stripGltfLights === 'function') stripGltfLights(st);
              stRoot.add(st);
              stPartsLoaded++;
              if (stPartsLoaded >= 3) procStationGroup.visible = false;
              if (stPartsLoaded >= 3) {
                window.__zulmatMetroGlbReady = true;
                const stOvEl = document.getElementById('start-overlay');
                if (stOvEl) stOvEl.classList.add('glb-ready');
              }
              if (trainGroup && trainGroup.position.y < -0.6) trainGroup.position.y = -0.48;
            } catch (e) {}
          };
          ['metro_station_1.glb', 'metro_station_2.glb', 'metro_station_3.glb'].forEach((fname) => {
            loadGlbWithFallback(fname, onStationGlb, () => {
              stPartsFailed++;
            });
          });
        }
        if (typeof gltfLoader !== 'undefined') {
          loadGlbWithFallback('subway_train.glb', (gltf) => {
            const tm = gltf.scene;
            stripGltfLights(tm);
            tm.updateMatrixWorld(true);
            const tb = new THREE.Box3().setFromObject(tm);
            const tsz = new THREE.Vector3(); tb.getSize(tsz);
            if (tsz.z > tsz.x) tm.rotation.y = Math.PI / 2;
            tm.updateMatrixWorld(true);
            const tb2 = new THREE.Box3().setFromObject(tm);
            const tsz2 = new THREE.Vector3(); tb2.getSize(tsz2);
            const sc = 3.05 / Math.max(0.1, tsz2.y);
            tm.scale.setScalar(sc);
            tm.updateMatrixWorld(true);
            const tb3 = new THREE.Box3().setFromObject(tm);
            const tctr = new THREE.Vector3(); tb3.getCenter(tctr);
            tm.position.set(-tctr.x, 0.08 - tb3.min.y, -tctr.z);
            trainGroup.children.forEach((c) => { c.visible = false; });
            trainGroup.add(tm);
            // Wire built-in GLB door-opening animation (t=3.875 closed -> t=4.250 fully open)
            if (gltf.animations && gltf.animations.length) {
              const mixer = new THREE.AnimationMixer(tm);
              const act = mixer.clipAction(gltf.animations[0]);
              act.play();
              metroTrain.glbMixer = mixer;
              metroTrain.glbAction = act;
              mixer.setTime(3.875 + (4.250 - 3.875) * (metroTrain.openAmt || 0));
            }
            const cabLight = new THREE.PointLight(0xfffbeb, 1.65, 18);
            cabLight.position.set(0, 2.55, 0);
            trainGroup.add(cabLight);
          });
        }
        [-5.2, 0, 5.2].forEach((ax) => {
          const acUnit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.28, 1.55), darkMetalMat);
          acUnit.position.set(ax, 3.84, 0);
          trainGroup.add(acUnit);
        });

        // 3 Sets of Double Sliding Subway Doors + Rubber Seals + Recessed Passenger Windows + Interior Grab Poles!
        [-5.6, 0, 5.6].forEach((dx) => {
          // Recessed dark doorway interior cavity (visible when center doors slide open!)
          const dFrame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 2.25, 0.1), rubberMat);
          dFrame.position.set(dx, 1.76, 1.34);
          trainGroup.add(dFrame);
          if (dx === 0) {
            // Warm dim interior carriage backdrop so open center doors look inviting & deep
            const cabBg = new THREE.Mesh(
              new THREE.PlaneGeometry(1.58, 2.16),
              new THREE.MeshBasicMaterial({ color: 0x263238 })
            );
            cabBg.position.set(0, 1.76, 1.395);
            trainGroup.add(cabBg);
          }
          // Left & Right sliding steel door leaves with tall vertical windows
          [-0.4, 0.4].forEach((leaf) => {
            const leafGrp = new THREE.Group();
            leafGrp.position.set(dx + leaf, 1.76, 1.40);
            const dLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.76, 2.15, 0.08), doorSteelMat);
            leafGrp.add(dLeaf);
            const dWin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.92, 0.10), glassMat);
            dWin.position.set(0, 0.40, 0.01);
            leafGrp.add(dWin);
            trainGroup.add(leafGrp);
            if (dx === 0) {
              if (leaf < 0) metroTrain.doorL = leafGrp;
              else metroTrain.doorR = leafGrp;
            }
          });
          // Yellow subway safety handrail visible inside door window
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.9, 8), poleMat);
          pole.position.set(dx, 1.85, 1.24);
          trainGroup.add(pole);
        });

        // Large panoramic passenger side windows between doors (with dark rubber gaskets)
        [-2.8, 2.8, -8.0, 8.0].forEach((wx) => {
          const wW = Math.abs(wx) > 6 ? 1.45 : 2.95;
          const wGasket = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.12, 1.12, 0.08), rubberMat);
          wGasket.position.set(wx, 2.28, 1.36);
          const wPane = new THREE.Mesh(new THREE.BoxGeometry(wW, 0.98, 0.1), glassMat);
          wPane.position.set(wx, 2.28, 1.37);
          trainGroup.add(wGasket, wPane);
        });

        // Front & Rear Driver Cab Windows, Dual Glowing Warm Headlights, Red Tail Lights & Steel Couplers!
        [-9.12, 9.12].forEach((ex) => {
          const dir = ex > 0 ? 1 : -1;
          const cabWin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 1.9), glassMat);
          cabWin.position.set(ex, 2.38, 0);
          trainGroup.add(cabWin);
          // Headlights
          [-0.75, 0.75].forEach((hz) => {
            const hl = new THREE.Mesh(
              new THREE.CylinderGeometry(0.14, 0.14, 0.12, 12),
              new THREE.MeshBasicMaterial({ color: dir > 0 ? 0xfef08a : 0xef4444 })
            );
            hl.rotation.z = Math.PI / 2;
            hl.position.set(ex + dir * 0.02, 1.18, hz);
            trainGroup.add(hl);
          });
          // Heavy steel rail coupler bumper
          const coupler = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.28, 0.48), rustMat);
          coupler.position.set(ex + dir * 0.32, 0.56, 0);
          trainGroup.add(coupler);
        });

        // Glowing LED Destination Route Board above center doors: "LEVEL 1: POYEZD"
        const trainSign = new THREE.Mesh(
          new THREE.PlaneGeometry(3.4, 0.82),
          new THREE.MeshBasicMaterial({ map: makeMetroSign('METRO POYEZDI', 'BEKAT: LEVEL 0 -> LEVEL 1', '#0f172a', '#38bdf8') })
        );
        trainSign.position.set(0, 3.65, 1.42);
        trainGroup.add(trainSign);
        const trainGlow = new THREE.PointLight(0x38bdf8, 0.55, 8);
        trainGlow.position.set(0, 2.6, 2.0);
        trainGroup.add(trainGlow);
        metroTrain.group = trainGroup;
        metroLobbyGroup.add(trainGroup);

        // Station Main Overhead Nameplate Sign ("TASHLANDIQ METRO • XAVFSIZ LOBBI")
        const mainSign = new THREE.Mesh(
          new THREE.PlaneGeometry(4.6, 1.05),
          new THREE.MeshBasicMaterial({ map: makeMetroSign('TASHLANDIQ METRO', 'BACKROOMS XAVFSIZ LOBBI', '#111827', '#facc15') })
        );
        mainSign.position.set(0, 4.35, 6.52);
        mainSign.rotation.y = Math.PI;
        metroLobbyGroup.add(mainSign);

        // Ascending Concrete Exit Staircase (Tepaga ko'tariladigan zina, x = 0, z = 5.4..8.4)
        const stairGrp = new THREE.Group();
        const stepMat = new THREE.MeshLambertMaterial({ color: 0x6b7280 });
        const railMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
        const stairBackGlow = new THREE.Mesh(
          new THREE.PlaneGeometry(2.8, 3.6),
          new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
        );
        stairBackGlow.rotation.y = Math.PI;
        stairBackGlow.position.set(0, 2.3, 8.6);
        stairGrp.add(stairBackGlow);
        for (let si = 0; si < 10; si++) {
          const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 0.34), stepMat);
          step.position.set(0, 0.12 + si * 0.24, 5.55 + si * 0.30);
          stairGrp.add(step);
        }
        [-1.36, 1.36].forEach((rx) => {
          const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 3.2), concreteMat);
          sideWall.position.set(rx, 1.4, 7.0);
          stairGrp.add(sideWall);
          const handRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3.3), railMat);
          handRail.position.set(rx * 0.92, 1.85, 6.95);
          handRail.rotation.x = -0.66;
          stairGrp.add(handRail);
        });
        const stairLight = new THREE.PointLight(0xfde68a, 1.35, 11);
        stairLight.position.set(0, 3.1, 7.6);
        stairGrp.add(stairLight);
        metroLobbyGroup.add(stairGrp);
        if (window.__zulmatMakeGraffitiTex) {
          const mg1 = new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 2.0),
            new THREE.MeshBasicMaterial({ map: window.__zulmatMakeGraffitiTex('bacteria'), transparent: true, opacity: 0.72, depthWrite: false })
          );
          mg1.position.set(-7.6, 1.85, 6.53); mg1.rotation.y = Math.PI;
          const mg2 = new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 2.0),
            new THREE.MeshBasicMaterial({ map: window.__zulmatMakeGraffitiTex('noexit'), transparent: true, opacity: 0.72, depthWrite: false })
          );
          mg2.position.set(7.6, 1.85, 6.53); mg2.rotation.y = Math.PI;
          metroLobbyGroup.add(mg1, mg2);
        }

        // Platform Boundary Collisions (keep player safely on the 28m x 8.4m platform!)
        metroBoxes.push({ x: 0, z: 6.85, halfX: 14.5, halfZ: 0.45 });     // Back wall
        // Track drop-off edge with open boarding gap at train doors (x: -2.2 .. +2.2) so player can walk inside!
        metroBoxes.push({ x: -8.35, z: -2.05, halfX: 6.15, halfZ: 0.45 });
        metroBoxes.push({ x: 8.35, z: -2.05, halfX: 6.15, halfZ: 0.45 });
        metroBoxes.push({ x: 0, z: -4.15, halfX: 8.5, halfZ: 0.35 });     // Train far interior wall
        metroBoxes.push({ x: -7.8, z: -3.1, halfX: 0.4, halfZ: 1.4 });     // Train left interior end
        metroBoxes.push({ x: 7.8, z: -3.1, halfX: 0.4, halfZ: 1.4 });      // Train right interior end
        metroBoxes.push({ x: -13.9, z: 2.4, halfX: 0.5, halfZ: 5.0 });    // Left tunnel wall
        metroBoxes.push({ x: 13.9, z: 2.4, halfX: 0.5, halfZ: 5.0 });     // Right tunnel wall

        // --- Load REAL Internet 3D Metro Station Props (KhronosGroup glTF-Sample-Assets + Webaverse via jsDelivr!) ---
        const METRO_PROPS = [
          // Vintage standing station street lanterns flanking the platform
          { url: REPO_GLB_BASE + 'streetlamp.glb', h: 3.1, spots: [{ x: -11.4, z: 0.2, rot: 0.4 }, { x: 11.4, z: 0.2, rot: -0.4 }], solid: true },
          // Abandoned metro drinks vending coolers along back tiled wall
          { url: REPO_GLB_BASE + 'vending_machine.glb', h: 2.15, spots: [{ x: -9.8, z: 5.75, rot: 0 }, { x: 9.8, z: 5.75, rot: 0 }], solid: true },
          // Industrial hanging metal station lamps above platform
          { url: REPO_GLB_BASE + 'streetlamp.glb', h: 0.85, ceiling: true, spots: [{ x: -9, z: 2.2, rot: 0 }, { x: -3, z: 2.2, rot: 0 }, { x: 3, z: 2.2, rot: 0 }, { x: 9, z: 2.2, rot: 0 }] },
          // Abandoned explorer tripod camera left on the platform
          { url: REPO_GLB_BASE + 'crt_pc.glb', h: 1.55, spots: [{ x: -4.2, z: 0.6, rot: 2.4 }], solid: true },
          // Abandoned supply chest & retro boombox near benches
          { url: REPO_GLB_BASE + 'cabinet.glb', h: 0.85, spots: [{ x: 4.1, z: 5.5, rot: 2.9 }, { x: -11.8, z: 4.6, rot: 1.2 }], solid: true },
          { url: REPO_GLB_BASE + 'crt_pc.glb', h: 0.42, yOffset: 0.56, spots: [{ x: -5.4, z: 4.78, rot: 0.2 }] },
          // Damaged explorer helmet & metal water bottle on the right metro bench
          { url: REPO_GLB_BASE + 'cabinet.glb', h: 0.36, yOffset: 0.58, spots: [{ x: 5.1, z: 4.78, rot: 0.5 }] },
          { url: REPO_GLB_BASE + 'almond_water.glb', h: 0.28, yOffset: 0.56, spots: [{ x: 5.7, z: 4.75, rot: 0 }] },
          // Abandoned waiting chair near left station wall
          { url: REPO_GLB_BASE + 'bench.glb', h: 1.05, spots: [{ x: -7.5, z: 5.65, rot: 0.3 }, { x: 7.4, z: 5.65, rot: -0.35 }], solid: true }
        ];

        METRO_PROPS.forEach((item) => {
          try {
            gltfLoader.load(
              item.url,
              (gltf) => {
                const srcObj = gltf.scene;
                stripGltfLights(srcObj);
                srcObj.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(srcObj);
                const sz = new THREE.Vector3(), ctr = new THREE.Vector3();
                box.getSize(sz); box.getCenter(ctr);
                const sc = item.h / (sz.y || 1);
                item.spots.forEach((sp) => {
                  const cl = srcObj.clone();
                  cl.scale.setScalar(sc);
                  const baseY = item.ceiling
                    ? (4.95 - sz.y * sc)
                    : ((-box.min.y * sc) + (item.yOffset || 0));
                  cl.position.set(sp.x - ctr.x * sc, baseY, sp.z - ctr.z * sc);
                  cl.rotation.y = sp.rot || 0;
                  metroLobbyGroup.add(cl);
                  if (item.solid) {
                    cl.updateMatrixWorld(true);
                    const pb = new THREE.Box3().setFromObject(cl);
                    const psz = new THREE.Vector3(), pctr = new THREE.Vector3();
                    pb.getSize(psz); pb.getCenter(pctr);
                    metroBoxes.push({
                      x: pctr.x,
                      z: pctr.z,
                      halfX: Math.min(1.1, Math.max(0.32, psz.x * 0.44)),
                      halfZ: Math.min(1.1, Math.max(0.32, psz.z * 0.44))
                    });
                  }
                });
              },
              undefined,
              () => {}
            );
          } catch (e) {}
        });
      })();

      // =========================================================================
      // BUILD LEVEL 1: HABITABLE ZONE (2 Massive Concrete Parking Garages + Connected East Concrete Maze + 6 Generators + Intense Blackouts!)
      // =========================================================================
      const l1Generators = [];
      const l1FuelCans = [];
      const l1Lockers = [];
      const l1Exit = { x: 0, z: -64.5, unlocked: true, doorPivot: null, signMat: null, light: null };
      const l1Spawn = new THREE.Vector3(0, 1.65, 26);
      const l1MonsterSpawn = new THREE.Vector3(44, 0, -6);

      function buildLevel1HabitableZone() {
        setTimeout(() => { spawnVentDuct(level1Group, l1Boxes, -12, 14, 6.2, 0); spawnJumpLedge(level1Group, 'level1', 12, -16, 2.8, 2.8, 1.05); }, 0);
        l1Boxes.length = 0; l1FuelCans.length = 0; l1Generators.length = 0; l1Lockers.length = 0;
        const H = 4.6;
        const l1WallMat = new THREE.MeshLambertMaterial({ map: l1WallTex });
        const crateMat = new THREE.MeshLambertMaterial({ color: 0x7c5c3a });

        function addWall(x, z, w, d) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), l1WallMat);
          m.position.set(x, H / 2, z);
          level1Group.add(m);
          l1Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        }

        const floorTexBig = l1FloorTex.clone();
        floorTexBig.needsUpdate = true;
        floorTexBig.repeat.set(26, 26);
        const ceilTexBig = l1CeilTex.clone();
        ceilTexBig.needsUpdate = true;
        ceilTexBig.repeat.set(26, 26);

        const l1Floor = new THREE.Mesh(new THREE.PlaneGeometry(116, 112), new THREE.MeshLambertMaterial({ map: floorTexBig }));
        l1Floor.rotation.x = -Math.PI / 2;
        l1Floor.position.set(18, 0, -18);
        level1Group.add(l1Floor);

        const l1Ceil = new THREE.Mesh(new THREE.PlaneGeometry(116, 112), new THREE.MeshLambertMaterial({ map: ceilTexBig }));
        l1Ceil.rotation.x = Math.PI / 2;
        l1Ceil.position.set(18, H, -18);
        level1Group.add(l1Ceil);

        // --- OUTER PERIMETER WALLS OF THE 3-WING COMPLEX ---
        addWall(18, 32, 102, 1.2);      // South wall (Main Garage + East Maze)
        addWall(-32, -18, 1.2, 102);    // West wall (Main Garage + North 2nd Garage)
        addWall(0, -68, 66, 1.2);       // North far wall (2nd Garage Exit wall)
        addWall(68, 0, 1.2, 66);        // East far wall (Maze outer wall)
        addWall(50, -32, 38, 1.2);      // North wall of East Maze
        addWall(32, -50, 1.2, 38);      // East wall of North 2nd Garage

        // --- DIVIDER WALLS WITH PASSAGE ARCHWAYS CONNECTING ALL 3 WINGS ---
        // Divider between Main Garage & North 2nd Garage (z = -32) with 2 wide passageways at x = -16 and x = +16
        addWall(-26, -32, 12, 1.4);
        addWall(0, -32, 22, 1.4);
        addWall(26, -32, 12, 1.4);

        // Divider between Main Garage & East Concrete Maze (x = +32) with 2 narrow entry corridors at z = +14 and z = -16
        addWall(32, 25, 1.4, 14);
        addWall(32, -1, 1.4, 22);
        addWall(32, -26, 1.4, 12);

        // --- WING A: MAIN GARAGE CONCRETE PILLARS ---
        for (let px = -22; px <= 22; px += 11) {
          for (let pz = -20; pz <= 20; pz += 10) {
            if (Math.abs(px) < 4 && pz > 18) continue;
            addWall(px, pz, 1.6, 1.6);
          }
        }

        // --- WING B: SECOND NORTH GARAGE (x: -32..32, z: -68..-32) WITH OFFSET PILLARS & STORAGE PARTITIONS ---
        for (let px = -20; px <= 20; px += 10) {
          for (let pz = -58; pz <= -40; pz += 9) {
            if (Math.abs(px) < 4 && pz < -55) continue;
            addWall(px, pz, 1.7, 1.7);
          }
        }
        addWall(-14, -49, 14, 1.1);
        addWall(14, -49, 14, 1.1);
        addWall(0, -40, 1.1, 10);

        // --- WING C: CONNECTED EAST CONCRETE WAREHOUSE MAZE (x: 32..68, z: -32..32) ---
        addWall(42, 20, 1.1, 18);
        addWall(54, 24, 16, 1.1);
        addWall(52, 12, 20, 1.1);
        addWall(60, 4, 1.1, 16);
        addWall(44, 2, 14, 1.1);
        addWall(40, -10, 1.1, 18);
        addWall(52, -8, 16, 1.1);
        addWall(58, -19, 1.1, 16);
        addWall(46, -22, 14, 1.1);

        // Warehouse Wooden Supply Crates across all 3 wings
        [
          [-16, 14], [16, 14], [-16, -6], [16, -6], [-6, 4], [7, -14],
          [-24, -42], [24, -42], [-22, -58], [22, -58],
          [38, 26], [62, 18], [46, -2], [62, -26]
        ].forEach(([cx, cz]) => {
          const cr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.35, 1.6), crateMat);
          cr.position.set(cx, 0.68, cz);
          level1Group.add(cr);
          l1Boxes.push({ x: cx, z: cz, halfX: 0.85, halfZ: 0.85, isProp: true });
        });

        // 6 Bright Yellow Diesel Generators (2 in Main Garage, 2 deep in East Concrete Maze, 2 in North 2nd Garage!)
        const genCoords = [
          [-25, 16], [24, -18],        // Main Garage
          [62, 26], [62, -12],         // Deep inside East Concrete Maze
          [-25, -60], [25, -60]        // Far corners of North 2nd Garage
        ];
        const genYellow = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45, metalness: 0.35 });
        const genDark = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6, metalness: 0.55 });
        genCoords.forEach(([gx, gz]) => {
          const gg = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.05, 0.95), genYellow);
          body.position.y = 0.58;
          const eng = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.72), genDark);
          eng.position.set(0.15, 1.18, 0);
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8), genDark);
          pipe.position.set(-0.55, 1.42, 0);
          const lampMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), lampMat);
          beacon.position.set(0, 1.65, 0);
          const gLight = new THREE.PointLight(0xef4444, 0.8, 8);
          gLight.position.set(0, 1.85, 0);
          gg.add(body, eng, pipe, beacon, gLight);
          gg.position.set(gx, 0, gz);
          level1Group.add(gg);
          const needsFuel = (l1Generators.length % 2 === 1); // 3 of 6 generators are empty & need Gasoline Cans!
          l1Generators.push({ x: gx, z: gz, active: false, needsFuel, lampMat, light: gLight, mesh: gg });
          spawnRepoProp(gg, 'generator.glb', 0, 0, 0, 1.38, 0, { centerXZ: true, hideOldChildren: true });
          l1Boxes.push({ x: gx, z: gz, halfX: 0.85, halfZ: 0.55, isProp: true });
        });

        // 3 Red Gasoline Fuel Cans ("Benzin kanistrasi") hidden across the 2 Garages & East Concrete Maze!
        const fuelMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d, emissiveIntensity: 0.45, roughness: 0.35 });
        [[-22, -4], [48, 22], [18, -56]].forEach(([fx, fz]) => {
          const fg = new THREE.Group();
          const can = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.24), fuelMat);
          can.position.y = 0.28;
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 8), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          cap.position.set(0.1, 0.62, 0);
          fg.add(can, cap);
          fg.position.set(fx, 0, fz);
          level1Group.add(fg);
          l1FuelCans.push({ x: fx, z: fz, mesh: fg, taken: false });
          spawnRepoProp(fg, 'jerrycan.glb', 0, 0, 0, 0.72, 0.4, { centerXZ: true, hideOldChildren: true });
        });

        // 10 Metal Hiding Lockers distributed across all 3 wings for Blackout survival
        [
          [-10, 24], [10, 24], [-28, 0], [26, 6],
          [38, 16], [54, 4], [48, -16],
          [-28, -46], [28, -46], [0, -56]
        ].forEach(([lx, lz]) => {
          const lg = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.35, 0.9), lockerBodyMat);
          body.position.y = 1.18;
          lg.add(body);
          lg.position.set(lx, 0, lz);
          level1Group.add(lg);
          const lkObj = { x: lx, z: lz, mesh: lg };
          l1Lockers.push(lkObj);
          l1Boxes.push({ x: lx, z: lz, halfX: 0.58, halfZ: 0.52, lockerRef: lkObj, isProp: true });
          spawnRepoProp(lg, 'locker.glb', 0, 0, 0, 2.35, 0, { centerXZ: true, hideOldChildren: true });
        });

        // Abandoned Cars parked in Level 1 Concrete Garages (car.glb)
        [[-26, 36, 0.2], [26, -34, -Math.PI + 0.15]].forEach(([cx, cz, ry]) => {
          spawnRepoProp(level1Group, 'car.glb', cx, 0, cz, 1.65, ry, { centerXZ: true });
        });
        // Level 1 Emergency Warehouse Exit Door at far North end of 2nd Garage (z = -67.2)
        const exG = new THREE.Group();
        exG.position.set(l1Exit.x, 0, -67.2);
        const steelM = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 0.45), steelM);
        frame.position.y = 1.7;
        exG.add(frame);
        const dPiv = new THREE.Group();
        dPiv.position.set(-1.3, 0, 0.1);
        const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 0.16), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.5 }));
        doorLeaf.position.set(1.3, 1.5, 0);
        dPiv.add(doorLeaf);
        exG.add(dPiv);
        const signM = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const signMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.2), signM);
        signMesh.position.set(0, 3.65, 0.18);
        exG.add(signMesh);
        const eL = new THREE.PointLight(0xef4444, 1.1, 10);
        eL.position.set(0, 3.2, 0.8);
        exG.add(eL);
        level1Group.add(exG);
        l1Exit.z = -66.2;
        l1Exit.doorPivot = dPiv;
        spawnRepoProp(dPiv, 'metal_door.glb', 1.1, 0, 0, 2.9, 0, { centerXZ: true, flatZ: true, hideOldChildren: true });
        l1Exit.signMat = signM;
        l1Exit.light = eL;
      }

      // =========================================================================
      // BUILD LEVEL 37: DON'T SPLASH (110m Flooded Poolrooms Obby + Dry Platforms, Sinking Blocks, Moving Bridges, Pebbles & Blind Sound-Hunting Monster "IT"!)
      // =========================================================================
      const l37Platforms = [];
      const l37Pebbles = [];
      const l37Switches = [];
      const l37Ripples = [];
      const l37Exit = { x: 0, z: -226, unlocked: true, portalMat: null, light: null };
      const l37Spawn = new THREE.Vector3(0, 2.55, 14);
      const l37MonsterSpawn = new THREE.Vector3(8, 0, -28);
      let l37WaterMesh = null;

      function buildLevel37DontSplash() {
        l37Boxes.length = 0; l37Pebbles.length = 0; l37Platforms.length = 0; l37Switches.length = 0;
        const W = 800, LEN = 800, H = 7.6;
        const pWallM = new THREE.MeshLambertMaterial({ map: pWallTex });
        const pFloorTexBig = pFloorTex.clone(); pFloorTexBig.needsUpdate = true; pFloorTexBig.repeat.set(72, 64);
        const pFloorM = new THREE.MeshLambertMaterial({ map: pFloorTexBig });
        const pCeilTexBig = pCeilTex.clone(); pCeilTexBig.needsUpdate = true; pCeilTexBig.repeat.set(72, 64);
        const pCeilM = new THREE.MeshLambertMaterial({ map: pCeilTexBig });
        const dryTileMat = new THREE.MeshLambertMaterial({ map: pWallTex, color: 0xe6f4f7 });
        const sinkTileMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
        const moveTileMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
        const safeTileMat = new THREE.MeshLambertMaterial({ color: 0x34d399 });

        // Submerged pool floor (y = 0)
        const poolFloor = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), pFloorM);
        poolFloor.rotation.x = -Math.PI / 2;
        poolFloor.position.set(0, 0, -110);
        level37Group.add(poolFloor);

        // Translucent rippling turquoise water (y = 0.44m — touching it triggers a SPLASH!)
        l37WaterMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(W, LEN),
          new THREE.MeshLambertMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.36 })
        );
        l37WaterMesh.rotation.x = -Math.PI / 2;
        l37WaterMesh.position.set(0, 0.44, -110);
        level37Group.add(l37WaterMesh);

        // Tall vaulted Poolrooms ceramic ceiling + bright skylights
        const poolCeil = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), pCeilM);
        poolCeil.rotation.x = Math.PI / 2;
        poolCeil.position.set(0, H, -110);
        level37Group.add(poolCeil);

        const skyMat = new THREE.MeshBasicMaterial({ color: 0xe6fbff });
        for (let sz = 10; sz >= -232; sz -= 14) {
          const sky = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), skyMat);
          sky.rotation.x = Math.PI / 2;
          sky.position.set(0, H - 0.04, sz);
          level37Group.add(sky);
        }

        // Outer Poolrooms walls + tall decorative side columns
        [
          { x: 0, z: 290, w: W, d: 1.5 },
          { x: 0, z: -510, w: W, d: 1.5 },
          { x: -W / 2, z: -110, w: 1.5, d: LEN },
          { x: W / 2, z: -110, w: 1.5, d: LEN }
        ].forEach((pw) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(pw.w, H, pw.d), pWallM);
          m.position.set(pw.x, H / 2, pw.z);
          level37Group.add(m);
          l37Boxes.push({ x: pw.x, z: pw.z, halfX: pw.w / 2, halfZ: pw.d / 2 });
        });
        for (let cz = 24; cz >= -248; cz -= 20) {
          [-13.5, 13.5, -48, 48, -96, 96, -144, 144].forEach((cx) => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(3.2, H, 3.2), pWallM);
            col.position.set(cx, H / 2, cz);
            level37Group.add(col);
            l37Boxes.push({ x: cx, z: cz, halfX: 1.62, halfZ: 1.62 });
          });
        }

        // Helper to add Dry Raised Poolrooms Platform (static, sinking, or moving!)
        function addPlatform(x, z, w, d, topY = 0.9, type = 'static', moveAmp = 0, moveSpd = 0, phase = 0) {
          const mat = type === 'sink' ? sinkTileMat.clone() : (type === 'move' ? moveTileMat : (type === 'safe' ? safeTileMat : dryTileMat));
          const h = topY + 0.25;
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          mesh.position.set(x, topY - h / 2, z);
          level37Group.add(mesh);
          l37Platforms.push({
            mesh, x, z, baseX: x, baseTopY: topY, topY, w, d, h, type,
            moveAmp, moveSpd, phase, sinkTimer: 0, sinking: false
          });
        }

        // --- STAGE 1 (z: +18 .. -14): Dry Start Island + Stepping Stones + Narrow Balance Beam ---
        addPlatform(0, 14, 9.0, 7.5, 0.9, 'safe');
        addPlatform(0, 6.2, 3.2, 3.0, 0.9, 'static');
        addPlatform(-3.0, 0.6, 3.0, 3.0, 0.9, 'static');
        addPlatform(2.4, -4.8, 3.0, 3.0, 0.9, 'static');
        addPlatform(0, -11.5, 1.7, 7.0, 0.9, 'static'); // Narrow balance beam!

        // --- STAGE 2 (z: -18 .. -44): Sinking Amber Blocks + Safe Checkpoint Island #1 ---
        addPlatform(0, -18.5, 6.4, 4.4, 0.9, 'safe');
        addPlatform(-3.2, -24.5, 3.2, 3.2, 0.9, 'sink');
        addPlatform(2.6, -29.8, 3.2, 3.2, 0.9, 'sink');
        addPlatform(-2.4, -35.2, 3.2, 3.2, 0.9, 'sink');
        addPlatform(0, -41.5, 7.2, 4.8, 0.9, 'safe'); // Safe Island #1

        // --- STAGE 3 (z: -48 .. -72): Moving Sliding Cyan Bridges + Safe Checkpoint Island #2 ---
        addPlatform(0, -48.5, 3.8, 3.4, 0.9, 'move', 6.0, 1.35, 0);
        addPlatform(0, -55.0, 3.8, 3.4, 0.9, 'move', 6.5, 1.55, 2.2);
        addPlatform(0, -61.5, 3.8, 3.4, 0.9, 'move', 6.0, 1.45, 4.4);
        addPlatform(0, -68.5, 7.2, 4.8, 0.9, 'safe'); // Safe Island #2

        // --- STAGE 4 (z: -75 .. -118): Zigzag Balance Beams + Side Switch Island #1 & #2 ---
        addPlatform(-3.4, -74.5, 2.8, 2.8, 0.9, 'sink');
        addPlatform(2.8, -79.8, 2.8, 2.8, 0.9, 'static');
        addPlatform(0, -85.5, 3.6, 3.2, 0.9, 'move', 5.2, 1.65, 1.1);
        addPlatform(0, -94.0, 8.0, 5.2, 0.9, 'safe'); // Safe Island #3
        // Side detour islands with Dry-Island Gate Switches!
        addPlatform(-9.5, -41.5, 4.0, 3.6, 0.9, 'safe'); // Switch #1 island (left of Safe Island #1)
        addPlatform(-5.6, -41.5, 2.8, 2.0, 0.9, 'sink');
        addPlatform(9.5, -94.0, 4.0, 3.6, 0.9, 'safe');  // Switch #2 island (right of Safe Island #3)
        addPlatform(5.6, -94.0, 2.8, 2.0, 0.9, 'sink');

        // --- STAGE 5 & 6 (z: -100 .. -166): Deep Poolrooms Sprint -> Switch #3 -> Radiant Exit! ---
        addPlatform(-2.8, -101.5, 1.8, 7.5, 0.9, 'static');
        addPlatform(2.8, -110.5, 1.8, 7.5, 0.9, 'static');
        addPlatform(0, -119.5, 3.8, 3.4, 0.9, 'move', 6.8, 1.75, 0.5);
        addPlatform(0, -126.5, 3.8, 3.4, 0.9, 'move', 6.8, 1.85, 3.4);
        addPlatform(0, -134.5, 7.4, 5.0, 0.9, 'safe'); // Safe Island #4 (Switch #3!)
        addPlatform(-3.4, -141.5, 3.0, 3.0, 0.9, 'sink');
        addPlatform(3.0, -147.2, 3.0, 3.0, 0.9, 'sink');
        addPlatform(0, -153.5, 3.8, 3.4, 0.9, 'move', 5.8, 1.9, 1.7);
        addPlatform(0, -162.5, 7.6, 5.0, 0.9, 'safe'); // Safe Island #5 (Switch #4!)
        addPlatform(-9.5, -162.5, 4.0, 3.6, 0.9, 'safe');
        addPlatform(-5.6, -162.5, 2.8, 2.0, 0.9, 'sink');
        // --- STAGE 7 & 8 (z: -169 .. -230): High-Speed Moving Bridges + Zigzag Sinking Stairs -> Final Exit! ---
        addPlatform(0, -170.5, 3.6, 3.2, 0.9, 'move', 7.2, 2.0, 0.4);
        addPlatform(0, -177.5, 3.6, 3.2, 0.9, 'move', 7.2, 2.1, 3.2);
        addPlatform(-3.6, -184.5, 2.8, 2.8, 0.9, 'sink');
        addPlatform(3.2, -190.5, 2.8, 2.8, 0.9, 'sink');
        addPlatform(0, -197.5, 7.6, 5.0, 0.9, 'safe'); // Safe Island #6 (Switch #5!)
        addPlatform(2.6, -205.0, 1.7, 7.5, 0.9, 'static');
        addPlatform(-2.6, -214.0, 1.7, 7.5, 0.9, 'static');
        addPlatform(0, -226.5, 9.5, 7.5, 0.9, 'safe'); // Final Exit Island!

        // 3 Dry-Island Pool Gate Switches (must activate all 3 to unlock the Poolrooms Exit Portal!)
        const swPedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 });
        [[-9.5, -41.5], [9.5, -94.0], [0, -134.5], [-9.5, -162.5], [0, -197.5]].forEach(([sx, sz]) => {
          const sg = new THREE.Group();
          const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 1.1, 10), swPedMat);
          ped.position.y = 0.55;
          const orbMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), orbMat);
          orb.position.y = 1.32;
          const sl = new THREE.PointLight(0xef4444, 0.85, 8);
          sl.position.y = 1.6;
          sg.add(ped, orb, sl);
          sg.position.set(sx, 0.9, sz);
          level37Group.add(sg);
          l37Switches.push({ x: sx, z: sz, active: false, orb, orbMat, light: sl });
        });

        // Collectible Distraction Pebbles ("TOSHCHA") on Safe Islands!
        const pebMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xca8a04, emissiveIntensity: 0.7, roughness: 0.3 });
        [[2.2, 12.2], [-1.8, -18.5], [2.0, -41.5], [-2.0, -68.5]].forEach(([px, pz]) => {
          const pm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pebMat);
          pm.position.set(px, 1.32, pz);
          level37Group.add(pm);
          l37Pebbles.push({ x: px, z: pz, mesh: pm, taken: false });
        });

        // Radiant Glowing Exit Archway at z = -97.2
        const archG = new THREE.Group();
        archG.position.set(0, 0.9, -230.2);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const portal = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), pMat);
        portal.position.set(0, 2.1, 0.12);
        const pL = new THREE.PointLight(0x22c55e, 1.4, 15);
        pL.position.set(0, 2.8, 1.4);
        archG.add(portal, pL);
        level37Group.add(archG);
        l37Exit.z = -227.5;
        l37Exit.portalMat = pMat;
        l37Exit.light = pL;
      }

      function spawnWaterRipple(rx, rz) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.2, 0.45, 24),
          new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(rx, 0.48, rz);
        level37Group.add(ring);
        l37Ripples.push({ mesh: ring, age: 0 });
      }

      function pickRandomFarExitCell(cells, sp) {
        if (!cells || !cells.length) return { x: 40, z: 40 };
        const sx = sp ? sp.x : cells[0].x, sz = sp ? sp.z : cells[0].z;
        const ranked = cells.map((c) => ({ c, d: Math.hypot(c.x - sx, c.z - sz) })).sort((a, b) => b.d - a.d);
        const poolLen = Math.max(1, Math.floor(ranked.length * 0.35));
        return ranked[Math.floor(Math.random() * poolLen)].c;
      }

      // --- Reusable Deterministic Winding Backrooms Labyrinth Generator (DFS + Loops + Open Chambers) ---
      function generateWindingMaze(rows, cols, seedVal, loopChance = 0.14) {
        if (rows === 101 && cols === 101) { rows = 119; cols = 119; }
        const lc = (loopChance > 0.5) ? 0.16 : loopChance;
        let s = ((Math.floor((seedVal || 1) * 99991) ^ Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 1337;
        function rNext() {
          s = (s * 1664525 + 1013904223) >>> 0;
          return s / 4294967296;
        }
        const g = Array.from({ length: rows }, () => Array(cols).fill('#'));
        const stack = [[1, 1]];
        g[1][1] = '.';
        while (stack.length > 0) {
          const [r, c] = stack[stack.length - 1];
          const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => rNext() - 0.5);
          let moved = false;
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && g[nr][nc] === '#') {
              g[r + dr / 2][c + dc / 2] = '.';
              g[nr][nc] = '.';
              stack.push([nr, nc]);
              moved = true;
              break;
            }
          }
          if (!moved) stack.pop();
        }
        // Carve disorienting loops & occasional small chambers so players wonder "Have I been here before?!"
        for (let r = 2; r < rows - 2; r++) {
          for (let c = 2; c < cols - 2; c++) {
            if (g[r][c] === '#' && rNext() < lc) {
              const horiz = (g[r][c - 1] === '.' && g[r][c + 1] === '.');
              const vert = (g[r - 1][c] === '.' && g[r + 1][c] === '.');
              if (horiz || vert) g[r][c] = '.';
            }
          }
        }
        // Carve varied Backrooms room sizes: huge 7x7 pillar halls, 5x5 rooms, 3x5 offices & long narrow corridors!
        if (rows >= 25 && cols >= 25) {
          const numRooms = Math.min(28, Math.max(10, Math.floor((rows * cols) / 180)));
          const archetypes = [
            { h: 7, w: 7, pillars: [[2, 2], [2, 4], [4, 2], [4, 4]] },
            { h: 7, w: 5, pillars: [[3, 2]] },
            { h: 5, w: 7, pillars: [[2, 3]] },
            { h: 5, w: 5, pillars: [[2, 2]] },
            { h: 3, w: 6, pillars: [] },
            { h: 6, w: 3, pillars: [] },
            { h: 4, w: 4, pillars: [] }
          ];
          for (let i = 0; i < numRooms; i++) {
            const arch = archetypes[i % archetypes.length];
            const r0 = 2 + Math.floor(rNext() * Math.max(1, rows - arch.h - 4));
            const c0 = 2 + Math.floor(rNext() * Math.max(1, cols - arch.w - 4));
            for (let r = r0; r < r0 + arch.h && r < rows - 1; r++) {
              for (let c = c0; c < c0 + arch.w && c < cols - 1; c++) {
                const isPillar = arch.pillars.some(([pr, pc]) => (r === r0 + pr && c === c0 + pc));
                g[r][c] = isPillar ? '#' : '.';
              }
            }
          }
          // Carve 3 long straight narrow corridor shafts for deep perspective sightlines
          for (let sIdx = 0; sIdx < 3; sIdx++) {
            const horiz = (sIdx % 2 === 0);
            const rS = 3 + Math.floor(rNext() * (rows - 6));
            const cS = 3 + Math.floor(rNext() * (cols - 6));
            const lenS = 7 + Math.floor(rNext() * 8);
            for (let k = 0; k < lenS; k++) {
              const rr = horiz ? rS : Math.min(rows - 2, rS + k);
              const cc = horiz ? Math.min(cols - 2, cS + k) : cS;
              g[rr][cc] = '.';
            }
          }
        }
        return g;
      }

      // =========================================================================
      // BUILD LEVEL 2: PIPE DREAMS (REAL 29x29 = 122m x 122m Winding Steam-Pipe Labyrinth + 5 Sequence Breakers + Steam Traps!)
      // =========================================================================
      const l2Breakers = [];
      const l2SteamVents = [];
      const l2Lockers = [];
      const l2OpenCells = [];
      const l2Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      const l2Spawn = new THREE.Vector3(0, 1.65, 0);
      const l2MonsterSpawn = new THREE.Vector3(0, 0, 0);
      const L2_SEQ_NAMES = ['#1 QIZIL', '#2 SARIQ', '#3 KO\'K', '#4 YASHIL', '#5 BINAFSHA', '#6 OQ', '#7 ZANGORI'];
      const L2_SEQ_COLORS = [0xef4444, 0xfacc15, 0x38bdf8, 0x22c55e, 0xa855f7, 0xf8fafc, 0x06b6d4];

      function buildLevel2PipeDreams() {
        setTimeout(() => { spawnVentDuct(level2Group, l2Boxes, 0, 12, 6.0, Math.PI / 2); spawnJumpLedge(level2Group, 'level2', 0, -14, 2.6, 2.6, 0.95); }, 0);
        l2Boxes.length = 0; l2Breakers.length = 0; l2Lockers.length = 0; l2OpenCells.length = 0; l2SteamVents.length = 0;
        const ROWS = 119, COLS = 119, C = 6.2, H = 4.4;
        const maze = generateWindingMaze(ROWS, COLS, 22291, 0.13);
        function cellToW(r, c) { return { x: (c - COLS / 2 + 0.5) * C, z: (r - ROWS / 2 + 0.5) * C }; }

        const wc = document.createElement('canvas'); wc.width = 256; wc.height = 256;
        const wg = wc.getContext('2d');
        wg.fillStyle = '#47413c'; wg.fillRect(0, 0, 256, 256);
        wg.strokeStyle = '#26211d'; wg.lineWidth = 3;
        for (let y = 0; y < 256; y += 32) {
          const o = ((y / 32) % 2) * 32;
          for (let x = -32; x < 288; x += 64) wg.strokeRect(x + o, y, 64, 32);
        }
        // Horizontal rusted industrial pipe stripe painted along wall
        wg.fillStyle = '#5c3a28'; wg.fillRect(0, 38, 256, 20);
        wg.fillStyle = '#334155'; wg.fillRect(0, 68, 256, 14);
        wg.fillStyle = 'rgba(120, 53, 15, 0.35)'; wg.fillRect(0, 195, 256, 61);
        const wTex = new THREE.CanvasTexture(wc);
        const wMat = new THREE.MeshLambertMaterial({ map: wTex });
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x5c3a28, roughness: 0.65, metalness: 0.55 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 });

        const W = COLS * C, D = ROWS * C;
        const flTex = l1FloorTex.clone(); flTex.needsUpdate = true; flTex.repeat.set(ROWS, COLS);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: flTex }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level2Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ color: 0x241f1b }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level2Group.add(cl);

        const wallPts = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const p = cellToW(r, c);
            if (maze[r][c] === '#') {
              wallPts.push(p);
              l2Boxes.push({ x: p.x, z: p.z, halfX: C / 2, halfZ: C / 2 });
            } else {
              l2OpenCells.push(p);
            }
          }
        }
        const wInst = new THREE.InstancedMesh(new THREE.BoxGeometry(C, H, C), wMat, wallPts.length);
        const dObj = new THREE.Object3D();
        wallPts.forEach((p, idx) => {
          dObj.position.set(p.x, H / 2, p.z); dObj.updateMatrix();
          wInst.setMatrixAt(idx, dObj.matrix);
        });
        wInst.instanceMatrix.needsUpdate = true;
        level2Group.add(wInst);

        // Overhead steam pipes spanning the labyrinth ceiling
        for (let i = -72; i <= 72; i += 12) {
          const ph = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, W - 4, 8), pipeMat);
          ph.rotation.z = Math.PI / 2; ph.position.set(0, H - 0.32, i);
          level2Group.add(ph);
        }

        // Spawn at (1,1), Exit at far opposite open corner, Monster in middle!
        const sp0 = cellToW(1, 1);
        l2Spawn.set(sp0.x, 1.65, sp0.z);
        const exCell = pickRandomFarExitCell(l2OpenCells, l2Spawn);
        l2Exit.x = exCell.x; l2Exit.z = exCell.z;
        const midCell = l2OpenCells[Math.floor(l2OpenCells.length * 0.5)];
        l2MonsterSpawn.set(midCell.x, 0, midCell.z);

        // Place 5 Color-Sequence Breakers spread deep across the 122m labyrinth!
        const brFracs = [0.12, 0.24, 0.38, 0.52, 0.65, 0.78, 0.90];
        brFracs.forEach((fr, idx) => {
          const p = l2OpenCells[Math.floor(l2OpenCells.length * fr)];
          const bg = new THREE.Group();
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.45, 0.55), steelMat);
          box.position.y = 1.25;
          const col = L2_SEQ_COLORS[idx];
          const lMat = new THREE.MeshBasicMaterial({ color: col });
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), lMat);
          bulb.position.set(0, 2.1, 0);
          const pl = new THREE.PointLight(col, 0.9, 10);
          pl.position.set(0, 2.2, 0.4);
          bg.add(box, bulb, pl);
          bg.position.set(p.x, 0, p.z);
          level2Group.add(bg);
          l2Breakers.push({ x: p.x, z: p.z, seqIdx: idx, color: col, active: false, lMat, light: pl });
        });

        // 10 Scalding Steam Traps placed strictly in open labyrinth corridors
        const steamMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.55 });
        for (let i = 0; i < 16; i++) {
          const p = l2OpenCells[Math.floor(l2OpenCells.length * (0.06 + i * 0.056))];
          const cloud = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.4, 3.6, 10), steamMat.clone());
          cloud.position.set(p.x, 1.8, p.z);
          cloud.visible = false;
          level2Group.add(cloud);
          l2SteamVents.push({ x: p.x, z: p.z, mesh: cloud, phase: i * 1.3, active: false });
        }

        // 10 Hiding Lockers placed strictly in open labyrinth cells
        for (let i = 0; i < 10; i++) {
          const p = l2OpenCells[Math.floor(l2OpenCells.length * (0.06 + i * 0.092))];
          const lg = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.35, 0.9), lockerBodyMat);
          body.position.y = 1.18; lg.add(body);
          lg.position.set(p.x, 0, p.z);
          level2Group.add(lg);
          const lkObj = { x: p.x, z: p.z, mesh: lg };
          l2Lockers.push(lkObj);
        }

        // Heavy Blast Hatch Exit in far open corner
        const exG = new THREE.Group();
        exG.position.set(l2Exit.x, 0, l2Exit.z);
        const hatch = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.1, 0.5), steelMat);
        hatch.position.y = 1.55;
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.25), sMat);
        sBox.position.set(0, 3.35, 0.2);
        const eL = new THREE.PointLight(0xef4444, 1.1, 12);
        eL.position.set(0, 2.9, 1.0);
        exG.add(hatch, sBox, eL);
        level2Group.add(exG);
        // Boiler Pump Stations inside Level 2's carved chambers
        [[6, 6], [Math.floor(ROWS / 2), Math.floor(COLS / 2) - 1]].forEach(([pr, pc], idx) => {
          const pp = cellToW(pr, pc);
          spawnRepoProp(level2Group, 'generator.glb', pp.x, 0, pp.z, 1.45, idx * 1.57, { centerXZ: true });
        });
        l2Exit.signMat = sMat; l2Exit.light = eL;
        spawnRepoProp(exG, 'metal_door.glb', 0, 0, 0.32, 3.1, 0, { centerXZ: true, flatZ: true });
      }

      // =========================================================================
      // BUILD LEVEL ! ("RUN FOR YOUR LIFE!" — 240-METER RED HOSPITAL SPRINT CORRIDOR!)
      // =========================================================================
      const lRunExit = { x: 0, z: -592 };
      const lRunSpawn = new THREE.Vector3(0, 1.65, 0);
      const lRunAlarmLights = [];

      function buildLevelRunForYourLife() {
        lRunAlarmLights.length = 0; lRunBoxes.length = 0;
        const LEN = 616, W = 7.4, H = 4.0;
        // Sterile cracked hospital tile wall texture stained red by emergency lights
        const hc = document.createElement('canvas'); hc.width = 256; hc.height = 256;
        const hg = hc.getContext('2d');
        hg.fillStyle = '#c8c4c0'; hg.fillRect(0, 0, 256, 256);
        hg.fillStyle = '#7f1d1d'; hg.fillRect(0, 120, 256, 22);
        hg.strokeStyle = 'rgba(60, 40, 40, 0.35)'; hg.lineWidth = 2;
        for (let y = 144; y < 256; y += 28) {
          for (let x = 0; x < 256; x += 32) hg.strokeRect(x, y, 32, 28);
        }
        const hWallTex = new THREE.CanvasTexture(hc);
        hWallTex.wrapS = hWallTex.wrapT = THREE.RepeatWrapping;
        hWallTex.repeat.set(42, 1);

        const hWallMat = new THREE.MeshLambertMaterial({ map: hWallTex });
        const hFloorMat = new THREE.MeshLambertMaterial({ color: 0x453b3b });
        const hCeilMat = new THREE.MeshLambertMaterial({ color: 0x332224 });

        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), hFloorMat);
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true;
        fl.position.set(0, 0, -298);
        levelRunGroup.add(fl);

        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), hCeilMat);
        cl.rotation.x = Math.PI / 2;
        cl.position.set(0, H, -298);
        levelRunGroup.add(cl);

        // Long 250m left & right hospital corridor walls
        [-W / 2, W / 2].forEach((wx) => {
          const wall = new THREE.Mesh(new THREE.PlaneGeometry(LEN, H), hWallMat);
          wall.rotation.y = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
          wall.position.set(wx, H / 2, -298);
          levelRunGroup.add(wall);
          lRunBoxes.push({ x: wx + (wx < 0 ? -0.5 : 0.5), z: -298, halfX: 0.55, halfZ: LEN / 2 });
        });
        // Start back wall & far Exit wall
        lRunBoxes.push({ x: 0, z: 8, halfX: W, halfZ: 0.6 });
        lRunBoxes.push({ x: 0, z: -602, halfX: W, halfZ: 0.6 });

        // Flashing Red Emergency Siren Ceiling Beacons every 18m!
        for (let z = -12; z >= -588; z -= 18) {
          const bMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const beacon = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.45), bMat);
          beacon.position.set(0, H - 0.08, z);
          levelRunGroup.add(beacon);
          lRunAlarmLights.push({ mat: bMat, phase: z * 0.15 });
        }

        // Overturned Hospital Gurneys / Medical Obstacles to dodge while sprinting 240m!
        const gurneyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.35 });
        const mattressMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
        for (let z = -18; z >= -578; z -= 13) {
          const side = ((Math.abs(z) / 14) % 3 === 0) ? 0 : (((Math.abs(z) / 14) % 2 === 0) ? -1.85 : 1.85);
          const gg = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 0.95), gurneyMat);
          frame.position.y = 0.45;
          const pad = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.18, 0.92), mattressMat);
          pad.position.y = 0.94;
          gg.add(frame, pad);
          gg.position.set(side, 0, z);
          frame.visible = false; pad.visible = false;
          spawnRepoProp(gg, 'hospital_bed.glb', 0, 0, 0, 1.05, Math.PI / 2, { centerXZ: true });
          levelRunGroup.add(gg);
          lRunBoxes.push({ x: side, z, halfX: 1.08, halfZ: 0.52, isProp: true });
        }

        // Blinding Bright Green EXIT Door at z = -236m!
        const exDoor = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 3.6),
          new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        );
        exDoor.position.set(0, 1.8, -596);
        levelRunGroup.add(exDoor);
        const exL = new THREE.PointLight(0x22c55e, 1.6, 18);
        exL.position.set(0, 2.5, -592);
        levelRunGroup.add(exL);
      }

      // =========================================================================
      // BUILD LEVEL FUN =) (REAL 27x27 = 113m x 113m Winding Party Hall Labyrinth + Balloons + Cakes + 10 Gift Boxes + Yellow Partygoer =))
      // =========================================================================
      const lFunGifts = [];
      const lFunBalloons = [];
      const lFunLockers = [];
      const lFunOpenCells = [];
      const lFunExit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      const lFunSpawn = new THREE.Vector3(0, 1.65, 0);
      const lFunMonsterSpawn = new THREE.Vector3(0, 0, 0);
      const partygoerGroup = new THREE.Group();

      function buildLevelFun() {
        lFunBalloons.length = 0; lFunBoxes.length = 0; lFunGifts.length = 0; lFunLockers.length = 0; lFunOpenCells.length = 0;
        const ROWS = 119, COLS = 119, C = 6.2, H = 4.4;
        const maze = generateWindingMaze(ROWS, COLS, 99771, 0.15);
        function cellToW(r, c) { return { x: (c - COLS / 2 + 0.5) * C, z: (r - ROWS / 2 + 0.5) * C }; }

        const wc = document.createElement('canvas'); wc.width = 512; wc.height = 512;
        const wg = wc.getContext('2d');
        wg.fillStyle = '#e8d58c'; wg.fillRect(0, 0, 512, 512);
        const stripeCols = ['rgba(239,68,68,0.16)', 'rgba(59,130,246,0.16)', 'rgba(34,197,94,0.16)', 'rgba(236,72,153,0.16)'];
        for (let x = 0; x < 512; x += 64) {
          wg.fillStyle = stripeCols[(x / 64) % 4];
          wg.fillRect(x, 0, 32, 512);
        }
        for (let i = 0; i < 240; i++) {
          wg.fillStyle = ['#ef4444', '#3b82f6', '#22c55e', '#ec4899', '#eab308'][i % 5];
          wg.fillRect((i * 83) % 512, (i * 139) % 512, 8, 8);
        }
        wg.fillStyle = 'rgba(185, 28, 28, 0.78)';
        wg.font = 'bold 78px sans-serif';
        wg.fillText('=)', 210, 275);
        const funWallTex = new THREE.CanvasTexture(wc);

        const fc = document.createElement('canvas'); fc.width = 256; fc.height = 256;
        const fg = fc.getContext('2d');
        fg.fillStyle = '#312e81'; fg.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 320; i++) {
          fg.fillStyle = ['#facc15', '#f43f5e', '#38bdf8', '#4ade80'][i % 4];
          fg.fillRect((i * 59) % 256, (i * 97) % 256, 6, 6);
        }
        const funFloorTex = new THREE.CanvasTexture(fc);
        funFloorTex.wrapS = funFloorTex.wrapT = THREE.RepeatWrapping;
        funFloorTex.repeat.set(ROWS, COLS);

        const W = COLS * C, D = ROWS * C;
        const floorF = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: funFloorTex }));
        floorF.rotation.x = -Math.PI / 2; levelFunGroup.add(floorF);
        const ceilF = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ color: 0xfef3c7 }));
        ceilF.rotation.x = Math.PI / 2; ceilF.position.y = H; levelFunGroup.add(ceilF);

        const wallPts = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const p = cellToW(r, c);
            if (maze[r][c] === '#') {
              wallPts.push(p);
              lFunBoxes.push({ x: p.x, z: p.z, halfX: C / 2, halfZ: C / 2 });
            } else {
              lFunOpenCells.push(p);
            }
          }
        }
        const wInst = new THREE.InstancedMesh(new THREE.BoxGeometry(C, H, C), new THREE.MeshLambertMaterial({ map: funWallTex }), wallPts.length);
        const dObj = new THREE.Object3D();
        wallPts.forEach((p, idx) => {
          dObj.position.set(p.x, H / 2, p.z); dObj.updateMatrix();
          wInst.setMatrixAt(idx, dObj.matrix);
        });
        wInst.instanceMatrix.needsUpdate = true;
        levelFunGroup.add(wInst);

        const spF = cellToW(1, 1);
        lFunSpawn.set(spF.x, 1.65, spF.z);
        const exF = pickRandomFarExitCell(lFunOpenCells, lFunSpawn);
        lFunExit.x = exF.x; lFunExit.z = exF.z;
        const midF = lFunOpenCells[Math.floor(lFunOpenCells.length * 0.55)];
        lFunMonsterSpawn.set(midF.x, 0, midF.z);

        // Floating Helium Balloons placed strictly inside open labyrinth corridors
        const balCols = [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e, 0xec4899, 0xa855f7];
        const strMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        for (let i = 0; i < 36; i++) {
          const p = lFunOpenCells[Math.floor(lFunOpenCells.length * (0.025 + i * 0.026)) % lFunOpenCells.length];
          const bg = new THREE.Group();
          const bal = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshStandardMaterial({ color: balCols[i % 6], roughness: 0.25 }));
          bal.scale.set(0.88, 1.15, 0.88);
          const str = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.5, 4), strMat);
          str.position.y = -0.95; bg.add(bal, str);
          bg.position.set(p.x, 3.25 + (i % 3) * 0.16, p.z);
          levelFunGroup.add(bg);
          lFunBalloons.push({ mesh: bg, baseY: bg.position.y, phase: i * 0.9 });
        }

        // 10 Wrapped Gift Boxes (6 REAL Tickets + 4 FAKE Traps) strictly in open maze corridors!
        for (let i = 0; i < 14; i++) {
          const p = lFunOpenCells[Math.floor(lFunOpenCells.length * (0.06 + i * 0.064))];
          const isTrap = (i === 1 || i === 3 || i === 6 || i === 8 || i === 10 || i === 12);
          const gg = new THREE.Group();
          const boxCol = isTrap ? 0xe11d48 : [0x2563eb, 0x16a34a, 0x9333ea, 0xd97706][i % 4];
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), new THREE.MeshStandardMaterial({ color: boxCol, roughness: 0.4 }));
          box.position.y = 0.48;
          const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          rib1.position.y = 0.48;
          const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.98, 0.98), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          rib2.position.y = 0.48;
          gg.add(box, rib1, rib2);
          gg.position.set(p.x, 0, p.z);
          levelFunGroup.add(gg);
          lFunGifts.push({ x: p.x, z: p.z, isTrap, opened: false, mesh: gg });
        }

        // 8 Hiding Lockers strictly in open labyrinth cells
        for (let i = 0; i < 8; i++) {
          const p = lFunOpenCells[Math.floor(lFunOpenCells.length * (0.05 + i * 0.115))];
          const lg = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.35, 0.9), lockerBodyMat);
          body.position.y = 1.18; lg.add(body);
          lg.position.set(p.x, 0, p.z);
          levelFunGroup.add(lg);
          lFunLockers.push({ x: p.x, z: p.z, mesh: lg });
        }

        // Dedicated Tall Yellow Leathery "PARTYGOER =)" 3D Entity!
        const pgSkin = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.72 });
        const pgBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 1.55, 10), pgSkin);
        pgBody.position.y = 1.35; partygoerGroup.add(pgBody);
        [-0.16, 0.16].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 8), pgSkin);
          leg.position.set(lx, 0.42, 0); partygoerGroup.add(leg);
        });
        [-0.42, 0.42].forEach((ax) => {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 1.35, 8), pgSkin);
          arm.position.set(ax, 1.35, 0.22); arm.rotation.x = -0.45; partygoerGroup.add(arm);
        });
        const fc2 = document.createElement('canvas'); fc2.width = 256; fc2.height = 256;
        const fg2 = fc2.getContext('2d');
        fg2.fillStyle = '#eab308'; fg2.fillRect(0, 0, 256, 256);
        fg2.strokeStyle = '#991b1b'; fg2.lineWidth = 18; fg2.lineCap = 'round';
        fg2.fillStyle = '#991b1b';
        fg2.beginPath(); fg2.arc(92, 95, 16, 0, Math.PI * 2); fg2.fill();
        fg2.beginPath(); fg2.arc(164, 95, 16, 0, Math.PI * 2); fg2.fill();
        fg2.beginPath(); fg2.arc(128, 128, 66, 0.15 * Math.PI, 0.85 * Math.PI); fg2.stroke();
        const pgHeadTex = new THREE.CanvasTexture(fc2);
        const pgHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), new THREE.MeshStandardMaterial({ map: pgHeadTex, roughness: 0.65 }));
        pgHead.position.set(0, 2.38, 0); pgHead.rotation.y = -Math.PI / 2;
        partygoerGroup.add(pgHead);
        [[6, 6], [6, COLS - 8]].forEach(([tr, tc]) => {
          const tp = cellToW(tr, tc);
          const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.85, 1.4), new THREE.MeshLambertMaterial({ color: 0xf472b6 }));
          tbl.position.set(tp.x, 0.425, tp.z);
          levelFunGroup.add(tbl);
          lFunBoxes.push({ x: tp.x, z: tp.z, halfX: 1.65, halfZ: 0.75, isProp: true });
        });
        partygoerGroup.position.copy(lFunMonsterSpawn);
        levelFunGroup.add(partygoerGroup);
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'partygoer.glb', (gltf) => {
            const pm = gltf.scene;
            stripGltfLights(pm);
            pm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(pm, 2.35);
            while (partygoerGroup.children.length > 0) partygoerGroup.remove(partygoerGroup.children[0]);
            partygoerGroup.add(pm);
            partygoerLoaded = true;
            if (gltf.animations && gltf.animations.length > 0) {
              const mx = new THREE.AnimationMixer(pm);
              const act = mx.clipAction(gltf.animations[0]);
              act.play();
              activeMonsterMixers.push({ mixer: mx, walkAct: act, runAct: act, current: 'walk', walkRate: 1.0, chaseRate: 1.4 });
            }
          }, undefined, () => {});
        }

        // Party Exit Door placed strictly inside far open corner cell!
        const exG = new THREE.Group();
        exG.position.set(lFunExit.x, 0, lFunExit.z);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.1, 0.45), sMat);
        door.position.y = 1.55;
        const eL = new THREE.PointLight(0xef4444, 1.2, 12);
        eL.position.set(0, 2.8, 0.9);
        exG.add(door, eL);
        levelFunGroup.add(exG);
        lFunExit.signMat = sMat; lFunExit.light = eL;
      }

      // ============================================================
      // LEVEL 94 — DREAMCORE ("ETERNAL SUBURBIA"): 500m x 500m REAL 3D
      // ROLLING HILLS, POINTED WHITE PICKET FENCES, REALISTIC GABLE HOUSES,
      // PAINTED CLOUD SKY DOME, SUN DIRECTIONAL SHADING & REAL .GLB INTERIORS
      // ============================================================
      const l94Houses = [];
      const l94TrapDoors = [];
      const l94Orbs = [];
      const l94Eyes = [];
      const l94Clouds = [];
      const l94SirenPoles = [];
      const l94Exit = { x: 0, z: -205, unlocked: true, portalMat: null, ringMat: null, light: null, beam: null };
      const l94Spawn = new THREE.Vector3(0, 1.65, 188);
      const l94MonsterSpawn = new THREE.Vector3(-85, 0, 85);
      let l94SunMesh = null;
      let l94CastleGroup = null;
      let l94SkyDome = null;
      let l94SunDirLight = null;
      const animationGroup = new THREE.Group();
      const animLimbs = { lLeg: null, rLeg: null, lArm: null, rArm: null, head: null };

      // Smooth 3D Rolling Hills height function (Eternal Suburbia)
      function getDreamHillY(x, z) {
        const h1 = Math.sin(x * 0.021) * Math.cos(z * 0.021) * 7.2;
        const h2 = Math.sin(x * 0.048 + 1.3) * Math.sin(z * 0.042 - 0.6) * 2.8;
        const h3 = Math.cos((x + z) * 0.015) * 2.2;
        return h1 + h2 + h3;
      }

      function makeDreamGrassTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const g = c.getContext('2d');
        // Realistic muted sun-baked Eternal Suburbia olive-tan meadow grass
        g.fillStyle = '#7c8456'; g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 6500; i++) {
          const x = Math.random() * 512, y = Math.random() * 512;
          const r = Math.random();
          g.fillStyle = r < 0.35 ? 'rgba(155,160,112,0.34)' : (r < 0.7 ? 'rgba(84,92,56,0.34)' : 'rgba(130,122,82,0.28)');
          g.fillRect(x, y, 2 + Math.random() * 4, 3 + Math.random() * 7);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(42, 42);
        return tex;
      }

      function makeClapboardTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#e5dfd0'; g.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 16) {
          g.fillStyle = '#ebe6d8'; g.fillRect(0, y, 256, 13);
          g.fillStyle = '#c4bba7'; g.fillRect(0, y + 13, 256, 3);
        }
        for (let i = 0; i < 900; i++) {
          g.fillStyle = 'rgba(80,72,58,0.06)';
          g.fillRect(Math.random() * 256, Math.random() * 256, 3, 2);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
      }

      function makeShingleRoofTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#3d2e24'; g.fillRect(0, 0, 256, 256);
        for (let row = 0; row < 16; row++) {
          const y = row * 16;
          const off = (row % 2) * 16;
          for (let col = -1; col < 9; col++) {
            const v = 50 + Math.floor(Math.random() * 22);
            g.fillStyle = 'rgb(' + (v + 12) + ',' + v + ',' + (v - 8) + ')';
            g.fillRect(col * 32 + off + 1, y + 1, 30, 14);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        return tex;
      }

      function makeSashWindowTex() {
        const c = document.createElement('canvas'); c.width = 128; c.height = 192;
        const g = c.getContext('2d');
        g.fillStyle = '#e8e2d5'; g.fillRect(0, 0, 128, 192);
        g.fillStyle = '#1b2026'; g.fillRect(10, 10, 108, 172);
        // Subtle sky reflection gradient on glass
        const gr = g.createLinearGradient(0, 10, 0, 182);
        gr.addColorStop(0, 'rgba(130,165,195,0.28)'); gr.addColorStop(1, 'rgba(15,20,28,0.1)');
        g.fillStyle = gr; g.fillRect(10, 10, 108, 172);
        // White window mullions
        g.fillStyle = '#ded8c8';
        g.fillRect(60, 10, 8, 172);
        g.fillRect(10, 92, 108, 9);
        return new THREE.CanvasTexture(c);
      }

      function makeDreamSkyDomeTex() {
        const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
        const g = c.getContext('2d');
        const grad = g.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, '#1c4688');
        grad.addColorStop(0.28, '#386db2');
        grad.addColorStop(0.46, '#7ba9d6');
        grad.addColorStop(0.55, '#c6d8e8');
        grad.addColorStop(1.0, '#9aa57d');
        g.fillStyle = grad; g.fillRect(0, 0, 1024, 512);

        // Soft layered photorealistic cumulus clouds around upper horizon
        for (let i = 0; i < 42; i++) {
          const cx = Math.random() * 1024;
          const cy = 110 + Math.random() * 135;
          const puffs = 5 + Math.floor(Math.random() * 6);
          for (let p = 0; p < puffs; p++) {
            const px = cx + (p - puffs / 2) * (14 + Math.random() * 12);
            const py = cy + (Math.random() - 0.5) * 18;
            const rad = 18 + Math.random() * 28;
            // Cool cloud underside shadow
            const cg = g.createRadialGradient(px, py - rad * 0.2, rad * 0.1, px, py, rad);
            cg.addColorStop(0, 'rgba(252,253,255,0.92)');
            cg.addColorStop(0.55, 'rgba(225,233,242,0.72)');
            cg.addColorStop(1, 'rgba(180,196,214,0)');
            g.fillStyle = cg;
            g.beginPath(); g.arc(px, py, rad, 0, Math.PI * 2); g.fill();
          }
        }
        return new THREE.CanvasTexture(c);
      }

      function makeCheckerRugTex(c1, c2) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
          g.fillStyle = (x + y) % 2 === 0 ? c1 : c2;
          g.fillRect(x * 32, y * 32, 32, 32);
        }
        return new THREE.CanvasTexture(c);
      }

      function makeHouseInteriorWallpaperTex(baseHex, stripeHex) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = baseHex; g.fillRect(0, 0, 256, 256);
        g.fillStyle = stripeHex;
        for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 10, 256);
        g.fillStyle = '#c8b698'; g.fillRect(0, 198, 256, 58);
        g.fillStyle = '#998262'; g.fillRect(0, 196, 256, 4);
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 1);
        return tex;
      }

      function buildLevel94() {
        l94Boxes.length = 0; l94Houses.length = 0; l94Orbs.length = 0; l94SirenPoles.length = 0; l94TrapDoors.length = 0;
        // Warm Sunlight DirectionalLight for realistic 3D hill & house shading!
        l94SunDirLight = new THREE.DirectionalLight(0xfff5e0, 1.05);
        l94SunDirLight.position.set(110, 140, -160);
        level94Group.add(l94SunDirLight);

        // Photorealistic Painted Sky Dome with Cumulus Clouds
        const skyGeo = new THREE.SphereGeometry(355, 32, 20);
        const skyMat = new THREE.MeshBasicMaterial({ map: makeDreamSkyDomeTex(), side: THREE.BackSide, fog: false });
        l94SkyDome = new THREE.Mesh(skyGeo, skyMat);
        level94Group.add(l94SkyDome);

        // Bright Sun Disc in the Sky
        l94SunMesh = new THREE.Mesh(
          new THREE.SphereGeometry(11, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfffce8, fog: false })
        );
        l94SunMesh.position.set(110, 130, -210);
        level94Group.add(l94SunMesh);

        // REAL 3D Rolling Grass Hills Mesh (540m x 540m, 96x96 segments)
        const hillGeo = new THREE.PlaneGeometry(540, 540, 96, 96);
        hillGeo.rotateX(-Math.PI / 2);
        const posAttr = hillGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vz = posAttr.getZ(i);
          posAttr.setY(i, getDreamHillY(vx, vz));
        }
        hillGeo.computeVertexNormals();
        const ground = new THREE.Mesh(
          hillGeo,
          new THREE.MeshLambertMaterial({ map: makeDreamGrassTex() })
        );
        level94Group.add(ground);

        // Outer 500m x 500m invisible boundary boxes
        const BOUND = 248;
        l94Boxes.push({ x: 0, z: -BOUND, halfX: BOUND + 2, halfZ: 1.5 });
        l94Boxes.push({ x: 0, z: BOUND, halfX: BOUND + 2, halfZ: 1.5 });
        l94Boxes.push({ x: -BOUND, z: 0, halfX: 1.5, halfZ: BOUND + 2 });
        l94Boxes.push({ x: BOUND, z: 0, halfX: 1.5, halfZ: BOUND + 2 });

        // REAL POINTED WHITE PICKET FENCES winding over the rolling hills (InstancedMesh!)
        const fenceMat = new THREE.MeshLambertMaterial({ color: 0xece8da });
        const picketPositions = [];
        const railPositions = [];

        function addHillPicketLine(x1, z1, x2, z2, spacing = 0.72, addCollider = true) {
          const dx = x2 - x1, dz = z2 - z1;
          const dist = Math.hypot(dx, dz);
          const ang = Math.atan2(dx, dz);
          const steps = Math.max(2, Math.floor(dist / spacing));
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const pz = z1 + dz * t;
            const py = getDreamHillY(px, pz);
            picketPositions.push({ x: px, y: py, z: pz, ang });
          }
          // Horizontal rails every 4.2m
          const rSteps = Math.max(1, Math.floor(dist / 4.2));
          for (let i = 0; i < rSteps; i++) {
            const t1 = i / rSteps, t2 = (i + 1) / rSteps;
            const mx = x1 + dx * ((t1 + t2) * 0.5);
            const mz = z1 + dz * ((t1 + t2) * 0.5);
            const y1 = getDreamHillY(x1 + dx * t1, z1 + dz * t1);
            const y2 = getDreamHillY(x1 + dx * t2, z1 + dz * t2);
            const segLen = dist / rSteps;
            railPositions.push({ x: mx, y: (y1 + y2) * 0.5, z: mz, ang, len: segLen, slope: Math.atan2(y2 - y1, segLen) });
          }
          if (addCollider) {
            const isHoriz = Math.abs(dx) > Math.abs(dz);
            l94Boxes.push({
              x: (x1 + x2) * 0.5, z: (z1 + z2) * 0.5,
              halfX: isHoriz ? Math.abs(dx) * 0.5 + 0.35 : 0.45,
              halfZ: isHoriz ? 0.45 : Math.abs(dz) * 0.5 + 0.35
            });
          }
        }

        // Winding white picket fence corridors across the rolling hills (iconic Eternal Suburbia!)
        addHillPicketLine(-8, 198, -8, 128, 0.78, true);
        addHillPicketLine(8, 198, 8, 128, 0.78, true);
        addHillPicketLine(-8, 128, -90, 128, 0.85, true);
        addHillPicketLine(8, 128, 90, 128, 0.85, true);
        addHillPicketLine(-90, 128, -90, 20, 0.9, true);
        addHillPicketLine(90, 128, 90, 20, 0.9, true);
        addHillPicketLine(-160, 62, -45, 62, 0.9, true);
        addHillPicketLine(45, 62, 160, 62, 0.9, true);
        addHillPicketLine(-130, -25, -25, -25, 0.9, true);
        addHillPicketLine(25, -25, 130, -25, 0.9, true);
        addHillPicketLine(-75, -110, 75, -110, 0.9, true);
        addHillPicketLine(-15, -155, -15, -215, 0.85, true);
        addHillPicketLine(15, -155, 15, -215, 0.85, true);

        // Pointed Picket Geometry (extruded pointed wooden slat)
        const pShape = new THREE.Shape();
        pShape.moveTo(-0.16, 0); pShape.lineTo(0.16, 0);
        pShape.lineTo(0.16, 1.38); pShape.lineTo(0, 1.72); pShape.lineTo(-0.16, 1.38); pShape.closePath();
        const picketGeo = new THREE.ExtrudeGeometry(pShape, { depth: 0.08, bevelEnabled: false });
        picketGeo.translate(0, 0, -0.04);

        const picketInst = new THREE.InstancedMesh(picketGeo, fenceMat, picketPositions.length);
        const pd = new THREE.Object3D();
        picketPositions.forEach((p, i) => {
          pd.position.set(p.x, p.y - 0.15, p.z);
          pd.rotation.set(0, p.ang + Math.PI / 2, 0);
          pd.scale.set(1, 1, 1);
          pd.updateMatrix();
          picketInst.setMatrixAt(i, pd.matrix);
        });
        level94Group.add(picketInst);

        // Horizontal Fence Rails (upper & lower rails)
        const railGeo = new THREE.BoxGeometry(0.08, 0.12, 1.0);
        const railInst = new THREE.InstancedMesh(railGeo, fenceMat, railPositions.length * 2);
        let rIdx = 0;
        railPositions.forEach((rp) => {
          [0.45, 1.15].forEach((ry) => {
            pd.position.set(rp.x, rp.y + ry, rp.z);
            pd.rotation.set(-rp.slope, rp.ang, 0);
            pd.scale.set(1, 1, rp.len + 0.1);
            pd.updateMatrix();
            railInst.setMatrixAt(rIdx++, pd.matrix);
          });
        });
        level94Group.add(railInst);

        // Shared Realistic Suburban House Materials
        const clapMat = new THREE.MeshLambertMaterial({ map: makeClapboardTex() });
        const roofMat = new THREE.MeshLambertMaterial({ map: makeShingleRoofTex() });
        const brickFoundMat = new THREE.MeshLambertMaterial({ color: 0x6e5a4d });
        const winSashMat = new THREE.MeshBasicMaterial({ map: makeSashWindowTex() });
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x6b4423 });
        const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x3b2312 });
        const ceilingMat = new THREE.MeshLambertMaterial({ color: 0xf4efe2 });
        const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
        const tvScreenMat = new THREE.MeshBasicMaterial({ color: 0x8ecae6 });
        const wpTex = makeHouseInteriorWallpaperTex('#efe9d8', '#e2d9c2');
        const intWallMat = new THREE.MeshLambertMaterial({ map: wpTex });
        const rugTex = makeCheckerRugTex('#d6ccb8', '#8c7a62');

        // Helper: Real Architectural Triangular Gable Roof (matches Screenshot 3!)
        function buildGableRoof(hw, hd, hh, roofH) {
          const rg = new THREE.Group();
          const gableShape = new THREE.Shape();
          gableShape.moveTo(-hw / 2, 0); gableShape.lineTo(hw / 2, 0); gableShape.lineTo(0, roofH); gableShape.closePath();
          const gFront = new THREE.Mesh(new THREE.ShapeGeometry(gableShape), clapMat);
          gFront.position.set(0, hh, hd / 2 + 0.02); rg.add(gFront);
          const gBack = new THREE.Mesh(new THREE.ShapeGeometry(gableShape), clapMat);
          gBack.rotation.y = Math.PI; gBack.position.set(0, hh, -hd / 2 - 0.02); rg.add(gBack);

          const slopeLen = Math.hypot(hw / 2 + 0.55, roofH + 0.25);
          const slopeAng = Math.atan2(roofH, hw / 2);
          [-1, 1].forEach((side) => {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.26, hd + 1.1), roofMat);
            slab.position.set(side * (hw / 4 + 0.12), hh + roofH / 2 + 0.05, 0);
            slab.rotation.z = -side * slopeAng;
            rg.add(slab);
          });
          // Brick chimney
          const chim = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.4, 1.1), brickFoundMat);
          chim.position.set(hw * 0.24, hh + roofH * 0.72, -hd * 0.18);
          rg.add(chim);
          return rg;
        }

        // 16 Enterable, Fully-Furnished Cream/Off-White Eternal Suburbia Houses!
        const houseCoords = [
          [-38, 148], [38, 148], [-125, 138], [125, 138],
          [-42, 48],  [42, 48],  [-138, 42],  [138, 42],
          [-45, -48], [45, -48], [-135, -52], [135, -52],
          [-45, -142],[45, -142],[-132, -138],[132, -138]
        ];

        houseCoords.forEach(([hx, hz], hIdx) => {
          const hy = getDreamHillY(hx, hz);
          const hw = 10.6, hd = 11.4, hh = 4.6, wt = 0.36;
          const hg = new THREE.Group();
          hg.position.set(hx, hy, hz);

          // Deep Brick Foundation Skirt so house sits solidly on rolling hill slopes!
          const found = new THREE.Mesh(new THREE.BoxGeometry(hw + 0.3, 4.5, hd + 0.3), brickFoundMat);
          found.position.y = -2.2; hg.add(found);

          // Interior Hardwood Floor + Rug + Ceiling
          const floorM = new THREE.Mesh(new THREE.PlaneGeometry(hw - 0.3, hd - 0.3), new THREE.MeshLambertMaterial({ color: 0x9c7c58 }));
          floorM.rotation.x = -Math.PI / 2; floorM.position.y = 0.08; hg.add(floorM);

          const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 4.2), new THREE.MeshLambertMaterial({ map: rugTex }));
          rug.rotation.x = -Math.PI / 2; rug.position.set(-1.5, 0.11, 2.0); hg.add(rug);

          const ceilM = new THREE.Mesh(new THREE.PlaneGeometry(hw - 0.2, hd - 0.2), ceilingMat);
          ceilM.rotation.x = Math.PI / 2; ceilM.position.y = hh - 0.05; hg.add(ceilM);

          // Warm Interior Ceiling Fixtures
          [-1.8, 2.0].forEach((lx) => {
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), lampGlowMat);
            bulb.position.set(lx, hh - 0.26, lx < 0 ? 2.0 : -2.5); hg.add(bulb);
          });

          // Exterior Off-White Clapboard Walls + 2.8m Front Doorway
          const backW = new THREE.Mesh(new THREE.BoxGeometry(hw, hh, wt), clapMat);
          backW.position.set(0, hh / 2, -hd / 2); hg.add(backW);
          l94Boxes.push({ x: hx, z: hz - hd / 2, halfX: hw / 2, halfZ: wt / 2 + 0.12 });

          const leftW = new THREE.Mesh(new THREE.BoxGeometry(wt, hh, hd), clapMat);
          leftW.position.set(-hw / 2, hh / 2, 0); hg.add(leftW);
          l94Boxes.push({ x: hx - hw / 2, z: hz, halfX: wt / 2 + 0.12, halfZ: hd / 2 });

          const rightW = new THREE.Mesh(new THREE.BoxGeometry(wt, hh, hd), clapMat);
          rightW.position.set(hw / 2, hh / 2, 0); hg.add(rightW);
          l94Boxes.push({ x: hx + hw / 2, z: hz, halfX: wt / 2 + 0.12, halfZ: hd / 2 });

          const sideW = (hw - 2.8) / 2;
          const fLeft = new THREE.Mesh(new THREE.BoxGeometry(sideW, hh, wt), clapMat);
          fLeft.position.set(-(hw / 2 - sideW / 2), hh / 2, hd / 2); hg.add(fLeft);
          l94Boxes.push({ x: hx - (hw / 2 - sideW / 2), z: hz + hd / 2, halfX: sideW / 2, halfZ: wt / 2 + 0.12 });

          const fRight = new THREE.Mesh(new THREE.BoxGeometry(sideW, hh, wt), clapMat);
          fRight.position.set((hw / 2 - sideW / 2), hh / 2, hd / 2); hg.add(fRight);
          l94Boxes.push({ x: hx + (hw / 2 - sideW / 2), z: hz + hd / 2, halfX: sideW / 2, halfZ: wt / 2 + 0.12 });

          const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.35, wt), clapMat);
          lintel.position.set(0, hh - 0.68, hd / 2); hg.add(lintel);

          // Interior Wallpaper Partition dividing Living Room & Bedroom
          const partL = new THREE.Mesh(new THREE.BoxGeometry(5.8, hh - 0.1, 0.24), intWallMat);
          partL.position.set(-2.2, hh / 2, -0.5); hg.add(partL);
          l94Boxes.push({ x: hx - 2.2, z: hz - 0.5, halfX: 2.9, halfZ: 0.22 });

          // Realistic Dark-Paned Sash Windows (front & sides) + Real Gable Roof
          [-3.2, 3.2].forEach((wx) => {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 2.05), winSashMat);
            win.position.set(wx, 2.35, hd / 2 + 0.21); hg.add(win);
          });
          hg.add(buildGableRoof(hw, hd, hh, 3.6));

          // Vintage CRT TV + Retro Bed + Real 3D .glb Furniture inside!
          const tvCab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 1.6), darkWoodMat);
          tvCab.position.set(4.1, 0.42, 2.2); hg.add(tvCab);
          const tvBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.78, 0.95), woodMat);
          tvBox.position.set(4.1, 1.18, 2.2); hg.add(tvBox);
          const tvScr = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.58), tvScreenMat);
          tvScr.rotation.y = -Math.PI / 2; tvScr.position.set(3.66, 1.2, 2.2); hg.add(tvScr);

          const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.46, 1.9), woodMat);
          bedBase.position.set(-3.1, 0.3, -3.6); hg.add(bedBase);
          const bedMatt = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.28, 1.75), new THREE.MeshLambertMaterial({ color: 0xcbd5e1 }));
          bedMatt.position.set(-3.1, 0.62, -3.6); hg.add(bedMatt);
          const ward = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 1.9), darkWoodMat);
          ward.position.set(4.1, 1.45, -3.8); hg.add(ward);

          // Spawn real internet 3D .glb furniture inside the nearest/featured cottages!
          if (hIdx < 8) {
            spawnGltfProp(level94Group, 'GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb', hx - 3.8, hy + 0.08, hz + 2.0, 1.05, Math.PI / 2);
            spawnGltfProp(level94Group, 'SheenChair/glTF-Binary/SheenChair.glb', hx + 0.8, hy + 0.08, hz - 3.4, 0.95, Math.PI);
            spawnGltfProp(level94Group, 'Lantern/glTF-Binary/Lantern.glb', hx - 2.0, hy + 0.08, hz + 3.8, 0.65, 0);
            if (hIdx % 2 === 0) spawnGltfProp(level94Group, 'CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb', hx + 4.1, hy + 0.08, hz - 1.5, 2.0, -Math.PI / 2);
          }

          // Subtle Warm Porch Light above Doorway (safe house indicator)
          const porch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
          porch.position.set(0, 3.55, hd / 2 + 0.25); hg.add(porch);

          level94Group.add(hg);
          l94Houses.push({ x: hx, z: hz, halfX: hw / 2 - 0.45, halfZ: hd / 2 - 0.45 });
          // Interior wall door.glb inside every house — some warp into a labyrinth when opened!
          const dzWall = hz - hd / 2 + 0.35;
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('door.glb', hg, { x: 0, y: 0.08, z: -hd / 2 + 0.32, rotY: 0, targetH: 2.65, flatZ: true });
          }
          const warpTargets = [0, 2, 6, 'mirror'];
          const isWarp = (hIdx % 2 === 1);
          l94TrapDoors.push({ x: hx, z: dzWall, isWarp, targetLvl: warpTargets[hIdx % warpTargets.length] });
        });

        // Sprawling 22 extra real house.glb cottages across all Dreamcore hills (total 32 real GLB houses!)
        [
          [-145, 145], [145, 145], [-145, -145], [145, -145],
          [-110, 40], [110, -40], [0, -110],
          [-75, 140], [75, 138], [-82, 92], [84, 88],
          [-68, -28], [72, -32], [-125, -75], [128, -72],
          [-55, -125], [58, -128], [-165, 10], [165, 15],
          [-95, -155], [95, -158], [0, 88]
        ].forEach(([dx, dz], idx) => {
          const dy = getDreamHillY(dx, dz);
          spawnRepoProp(level94Group, 'house.glb', dx, dy - 0.2, dz, 7.6, idx * 0.9, { centerXZ: true });

          if (typeof l94Houses !== 'undefined') l94Houses.push({ x: dx, z: dz, half: 4.6 });
        });

        // 3 Tall Rustic Steel-Frame Water Towers perched on Distant Hills (just like Screenshot 3!)
        const steelMat = new THREE.MeshLambertMaterial({ color: 0x5c6470 });
        const tankMat = new THREE.MeshLambertMaterial({ color: 0x9aa3ad });
        [[65, -158], [-155, -65], [162, 105]].forEach(([wx, wz]) => {
          const wy = getDreamHillY(wx, wz);
          const wtG = new THREE.Group(); wtG.position.set(wx, wy - 1.5, wz);
          [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 24, 6), steelMat);
            leg.position.set(lx, 12, lz); wtG.add(leg);
          });
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 4.8, 6.2, 14), tankMat);
          tank.position.y = 25.5; wtG.add(tank);
          const tRoof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 3.0, 14), steelMat);
          tRoof.position.y = 30.1; wtG.add(tRoof);
          level94Group.add(wtG);
        });

        // Wooden Utility / Siren Poles along the rolling hills
        const uPoleMat = new THREE.MeshLambertMaterial({ color: 0x4b382a });
        [[-14, 155], [14, 105], [-14, 40], [14, -20], [-14, -85], [14, -145]].forEach(([px, pz]) => {
          const py = getDreamHillY(px, pz);
          const pg = new THREE.Group(); pg.position.set(px, py - 0.5, pz);
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 10.5, 8), uPoleMat);
          pole.position.y = 5.25; pg.add(pole);
          const cross = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.18), uPoleMat);
          cross.position.y = 9.4; pg.add(cross);
          level94Group.add(pg);
          l94SirenPoles.push(pg);
        });

        // Giant Floating Castle atop Transparent Mountain far in the northern sky
        l94CastleGroup = new THREE.Group();
        l94CastleGroup.position.set(0, 78, -265);
        l94CastleGroup.scale.set(2.1, 2.1, 2.1);
        const mtn = new THREE.Mesh(
          new THREE.ConeGeometry(22, 24, 6),
          new THREE.MeshBasicMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.32 })
        );
        mtn.rotation.x = Math.PI; mtn.position.y = -12; l94CastleGroup.add(mtn);
        const keep = new THREE.Mesh(new THREE.BoxGeometry(16, 11, 14), clapMat);
        keep.position.y = 5.5; l94CastleGroup.add(keep);
        [[-8, -7], [8, -7], [-8, 7], [8, 7], [0, 0]].forEach(([tx, tz], idx) => {
          const th = idx === 4 ? 19 : 14;
          const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, th, 10), clapMat);
          tw.position.set(tx, th / 2, tz); l94CastleGroup.add(tw);
          const sp = new THREE.Mesh(new THREE.ConeGeometry(3.0, 6.2, 10), roofMat);
          sp.position.set(tx, th + 3.0, tz); l94CastleGroup.add(sp);
        });
        level94Group.add(l94CastleGroup);

        // 10 Collectible Dream Memories (placed at exact rolling-hill height inside cottages & hills!)
        const orbSpots = [
          [-38, 145], [38, 145], [-138, 39], [138, 39],
          [-45, -51], [45, -51], [-132, -141], [132, -141],
          [0, 12], [65, -145]
        ];
        orbSpots.forEach(([ox, oz], idx) => {
          const oy = getDreamHillY(ox, oz) + 1.4;
          const og = new THREE.Group(); og.position.set(ox, oy, oz);
          const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.45, 0),
            new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x38bdf8 : 0xfde047 })
          );
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.68, 0.06, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          level94Group.add(og);
          if (typeof gltfLoader !== 'undefined') {
            gltfLoader.load(REPO_GLB_BASE + 'crystal.glb', (gltf) => {
              const m = gltf.scene; stripGltfLights(m); m.scale.setScalar(0.55); og.add(m);
            }, undefined, () => {});
          }
          og.visible = false; // Xotira collection removed — pure Dreamcore exploration & night survival
        });

        // Castle Exit Portal (Oq Qasr Darvozasi) perched on North Hill (z = -205)
        // Hide Level 94 Exit randomly INSIDE one of the far Dreamcore houses!
        const farHouses94 = l94Houses.filter((h) => h.halfX !== undefined && Math.hypot(h.x - l94Spawn.x, h.z - l94Spawn.z) >= 65);
        if (farHouses94.length) {
          const chosenH = farHouses94[Math.floor(Math.random() * farHouses94.length)];
          l94Exit.x = chosenH.x;
          l94Exit.z = chosenH.z;
        }
        const exY = getDreamHillY(l94Exit.x, l94Exit.z);
        const exG = new THREE.Group(); exG.position.set(l94Exit.x, exY, l94Exit.z);
        if (typeof loadGlbIntoGroup === 'function') {
          loadGlbIntoGroup('exit_sign.glb', exG, { x: 0, y: 2.95, z: 0.3, rotY: 0, targetH: 0.44 });
        }
        [-2.8, 2.8].forEach((px) => {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 6.6, 10), clapMat);
          p.position.set(px, 3.3, 0); exG.add(p);
        });
        const arch = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.1, 1.3), clapMat);
        arch.position.set(0, 6.5, 0); exG.add(arch);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.72, side: THREE.DoubleSide });
        const portal = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5.8), pMat);
        portal.position.set(0, 2.9, 0); exG.add(portal);
        const rMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const crown = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.16, 8, 20), rMat);
        crown.position.set(0, 7.6, 0); exG.add(crown);
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 3.6, 95, 12, 1, true),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
        );
        beam.position.set(0, 47.5, 0); beam.visible = false; exG.add(beam);
        const eLight = new THREE.PointLight(0xef4444, 1.8, 24);
        eLight.position.set(0, 3.8, 1.8); exG.add(eLight);
        level94Group.add(exG);
        l94Exit.portalMat = pMat; l94Exit.ringMat = rMat; l94Exit.light = eLight; l94Exit.beam = beam;

        // Giant Nightmare Horror Wolf ("Qo'rqinchli Tungi Bo'ri") for Level 94 Night Hunt!
        // Procedural wolf removed — Level 94 uses real wolf.glb directly

        // Place real working 3D house.glb cottages right in the visible Dreamcore village + register as Safe Houses!
        [
          [-26, 158, 0.3], [28, 152, -0.4], [-42, 118, 0.6], [38, 110, -0.5],
          [-24, 72, 0.2], [32, 62, -0.3], [-48, 22, 0.5], [44, 18, -0.6],
          [95, -95, 0.4], [-95, -110, -0.5]
        ].forEach(([hx, hz, ry]) => {
          const hy = getDreamHillY(hx, hz);
          spawnRepoProp(level94Group, 'house.glb', hx, hy - 0.2, hz, 7.5, ry, { centerXZ: true });

          if (typeof l94Houses !== 'undefined') l94Houses.push({ x: hx, z: hz, half: 4.6 });
        });
        l94Spawn.y = getDreamHillY(l94Spawn.x, l94Spawn.z) + 1.65;
        animationGroup.position.copy(l94MonsterSpawn);
        animationGroup.visible = false;
        level94Group.add(animationGroup);
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'wolf.glb', (gltf) => {
            const wm = gltf.scene;
            stripGltfLights(wm);
            wm.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
            window.__zulmatNormalizeRigged(wm, 2.25);
            while (animationGroup.children.length > 0) animationGroup.remove(animationGroup.children[0]);
            animationGroup.add(wm);
            l94WolfLoaded = true;
            if (gltf.animations && gltf.animations.length > 0) {
              const mx = new THREE.AnimationMixer(wm);
              const walkClip = gltf.animations.find((a) => /02_walk|walk/i.test(a.name)) || gltf.animations[0];
              const runClip = gltf.animations.find((a) => /01_run|run/i.test(a.name)) || walkClip;
              const walkAct = mx.clipAction(walkClip);
              const runAct = mx.clipAction(runClip);
              runAct.play();
              activeMonsterMixers.push({ mixer: mx, walkAct, runAct, current: 'run', walkRate: 1.0, chaseRate: 1.3 });
            }
          }, undefined, () => {});
        }
      }

      // ============================================================
      // LEVEL 9223372036854775807 — "THE TRUE FINAL LEVEL"
      // MONOCHROME ENDLESS CONCRETE SPIRAL STAIRCASE + FLOOR 94 VOID JUMP
      // ============================================================
      const L922_FLOORS = 36;
      const L922_FLOOR_H = 4.2;
      const L922_STEPS_PER_FLOOR = 18;
      const L922_R_IN = 2.05;
      const L922_R_OUT = 7.4;
      const l922Plaques = [];
      let l922TargetFloor = 16;

      function makeMonoConcreteTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#5a5e63'; g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 3200; i++) {
          const v = 65 + Math.floor(Math.random() * 55);
          g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
          g.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 3, 2 + Math.random() * 3);
        }
        g.strokeStyle = 'rgba(20,20,22,0.22)'; g.lineWidth = 2;
        for (let y = 0; y < 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function makeFloorPlaqueTex(numStr, isAnomaly) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 160;
        const g = c.getContext('2d');
        g.fillStyle = isAnomaly ? '#e5e7eb' : '#272a2e';
        g.fillRect(0, 0, 256, 160);
        g.strokeStyle = isAnomaly ? '#111827' : '#71717a';
        g.lineWidth = 8; g.strokeRect(8, 8, 240, 144);
        g.fillStyle = isAnomaly ? '#09090b' : '#e4e4e7';
        g.font = 'bold 82px monospace';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(numStr), 128, 86);
        return new THREE.CanvasTexture(c);
      }

      function refreshL922Plaques() {
        l922TargetFloor = 12 + Math.floor(Math.random() * 13); // Floor 12..24
        l922Plaques.forEach((pl) => {
          const isTarget = (pl.floor === l922TargetFloor);
          const label = isTarget ? '94' : String(pl.floor);
          if (pl.mesh.material.map) pl.mesh.material.map.dispose();
          pl.mesh.material.map = makeFloorPlaqueTex(label, isTarget);
          pl.mesh.material.needsUpdate = true;
        });
      }

      function buildLevel922() {
        l922Plaques.length = 0;
        const concTex = makeMonoConcreteTex();
        const concMat = new THREE.MeshLambertMaterial({ map: concTex, color: 0x9ca3af });
        const darkConcMat = new THREE.MeshLambertMaterial({ map: concTex, color: 0x52565c });
        const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.085, side: THREE.DoubleSide, depthWrite: false });
        const totalH = L922_FLOORS * L922_FLOOR_H + 16;

        // Ground Floor 0 Base Platform (with dark central abyss pit below y=0)
        const baseRing = new THREE.Mesh(
          new THREE.RingGeometry(L922_R_IN, L922_R_OUT + 0.4, 32),
          darkConcMat
        );
        baseRing.rotation.x = -Math.PI / 2; baseRing.position.y = 0.02;
        level922Group.add(baseRing);

        // Deep Abyss Void Tube beneath Floor 0
        const abyssTube = new THREE.Mesh(
          new THREE.CylinderGeometry(L922_R_IN, L922_R_IN, 48, 24, 1, true),
          new THREE.MeshBasicMaterial({ color: 0x050608, side: THREE.BackSide })
        );
        abyssTube.position.y = -24;
        level922Group.add(abyssTube);

        // Outer Brutalist Concrete Cylindrical Enclosure Wall
        const outerWall = new THREE.Mesh(
          new THREE.CylinderGeometry(L922_R_OUT + 0.35, L922_R_OUT + 0.35, totalH, 32, 1, true),
          new THREE.MeshLambertMaterial({ map: concTex, color: 0x6b7280, side: THREE.BackSide })
        );
        outerWall.position.y = totalH / 2 - 4;
        level922Group.add(outerWall);

        // Instanced Concrete Spiral Steps + Low Inner Parapet Curbs (super fast 60fps!)
        const totalSteps = L922_FLOORS * L922_STEPS_PER_FLOOR;
        const stepLen = L922_R_OUT - L922_R_IN + 0.3;
        const stepGeo = new THREE.BoxGeometry(stepLen, 0.28, 1.55);
        const stepInst = new THREE.InstancedMesh(stepGeo, concMat, totalSteps);

        const curbGeo = new THREE.BoxGeometry(0.24, 0.62, 1.05);
        const curbInst = new THREE.InstancedMesh(curbGeo, darkConcMat, totalSteps);

        const dummy = new THREE.Object3D();
        const rMid = (L922_R_IN + L922_R_OUT) * 0.5;
        for (let i = 0; i < totalSteps; i++) {
          const frac = i / L922_STEPS_PER_FLOOR;
          const ang = frac * Math.PI * 2;
          const y = frac * L922_FLOOR_H;

          dummy.position.set(Math.cos(ang) * rMid, y - 0.14, Math.sin(ang) * rMid);
          dummy.rotation.set(0, -ang, 0);
          dummy.updateMatrix();
          stepInst.setMatrixAt(i, dummy.matrix);

          // Low inner concrete lip (easy to jump over into the void!)
          dummy.position.set(Math.cos(ang) * (L922_R_IN + 0.08), y + 0.32, Math.sin(ang) * (L922_R_IN + 0.08));
          dummy.rotation.set(0, -ang, 0);
          dummy.updateMatrix();
          curbInst.setMatrixAt(i, dummy.matrix);
        }
        level922Group.add(stepInst);
        level922Group.add(curbInst);

        // Iconic Vertical Slatted Blinding White Windows + Volumetric Light Shafts + Floor Number Plaques
        for (let f = 0; f < L922_FLOORS; f++) {
          const baseY = f * L922_FLOOR_H;
          // 5 vertical bright white light slits on one side of each floor (just like the screenshot!)
          for (let s = -2; s <= 2; s++) {
            const wAng = Math.PI * 0.35 + s * 0.11;
            const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 3.1), windowGlowMat);
            slit.position.set(Math.cos(wAng) * (L922_R_OUT + 0.2), baseY + 2.1, Math.sin(wAng) * (L922_R_OUT + 0.2));
            slit.lookAt(0, baseY + 2.1, 0);
            level922Group.add(slit);
          }
          // Diagonal Volumetric Light Shaft cutting across the concrete spiral stairs
          if (f % 2 === 0) {
            const beam = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 4.2), beamMat);
            beam.position.set(Math.cos(Math.PI * 0.35) * 2.2, baseY + 1.8, Math.sin(Math.PI * 0.35) * 2.2);
            beam.rotation.y = -Math.PI * 0.35 + Math.PI / 2;
            beam.rotation.z = 0.42;
            level922Group.add(beam);
          }
          // Floor Number Plaque mounted clearly on the outer concrete wall
          const pAng = Math.PI * 1.15;
          const pMat = new THREE.MeshBasicMaterial({ map: makeFloorPlaqueTex(String(f), false) });
          const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), pMat);
          plaque.position.set(Math.cos(pAng) * (L922_R_OUT + 0.18), baseY + 2.0, Math.sin(pAng) * (L922_R_OUT + 0.18));
          plaque.lookAt(0, baseY + 2.0, 0);
          level922Group.add(plaque);
          if (f > 0) l922Plaques.push({ floor: f, mesh: plaque });
        }

        // Top Infinite Cap
        const topGlow = new THREE.Mesh(
          new THREE.CircleGeometry(L922_R_OUT + 0.5, 24),
          new THREE.MeshBasicMaterial({ color: 0xe5e7eb, side: THREE.DoubleSide })
        );
        topGlow.rotation.x = Math.PI / 2;
        topGlow.position.y = totalH - 6;
        level922Group.add(topGlow);

        refreshL922Plaques();
      }

      // Reusable real internet 3D .glb prop spawner (strips embedded glTF lights!)
      function spawnGltfProp(parentGroup, relPath, x, y, z, targetH, rotY = 0) {
        if (typeof gltfLoader === 'undefined') return;
        const propBase = REPO_GLB_BASE;
        gltfLoader.load(REPO_GLB_BASE + 'streetlamp.glb', (gltf) => {
          const obj = gltf.scene;
          stripGltfLights(obj);
          const box = new THREE.Box3().setFromObject(obj);
          const sz = new THREE.Vector3(); box.getSize(sz);
          const sc = targetH / Math.max(0.05, sz.y);
          obj.scale.setScalar(sc);
          box.setFromObject(obj);
          obj.position.set(x, y - box.min.y, z);
          obj.rotation.y = rotY;
          parentGroup.add(obj);
        }, undefined, () => {});
      }
      if (window._pendingGltfProps && window._pendingGltfProps.length) {
        window._pendingGltfProps.forEach((a) => spawnGltfProp(...a));
        window._pendingGltfProps.length = 0;
      }

      // ============================================================
      // LEVEL 9 — DARKENED SUBURBS (180m MIDNIGHT NEIGHBORHOOD)
      // ============================================================
      const l9FuseBoxes = [];
      const l9Lamps = [];
      const l9Exit = { x: 0, z: -76, unlocked: true, signMat: null, light: null };
      const l9Spawn = new THREE.Vector3(0, 1.65, 76);
      const l9WatcherGroup = new THREE.Group();
      const l9WatcherPos = new THREE.Vector3(-40, 0, -20);

      function buildLevel9() {
        l9Boxes.length = 0; l9FuseBoxes.length = 0; l9Lamps.length = 0;
        const gnd = new THREE.Mesh(
          new THREE.PlaneGeometry(800, 800),
          new THREE.MeshLambertMaterial({ color: 0x111814 })
        );
        gnd.rotation.x = -Math.PI / 2; level9Group.add(gnd);

        // Outer boundary walls (±90m)
        const bMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
        [[0, -390, 782, 1.5], [0, 390, 782, 1.5], [-390, 0, 1.5, 782], [390, 0, 1.5, 782]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, d), bMat);
          m.position.set(x, 1.6, z); level9Group.add(m);
          l9Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });

        // Wet Midnight Asphalt Streets
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e2430 });
        [-50, 0, 50].forEach((c) => {
          const r1 = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 174), roadMat);
          r1.rotation.x = -Math.PI / 2; r1.position.set(c, 0.03, 0); level9Group.add(r1);
          const r2 = new THREE.Mesh(new THREE.PlaneGeometry(174, 7.2), roadMat);
          r2.rotation.x = -Math.PI / 2; r2.position.set(0, 0.03, c); level9Group.add(r2);
        });

        // 12 Dark Colonial House Silhouettes with eerie dim lit attic windows
        const hMat = new THREE.MeshLambertMaterial({ color: 0x171b26 });
        const rMat = new THREE.MeshLambertMaterial({ color: 0x0f121a });
        const wGlow = new THREE.MeshBasicMaterial({ color: 0x92400e });
        const housePts = [
          [-25, 55], [25, 55], [-70, 55], [70, 55],
          [-25, 12], [25, 12], [-70, 12], [70, 12],
          [-25, -35], [25, -35], [-70, -35], [70, -35]
        ];
        housePts.forEach(([hx, hz]) => {
          const body = new THREE.Mesh(new THREE.BoxGeometry(12, 6.2, 10), hMat);
          body.position.set(hx, 3.1, hz); level9Group.add(body);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(9.2, 3.6, 4), rMat);
          roof.rotation.y = Math.PI / 4; roof.position.set(hx, 8.0, hz); level9Group.add(roof);
          const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 10.2), wGlow);
          win.position.set(hx + 2.5, 4.2, hz); level9Group.add(win);
          l9Boxes.push({ x: hx, z: hz, halfX: 6.2, halfZ: 5.2 });
        });

        // Flickering Amber Sodium Streetlamps
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const lampPts = [[-5, 60], [5, 25], [-5, -15], [5, -55], [-55, 5], [55, -5]];
        lampPts.forEach(([lx, lz], i) => {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.5, 8), poleMat);
          pole.position.set(lx, 3.25, lz); pole.visible = false; level9Group.add(pole);
          spawnRepoProp(level9Group, 'streetlamp.glb', lx, 0, lz, 6.8, i * 1.57, { centerXZ: true });
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
          bulb.position.set(lx, 6.5, lz); level9Group.add(bulb);
          const pl = new THREE.PointLight(0xf59e0b, 1.3, 22);
          pl.position.set(lx, 6.1, lz); level9Group.add(pl);
          l9Lamps.push({ light: pl, bulb, phase: i * 1.9 });
          if (i < 3) spawnGltfProp(level9Group, 'Lantern/glTF-Binary/Lantern.glb', lx + 1.2, 0, lz, 0.9, i);
        });

        // 6 Streetlight Fuse Boxes to Repair
        const fuseCoords = [[-50, 50], [50, 50], [-50, 0], [50, 0], [-50, -50], [50, -50]];
        fuseCoords.forEach(([fx, fz]) => {
          const fg = new THREE.Group(); fg.position.set(fx, 0, fz);
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.5, 0.55), new THREE.MeshLambertMaterial({ color: 0x374151 }));
          box.position.y = 0.75; fg.add(box);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const ind = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lMat);
          ind.position.set(0, 1.62, 0); fg.add(ind);
          level9Group.add(fg);
          l9FuseBoxes.push({ x: fx, z: fz, fixed: false, lMat, mesh: fg });
        });

        // Suburban Subway Gate EXIT (z = -76)
        const exG = new THREE.Group(); exG.position.set(l9Exit.x, 0, l9Exit.z);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.0, 0.8), new THREE.MeshLambertMaterial({ color: 0x334155 }));
        frame.position.y = 2.0; exG.add(frame);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.7, 0.9), sMat);
        sign.position.y = 3.5; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.8, 18); eL.position.set(0, 3.0, 1.5); exG.add(eL);
        level9Group.add(exG);
        l9Exit.signMat = sMat; l9Exit.light = eL;

        // "Neighborhood Watch" Giant Spider-Silhouette Searchlight Entity
        const darkM = new THREE.MeshBasicMaterial({ color: 0x050608 });
        const eyeM = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), darkM);
        body.position.y = 4.6; l9WatcherGroup.add(body);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), eyeM);
        eye.position.set(0, 4.6, 0.95); l9WatcherGroup.add(eye);
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(3.2, 12, 12, 1, true),
          new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
        );
        cone.rotation.x = -Math.PI / 2; cone.position.set(0, 2.5, 6.5); l9WatcherGroup.add(cone);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 5.2, 6), darkM);
          leg.position.set(Math.cos(a) * 1.4, 2.4, Math.sin(a) * 1.4);
          leg.rotation.z = Math.cos(a) * 0.35; leg.rotation.x = Math.sin(a) * 0.35;
          l9WatcherGroup.add(leg);
        }
        l9WatcherGroup.position.copy(l9WatcherPos);
        level9Group.add(l9WatcherGroup);
        [[-10, 48, 0.12], [11, 14, Math.PI - 0.1], [-10, -28, 0.05], [11, -56, Math.PI]].forEach(([cx, cz, ry]) => {
          spawnRepoProp(level9Group, 'car.glb', cx, 0, cz, 1.65, ry, { centerXZ: true });
        });
      }

      // ============================================================
      // LEVEL 10 — THE BUMPER CROP (220m ENDLESS WHEAT FIELDS)
      // ============================================================
      const l10Radios = [];
      const l10Exit = { x: 0, z: -88, unlocked: true, signMat: null, light: null };
      const l10Spawn = new THREE.Vector3(0, 1.65, 92);
      let l10WheatInst = null;

      function buildLevel10() {
        l10Boxes.length = 0; l10Radios.length = 0;
        const gnd = new THREE.Mesh(
          new THREE.PlaneGeometry(800, 800),
          new THREE.MeshLambertMaterial({ color: 0x6b532b })
        );
        gnd.rotation.x = -Math.PI / 2; level10Group.add(gnd);

        // Dirt farm tracks
        const pathMat = new THREE.MeshLambertMaterial({ color: 0x8c6d3f });
        [[0, 0, 5.4, 200], [0, 0, 200, 5.4], [-60, 0, 4.2, 160], [60, 0, 4.2, 160]].forEach(([x, z, w, d]) => {
          const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), pathMat);
          p.rotation.x = -Math.PI / 2; p.position.set(x, 0.03, z); level10Group.add(p);
        });

        // Outer wooden fence boundary (±110m)
        const fMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
        [[0, -110, 222, 1.0], [0, 110, 222, 1.0], [-110, 0, 1.0, 222], [110, 0, 1.0, 222]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, d), fMat);
          m.position.set(x, 0.9, z); level10Group.add(m);
          l10Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });

        // 800 Instanced Golden Wheat Clusters swaying in the breeze!
        const wheatGeo = new THREE.ConeGeometry(1.15, 1.9, 5);
        const wheatMat = new THREE.MeshLambertMaterial({ color: 0xd9a036 });
        l10WheatInst = new THREE.InstancedMesh(wheatGeo, wheatMat, 800);
        const wd = new THREE.Object3D();
        let wCount = 0;
        for (let gx = -98; gx <= 98 && wCount < 800; gx += 7.5) {
          for (let gz = -98; gz <= 98 && wCount < 800; gz += 7.5) {
            if (Math.abs(gx) < 5 || Math.abs(gz) < 5 || Math.abs(gx - 60) < 4 || Math.abs(gx + 60) < 4) continue;
            wd.position.set(gx + (Math.random() - 0.5) * 3, 0.92, gz + (Math.random() - 0.5) * 3);
            wd.scale.set(0.85 + Math.random() * 0.6, 0.8 + Math.random() * 0.45, 0.85 + Math.random() * 0.6);
            wd.rotation.y = Math.random() * Math.PI;
            wd.updateMatrix();
            l10WheatInst.setMatrixAt(wCount++, wd.matrix);
          }
        }
        l10WheatInst.count = wCount;
        level10Group.add(l10WheatInst);

        // 4 Rustic Red Wooden Barns + Real 3D Barn Lamps
        const barnMat = new THREE.MeshLambertMaterial({ color: 0x7f1d1d });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x3f2e21 });
        [[-72, 55], [72, 55], [-72, -55], [72, -55]].forEach(([bx, bz], i) => {
          const b = new THREE.Mesh(new THREE.BoxGeometry(12, 7, 10), barnMat);
          b.position.set(bx, 3.5, bz); b.visible = false; level10Group.add(b);
          const r = new THREE.Mesh(new THREE.ConeGeometry(9.2, 4.2, 4), roofMat);
          r.rotation.y = Math.PI / 4; r.position.set(bx, 9.1, bz); r.visible = false; level10Group.add(r);
          spawnRepoProp(level10Group, 'barn.glb', bx, 0, bz, 9.6, bx < 0 ? Math.PI / 2 : -Math.PI / 2, { centerXZ: true });
          spawnRepoProp(level10Group, 'tractor.glb', bx + (bx < 0 ? 10.5 : -10.5), 0, bz + 4.0, 2.6, i * 1.1, { centerXZ: true });
          l10Boxes.push({ x: bx, z: bz, halfX: 6.2, halfZ: 5.2 });
          spawnGltfProp(level10Group, 'AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb', bx, 4.5, bz + 5.2, 0.9, 0);
        });

        // 5 Old Farm Radio Towers to Tune
        const radCoords = [[-60, 45], [60, 45], [0, 0], [-60, -45], [60, -45]];
        radCoords.forEach(([rx, rz]) => {
          const rg = new THREE.Group(); rg.position.set(rx, 0, rz);
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.28, 7.5, 8), new THREE.MeshLambertMaterial({ color: 0x64748b }));
          mast.position.y = 3.75; rg.add(mast);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
          const top = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), lMat);
          top.position.y = 7.6; rg.add(top);
          level10Group.add(rg);
          spawnGltfProp(level10Group, 'BoomBox/glTF-Binary/BoomBox.glb', rx + 0.65, 0, rz, 0.55, 0);
          l10Radios.push({ x: rx, z: rz, active: false, lMat, mesh: rg });
        });

        // Barn Basement Exit Hatch (z = -88)
        const exG = new THREE.Group(); exG.position.set(l10Exit.x, 0, l10Exit.z);
        const hatch = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 4.2), new THREE.MeshLambertMaterial({ color: 0x451a03 }));
        hatch.position.y = 0.25; exG.add(hatch);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.0, 8), sMat);
        beacon.position.y = 2.5; exG.add(beacon);
        const eL = new THREE.PointLight(0xef4444, 1.5, 18); eL.position.set(0, 3.0, 0); exG.add(eL);
        level10Group.add(exG);
        l10Exit.signMat = sMat; l10Exit.light = eL;
      }

      // ============================================================
      // LEVEL 11 — THE ENDLESS CITY (240m SKYSCRAPER METROPOLIS)
      // ============================================================
      const l11Cards = [];
      const l11Exit = { x: 0, z: -102, unlocked: true, signMat: null, light: null };
      const l11Spawn = new THREE.Vector3(0, 1.65, 102);
      const l11MonsterSpawn = new THREE.Vector3(-42, 0, -24);

      function makeSkyscraperTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 512;
        const g = c.getContext('2d');
        g.fillStyle = '#475569'; g.fillRect(0, 0, 256, 512);
        for (let y = 12; y < 500; y += 28) {
          for (let x = 12; x < 244; x += 28) {
            g.fillStyle = Math.random() > 0.72 ? '#bae6fd' : '#1e293b';
            g.fillRect(x, y, 18, 18);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function buildLevel11() {
        l11Boxes.length = 0; l11Cards.length = 0;
        const gnd = new THREE.Mesh(
          new THREE.PlaneGeometry(800, 800),
          new THREE.MeshLambertMaterial({ color: 0x334155 })
        );
        gnd.rotation.x = -Math.PI / 2; level11Group.add(gnd);

        // Outer City Barricades (±120m)
        const bMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
        [[0, -390, 782, 1.5], [0, 390, 782, 1.5], [-390, 0, 1.5, 782], [390, 0, 1.5, 782]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 4.0, d), bMat);
          m.position.set(x, 2.0, z); level11Group.add(m);
          l11Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });

        // Wide City Avenues
        const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        [-70, 0, 70].forEach((c) => {
          const r1 = new THREE.Mesh(new THREE.PlaneGeometry(11, 236), roadMat);
          r1.rotation.x = -Math.PI / 2; r1.position.set(c, 0.03, 0); level11Group.add(r1);
          const r2 = new THREE.Mesh(new THREE.PlaneGeometry(236, 11), roadMat);
          r2.rotation.x = -Math.PI / 2; r2.position.set(0, 0.03, c); level11Group.add(r2);
        });

        // Real 3D Skyscraper Metropolis: 21 distinct towers from city_buildings.glb + warsaw_tower.glb + london_tower.glb + skyscraper.glb!
        const skyTex = makeSkyscraperTex();
        const bldgCols = [0x94a3b8, 0x64748b, 0x78716c, 0x6b7280];
        const slots = [-98, -35, 35, 98];
        const l11TowerSlots = [];
        let bIdx = 0;
        slots.forEach((bx) => {
          slots.forEach((bz) => {
            if (Math.abs(bx) < 40 && Math.abs(bz) < 40 && bIdx % 3 === 0) { bIdx++; return; }
            const h = 36 + ((bIdx * 17) % 48);
            const w = 22, d = 22;
            const mat = new THREE.MeshLambertMaterial({ map: skyTex, color: bldgCols[bIdx % bldgCols.length] });
            const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
            b.position.set(bx, h / 2, bz); level11Group.add(b);
            l11Boxes.push({ x: bx, z: bz, halfX: w / 2 + 0.3, halfZ: d / 2 + 0.3 });
            l11TowerSlots.push({ bx, bz, h, idx: bIdx, fallbackMesh: b });
            bIdx++;
          });
        });

        // Landmark Hero Skyscrapers (Warsaw Tower & London Tower with Glass Lobby) + Streetlamps
        if (l11TowerSlots.length > 0) {
          const wSlot = l11TowerSlots[0];
          wSlot.fallbackMesh.visible = false;
          spawnRepoProp(level11Group, 'warsaw_tower.glb', wSlot.bx, 0, wSlot.bz, 68, 0, { centerXZ: true });
        }
        if (l11TowerSlots.length > 1) {
          const lSlot = l11TowerSlots[1];
          lSlot.fallbackMesh.visible = false;
          spawnRepoProp(level11Group, 'london_tower.glb', lSlot.bx, 0, lSlot.bz, 64, Math.PI / 2, { centerXZ: true });
        }
        if (l11TowerSlots.length > 2) {
          const sSlot = l11TowerSlots[2];
          sSlot.fallbackMesh.visible = false;
          spawnRepoProp(level11Group, 'skyscraper.glb', sSlot.bx, 0, sSlot.bz, 48, 0, { centerXZ: true });
        }
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'city_buildings.glb', (gltf) => {
            const root = gltf.scene;
            stripGltfLights(root);
            const towers = [];
            root.traverse((o) => {
              if (o.isMesh && !/ground/i.test(o.name) && (!o.parent || !/ground/i.test(o.parent.name))) {
                towers.push(o);
              }
            });
            if (towers.length > 0) {
              for (let i = 3; i < l11TowerSlots.length; i++) {
                const slot = l11TowerSlots[i];
                const srcT = towers[(i - 3) % towers.length];
                const cl = srcT.clone();
                cl.updateMatrixWorld(true);
                const tb = new THREE.Box3().setFromObject(cl);
                const tsz = new THREE.Vector3(); tb.getSize(tsz);
                const maxW = Math.max(tsz.x, tsz.z, 0.1);
                const scXZ = 20.5 / maxW;
                const scY = slot.h / Math.max(0.1, tsz.y);
                cl.scale.set(scXZ, scY, scXZ);
                cl.updateMatrixWorld(true);
                const tb2 = new THREE.Box3().setFromObject(cl);
                const tctr = new THREE.Vector3(); tb2.getCenter(tctr);
                cl.position.set(slot.bx - tctr.x, -tb2.min.y, slot.bz - tctr.z);
                slot.fallbackMesh.visible = false;
                level11Group.add(cl);
              }
            }
          }, undefined, () => {});
        }
        [[-8, 32], [8, -32], [-78, 8], [78, -8], [-8, -82], [8, 82]].forEach(([lx, lz], i) => {
          spawnRepoProp(level11Group, 'streetlamp.glb', lx, 0, lz, 6.8, i * 1.57, { centerXZ: true });
        });

        // 3 Enterable Ground-Floor Office Lobbies along Level 11 plazas!
        const l11WallMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const l11FloorMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
        [[-16, 22, 0], [16, -22, Math.PI], [-16, -52, 0]].forEach(([ox, oz, rotY]) => {
          const fl = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 8.4), l11FloorMat);
          fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.position.set(ox, 0.04, oz); level11Group.add(fl);
          const rf = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.4, 8.8), l11WallMat);
          rf.position.set(ox, 4.2, oz); level11Group.add(rf);
          // Back, Left, Right walls + Front walls with 3.0m wide open doorway
          [[ox, oz - 4.1, 10.0, 0.4], [ox - 4.8, oz, 0.4, 8.4], [ox + 4.8, oz, 0.4, 8.4],
           [ox - 3.25, oz + 4.1, 3.5, 0.4], [ox + 3.25, oz + 4.1, 3.5, 0.4]].forEach(([wx, wz, ww, wd]) => {
            const wm = new THREE.Mesh(new THREE.BoxGeometry(ww, 4.2, wd), l11WallMat);
            wm.position.set(wx, 2.1, wz); level11Group.add(wm);
            l11Boxes.push({ x: wx, z: wz, halfX: ww / 2 + 0.15, halfZ: wd / 2 + 0.15 });
          });
          const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.95, 1.1), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
          desk.position.set(ox, 0.48, oz - 2.2); level11Group.add(desk);
          spawnRepoProp(level11Group, 'crt_pc.glb', ox, 0.96, oz - 2.2, 0.72, 0, { centerXZ: true });
          spawnGltfProp(level11Group, 'SheenChair/glTF-Binary/SheenChair.glb', ox, 0, oz - 3.1, 0.95, 0);
        });

        // Traffic Light Poles & Real 3D Vending/Bench Props
        [[-8, 62], [8, -62], [-62, 8], [62, -8]].forEach(([tx, tz], i) => {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 6.2, 8), new THREE.MeshLambertMaterial({ color: 0x334155 }));
          pole.position.set(tx, 3.1, tz); level11Group.add(pole);
          const redL = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xef4444 : 0x22c55e }));
          redL.position.set(tx, 5.8, tz); level11Group.add(redL);
          spawnGltfProp(level11Group, 'CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb', tx + 2.2, 0, tz, 2.0, i);
        });

        // Abandoned Cars along Endless City avenues (car.glb)
        [[-22, 42, 0], [24, -18, Math.PI], [-22, -62, 0.15], [24, 65, -Math.PI + 0.1]].forEach(([cx, cz, ry]) => {
          spawnRepoProp(level11Group, 'car.glb', cx, 0, cz, 1.65, ry, { centerXZ: true });
        });
        // 6 M.E.G. Metro Access Keycards
        const cardPts = [[-70, 70], [70, 70], [-70, 0], [70, 0], [-70, -70], [70, -70]];
        cardPts.forEach(([cx, cz]) => {
          const cg = new THREE.Group(); cg.position.set(cx, 1.2, cz);
          const card = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.36, 0.06), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 8, 16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          level11Group.add(cg);
          if (typeof gltfLoader !== 'undefined') {
            spawnRepoProp(cg, 'keycard.glb', 0, 0.95, 0, 0.48, 0.4, { centerXZ: true, centerY: true, useMaxDim: true, hideOldChildren: true });
          }
          l11Cards.push({ x: cx, z: cz, taken: false, mesh: cg });
        });

        // Grand Central Metro Entrance EXIT (z = -102)
        const exG = new THREE.Group(); exG.position.set(l11Exit.x, 0, l11Exit.z);
        const arch = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.6, 1.2), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        arch.position.y = 2.3; exG.add(arch);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.85, 1.35), sMat);
        sign.position.y = 4.0; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.8, 22); eL.position.set(0, 3.5, 2.0); exG.add(eL);
        level11Group.add(exG);
        l11Exit.signMat = sMat; l11Exit.light = eL;
      }

      // ============================================================
      // THE END — DECEPTIVE PUBLIC LIBRARY & COMPUTER TERMINAL
      // ============================================================
      const lEndDisks = [];
      const lEndTerminal = { x: 0, z: 0 };
      const lEndExit = { x: 0, z: -28, unlocked: true, signMat: null, light: null };
      const lEndSpawn = new THREE.Vector3(0, 1.65, 26);
      const lEndMonsterSpawn = new THREE.Vector3(-22, 0, -18);

      function makeBookshelfTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#3b1f10'; g.fillRect(0, 0, 256, 256);
        const cols = ['#991b1b', '#1e40af', '#166534', '#92400e', '#581c87', '#d97706', '#0f766e'];
        for (let row = 0; row < 5; row++) {
          const y = 8 + row * 50;
          g.fillStyle = '#241208'; g.fillRect(6, y + 38, 244, 8);
          for (let x = 10; x < 242; x += 14) {
            const h = 28 + Math.floor(Math.random() * 10);
            g.fillStyle = cols[Math.floor(Math.random() * cols.length)];
            g.fillRect(x, y + (38 - h), 11, h);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function buildLevelEnd() {
        lEndBoxes.length = 0; lEndDisks.length = 0;
        const S = 32;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(S * 2 + 4, S * 2 + 4), new THREE.MeshLambertMaterial({ color: 0x3b2618 }));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; levelEndGroup.add(floor);
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S * 2 + 4, S * 2 + 4), new THREE.MeshLambertMaterial({ color: 0x291a10 }));
        ceil.rotation.x = Math.PI / 2; ceil.position.y = 5.4; levelEndGroup.add(ceil);

        // Library outer walls
        const wMat = new THREE.MeshLambertMaterial({ color: 0x452817 });
        [[0, -S, S * 2, 1.0], [0, S, S * 2, 1.0], [-S, 0, 1.0, S * 2], [S, 0, 1.0, S * 2]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 5.4, d), wMat);
          m.position.set(x, 2.7, z); levelEndGroup.add(m);
          lEndBoxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });

        // Rows of Tall Mahogany Bookshelves
        const bkMat = new THREE.MeshLambertMaterial({ map: makeBookshelfTex() });
        [-22, -12, 12, 22].forEach((bx) => {
          [-18, -6, 6, 18].forEach((bz) => {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.4, 7.2), bkMat);
            shelf.position.set(bx, 2.2, bz); levelEndGroup.add(shelf);
            lEndBoxes.push({ x: bx, z: bz, halfX: 0.85, halfZ: 3.7 });
          });
        });

        // Central Desk + Iconic Glowing Retro Computer Terminal + "THE END IS NEAR" Banner
        const desk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 1.6), new THREE.MeshLambertMaterial({ color: 0x5c3317 }));
        desk.position.set(0, 0.5, 0); levelEndGroup.add(desk);
        lEndBoxes.push({ x: 0, z: 0, halfX: 1.75, halfZ: 0.85 });
        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.78, 0.7), new THREE.MeshLambertMaterial({ color: 0xd6d3d1 }));
        mon.position.set(0, 1.4, 0); levelEndGroup.add(mon);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.56), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        scr.position.set(0, 1.42, 0.36); levelEndGroup.add(scr);
        mon.visible = false; scr.visible = false;
        spawnRepoProp(levelEndGroup, 'crt_pc.glb', 0, 1.0, 0, 0.85, 0, { centerXZ: true });
        const tLight = new THREE.PointLight(0x22c55e, 1.4, 12); tLight.position.set(0, 2.0, 1.0); levelEndGroup.add(tLight);

        const ban = new THREE.Mesh(
          new THREE.PlaneGeometry(6.4, 1.2),
          new THREE.MeshBasicMaterial({ map: makeMetroSign('THE END IS NEAR', 'KOMPYUTER TERMINALI', '#1c1917', '#facc15') })
        );
        ban.position.set(0, 4.2, -1.5); levelEndGroup.add(ban);

        // Real 3D Library Props (.glb)
        spawnGltfProp(levelEndGroup, 'SheenChair/glTF-Binary/SheenChair.glb', 0, 0, 1.6, 1.05, Math.PI);
        spawnGltfProp(levelEndGroup, 'GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb', -6.5, 0, 18, 1.0, Math.PI / 2);
        [[-10, -8, Math.PI / 2], [10, -8, -Math.PI / 2], [-10, 8, Math.PI / 2], [10, 8, -Math.PI / 2]].forEach(([sx, sz, sry]) => {
          spawnRepoProp(levelEndGroup, 'bookshelf.glb', sx, 0, sz, 3.4, sry, { centerXZ: true });
        });
        spawnGltfProp(levelEndGroup, 'AntiqueCamera/glTF-Binary/AntiqueCamera.glb', 1.2, 1.0, 0, 0.45, -0.4);
        spawnGltfProp(levelEndGroup, 'Lantern/glTF-Binary/Lantern.glb', -1.2, 1.0, 0, 0.55, 0);

        // 4 Collectible Floppy Disks hidden among the bookshelves
        [[-26, 24], [26, 24], [-26, -24], [26, -24]].forEach(([dx, dz]) => {
          const dg = new THREE.Group(); dg.position.set(dx, 1.15, dz);
          const disk = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.06), new THREE.MeshBasicMaterial({ color: 0x4ade80 }));
          dg.add(disk); levelEndGroup.add(dg);
          lEndDisks.push({ x: dx, z: dz, taken: false, mesh: dg });
          spawnRepoProp(dg, 'floppy.glb', 0, 0, 0, 0.52, 0.3, { centerXZ: true, centerY: true, useMaxDim: true, hideOldChildren: true });
        });

        // Secret Library Back-Door EXIT (z = -28)
        const exG = new THREE.Group(); exG.position.set(lEndExit.x, 0, lEndExit.z);
        const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.6, 0.5), new THREE.MeshLambertMaterial({ color: 0x292524 }));
        door.position.y = 1.8; exG.add(door);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.55, 0.6), sMat);
        sign.position.y = 3.2; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.4, 12); eL.position.set(0, 2.8, 1.2); exG.add(eL);
        levelEndGroup.add(exG);
        lEndExit.signMat = sMat; lEndExit.light = eL;
        spawnRepoProp(exG, 'door_anim.glb', 0, 0, 0.32, 3.2, 0, { centerXZ: true, flatZ: true });
      }

      // ============================================================
      // LEVEL 6.1 — THE SNACKROOMS (SAFE COZY NEON DINER & HUB)
      // ============================================================
      const l61Counters = [];
      const l61Exit = { x: 0, z: -20 };
      const l61Spawn = new THREE.Vector3(0, 1.65, 18);

      function buildLevel61() {
        l61Boxes.length = 0; l61Counters.length = 0;
        const S = 28;
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(S * 2, S * 2),
          new THREE.MeshLambertMaterial({ map: makeCheckerRugTex('#f8fafc', '#18181b') })
        );
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; level61Group.add(floor);
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S * 2, S * 2), new THREE.MeshLambertMaterial({ color: 0x1e1b2e }));
        ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.8; level61Group.add(ceil);

        // Diner Neon Walls
        const wMat = new THREE.MeshLambertMaterial({ color: 0x2e1065 });
        [[0, -S, S * 2, 1.0], [0, S, S * 2, 1.0], [-S, 0, 1.0, S * 2], [S, 0, 1.0, S * 2]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 4.8, d), wMat);
          m.position.set(x, 2.4, z); level61Group.add(m);
          l61Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });

        // Glowing Neon Signs
        const n1 = new THREE.Mesh(
          new THREE.PlaneGeometry(9.0, 1.8),
          new THREE.MeshBasicMaterial({ map: makeMetroSign('THE SNACKROOMS • 24/7', 'XAVFSIZ RESTORAN • BODOM SUVI BEPUL', '#3b0764', '#f472b6') })
        );
        n1.position.set(0, 3.6, -S + 0.65); level61Group.add(n1);

        // Warm Pink/Cyan Diner Lighting
        const p1 = new THREE.PointLight(0xf472b6, 1.3, 28); p1.position.set(-10, 4.0, 0); level61Group.add(p1);
        const p2 = new THREE.PointLight(0x22d3ee, 1.3, 28); p2.position.set(10, 4.0, 0); level61Group.add(p2);

        // 3 Interactive Snack & Almond Water Bar Counters
        const barSpecs = [
          { x: -12, z: 6, label: 'BODOM SUVI BARI' },
          { x: 12, z: 6, label: "ISSIQ CHOY & GAZAK" },
          { x: 0, z: -6, label: 'MARKAZIY KAFE BARI' }
        ];
        barSpecs.forEach((bs, i) => {
          const cnt = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.1, 1.5), new THREE.MeshLambertMaterial({ color: i === 2 ? 0xec4899 : 0x06b6d4 }));
          cnt.position.set(bs.x, 0.55, bs.z); level61Group.add(cnt);
          l61Boxes.push({ x: bs.x, z: bs.z, halfX: 2.3, halfZ: 0.85 });
          const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 8), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
          glow.position.set(bs.x, 1.38, bs.z); level61Group.add(glow);
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('almond_water.glb', level61Group, { x: bs.x + 0.6, y: 1.1, z: bs.z, rotY: 0.4, targetH: 0.48 });
            loadGlbIntoGroup('almond_water.glb', level61Group, { x: bs.x - 0.6, y: 1.1, z: bs.z, rotY: -0.3, targetH: 0.48 });
          }
          l61Counters.push({ x: bs.x, z: bs.z, used: false, label: bs.label });
        });

        // Real 3D Internet Diner Props (.glb)
        spawnGltfProp(level61Group, 'CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb', -20, 0, -14, 2.2, Math.PI / 2);
        spawnRepoProp(level61Group, 'vending_machine.glb', -22.2, 0, 0, 2.25, Math.PI / 2, { centerXZ: true });
        if (typeof loadGlbIntoGroup === 'function') loadGlbIntoGroup('sink_cabinet.glb', level61Group, { x: 21.5, y: 0, z: -12, rotY: -Math.PI / 2, targetH: 1.05 });
        spawnRepoProp(level61Group, 'vending_machine.glb', 22.2, 0, 0, 2.25, -Math.PI / 2, { centerXZ: true });
        spawnGltfProp(level61Group, 'CommercialRefrigerator/glTF-Binary/CommercialRefrigerator.glb', 20, 0, -14, 2.2, -Math.PI / 2);
        spawnGltfProp(level61Group, 'GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb', -18, 0, 14, 1.05, Math.PI / 2);
        spawnGltfProp(level61Group, 'GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb', 18, 0, 14, 1.05, -Math.PI / 2);
        spawnGltfProp(level61Group, 'BoomBox/glTF-Binary/BoomBox.glb', 0, 1.1, -6, 0.55, 0);
        spawnGltfProp(level61Group, 'WaterBottle/glTF-Binary/WaterBottle.glb', -11, 1.1, 6, 0.42, 0);
        spawnGltfProp(level61Group, 'SheenChair/glTF-Binary/SheenChair.glb', -12, 0, 8.2, 1.0, Math.PI);
        spawnGltfProp(level61Group, 'SheenChair/glTF-Binary/SheenChair.glb', 12, 0, 8.2, 1.0, Math.PI);

        // Always-Open Glowing Green VIP Metro Exit Door (z = -20)
        const exG = new THREE.Group(); exG.position.set(l61Exit.x, 0, l61Exit.z);
        spawnRepoProp(exG, 'double_door.glb', 0, 0, 0.28, 3.2, 0, { centerXZ: true, flatZ: true });
        const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.6, 0.5), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        door.position.y = 1.8; exG.add(door);
        const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 0.6), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        sign.position.y = 3.2; exG.add(sign);
        const eL = new THREE.PointLight(0x22c55e, 1.8, 16); eL.position.set(0, 2.8, 1.5); exG.add(eL);
        level61Group.add(exG);
      }

      // ============================================================
      // LEVEL 3 — ELECTRICAL STATION (122m DARK BRICK LABYRINTH)
      // ============================================================
      const l3Breakers = [];
      const l3Arcs = [];
      const l3Lockers = [];
      const l3OpenCells = [];
      const l3Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      const l3Spawn = new THREE.Vector3(0, 1.65, 0);
      const l3MonsterSpawn = new THREE.Vector3(0, 0, 0);

      function makeBrickWallTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#291a16'; g.fillRect(0, 0, 256, 256);
        for (let row = 0; row < 8; row++) {
          const y = row * 32;
          const off = (row % 2) * 32;
          for (let col = -1; col < 5; col++) {
            const shade = 72 + Math.floor(Math.random() * 28);
            g.fillStyle = 'rgb(' + (shade + 22) + ',' + Math.floor(shade * 0.58) + ',' + Math.floor(shade * 0.45) + ')';
            g.fillRect(col * 64 + off + 2, y + 2, 60, 28);
          }
        }
        return new THREE.CanvasTexture(c);
      }

      function buildLevel3() {
        l3Arcs.length = 0; l3Boxes.length = 0; l3Breakers.length = 0; l3Lockers.length = 0; l3OpenCells.length = 0;
        const R = 101, C = 8.0, H = 4.4;
        const g = generateWindingMaze(R, R, 30303, 0.16);
        const half = (R * C) / 2;
        const cellP = (r, c) => ({ x: c * C - half + C / 2, z: r * C - half + C / 2 });

        const fl = new THREE.Mesh(new THREE.PlaneGeometry(R * C + 4, R * C + 4), new THREE.MeshLambertMaterial({ color: 0x262626 }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level3Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(R * C + 4, R * C + 4), new THREE.MeshLambertMaterial({ color: 0x1a1716 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level3Group.add(cl);

        const wallCoords = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < R; c++) {
          const p = cellP(r, c);
          if (g[r][c] === '#') {
            wallCoords.push(p);
            l3Boxes.push({ x: p.x, z: p.z, halfX: C / 2, halfZ: C / 2 });
          } else l3OpenCells.push(p);
        }
        const wInst = new THREE.InstancedMesh(
          new THREE.BoxGeometry(C, H, C),
          new THREE.MeshLambertMaterial({ map: makeBrickWallTex() }),
          wallCoords.length
        );
        const dmy = new THREE.Object3D();
        wallCoords.forEach((p, i) => { dmy.position.set(p.x, H / 2, p.z); dmy.updateMatrix(); wInst.setMatrixAt(i, dmy.matrix); });
        level3Group.add(wInst);

        l3Spawn.set(l3OpenCells[0].x, 1.65, l3OpenCells[0].z);
        const exP = pickRandomFarExitCell(l3OpenCells, l3Spawn);
        l3Exit.x = exP.x; l3Exit.z = exP.z;
        const mP = l3OpenCells[Math.floor(l3OpenCells.length * 0.55)];
        l3MonsterSpawn.set(mP.x, 0, mP.z);

        // 8 High-Voltage Breaker Panels
        for (let i = 0; i < 8; i++) {
          const p = l3OpenCells[Math.floor(l3OpenCells.length * (0.08 + i * 0.105))];
          const bg = new THREE.Group(); bg.position.set(p.x, 0, p.z);
          const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.5), new THREE.MeshLambertMaterial({ color: 0x334155 }));
          cab.position.y = 0.9; bg.add(cab);
          const lMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lMat);
          lamp.position.y = 1.92; bg.add(lamp);
          level3Group.add(bg);
          l3Breakers.push({ x: p.x, z: p.z, active: false, lMat, mesh: bg });
        }

        // 10 Live Sparking Electric Arc Traps
        for (let i = 0; i < 10; i++) {
          const p = l3OpenCells[Math.floor(l3OpenCells.length * (0.12 + i * 0.082))];
          const arc = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.55, 2.2, 8),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 })
          );
          arc.position.set(p.x, 1.1, p.z); level3Group.add(arc);
          l3Arcs.push({ x: p.x, z: p.z, mesh: arc, phase: i * 1.3 });
        }

        // 6 Metal Hiding Lockers & Real 3D Props
        for (let i = 0; i < 6; i++) {
          const p = l3OpenCells[Math.floor(l3OpenCells.length * (0.1 + i * 0.14))];
          const lk = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.3, 0.7), new THREE.MeshLambertMaterial({ color: 0x475569 }));
          lk.position.set(p.x, 1.15, p.z); level3Group.add(lk);
          l3Lockers.push({ x: p.x, z: p.z, mesh: lk });
          if (i < 3) spawnGltfProp(level3Group, 'AnisotropyBarnLamp/glTF-Binary/AnisotropyBarnLamp.glb', p.x + 0.8, 2.8, p.z, 0.75, i);
          if (i < 2) spawnRepoProp(level3Group, 'generator.glb', p.x - 1.1, 0, p.z, 1.35, i * 1.5, { centerXZ: true });
          if (i === 2) spawnRepoProp(level3Group, 'crt_pc.glb', p.x + 1.1, 0, p.z, 0.85, 0, { centerXZ: true });
        }

        // Industrial Elevator EXIT
        const exG = new THREE.Group(); exG.position.set(l3Exit.x, 0, l3Exit.z);
        const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.4), new THREE.MeshLambertMaterial({ color: 0x64748b }));
        door.position.y = 1.6; exG.add(door);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.48, 0.45), sMat);
        sign.position.y = 3.0; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.6, 12); eL.position.set(0, 2.6, 1.0); exG.add(eL);
        level3Group.add(exG);
        l3Exit.signMat = sMat; l3Exit.light = eL;
        spawnRepoProp(exG, 'metal_door.glb', 0, 0, 0.32, 3.1, 0, { centerXZ: true, flatZ: true });
      }

      // ============================================================
      // LEVEL 4 — ABANDONED OFFICE (130m CLEAN WHITE OFFICE + WINDOW TRAPS)
      // ============================================================
      const l4Badges = [];
      const l4Coolers = [];
      const l4WindowTraps = [];
      const l4OpenCells = [];
      const l4Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      const l4Spawn = new THREE.Vector3(0, 1.65, 0);

      function makeOfficeWallTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#e5e7eb'; g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#cbd5e1'; g.fillRect(0, 224, 256, 32);
        g.strokeStyle = 'rgba(148,163,184,0.45)'; g.lineWidth = 3;
        g.strokeRect(4, 4, 248, 218);
        return new THREE.CanvasTexture(c);
      }

      function buildLevel4() {
        l4Badges.length = 0; l4Boxes.length = 0; l4Coolers.length = 0; l4OpenCells.length = 0; l4WindowTraps.length = 0;
        const R = 101, C = 8.0, H = 4.2;
        const g = generateWindingMaze(R, R, 40404, 0.22);
        const half = (R * C) / 2;
        const cellP = (r, c) => ({ x: c * C - half + C / 2, z: r * C - half + C / 2 });

        const fl = new THREE.Mesh(new THREE.PlaneGeometry(R * C + 4, R * C + 4), new THREE.MeshLambertMaterial({ color: 0x9ca3af }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level4Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(R * C + 4, R * C + 4), new THREE.MeshLambertMaterial({ color: 0xf1f5f9 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level4Group.add(cl);

        const wallCoords = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < R; c++) {
          const p = cellP(r, c);
          if (g[r][c] === '#') {
            wallCoords.push(p);
            l4Boxes.push({ x: p.x, z: p.z, halfX: C / 2, halfZ: C / 2 });
          } else l4OpenCells.push(p);
        }
        const wInst = new THREE.InstancedMesh(
          new THREE.BoxGeometry(C, H, C),
          new THREE.MeshLambertMaterial({ map: makeOfficeWallTex() }),
          wallCoords.length
        );
        const dmy = new THREE.Object3D();
        wallCoords.forEach((p, i) => { dmy.position.set(p.x, H / 2, p.z); dmy.updateMatrix(); wInst.setMatrixAt(i, dmy.matrix); });
        level4Group.add(wInst);

        l4Spawn.set(l4OpenCells[0].x, 1.65, l4OpenCells[0].z);
        const exP = pickRandomFarExitCell(l4OpenCells, l4Spawn);
        l4Exit.x = exP.x; l4Exit.z = exP.z;

        // 6 Office Security Badges
        for (let i = 0; i < 6; i++) {
          const p = l4OpenCells[Math.floor(l4OpenCells.length * (0.1 + i * 0.14))];
          const bg = new THREE.Group(); bg.position.set(p.x, 1.15, p.z);
          const card = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 8, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          bg.add(card, ring); level4Group.add(bg);
          l4Badges.push({ x: p.x, z: p.z, taken: false, mesh: bg });
          spawnRepoProp(bg, 'keycard.glb', 0, 0.9, 0, 0.45, 0.3, { centerXZ: true, centerY: true, useMaxDim: true, hideOldChildren: true });
        }

        // 4 Almond Water Coolers (full battery + stamina refill!) & Real 3D Office Props
        for (let i = 0; i < 4; i++) {
          const p = l4OpenCells[Math.floor(l4OpenCells.length * (0.16 + i * 0.21))];
          const cg = new THREE.Group(); cg.position.set(p.x, 0, p.z);
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.0, 0.65), new THREE.MeshLambertMaterial({ color: 0xf8fafc }));
          base.position.y = 0.5; cg.add(base);
          const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 10), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
          jug.position.y = 1.32; cg.add(jug);
          level4Group.add(cg);
          l4Coolers.push({ x: p.x, z: p.z, mesh: cg });
          spawnGltfProp(level4Group, 'SheenChair/glTF-Binary/SheenChair.glb', p.x + 1.1, 0, p.z, 0.95, i * 1.2);
          if (typeof loadGlbIntoGroup === 'function') loadGlbIntoGroup('almond_water.glb', level4Group, { x: p.x - 0.75, y: 0, z: p.z, rotY: 0.5, targetH: 0.45 });
          spawnRepoProp(level4Group, 'crt_pc.glb', p.x + 1.1, 0.82, p.z, 0.62, i * 1.2, { centerXZ: true });
        }

        // 6 Glowing Eerie "Window Entity" Traps (stay away from bright non-blacked-out windows!)
        for (let i = 0; i < 6; i++) {
          const p = l4OpenCells[Math.floor(l4OpenCells.length * (0.14 + i * 0.145))];
          const wg = new THREE.Group(); wg.position.set(p.x, 0, p.z);
          const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 0.18), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          frame.position.y = 1.7; wg.add(frame);
          const sil = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshBasicMaterial({ color: 0x09090b }));
          sil.position.set(0, 1.8, 0.08); wg.add(sil);
          level4Group.add(wg);
          l4WindowTraps.push({ x: p.x, z: p.z, mesh: wg });
        }

        // Office Stairwell / Elevator EXIT
        const exG = new THREE.Group(); exG.position.set(l4Exit.x, 0, l4Exit.z);
        const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.4), new THREE.MeshLambertMaterial({ color: 0x334155 }));
        door.position.y = 1.6; exG.add(door);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.48, 0.45), sMat);
        sign.position.y = 3.0; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.5, 12); eL.position.set(0, 2.6, 1.0); exG.add(eL);
        level4Group.add(exG);
        l4Exit.signMat = sMat; l4Exit.light = eL;
        spawnRepoProp(exG, 'door_anim.glb', 0, 0, 0.32, 3.1, 0, { centerXZ: true, flatZ: true });
      }

      // ============================================================
      // LEVEL 5 — TERROR HOTEL (1930s GRAND HOTEL WITH 10 REAL ENTERABLE
      // NUMBERED GUEST ROOMS 101-110, HINGED DOORS & VINTAGE INTERIORS!)
      // ============================================================
      const l5Keys = [];
      const l5Lockers = [];
      const l5RoomDoors = [];
      const l5OpenCells = [];
      const l5Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      const l5Spawn = new THREE.Vector3(0, 1.65, 42);
      const l5MonsterSpawn = new THREE.Vector3(0, 0, -24);

      function makeHotelWallTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#5c1418'; g.fillRect(0, 0, 256, 256);
        g.fillStyle = '#7f1d1d';
        for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 14, 190);
        g.fillStyle = '#d4af37'; g.fillRect(0, 186, 256, 6);
        g.fillStyle = '#3b1c0e'; g.fillRect(0, 192, 256, 64);
        return new THREE.CanvasTexture(c);
      }

      function makeHotelCarpetTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#450a0a'; g.fillRect(0, 0, 256, 256);
        g.strokeStyle = 'rgba(212,175,55,0.42)'; g.lineWidth = 5;
        g.strokeRect(18, 18, 220, 220);
        g.beginPath(); g.arc(128, 128, 56, 0, Math.PI * 2); g.stroke();
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(24, 24);
        return tex;
      }

      function makeRoomPlaqueTex(num) {
        const c = document.createElement('canvas'); c.width = 128; c.height = 64;
        const g = c.getContext('2d');
        g.fillStyle = '#b45309'; g.fillRect(0, 0, 128, 64);
        g.strokeStyle = '#fef08a'; g.lineWidth = 5; g.strokeRect(4, 4, 120, 56);
        g.fillStyle = '#fef9c3'; g.font = 'bold 34px Georgia, serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(String(num), 64, 34);
        return new THREE.CanvasTexture(c);
      }

      function buildLevel5() {
        l5Boxes.length = 0; l5Keys.length = 0; l5Lockers.length = 0; l5OpenCells.length = 0; l5RoomDoors.length = 0;
        const H = 4.2;
        const wallTex = makeHotelWallTex();
        const wallMat = new THREE.MeshLambertMaterial({ map: wallTex });
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x451a03 });
        const doorWoodMat = new THREE.MeshLambertMaterial({ color: 0x5c260a });
        const brassMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const bedMat = new THREE.MeshLambertMaterial({ color: 0x881337 });
        const pillowMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
        const lampGlow = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        // Floor & Ornate Dark Ceiling (110m x 110m Grand Hotel Wing)
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ map: makeHotelCarpetTex() }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level5Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x26120c }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level5Group.add(cl);

        const addW = (x, z, w, d) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), wallMat);
          m.position.set(x, H / 2, z); level5Group.add(m);
          l5Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        };

        // Outer Hotel Perimeter (x: -48..+48, z: -50..+50)
        addW(0, -50, 96, 1.0);
        addW(0, 50, 96, 1.0);
        addW(-48, 0, 1.0, 100);
        addW(48, 0, 1.0, 100);

        // Central Grand Hallway (x: -5..+5, z: -48..+48) + 2 Cross Corridors (z = -24, z = +18)
        // Build 10 REAL Enterable Numbered Hotel Guest Rooms (5 on West side, 5 on East side!)
        const roomZs = [32, 14, -4, -22, -38];
        let roomNum = 101;

        roomZs.forEach((rz, rIdx) => {
          [-1, 1].forEach((side) => {
            const num = roomNum++;
            const rw = 14.0, rd = 13.0;
            const rx = side * (5.2 + rw / 2); // West = -12.2, East = +12.2
            const hallWallX = side * 5.2;

            // Room Back Wall, North Wall, South Wall
            addW(side * (5.2 + rw), rz, 0.5, rd);
            addW(rx, rz - rd / 2, rw, 0.45);
            addW(rx, rz + rd / 2, rw, 0.45);

            // Hallway-facing Wall with 2.2m open Doorway in center!
            const segLen = (rd - 2.2) / 2;
            addW(hallWallX, rz - (rd / 2 - segLen / 2), 0.45, segLen);
            addW(hallWallX, rz + (rd / 2 - segLen / 2), 0.45, segLen);
            const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 2.4), wallMat);
            lintel.position.set(hallWallX, H - 0.6, rz); level5Group.add(lintel);

            // Hinged Interactive Wooden Hotel Room Door + Brass Number Plaque!
            const hinge = new THREE.Group();
            hinge.position.set(hallWallX, 0, rz - 1.05);
            const dPanel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.0, 2.08), doorWoodMat);
            dPanel.position.set(0, 1.5, 1.04); hinge.add(dPanel);
            const knob1 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), brassMat);
            knob1.position.set(-side * 0.11, 1.35, 1.82); hinge.add(knob1);
            const plaque = new THREE.Mesh(
              new THREE.PlaneGeometry(0.58, 0.28),
              new THREE.MeshBasicMaterial({ map: makeRoomPlaqueTex(num), side: THREE.DoubleSide })
            );
            plaque.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
            plaque.position.set(-side * 0.09, 2.15, 1.04); hinge.add(plaque);
            level5Group.add(hinge);
            l5RoomDoors.push({ num, x: hallWallX, z: rz, hinge, open: false, side });

            // --- FURNISHED 1930s HOTEL GUEST ROOM INTERIOR ---
            // Vintage Brass King Bed against back wall
            const bedX = rx + side * 3.6;
            const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 2.4), woodMat);
            bedFrame.position.set(bedX, 0.26, rz); level5Group.add(bedFrame);
            const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.34, 2.25), bedMat);
            mattress.position.set(bedX, 0.65, rz); level5Group.add(mattress);
            const pil = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.24, 1.7), pillowMat);
            pil.position.set(bedX + side * 1.15, 0.88, rz); level5Group.add(pil);

            // Nightstand + Warm Glowing Vintage Bedside Lamp
            const ns = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.72, 0.8), woodMat);
            ns.position.set(bedX + side * 0.8, 0.36, rz - 1.9); level5Group.add(ns);
            const shade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 10), lampGlow);
            shade.position.set(bedX + side * 0.8, 1.05, rz - 1.9); level5Group.add(shade);
          bedFrame.visible = false; mattress.visible = false; pil.visible = false;
          spawnRepoProp(level5Group, 'hotel_bed.glb', bedX, 0, rz, 1.65, side > 0 ? -Math.PI / 2 : Math.PI / 2, { centerXZ: true });

            // Antique Writing Desk + Oak Hiding Wardrobe inside room!
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.82, 2.2), woodMat);
            desk.position.set(rx - side * 1.8, 0.41, rz + 4.4); level5Group.add(desk);

            const ward = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.5, 1.4), woodMat);
            ward.position.set(rx + side * 4.5, 1.25, rz + 4.5); level5Group.add(ward);
            l5Lockers.push({ x: rx + side * 4.5, z: rz + 4.5, mesh: ward });

            // Real 3D .glb Vintage Furniture in rooms!
            if (rIdx < 3) {
              spawnGltfProp(level5Group, 'GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb', rx, 0, rz - 4.4, 1.0, 0);
              spawnGltfProp(level5Group, 'SheenChair/glTF-Binary/SheenChair.glb', rx - side * 1.8, 0, rz + 3.0, 0.95, 0);
            } else {
              spawnGltfProp(level5Group, 'Lantern/glTF-Binary/Lantern.glb', rx - side * 1.8, 0.82, rz + 4.4, 0.55, 0);
            }

            // Record open cells for monster patrol + spawn 7 Golden Keys INSIDE rooms!
            l5OpenCells.push({ x: 0, z: rz }, { x: rx, z: rz });
            if (l5Keys.length < 7 && (rIdx !== 0 || side === 1)) {
              let kx = rx - side * 1.2, kz = rz - 1.5;
              if (typeof spawnGroundPedestal === 'function') {
                const _p5 = spawnGroundPedestal(level5Group, kx, kz, (l5Keys.length % 4) * (Math.PI / 2));
                kx = _p5.x; kz = _p5.z;
              }
              const kg = new THREE.Group(); kg.position.set(kx, 0.92, kz);
              level5Group.add(kg);
              l5Keys.push({ x: kx, z: kz, taken: false, mesh: kg });
              if (typeof loadGlbIntoGroup === 'function') {
                loadGlbIntoGroup('key.glb', kg, { x: 0, y: 0, z: 0, rotY: 0.3, targetH: 0.18 });
              }
            }
          });

          // Warm Vintage Hallway Sconce Lamp every corridor section
          const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), lampGlow);
          sconce.position.set(0, 3.7, rz); level5Group.add(sconce);
        });

        // Grand Brass Elevator EXIT at North End of Main Hallway (0, -47)
        l5Exit.x = 0; l5Exit.z = -47.5;
        const exG = new THREE.Group(); exG.position.set(l5Exit.x, 0, l5Exit.z);
        const door = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.5, 0.45), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
        door.position.y = 1.75; exG.add(door);
        const sMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.5), sMat);
        sign.position.y = 3.2; exG.add(sign);
        const eL = new THREE.PointLight(0xef4444, 1.8, 16); eL.position.set(0, 2.8, 1.5); exG.add(eL);
        level5Group.add(exG);
        l5Exit.signMat = sMat; l5Exit.light = eL;
      }

      // ============================================================
      // TRUE BACKROOMS PSYCHOLOGICAL HORROR ENGINE:
      // 1) PERIPHERAL SHADOW WATCHER (vanishes when looked at!)
      // 2) NO-CLIP GLITCH ANOMALY WALLS (unexpected level-slip!)
      // 3) CRYPTIC HANDWRITTEN SURVIVOR WALL SCRAWLS
      // 4) SANITY / HALLUCINATION / FLUORESCENT BLINK SHIFTS
      // ============================================================
      const phantomWatcher = new THREE.Group();
      const pwMat = new THREE.MeshBasicMaterial({ color: 0x040406, transparent: true, opacity: 0.85 });
      if (typeof loadGlbIntoGroup === 'function') {
        loadGlbIntoGroup('bacteria.glb', phantomWatcher, { x: 0, y: 0, z: 0, rotY: 0, targetH: 2.35 });
      }
      phantomWatcher.visible = false;
      scene.add(phantomWatcher);

      function makeWallScrawlTex(linesArr) {
        const c = document.createElement('canvas'); c.width = 512; c.height = 256;
        const g = c.getContext('2d');
        g.clearRect(0, 0, 512, 256);
        g.fillStyle = 'rgba(18, 14, 12, 0.84)';
        g.font = 'italic bold 36px Georgia, serif';
        g.textAlign = 'center';
        linesArr.forEach((txt, idx) => {
          g.save();
          g.translate(256, 76 + idx * 54);
          g.rotate((idx % 2 === 0 ? -1 : 1) * 0.045);
          g.fillText(txt, 0, 0);
          g.restore();
        });
        return new THREE.CanvasTexture(c);
      }

      // (Old mid-air scrawls removed — replaced by wall-flush placeLevel0Graffiti!)

      // No-Clip Glitch Anomaly Walls: walking into one tears reality & slips you into a deeper Backrooms level!
      const noclipAnomalies = [];
      function makeGlitchWallTex() {
        const c = document.createElement('canvas'); c.width = 128; c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#050508'; g.fillRect(0, 0, 128, 256);
        for (let y = 0; y < 256; y += 6) {
          g.fillStyle = Math.random() > 0.72 ? 'rgba(255,255,255,0.22)' : 'rgba(15,15,24,0.85)';
          g.fillRect(Math.random() * 24, y, 60 + Math.random() * 68, 3);
        }
        return new THREE.CanvasTexture(c);
      }
      const glitchAnomalyMat = new THREE.MeshBasicMaterial({ map: makeGlitchWallTex(), transparent: true, opacity: 0.88, side: THREE.DoubleSide });

      (function buildNoclipAnomalies() {
        const addAnomaly = (parentGrp, zoneName, x, y, z, destLvl, hint) => {
          const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), glitchAnomalyMat);
          m.position.set(x, y + 1.6, z);
          parentGrp.add(m);
          noclipAnomalies.push({ zone: zoneName, x, y, z, destLvl, hint, mesh: m });
        };
        if (typeof openCells !== 'undefined' && openCells.length > 30) {
          const p0 = openCells[Math.floor(openCells.length * 0.18)];
          addAnomaly(level0Group, 'level0', p0.x, 0, p0.z, 94, 'NO-CLIP: REALLIK BUZILDI...');
        }
        if (typeof l94Spawn !== 'undefined') {
          const ax = -12, az = 122;
          addAnomaly(level94Group, 'level94', ax, getDreamHillY(ax, az), az, 922, "NO-CLIP: BO'SHLIQQA TUSHIB KETDINGIZ...");
        }
        if (typeof l2OpenCells !== 'undefined' && l2OpenCells.length > 20) {
          const p2 = l2OpenCells[Math.floor(l2OpenCells.length * 0.25)];
          addAnomaly(level2Group, 'level2', p2.x, 0, p2.z, 37, 'NO-CLIP: SUV OVOZI ESHITILMOQDA...');
        }
        if (typeof l4OpenCells !== 'undefined' && l4OpenCells.length > 20) {
          const p4 = l4OpenCells[Math.floor(l4OpenCells.length * 0.25)];
          addAnomaly(level4Group, 'level4', p4.x, 0, p4.z, 'end', 'NO-CLIP: JIMJIT KUTUBXONA...');
        }
      })();

      // ============================================================
      // INTERCONNECTED IMPOSSIBLE DOORS & WEIRD LIMINAL OBJECTS:
      // - Freestanding Doors connecting levels directly (Level 0 <-> 5 <-> 94 <-> 37 <-> End!)
      // - Staircases leading straight into solid ceilings
      // - Floating upside-down chairs, crooked pillars, glowing static TVs in empty rooms
      // ============================================================
      const liminalDoors = [];
      const floatingWeirdObjs = [];

      (function buildLiminalChaos() {
        const woodDoorMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
        const redDoorMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
        const cyanDoorMat = new THREE.MeshLambertMaterial({ color: 0x0e7490 });
        const whiteDoorMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
        const knobMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const stairMat = new THREE.MeshLambertMaterial({ color: 0x737373 });
        const tvMat = new THREE.MeshLambertMaterial({ color: 0x262626 });
        const staticMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });

        function addStrangeDoor(parentGrp, zoneName, x, y, z, rotY, doorMat, destLvl, label, isFake = false) {
          const dg = new THREE.Group();
          dg.position.set(x, y, z);
          dg.rotation.y = rotY;
          const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.55, 0.24), whiteDoorMat);
          frameL.position.set(-0.68, 1.28, 0); dg.add(frameL);
          const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.55, 0.24), whiteDoorMat);
          frameR.position.set(0.68, 1.28, 0); dg.add(frameR);
          const frameT = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.16, 0.24), whiteDoorMat);
          frameT.position.set(0, 2.52, 0); dg.add(frameT);
          const panel = new THREE.Mesh(new THREE.BoxGeometry(1.22, 2.4, 0.12), doorMat);
          panel.position.set(0, 1.22, 0); dg.add(panel);
          const knob = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), knobMat);
          knob.position.set(0.45, 1.12, 0.1); dg.add(knob);
          parentGrp.add(dg);
          liminalDoors.push({ zone: zoneName, x, y, z, destLvl, label, isFake, mesh: dg });
          spawnRepoProp(dg, 'door.glb', 0, 0, 0, 2.75, 0, { centerXZ: true, flatZ: true });
        }

        function addStairToCeiling(parentGrp, x, y, z, rotY) {
          const sg = new THREE.Group();
          sg.position.set(x, y, z);
          sg.rotation.y = rotY;
          for (let s = 0; s < 11; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.24, 0.36), stairMat);
            step.position.set(0, 0.15 + s * 0.32, -s * 0.3);
            sg.add(step);
          }
          parentGrp.add(sg);
        }

        function addFloatingWeirdObject(parentGrp, x, y, z, kind) {
          const fg = new THREE.Group();
          fg.position.set(x, y, z);
          if (kind === 'chair') {
            // Upside-down floating chair!
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), woodDoorMat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.1), woodDoorMat);
            back.position.set(0, 0.42, -0.32);
            fg.add(seat, back);
            [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([lx, lz]) => {
              const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.08), woodDoorMat);
              leg.position.set(lx, -0.35, lz); fg.add(leg);
            });
            fg.rotation.z = Math.PI * 0.92;
          } else {
            // Unplugged glowing static CRT TV sitting strangely on floor or hovering
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.72, 0.72), tvMat);
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.52), staticMat);
            scr.position.set(0, 0.02, 0.37);
            fg.add(box, scr);
          }
          parentGrp.add(fg);
          floatingWeirdObjs.push({ mesh: fg, baseY: y, phase: Math.random() * 6.28 });
        }

        function snapCellToWall(c) {
          const halfC = (typeof CELL !== 'undefined' ? CELL : 4.2) * 0.5 - 0.12;
          if (typeof MAZE_MAP !== 'undefined' && MAZE_MAP[c.r]) {
            if (c.r > 0 && MAZE_MAP[c.r - 1][c.c] === '#') return { x: c.x, z: c.z - halfC, rotY: 0 };
            if (c.r < MAZE_MAP.length - 1 && MAZE_MAP[c.r + 1][c.c] === '#') return { x: c.x, z: c.z + halfC, rotY: Math.PI };
            if (c.c > 0 && MAZE_MAP[c.r][c.c - 1] === '#') return { x: c.x - halfC, z: c.z, rotY: Math.PI / 2 };
            if (c.c < MAZE_MAP[c.r].length - 1 && MAZE_MAP[c.r][c.c + 1] === '#') return { x: c.x + halfC, z: c.z, rotY: -Math.PI / 2 };
          }
          return null;
        }

        // LEVEL 0: Interconnected doors mounted FLUSH on solid walls (never crooked in corridor center)
        if (typeof openCells !== 'undefined' && openCells.length > 40) {
          const wallCands = openCells.map((c) => ({ c, w: snapCellToWall(c) })).filter((item) => item.w);
          const pickWall = (frac, fb) => wallCands.length ? wallCands[Math.min(wallCands.length - 1, Math.floor(wallCands.length * frac))].w : { x: fb.x, z: fb.z, rotY: 0 };
          const wA = pickWall(0.07, openCells[Math.floor(openCells.length * 0.07)]);
          addStrangeDoor(level0Group, 'level0', wA.x, 0, wA.z, wA.rotY, redDoorMat, 5, "QIZIL MEHMONXONA ESHIGI (E)");
          const wB = pickWall(0.14, openCells[Math.floor(openCells.length * 0.14)]);
          addStrangeDoor(level0Group, 'level0', wB.x, 0, wB.z, wB.rotY, whiteDoorMat, 94, "OQ UY ESHIGI (E)");
          const wC = pickWall(0.22, openCells[Math.floor(openCells.length * 0.22)]);
          addStrangeDoor(level0Group, 'level0', wC.x, 0, wC.z, wC.rotY, woodDoorMat, null, "G'ALATI ESHIKNI OCHISH (E)", true);
          for (let i = 0; i < 6; i++) {
            const ps = openCells[Math.floor(openCells.length * (0.05 + i * 0.14))];
            const ws = snapCellToWall(ps);
            if (i % 2 === 0 && ws) addStairToCeiling(level0Group, ws.x, 0, ws.z, ws.rotY);
            else if (i % 2 !== 0) addFloatingWeirdObject(level0Group, ps.x, 1.95, ps.z, i % 3 === 0 ? 'tv' : 'chair');
          }
        }

        function snapBoxWall(c, boxes) {
          if (!c || !boxes || !boxes.length) return { x: c ? c.x : 0, z: c ? c.z : 0, rotY: 0 };
          let best = null, bestD = 9;
          for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            if (b.isProp || b.lockerRef) continue;
            const hx = b.halfX !== undefined ? b.halfX : (b.half || 2);
            const hz = b.halfZ !== undefined ? b.halfZ : (b.half || 2);
            const dx = c.x - b.x, dz = c.z - b.z;
            if (Math.abs(dx) < hx + 0.2 && Math.abs(dz) > hz && Math.abs(dz) < hz + 4.5) {
              const d = Math.abs(dz) - hz;
              if (d < bestD) { bestD = d; best = { x: c.x, z: b.z + (dz > 0 ? hz + 0.14 : -hz - 0.14), rotY: dz > 0 ? 0 : Math.PI }; }
            } else if (Math.abs(dz) < hz + 0.2 && Math.abs(dx) > hx && Math.abs(dx) < hx + 4.5) {
              const d = Math.abs(dx) - hx;
              if (d < bestD) { bestD = d; best = { x: b.x + (dx > 0 ? hx + 0.14 : -hx - 0.14), z: c.z, rotY: dx > 0 ? Math.PI / 2 : -Math.PI / 2 }; }
            }
          }
          return best || { x: c.x, z: c.z, rotY: 0 };
        }

        // LEVEL 1: Wall-mounted Cyan Pool Door -> Level 37 + Wall-aligned Stair + Chair
        const w1 = snapBoxWall({ x: 12, z: -18 }, l1Boxes);
        addStrangeDoor(level1Group, 'level1', w1.x, 0, w1.z, w1.rotY, cyanDoorMat, 37, "KAFELLI HOVUZ ESHIGI (E)");
        const w1s = snapBoxWall({ x: -14, z: -24 }, l1Boxes);
        addStairToCeiling(level1Group, w1s.x, 0, w1s.z, w1s.rotY);
        addFloatingWeirdObject(level1Group, 16, 1.9, -40, 'chair');

        // LEVEL 4 (Office): Wall-mounted Pastel Door -> Level 94
        if (typeof l4OpenCells !== 'undefined' && l4OpenCells.length > 20) {
          const p4a = l4OpenCells[Math.floor(l4OpenCells.length * 0.12)];
          const w4a = snapBoxWall(p4a, l4Boxes);
          addStrangeDoor(level4Group, 'level4', w4a.x, 0, w4a.z, w4a.rotY, whiteDoorMat, 94, "TUSH ESHIGI (E)");
          const p4b = l4OpenCells[Math.floor(l4OpenCells.length * 0.28)];
          const w4b = snapBoxWall(p4b, l4Boxes);
          addStairToCeiling(level4Group, w4b.x, 0, w4b.z, w4b.rotY);
          addFloatingWeirdObject(level4Group, p4a.x + 1.0, 2.0, p4a.z, 'tv');
        }

        // LEVEL 5 (Terror Hotel): Wall-mounted Boiler Door -> Level 2
        if (typeof l5OpenCells !== 'undefined' && l5OpenCells.length > 20) {
          const p5a = l5OpenCells[Math.floor(l5OpenCells.length * 0.11)];
          const w5a = snapBoxWall(p5a, l5Boxes);
          addStrangeDoor(level5Group, 'level5', w5a.x, 0, w5a.z, w5a.rotY, woodDoorMat, 2, "QOZONXONA ESHIGI (E)");
          addFloatingWeirdObject(level5Group, p5a.x, 2.1, p5a.z + 1.2, 'chair');
        }

        // LEVEL 94 (Dreamcore): Freestanding Red Door on a grassy hill -> Level 5, Library Door -> The End, Floating Chairs & Impossible Stairs on hills!
        if (typeof getDreamHillY === 'function') {
          addStrangeDoor(level94Group, 'level94', 18, getDreamHillY(18, 162), 162, -0.35, redDoorMat, 5, "TEPALIKDAGI QIZIL ESHIK (E)");
          addStrangeDoor(level94Group, 'level94', -24, getDreamHillY(-24, 96), 96, 0.5, woodDoorMat, 'end', "KUTUBXONA ESHIGI (E)");
          addStrangeDoor(level94Group, 'level94', 10, getDreamHillY(10, 42), 42, 0.1, cyanDoorMat, 37, "BASSEYN ESHIGI (E)");
          addStairToCeiling(level94Group, -18, getDreamHillY(-18, 168), 168, 0.6);
          addStairToCeiling(level94Group, 26, getDreamHillY(26, 85), 85, -0.9);
          addFloatingWeirdObject(level94Group, 0, getDreamHillY(0, 155) + 2.2, 155, 'chair');
          addFloatingWeirdObject(level94Group, -14, getDreamHillY(-14, 140) + 1.4, 140, 'tv');
        }
      })();


      function loadGlbIntoGroup(filename, parentGroup, opts = {}) {
        if (!gltfLoader || !parentGroup) return;
        const url = REPO_GLB_BASE + filename;
        gltfLoader.load(url, (gltf) => {
          try {
            const obj = gltf.scene.clone(true);
            const box = new THREE.Box3().setFromObject(obj);
            const sz = new THREE.Vector3();
            box.getSize(sz);
            const targetH = opts.targetH || 2.2;
            const sc = targetH / Math.max(sz.y || 1, 0.01);
            obj.scale.setScalar(sc);
            obj.updateMatrixWorld(true);
            const box2 = new THREE.Box3().setFromObject(obj);
            const ctr = new THREE.Vector3();
            box2.getCenter(ctr);
            const pivot = new THREE.Group();
            pivot.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
            if (opts.rotY) pivot.rotation.y = opts.rotY;
            obj.position.set(-ctr.x, -box2.min.y, -ctr.z);
            obj.traverse((o) => { if (o.isMesh) o.castShadow = true; });
            pivot.add(obj);
            const isDoorOrSign = filename.includes('door') || filename.includes('exit_sign') || filename.includes('streetlamp') || filename.includes('mirror');
            if (!opts.ceiling && !isDoorOrSign && (opts.y || 0) <= 0.08 && typeof makeContactShadow === 'function') {
              const sz2 = new THREE.Vector3();
              box2.getSize(sz2);
              const rx = Math.min(4.2, Math.max(0.24, sz2.x * 0.68));
              const rz = Math.min(4.2, Math.max(0.24, sz2.z * 0.68));
              const cs = makeContactShadow(rx, rz);
              cs.position.set(0, 0.018, 0);
              pivot.add(cs);
            }
            parentGroup.add(pivot);
          } catch (e) {}
        }, undefined, () => {});
      }

      // ============================================================
      // LEVEL 6 (Lights Out), LEVEL 7 (Thalassophobia), LEVEL 8 (Cave System)
      // ============================================================
      // --- LEVEL 6: LIGHTS OUT (Pitch-Black Industrial Maze + 6 Emergency Beacons) ---
      let l6Spawn = new THREE.Vector3(0, 1.65, 0), l6MonsterSpawn = new THREE.Vector3(24, 0, 24);
      const l6OpenCells = [], l6Switches = [], l6Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      function buildLevel6() {
        l6Boxes.length = 0; l6OpenCells.length = 0; l6Switches.length = 0;
        const CELL6 = 8.0, H6 = 4.2;
        const maze = generateWindingMaze(101, 101, 0.20, 4);
        const rows = maze.length, cols = maze[0].length;
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x18181b, map: l1WallTex });
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45, metalness: 0.65 });
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL6, rows * CELL6), new THREE.MeshLambertMaterial({ color: 0x09090b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level6Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL6, rows * CELL6), new THREE.MeshLambertMaterial({ color: 0x050507 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H6; level6Group.add(cl);
        const wGeo = new THREE.BoxGeometry(CELL6, H6, CELL6);
        const wPos6 = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (c - cols / 2 + 0.5) * CELL6, z = (r - rows / 2 + 0.5) * CELL6;
            if (maze[r][c] === '#') {
              wPos6.push({ x, z });
              l6Boxes.push({ x, z, half: CELL6 / 2 });
            } else {
              l6OpenCells.push({ x, z });
            }
          }
        }
        const inst6 = new THREE.InstancedMesh(wGeo, darkMat, wPos6.length);
        const dm6 = new THREE.Object3D();
        wPos6.forEach((p, idx) => { dm6.position.set(p.x, H6 / 2, p.z); dm6.updateMatrix(); inst6.setMatrixAt(idx, dm6.matrix); });
        inst6.instanceMatrix.needsUpdate = true; level6Group.add(inst6);
        const sp = l6OpenCells[1] || { x: 0, z: 0 };
        l6Spawn.set(sp.x, 1.65, sp.z);
        const ms = l6OpenCells[Math.floor(l6OpenCells.length * 0.72)] || { x: 20, z: 20 };
        l6MonsterSpawn.set(ms.x, 0, ms.z);
        for (let i = 0; i < 6; i++) {
          const cell = l6OpenCells[Math.floor((i + 1) * l6OpenCells.length / 7.5)] || { x: 8 * (i + 1), z: 0 };
          const g = new THREE.Group(); g.position.set(cell.x, 1.25, cell.z);
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.32), pipeMat);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lMat); bulb.position.set(0, 0.22, 0.18);
          const pt = new THREE.PointLight(0xef4444, 0.9, 6.5); pt.position.set(0, 0.22, 0.35);
          g.add(box, bulb, pt); level6Group.add(g);
          l6Switches.push({ x: cell.x, z: cell.z, active: false, lMat, light: pt });
        }
        const ex = pickRandomFarExitCell(l6OpenCells, l6Spawn);
        l6Exit.x = ex.x; l6Exit.z = ex.z;
        const eg = new THREE.Group(); eg.position.set(ex.x, 0, ex.z);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.2, 0.45), pipeMat); frame.position.y = 1.6;
        l6Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.42, 0.52), l6Exit.signMat); sign.position.y = 3.05;
        l6Exit.light = new THREE.PointLight(0xef4444, 1.4, 10); l6Exit.light.position.set(0, 2.4, 1.2);
        eg.add(frame, sign, l6Exit.light); level6Group.add(eg);
        loadGlbIntoGroup('metal_door.glb', eg, { x: 0, y: 0, z: 0.05, rotY: 0, targetH: 2.75, flatZ: true });
      }

      // --- LEVEL 7: THALASSOPHOBIA (Endless Dark Ocean + Floating Docks + 5 Glowing Buoys) ---
      let l7Spawn = new THREE.Vector3(0, 1.85, 0), l7MonsterSpawn = new THREE.Vector3(0, -0.4, -42);
      const l7Buoys = [], l7Docks = [], l7Exit = { x: 0, z: -76, unlocked: true, signMat: null, light: null };
      function buildLevel7() {
        l7Buoys.length = 0; l7Docks.length = 0;
        const oceanMat = new THREE.MeshStandardMaterial({ color: 0x041e2f, roughness: 0.15, metalness: 0.45, transparent: true, opacity: 0.92 });
        const ocean = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), oceanMat);
        ocean.rotation.x = -Math.PI / 2; ocean.position.y = 0.0; level7Group.add(ocean);
        const abyss = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshBasicMaterial({ color: 0x020810 }));
        abyss.rotation.x = -Math.PI / 2; abyss.position.y = -2.6; level7Group.add(abyss);
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
        const dockCoords = [
          { x: 0, z: 0, w: 9, d: 9 },
          { x: 0, z: -15, w: 5, d: 14 },
          { x: -16, z: -26, w: 12, d: 6 },
          { x: 16, z: -26, w: 12, d: 6 },
          { x: -24, z: -46, w: 8, d: 14 },
          { x: 24, z: -46, w: 8, d: 14 },
          { x: 0, z: -56, w: 18, d: 7 },
          { x: 0, z: -74, w: 11, d: 11 }
        ];
        dockCoords.forEach((dc) => {
          const deck = new THREE.Mesh(new THREE.BoxGeometry(dc.w, 0.45, dc.d), woodMat);
          deck.position.set(dc.x, 0.18, dc.z); level7Group.add(deck);
          l7Docks.push({ x: dc.x, z: dc.z, hw: dc.w / 2, hd: dc.d / 2 });
        });
        loadGlbIntoGroup('house.glb', level7Group, { x: -34, y: -1.4, z: -32, rotY: 0.4, targetH: 7.5 });
        loadGlbIntoGroup('house.glb', level7Group, { x: 36, y: -1.6, z: -58, rotY: -0.6, targetH: 7.5 });
        const buoyCoords = [{ x: -18, z: -26 }, { x: 18, z: -26 }, { x: -24, z: -50 }, { x: 24, z: -50 }, { x: 0, z: -56 }];
        buoyCoords.forEach((bc) => {
          const bg = new THREE.Group(); bg.position.set(bc.x, 0.4, bc.z);
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.2, 8), new THREE.MeshLambertMaterial({ color: 0x334155 }));
          pole.position.y = 1.1;
          const lMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), lMat); orb.position.y = 2.35;
          const pt = new THREE.PointLight(0x38bdf8, 1.4, 13); pt.position.y = 2.4;
          bg.add(pole, orb, pt); level7Group.add(bg);
          loadGlbIntoGroup('buoy.glb', bg, { x: 0, y: -0.25, z: 0, rotY: 0, targetH: 2.6 });
          l7Buoys.push({ x: bc.x, z: bc.z, active: false, lMat, light: pt });
        });
        const eg = new THREE.Group(); eg.position.set(l7Exit.x, 0.4, l7Exit.z);
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.5, 6.5, 10), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        tower.position.y = 3.25;
        l7Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), l7Exit.signMat); beacon.position.y = 6.9;
        l7Exit.light = new THREE.PointLight(0xef4444, 2.0, 22); l7Exit.light.position.y = 7.0;
        eg.add(tower, beacon, l7Exit.light); level7Group.add(eg);
        loadGlbIntoGroup('door_anim.glb', eg, { x: 0, y: 0, z: 1.45, rotY: 0, targetH: 2.7, flatZ: true });
      }

      // --- LEVEL 8: CAVE SYSTEM (Subterranean Rock Cavern + 6 Glowing Crystals) ---
      let l8Spawn = new THREE.Vector3(0, 1.65, 0), l8MonsterSpawn = new THREE.Vector3(24, 0, 24);
      const l8OpenCells = [], l8Crystals = [], l8Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      function buildLevel8() {
        l8Boxes.length = 0; l8Crystals.length = 0; l8OpenCells.length = 0;
        const CELL8 = 8.0, H8 = 4.8;
        const maze = generateWindingMaze(101, 101, 0.22, 4);
        const rows = maze.length, cols = maze[0].length;
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x2e2a38, map: l1WallTex });
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL8, rows * CELL8), new THREE.MeshLambertMaterial({ color: 0x181620 }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level8Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL8, rows * CELL8), new THREE.MeshLambertMaterial({ color: 0x100e16 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H8; level8Group.add(cl);
        const wGeo = new THREE.BoxGeometry(CELL8, H8, CELL8);
        const wPos8 = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (c - cols / 2 + 0.5) * CELL8, z = (r - rows / 2 + 0.5) * CELL8;
            if (maze[r][c] === '#') {
              wPos8.push({ x, z });
              l8Boxes.push({ x, z, half: CELL8 / 2 });
            } else {
              l8OpenCells.push({ x, z });
            }
          }
        }
        const inst8 = new THREE.InstancedMesh(wGeo, rockMat, wPos8.length);
        const dm8 = new THREE.Object3D();
        wPos8.forEach((p, idx) => { dm8.position.set(p.x, H8 / 2, p.z); dm8.updateMatrix(); inst8.setMatrixAt(idx, dm8.matrix); });
        inst8.instanceMatrix.needsUpdate = true; level8Group.add(inst8);
        const sp = l8OpenCells[1] || { x: 0, z: 0 };
        l8Spawn.set(sp.x, 1.65, sp.z);
        const ms = l8OpenCells[Math.floor(l8OpenCells.length * 0.78)] || { x: 24, z: 24 };
        l8MonsterSpawn.set(ms.x, 0, ms.z);
        for (let i = 0; i < 6; i++) {
          const cell = l8OpenCells[Math.floor((i + 1) * l8OpenCells.length / 7.5)] || { x: 10, z: 10 };
          const cg = new THREE.Group(); cg.position.set(cell.x, 0.85, cell.z);
          const cMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa });
          const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), cMat);
          shard.scale.set(0.7, 1.7, 0.7);
          const pt = new THREE.PointLight(0x8b5cf6, 1.4, 9.5); pt.position.y = 0.5;
          cg.add(shard, pt); level8Group.add(cg);
          loadGlbIntoGroup('crystal.glb', cg, { x: 0, y: -0.5, z: 0, rotY: i * 0.8, targetH: 1.45 });
          l8Crystals.push({ x: cell.x, z: cell.z, taken: false, mesh: cg, light: pt });
        }
        const ex = pickRandomFarExitCell(l8OpenCells, l8Spawn);
        l8Exit.x = ex.x; l8Exit.z = ex.z;
        const eg = new THREE.Group(); eg.position.set(ex.x, 0, ex.z);
        const arch = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.4, 0.55), rockMat); arch.position.y = 1.7;
        l8Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), l8Exit.signMat); gem.position.set(0, 3.1, 0.35);
        l8Exit.light = new THREE.PointLight(0xef4444, 1.6, 12); l8Exit.light.position.set(0, 2.3, 1.2);
        eg.add(arch, gem, l8Exit.light); level8Group.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.75, flatZ: true });
      }


      // ============================================================
      // LEVEL 188 (Courtyard of Windows), LEVEL 974 (Kitty's House), LEVEL 3999 (The True Ending)
      // ============================================================
      let l188Spawn = new THREE.Vector3(0, 1.65, 16), l188MonsterSpawn = new THREE.Vector3(0, 0, -14);
      const l188Tvs = [], l188Exit = { x: 0, z: -28, unlocked: true, signMat: null, light: null };
      function buildLevel188() {
        l188Boxes.length = 0; l188Tvs.length = 0;
        const W188 = 60, H188 = 16;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W188, W188), new THREE.MeshLambertMaterial({ color: 0x334155, map: l1FloorTex }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level188Group.add(fl);
        const sky = new THREE.Mesh(new THREE.PlaneGeometry(W188, W188), new THREE.MeshBasicMaterial({ color: 0x1e293b }));
        sky.rotation.x = Math.PI / 2; sky.position.y = H188; level188Group.add(sky);
        const wallM = new THREE.MeshLambertMaterial({ color: 0x64748b });
        const winDark = new THREE.MeshBasicMaterial({ color: 0x090d16 });
        const winGlow = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
        const eyeM = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sides = [
          { x: 0, z: -29.5, w: 60, d: 1.2, rx: 0 },
          { x: 0, z: 29.5, w: 60, d: 1.2, rx: 0 },
          { x: -29.5, z: 0, w: 1.2, d: 60, rx: 1 },
          { x: 29.5, z: 0, w: 1.2, d: 60, rx: 1 }
        ];
        sides.forEach((s) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(s.w, H188, s.d), wallM);
          m.position.set(s.x, H188 / 2, s.z); level188Group.add(m);
          l188Boxes.push({ x: s.x, z: s.z, halfX: s.w / 2, halfZ: s.d / 2 });
          for (let flr = 0; flr < 3; flr++) {
            for (let k = -3; k <= 3; k++) {
              const isLit = ((flr + k) % 3 === 0);
              const wm = new THREE.Mesh(new THREE.BoxGeometry(s.rx ? 0.2 : 2.6, 2.4, s.rx ? 2.6 : 0.2), isLit ? winGlow : winDark);
              const px = s.rx ? (s.x > 0 ? s.x - 0.65 : s.x + 0.65) : k * 5.6;
              const pz = s.rx ? k * 5.6 : (s.z > 0 ? s.z - 0.65 : s.z + 0.65);
              wm.position.set(px, 3.2 + flr * 4.2, pz); level188Group.add(wm);
              if (!isLit && (flr + k) % 2 === 0) {
                const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), eyeM);
                e1.position.set(px + (s.rx ? 0 : -0.15), 3.3 + flr * 4.2, pz + (s.rx ? -0.15 : 0));
                const e2 = e1.clone();
                e2.position.set(px + (s.rx ? 0 : 0.15), 3.3 + flr * 4.2, pz + (s.rx ? 0.15 : 0));
                level188Group.add(e1, e2);
              }
            }
          }
        });
        [[-8, -8], [8, -8], [-8, 8], [8, 8]].forEach(([px, pz]) => {
          const pil = new THREE.Mesh(new THREE.BoxGeometry(2.2, H188, 2.2), wallM);
          pil.position.set(px, H188 / 2, pz); level188Group.add(pil);
          l188Boxes.push({ x: px, z: pz, half: 1.1 });
        });
        const tvSpots = [[-16, -15], [16, -15], [-16, 15], [16, 15]];
        tvSpots.forEach(([tx, tz]) => {
          const tg = new THREE.Group(); tg.position.set(tx, 0, tz);
          const pt = new THREE.PointLight(0x38bdf8, 1.2, 7); pt.position.y = 1.4;
          tg.add(pt); level188Group.add(tg);
          loadGlbIntoGroup('crt_pc.glb', tg, { x: 0, y: 0.7, z: 0, rotY: 0, targetH: 0.85 });
          l188Tvs.push({ x: tx, z: tz, taken: false, mesh: tg });
        });
        const eg = new THREE.Group(); eg.position.set(l188Exit.x, 0, l188Exit.z);
        l188Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.4), l188Exit.signMat); sign.position.y = 3.1;
        l188Exit.light = new THREE.PointLight(0xef4444, 1.6, 11); l188Exit.light.position.set(0, 2.5, 1.2);
        eg.add(sign, l188Exit.light); level188Group.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0, rotY: 0, targetH: 2.8, flatZ: true });
      }

      let l974Spawn = new THREE.Vector3(0, 1.65, 16), l974MonsterSpawn = new THREE.Vector3(0, 0, -14);
      const l974Items = [], l974Exit = { x: 0, z: -26.5, unlocked: true, signMat: null, light: null };
      function buildLevel974() {
        l974Boxes.length = 0; l974Items.length = 0;
        const W974 = 56, H974 = 4.4;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W974, W974), new THREE.MeshLambertMaterial({ color: 0xfce7f3 }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level974Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W974, W974), new THREE.MeshLambertMaterial({ color: 0xfdf2f8 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H974; level974Group.add(cl);
        const pinkWall = new THREE.MeshLambertMaterial({ color: 0xf9a8d4 });
        const trimWall = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
        const addW = (x, z, w, d) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H974, d), pinkWall);
          m.position.set(x, H974 / 2, z); level974Group.add(m);
          l974Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        };
        addW(0, -28, 56, 1.2); addW(0, 28, 56, 1.2); addW(-28, 0, 1.2, 56); addW(28, 0, 1.2, 56);
        addW(-9, 0, 10, 0.8); addW(9, 0, 10, 0.8);
        addW(0, -10, 0.8, 10);
        loadGlbIntoGroup('hotel_bed.glb', level974Group, { x: -14, y: 0, z: -14, rotY: 0, targetH: 1.25 });
        loadGlbIntoGroup('bookshelf.glb', level974Group, { x: 14, y: 0, z: -15, rotY: -Math.PI / 2, targetH: 2.5 });
        loadGlbIntoGroup('sink_cabinet.glb', level974Group, { x: 15, y: 0, z: 8, rotY: -Math.PI / 2, targetH: 1.05 });
        const starCoords = [[-14, 12], [14, 12], [-15, -6], [15, -6], [-6, -15], [6, -15]];
        starCoords.forEach(([sx, sz]) => {
          const sg = new THREE.Group(); sg.position.set(sx, 1.1, sz);
          const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
          const pt = new THREE.PointLight(0xf472b6, 1.1, 7.5);
          sg.add(star, pt); level974Group.add(sg);
          l974Items.push({ x: sx, z: sz, taken: false, mesh: sg });
        });
        const eg = new THREE.Group(); eg.position.set(l974Exit.x, 0, l974Exit.z);
        l974Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 0.35), trimWall); sign.position.y = 3.1;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), l974Exit.signMat); dot.position.set(0, 3.1, 0.25);
        l974Exit.light = new THREE.PointLight(0xef4444, 1.5, 10); l974Exit.light.position.set(0, 2.5, 1.2);
        eg.add(sign, dot, l974Exit.light); level974Group.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0, rotY: 0, targetH: 2.8, flatZ: true });
      }

      let l3999Spawn = new THREE.Vector3(0, 1.65, 22);
      const l3999Tasks = [], l3999Exit = { x: 0, z: -26, unlocked: true, signMat: null, light: null };
      function buildLevel3999() {
        l3999Boxes.length = 0; l3999Tasks.length = 0;
        const W3999 = 800, H3999 = 6.8;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W3999, W3999), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level3999Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W3999, W3999), new THREE.MeshLambertMaterial({ color: 0x020617 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H3999; level3999Group.add(cl);
        const wallM = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
        const addW = (x, z, w, d) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H3999, d), wallM);
          m.position.set(x, H3999 / 2, z); level3999Group.add(m);
          l3999Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        };
        addW(0, -395, 800, 1.5); addW(0, 395, 800, 1.5); addW(-395, 0, 1.5, 800); addW(395, 0, 1.5, 800);
        // Neon floor strips
        [-12, 0, 12].forEach((nx) => {
          const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 52), new THREE.MeshBasicMaterial({ color: nx === 0 ? 0x38bdf8 : 0xe879f9 }));
          strip.rotation.x = -Math.PI / 2; strip.position.set(nx, 0.03, 0); level3999Group.add(strip);
        });
        // Arcade vending & CRT rows
        [[-18, -10], [-18, 6], [18, -10], [18, 6]].forEach(([vx, vz]) => {
          loadGlbIntoGroup('vending_machine.glb', level3999Group, { x: vx, y: 0, z: vz, rotY: vx < 0 ? Math.PI / 2 : -Math.PI / 2, targetH: 2.2 });
          l3999Boxes.push({ x: vx, z: vz, half: 0.9 });
        });
        const taskCoords = [[-12, 14], [12, 14], [-12, 0], [12, 0], [-12, -14], [12, -14]];
        taskCoords.forEach(([tx, tz], idx) => {
          const tg = new THREE.Group(); tg.position.set(tx, 0, tz);
          const lMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), lMat); orb.position.y = 1.5;
          const pt = new THREE.PointLight(idx % 2 === 0 ? 0x38bdf8 : 0xe879f9, 1.4, 9); pt.position.y = 1.6;
          tg.add(orb, pt); level3999Group.add(tg);
          loadGlbIntoGroup('arcade_machine.glb', tg, { x: 0, y: 0, z: 0, rotY: tx < 0 ? Math.PI / 2 : -Math.PI / 2, targetH: 2.05 });
          l3999Tasks.push({ x: tx, z: tz, done: false, lMat, orb, light: pt });
        });
        const eg = new THREE.Group(); eg.position.set(l3999Exit.x, 0, l3999Exit.z);
        l3999Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const portal = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.6, 0.3), l3999Exit.signMat); portal.position.y = 1.8;
        l3999Exit.light = new THREE.PointLight(0xef4444, 2.0, 14); l3999Exit.light.position.set(0, 2.4, 1.5);
        eg.add(portal, l3999Exit.light); level3999Group.add(eg);
        loadGlbIntoGroup('double_door.glb', eg, { x: 0, y: 0, z: 0.25, rotY: 0, targetH: 3.1, flatZ: true });
      }


      // ============================================================
      // LEVEL 33 (Infinite Mall), LEVEL 36 (Timeless Airport), TH3 SH4DY GR3Y
      // ============================================================
      let l33Spawn = new THREE.Vector3(0, 1.65, 22), l33MonsterSpawn = new THREE.Vector3(-18, 0, -18);
      const l33Nodes = [], l33Exit = { x: 0, z: -26, unlocked: true, signMat: null, light: null };
      function buildLevel33() {
        l33Boxes.length = 0; l33Nodes.length = 0;
        const W = 800, H = 6.8;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level33Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level33Group.add(cl);
        const wallM = new THREE.MeshLambertMaterial({ color: 0x134e4a });
        const addW = (x, z, w, d) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), wallM);
          m.position.set(x, H / 2, z); level33Group.add(m);
          l33Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        };
        addW(0, -395, 800, 1.5); addW(0, 395, 800, 1.5); addW(-395, 0, 1.5, 800); addW(395, 0, 1.5, 800);
        [[-14, -8], [14, -8], [-14, 10], [14, 10]].forEach(([sx, sz]) => {
          addW(sx, sz, 10, 1.0);
          loadGlbIntoGroup('shelf.glb', level33Group, { x: sx, y: 0, z: sz + 1.8, rotY: 0, targetH: 1.9 });
          loadGlbIntoGroup('vending_machine.glb', level33Group, { x: sx + 3.5, y: 0, z: sz + 1.8, rotY: 0, targetH: 2.1 });
        });
        [[-6, 12], [7, 4], [-8, -14], [9, -12]].forEach(([cx, cz], idx) => {
          loadGlbIntoGroup('shopping_cart.glb', level33Group, { x: cx, y: 0, z: cz, rotY: idx * 1.1, targetH: 1.05 });
        });
        [[0, 6], [0, -6]].forEach(([bx, bz]) => {
          loadGlbIntoGroup('bench.glb', level33Group, { x: bx, y: 0, z: bz, rotY: Math.PI / 2, targetH: 0.95 });
        });
        [[-18, 16], [18, 16], [-18, 0], [18, 0], [-18, -16], [18, -16]].forEach(([tx, tz]) => {
          const tg = new THREE.Group(); tg.position.set(tx, 0, tz);
          const lMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });
          const orb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), lMat); orb.position.y = 1.45;
          const pt = new THREE.PointLight(0x2dd4bf, 1.2, 8); pt.position.y = 1.5;
          tg.add(orb, pt); level33Group.add(tg);
          loadGlbIntoGroup('crt_pc.glb', tg, { x: 0, y: 0.6, z: 0, rotY: 0, targetH: 0.75 });
          l33Nodes.push({ x: tx, z: tz, done: false, lMat, light: pt, orb });
        });
        const eg = new THREE.Group(); eg.position.set(l33Exit.x, 0, l33Exit.z);
        l33Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.35), l33Exit.signMat); s.position.y = 3.2;
        l33Exit.light = new THREE.PointLight(0xef4444, 1.6, 12); l33Exit.light.position.set(0, 2.5, 1.2);
        eg.add(s, l33Exit.light); level33Group.add(eg);
        loadGlbIntoGroup('double_door.glb', eg, { x: 0, y: 0, z: 0.2, rotY: 0, targetH: 2.9, flatZ: true });

        // Real-Time 3D Player Reflection inside Mirrors (uses selected player skin GLB!)
        window.__zulmatMirrorRef = { group: new THREE.Group(), mixer: null, coords: [[-18, 0], [18, 0], [-32, -24], [32, -24], [0, -16], [-14, -36], [14, -36]] };
        const refLight = new THREE.PointLight(0xe9d5ff, 1.4, 7);
        refLight.position.set(0, 2.1, 0.8);
        window.__zulmatMirrorRef.group.add(refLight);
        window.__zulmatMirrorRef.group.visible = false;
        levelMirrorGroup.add(window.__zulmatMirrorRef.group);
        if (typeof gltfLoader !== 'undefined') {
          const sk = LSget('zulmat_player_skin') || 'businessman';
          const skFile = ({ businessman: 'player_businessman.glb', tvman: 'player_tvman.glb', casual: 'player_casual.glb', man: 'player_man.glb', girl: 'player_girl.glb', hazmat: 'player_hazmat.glb', survivor: 'player_survivor.glb', anime_boy: 'player_anime_boy.glb', anime_girl: 'player_anime_girl.glb', fashion_girl: 'player_fashion_girl.glb' })[sk] || 'player_businessman.glb';
          gltfLoader.load(REPO_GLB_BASE + skFile, (gltf) => {
            if (!window.__zulmatMirrorRef) return;
            const m = gltf.scene;
            if (window.__zulmatNormalizeRigged) window.__zulmatNormalizeRigged(m, 1.72);
            window.__zulmatMirrorRef.group.add(m);
            if (gltf.animations && gltf.animations.length) {
              window.__zulmatMirrorRef.mixer = new THREE.AnimationMixer(m);
              window.__zulmatMirrorRef.mixer.clipAction(gltf.animations[0]).play();
            }
          }, undefined, () => {});
        }
      }

      let l36Spawn = new THREE.Vector3(0, 1.65, 22), l36MonsterSpawn = new THREE.Vector3(16, 0, -16);
      const l36Tickets = [], l36Exit = { x: 0, z: -26, unlocked: true, signMat: null, light: null };
      function buildLevel36() {
        l36Boxes.length = 0; l36Tickets.length = 0;
        const W = 800, H = 7.2;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level36Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level36Group.add(cl);
        const wallM = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const addW = (x, z, w, d) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), wallM);
          m.position.set(x, H / 2, z); level36Group.add(m);
          l36Boxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        };
        addW(0, -395, 800, 1.5); addW(0, 395, 800, 1.5); addW(-395, 0, 1.5, 800); addW(395, 0, 1.5, 800);
        // Airport check-in counters, waiting benches & tarmac airplane!
        [[-10, 0], [10, 0], [-10, -14], [10, -14]].forEach(([px, pz]) => {
          addW(px, pz, 2.2, 2.2);
          loadGlbIntoGroup('cabinet.glb', level36Group, { x: px + 2.4, y: 0, z: pz, rotY: 0, targetH: 1.05 });
        });
        [[-14, 6], [-14, 12], [14, 6], [14, 12]].forEach(([bx, bz]) => {
          loadGlbIntoGroup('bench.glb', level36Group, { x: bx, y: 0, z: bz, rotY: bx < 0 ? Math.PI / 2 : -Math.PI / 2, targetH: 0.95 });
        });
        loadGlbIntoGroup('airplane.glb', level36Group, { x: 0, y: 0, z: -42, rotY: Math.PI / 4, targetH: 7.5 });
        [[-16, 14], [16, 14], [-18, -6], [18, -6], [0, -10]].forEach(([tx, tz]) => {
          const tg = new THREE.Group(); tg.position.set(tx, 1.15, tz);
          const card = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.06), new THREE.MeshBasicMaterial({ color: 0x60a5fa }));
          const pt = new THREE.PointLight(0x60a5fa, 1.2, 8);
          tg.add(card, pt); level36Group.add(tg);
          loadGlbIntoGroup('keycard.glb', tg, { x: 0, y: 0, z: 0, rotY: 0.4, targetH: 0.42 });
          l36Tickets.push({ x: tx, z: tz, taken: false, mesh: tg });
        });
        const eg = new THREE.Group(); eg.position.set(l36Exit.x, 0, l36Exit.z);
        l36Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.35), l36Exit.signMat); s.position.y = 3.2;
        l36Exit.light = new THREE.PointLight(0xef4444, 1.6, 12); l36Exit.light.position.set(0, 2.5, 1.2);
        eg.add(s, l36Exit.light); level36Group.add(eg);
        loadGlbIntoGroup('metal_door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true });
      }

      let lShadySpawn = new THREE.Vector3(0, 1.65, 0), lShadyMonsterSpawn = new THREE.Vector3(20, 0, 20);
      const lShadyOpenCells = [], lShadyAnomalies = [], lShadyExit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      function buildLevelShady() {
        lShadyAnomalies.length = 0; lShadyBoxes.length = 0; lShadyOpenCells.length = 0;
        const CELL = 8.0, H = 4.2;
        const maze = generateWindingMaze(101, 101, 0.22, 4);
        const rows = maze.length, cols = maze[0].length;
        const greyMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, map: l1WallTex });
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), new THREE.MeshLambertMaterial({ color: 0x18181b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; levelShadyGroup.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), new THREE.MeshLambertMaterial({ color: 0x09090b }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; levelShadyGroup.add(cl);
        const wGeo = new THREE.BoxGeometry(CELL, H, CELL);
        const wPosS = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (c - cols / 2 + 0.5) * CELL, z = (r - rows / 2 + 0.5) * CELL;
            if (maze[r][c] === '#') {
              wPosS.push({ x, z });
              lShadyBoxes.push({ x, z, half: CELL / 2 });
            } else lShadyOpenCells.push({ x, z });
          }
        }
        const instS = new THREE.InstancedMesh(wGeo, greyMat, wPosS.length);
        const dmS = new THREE.Object3D();
        wPosS.forEach((p, idx) => { dmS.position.set(p.x, H / 2, p.z); dmS.updateMatrix(); instS.setMatrixAt(idx, dmS.matrix); });
        instS.instanceMatrix.needsUpdate = true; levelShadyGroup.add(instS);
        const sp = lShadyOpenCells[1] || { x: 0, z: 0 }; lShadySpawn.set(sp.x, 1.65, sp.z);
        const ms = lShadyOpenCells[Math.floor(lShadyOpenCells.length * 0.75)] || { x: 18, z: 18 }; lShadyMonsterSpawn.set(ms.x, 0, ms.z);
        for (let i = 0; i < 5; i++) {
          const cell = lShadyOpenCells[Math.floor((i + 1) * lShadyOpenCells.length / 6.5)] || { x: 10, z: 10 };
          const ag = new THREE.Group(); ag.position.set(cell.x, 1.2, cell.z);
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshBasicMaterial({ color: 0xe4e4e7 }));
          const pt = new THREE.PointLight(0xd4d4d8, 1.2, 8);
          ag.add(orb, pt); levelShadyGroup.add(ag);
          lShadyAnomalies.push({ x: cell.x, z: cell.z, taken: false, mesh: ag });
        }
        const ex = pickRandomFarExitCell(lShadyOpenCells, lShadySpawn);
        lShadyExit.x = ex.x; lShadyExit.z = ex.z;
        const eg = new THREE.Group(); eg.position.set(ex.x, 0, ex.z);
        lShadyExit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.35), lShadyExit.signMat); s.position.y = 3.0;
        lShadyExit.light = new THREE.PointLight(0xef4444, 1.5, 10); lShadyExit.light.position.set(0, 2.4, 1.2);
        eg.add(s, lShadyExit.light); levelShadyGroup.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.75, flatZ: true });
      }



      // ============================================================
      // LEVELS 14, 15, 22, 46, MANILA ROOM & MIRROR LABYRINTH (800m x 800m)
      // ============================================================
      let l14Spawn = new THREE.Vector3(0, 1.65, 28), l14MonsterSpawn = new THREE.Vector3(-24, 0, -24);
      const l14Nodes = [], l14Exit = { x: 0, z: -48, unlocked: true, signMat: null, light: null };
      function buildLevel14() {
        l14Boxes.length = 0; l14Nodes.length = 0;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x26080b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level14Group.add(fl);
        const rim = new THREE.MeshLambertMaterial({ color: 0x450a0a });
        [[-22, 0], [22, 0], [-40, -30], [40, -30], [0, -18]].forEach(([px, pz]) => {
          const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.5, 3.2), rim); p.position.set(px, 3.25, pz); level14Group.add(p);
          l14Boxes.push({ x: px, z: pz, half: 1.6 });
        });
        loadGlbIntoGroup('hospital_bed.glb', level14Group, { x: -12, y: 0, z: 10, rotY: 0.4, targetH: 1.15 });
        loadGlbIntoGroup('hospital_bed.glb', level14Group, { x: 14, y: 0, z: -26, rotY: -0.5, targetH: 1.15 });
        [-16, -34, -52].forEach((az) => {
          const archTop = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 2.2), new THREE.MeshLambertMaterial({ color: 0x3b1218 }));
          archTop.position.set(0, 5.6, az);
          level14Group.add(archTop);
        });
        [[-18, 14], [18, 14], [-26, -20], [26, -20], [0, -32]].forEach(([nx, nz]) => {
          const g = new THREE.Group(); g.position.set(nx, 1.3, nz);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), lMat);
          const pt = new THREE.PointLight(0xef4444, 1.4, 12); g.add(orb, pt); level14Group.add(g);
          l14Nodes.push({ x: nx, z: nz, done: false, lMat, orb, light: pt });
        });
        const eg = new THREE.Group(); eg.position.set(l14Exit.x, 0, l14Exit.z);
        l14Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.35), l14Exit.signMat); s.position.y = 3.2;
        l14Exit.light = new THREE.PointLight(0xef4444, 1.8, 14); l14Exit.light.position.set(0, 2.5, 1.2);
        eg.add(s, l14Exit.light); level14Group.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true }); loadGlbIntoGroup('exit_sign.glb', eg, { x: 0, y: 2.92, z: 0.28, rotY: 0, targetH: 0.44 });
      }

      let l15Spawn = new THREE.Vector3(0, 1.65, 0), l15MonsterSpawn = new THREE.Vector3(24, 0, 24);
      const l15OpenCells = [], l15Cores = [], l15Exit = { x: 0, z: 0, unlocked: true, signMat: null, light: null };
      function buildLevel15() {
        l15Boxes.length = 0; l15Cores.length = 0; l15OpenCells.length = 0;
        const CELL = 8.0, H = 4.6;
        const maze = generateWindingMaze(101, 101, 0.20, 4);
        const rows = maze.length, cols = maze[0].length;
        const sciMat = new THREE.MeshLambertMaterial({ color: 0xe0f2fe });
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), new THREE.MeshLambertMaterial({ color: 0x0c4a6e }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level15Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(cols * CELL, rows * CELL), new THREE.MeshLambertMaterial({ color: 0x082f49 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = H; level15Group.add(cl);
        const wGeo = new THREE.BoxGeometry(CELL, H, CELL), wPos = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const x = (c - cols / 2 + 0.5) * CELL, z = (r - rows / 2 + 0.5) * CELL;
          if (maze[r][c] === '#') { wPos.push({ x, z }); l15Boxes.push({ x, z, half: CELL / 2 }); }
          else l15OpenCells.push({ x, z });
        }
        const inst = new THREE.InstancedMesh(wGeo, sciMat, wPos.length), dm = new THREE.Object3D();
        wPos.forEach((p, idx) => { dm.position.set(p.x, H / 2, p.z); dm.updateMatrix(); inst.setMatrixAt(idx, dm.matrix); });
        inst.instanceMatrix.needsUpdate = true; level15Group.add(inst);
        const neonRibMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        [-12, -28, -44, -60].forEach((rz) => {
          const rib = new THREE.Mesh(new THREE.BoxGeometry(26, 0.16, 0.24), neonRibMat);
          rib.position.set(0, 4.4, rz);
          level15Group.add(rib);
        });
        const sp = l15OpenCells[1] || { x: 0, z: 0 }; l15Spawn.set(sp.x, 1.65, sp.z);
        const ms = l15OpenCells[Math.floor(l15OpenCells.length * 0.72)] || { x: 24, z: 24 }; l15MonsterSpawn.set(ms.x, 0, ms.z);
        for (let i = 0; i < 5; i++) {
          const cell = l15OpenCells[Math.floor((i + 1) * l15OpenCells.length / 6.5)] || { x: 10, z: 10 };
          const cg = new THREE.Group(); cg.position.set(cell.x, 0, cell.z);
          const lMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), lMat); orb.position.y = 1.45;
          const pt = new THREE.PointLight(0x22d3ee, 1.4, 10); pt.position.y = 1.5;
          cg.add(orb, pt); level15Group.add(cg);
          loadGlbIntoGroup('crt_pc.glb', cg, { x: 0, y: 0.6, z: 0, rotY: 0, targetH: 0.75 });
          l15Cores.push({ x: cell.x, z: cell.z, done: false, lMat, orb, light: pt });
        }
        const ex = pickRandomFarExitCell(l15OpenCells, l15Spawn); l15Exit.x = ex.x; l15Exit.z = ex.z;
        const eg = new THREE.Group(); eg.position.set(ex.x, 0, ex.z);
        l15Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.35), l15Exit.signMat); s.position.y = 3.2;
        l15Exit.light = new THREE.PointLight(0xef4444, 1.6, 12); l15Exit.light.position.set(0, 2.4, 1.2);
        eg.add(s, l15Exit.light); level15Group.add(eg);
        loadGlbIntoGroup('metal_door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true });
      }

      let l22Spawn = new THREE.Vector3(0, 1.65, 28), l22MonsterSpawn = new THREE.Vector3(-24, 0, -24);
      const l22Switches = [], l22Exit = { x: 0, z: -60, unlocked: true, signMat: null, light: null };
      function buildLevel22() {
        l22Boxes.length = 0; l22Switches.length = 0;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level22Group.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
        cl.rotation.x = Math.PI / 2; cl.position.y = 4.6; level22Group.add(cl);
        const pilMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        for (let px = -60; px <= 60; px += 20) for (let pz = -60; pz <= 40; pz += 20) {
          if (px === 0 && pz === 0) continue;
          const m = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.6, 2.0), pilMat); m.position.set(px, 2.3, pz); level22Group.add(m);
          l22Boxes.push({ x: px, z: pz, half: 1.0 });
        }
        [[-12, 10], [12, -10], [-28, -28], [28, 12]].forEach(([cx, cz], idx) => {
          loadGlbIntoGroup('car.glb', level22Group, { x: cx, y: 0, z: cz, rotY: idx * 1.4, targetH: 1.6 });
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 18), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          stripe.position.set(cx > 0 ? 6.5 : -6.5, 0.02, cz);
          level22Group.add(stripe);
          l22Boxes.push({ x: cx, z: cz, half: 1.5 });
        });
        [[-16, 18], [16, 18], [-24, -12], [24, -12], [-18, -42], [18, -42]].forEach(([sx, sz]) => {
          const g = new THREE.Group(); g.position.set(sx, 1.3, sz);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
          const bx = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.3), lMat);
          const pt = new THREE.PointLight(0xfacc15, 1.2, 10); g.add(bx, pt); level22Group.add(g);
          l22Switches.push({ x: sx, z: sz, active: false, lMat, light: pt });
        });
        const eg = new THREE.Group(); eg.position.set(l22Exit.x, 0, l22Exit.z);
        l22Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.35), l22Exit.signMat); s.position.y = 3.2;
        l22Exit.light = new THREE.PointLight(0xef4444, 1.6, 12); l22Exit.light.position.set(0, 2.4, 1.2);
        eg.add(s, l22Exit.light); level22Group.add(eg);
        loadGlbIntoGroup('metal_door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true });
      }

      let l46Spawn = new THREE.Vector3(0, 1.65, 24), l46MonsterSpawn = new THREE.Vector3(30, 0, -30);
      const l46Obelisks = [], l46Exit = { x: 0, z: -72, unlocked: true, signMat: null, light: null };
      function buildLevel46() {
        l46Boxes.length = 0; l46Obelisks.length = 0;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; level46Group.add(fl);
        const stoneM = new THREE.MeshLambertMaterial({ color: 0xb45309 });
        [[-16, 18], [16, 18], [-28, -14], [28, -14], [-14, -56], [14, -56]].forEach(([px, pz], idx) => {
          loadGlbIntoGroup(idx % 2 === 0 ? 'palm_tree.glb' : 'coconut_palm.glb', level46Group, { x: px, y: 0, z: pz, rotY: idx * 0.9, targetH: 6.8 });
        if (idx === 0) {
          const oasis = new THREE.Mesh(new THREE.CircleGeometry(7.2, 24), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.72, roughness: 0.15, metalness: 0.25 }));
          oasis.rotation.x = -Math.PI / 2; oasis.position.set(0, 0.04, -30);
          level46Group.add(oasis);
        }
        });
        [[-22, 12], [22, 12], [-34, -26], [34, -26], [0, -48]].forEach(([ox, oz]) => {
          const g = new THREE.Group(); g.position.set(ox, 0, oz);
          const ob = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.8, 1.4), stoneM); ob.position.y = 2.4;
          const lMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), lMat); gem.position.y = 5.3;
          const pt = new THREE.PointLight(0x38bdf8, 1.4, 12); pt.position.y = 5.2;
          g.add(ob, gem, pt); level46Group.add(g);
          l46Boxes.push({ x: ox, z: oz, half: 0.75 });
          l46Obelisks.push({ x: ox, z: oz, active: false, lMat, light: pt });
        });
        const eg = new THREE.Group(); eg.position.set(l46Exit.x, 0, l46Exit.z);
        l46Exit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.35), l46Exit.signMat); s.position.y = 3.2;
        l46Exit.light = new THREE.PointLight(0xef4444, 1.8, 14); l46Exit.light.position.set(0, 2.5, 1.2);
        eg.add(s, l46Exit.light); level46Group.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true }); loadGlbIntoGroup('exit_sign.glb', eg, { x: 0, y: 2.92, z: 0.28, rotY: 0, targetH: 0.44 });
      }

      let lManilaSpawn = new THREE.Vector3(0, 1.65, 14);
      const lManilaFiles = [], lManilaExit = { x: 0, z: -26, unlocked: true, signMat: null, light: null };
      function buildLevelManila() {
        lManilaBoxes.length = 0; lManilaFiles.length = 0;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x451a03, map: l0FloorTex }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; levelManilaGroup.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x292524 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = 4.2; levelManilaGroup.add(cl);
        const wM = new THREE.MeshLambertMaterial({ color: 0xa8a06c, map: backWallTex });
        [[0, -28, 56, 1.2], [0, 28, 56, 1.2], [-28, 0, 1.2, 56], [28, 0, 1.2, 56]].forEach(([x, z, w, d]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, 4.2, d), wM); m.position.set(x, 2.1, z); levelManilaGroup.add(m);
          lManilaBoxes.push({ x, z, halfX: w / 2, halfZ: d / 2 });
        });
        loadGlbIntoGroup('bookshelf.glb', levelManilaGroup, { x: -12, y: 0, z: -12, rotY: 0.5, targetH: 2.5 });
        loadGlbIntoGroup('cabinet.glb', levelManilaGroup, { x: 12, y: 0, z: -12, rotY: -0.5, targetH: 1.05 });
        [[-10, 6], [10, 6], [-10, -8], [10, -8]].forEach(([fx, fz]) => {
          const g = new THREE.Group(); g.position.set(fx, 1.1, fz);
          const doc = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.58), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
          const pt = new THREE.PointLight(0xfacc15, 1.1, 8); g.add(doc, pt); levelManilaGroup.add(g);
          lManilaFiles.push({ x: fx, z: fz, taken: false, mesh: g });
        });
        const eg = new THREE.Group(); eg.position.set(lManilaExit.x, 0, lManilaExit.z);
        lManilaExit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.35), lManilaExit.signMat); s.position.y = 3.1;
        lManilaExit.light = new THREE.PointLight(0xef4444, 1.5, 10); lManilaExit.light.position.set(0, 2.4, 1.2);
        eg.add(s, lManilaExit.light); levelManilaGroup.add(eg);
        loadGlbIntoGroup('door.glb', eg, { x: 0, y: 0, z: 0.1, rotY: 0, targetH: 2.8, flatZ: true }); loadGlbIntoGroup('exit_sign.glb', eg, { x: 0, y: 2.92, z: 0.28, rotY: 0, targetH: 0.44 });
      }

      let lMirrorSpawn = new THREE.Vector3(0, 1.65, 24), lMirrorMonsterSpawn = new THREE.Vector3(0, 0, -24);
      const lMirrorShards = [], lMirrorExit = { x: 0, z: -56, unlocked: true, signMat: null, light: null };
      function buildLevelMirror() {
        lMirrorBoxes.length = 0; lMirrorShards.length = 0;
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ color: 0x090414, roughness: 0.08, metalness: 0.85 }));
        fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; levelMirrorGroup.add(fl);
        const cl = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshBasicMaterial({ color: 0x020617 }));
        cl.rotation.x = Math.PI / 2; cl.position.y = 5.4; levelMirrorGroup.add(cl);
        const mirMat = new THREE.MeshStandardMaterial({ color: 0xc4b5fd, roughness: 0.06, metalness: 0.88, transparent: true, opacity: 0.42 });
        [[-18, 0], [18, 0], [-32, -24], [32, -24], [0, -16], [-14, -36], [14, -36]].forEach(([mx, mz], idx) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.4, 0.4), mirMat); m.position.set(mx, 2.7, mz); levelMirrorGroup.add(m);
          loadGlbIntoGroup('mirror_frame.glb', levelMirrorGroup, { x: mx, y: 0.2, z: mz + 0.35, rotY: idx % 2 === 0 ? 0 : Math.PI, targetH: 3.8 });
          lMirrorBoxes.push({ x: mx, z: mz, halfX: 2.1, halfZ: 0.25 });
        });
        [[-22, 12], [22, 12], [-26, -16], [26, -16], [0, -30]].forEach(([sx, sz]) => {
          const g = new THREE.Group(); g.position.set(sx, 1.3, sz);
          const lMat = new THREE.MeshBasicMaterial({ color: 0xe879f9 });
          const sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), lMat); sh.scale.set(0.5, 1.6, 0.5);
          const pt = new THREE.PointLight(0xc084fc, 1.5, 12); g.add(sh, pt); levelMirrorGroup.add(g);
          lMirrorShards.push({ x: sx, z: sz, taken: false, mesh: g });
        });
        const eg = new THREE.Group(); eg.position.set(lMirrorExit.x, 0, lMirrorExit.z);
        lMirrorExit.signMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.35), lMirrorExit.signMat); s.position.y = 3.2;
        lMirrorExit.light = new THREE.PointLight(0xef4444, 1.8, 12); lMirrorExit.light.position.set(0, 2.4, 1.2);
        eg.add(s, lMirrorExit.light); levelMirrorGroup.add(eg);
        loadGlbIntoGroup('double_door.glb', eg, { x: 0, y: 0, z: 0.2, rotY: 0, targetH: 2.9, flatZ: true });
      }

      // ============================================================
      // UNIVERSAL BONUS COLLECTIBLES: Almond Water (100% Restore) + Secret VHS Tapes
      // ============================================================
      const bonusPickups = [];
      function spawnBonusItem(group, zoneName, x, y, z, type) {
        if (typeof spawnGroundPedestal === 'function' && zoneName !== 'level7' && zoneName !== 'level37' && zoneName !== 'level922') {
          const _px = spawnGroundPedestal(group, x, z, (bonusPickups.length % 4) * (Math.PI / 2)); x = _px.x; z = _px.z;
        }
        const g = new THREE.Group();
        const restY = (zoneName === 'level7' || zoneName === 'level37' || zoneName === 'level922') ? 0.02 : 0.92;
        g.position.set(x, restY, z);
        if (type === 'radar') {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.30, 0.08),
            new THREE.MeshBasicMaterial({ color: 0x22c55e })
          );
          const pt = new THREE.PointLight(0x4ade80, 0.95, 6);
          g.add(box, pt);
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('radar.glb', g, { x: 0, y: 0, z: 0, rotY: 0, targetH: 0.34 });
            box.visible = false;
          }
          group.add(g);
          bonusPickups.push({ zone: zoneName, x, z, type: 'radar', mesh: g, taken: false });
          return;
        } else if (type === 'almond') {
          const bottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.16, 0.45, 10),
            new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
          );
          const pt = new THREE.PointLight(0x22d3ee, 0.9, 6);
          g.add(bottle, pt);
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('almond_water.glb', g, { x: 0, y: 0, z: 0, rotY: 0, targetH: 0.46 });
            bottle.visible = false;
          }
        } else {
          const tape = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.24, 0.10),
            new THREE.MeshBasicMaterial({ color: 0x18181b })
          );
          const label = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.12, 0.11),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          const pt = new THREE.PointLight(0xfacc15, 0.9, 6);
          g.add(tape, label, pt);
          const casIdx = (bonusPickups.filter((b) => b.type !== 'almond').length % 6) + 1;
          if (typeof loadGlbIntoGroup === 'function') {
            loadGlbIntoGroup('cassette_1.glb', g, { x: 0, y: 0, z: 0, rotY: 0, targetH: 0.055 });
            tape.visible = false;
            label.visible = false;
          }
          group.add(g);
          bonusPickups.push({ zone: zoneName, x, z, type, casIdx, mesh: g, taken: false });
          return;
        }
        group.add(g);
        bonusPickups.push({ zone: zoneName, x, z, type, mesh: g, taken: false });
      }
      // Spawn Almond Water & 1 Unique Lore Cassette in EVERY ONE of the 31 Levels!
      // Spawn Radar pickups across levels so players can find them in-world
      try {
        [
          [level0Group, 'level0', 16, 0, -14],
          [level1Group, 'level1', -18, 0, 12],
          [level2Group, 'level2', 12, 0, -24],
          [level3Group, 'level3', -14, 0, -16],
          [level4Group, 'level4', 18, 0, 18],
          [level5Group, 'level5', -16, 0, 14],
          [level7Group, 'level7', 10, 0, -18],
          [level14Group, 'level14', -14, 0, -14],
          [level15Group, 'level15', 14, 0, -14],
          [level33Group, 'level33', -16, 0, 16],
          [level36Group, 'level36', 16, 0, -12],
          [level37Group, 'level37', 8, 0, -28],
          [levelFunGroup, 'levelfun', -14, 0, -18],
          [levelRunGroup, 'levelrun', 0, 0, -22]
        ].forEach(([grp, zn, rx, ry, rz]) => {
          if (grp) spawnBonusItem(grp, zn, rx, ry, rz, 'radar');
        });
      } catch (e) {}

      const ZONE_CASSETTE_KEY = {
        level0: 'cas_0', levelmanila: 'cas_manila', level1: 'cas_1', level2: 'cas_2',
        level3: 'cas_3', level4: 'cas_4', level5: 'cas_5', level6: 'cas_6',
        level7: 'cas_7', level8: 'cas_8', level61: 'cas_61', level9: 'cas_9',
        level10: 'cas_10', level11: 'cas_11', level14: 'cas_14', level15: 'cas_15',
        level22: 'cas_22', level33: 'cas_33', level36: 'cas_36', level37: 'cas_37',
        level46: 'cas_46', level188: 'cas_188', level974: 'cas_974', levelmirror: 'cas_mirror',
        levelrun: 'cas_run', levelfun: 'cas_fun', level94: 'cas_94', levelend: 'cas_end',
        levelshady: 'cas_shady', level922: 'cas_922', level3999: 'cas_3999'
      };
      if (openCells && openCells.length > 20) {
        const v1 = openCells[Math.floor(openCells.length * 0.14)];
        const v2 = openCells[Math.floor(openCells.length * 0.48)];
        if (v1) spawnVentDuct(level0Group, wallBoxes, v1.x, v1.z, 5.6, 0);
        if (v2) spawnVentDuct(level0Group, wallBoxes, v2.x, v2.z, 5.6, Math.PI / 2);
        const j1 = openCells[Math.floor(openCells.length * 0.28)];
        const j2 = openCells[Math.floor(openCells.length * 0.62)];
        if (j1) {
          spawnJumpLedge(level0Group, 'level0', j1.x - 1.7, j1.z, 2.2, 2.2, 0.85);
          spawnJumpLedge(level0Group, 'level0', j1.x + 1.7, j1.z, 2.2, 2.2, 1.35);
        }
        if (j2) spawnJumpLedge(level0Group, 'level0', j2.x, j2.z, 2.6, 2.6, 1.05);
        const cCas0 = openCells[Math.floor(openCells.length * 0.22)];
        if (cCas0) spawnBonusItem(level0Group, 'level0', cCas0.x, 1.05, cCas0.z, 'vhs');
        [0.33, 0.55, 0.72].forEach((f) => {
          const c = openCells[Math.floor(openCells.length * f)];
          if (c) spawnBonusItem(level0Group, 'level0', c.x, 1.05, c.z, 'almond');
        });
      }
      const EXTRA_ZONE_BONUS_SPECS = {
        levelmanila: { grp: levelManilaGroup, cas: [6, -6], alm: [[-6, 6]] },
        level1: { grp: level1Group, cas: [24, 18], alm: [[-24, -18], [0, -45]] },
        level2: { grp: level2Group, cas: [8, -16], alm: [[-8, 16]] },
        level3: { grp: level3Group, cas: [16, -16], alm: [[-16, 16]] },
        level4: { grp: level4Group, cas: [14, -14], alm: [[-14, 14]] },
        level5: { grp: level5Group, cas: [12, -18], alm: [[-12, 18]] },
        level6: { grp: level6Group, cas: [-22, -22], alm: [[18, 18], [28, -14]] },
        level7: { grp: level7Group, cas: [14, -14], alm: [[-14, 14]] },
        level8: { grp: level8Group, cas: [22, -20], alm: [[-18, 16], [0, 32]] },
        level61: { grp: level61Group, cas: [8, -8], alm: [[-8, 8]] },
        level9: { grp: level9Group, cas: [18, -18], alm: [[-18, 18]] },
        level10: { grp: level10Group, cas: [20, -20], alm: [[-20, 20]] },
        level11: { grp: level11Group, cas: [22, -22], alm: [[-22, 22]] },
        level14: { grp: level14Group, cas: [16, -16], alm: [[-16, 16]] },
        level15: { grp: level15Group, cas: [16, -16], alm: [[-16, 16]] },
        level22: { grp: level22Group, cas: [18, -18], alm: [[-18, 18]] },
        level33: { grp: level33Group, cas: [26, -12], alm: [[-26, 12], [0, 18]] },
        level36: { grp: level36Group, cas: [24, -12], alm: [[-24, 8], [0, 14]] },
        level37: { grp: level37Group, cas: [10, -110], alm: [[-10, -40], [0, -180]] },
        level46: { grp: level46Group, cas: [18, -18], alm: [[-18, 18]] },
        level188: { grp: level188Group, cas: [12, 0], alm: [[-12, 0]] },
        level974: { grp: level974Group, cas: [14, 2], alm: [[-14, 2]] },
        levelmirror: { grp: levelMirrorGroup, cas: [12, -12], alm: [[-12, 12]] },
        levelrun: { grp: levelRunGroup, cas: [0, -35], alm: [[0, -85]] },
        levelfun: { grp: levelFunGroup, cas: [14, -14], alm: [[-14, 14]] },
        level94: { grp: level94Group, cas: [18, -18], alm: [[-18, 18]] },
        levelend: { grp: levelEndGroup, cas: [10, -10], alm: [[-10, 10]] },
        levelshady: { grp: levelShadyGroup, cas: [16, -16], alm: [[-16, 16]] },
        level922: { grp: level922Group, cas: [4, -4], alm: [[-4, 4]] },
        level3999: { grp: level3999Group, cas: [20, -8], alm: [[-20, 8], [0, -16]] }
      };
      function spawnZoneBonusItems(zoneName) {
        const spec = EXTRA_ZONE_BONUS_SPECS[zoneName];
        if (!spec || !spec.grp) return;
        for (let i = bonusPickups.length - 1; i >= 0; i--) {
          if (bonusPickups[i].zone === zoneName) bonusPickups.splice(i, 1);
        }
        spawnBonusItem(spec.grp, zoneName, spec.cas[0], 1.05, spec.cas[1], 'vhs');
        spec.alm.forEach(([px, pz]) => spawnBonusItem(spec.grp, zoneName, px, 1.05, pz, 'almond'));
      }

      const CRYPTIC_WHISPERS = [
        "MEN BU YO'LAKDAN OLDIN O'TGANMIDIM?",
        "ORQANGDA KIMDIR TO'XTADI...",
        "CHIQISH ESHIKLARI DOIM HAM HAQIQIY EMAS.",
        "SIGNAL YO'QOLMOQDA... [1996-07-14]",
        "QADAMLAR OVOZI SENIKI EMAS.",
        "QORA GLITCH DEVORLARGA TEGMA — NO-CLIP!",
        "DEVORLAR SEKIN SURILAYOTGANGA O'XSHAYDI...",
        "BU YERDA VAQT O'TMAYAPTI."
      ];

      function updatePsychologicalHorror(dt, animT) {
        if (state.zone === 'metro_lobby' || state.zone === 'level61') {
          phantomWatcher.visible = false;
          state.sanity = Math.min(100, state.sanity + dt * 8);
          return;
        }
        if (state.noclipCooldown > 0) state.noclipCooldown -= dt;

        // 1. Check No-Clip Glitch Anomaly collision -> unexpected level slip!
        for (let i = 0; i < noclipAnomalies.length; i++) {
          const na = noclipAnomalies[i];
          if (na.zone !== state.zone) continue;
          na.mesh.rotation.y = Math.sin(animT * 1.4 + i) * 0.15;
          if (state.noclipCooldown <= 0 && Math.hypot(state.pos.x - na.x, state.pos.z - na.z) < 1.55) {
            state.noclipCooldown = 5.0;
            Sound.blackout();
            showToast(na.hint, true);
            setTimeout(() => { resetGame(na.destLvl); }, 650);
            return;
          }
        }

        // 1b. Animate floating upside-down chairs & static TVs + detect nearby Strange Interconnected Doors
        for (let i = 0; i < floatingWeirdObjs.length; i++) {
          const fw = floatingWeirdObjs[i];
          fw.mesh.position.y = fw.baseY + Math.sin(animT * 1.1 + fw.phase) * 0.24;
          fw.mesh.rotation.y += dt * 0.28;
        }
        state.nearStrangeDoor = null;
        for (let i = 0; i < liminalDoors.length; i++) {
          const ld = liminalDoors[i];
          if (ld.zone !== state.zone) continue;
          if (Math.hypot(state.pos.x - ld.x, state.pos.z - ld.z) < 2.6) {
            state.nearStrangeDoor = ld;
            elInteractBtn.classList.add('visible');
            elInteractLbl.textContent = ld.label;
            break;
          }
        }

        // 2. Subtle Sanity Drain in darkness / isolation
        const drain = (!state.flashOn ? 1.8 : 0.45);
        state.sanity = Math.max(0, state.sanity - drain * dt);

        // 3. Cryptic Psychological Whispers & Phantom Footsteps
        state.whisperTimer -= dt;
        if (state.whisperTimer <= 0) {
          state.whisperTimer = 20 + Math.random() * 18;
          const msg = CRYPTIC_WHISPERS[Math.floor(Math.random() * CRYPTIC_WHISPERS.length)];
          showToast(msg);
          if (Math.random() < 0.55) Sound.footstep(false); // Phantom footstep behind you!
        }

        // 4. Peripheral Shadow Watcher (appears 13m away; VANISHES the instant you look directly at it!)
        if (state.phantomActive) {
          state.phantomTimer -= dt;
          const toP = new THREE.Vector3(
            phantomWatcher.position.x - state.pos.x,
            0,
            phantomWatcher.position.z - state.pos.z
          );
          const distP = toP.length();
          toP.normalize();
          const lookDir = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw)).normalize();
          const dot = toP.dot(lookDir);
          phantomWatcher.lookAt(state.pos.x, phantomWatcher.position.y, state.pos.z);
          if (state.phantomTimer <= 0 || distP < 4.5 || (dot > 0.94 && state.phantomTimer < 4.2)) {
            phantomWatcher.visible = false;
            state.phantomActive = false;
            if (dot > 0.94) Sound.footstep(true);
          }
        } else {
          state.anomalyTimer -= dt;
          if (state.anomalyTimer <= 0) {
            state.anomalyTimer = 24 + Math.random() * 20;
            // Spawn Shadow Watcher slightly off-center (peripheral vision!) 13m ahead
            const sideOff = (Math.random() > 0.5 ? 1 : -1) * 0.58;
            const ang = state.yaw + sideOff;
            const px = state.pos.x - Math.sin(ang) * 13.5;
            const pz = state.pos.z - Math.cos(ang) * 13.5;
            const py = (state.zone === 'level94') ? getDreamHillY(px, pz) : 0;
            phantomWatcher.position.set(px, py, pz);
            phantomWatcher.visible = true;
            state.phantomActive = true;
            state.phantomTimer = 5.0;
          }
        }
      }

      // --- Load REAL Internet 3D GLB Props across Level 1      // --- Load REAL Internet 3D GLB Props across Level 1, Level 2, Level 37 (DON'T SPLASH), and Level ! ---
            function loadExtraPropsForLevel(targetLvl) {
        const EXTRA_GLBS = [
          // Level 1 (Habitable Zone): abandoned supply chests, hanging barn lamps, damaged helmets & coolers
          { lvl: 1, group: level1Group, boxes: l1Boxes, url: REPO_GLB_BASE + 'cabinet.glb', h: 0.9, solid: true, spots: [{ x: -18, z: 22, rot: 0.4 }, { x: 46, z: 14, rot: 1.5 }, { x: -18, z: -42, rot: 2.6 }] },
          { lvl: 1, group: level1Group, boxes: l1Boxes, url: REPO_GLB_BASE + 'vending_machine.glb', h: 2.15, solid: true, spots: [{ x: 26, z: 24, rot: Math.PI }, { x: 62, z: 4, rot: -Math.PI / 2 }] },
          { lvl: 1, group: level1Group, boxes: l1Boxes, url: REPO_GLB_BASE + 'streetlamp.glb', h: 0.85, ceilingY: 4.5, spots: [{ x: 0, z: 10 }, { x: 0, z: -12 }, { x: 0, z: -48 }, { x: 48, z: 0 }] },
          { lvl: 1, group: level1Group, boxes: l1Boxes, url: REPO_GLB_BASE + 'cabinet.glb', h: 0.85, yOff: 0, spots: [{ x: -16, z: 14, rot: 0.7 }, { x: 24, z: -42, rot: 2.1 }] },

          // Level 2 (Pipe Dreams): industrial lanterns, supply chests & vintage boomboxes in tunnel corners
          { lvl: 2, group: level2Group, boxes: l2Boxes, url: REPO_GLB_BASE + 'streetlamp.glb', h: 2.6, solid: true, spots: [{ x: -75, z: 75, rot: 0.4 }, { x: 0, z: 26, rot: 0 }, { x: 52, z: -52, rot: 2.2 }] },
          { lvl: 2, group: level2Group, boxes: l2Boxes, url: REPO_GLB_BASE + 'cabinet.glb', h: 0.85, solid: true, spots: [{ x: -52, z: 26, rot: 0.5 }, { x: 26, z: -26, rot: 1.8 }] },
          { lvl: 2, group: level2Group, boxes: l2Boxes, url: REPO_GLB_BASE + 'streetlamp.glb', h: 0.75, ceilingY: 3.85, spots: [{ x: -52, z: 52 }, { x: 0, z: 0 }, { x: 52, z: -26 }] },

          // Level 37 (DON'T SPLASH): Poolrooms explorer gear on Dry Safe Islands (lanterns, water bottles, tripod camera, damaged helmet!)
          { lvl: 37, group: level37Group, boxes: l37Boxes, url: REPO_GLB_BASE + 'streetlamp.glb', h: 2.8, yOff: 0.9, spots: [{ x: -3.5, z: 16.5, rot: 0.3 }, { x: 3.5, z: 16.5, rot: -0.3 }, { x: -3.6, z: -164.5, rot: 0.2 }, { x: 3.6, z: -164.5, rot: -0.2 }] },
          { lvl: 37, group: level37Group, boxes: l37Boxes, url: REPO_GLB_BASE + 'crt_pc.glb', h: 1.4, yOff: 0.9, spots: [{ x: 2.8, z: -18.5, rot: 2.6 }] },
          { lvl: 37, group: level37Group, boxes: l37Boxes, url: REPO_GLB_BASE + 'almond_water.glb', h: 0.34, yOff: 0.9, spots: [{ x: -2.4, z: -41.5, rot: 0 }, { x: 2.4, z: -68.5, rot: 1.1 }] },
          { lvl: 37, group: level37Group, boxes: l37Boxes, url: REPO_GLB_BASE + 'cabinet.glb', h: 0.38, yOff: 0.9, spots: [{ x: -2.5, z: -94.0, rot: 0.8 }] },

          // Level ! (Run For Your Life!): overturned hospital chairs along walls
          { lvl: 'run', group: levelRunGroup, boxes: lRunBoxes, url: REPO_GLB_BASE + 'bench.glb', h: 1.0, spots: [{ x: -3.1, z: -36, rot: 1.2 }, { x: 3.1, z: -92, rot: -1.4 }, { x: -3.1, z: -180, rot: 0.9 }, { x: 3.1, z: -290, rot: -1.1 }] }
        ];

        EXTRA_GLBS.filter((item) => item.lvl === targetLvl).forEach((item) => {
          try {
            gltfLoader.load(
              item.url,
              (gltf) => {
                const srcObj = gltf.scene;
                stripGltfLights(srcObj);
                srcObj.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(srcObj);
                const sz = new THREE.Vector3(), ctr = new THREE.Vector3();
                box.getSize(sz); box.getCenter(ctr);
                const sc = item.h / (sz.y || 1);
                item.spots.forEach((sp) => {
                  const cl = srcObj.clone();
                  cl.scale.setScalar(sc);
                  const yPos = item.ceilingY !== undefined
                    ? (item.ceilingY - sz.y * sc)
                    : ((-box.min.y * sc) + (item.yOff || 0));
                  cl.position.set(sp.x - ctr.x * sc, yPos, sp.z - ctr.z * sc);
                  cl.rotation.y = sp.rot || 0;
                  item.group.add(cl);
                  if (item.solid && item.boxes) {
                    cl.updateMatrixWorld(true);
                    const pb = new THREE.Box3().setFromObject(cl);
                    const psz = new THREE.Vector3(), pctr = new THREE.Vector3();
                    pb.getSize(psz); pb.getCenter(pctr);
                    item.boxes.push({
                      x: pctr.x, z: pctr.z,
                      halfX: Math.min(1.0, Math.max(0.32, psz.x * 0.42)),
                      halfZ: Math.min(1.0, Math.max(0.32, psz.z * 0.42)),
                      isProp: true
                    });
                  }
                });
              },
              undefined,
              () => {}
            );
          } catch (e) {}
        });
      }


      // --- Lazy-Build & GPU Dispose Registry (30 Extra Levels) ---
      const LEVEL_BUILDERS = {
        1: { group: level1Group, build: buildLevel1HabitableZone, arrays: [l1Boxes, l1FuelCans, l1Generators, l1Lockers], built: false },
        37: { group: level37Group, build: buildLevel37DontSplash, arrays: [l37Boxes, l37Pebbles, l37Platforms, l37Switches], built: false },
        2: { group: level2Group, build: buildLevel2PipeDreams, arrays: [l2Boxes, l2Breakers, l2Lockers, l2OpenCells, l2SteamVents], built: false },
        'run': { group: levelRunGroup, build: buildLevelRunForYourLife, arrays: [lRunAlarmLights, lRunBoxes], built: false },
        'fun': { group: levelFunGroup, build: buildLevelFun, arrays: [lFunBalloons, lFunBoxes, lFunGifts, lFunLockers, lFunOpenCells], built: false },
        94: { group: level94Group, build: buildLevel94, arrays: [l94Boxes, l94Houses, l94Orbs, l94SirenPoles, l94TrapDoors], built: false },
        922: { group: level922Group, build: buildLevel922, arrays: [l922Plaques], built: false },
        9: { group: level9Group, build: buildLevel9, arrays: [l9Boxes, l9FuseBoxes, l9Lamps], built: false },
        10: { group: level10Group, build: buildLevel10, arrays: [l10Boxes, l10Radios], built: false },
        11: { group: level11Group, build: buildLevel11, arrays: [l11Boxes, l11Cards], built: false },
        'end': { group: levelEndGroup, build: buildLevelEnd, arrays: [lEndBoxes, lEndDisks], built: false },
        61: { group: level61Group, build: buildLevel61, arrays: [l61Boxes, l61Counters], built: false },
        3: { group: level3Group, build: buildLevel3, arrays: [l3Arcs, l3Boxes, l3Breakers, l3Lockers, l3OpenCells], built: false },
        4: { group: level4Group, build: buildLevel4, arrays: [l4Badges, l4Boxes, l4Coolers, l4OpenCells, l4WindowTraps], built: false },
        5: { group: level5Group, build: buildLevel5, arrays: [l5Boxes, l5Keys, l5Lockers, l5OpenCells, l5RoomDoors], built: false },
        6: { group: level6Group, build: buildLevel6, arrays: [l6Boxes, l6OpenCells, l6Switches], built: false },
        7: { group: level7Group, build: buildLevel7, arrays: [l7Buoys, l7Docks], built: false },
        8: { group: level8Group, build: buildLevel8, arrays: [l8Boxes, l8Crystals, l8OpenCells], built: false },
        188: { group: level188Group, build: buildLevel188, arrays: [l188Boxes, l188Tvs], built: false },
        974: { group: level974Group, build: buildLevel974, arrays: [l974Boxes, l974Items], built: false },
        3999: { group: level3999Group, build: buildLevel3999, arrays: [l3999Boxes, l3999Tasks], built: false },
        33: { group: level33Group, build: buildLevel33, arrays: [l33Boxes, l33Nodes], built: false },
        36: { group: level36Group, build: buildLevel36, arrays: [l36Boxes, l36Tickets], built: false },
        'shady': { group: levelShadyGroup, build: buildLevelShady, arrays: [lShadyAnomalies, lShadyBoxes, lShadyOpenCells], built: false },
        14: { group: level14Group, build: buildLevel14, arrays: [l14Boxes, l14Nodes], built: false },
        15: { group: level15Group, build: buildLevel15, arrays: [l15Boxes, l15Cores, l15OpenCells], built: false },
        22: { group: level22Group, build: buildLevel22, arrays: [l22Boxes, l22Switches], built: false },
        46: { group: level46Group, build: buildLevel46, arrays: [l46Boxes, l46Obelisks], built: false },
        'manila': { group: levelManilaGroup, build: buildLevelManila, arrays: [lManilaBoxes, lManilaFiles], built: false },
        'mirror': { group: levelMirrorGroup, build: buildLevelMirror, arrays: [lMirrorBoxes, lMirrorShards], built: false }
      };
      function disposeLevelGroup(lvl) {
        const entry = LEVEL_BUILDERS[lvl];
        if (!entry || !entry.built) return;
        if (typeof monsterGroup !== 'undefined' && monsterGroup && monsterGroup.parent === entry.group) {
          monsterGroup.visible = false;
          scene.add(monsterGroup);
        }
        entry.group.traverse((obj) => {
          if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
          mats.forEach((m) => {
            if (!m) return;
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap', 'alphaMap', 'lightMap'].forEach((tk) => {
              const tx = m[tk];
              if (tx && tx.dispose) tx.dispose();
            });
            if (m.dispose) m.dispose();
          });
        });
        entry.group.clear();
        entry.arrays.forEach((arr) => { if (arr) arr.length = 0; });
        const zTag = typeof lvl === 'string' ? 'level' + lvl : 'level' + String(lvl);
        for (let wi = walkPlatforms.length - 1; wi >= 0; wi--) {
          if (walkPlatforms[wi].zone === zTag) walkPlatforms.splice(wi, 1);
        }
        entry.built = false;
      }
      function ensureLevelBuilt(lvl) {
        Object.keys(LEVEL_BUILDERS).forEach((k) => {
          const key = isNaN(k) ? k : Number(k);
          if (key !== lvl && LEVEL_BUILDERS[k].built) disposeLevelGroup(key);
        });
        const entry = LEVEL_BUILDERS[lvl];
        if (entry && !entry.built) {
          entry.build();
          entry.built = true;
          const zKey = typeof lvl === 'string' ? 'level' + lvl : 'level' + String(lvl);
          if (typeof loadExtraPropsForLevel === 'function') loadExtraPropsForLevel(lvl);
          if (typeof spawnZoneBonusItems === 'function') spawnZoneBonusItems(zKey);
          // Inject crouch-under vent tunnels & jump-over ledges into every indoor level!
          if (lvl !== 922 && lvl !== 'run' && lvl !== 7 && lvl !== 'end' && lvl !== 'manila') {
            const boxMap = {
              1: l1Boxes, 2: l2Boxes, 37: l37Boxes, fun: lFunBoxes, 3: l3Boxes, 4: l4Boxes,
              5: l5Boxes, 6: l6Boxes, 8: l8Boxes, 9: l9Boxes, 10: l10Boxes, 11: l11Boxes,
              14: l14Boxes, 15: l15Boxes, 22: l22Boxes, 33: l33Boxes, 36: l36Boxes,
              46: l46Boxes, 61: l61Boxes, 188: l188Boxes, 974: l974Boxes, 3999: l3999Boxes,
              shady: lShadyBoxes, mirror: lMirrorBoxes
            };
            const openMap = {
              2: l2OpenCells, fun: lFunOpenCells, 3: l3OpenCells, 4: l4OpenCells,
              5: l5OpenCells, 6: l6OpenCells, 8: l8OpenCells, 15: l15OpenCells, shady: lShadyOpenCells
            };
            const targetBoxes = boxMap[lvl] || [];
            const cells = openMap[lvl];
            if (cells && cells.length > 16) {
              [0.18, 0.44, 0.72].forEach((frac, idx) => {
                const c = cells[Math.floor(cells.length * frac)];
                if (c) {
                  spawnVentDuct(entry.group, targetBoxes, c.x, c.z, 5.2, idx % 2 === 0 ? 0 : Math.PI / 2);
                }
              });
              [0.29, 0.57, 0.83].forEach((frac, idx) => {
                const c = cells[Math.floor(cells.length * frac)];
                if (c) {
                  spawnJumpLedge(entry.group, zKey, c.x, c.z, 2.5, 2.5, 0.9 + (idx % 2) * 0.35);
                }
              });
            } else {
              const baseSpots = [[-14, 14], [16, -12], [-18, -16]];
              baseSpots.forEach(([ox, oz], idx) => {
                if (lvl !== 37) spawnVentDuct(entry.group, targetBoxes, ox, oz, 4.8, idx % 2 === 0 ? 0 : Math.PI / 2);
                const baseY = (lvl === 37) ? 0.9 : 0;
                if (baseY === 0) spawnJumpLedge(entry.group, zKey, -ox * 0.8, oz * 0.8, 2.4, 2.4, 0.95);
              });
            }
          }
        }
      }

      // --- Game State ---
      const DIFFS = {
        easy: { mSpeed: 2.9, chaseSpeed: 4.5, sight: 11.5, batDrain: 0.85 },
        normal: { mSpeed: 3.4, chaseSpeed: 5.2, sight: 14.5, batDrain: 1.15 },
        hard: { mSpeed: 3.9, chaseSpeed: 5.65, sight: 17.5, batDrain: 1.55 }
      };



      window.extraLoreNotes = [];
      (function setupExtraZoneLoreNotes() {
        const SPECS = {
          level1: {
            x: 6, z: -6,
            uz: ["QOG'OZ #06: YASHASH ZONASI", "Level 1 qorong'u omboriga xush kelibsiz. Chiroqlar o'chganda (Blackout) qizil benzin kanistrasini topib generatorlarni yoqing."],
            en: ["NOTE #06: HABITABLE ZONE", "Welcome to Level 1's dark warehouse. During blackouts, grab a red fuel jerrycan and power up the generators."],
            ru: ["ЗАПИСКА #06: ОБИТАЕМАЯ ЗОНА", "Добро пожаловать на склад Уровня 1. Во время блэкаута найдите канистру и запустите генераторы."]
          },
          level2: {
            x: 8, z: 8,
            uz: ["QOG'OZ #07: QUVUR LABIRINTI", "Qaynoq bug' quvurlaridan ehtiyot bo'ling! Bosim uzgichlarini o'chiring va Skin-Stealer ga yaqinlashmang."],
            en: ["NOTE #07: PIPE DREAMS", "Watch out for scalding steam vents! Shut down the pressure valves and stay clear of the Skin-Stealer."],
            ru: ["ЗАПИСКА #07: ТРУБЫ", "Остерегайтесь горячего пара! Отключите клапаны давления и избегайте Кожекрада."]
          },
          level3: {
            x: -8, z: 10,
            uz: ["QOG'OZ #08: ELEKTR STANSIYASI", "Bu yerda Hound (It) ov qiladi. Qisqa tutashuvli tok tuzoqlaridan chetda yuring va elektr uzgichlarini yoqing."],
            en: ["NOTE #08: ELECTRICAL STATION", "Hounds prowl these brick halls. Avoid sparking electrical hazards and flip the breakers."],
            ru: ["ЗАПИСКА #08: ЭЛЕКТРОСТАНЦИЯ", "Здесь охотятся Гончие. Избегайте искрящих проводов и включите рубильники."]
          },
          level4: {
            x: 6, z: -10,
            uz: ["QOG'OZ #09: BO'SH OFIS", "Ochiq oq derazalarga aslo yaqinlashmang — ular tuzoq! Ofis ruxsatnomalarini yig'ib liftga chiqing."],
            en: ["NOTE #09: ABANDONED OFFICE", "Never approach open white windows — they are Window traps! Collect office badges to unlock the elevator."],
            ru: ["ЗАПИСКА #09: ПУСТОЙ ОФИС", "Никогда не подходите к открытым белым окнам — это ловушки! Соберите пропуска к лифту."]
          },
          level5: {
            x: -6, z: -8,
            uz: ["QOG'OZ #10: QO'RQINCHLI MEHMONXONA", "1930-yil mehmonxonasida Butler jim yuradi. Oltin kalitlarni topib, ovoz chiqarmay liftga yeting."],
            en: ["NOTE #10: TERROR HOTEL", "The Butler stalks this 1930s hotel. Gather the golden keys quietly and reach the elevator."],
            ru: ["ЗАПИСКА #10: ОТЕЛЬ УЖАСА", "В этом отеле 1930-х бродит Дворецкий. Соберите золотые ключи и доберитесь до лифта."]
          },
          level6: {
            x: 8, z: -8,
            uz: ["QOG'OZ #11: MUTLAQ ZULMAT", "Level 6 da yorug'lik deyarli yo'q. Fonar chaqnashi (G) Smiler ni 3 soniyaga to'xtatishi mumkin — batareyani tejang!"],
            en: ["NOTE #11: LIGHTS OUT", "Near-total darkness. Remember: your Flash Surge (G) blinds the Smiler for 3 seconds — manage your battery!"],
            ru: ["ЗАПИСКА #11: БЕЗ СВЕТА", "Почти полная темнота. Вспышка фонаря (G) ослепляет Улыбающегося на 3 секунды — берегите заряд!"]
          },
          level37: {
            x: 0, z: -6,
            uz: ["QOG'OZ #12: POOLROOMS", "Suv ichida yursangiz ko'r maxluq shovqinni eshitadi! Quruq kafel platformalardan sakrab o'ting."],
            en: ["NOTE #12: THE POOLROOMS", "Splashing in water alerts the blind stalker! Hop across dry tiled platforms to stay silent."],
            ru: ["ЗАПИСКА #12: БАССЕЙНЫ", "Плеск воды привлекает слепую сущность! Прыгайте по сухим плиткам, чтобы не шуметь."]
          },
          level94: {
            x: 4, z: 168,
            uz: ["QOG'OZ #13: TUSH TEPALIKLARI", "Kunduzi 60 soniya xavfsiz. Tun tushganda uylarga kirib yashirining — ba'zi uylar ichida labirint eshiklari bor."],
            en: ["NOTE #13: MOTION HILLS", "Daylight lasts 60s safely. When night falls, hide inside the cottages — some interior doors warp to labyrinths."],
            ru: ["ЗАПИСКА #13: ХОЛМЫ СНОВ", "Днём безопасно 60 секунд. Ночью прячьтесь в домах — некоторые двери внутри ведут в лабиринты."]
          },
          levelrun: {
            x: 0, z: -8,
            uz: ["QOG'OZ #14: ORQAGA QARAMA!", "Qizil chiroq yondi! To'siqlardan sakrab va egilib o'ting — to'xtasangiz yirtqich yetib oladi!"],
            en: ["NOTE #14: RUN FOR YOUR LIFE!", "Red alert! Vault obstacles and duck under beams — never slow down!"],
            ru: ["ЗАПИСКА #14: БЕГИ ЗА СВОЮ ЖИЗНЬ!", "Красная тревога! Перепрыгивайте преграды и пригибайтесь — не останавливайтесь!"]
          },
          levelmanila: {
            x: 2.5, z: 2.5,
            uz: ["ARXIV #15: MANILA XONASI", "Bu xonada maxluqlar yo'q. M.E.G. qo'llanmalarini o'qib, keyingi qavatlarga tayyorlaning."],
            en: ["ARCHIVE #15: THE MANILA ROOM", "No entities can enter here. Read the M.E.G. files carefully before boarding the train."],
            ru: ["АРХИВ #15: КОМНАТА МАНИЛА", "Сюда не проникают сущности. Изучите файлы M.E.G. перед отправкой на следующий уровень."]
          },
          level7: {
            x: 0, z: 4,
            uz: ["QOG'OZ #16: TALASSOFOBIYA", "Cheksiz qora okean... Suvga tushsangiz suzuvchi yirtqich sizni darhol sezadi. Yog'och ko'priklarda yuring!"],
            en: ["NOTE #16: THALASSOPHOBIA", "An endless dark ocean. Stepping into the water alerts the sea entity — stay on the wooden docks!"],
            ru: ["ЗАПИСКА #16: ТАЛАССОФОБИЯ", "Бескрайний тёмный океан. Вода выдаёт вас морской сущности — держитесь на деревянных мостках!"]
          },
          level8: {
            x: 4, z: -4,
            uz: ["QOG'OZ #17: G'OR TIZIMI", "Binafsha kristallar qorong'u g'orda yo'l ko'rsatadi. O'rgimchaksimon soyadan uzoqroq yuring."],
            en: ["NOTE #17: CAVE SYSTEM", "Glowing violet crystals mark the path through these tunnels. Keep your distance from the cave stalker."],
            ru: ["ЗАПИСКА #17: СИСТЕМА ПЕЩЕР", "Фиолетовые кристаллы ведут к выходу. Держитесь подальше от пещерного хищника."]
          },
          level61: {
            x: 0, z: 4,
            uz: ["QOG'OZ #18: SNACKROOMS", "Nihoyat xavfsiz bekat! Bu yerda Bodom suvi bepul — kuch va aql-hushingizni tiklab oling."],
            en: ["NOTE #18: THE SNACKROOMS", "A rare safe haven! Drink free Almond Water at the neon bars to restore stamina and sanity."],
            ru: ["ЗАПИСКА #18: ЗАКУСОЧНАЯ", "Редкое безопасное место! Пейте миндальную воду у баров, чтобы восстановить силы и рассудок."]
          },
          level9: {
            x: 4, z: 6,
            uz: ["QOG'OZ #19: QORONG'U MAHALLA", "Ko'chada projektorli kuzatuvchi kezib yuribdi. Elektr qutilarini tuzatib metroga qayting."],
            en: ["NOTE #19: DARKENED SUBURBS", "The Neighborhood Watch prowls the asphalt. Repair the fuse boxes and stay off the main road."],
            ru: ["ЗАПИСКА #19: ТЁМНЫЙ ПРИГОРОД", "По улицам бродит Дозорный с прожектором. Почините щитки и избегайте открытых дорог."]
          },
          level10: {
            x: 3, z: 5,
            uz: ["QOG'OZ #20: BUG'DOY DALA", "Tuman ichida 5 ta radio minora signal uzatmoqda. Hammasini sozlasangiz yerto'la lyuki ochiladi."],
            en: ["NOTE #20: FIELD OF WHEAT", "Five radio towers hum through the fog. Tune all of them to unlock the cellar hatch."],
            ru: ["ЗАПИСКА #20: ПШЕНИЧНОЕ ПОЛЕ", "Пять радиовышек гудят в тумане. Настройте их все, чтобы открыть люк в подвал."]
          },
          level11: {
            x: 4, z: 6,
            uz: ["QOG'OZ #21: CHEKSIZ SHAHAR", "Osmono'par binolar orasida 6 ta metro karta sochilgan. Grand Central darvozasini oching."],
            en: ["NOTE #21: THE ENDLESS CITY", "Six metro keycards are scattered across the avenues. Collect them to unlock Grand Central."],
            ru: ["ЗАПИСКА #21: БЕСКОНЕЧНЫЙ ГОРОД", "Шесть карт метро разбросаны по проспектам. Соберите их, чтобы открыть Гранд-Сентрал."]
          },
          level14: {
            x: 3, z: 5,
            uz: ["QOG'OZ #22: QIZIL JANNAT", "Bu qizil tuman aldamchi — bir joyda to'xtab qolsangiz aql-hushingiz pasayadi. Harakatda bo'ling!"],
            en: ["NOTE #22: PARADISE", "The crimson mist drains your sanity whenever you stand still. Keep moving and light the 5 beacons!"],
            ru: ["ЗАПИСКА #22: РАЙ", "Алый туман лишает рассудка, если стоять на месте. Двигайтесь и зажгите 5 маяков!"]
          },
          level15: {
            x: 3, z: -4,
            uz: ["QOG'OZ #23: KELAJAK YO'LAKLARI", "Har bir necha soniyada elektr impulsi o'tadi — egilib oling (Crouch), aks holda batareya kamayadi."],
            en: ["NOTE #23: FUTURISTIC HALLS", "Periodic power surges sweep these corridors — crouch to shield your flashlight battery!"],
            ru: ["ЗАПИСКА #23: ФУТУРИСТИЧНЫЕ ЗАЛЫ", "Периодические разряды бьют по коридорам — приседайте, чтобы не разрядить фонарик!"]
          },
          level22: {
            x: 3, z: 4,
            uz: ["QOG'OZ #24: TASHLANDIQ GARAJ", "Havo og'ir, yugurish kuchingizni tezroq oladi. 6 ta elektr qutisini yoqib chiqishni oching."],
            en: ["NOTE #24: ABANDONED GARAGE", "Heavy fumes drain stamina faster when sprinting. Flip all 6 power boxes to escape."],
            ru: ["ЗАПИСКА #24: ЗАБРОШЕННЫЙ ГАРАЖ", "Тяжёлый воздух быстрее тратит выносливость. Включите 6 щитков, чтобы выбраться."]
          },
          level33: {
            x: 3, z: 4,
            uz: ["QOG'OZ #25: CHEKSIZ SAVDO MARKAZI", "Bo'sh vitrinalar ortida nimadir kuzatyapti. 6 ta xavfsizlik terminalini yoqing."],
            en: ["NOTE #25: THE INFINITE MALL", "Something watches from behind the shuttered storefronts. Activate all 6 security terminals."],
            ru: ["ЗАПИСКА #25: БЕСКОНЕЧНЫЙ МОЛЛ", "За витринами кто-то наблюдает. Активируйте 6 терминалов безопасности."]
          },
          level36: {
            x: 3, z: 4,
            uz: ["QOG'OZ #26: AEROPORT", "Parvozlar hech qachon uchmaydi... 5 ta chiqish chiptasini topib darvozadan o'ting."],
            en: ["NOTE #26: THE AIRPORT", "No plane ever departs here. Find 5 boarding passes to unlock the terminal gate."],
            ru: ["ЗАПИСКА #26: АЭРОПОРТ", "Самолёты здесь не взлетают. Найдите 5 посадочных талонов, чтобы открыть выход."]
          },
          level46: {
            x: 3, z: 4,
            uz: ["QOG'OZ #27: QUM BO'RONI", "Kuchli shamol sizni chetga suradi — shamol kuchayganda egiling va 5 ta obeliskni yoqing."],
            en: ["NOTE #27: ARABIAN DESERT", "Sandstorm gusts push you off course — crouch to brace yourself and activate all 5 obelisks."],
            ru: ["ЗАПИСКА #27: ПУСТЫНЯ", "Порывы песчаной бури сносят в сторону — приседайте и активируйте 5 обелисков."]
          },
          level188: {
            x: 4, z: 4,
            uz: ["QOG'OZ #28: HOVLI DERAZALARI", "Yuzlab derazalar sizga qarab turibdi. 4 ta CRT televizorni yig'ib liftga yeting."],
            en: ["NOTE #28: THE COURTYARD", "Hundreds of dark windows stare down at you. Gather 4 CRT televisions to power the elevator."],
            ru: ["ЗАПИСКА #28: ДВОР ОКОН", "Сотни тёмных окон следят за вами. Соберите 4 ЭЛТ-телевизора, чтобы включить лифт."]
          },
          level974: {
            x: 3, z: 4,
            uz: ["QOG'OZ #29: KITTY UYI", "Pushti xonalarda sokinlik hukmron, ammo Kitty sizni tinmay ta'qib qiladi. 6 ta yulduzchani yig'ing."],
            en: ["NOTE #29: KITTY'S HOUSE", "Pastel rooms hide a relentless shadow. Collect 6 glowing stars to unlock the pink exit."],
            ru: ["ЗАПИСКА #29: ДОМ КИТТИ", "За пастельными стенами скрывается тень. Соберите 6 звёзд, чтобы открыть розовую дверь."]
          },
          levelmirror: {
            x: 3, z: 4,
            uz: ["QOG'OZ #30: OYNALAR LABIRINTI", "Oynadagi aksingiz harakatingizni takrorlaydi — unga chalg'imasdan 5 ta oyna parchasini yig'ing."],
            en: ["NOTE #30: MIRROR LABYRINTH", "Your reflection mimics every step in the glass. Collect 5 crystal shards before the stalker catches you."],
            ru: ["ЗАПИСКА #30: ЗЕРКАЛЬНЫЙ ЛАБИРИНТ", "Отражение повторяет каждый шаг. Соберите 5 осколков зеркала раньше, чем вас найдёт сущность."]
          },
          levelfun: {
            x: 3, z: 4,
            uz: ["QOG'OZ #31: BAZM XONASI =)", "Sovg'a qutilari ichida haqiqiy chiqish kalitlari bor. Partygoer tabassumiga aslo ishonmang!"],
            en: ["NOTE #31: LEVEL FUN =)", "The gift boxes hide the exit triggers. Never trust the smiling Partygoer!"],
            ru: ["ЗАПИСКА #31: УРОВЕНЬ ВЕСЕЛЬЯ =)", "В подарочных коробках спрятаны ключи. Никогда не верьте улыбке Тусовщика!"]
          },
          levelend: {
            x: 3, z: 4,
            uz: ["QOG'OZ #32: OXIRGI KUTUBXONA", "DIQQAT: Kompyuterda reallife.exe ni ASLO BOSMANG — u tuzoq! Faqat metro_link.exe ni ishga tushiring."],
            en: ["NOTE #32: THE END", "WARNING: Never run reallife.exe on the terminal — it is a trap! Use metro_link.exe to escape."],
            ru: ["ЗАПИСКА #32: КОНЕЦ", "ВНИМАНИЕ: Не запускайте reallife.exe на терминале — это ловушка! Используйте metro_link.exe."]
          },
          levelshady: {
            x: 4, z: -4,
            uz: ["QOG'OZ #33: TH3 SH4DY GR3Y", "Ranglar o'chgan va makon parchalanmoqda. 5 ta kulrang anomaliyani yig'ib tezroq chiqing."],
            en: ["NOTE #33: TH3 SH4DY GR3Y", "Color has drained from reality. Stabilize all 5 grey anomalies before the void claims you."],
            ru: ["ЗАПИСКА #33: СЕРАЯ ТЕНЬ", "Реальность теряет краски. Соберите 5 серых аномалий и уходите немедленно."]
          },
          level922: {
            x: 4.1, z: 1.8,
            uz: ["QOG'OZ #34: CHEKSIZ ZINAPOYA", "Spiral zinadan 94-qavatgacha ko'tariling va aynan 94-qavatdan markazdagi tubsizlikka sakrang!"],
            en: ["NOTE #34: THE TRUE FINAL", "Climb the infinite spiral to Floor 94, then leap into the central abyss from Floor 94!"],
            ru: ["ЗАПИСКА #34: БЕСКОНЕЧНАЯ ЛЕСТНИЦА", "Поднимитесь по спирали на 94-й этаж и прыгните в центральную бездну именно с него!"]
          },
          level3999: {
            x: 3, z: 4,
            uz: ["QOG'OZ #35: HAQIQIY DUNYOGA QAYTISH", "Siz barcha qavatlardan omon o'tdingiz! Oxirgi 6 ta arkada topshirig'ini bajaring va uyga qayting."],
            en: ["NOTE #35: THE TRUE ENDING", "You survived every floor! Complete the final 6 arcade tasks and step through the gate home."],
            ru: ["ЗАПИСКА #35: ИСТИННЫЙ ФИНАЛ", "Вы пережили все уровни! Выполните 6 финальных заданий у автоматов и вернитесь домой."]
          }
        };
        const noteMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
        const grpMap = {
          level1: level1Group, level2: level2Group, level3: level3Group, level4: level4Group,
          level5: level5Group, level6: level6Group, level7: level7Group, level8: level8Group,
          level9: level9Group, level10: level10Group, level11: level11Group, level14: level14Group,
          level15: level15Group, level22: level22Group, level33: level33Group, level36: level36Group,
          level37: level37Group, level46: level46Group, level61: level61Group, level94: level94Group,
          level188: level188Group, level922: level922Group, level974: level974Group, level3999: level3999Group,
          levelrun: levelRunGroup, levelfun: levelFunGroup, levelend: levelEndGroup,
          levelshady: levelShadyGroup, levelmanila: levelManilaGroup, levelmirror: levelMirrorGroup
        };
        Object.keys(SPECS).forEach((zKey) => {
          const sp = SPECS[zKey], grp = grpMap[zKey];
          if (!grp) return;
          const yBase = (zKey === 'level94' && typeof getDreamHillY === 'function') ? getDreamHillY(sp.x, sp.z) : (zKey === 'level37' ? 0.9 : 0);
          const ng = new THREE.Group();
          ng.position.set(sp.x, yBase + 0.04, sp.z);
          const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.64), noteMat);
          sheet.rotation.x = -Math.PI / 2;
          sheet.rotation.z = 0.35;
          const halo = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.52, 16), haloMat);
          halo.rotation.x = -Math.PI / 2;
          halo.position.y = -0.01;
          ng.add(sheet, halo);
          grp.add(ng);
          window.extraLoreNotes.push({ zone: zKey, x: sp.x, y: yBase, z: sp.z, mesh: ng, data: sp, read: false });
        });
      })();
