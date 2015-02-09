
function sr_screenblock(html) {
  $('#blockertext').html(html);
  $('body').addClass('screenblocker');
}

function sr_screenunblock() {
  $('body').removeClass('screenblocker');
}

function sr_cleanwait() {
  $('.pleasewaitanim').removeClass('pleasewait').removeClass('finished').removeClass('failed');
}

function sr_pleasewait() {
  $('.pleasewaitanim').addClass('pleasewait').removeClass('finished').removeClass('failed');
}

function sr_failed() {
  $('.pleasewaitanim').removeClass('pleasewait').removeClass('finished').addClass('failed');
}

function sr_finished() {
  $('.pleasewaitanim').removeClass('pleasewait').removeClass('failed').addClass('finished');    
}
function sr_finished() {
  $('.pleasewaitanim').removeClass('pleasewait').removeClass('failed').addClass('finished');    
}
