let fileswatch = 'html,htm,txt,json,md,woff2'; // List of files extensions for watching & hard reload

const { src, dest, task, watch, series, parallel } = require('gulp');
const gulp = require('gulp');
const yargs = require('yargs');
const fs = require('fs');
const browserSync = require('browser-sync').create();
const webpack = require('webpack-stream');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const rsync = require('gulp-rsync');
const del = require('del');

const distFolder = 'dist';
const sourceFolder = 'app';

const webpackConfig = require('./webpack.config'),
  argv = yargs.argv,
  production = !!argv.production;

webpackConfig.mode = production ? 'production' : 'development';
webpackConfig.devtool = production ? false : 'source-map';

const paths = {
  baseDir: './' + distFolder + '/',
  clean: './' + distFolder + '/',
  html: {
    src: [
      sourceFolder + '/view/*.html',
      '!' + sourceFolder + '/view/**/_*.html',
    ],
    dist: distFolder + '/',
    watch: sourceFolder + '/view/**/*.html',
  },
  styles: {
    src: sourceFolder + '/scss/main.scss',
    dist: distFolder + '/css/',
    watch: sourceFolder + '/scss/**/*.scss',
  },
  scripts: {
    src: sourceFolder + '/js/app.js',
    dist: distFolder + '/js/',
    watch: [sourceFolder + '/js/modules/**/*.js', sourceFolder + '/js/**/*.js'],
  },
  images: {
    src: sourceFolder + '/img/**/*.{png,jpg,svg,gif,ico,webp}',
    dist: distFolder + '/img/',
    watch: sourceFolder + '/img/**/*.{png,jpg,svg,gif,ico,webp}',
  },
  fonts: {
    src: sourceFolder + '/fonts/**/*.ttf',
    dist: distFolder + '/fonts',
  },
};
function browsersync() {
  browserSync.init({
    server: { baseDir: paths.baseDir },
    notify: false,
    online: true,
    port: 3000,
  });
}

function html() {
  return src(paths.html.src)
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(dest(paths.html.dist))
    .pipe(browserSync.stream());
}

function scripts() {
  src(sourceFolder + '/js/vendor/**/*.js').pipe(
    dest(distFolder + '/js/vendor')
  );
  return (
    src(paths.scripts.src)
      .pipe(webpack(webpackConfig), webpack)
      .on('error', function handleError() {
        this.emit('end');
      })
      // .pipe(rename('app.min.js'))
      .pipe(
        rename({
          suffix: '.min',
        })
      )
      .pipe(dest(paths.scripts.dist))
      .pipe(browserSync.stream())
  );
}

function styles() {
  src(sourceFolder + '/scss/vendor/**/*.{css,scss}')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(dest(distFolder + '/css/vendor'));

  return src(paths.styles.src)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
    )
    .pipe(rename('app.min.css'))
    .pipe(dest(paths.styles.dist))
    .pipe(browserSync.stream());
}

function images() {
  return src(paths.images.src)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(paths.images.dist))
    .pipe(src(paths.images.src))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 5, // 0 to 7
      })
    )
    .pipe(dest(paths.images.dist));
}

function fonts() {
  src(paths.fonts.src).pipe(dest(paths.fonts.dist)); // copy ttf
  src(paths.fonts.src).pipe(ttf2woff()).pipe(dest(paths.fonts.dist)); // convert ttf to woff

  return src(paths.fonts.src).pipe(ttf2woff2()).pipe(dest(paths.fonts.dist)); // convert ttf to woff2
}

// run command - gulp otf2ttf
gulp.task('otf2ttf', function () {
  return src([sourceFolder + '/fonts/*.otf'])
    .pipe(
      fonter({
        formats: ['ttf'],
      })
    )
    .pipe(dest(sourceFolder + '/fonts'));
});

// function fontsStyle() {
//   let fileContent = fs.readFileSync(sourceFolder + '/scss/fonts-generate.scss');
//   if (fileContent == '') {
//     fs.writeFile(sourceFolder + '/scss/fonts-generate.scss', '', cb);
//     return fs.readdir(paths.fonts.dist, function (err, items) {
//       if (items) {
//         let cFontname;
//         for (var i = 0; i < items.length; i++) {
//           let fontname = items[i].split('.');
//           fontname = fontname[0];
//           if (cFontname != fontname) {
//             fs.appendFile(
//               sourceFolder + '/scss/fonts-generate.scss',
//               '@include font-include("' +
//                 fontname +
//                 '", "' +
//                 fontname +
//                 '", "400", "normal");\r\n',
//               cb
//             );
//           }
//           cFontname = fontname;
//         }
//       }
//     });
//   }
// }
// function cb() {}

function cleanimg() {
  return del(paths.clean, { force: true });
}

function deploy() {
  return src('app/').pipe(
    rsync({
      root: 'app/',
      hostname: 'username@yousite.com',
      destination: 'yousite/public_html/',
      include: [
        /* '*.htaccess' */
      ], // Included files to deploy,
      exclude: ['**/Thumbs.db', '**/*.DS_Store'],
      recursive: true,
      archive: true,
      silent: false,
      compress: true,
    })
  );
}

function startwatch() {
  watch(paths.html.watch, { usePolling: true }, html);
  watch(paths.styles.watch, { usePolling: true }, styles);
  watch(paths.scripts.watch, { usePolling: true }, scripts);
  watch(paths.images.watch, { usePolling: true }, images);
  watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on(
    'change',
    browserSync.reload
  );
}

let build = gulp.series(
  cleanimg,
  gulp.parallel(html, scripts, styles, images, fonts)
  // fontsStyle
);
let watchs = gulp.parallel(build, startwatch, browsersync);

exports.assets = series(cleanimg, scripts, images);
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.cleanimg = cleanimg;
// exports.fontsStyle = fontsStyle;
exports.deploy = deploy;
exports.build = build;
exports.watchs = watchs;
exports.default = watchs;
