(function () {
  'use strict';

  function buildBrandLink() {
    var brand = document.createElement('a');
    brand.className = 'vpscloud-hero-brand';
    brand.href = 'https://vpscloud.net.br/';
    brand.target = '_blank';
    brand.rel = 'noopener noreferrer';
    brand.setAttribute('aria-label', 'Abrir o site VPS CLOUD');

    var cloud = document.createElement('span');
    cloud.className = 'vpscloud-cloud-symbol';
    cloud.setAttribute('aria-hidden', 'true');

    var wordmark = document.createElement('span');
    wordmark.className = 'vpscloud-wordmark';
    wordmark.textContent = 'VPS CLOUD';

    var consulting = document.createElement('span');
    consulting.className = 'vpscloud-consulting';
    consulting.textContent = 'Network Consulting';

    brand.appendChild(cloud);
    brand.appendChild(wordmark);
    brand.appendChild(consulting);
    return brand;
  }

  function buildNetworkCanvas() {
    var canvas = document.createElement('canvas');
    canvas.className = 'vpscloud-network-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var context = canvas.getContext('2d');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mouse = { x: -1000, y: -1000 };
    var points = [
      [.08, .22], [.31, .12], [.55, .21], [.83, .11], [.94, .31],
      [.17, .47], [.40, .38], [.67, .47], [.87, .58], [.28, .72],
      [.55, .67], [.77, .79], [.94, .72]
    ].map(function (position, index) {
      return { x: position[0], y: position[1], phase: index * .73, offsetX: 0, offsetY: 0 };
    });
    var links = [[0,1],[0,5],[0,6],[1,2],[1,6],[2,3],[2,6],[2,7],[3,4],[4,7],[4,8],[5,6],[5,9],[6,7],[6,9],[6,10],[7,8],[7,10],[7,12],[8,12],[9,10],[10,11],[11,12]];
    var frame = 0;
    var previousTime = 0;
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(draw);
    }
    points.forEach(function (point, index) {
      var handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'vpscloud-network-point';
      handle.setAttribute('aria-label', 'Arrastar ponto ' + (index + 1) + ' da rede');
      handle.title = 'Arraste e solte para voltar';
      point.handle = handle;
      document.body.appendChild(handle);
      handle.addEventListener('pointerdown', function (event) {
        if (event.button !== 0 || document.body.classList.contains('vpscloud-animation-paused')) return;
        event.preventDefault();
        point.pointerId = event.pointerId;
        point.dragging = true;
        point.startX = event.clientX;
        point.startY = event.clientY;
        point.startOffsetX = point.offsetX;
        point.startOffsetY = point.offsetY;
        handle.classList.add('is-dragging');
        handle.setPointerCapture(event.pointerId);
        schedule();
      });
      handle.addEventListener('pointermove', function (event) {
        if (!point.dragging || event.pointerId !== point.pointerId) return;
        point.offsetX = point.startOffsetX + event.clientX - point.startX;
        point.offsetY = point.startOffsetY + event.clientY - point.startY;
        schedule();
      });
      function release(event) {
        if (!point.dragging || event.pointerId !== point.pointerId) return;
        point.dragging = false;
        handle.classList.remove('is-dragging');
        if (reducedMotion) point.offsetX = point.offsetY = 0;
        if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
        schedule();
      }
      handle.addEventListener('pointerup', release);
      handle.addEventListener('pointercancel', release);
      handle.addEventListener('lostpointercapture', release);
    });

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      schedule();
    }

    var visualTime = 0;
    var visualLastFrame = 0;
    function draw(time) {
      if (!document.body.classList.contains('vpscloud-animation-paused')) visualTime += visualLastFrame ? Math.min(64, time - visualLastFrame) : 0;
      visualLastFrame = time;
      if (document.body.classList.contains('vpscloud-animation-paused')) {
        window.requestAnimationFrame(draw);
        return;
      }
      frame = 0;
      var decay = Math.exp(-Math.min(64, time - previousTime || 16) / 160);
      previousTime = time;
      var rect = canvas.getBoundingClientRect();
      var seconds = visualTime * .001;
      context.clearRect(0, 0, rect.width, rect.height);

      var rendered = points.map(function (point, index) {
        if (!point.dragging) {
          point.offsetX *= decay;
          point.offsetY *= decay;
          if (Math.abs(point.offsetX) < .1) point.offsetX = 0;
          if (Math.abs(point.offsetY) < .1) point.offsetY = 0;
        }
        var networkWidth = rect.width * .56;
        var networkHeight = Math.max(1, rect.height - 74);
        var baseX = rect.width - networkWidth + point.x * networkWidth;
        var baseY = point.y * networkHeight;
        var driftX = reducedMotion ? 0 : Math.sin(seconds * .55 + point.phase) * (7 + index % 3);
        var driftY = reducedMotion ? 0 : Math.cos(seconds * .48 + point.phase) * (6 + index % 4);
        var dx = mouse.x - baseX;
        var dy = mouse.y - baseY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var influence = reducedMotion ? 0 : Math.max(0, 1 - distance / 240);
        return {
          x: baseX + driftX + dx * influence * .10 + point.offsetX,
          y: baseY + driftY + dy * influence * .10 + point.offsetY,
          active: influence
        };
      });

      document.dispatchEvent(new CustomEvent('vpscloud-network-frame', { detail: { points: rendered.map(function (p) { return { x: rect.left + p.x, y: rect.top + p.y }; }), links: links } }));

      links.forEach(function (link) {
        var start = rendered[link[0]];
        var end = rendered[link[1]];
        var strength = Math.max(start.active, end.active);
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = 'rgba(63, 210, 236,' + (.17 + strength * .35) + ')';
        context.lineWidth = 1.2 + strength * 1.2;
        context.stroke();
      });

      rendered.forEach(function (point, index) {
        points[index].handle.style.left = (rect.left + point.x) + 'px';
        points[index].handle.style.top = (rect.top + point.y) + 'px';
        var radius = 4.5 + (index % 3) + point.active * 3.5;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(45, 203, 230,' + (.72 + point.active * .25) + ')';
        context.shadowColor = 'rgba(45, 203, 230, .8)';
        context.shadowBlur = 5 + point.active * 14;
        context.fill();
        context.shadowBlur = 0;
      });

      if (!reducedMotion || points.some(function (point) { return point.dragging || point.offsetX || point.offsetY; })) schedule();
    }

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    schedule();
    return canvas;
  }

  function enableLogoMotion(logoLink) {
    if (!logoLink || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var logo = logoLink.querySelector('img');
    if (!logo) return;

    logoLink.addEventListener('pointermove', function (event) {
      if (document.body.classList.contains('vpscloud-animation-paused')) return;
      var rect = logoLink.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - .5;
      var y = (event.clientY - rect.top) / rect.height - .5;
      logo.style.setProperty('--vps-logo-ry', (x * 7).toFixed(2) + 'deg');
      logo.style.setProperty('--vps-logo-rx', (-y * 7).toFixed(2) + 'deg');
    });
    logoLink.addEventListener('pointerleave', function () {
      if (document.body.classList.contains('vpscloud-animation-paused')) return;
      logo.style.removeProperty('--vps-logo-ry');
      logo.style.removeProperty('--vps-logo-rx');
    });
  }

  function enableLogoNetworkAnimation(logoLink) {
    if (!logoLink || logoLink.querySelector('.vpscloud-logo-network-canvas')) return;
    var logo = logoLink.querySelector('img');
    if (!logo) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'vpscloud-logo-network-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    logoLink.appendChild(canvas);

    var context = canvas.getContext('2d');
    var animationFrame = 0;
    var points = [
      [.26, .33], [.60, .15], [.84, .31],
      [.49, .61], [.13, .72], [.51, .84]
    ].map(function (position, index) {
      return { x: position[0], y: position[1], phase: index * 1.17 };
    });
    var links = [
      [0,1], [0,2], [0,3], [0,4],
      [1,2], [1,3], [1,4],
      [2,3], [2,5], [3,4], [3,5], [4,5]
    ];

    function resize() {
      var logoWidth = logo.clientWidth;
      var logoHeight = logo.clientHeight;
      var size = Math.max(1, logoHeight * .75);
      var ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.style.left = (logo.offsetLeft + logoWidth * .033) + 'px';
      canvas.style.top = (logo.offsetTop + logoHeight * .125) + 'px';
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    var visualTime = 0;
    var visualLastFrame = 0;
    function draw(time) {
      if (!document.body.classList.contains('vpscloud-animation-paused')) visualTime += visualLastFrame ? Math.min(64, time - visualLastFrame) : 0;
      visualLastFrame = time;
      if (document.body.classList.contains('vpscloud-animation-paused')) {
        window.requestAnimationFrame(draw);
        return;
      }
      animationFrame += 1;
      if (animationFrame % 10 === 0) canvas.dataset.animationFrame = String(animationFrame);
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var seconds = visualTime * .001;
      var radius = Math.min(width, height) * .465;
      var centerX = width / 2;
      var centerY = height / 2;

      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
      context.lineWidth = Math.max(3, width * .065);
      context.strokeStyle = '#071c38';
      context.stroke();

      var innerWidth = width * .73;
      var innerHeight = height * .67;
      var offsetX = width * .135;
      var offsetY = height * .15;
      var rendered = points.map(function (point, index) {
        return {
          x: offsetX + point.x * innerWidth + Math.sin(seconds * 1.16 + point.phase) * width * .052,
          y: offsetY + point.y * innerHeight + Math.cos(seconds * .98 + point.phase) * height * .052
        };
      });

      context.save();
      context.beginPath();
      context.arc(centerX, centerY, radius - context.lineWidth, 0, Math.PI * 2);
      context.clip();
      context.translate(centerX, centerY);
      context.rotate(Math.sin(seconds * .72) * .13);
      context.translate(-centerX, -centerY);
      context.setLineDash([width * .11, width * .045]);
      context.lineDashOffset = -seconds * width * .20;
      context.lineWidth = Math.max(1.2, width * .022);
      links.forEach(function (link, index) {
        var start = rendered[link[0]];
        var end = rendered[link[1]];
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = index % 2 ? '#176bff' : '#18bfe6';
        context.stroke();
      });
      context.setLineDash([]);

      rendered.forEach(function (point, index) {
        var pulse = 1 + Math.sin(seconds * 2.2 + index) * .22;
        context.beginPath();
        context.arc(point.x, point.y, Math.max(2.3, width * .045) * pulse, 0, Math.PI * 2);
        context.fillStyle = index % 2 ? '#176bff' : '#18bfe6';
        context.shadowColor = 'rgba(23, 107, 255, .55)';
        context.shadowBlur = width * .06;
        context.fill();
        context.shadowBlur = 0;
      });
      context.restore();

      window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(logo);
    resize();
    window.requestAnimationFrame(draw);
  }

  function buildFooterLinks() {
    var footer = document.createElement('div');
    footer.className = 'vpscloud-footer-links';
    footer.innerHTML =
      '<span><a href="https://vpscloud.net.br/" target="_blank" rel="noopener noreferrer">VPS CLOUD - Network Consulting</a></span>' +
      '<span><a href="https://vpscloud.net.br/mk-auth.html" target="_blank" rel="noopener noreferrer">MK-Auth em Cloud</a></span>' +
      '<span class="vpscloud-copyright">Direitos autorais: Bruno Fontes - Network Consulting</span>';
    return footer;
  }

  function buildCardLinks() {
    var footer = document.createElement('div');
    footer.className = 'vpscloud-card-links';
    footer.innerHTML =
      '<a href="https://vpscloud.net.br/" target="_blank" rel="noopener noreferrer"><small>VPS CLOUD</small><strong>Network Consulting</strong></a>' +
      '<a href="https://vpscloud.net.br/mk-auth.html" target="_blank" rel="noopener noreferrer"><strong>MK-Auth em Cloud</strong></a>' +
      '<span class="vpscloud-card-copyright">Direitos autorais: Bruno Fontes - Network Consulting</span>';
    return footer;
  }

  function buildCentralButton() {
    var button = document.createElement('a');
    button.className = 'vpscloud-central-button';
    button.href = '/central';
    button.innerHTML = '<span aria-hidden="true">☁</span> Central do Assinante';
    return button;
  }

  function applyIdentity() {
    document.body.classList.add('vpscloud-login');

    var figure = document.querySelector('.mkalogo');
    var legacyLogo = figure ? figure.querySelector('img') : null;
    if (figure && legacyLogo) {
      legacyLogo.src = 'img/vpscloud-mkauth.svg?v=20260902-3';
      legacyLogo.alt = 'MK-AUTH VPS CLOUD';

      if (!legacyLogo.parentElement || legacyLogo.parentElement.tagName !== 'A') {
        var logoLink = document.createElement('a');
        logoLink.href = 'https://vpscloud.net.br/';
        logoLink.target = '_blank';
        logoLink.rel = 'noopener noreferrer';
        logoLink.setAttribute('aria-label', 'MK-AUTH VPS CLOUD — abrir site');
        figure.insertBefore(logoLink, legacyLogo);
        logoLink.appendChild(legacyLogo);
      }
      enableLogoMotion(legacyLogo.parentElement);
      enableLogoNetworkAnimation(legacyLogo.parentElement);
    }

    if (!document.querySelector('.vpscloud-hero-brand')) {
      document.body.appendChild(buildBrandLink());
    }
    if (!document.querySelector('.vpscloud-network-canvas')) {
      buildNetworkCanvas();
    }

    var footerStart = document.querySelector('.navbar .navbar-start');
    if (footerStart && !document.querySelector('.vpscloud-footer-links')) {
      footerStart.appendChild(buildFooterLinks());
    }

    var loginBox = document.querySelector('.box');
    if (loginBox && !document.querySelector('.vpscloud-central-button')) {
      loginBox.appendChild(buildCentralButton());
    }
    if (loginBox && !document.querySelector('.vpscloud-hotsite-button')) {
      var hotsite = document.createElement('a');
      hotsite.className = 'vpscloud-central-button vpscloud-hotsite-button';
      hotsite.href = '/';
      hotsite.innerHTML = '<span aria-hidden="true">&#8962;</span> Hotsite Provedor';
      var central = loginBox.querySelector('.vpscloud-central-button');
      loginBox.insertBefore(hotsite, central ? central.nextSibling : null);
    }
    if (loginBox && !document.querySelector('.vpscloud-card-links')) {
      loginBox.appendChild(buildCardLinks());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyIdentity);
  } else {
    applyIdentity();
  }
}());
(function () {
  'use strict';
  function setup() {
    var form = document.getElementById('form');
    var box = document.querySelector('.box');
    var enter = document.getElementById('btn_entrar');
    if (!form || !box || !enter || !window.jQuery || box.querySelector('.vpscloud-access-status')) return;
    var panel = document.createElement('div');
    panel.className = 'vpscloud-access-status';
    panel.hidden = true;
    panel.setAttribute('role', 'status');
    panel.setAttribute('aria-live', 'polite');
    panel.innerHTML = '<span class="vpscloud-access-icon" aria-hidden="true"></span><strong></strong><p></p>';
    box.appendChild(panel);
    var original = enter.innerHTML;
    var busy = false;
    function status(state, title, message) {
      panel.hidden = false;
      panel.dataset.state = state;
      panel.querySelector('strong').textContent = title;
      panel.querySelector('p').textContent = message;
      panel.querySelector('span').textContent = state === 'success' ? '✓' : state === 'error' ? '!' : '';
      box.classList.toggle('vpscloud-access-checking', state === 'pending');
      enter.innerHTML = state === 'pending' ? 'Verificando…' : original;
      enter.disabled = state === 'pending' || state === 'success';
      box.setAttribute('aria-busy', state === 'pending' ? 'true' : 'false');
    }
    function readable(text) {
      return text.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\(['"\\])/g, '$1').replace(/<[^>]*>/g, '').trim().slice(0, 600);
    }
    window.jQuery(form).on('submit.vpscloudFeedback', function (event) {
      event.preventDefault();
      if (busy) return;
      var username = document.getElementById('xxlogin');
      var password = document.getElementById('xxsenha');
      if (!username.value.trim() || !password.value) {
        status('error', 'Confira seus dados', 'Informe o usuário e a senha para entrar.');
        (!username.value.trim() ? username : password).focus();
        return;
      }
      busy = true;
      status('pending', 'Verificando seu acesso', 'Aguarde enquanto o MK-Auth confirma seus dados.');
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 30000);
      fetch(form.action, { method: 'POST', body: new FormData(form), credentials: 'same-origin', headers: { 'X-Vpscloud-Feedback': '1' }, signal: controller.signal })
        .then(function (response) {
          if (!response.ok) throw new Error('O servidor retornou erro ' + response.status + '. Tente novamente.');
          if (!(response.headers.get('Content-Type') || '').includes('application/json')) {
            throw new Error('A integração de acesso precisa ser atualizada. Recarregue a página.');
          }
          return response.json().then(function (result) {
            if (result.success === true && result.redirect === '/admin/index.hhvm') {
              status('success', 'Acesso autorizado', 'Login confirmado. Abrindo o sistema…');
              window.setTimeout(function () { location.assign(result.redirect); }, 650);
              return;
            }
            throw new Error(typeof result.message === 'string' ? result.message.slice(0, 600) : 'Não foi possível confirmar o acesso. Atualize a página e tente novamente.');
          });
        })
        .catch(function (error) {
          status('error', 'Não foi possível entrar', error.name === 'AbortError' ? 'O servidor demorou para responder. Tente novamente.' : error instanceof TypeError ? 'Falha de conexão. Verifique sua internet e tente novamente.' : error.message);
          busy = false;
        })
        .finally(function () { window.clearTimeout(timeout); });
    });
    var clear = document.getElementById('btn_limpar');
    if (clear) clear.addEventListener('click', function () { if (!busy) panel.hidden = true; });
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) { busy = false; enter.disabled = false; enter.innerHTML = original; panel.hidden = true; box.classList.remove('vpscloud-access-checking'); box.setAttribute('aria-busy', 'false'); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
}());
(function () {
  'use strict';
  function launch() {
    if (!document.body.classList.contains('vpscloud-login') || document.querySelector('.vpscloud-rocket-flight')) return;
    var flight = document.createElement('div');
    flight.className = 'vpscloud-rocket-flight';
    flight.setAttribute('aria-hidden', 'true');
    flight.innerHTML = '<div class="vpscloud-rocket"><svg viewBox="0 0 96 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vpsRocketHull" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#bedbff"/></linearGradient></defs><path class="vpscloud-rocket-fire" d="M30 25C10 16 4 32 0 32c8 0 10 16 30 7z" fill="#18d7f4"/><path d="M28 27C14 23 12 32 7 32c7 1 9 9 21 5z" fill="#ffbf51"/><path d="M43 22L33 8h23l13 14M43 42L33 56h23l13-14" fill="#176bff" stroke="#8deaff" stroke-width="2"/><path d="M27 23C48 12 72 15 91 32 72 49 48 52 27 41z" fill="url(#vpsRocketHull)" stroke="#d5efff" stroke-width="2"/><path d="M75 21c6 3 11 7 16 11-5 4-10 8-16 11z" fill="#176bff"/><circle cx="58" cy="32" r="10" fill="#071c38" stroke="#18d7f4" stroke-width="3"/><circle cx="56" cy="29" r="3" fill="#fff" opacity=".8"/><path d="M28 25v14" stroke="#071c38" stroke-width="4"/></svg></div>';
    document.body.appendChild(flight);
    var rocket = flight.querySelector('.vpscloud-rocket');
    flight.removeAttribute('aria-hidden');
    rocket.setAttribute('role', 'button');
    rocket.setAttribute('tabindex', '0');
    rocket.setAttribute('aria-label', 'Acelerar foguete');
    var boostTimer;
    function accelerate() {
      if (rocket.dataset.docked === 'true' || rocket.dataset.piloting === 'true') return;
      if (document.body.classList.contains('vpscloud-animation-paused')) return;
      window.clearTimeout(boostTimer);
      rocket.classList.add('vpscloud-rocket-boost');
      rocket.getAnimations().forEach(function (animation) {
        if (animation.animationName === 'vpscloud-rocket-tour') animation.updatePlaybackRate(3);
      });
      boostTimer = window.setTimeout(function () {
        rocket.classList.remove('vpscloud-rocket-boost');
        rocket.getAnimations().forEach(function (animation) {
          if (animation.animationName === 'vpscloud-rocket-tour') animation.updatePlaybackRate(1);
        });
      }, 3500);
    }
    rocket.addEventListener('click', accelerate);
    rocket.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        accelerate();
      }
    });

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', launch);
  else launch();
}());

(function () {
  function alignBrand() {
    var brand = document.querySelector('.vpscloud-hero-brand');
    var card = document.querySelector('body.vpscloud-login .box');
    if (!brand || !card) return;
    var rect = card.getBoundingClientRect();
    var logo = card.querySelector('.mkalogo');
    var top = logo ? Math.min(rect.top, logo.getBoundingClientRect().top) : rect.top;
    brand.style.top = ((top + rect.bottom) / 2) + 'px';
  }
  function setup() {
    alignBrand();
    var card = document.querySelector('body.vpscloud-login .box');
    if (card && window.ResizeObserver) new ResizeObserver(alignBrand).observe(card);
    window.addEventListener('resize', alignBrand, { passive: true });
    window.addEventListener('scroll', alignBrand, { passive: true });
    window.addEventListener('load', alignBrand);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    if (!document.body.classList.contains('vpscloud-login')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vpscloud-animation-toggle';
    button.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="3" height="12" rx=".8"/><rect x="11" y="4" width="3" height="12" rx=".8"/></svg>';
    button.setAttribute('aria-label', 'Pausar animações');
    button.setAttribute('aria-pressed', 'false');
    button.title = 'Pausar animações';
    document.body.appendChild(button);
    button.addEventListener('click', function () {
      var paused = document.body.classList.toggle('vpscloud-animation-paused');
      button.innerHTML = paused ? '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6 3.5L16 10 6 16.5Z"/></svg>' : '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="3" height="12" rx=".8"/><rect x="11" y="4" width="3" height="12" rx=".8"/></svg>';
      button.setAttribute('aria-label', paused ? 'Retomar animações' : 'Pausar animações');
      button.setAttribute('aria-pressed', String(paused));
      button.title = paused ? 'Retomar animações' : 'Pausar animações';
    });
    function protectCard() {
      var rocket = document.querySelector('.vpscloud-rocket');
      var card = document.querySelector('body.vpscloud-login .box');
      if (rocket && card) {
        var c = card.getBoundingClientRect();
        var logo = card.querySelector('.mkalogo');
        var top = logo ? Math.min(c.top, logo.getBoundingClientRect().top) : c.top;
        var safeTop = Math.max(4, Math.min(12, top - 145));
        var safeLeft = Math.max(12, Math.min(window.innerWidth * .025, c.left - 140));
        var safeBottom = Math.min(window.innerHeight - 100, Math.max(c.bottom + 50, window.innerHeight - 165));
        rocket.style.setProperty('--rocket-safe-top', safeTop + 'px');
        rocket.style.setProperty('--rocket-safe-left', safeLeft + 'px');
        rocket.style.setProperty('--rocket-safe-bottom', safeBottom + 'px');
        rocket.style.visibility = '';
        rocket.style.setProperty('--rocket-card-left', Math.max(safeLeft + 90, c.left - 135) + 'px');
        rocket.style.setProperty('--rocket-card-right', (c.right + 45) + 'px');
      }
      window.requestAnimationFrame(protectCard);
    }
    protectCard();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    if (!document.body.classList.contains('vpscloud-login')) return;
    var hint = document.createElement('span');
    hint.className = 'vpscloud-rocket-hint';
    hint.textContent = 'Clique no foguete para acelerar sua viagem';
    document.body.appendChild(hint);
    var rocket = document.querySelector('.vpscloud-rocket');
    if (rocket) rocket.title = hint.textContent;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    var input = document.querySelector('body.vpscloud-login #xxsenha');
    if (!input || document.querySelector('.vpscloud-password-eye')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vpscloud-password-eye';
    button.setAttribute('aria-controls', input.id);
    button.setAttribute('aria-label', 'Mostrar senha');
    button.setAttribute('aria-pressed', 'false');
    button.title = 'Mostrar senha';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="vpscloud-eye-slash" d="M4 4l16 16"/></svg>';
    input.parentElement.appendChild(button);
    function conceal() {
      input.type = 'password';
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Mostrar senha');
      button.title = 'Mostrar senha';
    }
    button.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
      button.title = show ? 'Ocultar senha' : 'Mostrar senha';
    });
    var clear = document.getElementById('btn_limpar');
    if (clear) clear.addEventListener('click', conceal);
    var form = document.getElementById('form');
    if (form) form.addEventListener('submit', conceal);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    var rocket = document.querySelector('.vpscloud-rocket');
    if (!rocket) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vpscloud-galaxy-toggle';
    button.textContent = 'Viajar na Galaxya';
    button.setAttribute('aria-pressed', 'false');
    document.body.appendChild(button);
    var galaxy = false, target = 0, current = 0, progress = 0, last = 0;
    var route = [], position = null;
    function buildRoute(links) {
      var visited = {};
      route = [0];
      function visit(node) {
        links.forEach(function (edge, index) {
          if (visited[index] || (edge[0] !== node && edge[1] !== node)) return;
          visited[index] = true;
          var next = edge[0] === node ? edge[1] : edge[0];
          route.push(next);
          visit(next);
          route.push(node);
        });
      }
      visit(0);
    }
    document.addEventListener('vpscloud-dock-start', function () { galaxy = false; rocket.classList.remove('vpscloud-rocket-galaxy'); button.textContent = 'Viajar na Galaxya'; button.setAttribute('aria-pressed', 'false'); });
    button.addEventListener('click', function () {
      var departure = rocket.getBoundingClientRect();
      galaxy = !galaxy;
      rocket.classList.toggle('vpscloud-rocket-galaxy', galaxy);
      button.setAttribute('aria-pressed', String(galaxy));
      button.textContent = galaxy ? 'Sair da Galaxya' : 'Viajar na Galaxya';
      if (galaxy) {
        var r = departure;
        position = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        current = 0; target = 0; progress = 0; last = performance.now();
      } else {
        rocket.classList.add('vpscloud-rocket-galaxy');
        button.disabled = true;
        var startX = departure.left + departure.width / 2;
        var startY = departure.top + departure.height / 2;
        var safeTop = parseFloat(rocket.style.getPropertyValue('--rocket-safe-top')) || 8;
        var safeBottom = parseFloat(rocket.style.getPropertyValue('--rocket-safe-bottom')) || window.innerHeight - 165;
        var toRight = startX > window.innerWidth * .85;
        var toTop = !toRight && startY < (safeTop + safeBottom) / 2;
        var endX = toTop ? window.innerWidth * .75 + 42 : window.innerWidth * 1.05 + 42;
        var endY = (toTop ? safeTop : safeBottom) + 28;
        var elapsed = 0, previous = performance.now();
        var angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        function leaveNetwork(now) {
          var delta = Math.min(64, now - previous); previous = now;
          if (!document.body.classList.contains('vpscloud-animation-paused')) elapsed += delta * (rocket.classList.contains('vpscloud-rocket-boost') ? 3 : 1);
          var t = Math.min(1, elapsed / 1700);
          var eased = t * t * (3 - 2 * t);
          rocket.style.width = (34 + 50 * eased) + 'px';
          rocket.style.height = (23 + 33 * eased) + 'px';
          rocket.style.left = (startX + (endX - startX) * eased) + 'px';
          rocket.style.top = (startY + (endY - startY) * eased) + 'px';
          rocket.style.transform = 'translate(-50%, -50%) rotate(' + angle + 'deg)';
          if (t < 1) { requestAnimationFrame(leaveNetwork); return; }
          rocket.classList.remove('vpscloud-rocket-galaxy');
          ['transform', 'left', 'top', 'width', 'height'].forEach(function (property) { rocket.style.removeProperty(property); });
          rocket.getAnimations().forEach(function (animation) {
            if (animation.animationName === 'vpscloud-rocket-tour') animation.currentTime = toTop ? 19200 : 0;
          });
          button.disabled = false;
        }
        requestAnimationFrame(leaveNetwork);
      }
    });
    document.addEventListener('vpscloud-network-frame', function (event) {
      if (!galaxy) return;
      if (!route.length) buildRoute(event.detail.links);
      var now = performance.now();
      var dt = Math.min(64, now - last); last = now;
      var points = event.detail.points;
      var end = points[route[target]];
      var start = current === -1 ? position : points[route[current]];
      if (current === 0 && target === 0) { start = position; current = -1; }
      var dx = end.x - start.x, dy = end.y - start.y;
      var length = Math.max(1, Math.hypot(dx, dy));
      var speed = rocket.classList.contains('vpscloud-rocket-boost') ? 390 : 130;
      progress = Math.min(1, progress + dt * speed / 1000 / length);
      var x = start.x + dx * progress, y = start.y + dy * progress;
      rocket.style.left = x + 'px';
      rocket.style.top = y + 'px';
      rocket.style.transform = 'translate(-50%, -50%) rotate(' + Math.atan2(dy, dx) * 180 / Math.PI + 'deg)';
      if (progress >= 1) { current = target; target = (target + 1) % route.length; progress = 0; }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    var rocket = document.querySelector('.vpscloud-rocket');
    if (!rocket) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'vpscloud-rocket-smoke';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var particles = [], previous = 0, emission = 0, lastPosition = null;
    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * ratio);
      canvas.height = Math.round(innerHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    function draw(now) {
      var dt = previous ? Math.min(64, now - previous) : 16; previous = now;
      if (document.body.classList.contains('vpscloud-animation-paused')) { requestAnimationFrame(draw); return; }
      var boosting = rocket.classList.contains('vpscloud-rocket-boost') || rocket.classList.contains('vpscloud-rocket-launching');
      if (boosting && innerWidth > 1023) {
        var svg = rocket.querySelector('svg');
        var anchor = svg && svg.querySelector('.vpscloud-smoke-anchor');
        if (svg && !anchor) {
          anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          anchor.setAttribute('class', 'vpscloud-smoke-anchor');
          anchor.setAttribute('cx', '4'); anchor.setAttribute('cy', '32');
          anchor.setAttribute('r', '.1'); anchor.setAttribute('fill', 'transparent');
          anchor.setAttribute('pointer-events', 'none');
          svg.appendChild(anchor);
        }
        if (anchor) {
          var exhaust = anchor.getBoundingClientRect();
          var tail = { x: exhaust.left + exhaust.width / 2, y: exhaust.top + exhaust.height / 2 };
          var bounds = rocket.getBoundingClientRect();
          var centerX = bounds.left + bounds.width / 2;
          var centerY = bounds.top + bounds.height / 2;
          var outerTransform = getComputedStyle(rocket).transform;
          var innerTransform = getComputedStyle(svg).transform;
          var outerMatrix = new DOMMatrixReadOnly(outerTransform === 'none' ? undefined : outerTransform);
          var innerMatrix = new DOMMatrixReadOnly(innerTransform === 'none' ? undefined : innerTransform);
          var rotation = Math.atan2(outerMatrix.b, outerMatrix.a) + Math.atan2(innerMatrix.b, innerMatrix.a);
          var axisX = Math.cos(rotation), axisY = Math.sin(rotation);
          var along = (tail.x - centerX) * axisX + (tail.y - centerY) * axisY;
          tail.x = centerX + along * axisX;
          tail.y = centerY + along * axisY;
          var small = rocket.classList.contains('vpscloud-rocket-galaxy');
          emission += dt;
          if (emission >= 24) {
            emission = 0;
            var distance = lastPosition ? Math.hypot(tail.x - lastPosition.x, tail.y - lastPosition.y) : 0;
            var steps = Math.max(1, Math.min(10, Math.ceil(distance / 8)));
            for (var n = 1; n <= steps; n++) {
              var t = n / steps;
              particles.push({ x: lastPosition ? lastPosition.x + (tail.x - lastPosition.x) * t : tail.x, y: lastPosition ? lastPosition.y + (tail.y - lastPosition.y) * t : tail.y, age: 0, life: 1100 + Math.random() * 350, radius: small ? 2.5 : 5, vx: (Math.random() - .5) * .003, vy: (Math.random() - .5) * .003 });
            }
            lastPosition = { x: tail.x, y: tail.y };
          }
        }
      } else { lastPosition = null; emission = 0; }
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles = particles.filter(function (p) { return p.age < p.life; });
      particles.forEach(function (p) {
        p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        var remaining = Math.max(0, 1 - p.age / p.life);
        var radius = p.radius * (1 + p.age / p.life * 2);
        var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, 'rgba(210,230,241,' + remaining * .42 + ')');
        gradient.addColorStop(1, 'rgba(170,210,230,0)');
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    var rocket = document.querySelector('.vpscloud-rocket');
    var svg = rocket && rocket.querySelector('svg');
    if (!svg) return;
    var previous = null;
    var heading = null;
    function orient() {
      if (rocket.dataset.piloting === 'true' || rocket.dataset.docked === 'true') { previous = null; heading = null; requestAnimationFrame(orient); return; }
      var rect = rocket.getBoundingClientRect();
      var position = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      if (!document.body.classList.contains('vpscloud-animation-paused')) {
        var transform = getComputedStyle(rocket).transform;
        var matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
        var rotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
        if (previous) {
          var dx = position.x - previous.x, dy = position.y - previous.y;
          var distance = Math.hypot(dx, dy);
          if (distance > .15 && distance < innerWidth * .3) heading = Math.atan2(dy, dx) * 180 / Math.PI;
        }
        if (heading === null) heading = rotation;
        svg.style.transform = 'rotate(' + (heading - rotation) + 'deg)';
      }
      previous = position;
      requestAnimationFrame(orient);
    }
    requestAnimationFrame(orient);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    var rocket = document.querySelector('.vpscloud-rocket');
    var galaxy = document.querySelector('.vpscloud-galaxy-toggle');
    if (!rocket || !galaxy) return;
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'vpscloud-dock-toggle';
    button.textContent = 'Pousar foguete'; document.body.appendChild(button);
    var docked = false;
    rocket.addEventListener('click', function () {
      if (docked && !button.disabled) button.click();
    });
    rocket.addEventListener('keydown', function (event) {
      if (docked && !button.disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault(); button.click();
      }
    });
    button.addEventListener('click', function () {
      if ((!docked && galaxy.disabled) || rocket.dataset.piloting === 'true') return;
      var rect = rocket.getBoundingClientRect();
      var start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      var launch = docked;
      document.body.classList.toggle('vpscloud-lunar-visible', !launch);
      document.dispatchEvent(new Event('vpscloud-dock-start'));
      button.disabled = true; galaxy.disabled = true;
      rocket.dataset.piloting = 'true'; rocket.dataset.docked = 'false';
      rocket.classList.add('vpscloud-rocket-manual');
      rocket.classList.remove('vpscloud-rocket-landed', 'vpscloud-rocket-boost');
      if (launch) rocket.classList.add('vpscloud-rocket-launching');
      var svg = rocket.querySelector('svg'); svg.style.transform = '';
      var card = document.querySelector('body.vpscloud-login .box').getBoundingClientRect();
      var x = Math.min(innerWidth - 160, card.right + 110);
      var y = Math.max(150, Math.min(innerHeight - 180, innerHeight * .48));
      var top = (parseFloat(rocket.style.getPropertyValue('--rocket-safe-top')) || 8) + 28;
      var waypoints;
      if (launch) waypoints = [{ x: x, y: top }, { x: innerWidth * .75 + 42, y: top }];
      else {
        var corridor = start.y > card.bottom ? Math.max(card.bottom + 85, y) : top;
        waypoints = [{ x: start.x, y: corridor }, { x: x, y: corridor }, { x: x, y: y }];
      }
      var from = start, index = 0, progress = 0, last = performance.now(), total = 0;
      function fly(now) {
        var dt = Math.min(64, now - last); last = now;
        if (document.body.classList.contains('vpscloud-animation-paused')) { requestAnimationFrame(fly); return; }
        var to = waypoints[index];
        var dx = to.x - from.x, dy = to.y - from.y;
        progress = Math.min(1, progress + dt * (launch ? 380 : 300) / 1000 / Math.max(1, Math.hypot(dx, dy)));
        total += dt;
        var size = launch ? 108 - 24 * Math.min(1, total / 1500) : Math.min(108, 84 + 24 * total / 1800);
        rocket.style.width = size + 'px'; rocket.style.height = size * 2 / 3 + 'px';
        rocket.style.left = (from.x + dx * progress) + 'px'; rocket.style.top = (from.y + dy * progress) + 'px';
        rocket.style.transform = 'translate(-50%, -50%) rotate(' + Math.atan2(dy, dx) * 180 / Math.PI + 'deg)';
        if (progress >= 1) { from = to; index++; progress = 0; }
        if (index < waypoints.length) { requestAnimationFrame(fly); return; }
        rocket.dataset.piloting = 'false'; docked = !launch;
        rocket.dataset.docked = String(docked);
        rocket.classList.remove('vpscloud-rocket-launching');
        if (docked) {
          rocket.classList.add('vpscloud-rocket-landed');
          rocket.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
          rocket.style.width = '108px'; rocket.style.height = '72px';
        } else {
          rocket.classList.remove('vpscloud-rocket-manual');
          ['left','top','width','height','transform'].forEach(function (p) { rocket.style.removeProperty(p); });
          rocket.getAnimations().forEach(function (a) { if (a.animationName === 'vpscloud-rocket-tour') a.currentTime = 19200; });
        }
        button.textContent = docked ? 'Lançar foguete' : 'Pousar foguete';
        rocket.setAttribute('aria-label', docked ? 'Lançar foguete' : 'Acelerar foguete');
        rocket.title = docked ? 'Clique para lançar o foguete' : 'Clique no foguete para acelerar sua viagem';
        button.disabled = false; galaxy.disabled = docked;
      }
      requestAnimationFrame(fly);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();

(function () {
  function setup() {
    if (!document.body.classList.contains('vpscloud-login')) return;
    var ground = document.createElement('div');
    ground.className = 'vpscloud-lunar-ground';
    ground.setAttribute('aria-hidden', 'true');
    ground.innerHTML = '<svg viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="vpsLunarSoil" x2="0" y2="1"><stop stop-color="#b4bac3"/><stop offset="1" stop-color="#596370" stop-opacity=".15"/></linearGradient></defs><path d="M5 19L17 12 37 9 50 4H130L145 9 165 13 177 22 170 33 149 39 111 44 69 43 29 36 9 29Z" fill="url(#vpsLunarSoil)"/><path d="M50 4H130" stroke="#d1d5dc" stroke-width="2" stroke-linecap="round"/><ellipse cx="38" cy="23" rx="10" ry="4" fill="#626d7a" opacity=".6"/><ellipse cx="139" cy="22" rx="13" ry="5" fill="#626d7a" opacity=".6"/><ellipse cx="102" cy="32" rx="8" ry="3" fill="#495564" opacity=".4"/><path d="M30 19q8-4 16 0M128 17q11-4 22 0" fill="none" stroke="#d4d8de" stroke-opacity=".5"/><ellipse cx="90" cy="7" rx="23" ry="3" fill="#3f4956" opacity=".38"/></svg>';
    document.body.appendChild(ground);
    function position() {
      var card = document.querySelector('body.vpscloud-login .box');
      if (card) {
        var rect = card.getBoundingClientRect();
        var x = Math.min(innerWidth - 160, rect.right + 110);
        var y = Math.max(150, Math.min(innerHeight - 180, innerHeight * .48));
        ground.style.left = x + 'px';
        ground.style.top = (y + 35) + 'px';
      }
    }
    position();
    window.addEventListener('resize', position, { passive: true });
    window.addEventListener('scroll', position, { passive: true });
    window.addEventListener('load', position);
    var card = document.querySelector('body.vpscloud-login .box');
    if (card && window.ResizeObserver) new ResizeObserver(position).observe(card);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
