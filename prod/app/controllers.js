angular.module("templateMaker").controller('MainController', [
  "$scope", '$UserManagement','$PersistJS','$TemplateMaker',
  function($scope, $UserManagement, $PersistJS, $TemplateMaker){

  $scope.appVersion = "1.1.0";
  $scope.isLoading = false;
  $scope.Workspace = null;
  $scope.project = null;
  
  $scope.blankSlate = function(){
    delete $scope.Workspace;
    $scope.Workspace = new $TemplateMaker.Workspace($scope);
    $scope.currentView = 1;
    // location.href="#/main";
  };
  $scope.blankSlate();

  $scope.SecureGateway = new $UserManagement.SecureGateway(function(){
    $scope.blankSlate();
    $scope.Workspace = new $TemplateMaker.Workspace($scope);
  });

  $scope.showNavBar = function(){
    if(location.hash == '#/login') return false;
    else return true;
  };

  $scope.navigateTo = function(n){
    location.href=n;
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
