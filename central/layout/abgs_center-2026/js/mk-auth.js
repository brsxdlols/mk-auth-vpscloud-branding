$(document).ready(function () {
  // --- SOCIAL MEDIA FORMATTING ---
  var redes = document.getElementsByClassName('redes-sociais');
  if (redes.length > 0) {
    var instagram = $('#instagram').attr('href') || '';
    var whatsapp = $('#whatsapp').attr('href') || '';
    var tiktok = $('#tiktok').attr('href') || '';
    var twitter = $('#twitter').attr('href') || '';
    var facebook = $('#facebook').attr('href') || '';
    var linkedin = $('#linkedin').attr('href') || '';
    var youtube = $('#youtube').attr('href') || '';
    var telegram = $('#telegram').attr('href') || '';
    var skype = $('#skype').attr('href') || '';
    var kwai = $('#kwai').attr('href') || '';

    function isValid(val) {
      return val && val.length > 0 && !val.includes('{') && val !== '#';
    }

    if (!isValid(whatsapp)) {
      $('#whatsapp').remove();
    } else if (!whatsapp.includes('http')) {
      $('#whatsapp').attr('href', 'https://wa.me/' + whatsapp.replace(/\D/g, ''));
    }

    if (!isValid(instagram)) {
      $('#instagram').remove();
    } else if (!instagram.includes('http')) {
      $('#instagram').attr('href', 'https://instagram.com/' + instagram.replace('@', ''));
    }

    if (!isValid(facebook)) {
      $('#facebook').remove();
    } else if (!facebook.includes('http')) {
      $('#facebook').attr('href', 'https://www.facebook.com/' + facebook);
    }

    if (!isValid(twitter)) {
      $('#twitter').remove();
    } else if (!twitter.includes('http')) {
      $('#twitter').attr('href', 'https://twitter.com/' + twitter);
    }

    if (!isValid(tiktok)) {
      $('#tiktok').remove();
    } else if (!tiktok.includes('http')) {
      var tik = tiktok.startsWith('@') ? tiktok : '@' + tiktok;
      $('#tiktok').attr('href', 'https://www.tiktok.com/' + tik);
    }

    if (!isValid(linkedin)) {
      $('#linkedin').remove();
    } else if (!linkedin.includes('http')) {
      $('#linkedin').attr('href', 'https://www.linkedin.com/in/' + linkedin.replace('@', ''));
    }

    if (!isValid(youtube)) {
      $('#youtube').remove();
    } else if (!youtube.includes('http')) {
      var you = youtube.startsWith('@') ? youtube : '@' + youtube;
      $('#youtube').attr('href', 'https://youtube.com/' + you);
    }

    if (!isValid(telegram)) {
      $('#telegram').remove();
    } else if (!telegram.includes('http') && !telegram.includes('tg://')) {
      var numero = telegram.match(/\d+/g);
      numero = numero && numero.length > 0 ? numero.join('') : '';
      if (numero.length >= 10) {
        if (!numero.startsWith('55')) numero = '55' + numero;
        $('#telegram').attr('href', 'tg://resolve?phone=' + numero);
      } else {
        $('#telegram').attr('href', 'tg://resolve?domain=' + telegram.replace('@', ''));
      }
    }

    if (!isValid(skype)) {
      $('#skype').remove();
    } else if (!skype.includes('skype:')) {
      $('#skype').attr('href', 'skype:' + skype);
    }

    if (!isValid(kwai)) {
      $('#kwai').remove();
    } else if (!kwai.includes('http')) {
      var kwa = kwai.startsWith('@') ? kwai : '@' + kwai;
      $('#kwai').attr('href', 'https://m.kwai.com/user/' + kwa);
    }

    $("a[href='']").remove();
  }

  // --- TABLE SORTING (BILLING) ---
  var topo = $('.card-table tbody')[0];
  if (topo != undefined) {
    var vencido = $(".card-table td:contains('vencido')").parent();
    if (vencido.length != 0) {
      $(vencido[vencido.length - 1]).addClass('vencido');
      topo.prepend(vencido[vencido.length - 1]);
    }
  }
});
