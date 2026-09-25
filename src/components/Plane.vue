<template>
  <!-- attraversa il cielo da sinistra a destra (al contrario dello pterodattilo) trainando lo striscione -->
  <div class="plane">
    <svg viewBox="0 0 424 60" xmlns="http://www.w3.org/2000/svg" aria-label="Aereo con striscione: dai che è venerdì">
      <g class="banner">
        <path d="M326 30 L282 13 M326 30 L282 47" stroke="#5b5b5b" stroke-width="1.2" />
        <rect x="2" y="12" width="280" height="36" rx="2" fill="#fffdf5" stroke="#b5472b" stroke-width="2" />
        <text x="142" y="37" text-anchor="middle" font-size="20" font-weight="700" fill="#b5472b">Dai che è venerdì!</text>
      </g>
      <!-- deriva, fusoliera con il muso a destra, ala, cabina ed elica -->
      <path d="M332 24 L324 8 L338 8 L350 22 Z" fill="#c0392b" />
      <path d="M330 29 Q330 22 342 22 L398 22 Q414 24 416 30 Q414 36 398 37 L342 37 Q330 36 330 31 Z" fill="#f4f1ea" />
      <path d="M332 30 L416 30" stroke="#c0392b" stroke-width="2.5" />
      <ellipse cx="338" cy="33" rx="10" ry="2.5" fill="#c0392b" />
      <ellipse cx="374" cy="33" rx="24" ry="4.5" fill="#c0392b" />
      <path d="M384 23 Q392 15 404 24 Z" fill="#7fc4ea" />
      <ellipse class="prop" cx="419" cy="30" rx="2" ry="13" fill="#3a3a3a" opacity="0.7" />
      <circle cx="417" cy="30" r="2.5" fill="#3a3a3a" />
    </svg>
  </div>
</template>

<style scoped>
.plane {
  position: absolute;
  /* più in basso dello pterodattilo, così se passano insieme non si sovrappongono */
  top: max(30%, 260px);
  width: clamp(300px, 50vw, 720px);
  animation: cross 24s linear infinite;
  z-index: 1;
}
.plane svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  animation: bob 4s ease-in-out infinite alternate;
}
/* lo striscione sventola attaccato alla corda */
.banner {
  animation: flutter 0.9s ease-in-out infinite alternate;
  transform-origin: 326px 30px;
}
.prop {
  animation: spin 0.12s linear infinite;
  transform-origin: 419px 30px;
}

@keyframes cross {
  from { left: 0; transform: translateX(-100%); }
  to { left: 100%; transform: translateX(20px); }
}
@keyframes bob {
  from { transform: translateY(-8px); }
  to { transform: translateY(8px); }
}
@keyframes flutter {
  from { transform: skewY(-1.5deg) scaleY(0.94); }
  to { transform: skewY(1.5deg) scaleY(1); }
}
@keyframes spin {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(-1); }
}
</style>
