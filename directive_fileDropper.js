angular.module('TemplateMaker')
.directive('fileDropper', ['$timeout', function($timeout){
	return {
		restrict: "E",
		transclude: true,
		scope: {label: "@", ondrop:"&", dataTransferEvt:"="},
		template: "<div class=\"file-dropper\">{{label}}</div>",
		link: function(scope, el, attr){
			console.log(scope, el, attr);
			var fileDropper = el.find('.file-dropper');
			
			//reset
			var dropperReset = function(evt){
				evt.stopPropagation();
    			evt.preventDefault();
				
				fileDropper.css({border: "", background: ""});
				};
				
				
			$timeout(function(){
				
			fileDropper.get(0).addEventListener('drop', function(evt){
				evt.stopPropagation();
    			evt.preventDefault();
				scope.$parent[attr.ondrop.replace("()", "")](evt);
				//scope.dataTransferEvt = evt;
				//scope.ondrop({evt: scope.dataTransferEvt});	
				dropperReset(evt);
				}, false);
			fileDropper.get(0).addEventListener('dragend', dropperReset, false);
			fileDropper.get(0).addEventListener('dragleave', dropperReset, false);
			fileDropper.get(0).addEventListener('dragover', function(evt){
				evt.dataTransfer.dropEffect = 'copy'; 
				fileDropper.css({border: "solid 3px magenta", background: "pink"});
				evt.preventDefault();
				}, false);	
				
				
				});
			
			}
		};
	}]);