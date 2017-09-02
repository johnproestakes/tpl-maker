angular.module("templateMaker",['ngRoute','JupiterDragDrop']);
angular.module("templateMaker").directive('uiPopup', ["$timeout", function($timeout){
  return {
    restrict: "A",
    scope: {popupId:"@"},
    link: function(scope, el, attr){
      $timeout(function(){
        console.log(scope,el,attr);
        jQuery(el).popup({
          on: "click",
          popup: jQuery("#" + attr.popupId)
        });
      });
    }
  };
}]).directive('uiSwitch', ["$timeout", function($timeout){
  return {
    restrict: "A",
    link: function(scope, el, attr){
      $timeout(function(){
        console.log(scope,el,attr);
        jQuery(el).checkbox({
          onChecked: function() {
            scope.$apply(function(){
              scope.canLivePreview = true;
            });
          },
          onUnchecked: function() {
            scope.$apply(function(){
              scope.canLivePreview = false;
            });
          }
        });
      });
    }
  };
}]);

angular.module('templateMaker').factory(
  "$CryptoJS",
  function $CryptoJS(){
    return window.CryptoJS;
  });

angular.module('templateMaker').factory(
  "$PersistJS",
  function $PersistJS(){
    var store = new window.Persist.Store('TemplateMaker');
    window.addEventListener('unload', function(){
      store.save();
    });
    return store;
  });

angular.module('templateMaker').factory(
  "$UserManagement",
  ['$CryptoJS','$PersistJS',function $UserManagement($CryptoJS, $PersistJS){

    var self = this;
    this.salt = "4f5ffc9746039bd823d0f05b0dbf4a66";
    this.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.sessionIdLocalStorageKey = "TemplateMaker.emlUserID";

    this.logOut = function(){
      $PersistJS.remove(self.sessionIdLocalStorageKey);
      this.sessionId = "";
    };
    this.hasSavedSessionId = function(){


      var savedEmailId = $PersistJS.get(self.sessionIdLocalStorageKey);;
      console.log(savedEmailId);
      if(savedEmailId){
        this.sessionId = savedEmailId;
        return true;
      } else {
        this.sessionId = "";
        return false;
      }
    };
    this.setCurrentUser = function(email){
      var hash = $CryptoJS.MD5(email + self.salt).toString();
      $PersistJS.set(self.sessionIdLocalStorageKey, email);
      window.ga('set', 'userId', hash);
    };
    this.isValidEmailAddress = function(email){
      if(self.emailRegex.test(email)){
        console.log(email, "is valid");
        return true;
      } else {
        console.log(email, "is not valid");
        return false;
      }
    };
    return this;

  }]);

