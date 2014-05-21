(function($, undefined){

	$.fn.teamCityBuildStatus = function(options){
		return this.each(function(){
			new TeamCityBuildStatus(this, options);
		});
	};

	var TeamCityBuildStatus = function(element, options){
		var projectBuild = new ProjectBuild(element, options),
			buildStageRepository = new BuildStageRepository(options),
			buildStageFactory = new BuildStageFactory(projectBuild, options);

		function init(){
			buildStageRepository.getAll(function(buildStages){
				buildStages.forEach(buildStageFactory.create);	
			});
		}

		init();
	};

	var ProjectBuild = function(element, options){
		var PROJECT_CLASS = 'project',
			projectElement = createElement(),
			failedBuilds = [];

		function createElement(){
			return $('<div>')
				.attr('id', options.projectId)
				.addClass(PROJECT_CLASS)
				.addClass('success')
				.appendTo(element)
		}

		this.hasFailed = function(buildStageId){
			projectElement
				.prop('class', PROJECT_CLASS)
				.addClass('failed');
			if (failedBuilds.indexOf(buildStageId) === -1){
				failedBuilds.push(buildStageId);
			}
		};

		this.hasPassed = function(buildStageId){
			var index = failedBuilds.indexOf(buildStageId);
			if (index !== -1){
				failedBuilds.splice(index, 1);
				if (failedBuilds.length === 0){
					projectElement
						.prop('class', PROJECT_CLASS)
						.addClass('success');
				}
			}
		};

		this.showBuild = function(buildElement){
			projectElement.append(buildElement);
		};
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

	var BuildStageFactory = function(projectDisplay, options){
		this.create = function(buildStage){
			return new BuildStage(projectDisplay, {
				teamcityUrl : options.teamcityUrl,
				id : buildStage.id,
				name : buildStage.name,
				refreshTimeout : options.refreshTimeout
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

		function init(){
			show();
			checkStatus();
			if (!!options.refreshTimeout){
				setInterval(checkStatus, options.refreshTimeout);	
			}
		}

		function show(){
			var nameElement = $('<span>')
					.addClass('name')
					.text(options.name);
			buildStageElement = $('<div>')
				.attr('id', options.id)
				.addClass(BUILD_STAGE_CLASS)
				.append(nameElement);
			projectDisplay.showBuild(buildStageElement);
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
				projectDisplay.hasFailed(options.id);
			}
			else {
				projectDisplay.hasPassed(options.id);
			}
		}

		init();
	};
})(jQuery);