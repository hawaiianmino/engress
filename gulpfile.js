const gulp = require('gulp');//gulp本体

//scss
const sass = require('gulp-dart-sass');//Dart Sass はSass公式が推奨 @use構文などが使える
const plumber = require("gulp-plumber"); // エラーが発生しても強制終了させない
const notify = require("gulp-notify"); // エラー発生時のアラート出力
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const autoprefixer = require('autoprefixer');
const cssdeclsort = require('css-declaration-sorter'); //css並べ替え
const imageMin = require('gulp-imagemin'); //画像圧縮
const mozjpeg = require("imagemin-mozjpeg");    //画像圧縮
const pngquant = require("imagemin-pngquant");  //画像圧縮
const changed = require("gulp-changed");        //画像圧縮
const browserSync = require("browser-sync"); //ブラウザリロード
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
// webpackの設定ファイルの読み込み
const webpackConfig = require("./webpack.config");
const { src } = require('gulp');


// 入出力するフォルダを指定
const srcBase = './_static/src';
const assetsBase = './_assets';
const distBase = './_static/dist';


const srcPath = {
  'scss': assetsBase + '/scss/**/*.scss',
  'html': srcBase + '/**/*.html',
  'js': srcBase + '/**/*.js',
  'img': srcBase + '/image/*'
};

const distPath = {
  'css': distBase + '/css/',
  'html': distBase + '/',
  'js': distBase + '/js/',
  'img': distBase + '/image/'
};

/**
 * sass
 *
 */
const cssSass = () => {
  return gulp.src(srcPath.scss, {
    sourcemaps: true
  })
    .pipe(
      //エラーが出ても処理を止めない
      plumber({
        errorHandler: notify.onError('Error:<%= error.message %>')
      }))
    .pipe(sass({ outputStyle: 'expanded' })) //指定できるキー expanded compressed
    .pipe( postcss([ autoprefixer(
      {
      // ☆IEは11以上、Androidは5以上
      // その他は最新2バージョンで必要なベンダープレフィックスを付与する
      "overrideBrowserslist": ["last 2 versions", "ie >= 11", "Android >= 5"],
      cascade: false}
      ) ]) )
      .pipe( postcss([ cssdeclsort({ order: 'alphabetical' }) ]) )//プロパティをソートし直す(アルファベット順)
    .pipe(postcss([mqpacker()])) // メディアクエリをまとめる
    .pipe(gulp.dest(distPath.css, { sourcemaps: './' })) //コンパイル先
    .pipe(browserSync.stream())
    .pipe(notify({
      message: 'Sassをコンパイルしました！',
      onLast: true
    }))
}


/**
 * html
 */
const html = () => {
  return gulp.src(srcPath.html)
    .pipe(gulp.dest(distPath.html))
}

/**
 * js
 */
// webpack
const bundleJs = () => {
  // webpackStreamの第2引数にwebpackを渡す
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(distPath.js));
};

/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
}

const browserSyncOption = {
  // server: distBase
  proxy: "localhost:10020",
  notify: false,
  open: "external",
}

/**
 * リロード
 */
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

/**
 * 画像圧縮
 */
function imagemin(done) {
  gulp.src(srcPath.img)
    .pipe(changed(distPath.img))   // 追加
    .pipe(
      imageMin([
        pngquant({                // 追加
          quality: [0.6, 0.7],
          speed: 1,
        }),
        mozjpeg({ quality: 65 }), // 追加
        imageMin.svgo(),
        imageMin.optipng(),
        imageMin.gifsicle({ optimizationLevel: 3 }),
     ])
    )
    .pipe(gulp.dest(distPath.img));
  done();
}

/**
 *
 * ファイル監視 ファイルの変更を検知したら、browserSyncReloadでreloadメソッドを呼び出す
 * series 順番に実行
 * watch('監視するファイル',処理)
 */
const watchFiles = () => {
  gulp.watch(srcPath.scss, gulp.series(cssSass)),
  gulp.watch(srcPath.js, gulp.series(bundleJs, browserSyncReload)),
  gulp.watch(srcPath.html, gulp.series(html, browserSyncReload)),
  gulp.watch(srcPath.img, gulp.series(imagemin))
}

/**
 * 画像圧縮のタスク定義
 */
exports.imagemin = imagemin;

/**
 * seriesは「順番」に実行
 * parallelは並列で実行
 */
exports.default = gulp.series(
  gulp.parallel(html, bundleJs, cssSass, imagemin),
  gulp.parallel(watchFiles, browserSyncFunc)
);