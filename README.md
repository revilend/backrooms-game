# backrooms-game

Backrooms uslubidagi o'yin uchun 3D modellar (GLB) va ovoz (M4A) to'plami.
Repozitoriyda kod yo'q — bu faqat asset kutubxonasi.

## Tuzilishi

```
models/           43 ta 3D model (.glb)
audio/
  music/          11 ta level/atmosfera treki (.m4a)
  sfx/            21 ta qisqa ovoz effekti (.m4a)
```

Barcha fayl nomlari kichik harflar va pastki chiziq (`snake_case`) bilan yozilgan.

## Modellar (`models/`)

| Guruh | Fayllar |
| --- | --- |
| Eshik va kalitlar | `door`, `door_anim`, `double_door`, `metal_door`, `key`, `keycard` |
| Mebel va jihozlar | `bookshelf`, `cabinet`, `shelf`, `sink_cabinet`, `hotel_bed`, `hospital_bed`, `mirror_frame`, `locker` |
| Texnika va buyumlar | `arcade_machine`, `crt_pc`, `floppy`, `battery`, `generator`, `jerrycan`, `vending_machine`, `almond_water` |
| Bino va tashqi muhit | `house`, `barn`, `city_buildings`, `skyscraper`, `london_tower`, `warsaw_tower`, `streetlamp`, `subway_train`, `car`, `tractor`, `buoy` |
| Tabiat | `palm_tree`, `coconut_palm`, `crystal` |
| Personajlar | `butler`, `hound`, `kitty`, `wolf`, `partygoer`, `skinstealer`, `bacteria` |

Eslatma: `keypad` modeli hali yo'q, faqat ovozi (`audio/sfx/keypad_beep.m4a`) mavjud.
Eng katta fayllar: `car.glb` (~19 MB), `london_tower.glb` (~15 MB), `wolf.glb` (~14 MB),
`floppy.glb` (~10 MB), `hound.glb` (~10 MB), `partygoer.glb` (~10 MB), `barn.glb` (~9 MB).

## Musiqa (`audio/music/`)

| Fayl | Level / joy |
| --- | --- |
| `level0_lobby.m4a` | Level 0 — Lobby |
| `level5_hotel.m4a` | Level 5 — Hotel |
| `level9_11_city.m4a` | Level 9–11 — City |
| `level37_poolrooms.m4a` | Level 37 — Poolrooms |
| `level61_snackrooms.m4a` | Level 61 — Snackrooms |
| `level94_dreamcore.m4a` | Level 94 — Dreamcore |
| `level922_void.m4a` | Level 922 — Void |
| `level_fun.m4a` | Level Fun |
| `level_run_chase.m4a` | Qochish / ta'qib sahnasi |
| `industrial_dark.m4a` | Sanoat atmosferasi |
| `metro_hub.m4a` | Metro bekati |

**Bo'sh fayllar:** `level37_poolrooms.m4a`, `level61_snackrooms.m4a`,
`level922_void.m4a`, `level_fun.m4a`, `industrial_dark.m4a` hozircha faqat
bo'sh qator (2 bayt) — audio hali yozilmagan, ularni almashtirish kerak.

## Ovoz effektlari (`audio/sfx/`)

- **Harakat:** `footstep_carpet`, `footstep_concrete`, `footstep_grass`, `wade_water`
- **Muhit:** `desert_wind`, `steam_hiss`, `electric_zap`, `switch_breaker`
- **Dahshat:** `monster_growl`, `monster_roar`, `no_clip_glitch`
- **Buyum va interaksiya:** `pickup_item`, `glass_shatter`, `flashlight_click`, `locker_hide`, `keypad_beep`, `crt_boot`
- **Metro:** `metro_arrive`, `metro_depart`
- **Boshqa:** `almond_drink`, `splash_water`

## Qo'shimcha

- `.gitattributes` — `.glb` va `.m4a` fayllari binary sifatida belgilangan.
- `models/1` va `audio/sfx/1` — bo'sh placeholder fayllar (1 bayt), o'chirilmadi; ularni xohlaganda olib tashlash mumkin.
- Repozitoriya hajmi katta bo'lib bormoqda; kelajakda Git LFS ga o'tish tavsiya etiladi.
