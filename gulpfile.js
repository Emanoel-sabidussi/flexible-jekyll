var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var cp = require('child_process');
var browserSync = require('browser-sync');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

// Build the Jekyll Site
gulp.task('jekyll-build', function (done) {
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

// Rebuild Jekyll and page reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', ['sass', 'img', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: 'wedding_website/_site'
        },
        notify: false
    });
});

// Compile files
gulp.task('sass', function () {
    return gulp.src('wedding_website/assets/css/scss/main.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('wedding_website/_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('wedding_website/assets/css'));
});

// Compression images
gulp.task('img', function() {
	return gulp.src('wedding_website/assets/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
    .pipe(gulp.dest('wedding_website/_site/assets/img'))
    .pipe(browserSync.reload({stream:true}));
});

// Watch scss, html, img files
gulp.task('watch', function () {
    gulp.watch('wedding_website/assets/css/scss/**/*.scss', ['sass']);
    gulp.watch('wedding_website/assets/js/**/*.js', ['jekyll-rebuild']);
    gulp.watch('wedding_website/assets/img/**/*', ['img']);
    gulp.watch(['wedding_website/*.html', 'wedding_website/_layouts/*.html', 'wedding_website/_includes/*.html', 'wedding_website/_pages/*.html', 'wedding_website/_posts/*'], ['jekyll-rebuild']);
});

//  Default task
gulp.task('default', ['browser-sync', 'watch']);
