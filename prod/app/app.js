angular.module("templateMaker",['ngRoute']);

angular.module('templateMaker').factory('$Export', ['TemplateFactory','saveAs', function(TemplateFactory,saveAs){
  var self = this;

  this.previewWindow = null;

  this.exportTemplate = function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				//TemplateFactory.updateFields(evt.target.result);
				setTimeout(function(){
				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				$scope.$apply(function(){
					$scope.exported.push("export_"+files[i].name);
				});
        self.downloadFile(data, "export_"+files[i].name);
				}, 1500*i);
				console.log(i);
				if(i < files.length-1){
					self.exportTemplate(files, i+1, $scope);
					} else {
						//done
						}
			};
			reader.readAsBinaryString(files[i]);
		};
	this.exportDownloadSingleTemplate = function(file, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				setTimeout(function(){
				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				self.downloadFile(data, "export_"+file.name);
				}, 500);
			};
			reader.readAsBinaryString(file);
		};
	this.exportPreviewBrowserTemplate = function(file, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){

				var data = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
				setTimeout(function(){
          if(self.previewWindow !== null){
            //close and then reopen
            self.previewWindow.close();
          }
          self.previewWindow = window.open("about:blank", "template-preview");
          window.onunload = function(){
            self.previewWindow.close();
          };
          self.previewWindow.document.innerHTML = "";
					self.previewWindow.document.write( data );
				},500);

			};
			reader.readAsBinaryString(file);
		};
	this.exportFields = function(fields){
		var data = JSON.stringify(fields);
		saveAs(new Blob([data], {type:"application/json;charset=utf-8"}), "export_fields.json");

		};
	this.exportAll = function(files, $scope){
		self.exportTemplate(files, 0, $scope);
		};

  this.downloadFile = function(data, fileName){
		saveAs(new Blob([data], {type:"text/html;charset=utf-8"}), fileName);
		};


  return this;
}]);

angular.module("templateMaker")
.factory("$Fields", function $Fields(){
  var self = this;

  this.fieldPattern = /\#([0-9a-zA-Z\{\}\;\_]+[\:\t\e\x\t\a\r\e\a]?[\:\d\a\t\e]?)+\#/gi;

  this.extractFields = function(str){
    var vars = [];
    var result = str.match(self.fieldPattern);
    if (result && result.length > 0) {
      $.each(result.getUnique(), function(key,value){
        vars.push(value);
        });
      }
    return vars;
  };

  this.areAllFieldsCompleted = function($scope){
    var output = true;

    if($scope.fields.length==0){
      output = false;
    } else {
      for(var i=0; i<$scope.fields.length; i++){
        if($scope.fields[i].model==""){
          output = false;
        }
      }
    }

    return output;
  };
  this.processFields = function(fields){
    var output = [];
	  fields.sort();
    var items = fields.getUnique();

    for(var i in items){
      if(fields.hasOwnProperty(i)){
        var item = {
          "name": items[i],
          "model": "",
          "type": "text"
        };

        ["textarea","date"].forEach(function(type){
          if(item.name.indexOf(":"+type)>-1){
            item.type = type;
          }
        });

				item['data_replace'] = items[i].toLowerCase();
        item.clean = item.name.replace(/\#/g, "").trim();
        if(localStorage.getItem(items[i])){
          item.value = localStorage.getItem(items[i]) ? unescape(localStorage.getItem(items[i])) : "";
          item.value = item.value.replace(/\/\/Q/g, '\"');
          item.model = item.value;
        }


			  output.push(item);
        }
      }
		return output;
  };



  return this;
});

angular.module('templateMaker').factory(
  "saveAs", function saveAs(){
    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
    window.saveAs=window.saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}
  return window.saveAs;
  }
);

angular.module("templateMaker")
.factory('TemplateFactory',["saveAs","$Fields", function(saveAs, $Fields){
	var TemplateFactory = this;

  this.binaryFiles = [];
	this.fields = [];

	this.readFile = function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				//TemplateFactory.updateFields(evt.target.result);

				var binary = evt.target.result;
				TemplateFactory.binaryFiles.push(binary);
        TemplateFactory.fields = $Fields.extractFields(binary);
				if(i < files.length-1){
					TemplateFactory.readFile(files,i+1, $scope);
					} else {
						$scope.$apply(function(){
						$scope.fields = $Fields.processFields(TemplateFactory.fields);
						});
						}
			};
			reader.readAsBinaryString(files[i]);
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

	this.updateFields = function(){

		};
	this.generateTemplate = function(preview, fields){
		var output = preview;
		jQuery.each(fields, function(key, value){
			var str = new RegExp(value.data_replace, "g");
			output = output.replace(str, value.value);
			});
			return output;
		};

  return TemplateFactory;
	}]);
