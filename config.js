/* ═══════════════════════════════════════════════════════════════════
   config.js — Configuració editorial del repàs PAU
   Edita aquest fitxer per gestionar vídeos i exercicis exclosos.
   No cal tocar index.html.
   ═══════════════════════════════════════════════════════════════════ */

/* ── EXERCICIS OPTATIUS ─────────────────────────────────────────────
   IDs dels exercicis que no cal estudiar obligatòriament aquest curs.
   Apareixen a la llista amb la marca "optatiu" però no desapareixen.
   L'ID és el nom base del fitxer sense el sufix -e/-p/-s.pdf        */
const OPTATIUS = new Set([
  // 'alg-23j-q2',
  // 'ana-24j-q1',
   'alg-24i-q2',
   'alg-23s-q1'
]);

/* ── VÍDEOS ─────────────────────────────────────────────────────────
   Exercicis amb vídeo explicatiu de YouTube.
   Clau  → ID de l'exercici (igual que a EXCLOSOS)
   Valor → ID del vídeo YouTube (la part ?v=XXXXX de l'URL)

   Exemple: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            → 'alg-23j-q2': 'dQw4w9WgXcQ'                          */
const VIDEOS = {
  // 'alg-23j-q2': 'XXXXXXXXXXX',
  // 'ana-24j-q1': 'YYYYYYYYYYY',
   // Vídeos de «Matemàtiques amb Bogdan» (Bogdan Crintea)
   'ana-23j-q1':'NVQeKEQMhmw',
   'ana-24j-q1':'bW5Cz1lC4TA',
   'ana-24s-q1':'lB4Q0zkDgiA',
   'ana-24j-q3':'z8l7bqoaAZs',
   'pro-24j-q4':'cBUZsq_4bWM',
   'ana-25j-q1':'RDymPAwtR9k',
   'alg-25j-q2':'1WGgbloeAio',
   'pro-25j-q3':'u1RTaehUGCM',
   'ana-25j-q4a':'W0JjPG41UY0',
   'geo-25j-q4b':'U-sItqNaRzM'
};

/* ── ETIQUETES DEL BUSCADOR ─────────────────────────────────────────
   El buscador de la pàgina d'inici ja cerca al títol, l'any, la
   convocatòria i l'id. Aquí hi poses el que NO surt al títol, perquè
   els enunciats oficials gairebé mai diuen el nom del teorema
   (per ex., «Justifiqueu que té una solució a l'interval…» és Bolzano).
   Clau  → ID de l'exercici
   nota  → text que veu l'alumne a sota del títol (i on se subratlla la cerca)
   mots  → paraules extra que només es cerquen (opcional, separades per espais) */
const ETIQUETES = {
  'ana-23s-q4': {nota:'Teorema de Bolzano · apartat a)', mots:'bolzano teorema arrel'},
  'ana-24i-q1': {nota:'Teorema de Bolzano · apartat a)  ·  Creixement i decreixement · apartat b)',
                 mots:'bolzano teorema arrel creixement decreixement monotonia'},
  'ana-24s-q1': {nota:'Teorema de Bolzano · apartat a)  ·  Creixement i decreixement · apartat b)',
                 mots:'bolzano teorema arrel creixement decreixement monotonia'},
  'pro-26j-q3': {nota:'Teorema de Bolzano · apartat 3.3', mots:'bolzano teorema arrel'},

  // Creixement i decreixement (els títols no ho diuen; els enunciats sí)
  'ana-24j-q1': {nota:'Creixement i decreixement · apartat a)', mots:'creixement decreixement monotonia'},
  'ana-25i-q1': {nota:'Creixement i decreixement · apartat b)', mots:'creixement decreixement monotonia'},
  'ana-26s-q1': {nota:'Creixement i decreixement · apartat 1.1', mots:'creixement decreixement monotonia'}
};
