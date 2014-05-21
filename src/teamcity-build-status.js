(function($, undefined){

	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(this, options);
		});
	};

	var TeamCityBuildStatus = function(element, options){
		var PROJECT_CLASS = 'project',
			projectElement = $('<div>').attr('id', options.projectId).addClass(PROJECT_CLASS).appendTo(element),
			buildStageRepository = new BuildStageRepository(options),
			buildStageFactory = new BuildStageFactory(projectElement, this, options);

		function init(){
			buildStageRepository.getAll(function(buildStages){
				buildStages.forEach(buildStageFactory.create);	
			});
		}

		this.showFailure = function(){
			projectElement
				.prop('class', PROJECT_CLASS)
				.addClass('failed');
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

	var BuildStageFactory = function(projectElement, projectDisplay, options){
		this.create = function(buildStage){
			return new BuildStage(projectDisplay, {
				projectElement : projectElement,
				teamcityUrl : options.teamcityUrl,
				id : buildStage.id,
				name : buildStage.name
			})
		};
	};

	var BuildStage = function(projectDisplay, options){
		var BUILD_STAGE_CLASS = 'build-stage',
			buildStageStatusUrl = options.teamcityUrl + '/guestAuth/app/rest/builds?locator=buildType:(id:' + options.id + '),lookupLimit:10,running:any',
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
				.addClass(BUILD_STAGE_CLASS)
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
						updateStatus(statusResults.build[0]);
					}
				}
			});
		};

		function updateStatus(buildStatus){
			buildStageElement
				.prop('class', BUILD_STAGE_CLASS)
				.addClass(statusClasses[buildStatus.status])
				.toggleClass('running', !!buildStatus.running);
			if (buildStatus.status === 'FAILURE'){
				projectDisplay.showFailure();
			}
		}

		show();
		checkStatus();
	};
})(jQuery);