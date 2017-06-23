angular.module("templateMaker").controller('MainController', [ "$scope", 'TemplateFactory','$Export','$Fields',
function($scope, TemplateFactory, $Export,$Fields){


  $scope.testField = {model: ""};

  $scope.blankSlate = function(){
    $scope.templateList=[];
    $scope.fields = [];
    $scope.exported = [];
    $scope.currentView = 1;
    location.href="#/main";
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

  $scope.isLoading = false;
  $scope.navigateTo = function(n){
    location.href=n;
  }

  $scope.areAllFieldsCompleted = function(){
    return $Fields.areAllFieldsCompleted($scope);
  };
  $scope.dropTemplateFiles = function(evt){
    $scope.isLoading = true;
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
        $scope.isLoading = false;
      }, 500);

	  };
		reader.readAsBinaryString(files[0]);
	};

  $scope.dropImportFieldValues = function(evt){
    $scope.isLoading = true;
	  var files = evt.dataTransfer.files; // FileList object.
	  $scope.templateList=files;
    var reader = new FileReader();
	  reader.onloadend = function(evt){
		  var droppedFields = JSON.parse(evt.target.result);
      $scope.$apply(function(){
        for(var i in droppedFields){
          if(droppedFields.hasOwnProperty(i)){
            for(n=0;n<$scope.fields.length;n++){
              if($scope.fields[n].name==i){
                console.log(droppedFields[i]);
                if($scope.fields[n].type=="repeat"){
                  $scope.fields[n].model = droppedFields[i];
                } else {
                  $scope.fields[n].model = droppedFields[i];
                  $scope.fields[n].value = droppedFields[i];
                }

              }
            }
          }
        }
      });
      setTimeout(function(){
        $scope.$apply(function(){
          $scope.isLoading = false;
        });
      }, 300);

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
    window.ga('send', 'event', "EXPORT", "download", "Download Single File");
		};
  $scope.exportAllTemplates = function(){
		$Export.exportAll($scope.templateList, $scope);
    window.ga('send', 'event', "EXPORT", "download", "Download All Files");
		};
  $scope.previewHTML=function(file){
		$Export.exportPreviewBrowserTemplate(file, $scope);
    window.ga('send', 'event', "EXPORT", "preview", "Preview Single File");
		};


	$scope.importFieldValues = function(text){
		$scope.fields = TemplateFactory.importFieldValues(text);
    window.ga('send', 'event', "IMPORT", "field values", "Import field values");
		};


  $scope.getFieldList  = function(){
		TemplateFactory.extractAllFields($scope.templateList, $scope);
		//$scope.fields = TemplateFactory.updateFields(TemplateFactory.fields);
			//$scope.generated = TemplateFactory.generateTemplate($scope.preview, $scope.fields);
			}
}]);

angular.module("templateMaker").controller('TagBuilderController', [
  "$scope",'$Fields',
function($scope, $Fields){

  $scope.data = {
    tagName: "",
    tagType: "text",
    dateFormat: "longDate",
    timeFormat: "shortTime+ZZZ"
  };

$scope.fieldOptions = [];

console.log($Fields.fieldTypes);
for (var i in $Fields.fieldTypes){
  if($Fields.fieldTypes.hasOwnProperty(i)){
    var output = {label: "", value: i };
    output.label = $Fields.fieldTypes[i].label ? $Fields.fieldTypes[i].label : "NEEDS LABEL";
    $scope.fieldOptions.push(output);
  }
}

console.log($scope.fieldOptions);

$scope.removeSpecialCharacters = function(title){
  var output = "";
  var pattern = /[a-zA-Z0-9\_]/;

  title = title.trim().toLowerCase();
  for(var l = 0; l < title.length; l++){
    if(pattern.test(title[l])) {


      output = output + title[l];
    } else {
      if(title[l] == " ") output = output + "_";
    }
  }
  console.log(title, output);
  output = output.replace(/\_{2,3}/g, "");
  return output;
};
$scope.updateNameFromLabel = function(label){

  if($scope.data.tagName === undefined || $scope.data.tagName == ""){
    $scope.data.tagName = $scope.removeSpecialCharacters(label);
  }
};
$scope.canAccessParameter = function(type){
  if($Fields.fieldTypes[$scope.data.tagType] && $Fields.fieldTypes[$scope.data.tagType].parameters.indexOf(type)>-1){
    return true;
  } else {
    return false;
  }

};
$scope.dateFormat = {
  custom: false,
  value: "longDate",
  options: ["shortDate", "longDate","mediumDate", "fullDate", "MMMM","EEEE"]
};
$scope.getDatePreview = function(format){

  var field = {value: "2018-03-25" };
  var replaceAttr = {format: format};
  return $Fields.fieldTypes["date"].renderField(field,replaceAttr,"");
};
$scope.timeFormat = {
  custom: false,
  value: "shortTime+ZZZ",
  options: ["shortTime+ZZZ", "shortTime","optumTime+ZZZ", "optumTime"]
};
$scope.getTimePreview = function(format){

  var field = {value: "12:00 PM EST" };
  var replaceAttr = {format: format};
  return $Fields.fieldTypes["time"].renderField(field,replaceAttr,"");
};
$scope.resetForm = function(){
  $scope.data = {
    tagName: "",
    tagType: "text",
    dateFormat: "longDate",
    timeFormat: "shortTime+ZZZ"
  };
};
$scope.getNumericOnly = function(text){
  var output = "";
  for(var i =0; i<text.length; i++){
    var pattern = /[0-9]/;
    if(pattern.test(text[i])){
      output = output + text[i];
    }
  }
  return output;
};
$scope.renderedPreview = function(){

//clean name...

var output = "{{ ";
output = output + $scope.removeSpecialCharacters($scope.data.tagName ? $scope.data.tagName : "" );
output = output + ($scope.data.tagLabel ? " | label: \"" + $scope.data.tagLabel + "\"": "");
output = output + ($scope.data.tagType !== "text" ? " | " + $scope.data.tagType : "");
output = output + ($scope.canAccessParameter('dateFormat') && $scope.data.dateFormat !== undefined ? ": \"" + $scope.data.dateFormat + "\"" : "");
output = output + ($scope.canAccessParameter('timeFormat') && $scope.data.timeFormat !== undefined ? ": \"" + $scope.data.timeFormat + "\"" : "");
output = output + ($scope.data.tagType=="repeat" ? ": ` REPEATING CONTENT GOES HERE  `" : "");
output = output + ($scope.canAccessParameter('length') && $scope.data.tagLength !== undefined ? " | length: " + $scope.getNumericOnly($scope.data.tagLength) : "");
output = output + ($scope.data.tagInstructions ? " | instructions: \"" + $scope.data.tagInstructions + "\"": "");
output = output + ($scope.data.tagRequired ? " | required": "");

// output = output + ($scope.data.tagType ? " | " + $scope.data.tagType : "");



output = output + " }}";


  return output;
};

}]);
