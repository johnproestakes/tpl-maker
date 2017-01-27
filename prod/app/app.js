angular.module("templateMaker",['ngRoute','JupiterDragDrop']);

angular.module('templateMaker').factory('$Export', ['TemplateFactory','saveAs', function(TemplateFactory,saveAs){
  var self = this;

  this.previewWindow = null;
  this.removeTplIfs = function(data, fields){

    return data;
  };
  this.exportTemplate = function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){
				//TemplateFactory.updateFields(evt.target.result);
				setTimeout(function(){
				var data1 = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);

        var data = self.removeTplIfs(data1, $scope.fields);



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
				var data1 = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
        var data = self.removeTplIfs(data1, $scope.fields);
				self.downloadFile(data, "export_"+file.name);
				}, 500);
			};
			reader.readAsBinaryString(file);
		};
	this.exportPreviewBrowserTemplate = function(file, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){

				var data1 = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
        var data = self.removeTplIfs(data1, $scope.fields);

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
		//var data = JSON.stringify(fields);
    var output = {};
    for (var n=0; n<fields.length; n++){
      if(fields[n].type=="repeat"){
        output[fields[n].name] = fields[n].model;
      } else {
        output[fields[n].name] = fields[n].value;
      }

    }
		saveAs(new Blob([JSON.stringify(output)], {type:"application/json;charset=utf-8"}), "export_fields.json");

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
  this.fieldTypes = ["date","textarea","repeat","url"];
  this.fieldAttr = {"length":"=", "required":"+"};
  this.foundFields = [];
  this.foundFieldsProcessed = {};
  //this.fieldPattern = /\#([0-9a-zA-Z\{\}\;\_]+[\:\t\e\x\t\a\r\e\a]?[\:\d\a\t\e]?)+\#/gi;
  this.fieldPattern = /{{((\n|.)*?)}}/gi;

  this.extractFields = function(str, origin){
    var result = str.match(self.fieldPattern);
    if (result && result.length > 0) {
      console.log("extracting fields",result.getUnique());
      $.each(result.getUnique(), function(key,value){
        if(origin.indexOf(value) == -1){
          origin.push(value);
        }
        });
      }
    return origin;
  };

  this.extractRepeatingField = function(raw){
    var content = raw.match(/`((\n|.*)*)\`/igm);

    var output = {};
    output.fields = [];
    if(content.length>0){
      output.content = content[0].substr(1,content[0].length-2);
      //find fields in the repeat string
      var fields = output.content.match(/\#\#(.*?)\#\#/g);
      var fieldObjs = [];
      if(fields.length>0){
        for(var i=0; i<fields.length; i++){
          var f = self.getFieldFromRaw(fields[i].replace(/\#\#/g,""), false);
          f.data_replace = [fields[i], f.hasOwnProperty("format") ? {format: f.format} : {}];
          output.fields.push(f);
        }

      }
    }

    return output;
  };
  this.getFieldFromRaw = function(raw, loadLocal){
    if(loadLocal === null) loadLocal = true;

    var field = { model:"", value:"", type:"text" };
    field.name = ((raw.replace(/{{/g, "")).replace(/}}/g, "")).trim();

    if(field.name.indexOf("|")>-1){
      var sections = field.name.split("|");
      field.name = sections.shift().trim();
      //console.log(sections[0]);
      if(sections[0].trim().substr(0,6)=="repeat"){
        console.log(raw);
        field.model = [];
        field.type="repeat";
        // field.content = ;
        var a = self.extractRepeatingField(raw);
        field.content = a.content;
        field.fields = a.fields;
      } else {
        sections.forEach(function(section){
          section = section.trim();
          if(section.indexOf(":")>-1){
            section = section.split(":");
            for (var i = 0; i<section.length; i++){
              section[i] = (section[i].replace(/"/g, "")).trim();
            }

            if(self.fieldTypes.indexOf(section[0])>-1){
              field.type = section[0];
              field.format = section[1];
            } else {
              for(var e in self.fieldAttr){
                if(self.fieldAttr.hasOwnProperty(e) && section[0]==e){
                  if(self.fieldAttr[e]=="="){
                    field[section[0]] = section[1]*1;
                  } else if(self.fieldAttr[e]=="+"){
                    field[section[0]] = true;
                  } else {
                    field[section[0]] = section[1];
                  }

                }
              }

            }
          } else {
            if(self.fieldTypes.indexOf(section)>-1){
              field.type = section;
            }
          }
        });
      }

    }
    field.clean = field.name;

    if(loadLocal && localStorage.getItem(field.name)){
      if(field.type=="repeat"){
        try {
          field.model = localStorage.getItem(field.name) ? JSON.parse(localStorage.getItem(field.name)) : [];
        } catch (e) {
          localStorage.setItem(field.name, JSON.stringify([]));
          field.model = [];
        } finally {

        }
      } else {
        field.value = localStorage.getItem(field.name) ? unescape(localStorage.getItem(field.name)) : "";
        field.value = field.value.replace(/\/\/Q/g, '\"');
        field.model = field.value;
      }

    }
    return field;
  };

  this.areAllFieldsCompleted = function($scope){
    var output = true;

    if($scope.fields.length==0){
      output = false;
    } else {
      for(var i=0; i<$scope.fields.length; i++){
        if($scope.fields[i].hasOwnProperty("required") && $scope.fields[i].model==""){
          output = false;
        }
      }
    }

    return output;
  };

  this.processFields = function(fields){
    var output = [];
	  // fields.sort();

    self.foundFields = fields.getUnique();
    //process found fields

    self.foundFields.forEach(function(raw){
      var field = self.getFieldFromRaw(raw, true);

      if(!self.foundFieldsProcessed.hasOwnProperty(field.name)){
        self.foundFieldsProcessed[field.name] = field;
      }
      if(!self.foundFieldsProcessed[field.name].hasOwnProperty('data_replace')){
        self.foundFieldsProcessed[field.name]['data_replace'] = [];
      }
      self.foundFieldsProcessed[field.name].data_replace.push([raw, field.hasOwnProperty("format") ? {format: field.format} : {}]);

    });
    console.log(self.foundFieldsProcessed);

    for(var i in self.foundFieldsProcessed){
      //console.log(items[i]);
      if(self.foundFieldsProcessed.hasOwnProperty(i)){
        output.push(self.foundFieldsProcessed[i]);
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
.factory('TemplateFactory',["saveAs","$Fields","$filter", function(saveAs, $Fields,$filter){
	var TemplateFactory = this;

  this.binaryFiles = [];
	this.fields = [];

	this.readFile = function(files, i, $scope){
		var reader = new FileReader();
			reader.onloadend = function(evt){

				var binary = evt.target.result;
				TemplateFactory.binaryFiles.push(binary);
        TemplateFactory.fields = $Fields.extractFields(binary, TemplateFactory.fields);
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
	this.generateDateFromField = function(field, value, dataReplace){
		var date = value.split("-");
		var date_js = new Date(date[0], (date[1]*1)-1, date[2]);
		return $filter('date')(date_js, dataReplace.format);
	};

	this.generateTemplate = function(preview, fields){
		var output = preview;

			for(var f in fields){
				if(fields.hasOwnProperty(f)){
					if(fields[f].data_replace.length>0){
						for(var i=0; i < fields[f]['data_replace'].length; i++){

							var str = new RegExp(fields[f].data_replace[i][0].replace(/\|/g,"\\|"), "g");

							if(fields[f].type=="repeat"){
								//console.log("%cWe found a repeat field "+fields[f].name, "background:yellow");
								console.log("FIELD",fields[f]);
								var content = [];
								for(row = 0; row<fields[f].model.length; row++){
									content.push(fields[f].content);
									for(var n = 0; n< fields[f].fields.length; n++){
										console.log(n);
										// if(fields[f].model[row].hasOwnProperty(n)){
											console.log(fields[f].fields[n]);

												if(fields[f].fields[n].type=="date"){
													console.log('is date')
													var date = TemplateFactory.generateDateFromField(
														fields[f].fields[n],
														fields[f].model[row][fields[f].fields[n].name],
														fields[f].fields[n].data_replace[0][1] == {} ? "longDate" : fields[f].fields[n].data_replace[0][1]);
													console.log(fields[f].fields[n].data_replace[0].replace(/\|/g,"\\|").replace(/\#/g,"\\\#"));
													content[row] = content[row].replace(
														new RegExp(fields[f].fields[n].data_replace[0].replace(/\|/g,"\\|").replace(/\#/g,"\\\#"),"g"), date);

												} else {
													console.log(fields[f].fields[n].data_replace[0].replace(/\|/g,"\\|").replace(/\#/g,"\\\#"));
													content[row] = content[row].replace(
														new RegExp(fields[f].fields[n].data_replace[0].replace(/\|/g,"\\|").replace(/\#/g,"\\\#"),"g"), fields[f].model[row][fields[f].fields[n].name]);
												}


											//fields[f].model[n];
										// }
									} //inner loop


								} //outerloop
								console.log(content);

								output = output.replace(str, content.join(""));
								// fields[f].content this is where the pattern is.
								// fields[f].model //values need to merge with the fields.


							} else if(fields[f].type=="date") {
								var date = TemplateFactory.generateDateFromField(fields[f], fields[f].value, fields[f].data_replace[i][1]);
								output = output.replace(str, date);
							} else {
								output = output.replace(str, fields[f].value);
							}

						}
					}
				}
			}
			//do stuff to output for tpl-ifs


			return output;
		};


  return TemplateFactory;
	}]);
