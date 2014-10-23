(function($){
	var DISPLAY_AREA_DIV_ID = '#display';

	test('Displays project name in title', function(done){
		var projectName = 'name'+Math.random(),
			teamcityUrl = 'http://teamcity.dev' + Math.random(),
			requests = [];
		$.ajax = function(options){};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			projectName : projectName
		});
		var title = $(DISPLAY_AREA_DIV_ID).find('div.title');
		equal(title.text(), projectName);
	});

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
			buildStageId = 'bt309',
			oneBuildStageResult = [
				{ 
					id : buildStageId,
					name : buildStageName
				}
			];
		$.ajax = new FakeProjectAjaxRequestHandler(oneBuildStageResult).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var displayedBuildStageName = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage .name').text();
		equal(displayedBuildStageName, buildStageName);
	});

	test('Displays second build stage of project that contains multiple build stages', function(){
		var buildStageName = 'a stage ' + Math.random(),
			buildStageId = 'bt309',
			multipleBuildStagesResult = [
				{
					id : 'anId',
					name : 'name'
				},
				{ 
					id : buildStageId,
					name : buildStageName
				}
			];
		$.ajax = new FakeProjectAjaxRequestHandler(multipleBuildStagesResult).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var displayedBuildStageName = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage .name').text();
		equal(displayedBuildStageName, buildStageName);
	});

	test('Retrieves status of build stage in JSON', function(){
		var buildStageStatusOptions,
			mockBuildStageRequestHandler = new MockBuildStageRequestHandler(),
			fakeBuildStagesResult = [
				{ 
					id : '12',
					name : 'name'
				}
			];
		$.ajax = new FakeProjectAjaxRequestHandler(fakeBuildStagesResult, mockBuildStageRequestHandler).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		equal(mockBuildStageRequestHandler.requestOptions[0].headers.accept, 'application/json');
	});

	test('Retrieves status of two build stages', function(){
		var buildStageStatus,
			teamcityUrl = 'teamcityUrl',
			mockBuildStageRequestHandler = new MockBuildStageRequestHandler(),
			twoBuildStages = [
				{ 
					id : 'bt1',
					name : 'aBuildStage1'
				},
				{ 
					id : 'bt2',
					name : 'aBuildStage2'
				}
			];
		$.ajax = new FakeProjectAjaxRequestHandler(twoBuildStages, mockBuildStageRequestHandler).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : teamcityUrl,
			projectId : 'projectId'
		});
		equal(mockBuildStageRequestHandler.requestOptions[0].url, teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+twoBuildStages[0].id+'),lookupLimit:10,running:any');
		equal(mockBuildStageRequestHandler.requestOptions[1].url, teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+twoBuildStages[1].id+'),lookupLimit:10,running:any');
	});

	test('When branch is specified, Then url contains branch name', function(){
		var branchName = "A branch" + Math.random(),
			buildStageId = "bt1",
			teamcityUrl = 'teamcityUrl',
			mockBuildStageRequestHandler = new MockBuildStageRequestHandler(),
			buildStages = [
				{
					id : buildStageId,
					name : 'aBuildStage1'
				}
			];
		$.ajax = new FakeProjectAjaxRequestHandler(buildStages, mockBuildStageRequestHandler).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : teamcityUrl,
			projectId : 'projectId',
			branch : branchName
		});
		equal(mockBuildStageRequestHandler.requestOptions[0].url, teamcityUrl + '/guestAuth/app/rest/builds?locator=branch:name:'+branchName+',buildType:(id:'+buildStageId+'),lookupLimit:10,running:any');
	});

	test('Display shows failing build stage', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			failingBuildStage = new FakeBuildStageRequestHandler({status : 'FAILURE'});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, failingBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		ok(hasFailed);
	});

	test('Display of passing build does not show failure', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			successBuildStage = new FakeBuildStageRequestHandler({status : 'SUCCESS'});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, successBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		equal(hasFailed, false);
	});

	test('Display of passing build shows success', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			successBuildStage = new FakeBuildStageRequestHandler({status : 'SUCCESS'});;
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, successBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		ok(hasPassed);
	});

	test('Display of failed build does not show success', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			failingBuildStage = new FakeBuildStageRequestHandler({status : 'FAILURE'});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, failingBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		equal(hasPassed, false);
	});

	test('Display of no builds show nothing', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			noBuilds = new FakeBuildStageRequestHandler();
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, noBuilds).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('success');
		equal(hasPassed, false);
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('failed');
		equal(hasFailed, false);
	});

	test('Display of running build indicates it is currently running', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			runningBuild = new FakeBuildStageRequestHandler({ running : true });
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, runningBuild).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var isRunning = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('running');
		ok(isRunning);
	});

	test('Display of non-running build does not indicate it is currently running', function(){
		var buildStageId = 'bt12',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			nonRunningBuild = new FakeBuildStageRequestHandler({});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, nonRunningBuild).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var isRunning = $(DISPLAY_AREA_DIV_ID).find('.project #'+buildStageId+'.build-stage').hasClass('running');
		equal(isRunning, false);
	});

	test('Display of failed build shows project failure', function(){
		var buildStageId = 'bt12',
			projectId = 'bob1',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			failingBuildStage = new FakeBuildStageRequestHandler({status : 'FAILURE'});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, failingBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : projectId
		});
		var hasFailed = $(DISPLAY_AREA_DIV_ID).find('#' + projectId).hasClass('failed');
		ok(hasFailed);
	});

	test('Display of failed build hides project success', function(){
		var buildStageId = 'bt12',
			projectId = 'bob1',
			buildStage = [
				{ 
					id : buildStageId,
					name : 'name'
				}
			],
			failingBuildStage = new FakeBuildStageRequestHandler({status : 'FAILURE'});
		$.ajax = new FakeProjectAjaxRequestHandler(buildStage, failingBuildStage).handle;
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : projectId
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('#' + projectId).hasClass('success');
		equal(hasPassed, false);
	});

	test('As default displays project build success', function(done){
		var projectId = 'project90',
			requests = [];
		$.ajax = function(options){};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : projectId
		});
		var hasPassed = $(DISPLAY_AREA_DIV_ID).find('#' + projectId).hasClass('success');
		ok(hasPassed);
	});

	asyncTest('Display of failed build followed by success shows project success', function(){
		var buildStageId = 'bt12',
			projectId = 'bob1',
			completedFirstBuildTest = false;
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
						{status : completedFirstBuildTest ? 'SUCCESS' : 'FAILURE'}
					]
				});
				completedFirstBuildTest = true;
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : projectId,
			refreshTimeout : 200
		});
		setTimeout(function(){
			var hasPassed = $(DISPLAY_AREA_DIV_ID).find('#' + projectId).hasClass('success');
			ok(hasPassed);
			start();
		}, 1000);
	});

	var FakeProjectAjaxRequestHandler = function(result, nextRequestHandler){
		this.handle = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : {
						buildType : result
					}
				});
			}
			else{
				if (!!nextRequestHandler){
					nextRequestHandler.handle(options);
				}
			}
		};
	};

	var FakeBuildStageRequestHandler = function(result){
		this.handle = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				options.success({
					build : !!result ? [result] : []
				});
			}
		};
	};

	var MockBuildStageRequestHandler = function(){
		this.requestOptions = [];
		this.handle = function(options){
			if (options.url.indexOf('/guestAuth/app/rest/builds?locator=') > 0){
				this.requestOptions.push(options);
			}
		};
	};
})(jQuery, undefined);