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

    function draw(time) {
      animationFrame += 1;
      if (animationFrame % 10 === 0) canvas.dataset.animationFrame = String(animationFrame);
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      var seconds = time * .001;
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
    button.innerHTML = '<span aria-hidden="true">☁</span> Central do assinante';
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
