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
		equal(requests[0].uri, teamcityUrl + '/guestAuth/app/rest/projects/id:' + projectId);
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : buildStageId,
							name : buildStageName
						}
					]
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{
							id : 'anId',
							name : 'name'
						},
						{ 
							id : buildStageId,
							name : buildStageName
						}
					]
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : '12',
							name : 'name'
						}
					]
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : buildStages
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
				buildStageStatusRequests.push(options.uri);
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : teamcityUrl,
			projectId : 'projectId'
		});
		equal(buildStageStatusRequests[0], teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+buildStages[0].id+'),lookupLimit:2,running:any');
		equal(buildStageStatusRequests[1], teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+buildStages[1].id+'),lookupLimit:2,running:any');
	});


	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(this, options);
		});
	};

	var TeamCityBuildStatus = function(element, options){
		var projectElement = $('<div>').attr('id', options.projectId).addClass('project').appendTo(element),
			buildStageRepository = new BuildStageRepository(options),
			buildStageDisplay = new BuildStageDisplay(projectElement);

		function init(){
			buildStageRepository.getAll(function(buildStages){
				buildStages.forEach(buildStageDisplay.show);
				buildStages.forEach(function(buildStage){
					$.ajax({
						uri : options.teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:'+buildStage.id+'),lookupLimit:2,running:any',
						headers : {
							accept : 'application/json'
						}
					});
				});
			});
		}

		init();
	};

	var BuildStageDisplay = function(projectElement){
		this.show = function(buildStage){
			var nameElement = $('<span>')
					.addClass('name')
					.text(buildStage.name);
			$('<div>')
				.attr('id', buildStage.id)
				.addClass('build-stage')
				.append(nameElement)
				.appendTo(projectElement);
		}
	};

	var BuildStageRepository = function(options){
		var GET_BUILD_STAGES_URL = '/guestAuth/app/rest/projects/id:';

		this.getAll = function(callback){
			$.ajax({
				uri : options.teamcityUrl + GET_BUILD_STAGES_URL + options.projectId,
				headers : {
					accept : 'application/json'
				}, 
				success : function(result){
					callback(result.buildTypes);
				}
			});
		};
	};
})(jQuery, undefined);