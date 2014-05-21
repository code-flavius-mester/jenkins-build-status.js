teamcity-build-status.js
========================

jQuery widget to display build status of projects in Team City

[![Build Status](https://drone.io/github.com/code-computerlove/teamcity-build-status.js/status.png)](https://drone.io/github.com/code-computerlove/teamcity-build-status.js/latest)

### Requirements
Requires the TeamCity REST plugin to be installed and CORS to be enabled (see [here](http://confluence.jetbrains.com/display/TW/REST+API#RESTAPI-CORSSupport))

### Usage

``` js 
  $('#myDiv').teamCityBuildStatus({
			teamcityUrl : 'http://teamcityUrl',
			projectId : 'project90',
			refreshTimeout : 10000
	});
```
**teamcityUrl** -  base url of your team city instance  
**projectId** -  id of the project in team city  
**refreshTimeout** - the number of milliseconds between refreshing from the Team City api
	

