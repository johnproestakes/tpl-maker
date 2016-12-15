angular.module('TemplateMaker')
.factory('TemplateFactory',function(){
	var TemplateFactory = this;
	this.readFile =function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				//TemplateFactory.updateFields(evt.target.result);
				
				var binary = evt.target.result;
				TemplateFactory.binaryFiles.push(binary);
				TemplateFactory.extractFields(binary);
				if(i < files.length-1){
					TemplateFactory.readFile(files,i+1, $scope);
					} else {
						$scope.$apply(function(){
						$scope.fields = TemplateFactory.updateFields();
						});
						}
			};
			reader.readAsBinaryString(files[i]);
		};
	this.exportTemplate =function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				//TemplateFactory.updateFields(evt.target.result);
				setTimeout(function(){
				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				console.log(data);
				$scope.$apply(function(){
					$scope.exported.push("export_"+files[i].name);
				});
					TemplateFactory.downloadFile(data, "export_"+files[i].name);
				}, 1500*i);
				console.log(i);
				if(i < files.length-1){
					TemplateFactory.exportTemplate(files, i+1, $scope);
					} else {
						//done
						}
			};
			reader.readAsBinaryString(files[i]);
		};
	this.exportDownloadSingleTemplate =function(file, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				setTimeout(function(){
				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				TemplateFactory.downloadFile(data, "export_"+file.name);
				}, 500);
			};
			reader.readAsBinaryString(file);
		};
	this.exportPreviewBrowserTemplate =function(file, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				
				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				setTimeout(function(){
					var win = window.open("about:blank", "template-preview");
					win.document.write( data );
				},500);
				
			};
			reader.readAsBinaryString(file);
		};
	this.exportFields = function(fields){
		var data = JSON.stringify(fields);
		window.saveAs(new Blob([data], {type:"application/json;charset=utf-8"}), "export_fields.json");
		
		};
	this.exportAll = function(files, $scope){
		
		TemplateFactory.exportTemplate(files, 0, $scope);
		};
	this.downloadFile = function(data, fileName){
		window.saveAs(new Blob([data], {type:"text/html;charset=utf-8"}), fileName);
		};
	this.extractAllFields = function(files,$scope){
		var a = [];
		TemplateFactory.fields =[];
		TemplateFactory.binaryFiles =[];
			return TemplateFactory.readFile(files, 0, $scope);
		};
	this.importFieldValues = function(text){
		var data = JSON.parse(text);
		var output = [];
		
		return data;
		};
	this.binaryFiles = [];
	this.fields = [];
	this.extractFields = function(str){
		var result = str.match(/\#([0-9a-zA-Z\{\}\;\_]+[\:\t\e\x\t\a\r\e\a]?)+\#/gi);
		if (result && result.length > 0) {
			$.each(result.getUnique(), function(key,value){
				TemplateFactory.fields.push(value);
				});
				
			}
			
		return result;
		};
	this.updateFields = function(){
		var output = [];
		TemplateFactory.fields.sort();
        $.each(TemplateFactory.fields.getUnique(), function(key,value) {
            var item = {};
				item.name = value;
				item.model = "";
				item['data_replace'] = value.toLowerCase();
				item.value= localStorage.getItem(value) ? unescape(localStorage.getItem(value)) : "";
				item.type = "text";
				item.clean = item.name.replace(/\#/g, "").trim();
			if (value.indexOf(":textarea") > 0) {
                item.type = "textarea";
				item.value = item.value.replace(/\/\/Q/g, '"');
            } else if(value.indexOf("{") > 0 &&  value.indexOf("}") > 0) {
				item.type="choose";
				item.options = value.substring(value.indexOf("{")+1, value.length-2).split(";");
				} else {
				item.value = item.value.replace(/\/\/Q/g, '\"');				
				}
			output.push(item);
        });
    
		console.log(output);
		return output;
		};
	this.generateTemplate = function(preview, fields){
		var output = preview;
		$.each(fields, function(key, value){
			var str = new RegExp(value.data_replace, "g");
			output = output.replace(str, value.value);
			});
			return output;
		};
	return TemplateFactory;
	});