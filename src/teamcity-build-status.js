(function($, undefined){

	$.fn.jenkinsBuildStatus = function(options){
		return this.each(function(){
			new JenkinsBuildStatus(this, options);
		});
	};

	var JenkinsBuildStatus = function(element, options){
		var projectBuild = new ProjectBuild(element, options),
			jenkinsAllJobsRepository = new JenkinsAllJobsRepository(options),
			buildStageFactory = new BuildStageFactory(projectBuild, jenkinsAllJobsRepository, options);

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

	// var BuildStageRepository = function(options){
	// 	var GET_BUILD_STAGES_URL = '/view/All/api/json';

	// 	this.getAll = function(callback){
	// 		$.ajax({
	// 			url : options.teamcityUrl + GET_BUILD_STAGES_URL,
	// 			headers : {
	// 				accept : 'application/json'
	// 			}, 
	// 			success : function(result){
	// 				callback(result.jobs);
	// 			}
	// 		});
	// 	};
	// };

	var JenkinsAllJobsRepository = function(options){
		var GET_ALL_JOBS_URL = '/view/All/api/json';

		this.getAllJobs = function(callback){
			$.ajax({
				url : options.teamcityUrl + GET_BUILD_STAGES_URL,
				headers : {
					accept : 'application/json'
				}, 
				success : function(result){
					callback(result.jobs);
				}
			});
		};
	};

	var BuildStageFactory = function(projectDisplay, jenkinsAllJobsRepository, options){
		this.create = function(buildStage){
			return new BuildStage(projectDisplay, jenkinsAllJobsRepository, {
				jenkinsUrl : options.jenkinsUrl,
				groupName : buildStage.groupName,
				refreshTimeout : options.refreshTimeout,
				branch : options.branch
			})
		};
	};

	// var BuildStageFactory = function(projectDisplay, options){
	// 	this.create = function(buildStage){
	// 		return new BuildStage(projectDisplay, {
	// 			teamcityUrl : options.teamcityUrl,
	// 			id : buildStage.id,
	// 			name : buildStage.name,
	// 			refreshTimeout : options.refreshTimeout,
	// 			branch : options.branch
	// 		})
	// 	};
	// };

	var BuildStage = function(projectDisplay, jenkinsAllJobsRepository, options){	
		var BUILD_STAGE_CLASS = 'build-stage',
			branchName = !!options.branch ? 'branch:name:'+options.branch+',' : '',
			//buildStageStatusUrl = options.teamcityUrl + '/guestAuth/app/rest/builds?locator='+branchName+'buildType:(id:' + options.id + '),lookupLimit:10,running:any',
			buildStageElement,
			statusClasses = {
				'FAILURE' : 'failed',
				'SUCCESS' : 'success'
			};

		function init(){
			show();
			//TODO jenkinsAllJobsRepository get only the relavant jobs
			updateStatus();
			// checkStatus();
			// if (!!options.refreshTimeout){
			// 	setInterval(checkStatus, options.refreshTimeout);	
			// }
		}

		function show(){
			var nameElement = $('<span>')
					.addClass('name')
					.text(options.name);
			buildStageElement = $('<div>')
				.attr('id', options.groupName)
				.addClass(BUILD_STAGE_CLASS)
				.append(nameElement);
			projectDisplay.showBuild(buildStageElement);
		}

		// function checkStatus(){
		// 	$.ajax({
		// 		url : buildStageStatusUrl,
		// 		headers : {
		// 			accept : 'application/json'
		// 		},
		// 		success : function(statusResults){
		// 			if (statusResults.build.length > 0){
		// 				updateStatus(statusResults.build[0]);
		// 			}
		// 		}
		// 	});
		// };

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