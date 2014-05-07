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
		var buildStageName = 'a stage ' + Math.random();
		$.ajax = function(options){
			if (options.uri.indexOf('/guestAuth/app/rest/projects/id:') > 0){
				options.success({
					buildTypes : [
						{ name : buildStageName }
					]
				});
			}
		};
		$(DISPLAY_AREA_DIV_ID).teamCityBuildStatus({
			teamcityUrl : 'teamcityUrl',
			projectId : 'projectId'
		});
		var displayedBuildStageName = $(DISPLAY_AREA_DIV_ID).find('.project .build-stage .name').text();
		equal(displayedBuildStageName, buildStageName);
	});

	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(this, options);
		});
	};

	var TeamCityBuildStatus = function(element, options){
		var projectElement = $('<div>').addClass('project').appendTo(element),
			buildStageRepository = new BuildStageRepository(options),
			buildStageDisplay = new BuildStageDisplay(projectElement);

		function init(){
			buildStageRepository.getAll(function(buildStages){
				buildStageDisplay.show(buildStages[0]);
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
					callback([{
						name: result.buildTypes[0].name
					}]);
				}
			});
		};
	};
})(jQuery, undefined);