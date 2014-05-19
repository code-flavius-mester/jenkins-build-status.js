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

	test('Display shows failing build stage', function(){
		var buildStageId = 'bt12';
		$.ajax = function(options){
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : buildStageId,
							name : 'name'
						}
					]
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : buildStageId,
							name : 'name'
						}
					]
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : buildStageId,
							name : 'name'
						}
					]
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
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
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ 
							id : buildStageId,
							name : 'name'
						}
					]
				});
			}
			if (options.uri.indexOf('/guestAuth/app/rest/builds?locator=buildType') > 0){
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


	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(this, options);
		});
	};

	var TeamCityBuildStatus = function(element, options){
		var projectElement = $('<div>').attr('id', options.projectId).addClass('project').appendTo(element),
			buildStageRepository = new BuildStageRepository(options),
			buildStageFactory = new BuildStageFactory(projectElement, options);

		function init(){
			buildStageRepository.getAll(function(buildStages){
				buildStages.forEach(buildStageFactory.create);	
			});
		}

		init();
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

	var BuildStageFactory = function(projectElement, options){
		this.create = function(buildStage){
			return new BuildStage({
				projectElement : projectElement,
				teamcityUrl : options.teamcityUrl,
				id : buildStage.id,
				name : buildStage.name
			})
		};
	};

	var BuildStage = function(options){
		var buildStageStatusUrl = options.teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:' + options.id + '),lookupLimit:2,running:any',
			buildStageElement,
			statusClasses = {
				'FAILURE' : 'failed',
				'SUCCESS' : 'success'
			};

		function show(){
			var nameElement = $('<span>')
					.addClass('name')
					.text(options.name);
			buildStageElement = $('<div>')
				.attr('id', options.id)
				.addClass('build-stage')
				.append(nameElement)
				.appendTo(options.projectElement);
		}

		function checkStatus(){
			$.ajax({
				uri : buildStageStatusUrl,
				headers : {
					accept : 'application/json'
				},
				success : function(statusResults){
					var buildStatus = statusResults.build[0].status;
					buildStageElement.addClass(statusClasses[buildStatus]);
				}
			});
		};

		show();
		checkStatus();
	};
})(jQuery, undefined);