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
    wordmark.textContent = 'VPS Cloud';

    var consulting = document.createElement('span');
    consulting.className = 'vpscloud-consulting';
    consulting.textContent = 'Network Consulting';

    brand.appendChild(cloud);
    brand.appendChild(wordmark);
    brand.appendChild(consulting);
    return brand;
  }

  function buildFooterLinks() {
    var footer = document.createElement('div');
    footer.className = 'vpscloud-footer-links';
    footer.innerHTML =
      '<span><a href="https://vpscloud.net.br/" target="_blank" rel="noopener noreferrer">VPS CLOUD - Network Consulting</a></span>' +
      '<span>MK-Auth em Cloud: <a href="https://vpscloud.net.br/mk-auth.html" target="_blank" rel="noopener noreferrer">Planos</a></span>' +
      '<span class="vpscloud-copyright">Direitos autorais: Bruno Fontes - Network Consulting</span>';
    return footer;
  }

  function buildCardLinks() {
    var footer = document.createElement('div');
    footer.className = 'vpscloud-card-links';
    footer.innerHTML =
      '<a href="https://vpscloud.net.br/" target="_blank" rel="noopener noreferrer"><small>VPS CLOUD</small><strong>Network Consulting</strong></a>' +
      '<a href="https://vpscloud.net.br/mk-auth.html" target="_blank" rel="noopener noreferrer"><small>MK-Auth em Cloud</small><strong>Planos</strong></a>' +
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
      legacyLogo.src = 'img/vpscloud-mkauth.svg?v=20260801-2';
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
    }

    if (!document.querySelector('.vpscloud-hero-brand')) {
      document.body.appendChild(buildBrandLink());
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
