var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	git = require('gulp-git'),
	qunit = require('gulp-qunit'),
	terminal = require('child_process').exec;

gulp.task('dependencies', function(callback){
	terminal('node_modules/bower/bin/bower install', function (err, stdout, stderr) {
    	console.log(stdout);
    	console.log(stderr);
    	callback(err);
  	});
});

gulp.task('jshint', function(){
	return gulp
		.src(['src/pageboy.js', 'tests/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['dependencies'], function () {
	return gulp.src('./tests/**/*.html')
        .pipe(qunit());
});

gulp.task('minify', function(){
	return gulp
		.src('src/teamcity-build-status.js')
    	.pipe(uglify())
    	.pipe(rename('teamcity-build-status.min.js'))
    	.pipe(gulp.dest('src'));
});

gulp.task('push', ['test', 'minify'], function(){
	var commitMessage = gulp.env.m || 'no commit message';
	console.log('Tests passed! Pushing code...');
	return gulp
		.src('./.')
		.pipe(git.add())
		.pipe(git.commit(commitMessage))
		.pipe(git.push());
});

gulp.task('default', ['push']);