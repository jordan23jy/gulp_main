/*******************************************************************************
1.0 DEPENDENCIES
*******************************************************************************/

var gulp = require('gulp'),								// gulp core
	uglify = require('gulp-uglify'),					// uglifies the js
	sass = require('gulp-ruby-sass'),					// sass compiler
	minifyCSS = require('gulp-minify-css'),				// uglifies the css
	sourcemaps = require('gulp-sourcemaps'),			// indicate source at destination file
	plumber = require('gulp-plumber'),					// disable interuption
	browserSync = require('browser-sync'),				// inject code to all devices
	autoprefixer = require('gulp-autoprefixer'),        // sets missing browserprefixes
	jshint = require('gulp-jshint'),                    // check if js is ok
	concat = require('gulp-concat'),                    // concatinate js
	notify = require('gulp-notify'),                    // send notifications to osx
	stylish = require('jshint-stylish'),                // make errors look good in shell
	//rename = require("gulp-rename"),                  // rename files
    imagemin = require('gulp-imagemin'),                // compress images
    pngquant = require('imagemin-pngquant'),            //
    changed = require('gulp-changed'),                  // change only if source if changed
    minifyHTML = require('gulp-minify-html'),            // minify html
    del = require('del')
    ;

/*******************************************************************************
2.0 FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/

var target = {
    sass_src : './src/scss/**/*.scss',                    // all sass files
    css_src : './src/css/**/*.css',                       // all css files
    css_dest : './build/css',                             // where to put minified css
    css_dest_files : './build/css/*.css',                 // all css destination files

    js_src : './src/js/**/*.js',          			    // all js files
    js_uglify_src : './src/js/vendors/**/*.js',     		// all js files that should not be concatinated
    js_concat_src : './src/js/collections/**/*.js',       // all js files that should be concatinated
    js_dest : './build/js',                               // where to put minified js
  	js_dest_files : './build/js/*.js',                    // where to put minified js

    html_src : './src/*.html',                            // all images
    html_dest : './build',                               // all image destination

    img_src : './src/static/images/**/*',                 // all images
    img_dest : './build/static/images/'                   // all image destination

};

/*******************************************************************************
3.0 SASS TASK
*******************************************************************************/

gulp.task('sass', function() {
    gulp.src(target.sass_src)                           // get the files
        .pipe(plumber())                                // make sure gulp keeps running on errors
        .pipe(sass())                                   // compile all sass
        .pipe(autoprefixer(                             // complete css with correct vendor prefixes
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ))
        .pipe(minifycss())                              // minify css
        .pipe(gulp.dest(target.css_dest))               // where to put the file
        .pipe(notify({message: 'SCSS processed!'}));    // notify when done
});


/*******************************************************************************
3.5 CSS TASKS
*******************************************************************************/

// minify css
gulp.task('styles', function() {
	gulp.src(target.css_src)							// get the files
        //.pipe(changed(target.css_dest))                 // check for css changes
		.pipe(plumber())                                // prevent interuptions on errors
        .pipe(sourcemaps.init())						// get the source
        .pipe(concat('styles.min.css'))                     // compile to one file
        .pipe(autoprefixer('last 2 versions'))
        .pipe(minifyCSS({								// minify css
			keepBreaks:true
		}))
		.pipe(sourcemaps.write())						// write the source file
		.pipe(gulp.dest(target.css_dest))				// where to put the file
		.pipe(notify({message: 'CSS processed!'}))      // notify when done
});


/*******************************************************************************
4.0 JS TASKS
*******************************************************************************/

// lint js files
gulp.task('js-lint', function() {
    gulp.src(target.js_concat_src)                      // get the files
        .pipe(jshint())                                 // lint the files
        .pipe(jshint.reporter(stylish))                 // present the results in a beautiful way
});

// minify & concatinate all js in collections files
gulp.task('scripts', function() {
    gulp.src(target.js_concat_src)                      // get the files
        //.pipe(changed(target.js_dest))                  // check for js changes
    	.pipe(plumber())                                // prevent interuption on errors
        .pipe(sourcemaps.init())						// get the source code
        .pipe(concat('scripts.min.js'))                 // compile to one file
        .pipe(uglify())                                 // uglify the files
        .pipe(sourcemaps.write())						// write the source code
        .pipe(gulp.dest(target.js_dest))                // where to put the files
        .pipe(notify({message: 'JS processed!'}))       // notify when done
});

/*******************************************************************************
5.0 IMAGE TASKS
*******************************************************************************/

// compress images
gulp.task('imagemin', function () {
    gulp.src(target.img_src)                            // get the files
        .pipe(changed(target.img_dest))                 // check for changes in image folder
        .pipe(imagemin({                                // compress images
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(target.img_dest))               // send compressed image to folder
});

/*******************************************************************************
6.0 HTML TASKS
*******************************************************************************/

// minify html
gulp.task('htmlpage', function() {
    var opts = {comments:true,spare:true};

  gulp.src(target.html_src)                             // get the files
    .pipe(changed(target.html_dest))                    // check for changes
    .pipe(minifyHTML(opts))                             // minify the files
    .pipe(gulp.dest(target.html_dest))                  // where to put the file
    .pipe(notify({message: 'HTML processed!'}))         // notify when done
});

/*******************************************************************************
8.0 BROWSER SYNC
*******************************************************************************/

gulp.task('browser-sync', function() {
	browserSync.init([target.html_dest, target.css_dest_files, target.js_dest_files], {		// files to inject
		server: {
			baseDir: target.html_dest												        	// server
		}
	});
});


/*******************************************************************************
9.0 GULP WATCH
*******************************************************************************/

gulp.task('watch', function() {
    gulp.watch(target.html_src, ['htmlpage']);               // watches html
	gulp.watch(target.js_concat_src, ['js-lint', 'scripts']);	// watches js
	gulp.watch(target.css_src, ['styles']);					// watches css
    gulp.watch(target.img_src, ['imagemin']);               // watches css
});

/*******************************************************************************
10.0 GULP CLEAN
*******************************************************************************/

// Delete entire destination folders
gulp.task('clean', function(cb) {
    del([target.css_dest, target.js_dest, target.img_dest], cb)
});

/*******************************************************************************
0.0 GULP TASKS
*******************************************************************************/

gulp.task('default', ['htmlpage','styles','js-lint', 'scripts', 'imagemin', 'browser-sync', 'watch']);


/*******************************************************************************
0.1 RESERVES
*******************************************************************************/
// Handling errors without plumber
//.on('error', console.error.bind(console))

