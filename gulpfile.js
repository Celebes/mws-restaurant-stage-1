const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const webp = require('gulp-webp');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();

const BUILD_DEV_TASKS = [
    'copy-html',
	'copy-manifest',
    'copy-css',
    'copy-sw',
    'copy-images',
    'copy-lazysizes',
    'copy-idb',
    'convert-img-to-webp',
    'scripts'
];

const BUILD_PROD_TASKS = [
    'copy-html',
	'copy-manifest',
    'copy-sw',
    'copy-images',
    'copy-lazysizes',
    'copy-idb',
    'convert-img-to-webp',
    'minify-css',
    'scripts-prod'
];

gulp.task('default', BUILD_PROD_TASKS, function () {
    gulp.watch('./css/*.css', ['copy-css']);
    gulp.watch('./js/**/*.js', ['scripts']);
    gulp.watch('./sw.js', ['copy-sw']);
    gulp.watch('./index.html', ['copy-html']);
    gulp.watch('./restaurant_info.html', ['copy-html']);
    gulp.watch('./dist/index.html').on('change', browserSync.reload);
    gulp.watch('./dist/restaurant_info.html').on('change', browserSync.reload);

    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });
});

gulp.task('build-prod', BUILD_PROD_TASKS);

gulp.task('minify-css', () => {
    gulp.src('./css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-html', () => {
    gulp.src('./*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-manifest', () => {
    gulp.src('./manifest.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-css', () => {
    gulp.src('./css/*.css')
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('copy-sw', () => {
    gulp.src('./sw.js')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-lazysizes', () => {
    gulp.src('./node_modules/lazysizes/lazysizes.min.js')
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy-idb', () => {
    gulp.src('./node_modules/idb/lib/idb.js')
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy-images', () => {
    gulp.src('img/*')
        .pipe(gulp.dest('dist/img'));
});

gulp.task('convert-img-to-webp', () =>
    gulp.src('img/*')
        .pipe(webp())
        .pipe(gulp.dest('dist/img/webp'))
);

gulp.task('scripts', () => {
    gulp.src('js/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/js'));
})

gulp.task('scripts-prod', () => {
    gulp.src('js/**/*.js')
        .pipe(babel({
            presets: ['minify']
        }))
        .pipe(gulp.dest('dist/js'));
})