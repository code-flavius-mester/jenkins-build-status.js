(function($){
	var DISPLAY_AREA_DIV_ID = '#display';

	test('Requests build stages for project', function(done){
		var projectId = Math.random(),
			teamcityUrl = 'http://teamcity.dev' + Math.random(),
			requests = [];
		$.ajax = function(options){
			requests.push(options);
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : teamcityUrl,
			projectId : projectId
		});
		equal(requests[0].url, teamcityUrl + '/guestAuth/app/rest/projects/id:' + projectId);
	});

	test('Adds project id as id of project element', function(done){
		var projectId = 'project90',
			requests = [];
		$.ajax = function(options){
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : projectId
		});
		equal($(DISPLAY_AREA_DIV_ID).find('#' + projectId + '.project').length, 1);
	});

	test('Requests build stages in JSON', function(){
		var requests = [];
		$.ajax = function(options){
			requests.push(options);
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		equal(requests[0].headers.accept, 'application/json');
	});

	test('Displays build stage of project that contains one build stage', function(){
		var buildStageName = 'a stage ' + Math.random(),
			buildStageId = 'bt309';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : buildStageName
							}
						]
					}
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var displayedBuildStageName = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage .name').text();
		equal(displayedBuildStageName, buildStageName);
	});

	test('Displays second build stage of project that contains multiple build stages', function(){
		var buildStageName = 'a stage ' + Math.random(),
			buildStageId = 'bt309';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{
								id : 'anId',
								name : 'name'
							},
							{ 
								id : buildStageId,
								name : buildStageName
							}
						]
					}
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var displayedBuildStageName = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage .name').text();
		equal(displayedBuildStageName, buildStageName);
	});

	test('Retrieves status of build stage in JSON', function(){
		var buildStageStatusOptions;
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : '12',
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				buildStageStatusOptions = options;
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		equal(buildStageStatusOptions.headers.accept, 'application/json');
	});

	test('Retrieves status of two build stages', function(){
		var buildStageStatus,
			teamcityUrl = 'teamcityUrl',
			buildStageStatusRequests = [],
			buildStages = [
				{ 
					id : 'bt1',
					name : 'aBuildStage1'
				},
				{ 
					id : 'bt2',
					name : 'aBuildStage2'
				}
			];
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : buildStages
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				buildStageStatusRequests.push(options.url);
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : teamcityUrl,
			projectId : 'projectId'
		});
		equal(buildStageStatusRequests[0], teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+buildStages[0].id+'),lookupLimit:2,running:any');
		equal(buildStageStatusRequests[1], teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+buildStages[1].id+'),lookupLimit:2,running:any');
	});

	test('Display shows failing build stage', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : [
						{status : 'FAILURE'}
					]
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		ok(hasFailed);
	});

	test('Display of passing build does not show failure', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : [
						{status : 'SUCCESS'}
					]
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		equal(hasFailed, false);
	});

	test('Display of passing build shows success', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : [
						{status : 'SUCCESS'}
					]
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		ok(hasPassed);
	});

	test('Display of failed build does not show success', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : [
						{status : 'FAILURE'}
					]
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		equal(hasPassed, false);
	});

	test('Display of no builds show nothing', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : [
							{ 
								id : buildStageId,
								name : 'name'
							}
						]
					}
				});
			}
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : []
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		equal(hasPassed, false);
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		equal(hasFailed, false);
	});
})(jQuery, undefined);