(function($, undefined){

	$.fn.jenkinsBuildStatus = function(options){
		return this.each(function(){
			new JenkinsBuildStatus(this, options);
		});
	};

	var JenkinsBuildStatus = function(element, options){
		
		function init(){
			$("div[id='" + element.id + "']").children().remove();		

			var projectBuild = new ProjectBuild(element, options);
			var jenkinsAllJobsRepository = new JenkinsAllJobsRepository(options);			
			var buildStageFactory = new BuildStageFactory(projectBuild, jenkinsAllJobsRepository, options);

			jenkinsAllJobsRepository.getAllJobs(function(buildStages){				
				buildStages.forEach(buildStageFactory.create);			
			});
			
		}
		init();
		if (!!options.refreshTimeout){
				setInterval(init, options.refreshTimeout);	
		}
	};

	var ProjectBuild = function(element, options){
		var PROJECT_CLASS = 'project',
			projectElement = createElement(),
			failedBuilds = [];

		function createElement(){
			var title = $('<div>')
				.addClass('title')
				.text(options.projectGroupName);
			return $('<div>')
				.attr('id', options.projectGroupName)
				.addClass(PROJECT_CLASS)
				.addClass('success')
				.append(title)
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

	var JenkinsAllJobsRepository = function(options){
		var GET_ALL_JOBS_URL = '/view/All/api/json';

		this.getAllJobs = function(callback){
			$.ajax({
				url : options.jenkinsyUrl + GET_ALL_JOBS_URL,
				headers : {
					accept : 'application/json'
				}, 
				success : function(result){
					var subSet = [];
					
					result.jobs.forEach(function filterProjectBuilds(element, index, array) {
					  if(element.name.indexOf(options.projectGroupName) == 0)
					  	subSet.push(element);
					});
					callback(subSet);
				}
			});
		};
	};

	var BuildStageFactory = function(projectDisplay, options){
		this.create = function(jobData){
			return new BuildStage(projectDisplay, jobData)
		};
	};

	var BuildStage = function(projectDisplay, jobData){	
		var BUILD_STAGE_CLASS = 'build-stage',
			buildStageElement,
			statusClasses = {
				'red' : 'FAILURE',
				'red_anime' : 'FAILURE',

				'blue' : 'SUCCESS',
				'blue_anime' : 'SUCCESS', 

				'notbuilt' : 'FAILURE',
				'notbuilt_anime' : 'FAILURE',

				'aborted' : 'FAILURE',
				'aborted_anime' : 'FAILURE'		
				
			};

		function init(){
			show();
			updateStatus(jobData.color);			
		}

		function show(){
			var nameElement = $('<span>')
					.addClass('name')
					.text(jobData.name);
			buildStageElement = $('<div>')
				.attr('id', jobData.name)
				.addClass(BUILD_STAGE_CLASS)
				.append(nameElement);
			projectDisplay.showBuild(buildStageElement);
		}

		function updateStatus(color){
			buildStageElement
				.prop('class', BUILD_STAGE_CLASS)
				.addClass(statusClasses[color])
				.toggleClass('running', color.lastIndexOf("anime") !== -1);
			
			if (statusClasses[color] === 'FAILURE'){
				projectDisplay.hasFailed(jobData.name);
			}
			else {
				projectDisplay.hasPassed(jobData.name);
			}
		}

		init();
	};

})(jQuery);