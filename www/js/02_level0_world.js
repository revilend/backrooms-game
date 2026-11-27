      const metroLobbyGroup = new THREE.Group();
      metroLobbyGroup.visible = false;
      scene.add(metroLobbyGroup);
      const metroBoxes = [];

      // Dedicated 3D worlds with COMPLETELY DIFFERENT architecture & mechanics for Level 1 & Level 37!
      const level1Group = new THREE.Group();
      level1Group.visible = false;
      scene.add(level1Group);
      const l1Boxes = [];

      const level37Group = new THREE.Group();
      level37Group.visible = false;
      scene.add(level37Group);
      const l37Boxes = [];

      const level2Group = new THREE.Group();
      level2Group.visible = false;
      scene.add(level2Group);
      const l2Boxes = [];

      const levelRunGroup = new THREE.Group();
      levelRunGroup.visible = false;
      scene.add(levelRunGroup);
      const lRunBoxes = [];

      const levelFunGroup = new THREE.Group();
      levelFunGroup.visible = false;
      scene.add(levelFunGroup);
      const lFunBoxes = [];

      const level94Group = new THREE.Group();
      level94Group.visible = false;
      scene.add(level94Group);
      const l94Boxes = [];

      const level922Group = new THREE.Group();
      level922Group.visible = false;
      scene.add(level922Group);

      const level9Group = new THREE.Group(); level9Group.visible = false; scene.add(level9Group);
      const l9Boxes = [];
      const level10Group = new THREE.Group(); level10Group.visible = false; scene.add(level10Group);
      const l10Boxes = [];
      const level11Group = new THREE.Group(); level11Group.visible = false; scene.add(level11Group);
      const l11Boxes = [];
      const levelEndGroup = new THREE.Group(); levelEndGroup.visible = false; scene.add(levelEndGroup);
      const lEndBoxes = [];
      const level61Group = new THREE.Group(); level61Group.visible = false; scene.add(level61Group);
      const l61Boxes = [];
      const level3Group = new THREE.Group(); level3Group.visible = false; scene.add(level3Group);
      const l3Boxes = [];
      const level4Group = new THREE.Group(); level4Group.visible = false; scene.add(level4Group);
      const l4Boxes = [];
      const level5Group = new THREE.Group(); level5Group.visible = false; scene.add(level5Group);
      const l5Boxes = [];
      const level6Group = new THREE.Group(); level6Group.visible = false; scene.add(level6Group);
      const l6Boxes = [];
      const level7Group = new THREE.Group(); level7Group.visible = false; scene.add(level7Group);
      const l7Boxes = [];
      const level8Group = new THREE.Group(); level8Group.visible = false; scene.add(level8Group);
      const l8Boxes = [];
      const level188Group = new THREE.Group(); level188Group.visible = false; scene.add(level188Group);
      const l188Boxes = [];
      const level974Group = new THREE.Group(); level974Group.visible = false; scene.add(level974Group);
      const l974Boxes = [];
      const level3999Group = new THREE.Group(); level3999Group.visible = false; scene.add(level3999Group);
      const l3999Boxes = [];
      const level33Group = new THREE.Group(); level33Group.visible = false; scene.add(level33Group);
      const l33Boxes = [];
      const level36Group = new THREE.Group(); level36Group.visible = false; scene.add(level36Group);
      const l36Boxes = [];
      const levelShadyGroup = new THREE.Group(); levelShadyGroup.visible = false; scene.add(levelShadyGroup);
      const lShadyBoxes = [];
      const level14Group = new THREE.Group(); level14Group.visible = false; scene.add(level14Group); const l14Boxes = [];
      const level15Group = new THREE.Group(); level15Group.visible = false; scene.add(level15Group); const l15Boxes = [];
      const level22Group = new THREE.Group(); level22Group.visible = false; scene.add(level22Group); const l22Boxes = [];
      const level46Group = new THREE.Group(); level46Group.visible = false; scene.add(level46Group); const l46Boxes = [];
      const levelManilaGroup = new THREE.Group(); levelManilaGroup.visible = false; scene.add(levelManilaGroup); const lManilaBoxes = [];
      const levelMirrorGroup = new THREE.Group(); levelMirrorGroup.visible = false; scene.add(levelMirrorGroup); const lMirrorBoxes = [];
      const levelEndlessGroup = new THREE.Group(); levelEndlessGroup.visible = false; scene.add(levelEndlessGroup); let lEndlessBoxes = [];

      // Floor & Ceiling (MeshLambertMaterial = zero specular blowout, 3x faster on mobile GPUs)
      const worldW = GRID_COLS * CELL;
      const worldD = GRID_ROWS * CELL;
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(worldW, worldD),
        (() => { const ct = makeCarpetTex(); ct.anisotropy = maxAniso; return new THREE.MeshLambertMaterial({ map: ct }); })()
      );
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
      level0Group.add(floor);

      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(worldW, worldD),
        (() => { const cet = makeCeilingTex(); cet.anisotropy = maxAniso; return new THREE.MeshLambertMaterial({ map: cet }); })()
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = WALL_H;
      level0Group.add(ceiling);

      // Build Maze Walls, Flickering Ceiling Lights, Lockers, Keys, Batteries & Exit Gate
      const backWallTex = makeBackroomsWallTex(); backWallTex.anisotropy = maxAniso;
      const l0FloorTex = floor.material.map;
      const l0CeilTex = ceiling.material.map;
      const l1WallTex = makeLevel1WallTex(); l1WallTex.anisotropy = maxAniso;
      const l1FloorTex = makeLevel1FloorTex(); l1FloorTex.anisotropy = maxAniso;
      const l1CeilTex = makeLevel1CeilTex(); l1CeilTex.anisotropy = maxAniso;
      const pWallTex = makePoolWallTex(); pWallTex.anisotropy = maxAniso;
      const pFloorTex = makePoolFloorTex(); pFloorTex.anisotropy = maxAniso;
      const pCeilTex = makePoolCeilTex(); pCeilTex.anisotropy = maxAniso;

      const LEVEL_THEMES = {
        0: {
          name: 'Level 0',
          title: 'LEVEL 0: THE LOBBY',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x4b462e, fogDens: 0.036,
          hemiSky: 0xf2eed6, hemiGnd: 0x9c8b5e, hemiInt: 0.56,
          speedMult: 1.0
        },
        1: {
          name: 'Level 1',
          title: 'LEVEL 1: HABITABLE ZONE',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x1b2028, fogDens: 0.044,
          hemiSky: 0xc2d0de, hemiGnd: 0x353b42, hemiInt: 0.52,
          speedMult: 1.15
        },
        2: {
          name: 'Level 2',
          title: 'LEVEL 2: PIPE DREAMS',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x1c1510, fogDens: 0.048,
          hemiSky: 0xd9b382, hemiGnd: 0x3b2c20, hemiInt: 0.48,
          speedMult: 1.18
        },
        37: {
          name: 'Level 37',
          title: "LEVEL 37: DON'T SPLASH",
          wall: pWallTex, floor: pFloorTex, ceil: pCeilTex,
          fog: 0x204752, fogDens: 0.034,
          hemiSky: 0xdaf6fa, hemiGnd: 0x2a7a8a, hemiInt: 0.62,
          speedMult: 1.24
        },
        run: {
          name: 'Level !',
          title: 'LEVEL !: RUN FOR YOUR LIFE!',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x2b0709, fogDens: 0.026,
          hemiSky: 0xff6b6b, hemiGnd: 0x450a0a, hemiInt: 0.58,
          speedMult: 1.48
        },
        fun: {
          name: 'Level Fun =)',
          title: 'LEVEL FUN =) • TUG\'ILGAN KUN',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x3b2c1a, fogDens: 0.028,
          hemiSky: 0xfef3c7, hemiGnd: 0x92400e, hemiInt: 0.64,
          speedMult: 1.18
        }
      ,
        94: {
          name: 'Level 94',
          title: 'LEVEL 94: DREAMCORE (MOTION)',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x87ceeb, fogDens: 0.0046,
          hemiSky: 0xe0f7ff, hemiGnd: 0x4ca64c, hemiInt: 0.92,
          speedMult: 1.18
        },
        922: {
          name: 'Level 9223372036854775807',
          title: 'LEVEL 9223372036854775807',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x16181c, fogDens: 0.022,
          hemiSky: 0xd4d8de, hemiGnd: 0x262930, hemiInt: 0.72,
          speedMult: 1.0
        },
        9: {
          name: 'Level 9',
          title: 'LEVEL 9: DARKENED SUBURBS',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x070911, fogDens: 0.028,
          hemiSky: 0x334155, hemiGnd: 0x0f172a, hemiInt: 0.34,
          speedMult: 1.15
        },
        10: {
          name: 'Level 10',
          title: 'LEVEL 10: THE BUMPER CROP',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x9ca3af, fogDens: 0.011,
          hemiSky: 0xe5e7eb, hemiGnd: 0x854d0e, hemiInt: 0.88,
          speedMult: 1.0
        },
        11: {
          name: 'Level 11',
          title: 'LEVEL 11: THE ENDLESS CITY',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x94a3b8, fogDens: 0.0068,
          hemiSky: 0xe2e8f0, hemiGnd: 0x475569, hemiInt: 0.86,
          speedMult: 1.12
        },
        end: {
          name: 'The End',
          title: 'THE END — KUTUBXONA',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x261a12, fogDens: 0.026,
          hemiSky: 0xfef3c7, hemiGnd: 0x451a03, hemiInt: 0.62,
          speedMult: 1.15
        },
        61: {
          name: 'Level 6.1',
          title: 'LEVEL 6.1: THE SNACKROOMS',
          wall: pWallTex, floor: pFloorTex, ceil: pCeilTex,
          fog: 0x1e1429, fogDens: 0.014,
          hemiSky: 0xfce7f3, hemiGnd: 0x4c1d95, hemiInt: 0.88,
          speedMult: 1.0
        },
        3: {
          name: 'Level 3',
          title: 'LEVEL 3: ELECTRICAL STATION',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x18110e, fogDens: 0.044,
          hemiSky: 0xcbd5e1, hemiGnd: 0x3b1f16, hemiInt: 0.44,
          speedMult: 1.2
        },
        4: {
          name: 'Level 4',
          title: 'LEVEL 4: ABANDONED OFFICE',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x9aa4b2, fogDens: 0.022,
          hemiSky: 0xf8fafc, hemiGnd: 0x64748b, hemiInt: 0.86,
          speedMult: 1.0
        },
        5: {
          name: 'Level 5',
          title: 'LEVEL 5: TERROR HOTEL',
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0x24100d, fogDens: 0.036,
          hemiSky: 0xfde68a, hemiGnd: 0x450a0a, hemiInt: 0.56,
          speedMult: 1.15
        },
        6: {
          name: 'Level 6',
          title: 'LEVEL 6: LIGHTS OUT',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x020203, fogDens: 0.088,
          hemiSky: 0x1e293b, hemiGnd: 0x020617, hemiInt: 0.06,
          speedMult: 1.2
        },
        7: {
          name: 'Level 7',
          title: 'LEVEL 7: THALASSOPHOBIA',
          wall: pWallTex, floor: pFloorTex, ceil: pCeilTex,
          fog: 0x04121d, fogDens: 0.038,
          hemiSky: 0x38bdf8, hemiGnd: 0x020617, hemiInt: 0.24,
          speedMult: 1.18
        },
        8: {
          name: 'Level 8',
          title: 'LEVEL 8: CAVE SYSTEM',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x090710, fogDens: 0.056,
          hemiSky: 0x8b5cf6, hemiGnd: 0x09090b, hemiInt: 0.14,
          speedMult: 1.22
        },
        188: {
          name: 'Level 188',
          title: 'LEVEL 188: COURTYARD OF WINDOWS',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x161b26, fogDens: 0.032,
          hemiSky: 0x94a3b8, hemiGnd: 0x1e293b, hemiInt: 0.38,
          speedMult: 1.15
        },
        974: {
          name: 'Level 974',
          title: "LEVEL 974: KITTY'S HOUSE",
          wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex,
          fog: 0xfbcfe8, fogDens: 0.022,
          hemiSky: 0xfdf2f8, hemiGnd: 0xf472b6, hemiInt: 0.72,
          speedMult: 1.12
        },
        33: {
          name: 'Level 33',
          title: 'LEVEL 33: THE INFINITE MALL',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x112a28, fogDens: 0.028,
          hemiSky: 0x5eead4, hemiGnd: 0x134e4a, hemiInt: 0.54,
          speedMult: 1.15
        },
        36: {
          name: 'Level 36',
          title: 'LEVEL 36: TIMELESS AIRPORT',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x172554, fogDens: 0.026,
          hemiSky: 0x93c5fd, hemiGnd: 0x1e293b, hemiInt: 0.58,
          speedMult: 1.12
        },
        shady: {
          name: 'TH3 SH4DY GR3Y',
          title: 'TH3 SH4DY GR3Y',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x18181b, fogDens: 0.052,
          hemiSky: 0xa1a1aa, hemiGnd: 0x09090b, hemiInt: 0.18,
          speedMult: 1.22
        },
        14: { name: 'Level 14', title: 'LEVEL 14: PARADISE', wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex, fog: 0x260508, fogDens: 0.044, hemiSky: 0xf87171, hemiGnd: 0x1c0407, hemiInt: 0.24, speedMult: 1.15 },
        15: { name: 'Level 15', title: 'LEVEL 15: FUTURISTIC HALLS', wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex, fog: 0x082f49, fogDens: 0.028, hemiSky: 0x67e8f9, hemiGnd: 0x0f172a, hemiInt: 0.58, speedMult: 1.2 },
        22: { name: 'Level 22', title: 'LEVEL 22: ABANDONED GARAGE', wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex, fog: 0x090b0f, fogDens: 0.045, hemiSky: 0x94a3b8, hemiGnd: 0x0f172a, hemiInt: 0.16, speedMult: 1.15 },
        46: { name: 'Level 46', title: 'LEVEL 46: ARABIAN DESERT', wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex, fog: 0xd97706, fogDens: 0.018, hemiSky: 0xfef3c7, hemiGnd: 0x92400e, hemiInt: 0.78, speedMult: 1.15 },
        manila: { name: 'Manila Room', title: 'THE MANILA ROOM', wall: backWallTex, floor: l0FloorTex, ceil: l0CeilTex, fog: 0x3b2f1e, fogDens: 0.025, hemiSky: 0xfef08a, hemiGnd: 0x451a03, hemiInt: 0.62, speedMult: 1.05 },
        mirror: { name: 'Level ∞ Mirror', title: 'OYNALAR LABIRINTI', wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex, fog: 0x090414, fogDens: 0.036, hemiSky: 0xc084fc, hemiGnd: 0x020617, hemiInt: 0.34, speedMult: 1.2 },
        3999: {
          name: 'Level 3999',
          title: 'LEVEL 3999: THE TRUE ENDING',
          wall: l1WallTex, floor: l1FloorTex, ceil: l1CeilTex,
          fog: 0x0f172a, fogDens: 0.022,
          hemiSky: 0x38bdf8, hemiGnd: 0x312e81, hemiInt: 0.65,
          speedMult: 1.2
        }
      };
      const wallMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: backWallTex });
      const wallGeo = new THREE.BoxGeometry(CELL, WALL_H, CELL);
      const wallBoxes = [];
      const flickLights = [];
      const lockers = [];
      const keysList = [];
      const batteries = [];
      const openCells = [];
      const propSpots = [];
      let spawnPos = new THREE.Vector3(0, 1.65, 0);
      let monsterSpawn = new THREE.Vector3(0, 0, 0);
      let exitInfo = { x: 0, z: 0, unlocked: true, doorMesh: null, light: null };

      const wallCoords = [];
      const lampCoords = [];
      const lockerBodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 });
      const lockerSlitMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

      var gltfLoader = gltfLoader || new THREE.GLTFLoader();
      (function wrapGltfProgress() {
        if (!gltfLoader || gltfLoader.__wrapped) return;
        gltfLoader.__wrapped = true;
        const origLoad = gltfLoader.load.bind(gltfLoader);
        let total = 0, done = 0, hideTimer = null;
        window.__zulmatPendingGlbs = 0;
        const elBox = document.getElementById('asset-loading');
        const elTxt = document.getElementById('asset-loading-txt');
        const elFill = document.getElementById('asset-loading-fill');
        function sync() {
          if (!elBox || !elTxt || !elFill) return;
          if (total <= 0) return;
          const pct = Math.min(100, Math.round((done / total) * 100));
          elTxt.textContent = '3D MODELLAR YUKLANMOQDA: ' + done + ' / ' + total + ' (' + pct + '%)';
          elFill.style.width = pct + '%';
          if (done < total) {
            clearTimeout(hideTimer);
            elBox.classList.remove('hidden');
          } else {
            elTxt.textContent = 'TAYYOR (' + total + ' / ' + total + ')';
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => elBox.classList.add('hidden'), 900);
          }
        }
        gltfLoader.load = function (url, onLoad, onProg, onErr) {
          total++;
          window.__zulmatPendingGlbs++;
          sync();
          let settled = false;
          const finish = () => { if (!settled) { settled = true; done++; window.__zulmatPendingGlbs = Math.max(0, (window.__zulmatPendingGlbs || 1) - 1); sync(); } };
          setTimeout(finish, 10000);
          const cdnPrefix = 'https://cdn.jsdelivr.net/gh/revilend/backrooms-game@main/';
          const rawPrefix = 'https://raw.githubusercontent.com/revilend/backrooms-game/main/';
          return origLoad(
            url,
            (res) => { finish(); if (onLoad) onLoad(res); },
            onProg,
            (err) => {
              if (typeof url === 'string' && url.startsWith(cdnPrefix)) {
                const rawUrl = rawPrefix + url.slice(cdnPrefix.length);
                origLoad(
                  rawUrl,
                  (res2) => { finish(); if (onLoad) onLoad(res2); },
                  onProg,
                  (err2) => { finish(); if (onErr) onErr(err2); }
                );
              } else {
                finish(); if (onErr) onErr(err);
              }
            }
          );
        };
      })();
      if (THREE.DRACOLoader) {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/libs/draco/gltf/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const ch = MAZE_MAP[r][c];
          const pos = gridToWorld(r, c);
          if (ch === '#') {
            wallCoords.push(pos);
            wallBoxes.push({ x: pos.x, z: pos.z, half: CELL / 2 });
          } else {
            openCells.push({ r, c, x: pos.x, z: pos.z });
            const lightPocket = Math.sin(r * 0.24) * Math.cos(c * 0.24) + 0.38 * Math.sin(r * 0.45 + c * 0.35);
            const inBlackoutZone = ((r >= 80 && c <= 38) || (r >= 44 && r <= 72 && c >= 84) || lightPocket < -0.15);
            if (!inBlackoutZone && r % 3 === 0 && c % 3 === 0) {
              lampCoords.push(pos);
            }
            if (ch === 'S') {
              spawnPos.set(pos.x, 1.65, pos.z);
            } else if (ch === 'M') {
              monsterSpawn.set(pos.x, 0, pos.z);
            } else if (ch === 'L') {
              // Tuck locker flush against an adjacent solid wall so it never blocks the corridor center
              let lx = pos.x, lz = pos.z, lRot = 0;
              const offW = CELL * 0.5 - 0.52;
              if (r > 0 && MAZE_MAP[r - 1][c] === '#') { lz -= offW; lRot = 0; }
              else if (r < GRID_ROWS - 1 && MAZE_MAP[r + 1][c] === '#') { lz += offW; lRot = Math.PI; }
              else if (c > 0 && MAZE_MAP[r][c - 1] === '#') { lx -= offW; lRot = Math.PI / 2; }
              else if (c < GRID_COLS - 1 && MAZE_MAP[r][c + 1] === '#') { lx += offW; lRot = -Math.PI / 2; }
              const lg = new THREE.Group();
              const body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.35, 0.95), lockerBodyMat);
              body.position.y = 1.175;
              lg.add(body);
              for (let s = 0; s < 3; s++) {
                const slit = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.04), lockerSlitMat);
                slit.position.set(0, 1.85 - s * 0.14, 0.48);
                lg.add(slit);
              }
              const sign = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.06), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
              sign.position.set(0.32, 1.2, 0.48);
              lg.add(sign);
              lg.position.set(lx, 0, lz);
              lg.rotation.y = lRot;
              level0Group.add(lg);
              if (typeof gltfLoader !== 'undefined') {
                gltfLoader.load(REPO_GLB_BASE + 'locker.glb', (gltf) => {
                  try {
                    const lm = gltf.scene.clone(true);
                    const bx = new THREE.Box3().setFromObject(lm);
                    const sz = new THREE.Vector3(); bx.getSize(sz);
                    const sc = 2.35 / Math.max(0.1, sz.y);
                    lm.scale.setScalar(sc);
                    lm.updateMatrixWorld(true);
                    const bx2 = new THREE.Box3().setFromObject(lm);
                    const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
                    lm.position.set(-ctr.x, -bx2.min.y, -ctr.z);
                    lg.children.forEach((chd) => { chd.visible = false; });
                    lg.add(lm);
                  } catch (e) {}
                }, undefined, () => {});
              }
              const lkObj = { x: lx, z: lz, mesh: lg };
              lockers.push(lkObj);
              wallBoxes.push({ x: lx, z: lz, halfX: 0.56, halfZ: 0.56, lockerRef: lkObj, isProp: true });
            } else if (ch === 'K') {
              spawnKeyAt(pos.x, pos.z);
            } else if (ch === 'B') {
              spawnBatteryAt(pos.x, pos.z);
            } else if (ch === 'E') {
              exitInfo.x = pos.x;
              exitInfo.z = pos.z;
              const exitGroup = new THREE.Group();
              exitGroup.position.set(pos.x, 0, pos.z);
              const steelMat = new THREE.MeshStandardMaterial({ color: 0x222936, metalness: 0.72, roughness: 0.34 });
              // Heavy industrial door jambs & lintel
              const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.48), steelMat);
              jambL.position.set(-1.18, 1.6, 0);
              const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.48), steelMat);
              jambR.position.set(1.18, 1.6, 0);
              const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.36, 0.52), steelMat);
              lintel.position.set(0, 3.05, 0);
              exitGroup.add(jambL, jambR, lintel);

              // Glowing bright escape portal behind the steel door (visible once door swings open!)
              const portalMat = new THREE.MeshBasicMaterial({ color: 0x181c24 });
              const portal = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.86), portalMat);
              portal.position.set(0, 1.44, -0.04);
              const portalBack = portal.clone();
              portalBack.rotation.y = Math.PI;
              portalBack.position.set(0, 1.44, 0.04);
              exitGroup.add(portal, portalBack);

              // Textured industrial fire-exit steel door leaf on a hinged pivot
              const dc = document.createElement('canvas');
              dc.width = 256; dc.height = 512;
              const dg = dc.getContext('2d');
              dg.fillStyle = '#3f4956';
              dg.fillRect(0, 0, 256, 512);
              dg.strokeStyle = '#1f252e';
              dg.lineWidth = 8;
              dg.strokeRect(18, 22, 220, 200);
              dg.strokeRect(18, 244, 220, 196);
              // Industrial yellow-black hazard stripe near bottom
              dg.fillStyle = '#ca8a04';
              dg.fillRect(14, 456, 228, 34);
              dg.fillStyle = '#18181b';
              for (let sx = -20; sx < 260; sx += 28) {
                dg.beginPath();
                dg.moveTo(sx, 490); dg.lineTo(sx + 14, 490);
                dg.lineTo(sx + 28, 456); dg.lineTo(sx + 14, 456);
                dg.closePath(); dg.fill();
              }
              const doorTex = new THREE.CanvasTexture(dc);
              const doorPivot = new THREE.Group();
              doorPivot.position.set(-1.05, 0, 0);
              const doorMat = new THREE.MeshStandardMaterial({ map: doorTex, color: 0xcbd5e1, roughness: 0.45, metalness: 0.45 });
              const door = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.86, 0.14), doorMat);
              door.position.set(1.05, 1.43, 0);
              doorPivot.add(door);

              // Stainless steel panic push-bar on both sides
              const barMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.22 });
              const pushBarF = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.11, 0.08), barMat);
              pushBarF.position.set(1.05, 1.28, 0.10);
              const pushBarB = pushBarF.clone();
              pushBarB.position.z = -0.10;
              doorPivot.add(pushBarF, pushBarB);
              exitGroup.add(doorPivot);

              // Glowing EXIT sign light-box above door (CanvasTexture)
              const sc = document.createElement('canvas');
              sc.width = 256; sc.height = 96;
              const sg = sc.getContext('2d');
              sg.fillStyle = '#111827';
              sg.fillRect(0, 0, 256, 96);
              sg.strokeStyle = '#ffffff';
              sg.lineWidth = 6;
              sg.strokeRect(8, 8, 240, 80);
              sg.fillStyle = '#ffffff';
              sg.font = 'bold 58px sans-serif';
              sg.textAlign = 'center';
              sg.textBaseline = 'middle';
              sg.fillText('EXIT', 128, 52);
              const signTex = new THREE.CanvasTexture(sc);
              const signMat = new THREE.MeshBasicMaterial({ map: signTex, color: 0xef4444 });
              const signBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 0.18), signMat);
              signBox.position.set(0, 3.44, 0);
              exitGroup.add(signBox);
              if (typeof spawnRepoProp === 'function') {
                spawnRepoProp(exitGroup, 'exit_sign.glb', 0, 3.25, 0.24, 0.48, 0, { centerXZ: true });
                signBox.visible = false;
              }

              level0Group.add(exitGroup);
              const eLight = new THREE.PointLight(0xef4444, 1.2, 10);
              eLight.position.set(pos.x, 3.1, pos.z);
              level0Group.add(eLight);
              exitInfo.doorMesh = door;
              exitInfo.doorPivot = doorPivot;
              spawnRepoProp(doorPivot, 'double_door.glb', 1.05, 0, 0, 2.86, 0, { centerXZ: true, flatZ: true, hideOldChildren: true });
              exitInfo.signMat = signMat;
              exitInfo.portalMat = portalMat;
              exitInfo.light = eLight;
            } else if ((r * 7 + c * 11) % 23 === 0) {
              // Candidate spot for real internet 3D Backrooms furniture & props!
              propSpots.push({ x: pos.x, z: pos.z, rot: ((r + c) % 4) * (Math.PI / 2) + 0.25 });
            }
          }
        }
      }

      // Single-draw-call InstancedMesh for all walls in the 164m x 164m Level 0 Mega Map!
      const wallInst = new THREE.InstancedMesh(wallGeo, wallMat, wallCoords.length);
      const dummy = new THREE.Object3D();
      wallCoords.forEach((p, idx) => {
        dummy.position.set(p.x, WALL_H / 2, p.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        wallInst.setMatrixAt(idx, dummy.matrix);
      });
      wallInst.instanceMatrix.needsUpdate = true;
      level0Group.add(wallInst);
      // --- LEVEL 0 DISTINCT ARCHITECTURAL ZONES (Office Wing, High-Ceiling Atrium, Glass Partitions) ---
      (function buildLevel0DistinctZones() {
        // Zone B: Red-Carpeted Sunken Office Wing (r: 3..15, c: 36..48)
        const offCenter = gridToWorld(9, 42);
        const redCarpet = new THREE.Mesh(
          new THREE.PlaneGeometry(13 * CELL, 13 * CELL),
          new THREE.MeshLambertMaterial({ color: 0x5c181d })
        );
        redCarpet.rotation.x = -Math.PI / 2;
        redCarpet.position.set(offCenter.x, 0.02, offCenter.z);
        level0Group.add(redCarpet);
        const deskMat = new THREE.MeshLambertMaterial({ color: 0x452715 });
        [[6, 39], [6, 45], [12, 39], [12, 45]].forEach(([dr, dc], idx) => {
          const dp = gridToWorld(dr, dc);
          const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.88, 1.1), deskMat);
          desk.position.set(dp.x, 0.44, dp.z);
          level0Group.add(desk);
          wallBoxes.push({ x: dp.x, z: dp.z, halfX: 1.15, halfZ: 0.6, isProp: true });
          spawnRepoProp(level0Group, 'crt_pc.glb', dp.x, 0.88, dp.z, 0.65, idx * 1.57, { centerXZ: true });
          spawnGltfProp(level0Group, 'SheenChair/glTF-Binary/SheenChair.glb', dp.x, 0, dp.z + 1.0, 0.95, Math.PI);
        });

        // Zone C: Grand Central High-Ceiling Atrium (r: 21..31, c: 21..33)
        const atrCenter = gridToWorld(26, 27);
        const atrVoid = new THREE.Mesh(
          new THREE.BoxGeometry(11 * CELL, 4.2, 9 * CELL),
          new THREE.MeshLambertMaterial({ color: 0x26241a, side: THREE.BackSide })
        );
        atrVoid.position.set(atrCenter.x, WALL_H + 2.0, atrCenter.z);
        level0Group.add(atrVoid);
        const atrLight = new THREE.PointLight(0xfef08a, 0.65, 28);
        atrLight.position.set(atrCenter.x, WALL_H + 2.6, atrCenter.z);
        level0Group.add(atrLight);

        // Zone D: Dusty Glass Office Partitions in Hall (r: 13..21, c: 4..14) — see Bacteria patrolling through the glass!
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xa5b4b0, transparent: true, opacity: 0.34, roughness: 0.15, metalness: 0.1, side: THREE.DoubleSide
        });
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        [[17, 7], [17, 11]].forEach(([gr, gc]) => {
          const gp = gridToWorld(gr, gc);
          const pane = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.92, WALL_H * 0.82, 0.12), glassMat);
          pane.position.set(gp.x, WALL_H * 0.41, gp.z);
          const trim = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.96, 0.18, 0.18), frameMat);
          trim.position.set(gp.x, WALL_H * 0.84, gp.z);
          level0Group.add(pane, trim);
          wallBoxes.push({ x: gp.x, z: gp.z, halfX: CELL * 0.46, halfZ: 0.16 });
        });
        // --- CHARCOAL BACKROOMS WALL GRAFFITI (Bacteria Entity Sketches & Uzbek Lore Warnings) ---
        function makeGraffitiTex(kind) {
          const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
          const cx = cv.getContext('2d');
          cx.clearRect(0, 0, 512, 512);
          cx.strokeStyle = '#0c0c0e'; cx.fillStyle = '#0c0c0e'; cx.lineCap = 'round'; cx.lineJoin = 'round';
          function scribble(pts, lw) {
            for (let pass = 0; pass < 3; pass++) {
              cx.lineWidth = lw - pass * 2;
              cx.beginPath();
              pts.forEach(([x, y], idx) => {
                const jx = x + (pass - 1) * 3.5;
                const jy = y + (pass - 1) * 2.5;
                if (idx === 0) cx.moveTo(jx, jy); else cx.lineTo(jx, jy);
              });
              cx.stroke();
            }
          }
          if (kind === 'bacteria') {
            // Classic multi-armed black-ink Bacteria entity sketch
            cx.beginPath(); cx.ellipse(256, 118, 28, 36, 0.08, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#d4c98a'; cx.beginPath(); cx.arc(246, 112, 4, 0, Math.PI * 2); cx.arc(266, 114, 4, 0, Math.PI * 2); cx.fill();
            cx.fillStyle = '#0c0c0e';
            scribble([[256, 150], [250, 235], [262, 310]], 14);
            scribble([[252, 185], [185, 130], [120, 88]], 10);
            scribble([[252, 205], [190, 195], [135, 225]], 9);
            scribble([[258, 182], [328, 132], [392, 108]], 10);
            scribble([[258, 208], [332, 198], [388, 226]], 9);
            scribble([[254, 245], [175, 295], [105, 315]], 10);
            scribble([[258, 248], [342, 285], [405, 275]], 10);
            scribble([[254, 305], [225, 415]], 11);
            scribble([[260, 305], [288, 420]], 11);
            cx.font = 'bold 34px monospace'; cx.textAlign = 'center';
            cx.fillText('U ESHITADI...', 256, 476);
          } else if (kind === 'noexit') {
            cx.font = 'bold 42px monospace'; cx.textAlign = 'center';
            cx.fillText('BU YERDAN', 256, 150);
            cx.fillText("CHIQISH YO'Q", 256, 205);
            // Survivor tally marks
            for (let g = 0; g < 3; g++) {
              const bx = 110 + g * 115;
              for (let k = 0; k < 4; k++) scribble([[bx + k * 18, 275], [bx + k * 18 - 4, 345]], 7);
              scribble([[bx - 10, 332], [bx + 68, 288]], 7);
            }
          } else if (kind === 'lookback') {
            cx.font = 'bold 44px monospace'; cx.textAlign = 'center';
            cx.fillText('ORQANGA', 256, 165);
            cx.fillText('QARAMA!', 256, 220);
            // Creepy eye
            scribble([[146, 325], [256, 270], [366, 325], [256, 380], [146, 325]], 9);
            cx.beginPath(); cx.arc(256, 325, 26, 0, Math.PI * 2); cx.fill();
          } else if (kind === 'hide') {
            cx.font = 'bold 34px monospace'; cx.textAlign = 'center';
            cx.fillText("CHIROQ O'CHSA", 256, 165);
            cx.fillText('SHKAFGA YASHIRIN', 256, 215);
            scribble([[120, 300], [375, 300]], 11);
            scribble([[325, 255], [380, 300], [325, 345]], 11);
          } else if (kind === 'meg') {
            cx.font = 'bold 38px monospace'; cx.textAlign = 'center';
            cx.fillText('M.E.G. // BEKAT 0', 256, 185);
            cx.font = 'bold 30px monospace';
            cx.fillText('BIZ BU YERDA EDIK', 256, 245);
            cx.fillText("KALITLARNI TOPING", 256, 300);
          } else {
            cx.beginPath(); cx.arc(176, 184, 18, 0, Math.PI * 2); cx.fill();
            cx.beginPath(); cx.arc(336, 184, 18, 0, Math.PI * 2); cx.fill();
            cx.lineWidth = 16; cx.beginPath(); cx.arc(256, 236, 118, 0.25, Math.PI - 0.25); cx.stroke();
            cx.font = 'bold 32px monospace'; cx.textAlign = 'center';
            cx.fillText('XUSH KELIBSIZ', 256, 420);
          }
          const tex = new THREE.CanvasTexture(cv);
          tex.needsUpdate = true;
          return tex;
        }
        window.__zulmatMakeGraffitiTex = makeGraffitiTex;
        const grafTexPool = [
          makeGraffitiTex('bacteria'),
          makeGraffitiTex('noexit'),
          makeGraffitiTex('lookback'),
          makeGraffitiTex('hide'),
          makeGraffitiTex('meg'),
          makeGraffitiTex('smile')
        ];
        // Scan real maze corridor walls and attach 16 graffiti decals flush against solid # walls!
        (function placeLevel0Graffiti() {
          const halfC = CELL * 0.5;
          const dirs = [
            { dr: -1, dc: 0, ox: 0, oz: -halfC + 0.04, ry: 0 },
            { dr: 1, dc: 0, ox: 0, oz: halfC - 0.04, ry: Math.PI },
            { dr: 0, dc: -1, ox: -halfC + 0.04, oz: 0, ry: Math.PI / 2 },
            { dr: 0, dc: 1, ox: halfC - 0.04, oz: 0, ry: -Math.PI / 2 }
          ];
          const spots = [];
          for (let r = 2; r < MAZE_MAP.length - 2; r += 3) {
            for (let c = 2; c < MAZE_MAP[0].length - 2; c += 4) {
              if (MAZE_MAP[r][c] === '#') continue;
              for (let d = 0; d < dirs.length; d++) {
                const nr = r + dirs[d].dr, nc = c + dirs[d].dc;
                if (MAZE_MAP[nr] && MAZE_MAP[nr][nc] === '#') {
                  spots.push({ r, c, dir: dirs[d] });
                  break;
                }
              }
            }
          }
          const count = Math.min(16, spots.length);
          for (let i = 0; i < count; i++) {
            const pick = spots[Math.floor((i * spots.length) / count)];
            const gp = gridToWorld(pick.r, pick.c);
            const dec = new THREE.Mesh(
              new THREE.PlaneGeometry(2.35, 2.35),
              new THREE.MeshBasicMaterial({ map: grafTexPool[i % grafTexPool.length], transparent: true, opacity: 0.88, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 })
            );
            dec.position.set(gp.x + pick.dir.ox, 1.75, gp.z + pick.dir.oz);
            dec.rotation.y = pick.dir.ry;
            level0Group.add(dec);
          }
        })();

        window.l0Ladders = [];
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x784b2a });
        const upperFloorMat = new THREE.MeshLambertMaterial({ color: 0x3a372a, map: backWallTex });
        const upperWallMat = new THREE.MeshLambertMaterial({ color: 0x9c9258, map: backWallTex });
        const upperCeilMat = new THREE.MeshLambertMaterial({ color: 0x1e2024 });
        const hatchMat = new THREE.MeshBasicMaterial({ color: 0x050608 });

        // 100m x 100m Upper Floor (-50..+50 in X & Z) above WALL_H (3.8m)
        const UP_Y = 4.05, UP_H = 3.4;
        const upFloor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), upperFloorMat);
        upFloor.rotation.x = -Math.PI / 2;
        upFloor.position.set(0, UP_Y, 0);
        level0Group.add(upFloor);
        const upCeil = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), upperCeilMat);
        upCeil.rotation.x = Math.PI / 2;
        upCeil.position.set(0, UP_Y + UP_H, 0);
        level0Group.add(upCeil);
        [
          { x: 0, z: -50, w: 100, d: 0.6 },
          { x: 0, z: 50, w: 100, d: 0.6 },
          { x: -50, z: 0, w: 0.6, d: 100 },
          { x: 50, z: 0, w: 0.6, d: 100 }
        ].forEach((pw) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(pw.w, UP_H, pw.d), upperWallMat);
          m.position.set(pw.x, UP_Y + UP_H / 2, pw.z);
          level0Group.add(m);
          wallBoxes.push({ x: pw.x, z: pw.z, halfX: pw.w / 2, halfZ: pw.d / 2, upperWall: true });
        });
        // Support pillars & warm industrial lights across the 100x100 upper hall
        for (let ux = -36; ux <= 36; ux += 24) {
          for (let uz = -36; uz <= 36; uz += 24) {
            if (Math.abs(ux) < 8 && Math.abs(uz) < 8) continue;
            const pil = new THREE.Mesh(new THREE.BoxGeometry(1.1, UP_H, 1.1), upperWallMat);
            pil.position.set(ux, UP_Y + UP_H / 2, uz);
            level0Group.add(pil);
            wallBoxes.push({ x: ux, z: uz, halfX: 0.55, halfZ: 0.55, upperWall: true });
            const ul = new THREE.PointLight(0xfef08a, 0.7, 22);
            ul.position.set(ux + 3, UP_Y + UP_H - 0.35, uz + 3);
            level0Group.add(ul);
          }
        }
        // Interior partition walls with doorways inside the 100m x 100m Upper Floor
        [
          { x: -25, z: -18, w: 32, d: 0.55 },
          { x: 25, z: -18, w: 32, d: 0.55 },
          { x: -25, z: 18, w: 32, d: 0.55 },
          { x: 25, z: 18, w: 32, d: 0.55 },
          { x: -18, z: 0, w: 0.55, d: 24 },
          { x: 18, z: 0, w: 0.55, d: 24 }
        ].forEach((uw) => {
          const wm = new THREE.Mesh(new THREE.BoxGeometry(uw.w, UP_H, uw.d), upperWallMat);
          wm.position.set(uw.x, UP_Y + UP_H / 2, uw.z);
          level0Group.add(wm);
          wallBoxes.push({ x: uw.x, z: uw.z, halfX: uw.w / 2, halfZ: uw.d / 2, upperWall: true });
        });

        // Upper-floor supply pickups (grounded on cabinets at UP_Y)
        const upSpots = [[-32, -32], [32, -32], [-32, 32], [32, 32], [0, -34]];
        upSpots.forEach(([sx, sz], idx) => {
          // Cabinet base at UP_Y
          const cabG = new THREE.Group();
          cabG.position.set(sx, UP_Y, sz);
          level0Group.add(cabG);
          if (typeof gltfLoader !== 'undefined') {
            gltfLoader.load(REPO_GLB_BASE + 'cabinet.glb', (gltf) => {
              try {
                const cm = gltf.scene.clone(true);
                const bx = new THREE.Box3().setFromObject(cm);
                const ssz = new THREE.Vector3(); bx.getSize(ssz);
                const sc = 0.9 / Math.max(0.1, ssz.y);
                cm.scale.setScalar(sc);
                cm.updateMatrixWorld(true);
                const bx2 = new THREE.Box3().setFromObject(cm);
                const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
                cm.position.set(-ctr.x, -bx2.min.y, -ctr.z);
                cabG.add(cm);
              } catch (e) {}
            }, undefined, () => {});
          }
          if (idx < 3) {
            const bg = new THREE.Group();
            bg.position.set(sx, UP_Y + 0.92, sz);
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 10), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.55 }));
            const pt = new THREE.PointLight(0x4ade80, 0.7, 5); pt.position.y = 0.25;
            bg.add(cyl, pt);
            level0Group.add(bg);
            if (typeof gltfLoader !== 'undefined') {
              gltfLoader.load(REPO_GLB_BASE + 'battery.glb', (gltf) => {
                try {
                  const bm = gltf.scene.clone(true);
                  const bx = new THREE.Box3().setFromObject(bm);
                  const bsz = new THREE.Vector3(); bx.getSize(bsz);
                  bm.scale.setScalar(0.36 / Math.max(0.01, bsz.y));
                  bm.updateMatrixWorld(true);
                  const bx2 = new THREE.Box3().setFromObject(bm);
                  const c2 = new THREE.Vector3(); bx2.getCenter(c2);
                  bm.position.set(-c2.x, -bx2.min.y, -c2.z);
                  cyl.visible = false;
                  bg.add(bm);
                } catch (e) {}
              }, undefined, () => {});
            }
            batteries.push({ x: sx, y: UP_Y, z: sz, mesh: bg, collected: false });
          } else {
            const ag = new THREE.Group();
            ag.position.set(sx, UP_Y + 0.92, sz);
            const pt = new THREE.PointLight(0x22d3ee, 0.85, 6);
            ag.add(pt);
            level0Group.add(ag);
            if (typeof gltfLoader !== 'undefined') {
              gltfLoader.load(REPO_GLB_BASE + 'almond_water.glb', (gltf) => {
                try {
                  const am = gltf.scene.clone(true);
                  const bx = new THREE.Box3().setFromObject(am);
                  const asz = new THREE.Vector3(); bx.getSize(asz);
                  am.scale.setScalar(0.46 / Math.max(0.01, asz.y));
                  am.updateMatrixWorld(true);
                  const bx2 = new THREE.Box3().setFromObject(am);
                  const c2 = new THREE.Vector3(); bx2.getCenter(c2);
                  am.position.set(-c2.x, -bx2.min.y, -c2.z);
                  ag.add(am);
                } catch (e) {}
              }, undefined, () => {});
            }
            window.l0UpperPickups = window.l0UpperPickups || [];
            window.l0UpperPickups.push({ x: sx, y: UP_Y, z: sz, mesh: ag, taken: false });
          }
        });

        // Upper-floor patrolling Shadow Stalker (only active when player climbs up!)
        const upMonG = new THREE.Group();
        const upBodyM = new THREE.MeshBasicMaterial({ color: 0x050507 });
        const upEyeM = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const uTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 1.55, 8), upBodyM); uTorso.position.y = 1.25;
        const uHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), upBodyM); uHead.position.y = 2.2;
        const uEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), upEyeM); uEyeL.position.set(-0.08, 2.24, 0.19);
        const uEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), upEyeM); uEyeR.position.set(0.08, 2.24, 0.19);
        const uGlow = new THREE.PointLight(0xef4444, 0.85, 7); uGlow.position.set(0, 2.0, 0.3);
        upMonG.add(uTorso, uHead, uEyeL, uEyeR, uGlow);
        upMonG.position.set(28, UP_Y, 28);
        level0Group.add(upMonG);
        window.l0UpperStalker = {
          group: upMonG,
          pos: new THREE.Vector3(28, UP_Y, 28),
          tx: -28, tz: -28
        };

        if (typeof walkPlatforms !== 'undefined') {
          walkPlatforms.push({ zone: 'level0', minX: -50, maxX: 50, minZ: -50, maxZ: 50, topY: UP_Y });
        }

        // Pick 3 open cells inside [-42..42] for ladders connecting Ground Floor <-> 100x100 Upper Floor
        const ladderCands = openCells.filter((c) => Math.abs(c.x) <= 42 && Math.abs(c.z) <= 42);
        const lStep = Math.max(1, Math.floor(ladderCands.length / 4));
        for (let li = 0; li < 3 && li * lStep < ladderCands.length; li++) {
          const lp = ladderCands[li * lStep];
          const lg = new THREE.Group(); lg.position.set(lp.x, 0, lp.z);
          [-0.32, 0.32].forEach((rx) => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.1, 0.08), woodMat);
            rail.position.set(rx, 2.05, 0); lg.add(rail);
          });
          for (let s = 0; s < 9; s++) {
            const rung = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.06), woodMat);
            rung.position.set(0, 0.4 + s * 0.42, 0); lg.add(rung);
          }
          const hatch = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), hatchMat);
          hatch.rotation.x = Math.PI / 2;
          hatch.position.set(0, WALL_H - 0.01, 0); lg.add(hatch);
          const hatchGlow = new THREE.PointLight(0xfef08a, 0.9, 8);
          hatchGlow.position.set(0, UP_Y + 1.4, 0); lg.add(hatchGlow);
          level0Group.add(lg);
          window.l0Ladders.push({ x: lp.x, z: lp.z, topY: UP_Y + 1.65, bottomY: 1.65 });
        }




        // --- Story Mode Starting Flashlight Pickup ahead of spawnPos ---
        (function spawnStarterFlashlight() {
          let fx = spawnPos.x, fz = spawnPos.z - 2.6;
          // Pick an open cell adjacent to spawnPos (preferring straight ahead -Z) so it's always reachable & visible
          const sCell = openCells.find((c) => Math.hypot(c.x - spawnPos.x, c.z - spawnPos.z) < 2.2) || openCells[0];
          if (sCell) {
            const dirs = [
              { dr: -1, dc: 0 }, { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }
            ];
            for (const d of dirs) {
              const nb = openCells.find((c) => c.r === sCell.r + d.dr && c.c === sCell.c + d.dc);
              if (nb) { fx = (spawnPos.x + nb.x) * 0.5; fz = (spawnPos.z + nb.z) * 0.5; break; }
            }
          }
          if (typeof spawnGroundPedestal === 'function') {
            const _pf = spawnGroundPedestal(level0Group, fx, fz, 0);
            fx = _pf.x; fz = _pf.z;
          }
          const fg = new THREE.Group();
          fg.position.set(fx, 0.92, fz);
          const fbCyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.28, 12),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
          );
          fbCyl.rotation.x = Math.PI / 2;
          const fbLens = new THREE.Mesh(
            new THREE.CircleGeometry(0.05, 12),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          fbLens.position.z = -0.145; fbLens.rotation.y = Math.PI;
          const fLight = new THREE.PointLight(0xfef08a, 1.35, 7);
          fLight.position.set(0, 0.42, 0);
          fg.add(fbCyl, fbLens, fLight);
          level0Group.add(fg);
          if (typeof gltfLoader !== 'undefined') {
            gltfLoader.load(REPO_GLB_BASE + 'flashlight.glb', (gltf) => {
              try {
                const fm = gltf.scene.clone(true);
                if (typeof stripGltfLights === 'function') stripGltfLights(fm);
                const bx = new THREE.Box3().setFromObject(fm);
                const sz = new THREE.Vector3(); bx.getSize(sz);
                const longest = Math.max(sz.x, sz.y, sz.z, 0.01);
                if (sz.y >= sz.x && sz.y >= sz.z) fm.rotation.x = -Math.PI / 2;
                else if (sz.x > sz.z && sz.x >= sz.y) fm.rotation.y = Math.PI / 2;
                fm.scale.setScalar(0.32 / longest);
                fm.updateMatrixWorld(true);
                const bx2 = new THREE.Box3().setFromObject(fm);
                const ctr = new THREE.Vector3(); bx2.getCenter(ctr);
                fm.position.set(-ctr.x, -bx2.min.y, -ctr.z);
                fbCyl.visible = false; fbLens.visible = false;
                fg.add(fm);
              } catch (e) {}
            }, undefined, () => {});
          }
          window.l0FlashPickup = { x: fx, z: fz, mesh: fg, taken: false };
        })();

        // --- 5 M.E.G. Archive Story Notes in Level 0 ---
        window.l0LoreNotes = [];
        const noteMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde047, emissiveIntensity: 0.25, roughness: 0.8 });
        const LORE_ENTRIES = [
          {
            uz: ["QOG'OZ #01: BIRINCHI KUN", "Metro stansiyasida kutilmaganda pol ostidan tushib ketdim. Soat ishlamayapti. Atrofda faqat nam gilam va sariq devorlar... Agar kimdir buni o'qisa: bu joydan chiqish uchun kalitlar va EXIT kodini topish kerak."],
            en: ["NOTE #01: DAY ONE", "I slipped right through the metro floor. My watch stopped. Only damp carpet and yellow walls everywhere... Find the keys and the EXIT code to escape."],
            ru: ["ЗАПИСКА #01: ДЕНЬ ПЕРВЫЙ", "Я провалился прямо сквозь пол метро. Часы встали. Вокруг лишь сырой ковёр и жёлтые стены... Найдите ключи и код от EXIT, чтобы выбраться."]
          },
          {
            uz: ["QOG'OZ #02: SOYA ZAIFLIGI", "M.E.G. kuzatuvi: Soya chiroq yorug'ligi va yugurish tovushini uzoqdan sezadi. Lekin kuchli fonar chaqnashi (G / chaqmoq tugmasi) uni 3 soniyaga ko'r qilib to'xtatadi!"],
            en: ["NOTE #02: ENTITY WEAKNESS", "M.E.G. Log: The Entity tracks flashlight beams and sprinting footsteps. However, a high-energy Flash Surge (G / lightning button) blinds it for 3 seconds!"],
            ru: ["ЗАПИСКА #02: СЛАБОСТЬ СУЩНОСТИ", "Отчёт M.E.G.: Сущность слышит бег и видит свет фонаря. Но мощная вспышка (G / кнопка молнии) ослепляет её на 3 секунды!"]
          },
          {
            uz: ["QOG'OZ #03: QORA CHUQURLAR", "Ba'zi xonalar o'rtasida tubsiz qora chuqurlar ochilgan. O'rtadan yurma — faqat devor chetidagi tor yo'lakdan muvozanat saqlab o't."],
            en: ["NOTE #03: DARK PITS", "Bottomless black chasms have opened in several rooms. Never step into the center — balance carefully along the narrow edge."],
            ru: ["ЗАПИСКА #03: ТЁМНЫЕ ПРОПАСТИ", "В некоторых комнатах открылись бездонные провалы. Не шагайте в центр — осторожно идите по узкому краю."]
          },
          {
            uz: ["QOG'OZ #04: YUQORI OMBOR", "Narvonlar shift ustidagi 100x100m zaxira qavatga olib chiqadi. U yerda batareya va bodom suvi bor, lekin tepada ham bitta Soya kezib yuribdi."],
            en: ["NOTE #04: UPPER STORAGE", "The wooden ladders lead to a 100x100m upper floor above the ceiling. Extra batteries and Almond Water are stored there, guarded by an Upper Stalker."],
            ru: ["ЗАПИСКА #04: ВЕРХНИЙ СКЛАД", "Лестницы ведут на верхний этаж 100x100м над потолком. Там есть батареи и миндальная вода, но наверху тоже бродит Сущность."]
          },
          {
            uz: ["QOG'OZ #05: RUSTAMNING XATI", "Bodom suvi nafaqat chanqoqni bosadi, balki aqlni ham joyiga qaytaradi. Agar ko'zingiz qorong'ulashsa, shkafga yashirinib nafas rostlang."],
            en: ["NOTE #05: SURVIVOR'S NOTE", "Almond Water restores both stamina and sanity. If you hear heavy footsteps nearby, hide inside a locker and hold your breath."],
            ru: ["ЗАПИСКА #05: ЗАПИСКА ВЫЖИВШЕГО", "Миндальная вода восстанавливает и силы, и рассудок. Услышав тяжёлые шаги, спрячьтесь в шкаф и затаите дыхание."]
          }
        ];
        const noteCands = openCells.filter((c) => Math.hypot(c.x - spawnPos.x, c.z - spawnPos.z) > 10);
        const nStep = Math.max(1, Math.floor(noteCands.length / 6));
        for (let ni = 0; ni < LORE_ENTRIES.length && (ni + 1) * nStep < noteCands.length; ni++) {
          const nc = noteCands[(ni + 1) * nStep];
          const ng = new THREE.Group();
          ng.position.set(nc.x, 0.025, nc.z);
          const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.62), noteMat);
          sheet.rotation.x = -Math.PI / 2;
          sheet.rotation.z = (ni * 0.7) % 1.2;
          const nGlow = new THREE.PointLight(0xfde047, 0.55, 4.5);
          nGlow.position.y = 0.35;
          ng.add(sheet, nGlow);
          level0Group.add(ng);
          window.l0LoreNotes.push({ x: nc.x, z: nc.z, mesh: ng, data: LORE_ENTRIES[ni], read: false });
        }

        // --- Pitch-Black Abyss Pit Rooms (narrow 0.56m balance ledges around edges) ---
        window.l0PitTraps = [];
        const abyssVoidMat = new THREE.MeshBasicMaterial({ color: 0x010102 });
        const abyssEdgeMat = new THREE.MeshLambertMaterial({ color: 0x3b2f16 });
        const abyssRimMat = new THREE.MeshBasicMaterial({ color: 0x713f12 });
        const pitCands = openCells.filter((c) => {
          const dSpawn = Math.hypot(c.x - spawnPos.x, c.z - spawnPos.z);
          const dExit = typeof exitInfo !== 'undefined' ? Math.hypot(c.x - exitInfo.x, c.z - exitInfo.z) : 99;
          const nearLad = (window.l0Ladders || []).some((ld) => Math.hypot(c.x - ld.x, c.z - ld.z) < 6.0);
          return dSpawn > 14 && dExit > 10 && !nearLad;
        });
        const pStep = Math.max(1, Math.floor(pitCands.length / 7));
        for (let pi = 0; pi < 6 && (pi + 1) * pStep < pitCands.length; pi++) {
          const pc = pitCands[(pi + 1) * pStep];
          const pg = new THREE.Group();
          pg.position.set(pc.x, 0, pc.z);
          const rimW = 3.24, holeW = 3.06;
          const curb = new THREE.Mesh(new THREE.PlaneGeometry(rimW, rimW), abyssEdgeMat);
          curb.rotation.x = -Math.PI / 2;
          curb.position.y = 0.014;
          pg.add(curb);
          const voidPlane = new THREE.Mesh(new THREE.PlaneGeometry(holeW, holeW), abyssVoidMat);
          voidPlane.rotation.x = -Math.PI / 2;
          voidPlane.position.y = 0.022;
          pg.add(voidPlane);
          [
            { x: 0, z: -holeW / 2, w: holeW, d: 0.08 },
            { x: 0, z: holeW / 2, w: holeW, d: 0.08 },
            { x: -holeW / 2, z: 0, w: 0.08, d: holeW },
            { x: holeW / 2, z: 0, w: 0.08, d: holeW }
          ].forEach((st) => {
            const sm = new THREE.Mesh(new THREE.PlaneGeometry(st.w, st.d), abyssRimMat);
            sm.rotation.x = -Math.PI / 2;
            sm.position.set(st.x, 0.024, st.z);
            pg.add(sm);
          });
          level0Group.add(pg);
          window.l0PitTraps.push({ x: pc.x, z: pc.z, halfX: 1.46, halfZ: 1.46 });
        }

        // Varied Level 0 Pockets: Sunken Damp Floor Depressions, Narrow Squeeze Beams & Dark Blackout Sectors
        const pitMat = new THREE.MeshStandardMaterial({ color: 0x3f3a21, roughness: 0.25, metalness: 0.15 });
        [[14, 18], [32, 16], [24, 36]].forEach(([pr, pc]) => {
          if (!MAZE_MAP[pr] || MAZE_MAP[pr][pc] === '#') return;
          const pp = gridToWorld(pr, pc);
          const pit = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.95, 0.08, CELL * 0.95), pitMat);
          pit.position.set(pp.x, 0.02, pp.z);
          level0Group.add(pit);
          // Narrow fallen ceiling beam / duct squeeze
          const beam = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.95, 0.75, 0.85), new THREE.MeshLambertMaterial({ color: 0x524c2e }));
          beam.position.set(pp.x, WALL_H - 0.55, pp.z);
          level0Group.add(beam);
        });

      })();

      // --- Authentic Backrooms Architectural Variety: Flared Pillars, Doorway Archways, Narrow Corridors & Toppled Chairs ---
      (function buildLevel0ArchitectureVariety() {
        const pillarMat = wallMat;
        const trimMat = new THREE.MeshLambertMaterial({ color: 0x8d8450, map: backWallTex });
        const chairWoodMat = new THREE.MeshLambertMaterial({ color: 0x7c5c46 });

        function addFlaredPillar(px, pz) {
          const pg = new THREE.Group();
          pg.position.set(px, 0, pz);
          const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.92, WALL_H, 0.92), pillarMat);
          shaft.position.y = WALL_H / 2;
          shaft.castShadow = true; shaft.receiveShadow = true;
          const base = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.24, 1.12), trimMat);
          base.position.y = 0.12;
          const cap = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.26, 1.14), trimMat);
          cap.position.y = WALL_H - 0.13;
          pg.add(shaft, base, cap);
          level0Group.add(pg);
          wallBoxes.push({ x: px, z: pz, halfX: 0.56, halfZ: 0.56 });
        }

        function addDoorwayArch(dx, dz, alongZ) {
          const dg = new THREE.Group();
          dg.position.set(dx, 0, dz);
          if (alongZ) dg.rotation.y = Math.PI / 2;
          const wL = new THREE.Mesh(new THREE.BoxGeometry(1.05, WALL_H, 0.42), pillarMat);
          wL.position.set(-1.475, WALL_H / 2, 0);
          const wR = new THREE.Mesh(new THREE.BoxGeometry(1.05, WALL_H, 0.42), pillarMat);
          wR.position.set(1.475, WALL_H / 2, 0);
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.9, WALL_H - 2.65, 0.42), pillarMat);
          lintel.position.set(0, 2.65 + (WALL_H - 2.65) / 2, 0);
          dg.add(wL, wR, lintel);
          level0Group.add(dg);
          if (alongZ) {
            wallBoxes.push({ x: dx, z: dz - 1.475, halfX: 0.22, halfZ: 0.52 });
            wallBoxes.push({ x: dx, z: dz + 1.475, halfX: 0.22, halfZ: 0.52 });
          } else {
            wallBoxes.push({ x: dx - 1.475, z: dz, halfX: 0.52, halfZ: 0.22 });
            wallBoxes.push({ x: dx + 1.475, z: dz, halfX: 0.52, halfZ: 0.22 });
          }
        }

        function addToppledChair(cx, cz, rotY) {
          const cg = new THREE.Group();
          cg.position.set(cx, 0.26, cz);
          cg.rotation.set(Math.PI / 2, rotY, 0.18);
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.48), chairWoodMat);
          const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.05), chairWoodMat);
          back.position.set(0, 0.25, -0.21);
          const legG = new THREE.BoxGeometry(0.05, 0.44, 0.05);
          [[-0.19,-0.19],[0.19,-0.19],[-0.19,0.19],[0.19,0.19]].forEach(([lx,lz]) => {
            const l = new THREE.Mesh(legG, chairWoodMat);
            l.position.set(lx, -0.22, lz);
            cg.add(l);
          });
          cg.add(seat, back);
          level0Group.add(cg);
        }

        // Place architectural variety cleanly across open cells (avoiding spawn & keys/batteries)
        let placedPillars = 0, placedDoors = 0, placedChairs = 0;
        for (let i = 10; i < openCells.length - 10; i += 17) {
          const cell = openCells[i];
          if (!cell) continue;
          if (Math.hypot(cell.x - spawnPos.x, cell.z - spawnPos.z) < 8.5) continue;
          const mod = i % 5;
          if (mod === 0 && placedPillars < 26) {
            addFlaredPillar(cell.x, cell.z);
            placedPillars++;

          } else if (mod === 2 && placedChairs < 16) {
            addToppledChair(cell.x + 0.85, cell.z - 0.65, (i * 0.7) % 6.28);
            placedChairs++;
          }
        }
      })();

      // Single-draw-call InstancedMesh for all recessed fluorescent ceiling lights!
      const lampGeo = new THREE.BoxGeometry(1.6, 0.08, 0.72);
      const lampMatOn = new THREE.MeshBasicMaterial({ color: 0xfffef5 });
      const lampInst = new THREE.InstancedMesh(lampGeo, lampMatOn, lampCoords.length);
      lampCoords.forEach((p, idx) => {
        dummy.position.set(p.x, WALL_H - 0.05, p.z);
        dummy.updateMatrix();
        lampInst.setMatrixAt(idx, dummy.matrix);
        // Keep ceiling fixtures visual-only (max 0 stacked PointLights so mobile WebGL never clips walls to white!)
      });
      lampInst.instanceMatrix.needsUpdate = true;
      level0Group.add(lampInst);


      const walkPlatforms = [];
      function spawnVentDuct(parentGrp, boxes, x, z, len = 6.5, rotY = 0) {
        const vg = new THREE.Group();
        vg.position.set(x, 0, z);
        vg.rotation.y = rotY;
        const ductMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
        const grateMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, len), ductMat);
        top.position.y = 1.24;
        const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.24, len), ductMat);
        wallL.position.set(-0.82, 0.62, 0);
        const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.24, len), ductMat);
        wallR.position.set(0.82, 0.62, 0);
        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.10, 0.14), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
        trim.position.set(0, 1.28, len * 0.48);
        const trim2 = trim.clone(); trim2.position.z = -len * 0.48;
        const gPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, len - 0.2), grateMat);
        gPlate.position.y = 0.02;
        vg.add(top, wallL, wallR, trim, trim2, gPlate);
        parentGrp.add(vg);
        const isX = Math.abs(Math.sin(rotY)) > 0.7;
        boxes.push({ x, z, halfX: isX ? len / 2 : 0.72, halfZ: isX ? 0.72 : len / 2, ventCeil: 1.24 });
      }
      function spawnJumpLedge(parentGrp, zoneTag, x, z, w = 2.6, d = 2.6, topY = 0.95) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, topY, d), new THREE.MeshLambertMaterial({ color: 0x52525b }));
        m.position.set(x, topY / 2, z);
        const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.06, d + 0.05), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
        rim.position.set(x, topY + 0.01, z);
        parentGrp.add(m, rim);
        walkPlatforms.push({ zone: zoneTag, minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, topY });
      }

      function spawnGroundPedestal(parentGrp, x, z, rotY = 0) {
        if (parentGrp === level0Group && typeof wallBoxes !== 'undefined') {
          const pTmp = { x, z };
          for (let i = 0; i < wallBoxes.length; i++) {
            const w = wallBoxes[i];
            const hx = (w.halfX !== undefined ? w.halfX : w.half) + 0.9;
            const hz = (w.halfZ !== undefined ? w.halfZ : w.half) + 0.9;
            if (Math.abs(pTmp.x - w.x) < hx && Math.abs(pTmp.z - w.z) < hz) {
              const dx = pTmp.x - w.x, dz = pTmp.z - w.z;
              if (Math.abs(dx) > Math.abs(dz)) pTmp.x = w.x + (dx >= 0 ? hx : -hx);
              else pTmp.z = w.z + (dz >= 0 ? hz : -hz);
            }
          }
          x = pTmp.x; z = pTmp.z;
        }
        if (typeof loadGlbIntoGroup === 'function') {
          loadGlbIntoGroup('cabinet.glb', parentGrp, { x, y: 0, z, rotY, targetH: 0.92 });
        } else {
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.92, 0.55), new THREE.MeshLambertMaterial({ color: 0x4b382a }));
          box.position.set(x, 0.46, z);
          parentGrp.add(box);
        }
        return { x, z };
      }

      function spawnKeyAt(x, z) {
        const _pk = spawnGroundPedestal(level0Group, x, z, (keysList.length % 4) * (Math.PI / 2)); x = _pk.x; z = _pk.z;
        const g = new THREE.Group();
        const core = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.08, 0.14),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.55, metalness: 0.85, roughness: 0.2 })
        );
        const pt = new THREE.PointLight(0xfacc15, 0.8, 5);
        pt.position.y = 0.25;
        g.add(core, pt);
        g.position.set(x, 0.92, z);
        level0Group.add(g);
        if (typeof loadGlbIntoGroup === 'function') {
          loadGlbIntoGroup('key.glb', g, { x: 0, y: 0, z: 0, rotY: 0.4, targetH: 0.16 });
          core.visible = false;
        }
        keysList.push({ x, z, mesh: g, collected: false });
      }

      function spawnBatteryAt(x, z) {
        const _pb = spawnGroundPedestal(level0Group, x, z, (batteries.length % 4) * (Math.PI / 2)); x = _pb.x; z = _pb.z;
        const g = new THREE.Group();
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.11, 0.11, 0.34, 12),
          new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.55 })
        );
        const tip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        tip.position.y = 0.20;
        const pt = new THREE.PointLight(0x4ade80, 0.7, 5);
        pt.position.y = 0.25;
        g.add(cyl, tip, pt);
        g.position.set(x, 0.92, z);
        level0Group.add(g);
        if (typeof gltfLoader !== 'undefined') {
          gltfLoader.load(REPO_GLB_BASE + 'battery.glb', (gltf) => {
            try {
              const bm = gltf.scene.clone(true);
              const bx = new THREE.Box3().setFromObject(bm);
              const bsz = new THREE.Vector3(); bx.getSize(bsz);
              const sc = 0.36 / Math.max(0.01, bsz.y);
              bm.scale.setScalar(sc);
              bm.updateMatrixWorld(true);
              const bx2 = new THREE.Box3().setFromObject(bm);
              const ctr2 = new THREE.Vector3(); bx2.getCenter(ctr2);
              bm.position.set(-ctr2.x, -bx2.min.y, -ctr2.z);
              g.remove(cyl); g.remove(tip);
              g.add(bm);
            } catch (e) {}
          }, undefined, () => {});
        }
        batteries.push({ x, z, mesh: g, collected: false });
      }


      // --- Step 3: Level 0 Environmental Landmarks (M.E.G. Wall Graffiti, Damp Puddles, Fallen Ceiling Tiles) ---
      (function addLevel0Landmarks() {
        if (!openCells || openCells.length < 12) return;
        const step = Math.max(1, Math.floor(openCells.length / 42));

        // 1) Glossy Damp Carpet Puddles (reflects flashlight beam)
        const pudCv = document.createElement('canvas');
        pudCv.width = 128; pudCv.height = 128;
        const pg = pudCv.getContext('2d');
        const pgr = pg.createRadialGradient(64, 64, 12, 64, 64, 60);
        pgr.addColorStop(0, 'rgba(18, 22, 16, 0.72)');
        pgr.addColorStop(0.65, 'rgba(26, 30, 20, 0.42)');
        pgr.addColorStop(1, 'rgba(26, 30, 20, 0)');
        pg.fillStyle = pgr; pg.fillRect(0, 0, 128, 128);
        const puddleTex = new THREE.CanvasTexture(pudCv);
        const puddleMat = new THREE.MeshStandardMaterial({
          map: puddleTex, transparent: true, roughness: 0.08, metalness: 0.55, depthWrite: false
        });
        const puddleGeo = new THREE.PlaneGeometry(1.9, 1.45);
        for (let i = 3; i < openCells.length && i < step * 18; i += step) {
          const c = openCells[i];
          const pm = new THREE.Mesh(puddleGeo, puddleMat);
          pm.rotation.x = -Math.PI / 2;
          pm.rotation.z = (i * 1.37) % Math.PI;
          const sc = 0.75 + ((i * 19) % 10) * 0.06;
          pm.scale.set(sc, sc * 0.85, 1);
          pm.position.set(c.x + (((i % 3) - 1) * 0.45), 0.016, c.z + ((((i + 1) % 3) - 1) * 0.45));
          level0Group.add(pm);
        }

        // 2) Fallen Acoustic Ceiling Tiles + Missing Ceiling Cavity + Dangling Wires
        const tileMat = new THREE.MeshStandardMaterial({ color: 0xb8b195, roughness: 0.92, metalness: 0.02 });
        const voidMat = new THREE.MeshBasicMaterial({ color: 0x050608 });
        const wireMat = new THREE.MeshBasicMaterial({ color: 0x111318 });
        const tileGeo = new THREE.BoxGeometry(0.76, 0.035, 0.76);
        const holeGeo = new THREE.PlaneGeometry(0.95, 0.95);
        const wireGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.35, 5);
        for (let i = 7; i < openCells.length && i < step * 30; i += step * 2) {
          const c = openCells[i];
          const hole = new THREE.Mesh(holeGeo, voidMat);
          hole.rotation.x = Math.PI / 2;
          hole.position.set(c.x, WALL_H - 0.015, c.z);
          level0Group.add(hole);
          const wire1 = new THREE.Mesh(wireGeo, wireMat);
          wire1.position.set(c.x + 0.14, WALL_H - 0.68, c.z - 0.1);
          wire1.rotation.z = 0.18;
          level0Group.add(wire1);
          const tile = new THREE.Mesh(tileGeo, tileMat);
          tile.position.set(c.x + 0.25, 0.022, c.z + 0.18);
          tile.rotation.y = (i * 0.9) % Math.PI;
          tile.rotation.z = 0.04;
          level0Group.add(tile);
        }

        // 3) Hand-Drawn M.E.G. & Survivor Wall Warnings mounted flush on corridor walls
        const msgs = [
          'ORQAGA QARAMANG',
          "CHIROQNI O'CHIR",
          'U ESHITADI',
          'M.E.G. SEKTOR 04',
          'CHIQISH ->',
          "X - BU YERDAN O'TDIM",
          'JIM YURING',
          "TO'XTAMA"
        ];
        const decalMats = msgs.map((txt, idx) => {
          const cv = document.createElement('canvas');
          cv.width = 512; cv.height = 160;
          const g = cv.getContext('2d');
          g.clearRect(0, 0, 512, 160);
          g.fillStyle = idx % 3 === 0 ? 'rgba(95, 16, 16, 0.86)' : 'rgba(20, 18, 16, 0.84)';
          g.font = 'bold 40px "Courier New", monospace';
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.save();
          g.translate(256, 80);
          g.rotate(((idx % 5) - 2) * 0.035);
          g.fillText(txt, 0, 0);
          g.restore();
          const tx = new THREE.CanvasTexture(cv);
          return new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
        });
        const decalGeo = new THREE.PlaneGeometry(2.15, 0.68);
        const HALF_C = CELL * 0.5;
        let placed = 0;
        for (let i = 4; i < openCells.length && placed < 16; i += Math.max(2, Math.floor(openCells.length / 24))) {
          const c = openCells[i];
          // Check adjacent cell wall to mount decal flush on wall face
          const dirs = [
            { dr: -1, dc: 0, ox: 0, oz: -HALF_C + 0.03, ry: 0 },
            { dr: 1, dc: 0, ox: 0, oz: HALF_C - 0.03, ry: Math.PI },
            { dr: 0, dc: -1, ox: -HALF_C + 0.03, oz: 0, ry: Math.PI / 2 },
            { dr: 0, dc: 1, ox: HALF_C - 0.03, oz: 0, ry: -Math.PI / 2 }
          ];
          for (const d of dirs) {
            const nr = c.r + d.dr, nc = c.c + d.dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && MAZE[nr] && MAZE[nr][nc] === 1) {
              const dm = new THREE.Mesh(decalGeo, decalMats[placed % decalMats.length]);
              dm.position.set(c.x + d.ox, 1.58, c.z + d.oz);
              dm.rotation.y = d.ry;
              level0Group.add(dm);
              placed++;
              break;
            }
          }
        }
      })();

      // --- Terrifying 3D Backrooms Nightmare Creature ("YIRTQICH") with Snapping Jaw, 14 Fangs & Razor Claws ---
