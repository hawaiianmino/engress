import jQuery from "jquery";
import "jquery-match-height";
import ScrollHint from "scroll-hint";

// ドルマークに参照を代入(慣習的な $ を使うため)
const $ = jQuery;

$(function() {
  var state = false;
  var pos;
  
  // ハンバーガーメニュー対応
  $('.hamburger').on('click', function() {
    $(this).toggleClass('active');
    $('.gnav').toggleClass('active');
    $('.overlay').toggleClass('active');
    keepPosition();
  });

  // 背景の黒をクリックした際もメニューを閉じる
  $('.overlay').on('click', function() {
    $(this).toggleClass('active');
    $('.gnav').toggleClass('active');
    $('.hamburger').toggleClass('active');
    keepPosition();
  });

  // matchHeight設定
  $('.matchheight').matchHeight();
  $('.flow__item').matchHeight({
    byRow: false
  });
  $('.price_plan__name').matchHeight({
    byRow: false
  });

  // qaのスライド設定
  $('.qa__q').on('click', function() {
    $(this).next('.qa__a').slideToggle(200);
    $(this).toggleClass('active');
  });

  // scroll-hintの起動
  new ScrollHint('.js-scrollable');

  // メニューを閉じた際の背景位置を調整
  const keepPosition = () => {
    if(state == false) {
      pos = $(window).scrollTop();
      $('body').addClass('fixed').css({'top': -pos});
      state = true;
    }else {
      $('body').removeClass('fixed').css({'top':0});
      window.scrollTo(0,pos);
      state = false;
    }
  }

});