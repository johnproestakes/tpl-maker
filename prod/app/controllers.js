angular.module("templateMaker").controller('MainController', [ "$scope", 'TemplateFactory','$Export','$Fields',
function($scope, TemplateFactory, $Export,$Fields){


  $scope.blankSlate = function(){
    $scope.templateList=[];
    $scope.fields = [];
    $scope.exported = [];
    $scope.currentView = 1;
  };

  var debounce = null;


  $scope.sessionCode = 0;
  if($scope.sessionCode==0){
    //set blank
    location.href="#/main";
    $scope.blankSlate();
    $scope.sessionCode=1;
  } else {

  }

  $scope.navigateTo = function(n){
    location.href=n;
  }

  $scope.areAllFieldsCompleted = function(){
    return $Fields.areAllFieldsCompleted($scope);
  };
  $scope.dropTemplateFiles = function(evt){
	  var files = evt.dataTransfer.files; // FileList object.
	  $scope.templateList=files;
    var reader = new FileReader();
	  reader.onloadend = function(evt){
		  var dropText = evt.target.result;
      $scope.preview = dropText;
			$scope.exported=[];
			$scope.getFieldList();
      setTimeout(function(){
        $scope.navigateTo('#/fields');

      }, 1000);

	  };
		reader.readAsBinaryString(files[0]);
	};


	$scope.exportFields = function(){
		$Export.exportFields($scope.fields);
		};
	$scope.templateLoaded = function(){
		return $scope.templateList && $scope.templateList.length>0;
		};

	$scope.updateFieldValue = function (field, value){
		clearTimeout(debounce);
		debounce = setTimeout(function(){
      $scope.$apply(function(){
        for(var i = 0; i<$scope.fields.length; i++){
          if(!$scope.fields[i].hasOwnProperty("value")) $scope.fields[i].value = "";
          $scope.fields[i].value = $scope.fields[i].model;
          localStorage.setItem($scope.fields[i].name, $scope.fields[i].value);
        }
      });

      // console.log(field.name, field.model);
      // $scope.apply(function(){
      //   field.value = field.model;
  		// 	field.value = field.value.replace(/\"/g, "//Q");
  		//
      // });

			//$scope.generated = TemplateFactory.generateTemplate($scope.preview, $scope.fields);
			},300);
		};


	$scope.clearText = function(model){
    $scope[model] = ""; $scope.getFieldList();
  };

	$scope.exportDownloadSingleFile = function(file){
		$Export.exportDownloadSingleTemplate(file, $scope);

		};
  $scope.exportAllTemplates = function(){
		$Export.exportAll($scope.templateList, $scope);
		};
  $scope.previewHTML=function(file){
		$Export.exportPreviewBrowserTemplate(file, $scope);

		};

	$scope.importFieldValues = function(text){
		$scope.fields = TemplateFactory.importFieldValues(text);
		};


  $scope.getFieldList  = function(){
		TemplateFactory.extractAllFields($scope.templateList, $scope);
		//$scope.fields = TemplateFactory.updateFields(TemplateFactory.fields);
			//$scope.generated = TemplateFactory.generateTemplate($scope.preview, $scope.fields);
			}
}]);