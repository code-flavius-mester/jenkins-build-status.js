var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	git = require('gulp-git');

gulp.task('jshint', function(){
	return gulp
		.src(['src/pageboy.js', 'tests/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function () {
	return gulp;
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