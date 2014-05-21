(function($, undefined){

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
				url : options.teamcityUrl + GET_BUILD_STAGES_URL + options.projectId,
				headers : {
					accept : 'application/json'
				}, 
				success : function(result){
					callback(result.buildTypes.buildType);
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
				url : buildStageStatusUrl,
				headers : {
					accept : 'application/json'
				},
				success : function(statusResults){
					if (statusResults.build.length > 0){
						var buildStatus = statusResults.build[0].status;
						buildStageElement
							.removeClass('success')
							.removeClass('failed')
							.addClass(statusClasses[buildStatus]);
					}
				}
			});
		};

		show();
		checkStatus();
	};
})(jQuery);