(function($){
	test('Requests build stages for project', function(done){
		var projectId = Math.random(),
			requests = [];
		$.ajax = function(options){
			requests.push(options);
		};
		$('#display').teamCityBuildStatus({
			projectId : projectId
		});
		equal(requests[0].uri, 'http://teamcity.dev/guestAuth/app/rest/projects/id:' + projectId);
	});

	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(options.projectId);
		});
	};

	var TeamCityBuildStatus = function(projectId){
		function init(){
			$.ajax({
				uri : 'http://teamcity.dev/guestAuth/app/rest/projects/id:' + projectId
			});
		}

		init();
	};
})(jQuery, undefined);