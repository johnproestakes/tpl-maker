// JavaScript Document
angular.module('TemplateMaker')
.controller('MainController', [ "$scope", 'TemplateFactory', function($scope, TemplateFactory){
	$scope.dropTemplateFiles = function(evt){
		console.log(evt);
	var files = evt.dataTransfer.files; // FileList object.
	$scope.templateList=files;

    var reader = new FileReader();
	reader.onloadend = function(evt){
		var dropText = evt.target.result;
		
			$scope.preview = dropText;
			$scope.exported=[];
			$scope.getFieldList();
			$scope.setCurrentView(2);
			
			};
		reader.readAsBinaryString(files[0]);
		console.log("YAY");
		};
	$scope.fields = [];
	var debounce = null;
	$scope.templateList=[];
	$scope.removeTemplate = function(id){
		
		$scope.templateList.splice(id,1);
		
		console.log($scope.templateList);
		};
	$scope.clearTemplates = function(){
		$scope.templateList = [];
		$scope.fields = [];
		$scope.currentView = 1;
		};
	$scope.exportFields = function(){
		TemplateFactory.exportFields($scope.fields);
		};
	$scope.templateLoaded = function(){
		return $scope.preview && $scope.preview.length>0;
		};
	$scope.updateFieldValue = function (field, value){
		clearTimeout(debounce);
		debounce = setTimeout(function(){
			value = escape(value);
			value = value.replace(/\"/g, "//Q");
			localStorage.setItem(field, value);
			$scope.generated = TemplateFactory.generateTemplate($scope.preview, $scope.fields);
			},300);
		};
	$scope.exported = [];
	$scope.exportAllTemplates = function(){
		TemplateFactory.exportAll($scope.templateList, $scope);		
		};
	$scope.clearText = function(model){
		$scope[model] = "";
		$scope.getFieldList();
		};
	$scope.currentView = 1;
	$scope.setCurrentView = function(num){
		$scope.currentView = num;
		};
	$scope.exportDownloadSingleFile = function(file){
		TemplateFactory.exportDownloadSingleTemplate(file, $scope);
		
		};
	$scope.importFieldValues = function(text){
		$scope.fields = TemplateFactory.importFieldValues(text);
		};	
	$scope.previewHTML=function(file){
		TemplateFactory.exportPreviewBrowserTemplate(file, $scope);
		
		};
	$scope.getFieldList  = function(){
		TemplateFactory.extractAllFields($scope.templateList, $scope);
		//$scope.fields = TemplateFactory.updateFields(TemplateFactory.fields);
			//$scope.generated = TemplateFactory.generateTemplate($scope.preview, $scope.fields);
			}
	}]);