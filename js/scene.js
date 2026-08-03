/**
 * scene.js
 * -----------------------------------------------------------------------
 * Cena Three.js responsável pelo fundo 3D do site: um buraco negro com
 * disco de acreção, anel de fóton (lente gravitacional estilizada),
 * campo de estrelas, nebulosas e poeira espacial em fluxo de acresção,
 * com pós-processamento Bloom + um passe de lente gravitacional custom.
 *
 * O site inteiro "orbita" o horizonte de eventos: o progresso de scroll
 * controla o ângulo da câmera ao redor do buraco negro (não um avanço
 * linear), então navegar a página é literalmente dar a volta nele.
 *
 * A cena roda em um <canvas> fixo atrás do conteúdo (z-index negativo),
 * nunca captura eventos de ponteiro (pointer-events: none no CSS) e nunca
 * bloqueia a leitura do conteúdo — apenas a atmosfera visual.
 * -----------------------------------------------------------------------
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Paleta de cores da cena — sincronizada com os tokens de tema (dark/light)
// definidos em css/style.css. Alternância feita via setTheme().
const SCENE_PALETTE = {
  dark: {
    background: 0x05060f,
    starColors: [0xffffff, 0xcfd6ff, 0x9db4ff, 0xffe3c2],
    nebulaColors: [0x7c5cff, 0x4fd8e8, 0xff8a65],
    fog: 0x05060f,
    exposure: 1.15,
    bloomStrength: 1.05,
    diskHot: 0xfff4d6,
    diskWarm: 0xffb37a,
    diskCool: 0x7c5cff,
    diskEdge: 0x4fd8e8,
    horizonGlow: 0x8b7bff,
    lensStrength: 1.35,
  },
  light: {
    background: 0xeef0fb,
    starColors: [0x2a3266, 0x4f5a94, 0x7c5cff, 0x4fd8e8],
    nebulaColors: [0x9c8bff, 0x8fe3ec, 0xffb199],
    fog: 0xeef0fb,
    exposure: 0.9,
    bloomStrength: 0.55,
    diskHot: 0xfff7e8,
    diskWarm: 0xffab6b,
    diskCool: 0x6a3ff2,
    diskEdge: 0x0f9cb3,
    horizonGlow: 0x6a3ff2,
    lensStrength: 0.85,
  },
};

// Passe de pós-processamento que simula, de forma estilizada, a curvatura
// da luz ao redor do buraco negro: um leve redemoinho (swirl) que se
// intensifica perto do horizonte, deformando estrelas e nebulosas atrás
// dele — sem custo de ray-tracing real.
const GravitationalLensShader = {
  uniforms: {
    tDiffuse: { value: null },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uStrength: { value: 1.2 },
    uRadius: { value: 0.16 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uCenter;
    uniform float uAspect;
    uniform float uStrength;
    uniform float uRadius;
    varying vec2 vUv;

    void main() {
      vec2 diff = vUv - uCenter;
      diff.x *= uAspect;
      float dist = length(diff);

      // Falloff: forte perto do horizonte, dissipa suavemente para fora.
      float falloff = smoothstep(uRadius * 4.2, uRadius * 0.55, dist);
      float angle = falloff * falloff * uStrength;

      float s = sin(angle);
      float c = cos(angle);
      vec2 rotated = vec2(diff.x * c - diff.y * s, diff.x * s + diff.y * c);

      // Puxa levemente a amostra em direção ao centro (magnificação sutil).
      rotated *= mix(1.0, 0.9, falloff);
      rotated.x /= uAspect;

      vec2 warpedUv = uCenter + rotated;
      warpedUv = clamp(warpedUv, 0.001, 0.999);

      gl_FragColor = texture2D(tDiffuse, warpedUv);
    }
  `,
};

export class SpaceScene {
  /**
   * @param {HTMLCanvasElement} canvas - canvas alvo para renderização
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.orbitAngle = 0;
    this.currentTheme = 'dark';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // No tema claro o buraco negro não é exibido (ver setTheme): a cena fica
    // pausada, sem custo de render/composer, em vez de rodar escondida atrás
    // do fundo minimalista.
    this.active = true;

    this._initRenderer();
    this._initCamera();
    this._initScene();
    this._initStars();
    this._initNebulae();
    this._initDust();
    this._initBlackHole();
    this._initComposer();
    this._bindEvents();
  }

  /** Configura o WebGLRenderer com pixel ratio limitado para performance. */
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  /** Câmera em perspectiva, posicionada para orbitar o buraco negro. */
  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.orbitRadius = 62;
    this.camera.position.set(0, 6, this.orbitRadius);
    this.camera.lookAt(0, 0, 0);
  }

  /** Cena base + névoa exponencial para dar sensação de profundidade infinita. */
  _initScene() {
    this.scene = new THREE.Scene();
    const palette = SCENE_PALETTE[this.currentTheme];
    this.scene.background = new THREE.Color(palette.background);
    this.scene.fog = new THREE.FogExp2(palette.fog, 0.00055);
  }

  /**
   * Gera milhares de estrelas como um único THREE.Points para manter o
   * custo de draw call baixo. Distribuição esférica para evitar padrões
   * visíveis de grade e variação de tamanho/cor para dar profundidade.
   */
  _initStars() {
    const STAR_COUNT = 9000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    const palette = SCENE_PALETTE[this.currentTheme];
    const colorPool = palette.starColors.map((hex) => new THREE.Color(hex));

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribuição em esfera de raio variável (profundidade em camadas),
      // com uma "zona de exclusão" ao redor da origem para o buraco negro.
      const radius = 90 + Math.random() * 820;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPool[Math.floor(Math.random() * colorPool.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 1.6 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  /**
   * Nebulosas discretas construídas com sprites de gradiente radial
   * (canvas 2D convertido em textura) e blending aditivo — mantidas
   * discretas e distantes para não competir com o buraco negro.
   */
  _initNebulae() {
    const palette = SCENE_PALETTE[this.currentTheme];
    this.nebulaSprites = [];

    palette.nebulaColors.forEach((hex, index) => {
      const texture = this._createRadialGradientTexture(hex);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      const scale = 480 + index * 160;
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        (Math.random() - 0.5) * 700,
        (Math.random() - 0.5) * 460,
        -420 - index * 180
      );
      this.scene.add(sprite);
      this.nebulaSprites.push(sprite);
    });
  }

  /** Cria uma textura de gradiente radial usada pelas nebulosas. */
  _createRadialGradientTexture(hex) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const color = new THREE.Color(hex);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.35)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Textura do disco de acreção: gradiente cônico (variação angular, para
   * simular o brilho assimétrico do "Doppler beaming") mascarado por um
   * gradiente radial (borda interna brilhante, dissipando para fora).
   */
  _createDiskTexture(palette) {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;

    const hot = new THREE.Color(palette.diskHot);
    const warm = new THREE.Color(palette.diskWarm);
    const edge = new THREE.Color(palette.diskEdge);
    const cool = new THREE.Color(palette.diskCool);
    const toRgb = (c) => `${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}`;

    if (ctx.createConicGradient) {
      const conic = ctx.createConicGradient(0, cx, cy);
      conic.addColorStop(0.0, `rgba(${toRgb(hot)}, 1)`);
      conic.addColorStop(0.12, `rgba(${toRgb(warm)}, 0.95)`);
      conic.addColorStop(0.32, `rgba(${toRgb(edge)}, 0.6)`);
      conic.addColorStop(0.5, `rgba(${toRgb(cool)}, 0.4)`);
      conic.addColorStop(0.68, `rgba(${toRgb(edge)}, 0.55)`);
      conic.addColorStop(0.88, `rgba(${toRgb(warm)}, 0.9)`);
      conic.addColorStop(1.0, `rgba(${toRgb(hot)}, 1)`);
      ctx.fillStyle = conic;
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.fillStyle = `rgba(${toRgb(warm)}, 1)`;
      ctx.fillRect(0, 0, size, size);
    }

    // Textura fina (bandas de turbulência sutis) para quebrar a suavidade perfeita.
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 26; i++) {
      const bandAngle = (i / 26) * Math.PI * 2;
      const grad = ctx.createLinearGradient(
        cx + Math.cos(bandAngle) * size * 0.5,
        cy + Math.sin(bandAngle) * size * 0.5,
        cx - Math.cos(bandAngle) * size * 0.5,
        cy - Math.sin(bandAngle) * size * 0.5
      );
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, `rgba(255,255,255,${Math.random() * 0.08})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Máscara radial: oculta o centro (ocultado pela esfera do horizonte de
    // qualquer forma), brilho forte próximo à borda interna, dissipando para fora.
    const radial = ctx.createRadialGradient(cx, cy, size * 0.135, cx, cy, size * 0.5);
    radial.addColorStop(0, 'rgba(255,255,255,0)');
    radial.addColorStop(0.05, 'rgba(255,255,255,1)');
    radial.addColorStop(0.16, 'rgba(255,255,255,0.85)');
    radial.addColorStop(0.42, 'rgba(255,255,255,0.4)');
    radial.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /** Textura de anel fino e brilhante — usada para o anel de fóton (Einstein ring). */
  _createPhotonRingTexture(hex) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const color = new THREE.Color(hex);
    const rgb = `${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}`;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cy);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.555, `rgba(255,255,255,1)`);
    gradient.addColorStop(0.59, `rgba(${rgb}, 0.85)`);
    gradient.addColorStop(0.64, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /** Camada extra de partículas simulando o fluxo de matéria caindo em direção ao disco. */
  _initDust() {
    const DUST_COUNT = 1600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i++) {
      // Distribuição achatada (fina em Y) e concentrada perto do buraco
      // negro, como matéria sendo puxada para o plano do disco de acreção.
      const radius = 14 + Math.random() * 180;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (10 + radius * 0.12);
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffb37a,
      size: 0.5,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.dust = new THREE.Points(geometry, material);
    this.scene.add(this.dust);
  }

  /**
   * O buraco negro: esfera opaca (horizonte de eventos) + halo de borda
   * (Fresnel), disco de acreção inclinado e girando, e anel de fóton
   * sempre voltado para a câmera (efeito de lente gravitacional estilizado).
   */
  _initBlackHole() {
    const palette = SCENE_PALETTE[this.currentTheme];
    this.blackHole = new THREE.Group();
    this.blackHole.position.set(0, 0, 0);

    const horizonRadius = 9;

    // Horizonte de eventos: esfera totalmente opaca e escura, oculta o que
    // estiver atrás dela — a "sombra" real do buraco negro.
    const horizonGeometry = new THREE.SphereGeometry(horizonRadius, 64, 64);
    const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    this.blackHole.add(this.horizon);

    // Halo de borda (Fresnel) — brilho sutil contornando o horizonte.
    const glowGeometry = new THREE.SphereGeometry(horizonRadius * 1.18, 64, 64);
    this.glowMaterial = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(palette.horizonGlow) } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.52 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 1.0));
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.horizonGlow = new THREE.Mesh(glowGeometry, this.glowMaterial);
    this.blackHole.add(this.horizonGlow);

    // Disco de acreção: anel inclinado como no clássico visual "Interstellar",
    // com textura própria e giro contínuo em torno do próprio eixo.
    this.diskTexture = this._createDiskTexture(palette);
    const diskGeometry = new THREE.RingGeometry(horizonRadius * 1.35, horizonRadius * 4.6, 160, 1);
    this.diskMaterial = new THREE.MeshBasicMaterial({
      map: this.diskTexture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.disk = new THREE.Mesh(diskGeometry, this.diskMaterial);
    this.disk.rotation.x = Math.PI / 2.28;
    this.blackHole.add(this.disk);

    // Segundo anel, mais fino e mais rápido, para dar profundidade ao disco.
    const innerDiskGeometry = new THREE.RingGeometry(horizonRadius * 1.15, horizonRadius * 2.1, 128, 1);
    this.diskInnerMaterial = new THREE.MeshBasicMaterial({
      map: this.diskTexture,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });
    this.diskInner = new THREE.Mesh(innerDiskGeometry, this.diskInnerMaterial);
    this.diskInner.rotation.x = Math.PI / 2.28;
    this.blackHole.add(this.diskInner);

    // Anel de fóton: sempre de frente para a câmera, simula a luz curvada
    // ao redor do horizonte de eventos (efeito de lente gravitacional).
    this.photonTexture = this._createPhotonRingTexture(palette.diskHot);
    const photonMaterial = new THREE.SpriteMaterial({
      map: this.photonTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.photonRing = new THREE.Sprite(photonMaterial);
    this.photonRing.scale.set(horizonRadius * 2.9, horizonRadius * 2.9, 1);
    this.blackHole.add(this.photonRing);

    this.scene.add(this.blackHole);
  }

  /**
   * Pipeline de pós-processamento: render base + passe de lente
   * gravitacional (distorce estrelas/nebulosas ao redor do buraco negro)
   * + Bloom (UnrealBloomPass) para o brilho do disco de acreção.
   */
  _initComposer() {
    const palette = SCENE_PALETTE[this.currentTheme];
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.lensPass = new ShaderPass(GravitationalLensShader);
    this.lensPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
    this.lensPass.uniforms.uStrength.value = palette.lensStrength;
    this.composer.addPass(this.lensPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      palette.bloomStrength, // strength
      0.6, // radius
      0.12  // threshold
    );
    this.composer.addPass(this.bloomPass);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = palette.exposure;
  }

  /** Liga listeners de resize e movimento do mouse (para o efeito de paralaxe). */
  _bindEvents() {
    window.addEventListener('resize', () => this._onResize());
    window.addEventListener('pointermove', (event) => this._onPointerMove(event));
  }

  _onResize() {
    const { innerWidth, innerHeight } = window;
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
    this.composer.setSize(innerWidth, innerHeight);
    this.lensPass.uniforms.uAspect.value = innerWidth / innerHeight;
  }

  _onPointerMove(event) {
    // Normaliza a posição do mouse entre -1 e 1 para controlar a paralaxe.
    this.mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  /**
   * Atualiza o progresso de scroll (0 a 1). Em vez de avançar a câmera em
   * linha reta, o progresso controla o ângulo orbital ao redor do buraco
   * negro — navegar o site é, literalmente, orbitar o horizonte de eventos.
   * @param {number} progress
   */
  setScrollProgress(progress) {
    this.scrollProgress = progress;
  }

  /** Alterna a paleta da cena entre os temas claro e escuro. */
  setTheme(theme) {
    if (!SCENE_PALETTE[theme] || theme === this.currentTheme) return;
    this.currentTheme = theme;
    // O buraco negro é uma peça exclusiva do tema escuro. No tema claro o
    // canvas é escondido via CSS ([data-theme="light"] #space-canvas) e o
    // loop de animação para de renderizar (ver animate()), economizando o
    // custo de GPU do composer/bloom/shader de lente enquanto invisível.
    this.active = theme === 'dark';
    const palette = SCENE_PALETTE[theme];

    if (!this.active) {
      // Tema claro: canvas escondido via CSS e loop de render pausado
      // (animate() retorna cedo). Regravar texturas e recolorir 9 mil
      // estrelas aqui não teria nenhum efeito visível — só custo de CPU.
      // Ao voltar para o tema escuro, este método roda por inteiro de novo.
      return;
    }

    this.scene.background = new THREE.Color(palette.background);
    this.scene.fog.color = new THREE.Color(palette.fog);
    this.bloomPass.strength = palette.bloomStrength;
    this.lensPass.uniforms.uStrength.value = palette.lensStrength;
    this.renderer.toneMappingExposure = palette.exposure;

    const colorPool = palette.starColors.map((hex) => new THREE.Color(hex));
    const colorAttr = this.stars.geometry.getAttribute('color');
    for (let i = 0; i < colorAttr.count; i++) {
      const color = colorPool[Math.floor(Math.random() * colorPool.length)];
      colorAttr.setXYZ(i, color.r, color.g, color.b);
    }
    colorAttr.needsUpdate = true;

    // Recria as texturas do buraco negro com as cores do novo tema.
    this.diskTexture.dispose();
    this.diskTexture = this._createDiskTexture(palette);
    this.diskMaterial.map = this.diskTexture;
    this.diskInnerMaterial.map = this.diskTexture;
    this.diskMaterial.needsUpdate = true;
    this.diskInnerMaterial.needsUpdate = true;

    this.photonTexture.dispose();
    this.photonTexture = this._createPhotonRingTexture(palette.diskHot);
    this.photonRing.material.map = this.photonTexture;
    this.photonRing.material.needsUpdate = true;

    this.glowMaterial.uniforms.glowColor.value = new THREE.Color(palette.horizonGlow);
  }

  /** Loop de animação principal — chamado a cada frame via requestAnimationFrame. */
  animate() {
    // Tema claro: não há buraco negro para desenhar. Evita o getDelta() (que
    // manteria o clock avançando) e, principalmente, evita compositor/bloom/
    // shader de lente rodando na GPU atrás de um canvas invisível — o loop
    // continua agendado (custo desprezível) só para retomar instantaneamente
    // quando o usuário voltar ao tema escuro.
    if (!this.active) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Suaviza a interpolação do mouse (easing) para paralaxe fluida
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.03;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.03;

    if (!this.reducedMotion) {
      // Rotação muito lenta do campo de estrelas — sensação de deriva no espaço
      this.stars.rotation.y = elapsed * 0.006;
      this.stars.rotation.x = elapsed * 0.002;
      this.dust.rotation.y = -elapsed * 0.05;

      // Giro contínuo do disco de acreção (camada interna mais rápida).
      this.disk.rotation.z = elapsed * 0.045;
      this.diskInner.rotation.z = -elapsed * 0.09;

      // Órbita da câmera ao redor do buraco negro: o scroll controla o
      // ângulo, um leve avanço automático mantém a cena viva mesmo parada,
      // e o mouse acrescenta uma paralaxe fina por cima da órbita.
      this.orbitAngle = this.scrollProgress * Math.PI * 1.15 + elapsed * 0.012;
      const radius = this.orbitRadius - this.scrollProgress * 22;
      const tilt = 6 + this.scrollProgress * 10 - this.mouse.y * 4;

      this.camera.position.x = Math.sin(this.orbitAngle) * radius + this.mouse.x * 6;
      this.camera.position.z = Math.cos(this.orbitAngle) * radius;
      this.camera.position.y = tilt;
      this.camera.lookAt(0, 0, 0);

      // O anel de fóton sempre encara a câmera (comportamento de Sprite),
      // e o halo pulsa muito sutilmente para dar sensação de energia viva.
      const pulse = 1 + Math.sin(elapsed * 0.6) * 0.02;
      this.horizonGlow.scale.setScalar(pulse);

      // Nebulosas com deriva independente, quase imperceptível
      this.nebulaSprites.forEach((sprite, index) => {
        sprite.position.x += Math.sin(elapsed * 0.05 + index) * 0.02;
        sprite.position.y += Math.cos(elapsed * 0.04 + index) * 0.02;
      });

      // Projeta a posição do buraco negro na tela para alimentar o passe
      // de lente gravitacional (o redemoinho segue o buraco negro).
      const screenPos = this._projectToScreen(this.blackHole.position);
      this.lensPass.uniforms.uCenter.value.set(screenPos.x, screenPos.y);
    }

    this.composer.render(delta);
    requestAnimationFrame(() => this.animate());
  }

  /** Projeta uma posição 3D do mundo para coordenadas de tela normalizadas (0 a 1). */
  _projectToScreen(vector3) {
    const projected = vector3.clone().project(this.camera);
    return {
      x: (projected.x + 1) / 2,
      y: (1 - projected.y) / 2,
    };
  }
}
