(function($, undefined){

	$.fn.jenkinsBuildStatus = function(options){
		return this.each(function(){
			new JenkinsBuildStatus(this, options);
		});
	};

	var JenkinsBuildStatus = function(element, options){
		var projectBuild = new ProjectBuild(element, options),
			jenkinsAllJobsRepository = new JenkinsAllJobsRepository(options);
			
			buildStageFactory = new BuildStageFactory(projectBuild, jenkinsAllJobsRepository, options);
			
			jenkinsAllJobsRepository.getAllJobs(function(result){
					console.log(result);
				});

		function init(){
			jenkinsAllJobsRepository.getAllJobs(function(buildStages){
				buildStages.forEach(buildStageFactory.create);	
			// if (!!options.refreshTimeout){
			// 	setInterval(init, options.refreshTimeout);	
			// }
			});
		}

		init();
	};

	var ProjectBuild = function(element, options){
		var PROJECT_CLASS = 'project',
			projectElement = createElement(),
			failedBuilds = [];

		function createElement(){
			var title = $('<div>')
				.addClass('title')
				.text(options.projectName);
			return $('<div>')
				.attr('id', options.projectId)
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
					function filterProjectBuilds(element, index, array) {
					  if(element.name.indexOf(options.projectGroupName) == 0)
					  	subSet.push(element);
					}
					result.jobs.forEach(filterProjectBuilds);
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
				'aborted_anime' : 'FAILURE',
				
				
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
			console.log(statusClasses[color]);
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

	// var BuildStage = function(projectDisplay, options){	
	// 	var BUILD_STAGE_CLASS = 'build-stage',
	// 		branchName = !!options.branch ? 'branch:name:'+options.branch+',' : '',
	// 		buildStageStatusUrl = options.teamcityUrl + '/guestAuth/app/rest/builds?locator='+branchName+'buildType:(id:' + options.id + '),lookupLimit:10,running:any',
	// 		buildStageElement,
	// 		statusClasses = {
	// 			'FAILURE' : 'failed',
	// 			'SUCCESS' : 'success'
	// 		};

	// 	function init(){
	// 		show();
	// 		checkStatus();
	// 		if (!!options.refreshTimeout){
	// 			setInterval(checkStatus, options.refreshTimeout);	
	// 		}
	// 	}

	// 	function show(){
	// 		var nameElement = $('<span>')
	// 				.addClass('name')
	// 				.text(options.name);
	// 		buildStageElement = $('<div>')
	// 			.attr('id', options.id)
	// 			.addClass(BUILD_STAGE_CLASS)
	// 			.append(nameElement);
	// 		projectDisplay.showBuild(buildStageElement);
	// 	}

	// 	function checkStatus(){
	// 		$.ajax({
	// 			url : buildStageStatusUrl,
	// 			headers : {
	// 				accept : 'application/json'
	// 			},
	// 			success : function(statusResults){
	// 				if (statusResults.build.length > 0){
	// 					updateStatus(statusResults.build[0]);
	// 				}
	// 			}
	// 		});
	// 	};

	// 	function updateStatus(buildStatus){
	// 		buildStageElement
	// 			.prop('class', BUILD_STAGE_CLASS)
	// 			.addClass(statusClasses[buildStatus.status])
	// 			.toggleClass('running', !!buildStatus.running);
			
	// 		if (buildStatus.status === 'FAILURE'){
	// 			projectDisplay.hasFailed(options.id);
	// 		}
	// 		else {
	// 			projectDisplay.hasPassed(options.id);
	// 		}
	// 	}

	// 	init();
	// };
})(jQuery);