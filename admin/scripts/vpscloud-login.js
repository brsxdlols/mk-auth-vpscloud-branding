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
      return { x: position[0], y: position[1], phase: index * .73 };
    });
    var links = [[0,1],[0,5],[0,6],[1,2],[1,6],[2,3],[2,6],[2,7],[3,4],[4,7],[4,8],[5,6],[5,9],[6,7],[6,9],[6,10],[7,8],[7,10],[7,12],[8,12],[9,10],[10,11],[11,12]];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(time) {
      var rect = canvas.getBoundingClientRect();
      var seconds = time * .001;
      context.clearRect(0, 0, rect.width, rect.height);

      var rendered = points.map(function (point, index) {
        var baseX = point.x * rect.width;
        var baseY = point.y * rect.height;
        var driftX = reducedMotion ? 0 : Math.sin(seconds * .55 + point.phase) * (7 + index % 3);
        var driftY = reducedMotion ? 0 : Math.cos(seconds * .48 + point.phase) * (6 + index % 4);
        var dx = mouse.x - baseX;
        var dy = mouse.y - baseY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var influence = reducedMotion ? 0 : Math.max(0, 1 - distance / 240);
        return {
          x: baseX + driftX + dx * influence * .10,
          y: baseY + driftY + dy * influence * .10,
          active: influence
        };
      });

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
        var radius = 4.5 + (index % 3) + point.active * 3.5;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(45, 203, 230,' + (.72 + point.active * .25) + ')';
        context.shadowColor = 'rgba(45, 203, 230, .8)';
        context.shadowBlur = 5 + point.active * 14;
        context.fill();
        context.shadowBlur = 0;
      });

      if (!reducedMotion) window.requestAnimationFrame(draw);
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
    draw(0);
    return canvas;
  }

  function enableLogoMotion(logoLink) {
    if (!logoLink || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var logo = logoLink.querySelector('img');
    if (!logo) return;

    logoLink.addEventListener('pointermove', function (event) {
      var rect = logoLink.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - .5;
      var y = (event.clientY - rect.top) / rect.height - .5;
      logo.style.setProperty('--vps-logo-ry', (x * 7).toFixed(2) + 'deg');
      logo.style.setProperty('--vps-logo-rx', (-y * 7).toFixed(2) + 'deg');
    });
    logoLink.addEventListener('pointerleave', function () {
      logo.style.removeProperty('--vps-logo-ry');
      logo.style.removeProperty('--vps-logo-rx');
    });
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
    button.innerHTML = '<span aria-hidden="true">☁</span> Central do assinante';
    return button;
  }

  function applyIdentity() {
    document.body.classList.add('vpscloud-login');

    var figure = document.querySelector('.mkalogo');
    var legacyLogo = figure ? figure.querySelector('img') : null;
    if (figure && legacyLogo) {
      legacyLogo.src = 'img/vpscloud-mkauth.svg?v=20260902-1';
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
