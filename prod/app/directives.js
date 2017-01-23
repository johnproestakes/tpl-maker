angular.module('templateMaker').directive('tplDate', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",ngChange:"&"},
    template: [
      "<input type=\"text\" ng-model=\"ngModel\" ng-change=\"ngChange()\"/>"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-date");
      });
    }
  };
}]);

angular.module('templateMaker')
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

				fileDropper.css({border: "",color:"", background: ""});
				};


			$timeout(function(){

			fileDropper.get(0).addEventListener('drop', function(evt){
				evt.stopPropagation();
    			evt.preventDefault();
				scope.$parent[attr.ondrop.replace("()", "")](evt);
				dropperReset(evt);
				}, false);
			fileDropper.get(0).addEventListener('dragend', dropperReset, false);
			fileDropper.get(0).addEventListener('dragleave', dropperReset, false);
			fileDropper.get(0).addEventListener('dragover', function(evt){
				evt.dataTransfer.dropEffect = 'copy';
				fileDropper.css({border: "solid 3px blue", color:"blue", background: "lightblue"});
				evt.preventDefault();
				}, false);


				});

			}
		};
	}]);

angular.module('templateMaker').directive('tplTextarea', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<textarea ng-model=\"ngModel\" ng-change=\"ngChange()\"></textarea>"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-textarea");
      });
    }
  };
}]);

angular.module('templateMaker').directive('tplTextbox', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<input type=\"text\" ng-model=\"ngModel\" ng-change=\"ngChange()\">"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-textbox");
      });
    }
  };
}]);
