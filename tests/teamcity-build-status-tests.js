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

	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(options);
		});
	};

	var TeamCityBuildStatus = function(options){
		var buildStageRepository = new BuildStageRepository(options),
			GET_BUILD_STAGES_URL = '/guestAuth/app/rest/projects/id:';

		function init(){
			buildStageRepository.getAll();
		}

		init();
	};

	var BuildStageRepository = function(options){
		var GET_BUILD_STAGES_URL = '/guestAuth/app/rest/projects/id:';

		this.getAll = function(){
			$.ajax({
				uri : options.teamcityUrl + GET_BUILD_STAGES_URL + options.projectId,
				headers : {
					accept : 'application/json'
				}
			});
		};
	};
})(jQuery, undefined);