angular.module('templateMaker').factory('$Export', ['TemplateFactory','saveAs', function(TemplateFactory,saveAs){
  var self = this;

  this.previewWindow = null;
  this.removeTplIfs = function(data, fields){
    //if(data.indexOf("–")) { data = data.replace("–", "&mdash;");}
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
    this.exportLivePreview = function(file, $scope){
  		var reader = new FileReader();
  			reader.onloadend = function(evt){

  				var data1 = TemplateFactory.generateTemplate(evt.target.result, $scope.fields);
          var data = self.removeTplIfs(data1, $scope.fields);

  				setTimeout(function(){
            if(self.livePreviewWindow === undefined){
              //close and then reopen
              //self.livePreviewWindow.close();
              self.livePreviewWindow = window.open("about:blank", "template-live-preview");
              window.onunload = function(){
                self.livePreviewWindow.close();
              };
            } else {
              //self.livePreviewWindow.location.href= "about:blank";
            }

            self.livePreviewWindow.document.innerHTML = "";
  					self.livePreviewWindow.document.write(  data  );
            self.livePreviewWindow.document.close();
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
.factory("$Fields", ['$filter','$PersistJS', function $Fields($filter, $PersistJS){
  var self = this;
  /*
  ------------------------------------
    allow only these field types */
  this.typeExists = function(type){
    if(self.fieldTypes[type] === undefined) return false;
    else return true;
  };
  this.fieldTypes = {
      "text": {
        label:"Text",
        parameters: ["length", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          return field.value;
        }
      },

      "date": {
        label:"Date Picker",
        parameters: ["dateFormat", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          console.log(field, replaceAttr,value);
          var date = field.value.split("-");
      		var date_js = new Date(date[0], (date[1]*1)-1, date[2]);
      		var date_replace = $filter('date')(date_js, replaceAttr== {} ? "longDate" : replaceAttr.format);

          return date_replace;
        }
      },
      "time": {
        label:"Time Picker",
        parameters: ["timeFormat", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          // 00:00 AM PST
          var clock = field.value.split(" ");
          var time = clock[0].split(":");
      		var time_js = new Date(2017, 1, 1, (clock[1]=="PM" ? time[0]*1 + 12 : time[0]*1 ), time[1]*1, 0, 0);

          //add custom filter for timezone.
          //console.log(time);

          var format = replaceAttr.format === undefined || replaceAttr.format=="" ? "shortTime" : replaceAttr.format;

          format = (format=="shortTime+ZZZ") ? "h:mm '"+clock[1]+"' ZZZ" : format;
          format = (format=="shortTime") ? "h:mm '"+clock[1]+"'" : format;
          console.log("parts", clock);
          format = (format=="optumTime+ZZZ") ? "h:mm '"+(clock[1]=="AM"? "a.m." : "p.m.")+"' ZZZ" : format;
          format = (format=="optumTime") ? "h:mm '"+(clock[1]=="AM"? "a.m.":"p.m.")+"'" : format;

          format = format.replace(new RegExp("ZZZ", "g"), "'"+clock[2]+"'");

      		var time_replace = $filter('date')(time_js, format);
          console.log(time_replace);
          return time_replace;
        }
      },
      "textarea": {
        label:"Long Text",
        parameters: ["length", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          return field.value;
        }
      },
      "url" : {
        label:"URL",
        parameters: ["length", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          //do i validate the url? probably not.
          return field.value;
        }
      },

      "repeat" : {
        label:"Repeating Block",
        parameters: ["label"],
        renderField: function(field, replaceAttr, value){
          var content = [];
          for(row = 0; row<field.model.length; row++){
            content.push(field.content);
            for(var n = 0; n < field.fields.length; n++){

                if(self.typeExists(field.fields[n].type)){

                  field.fields[n].model = field.model[row][field.fields[n].name];
                  field.fields[n].value = field.fields[n].model;
                  var fieldRender = self.fieldTypes[field.fields[n].type].renderField(field.fields[n], field.fields[n].data_replace[1], field.model[row][field.fields[n].name] );
                  console.log("replace", field.fields[n].data_replace[0], fieldRender);
                  content[row] = content[row].replace(field.fields[n].data_replace[0], fieldRender === undefined ? "" : fieldRender);
                } else {
                  console.log('type does not exist', field.fields[n]);
                }


            } //inner loop


          } //outerloop

          // field.content this is where the pattern is.
          // field.model //values need to merge with the fields.
          // console.log("delimiter", field.delimiter);
          return content.join(field.delimiter===undefined ? "" : field.delimiter);
        }
      }// "time"
    };
  this.fieldAttr = {
      "length":"=",
      "required":"+",
      "instructions":"",
      "label":"",
      "delimiter":""
    };
  this.foundFields = [];
  this.foundFieldsProcessed = {};
  this.fieldPattern = /{{((\n|.)*?)}}/gi;

  this.finalizeHtml = function(str){
    //find the repeat fields.
    /// replace them with ##'s for later processing.
    // str.match()

    //replace loops with modified notation.
    var loops = str.match(/repeat:\s{0,4}\`([^\`]*|[\s\S]*)\`/g);
    if(loops && loops.length>0){
      var ori = "";
      for(var i = 0; i<loops.length; i++){
        ori = loops[i];
        loops[i] = loops[i].replace(new RegExp("\r?\n|\r", "g"),"");
        loops[i] = loops[i].replace(new RegExp("{{|}}", "g"), "~~");
        str = str.replace(new RegExp(ori, "g"), loops[i]);
        console.log("%cREPEAT " + loops[i], "background-color:yellow");
      }

    }

    return str;
  };
  this.extractFields = function(str, origin){

    var result = str.match(self.fieldPattern);
    if (result && result.length > 0) {
      console.log("extracting fields ",result.getUnique());
      $.each(result.getUnique(), function(key,value){
        if(origin.indexOf(value) == -1){
          origin.push(value);
        }
        });
      }
    return origin;
  };

  this.extractRepeatingField = function(raw){
    var content = raw.match(/\`([^\`]*|[\s\S]*)\`/g);
    console.log('repeatContent', content);
    var output = {};
    output.fields = [];
    if(content.length>0){
      output.content = content[0].replace(/^\`([^\`]*|[\s\S]*)\`$/g, "$1");
      console.log('repleatField',output);
      //find fields in the repeat string
      var fields = output.content.match(/~~([^~]*|[\s\S]*)~~/g);
      var fieldObjs = [];
      if(fields.length>0){
        for(var i=0; i<fields.length; i++){
          var f = self.getFieldFromRaw(fields[i].replace(/~~/g,""), false);
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
              section[i] = (section[i].replace(/^"(.*)"$/g, "$1")).trim();
            }

            if(self.typeExists(section[0])){
              field.type = section[0];
              field.format = section[1].replace(/^"(.*)"$/g, "$1");
            } else {
              field = self.extendAttrParameters(field, section);

            }
          } else {
            if(self.typeExists(section)){
              field.type = section;
            }
            field = self.extendAttrParameters(field, [section, false]);
          }
        });
      }

    }
    field.clean = field.name;

    if(loadLocal && $PersistJS.get(field.name)){
      if(field.type=="repeat"){
        try {
          field.model = $PersistJS.get(field.name) ? JSON.parse($PersistJS.get(field.name)) : [];
        } catch (e) {
          $PersistJS.set(field.name, JSON.stringify([]));
          field.model = [];
        } finally {

        }
      } else {
        field.value = $PersistJS.get(field.name) ? unescape($PersistJS.get(field.name)) : "";
        field.value = field.value.replace(/\/\/Q/g, '\"');
        field.model = field.value;
      }

    }
    return field;
  };
  this.extendAttrParameters = function(field, section){
    console.log("building", field.name, section);
    for(var e in self.fieldAttr){
      if(self.fieldAttr.hasOwnProperty(e) && section[0]==e){
        if(self.fieldAttr[e]=="="){
          field[e] = section[1]*1;
        } else if(self.fieldAttr[e]=="+"){
          field[e] = true;
        } else if(self.fieldAttr[e]=="[]"){
          //["",""]
          section[1] = section[1].trim();
          section[1] = section[1].substr(1,section[1].length-2);

          field[e] = section[1];
        } else {
          field[e] = section[1].trim().replace(/^"(.*)"$/, "$1");
        }

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


    for(var i in self.foundFieldsProcessed){
      //console.log(items[i]);
      if(self.foundFieldsProcessed.hasOwnProperty(i)){
        output.push(self.foundFieldsProcessed[i]);
        }
      }
    //clear out fields
    self.foundFields = [];
    self.foundFieldsProcessed = [];
		return output;
  };



  return this;
}]);

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

				var binary = $Fields.finalizeHtml(evt.target.result);
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

	this.updateFields = function(){ };


	this.replaceCodeWith = function(data, find, replace){
		return data;

	};
	this.generateTemplate = function(preview, fields){
		var output = $Fields.finalizeHtml(preview);

			for(var f in fields){
				if(fields.hasOwnProperty(f)){
					if(fields[f].data_replace.length>0){
						for(var i=0; i < fields[f]['data_replace'].length; i++){
							//escape characters
							var copy = fields[f].data_replace[i][0].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

							var str = new RegExp(copy, "g");


							if($Fields.typeExists(fields[f].type)){
								//extensible handler
								var replaceStr = $Fields.fieldTypes[fields[f].type].renderField(fields[f], fields[f].data_replace[i][1]);
								// returns value to be replaced

								console.log("replacing ", str, "with", replaceStr);
								output = output.replace(str, replaceStr);

							} else {
								//default handler
								output = output.replace(str, fields[f].value);
							}



							// if(fields[f].type=="repeat"){
							// 	//console.log("%cWe found a repeat field "+fields[f].name, "background:yellow");
							//
							//
							//
							//
							// } else if(fields[f].type=="date") {
							// 	var date = TemplateFactory.generateDateFromField(fields[f], fields[f].value, fields[f].data_replace[i][1]);
							// 	output = output.replace(str, date);
							// } else {
							// 	output = output.replace(str, fields[f].value);
							// }

						}
					}
				}
			}
			//do stuff to output for tpl-ifs


			return output;
		};


  return TemplateFactory;
	}]);
