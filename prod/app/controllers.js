angular.module("templateMaker").controller('MainController', [
  "$scope",
  'TemplateFactory',
  '$Export',
  '$Fields',
  '$UserManagement','$PersistJS',
function($scope, TemplateFactory, $Export,$Fields,$UserManagement,$PersistJS){


  $scope.blankSlate = function(){
    $scope.templateList=[];
    $scope.fields = [];
    $scope.exported = [];
    $scope.currentView = 1;
    $scope.livePreview = "";
    $scope.canLivePreview = false;
    location.href="#/main";
  };

  var debounce = null;

  $scope.logOut = function(){
    $scope.loginAsOther();
    $scope.sessionUserEmail = "";
    $UserManagement.logOut();

    if(location.hasOwnProperty("reload")){
      location.reload();
    } else {
      document.location.href = document.location.href;

    }
  };
  $scope.loginAsOther = function(){
    clearTimeout($scope.loginTimer);
    delete $scope.loginTimer;
  };

  if($UserManagement.hasSavedSessionId()){
    if($UserManagement.isValidEmailAddress($UserManagement.sessionId)) {
      $scope.sessionUserEmail = $UserManagement.sessionId;
      $scope.blankSlate();
      location.href="#/login";
      $scope.loginTimer = setTimeout(function(){
          location.href="#/main";
          $UserManagement.setCurrentUser($scope.sessionUserEmail);
        }, 1000);
      //autologin as xx
    } else {
      location.href="#/login";
      $scope.sessionUserEmail = "";
      }
    } else {
      location.href="#/login";
      $scope.sessionUserEmail = "";
    }

    window.addEventListener('hashchange', function(){
      if( $scope.sessionUserEmail == "" || !$UserManagement.hasSavedSessionId()) {
        location.href="#/login";
        //$scope.blankSlate();
        // $scope.sessionToken = 1;
      }
    });


  // Here are functions for the UI

  $scope.sessionUpdateUserEmail = function(email){
    $scope.errorMessage = "";

    if($UserManagement.isValidEmailAddress(email)) {
      $scope.sessionUserEmail = email;
      $UserManagement.setCurrentUser(email);
      $scope.blankSlate();
      location.href = "#/main";
    } else {
      // Error message
      $scope.errorMessage = "Sorry! You have to enter a valid email address.";
    }
  };
  $scope.showNavBar = function(){
    if(location.hash == '#/login') return false;
    else return true;
  };



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
      var outputFields = $Fields.tranformFieldStructure($scope.fields, "ungroup");

      $scope.$apply(function(){
        for(var i in droppedFields){
          if(droppedFields.hasOwnProperty(i)){
            for(n=0;n<outputFields.length;n++){
              if(outputFields[n].name==i){
                console.log(droppedFields[i]);
                if(outputFields[n].type=="repeat"){
                  outputFields[n].model = droppedFields[i];
                } else {
                  outputFields[n].model = droppedFields[i];
                  outputFields[n].value = droppedFields[i];
                }

              }
            }
          }
        }
        $scope.fields = $Fields.tranformFieldStructure(outputFields, "group");
      });
      setTimeout(function(){
        $scope.$apply(function(){
          $scope.isLoading = false;
        });
      }, 300);

	  };
    window.ga('send', 'event', "IMPORT", "field values", "Import field values");
		reader.readAsBinaryString(files[0]);
	};


	$scope.exportFields = function(){
		$Export.exportFields($scope.fields);
		};
	$scope.templateLoaded = function(){
		return $scope.templateList && $scope.templateList.length>0;
		};


  $scope.setLivePreviewTemplate = function(key){
    $scope.livePreview = key;
    // console.log($scope.livePreview);
    $scope.livePreviewName = $scope.templateList[key].name;
    // console.log($scope.templateList[key].name);
  };
	$scope.updateFieldValue = function (field, value){
		clearTimeout(debounce);
		debounce = setTimeout(function(){

      $scope.$apply(function(){
        field.value = field.model;
  			field.value = field.value.replace(/\"/g, "//Q");
        $PersistJS.set(field.name, field.value);

      });

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
