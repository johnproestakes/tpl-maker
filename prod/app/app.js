(function(DOMParser) {
	"use strict";

	var
	  proto = DOMParser.prototype
	, nativeParse = proto.parseFromString
	;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser()).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var
			  doc = document.implementation.createHTMLDocument("")
			;
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return nativeParse.apply(this, arguments);
		}
	};
}(DOMParser));


var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

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

angular.module('templateMaker').factory('$DecayFactory', function(){
  var self = this;
  this.timers = {};
  this.values = {};
  this.execute = function(id, func, onDecayEnd){
    if(onDecayEnd === undefined) onDecayEnd = function(){};
    var output;
    if(this.values[id]===undefined){
      output = (this.values[id] = func());
      console.log("DECAY "+id+" FROM EXE", output);
    } else {
      output = this.values[id];
      console.log("DECAY "+id+" FROM MEMORY", output);
    }

    clearTimeout(this.timers[id]);
    this.timers[id] = setTimeout(function(){
      console.log("DECAYED", id);
      onDecayEnd();
      clearTimeout(self.timers[id]);
      delete self.values[id];
    },500);
  };
  return this;
});

angular.module('templateMaker').factory(
  "$Moment", function $Moment(){
  return window.moment;
  }
);

angular.module('templateMaker').factory(
  "$PersistJS",
  function $PersistJS(){
    var store = new window.Persist.Store('TemplateMaker');
    window.addEventListener('unload', function(){
      store.save();
    });
    return store;
  });

angular.module("templateMaker")
.factory('$TemplateMaker',[
	"$DecayFactory","saveAs","$Fields","$filter","$Moment","$PersistJS",
function $TemplateMaker($DecayFactory,saveAs, $Fields,$filter,$Moment,$PersistJS){

	var self = this;

	(function (FieldStructure) {
			FieldStructure[FieldStructure["GROUP"] = 0] = "GROUP";
			FieldStructure[FieldStructure["UNGROUP"] = 1] = "UNGROUP";
	})(self.FieldStructure || (self.FieldStructure = {}));

	(function(FieldAttributeFormat){
		FieldAttributeFormat[FieldAttributeFormat["BOOLEAN"] = 0] = "BOOLEAN";
		FieldAttributeFormat[FieldAttributeFormat["TEXT"] = 1] = "TEXT";
		FieldAttributeFormat[FieldAttributeFormat["NUMERICAL"] = 2] = "NUMERICAL";
		FieldAttributeFormat[FieldAttributeFormat["LIST"] = 3] = "LIST";
	})(self.FieldAttributeFormat || (self.FieldAttributeFormat={}) );


	this.Workspace = /**@class*/ (function(){
		function Workspace(scope){
			console.log('init workspace');
			this.templateList = [];
			this.foundFields = [];
			this.fieldPattern = /{{((\n|.)*?)}}/gi;
			this.decayResults = {};
			this.scope = scope;
			location.href="#/main";

		}
		//import files.
		Workspace.prototype.exportDownloadSingleFile = function(file){
			//export single file
			var html = this.__generateTemplate(file);
			this.__downloadFile(file, html);
			console.log("Export single file");
		};
		Workspace.prototype.exportAllTemplates = function(){
			if(this.templateList.length==0) return false;
			var Wksp = this;
			for(var i=0; i<Wksp.templateList.length; i++){
				//stagger them;
				var html = Wksp.__generateTemplate(Wksp.templateList[i]);
				Wksp.__downloadFile(Wksp.templateList[i], html);
				setTimeout(function(){
					console.log(Wksp.templateList[i],i);


				}, 1000 * i );
			}
			console.log("Export all files");
		};
		Workspace.prototype.exportPreviewHTML = function(file){

			var html = this.__generateTemplate(file);
	    // var data = self.finalizeExportedHTML(data1, $scope.fields);

      if(file.previewWindow){
        //close and then reopen
        file.previewWindow.close();
      }
      file.previewWindow = window.open("about:blank", "template-preview"+file.name);
      window.onunload = function(){
        file.previewWindow.close();
      };
      file.previewWindow.document.innerHTML = "";
			console.log(html);
			file.previewWindow.document.write( html );

			console.log("Export HTML Preview");
		};
		Workspace.prototype.exportFieldValues = function(){
			var output = {};
	    fields = $Fields.tranformFieldStructure(this.allFields, self.FieldStructure.UNGROUP);
	    for (var n=0; n<fields.length; n++){
	      if(fields[n].type=="repeat"){
	        output[fields[n].name] = fields[n].model;
	      } else {
	        output[fields[n].name] = fields[n].value;
	      }

	    }
			saveAs(new Blob([JSON.stringify(output)], {type:"application/json;charset=utf-8"}), "export_fields.json");


		};

		Workspace.prototype.areAllFieldsCompleted = function(){

			if(this.allFields===undefined || (this.allFields&&this.allFields.length==0)) return false;
			for(var group in this.allFields){
				if(this.allFields.hasOwnProperty(group)){
					for(var i=0;i<this.allFields[group].length;i++){
						this.allFields[group][i].value = this.allFields[group][i].model;
					}
				}
			}
			return true;
// 			var Wksp = this;
// var o = $DecayFactory.execute('areAllFieldsCompleted', function(){
// 	var temp_fields = Wksp.transformFieldStructure(self.FieldStructure.UNGROUP);
// 	var output = true;
// 	for(var i in temp_fields){
// 		if(temp_fields.hasOwnProperty(i)){
// 			console.log('%cfields completed?','background-color:blue',temp_fields[i].name, temp_fields[i].model, temp_fields[i].isFieldComplete());
// 			if(!temp_fields[i].isFieldComplete()) output = false;
// 		}
//
// 	}
// 	return output;
// }, function(){
// 	Wksp.scope.$apply();
// });
			return o;



			// if(Wksp.decayResults === undefined) Wksp.decayResults = {};
			// if(Wksp.decayResults.fieldsCompleted !== undefined) return Wksp.decayResults.fieldsCompleted;
			//
			//
			//
			// Wksp.decayResults.fieldsCompleted = output;
			//
			// setTimeout(function(){
			// 	if(Wksp.decayResults.fieldsCompleted){
			// 		delete Wksp.decayResults.fieldsCompleted;
			// 	}
			// },500);
			// return output;
		};
		Workspace.prototype.isTemplateLoaded = function(){
			return this.templateList && this.templateList.length>0;
		};
		Workspace.prototype.retrieveFields = function(method){
			//get either grouped or ungrouped fields.
		};
		Workspace.prototype.dropImportFieldValues = function(evt){
			var Wksp = this;
			Wksp.scope.isLoading = true;
		  var files = evt.dataTransfer.files; // FileList object.
	    var reader = new FileReader();
		  reader.onloadend = function(evt){
			  var droppedFields = JSON.parse(evt.target.result);

				for(var g in Wksp.allFields){
					if(Wksp.allFields.hasOwnProperty(g)){
						for(var i in droppedFields){
							if(droppedFields.hasOwnProperty(i)){
								for(n=0;n<Wksp.allFields[g].length;n++){
									if(Wksp.allFields[g][n].name==i){
										if(Wksp.allFields[g][n].type=="repeat"){
											Wksp.allFields[g][n].model = droppedFields[i];
										} else {
											Wksp.allFields[g][n].model = (Wksp.allFields[g][n].value = droppedFields[i]);
										}

									}
								}
							}
						}
					}
				}

	        //this.allFields = Wksp.transformFieldStructure(outputFields, self.FieldStructure.GROUP);
					setTimeout(function(){
						Wksp.scope.$apply(function(){
							Wksp.scope.isLoading = false;
						});

					},300);


		  };
	    window.ga('send', 'event', "IMPORT", "field values", "Import field values");
			reader.readAsBinaryString(files[0]);
		};
		Workspace.prototype.importTemplateFiles = function(evt){
			// $scope.isLoading = true;
			var Wksp = this;
		  var files = evt.dataTransfer.files; // FileList object.
		  this.templateList = [];
			this.debounce = null;
			this.scope.isLoading = true;
			for(i=0;i<files.length;i++){
				console.log(files[i]);
				var a = new self.FileComponent(files[i], function(field){
						clearTimeout(Wksp.debounce);
						console.log(field.name);
						Wksp.__extractFields(field);
						Wksp.debounce = setTimeout(function(){

							console.log('processing found fields', Wksp.foundFields);
							Wksp.__processFoundFields();
							window.debug_Wksp = Wksp;
							Wksp.scope.isLoading = false;
						},300);
					});
				this.templateList.push(a);


			}

		};
		Workspace.prototype.transformFieldStructure = function(method){
			if(this.allFields ===undefined) this.allFields = [];
			var Wksp = this;
			switch (method) {
	      case self.FieldStructure.UNGROUP:
	        var output = [];
	    		for(var i in Wksp.allFields ){
	    			if(Wksp.allFields.hasOwnProperty(i)){
	    				for(y=0;y<Wksp.allFields[i].length;y++){
	    					output.push(Wksp.allFields[i][y]);
	    				}
	    			}
	    		}

	        break;
	      case self.FieldStructure.GROUP:
	        var output = {"ungrouped": []};
	        for(var i in Wksp.allFields){
	          //console.log(items[i]);
	          if(Wksp.allFields.hasOwnProperty(i)){
	            if(!Wksp.allFields[i].group || Wksp.allFields[i].group==""){
	              output["ungrouped"].push(Wksp.allFields[i]);
	            } else {
	              if(output[Wksp.allFields[i].group]===undefined){
	                output[Wksp.allFields[i].group]=[];
	              }
	              output[Wksp.allFields[i].group].push(Wksp.allFields[i]);
	            }
	          }
	        }
	        break;
	      default:
	        console.warn('this does not have a method properly attached.');
	        // var ouptut = fields;
	      break;
	    }
	    return output;
		};
		Workspace.prototype.extractFieldsFromTemplates = function(){};
		Workspace.prototype.__generateTemplate = function(file){
			var output = this.__prepareHTML(file.content);
			//ungroup the fields;
			var fields = this.transformFieldStructure(self.FieldStructure.UNGROUP);

				for(var f in fields){
					if(fields.hasOwnProperty(f)){
						if(fields[f].data_replace.length>0){
							console.log(fields[f]);
							for(var i=0; i < fields[f]['data_replace'].length; i++){
								//escape characters
								var copy = fields[f].data_replace[i][0].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

								var str = new RegExp(copy, "g");


								if(fields[f].__fieldTypeExists(fields[f].type)){
									//extensible handler
									var replaceStr = self.FieldLibrary[fields[f].type].onRenderField(fields[f], fields[f].data_replace[i][1]);
									// returns value to be replaced

									console.log("replacing ", str, "with", replaceStr);
									output = output.replace(str, replaceStr);

								} else {
									//default handler
									output = output.replace(str, fields[f].value);
								}



							}
						}
					}
				}
				//do stuff to output for tpl-ifs


				return this.__finalizeExportedHTML(output);


		};
		Workspace.prototype.__extractFields = function(FileObject){
			var Wksp = this;
			var foundFields = FileObject.content.match(Wksp.fieldPattern);
			if (foundFields && foundFields.length > 0) {
				$.each(foundFields.getUnique(), function(key,value){
					if(Wksp.foundFields.indexOf(value) == -1){
						Wksp.foundFields.push(value);
					}
					});
					console.log(this.foundFields);
				}
			// return origin;
		};
		Workspace.prototype.__processFoundFields = function(){
			this.foundFields = this.foundFields.getUnique();
			if(this.allFields === undefined ) this.allFields={};
			//process found fields
			var Wksp = this;
			Wksp.foundFields.forEach(function(raw){

				var field = new self.FieldInstance(raw, Wksp.scope);
				if(!Wksp.allFields.hasOwnProperty(field.name)){
					Wksp.allFields[field.name] = field;
				} else {
					console.log(field.group);
					if(field.group!=="ungrouped") Wksp.allFields[field.name].group = field.group;
				}
				if(!Wksp.allFields[field.name].hasOwnProperty('data_replace')){
					Wksp.allFields[field.name]['data_replace'] = [];
				}
				var actions = "";
				Wksp.allFields[field.name].data_replace.push([raw, field.hasOwnProperty("format") ? {format: field.format} : {}, actions]);

			});


			var output = this.transformFieldStructure(self.FieldStructure.GROUP);
			Wksp.allFields = output;
			Wksp.foundFields = [];
			delete Wksp.foundFields;
			// //clear out fields
			// self.foundFields = [];
			// self.foundFieldsProcessed = [];
			// // console.log("processing fields?", output);
			location.href="#/fields";
			return output;

			console.log('finished loading templates');
		};
		Workspace.prototype.__downloadFile = function(file, content){
			saveAs(new Blob([content], {type:"text/html;charset=utf-8"}), file.name);
		};

		Workspace.prototype.__prepareHTML = function(html){
			var loops = html.match(/repeat:\s{0,4}\`([^\`]*|[\s\S]*)\`/g);
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
			return html;

		};
		Workspace.prototype.__finalizeExportedHTML = function(data){
			data = data.replace(/\<!\-\-(\s)?(template_maker|templatemaker)([^\>]*?|[\s\S]*)--\>/ig,"");
			//shall we compress style tags?

			// function parseHTML(markup) {
			//
			//     if (markup.toLowerCase().trim().indexOf('<!doctype') === 0) {
			//         var doc = document.implementation.createHTMLDocument("");
			//         doc.documentElement.innerHTML = markup;
			//         return doc;
			//     } else if ('content' in document.createElement('template')) {
			//        // Template tag exists!
			//        var el = document.createElement('template');
			//        el.innerHTML = markup;
			//        return el.content;
			//     } else {
			//        // Template tag doesn't exist!
			//        var docfrag = document.createDocumentFragment();
			//        var el = document.createElement('body');
			//        el.innerHTML = markup;
			//        for (i = 0; 0 < el.childNodes.length;) {
			//            docfrag.appendChild(el.childNodes[i]);
			//        }
			//        return docfrag;
			//     }
			// }
			// //conditional tags
			// // var parser = new DOMParser();
			// // var xhtml = parser.parseFromString("<div>" + data + "</div>", "text/xml");
			// var doctype = data.match(/\<\!doctype([^>]|.*)\>/ig);
			//
			// var xhtml = parseHTML(data);
			// console.log(xhtml);
			// var conditionalTags = xhtml.querySelectorAll("[tpl-if]");
			// console.log()
			// if(conditionalTags && conditionalTags.length>0){
			//   for(var i=0; i<conditionalTags.length; i++){
			//     //need to read the arguments and determine whether (true/ false) to remove the element.
			//     if(!self.readCondition(conditionalTags[i].getAttribute("tpl-if"), $Fields.tranformFieldStructure(fields,$Fields.FieldStructure.UNGROUP))) {
			//       conditionalTags[i].parentNode.removeChild(conditionalTags[i]);
			//     } else {
			//       conditionalTags[i].removeAttribute("tpl-if");
			//     }
			//
			//     console.log("conditionalTag Found", conditionalTags[i]);
			//   }
			// }
			// var output = [];
			//
			// for(var i =0; i<xhtml.children.length;i++){
			//   console.log(xhtml.children[i]);
			//   if(xhtml.children[i].outerHTML) {
			//     output.push(xhtml.children[i].outerHTML);
			//   }
			// }
			//
			//
			// // data = output.join("\n");
			// // console.log(xhtml);
			// console.log(output);
			// console.log(data);
			// data = output.join("\n");
			// parser = null;
			// xhtml = null;
			// //var xml = doc.firstChild.outerHTML;
			// if(doctype){
			//     data = doctype + "\n" + data;
			// }
			return data;
		};


		return Workspace;
	})();

	this.FileComponent = /**@class*/ (function(){
		function FileComponent(FileObject, onFinishedLoading){
			if(onFinishedLoading === undefined) onFinishedLoading = function(FC){};
			var attr = ["lastModified","lastModifiedDate","name","size","type"];
			for (var i =0;i<attr.length;i++){
				if(FileObject[attr[i]]!==undefined){
					this[attr[i]] = FileObject[attr[i]];
				}
			}
				if(this.type=="text/html"){
					var FC = this;
					var reader = new FileReader();
				  reader.onloadend = function(evt){
					  FC.content = evt.target.result;
						console.log('FC CONTENT',FC.content);
						onFinishedLoading(FC);
					};
					reader.readAsBinaryString(FileObject);
				}
				// location.href="#/fields";
				// load the html directly into the object;
		}
		return FileComponent;
	})();

	this.FieldAttributes = {
		"group": self.FieldAttributeFormat.TEXT,
		"default": self.FieldAttributeFormat.TEXT,
		"length": self.FieldAttributeFormat.NUMERICAL,
		"required": self.FieldAttributeFormat.BOOLEAN,
		"instructions": self.FieldAttributeFormat.TEXT,
		"label": self.FieldAttributeFormat.TEXT,
		"delimiter": self.FieldAttributeFormat.TEXT
	};

	this.FieldComponent = /**@class*/ (function(){
		function FieldComponent(name, args){
			if(self.FieldLibrary===undefined) self.FieldLibrary = {};
			if(name === undefined) name = "untitled component";
			if(args === undefined) args = {};
			if(args.parameters === undefined) args.parameters = [];
			if(args.label === undefined) args.label = name;
			if(args.onRenderField === undefined ) args.onRenderField = function(){};
			if(args.onInitializeField === undefined ) args.onInitializeField = function(){};
			if(args.onValidateCompleteness === undefined ) args.onValidateCompleteness = function(field, scope){
				var output = $DecayFactory.execute("validate_field_"+field.name, function(){

					var output = true;
					if(field.hasOwnProperty("required") && field.model == ""){
						output = false;
					}
					return output;
				}, /*decayend*/ function(field){
					scope.$apply();
				});
				return output;
			};
			this.label = args.label;
			this.parameters = args.parameters;
			this.onInitializeField = args.onInitializeField;
			this.onValidateCompleteness = args.onValidateCompleteness;
			this.onRenderField = args.onRenderField;
			self.FieldLibrary[name] = this;
		}
		return FieldComponent;
	})();

/* Field Component Specification */
	new this.FieldComponent('text', {
		label: "Text",
		parameters: ["group","length", "instructions", "required", "label","default"],
		onRenderField: function(field, replaceAttr, value){
			var output = field.value;
			if(replaceAttr.format && replaceAttr.format == "uriencode"){
				 output = encodeURIComponent(field.value);
			}
			return output;
		}
	});

	new this.FieldComponent('date',{
		label: "Date",
		parameters: ["group", "instructions", "required", "label"],
		onInitializeField: function(field){
			//depreciate this field;
			console.warn('Update your template: Date field is depreciated');
			field.type = "datetime";
		}
	});

	new this.FieldComponent('time',{
		label: "Date",
		parameters: ["group", "instructions", "required", "label"],
		onInitializeField: function(field){
			//depreciate this field;
			console.warn('Update your template: Date field is depreciated');
			field.type = "datetime";
		}
	});

	new this.FieldComponent('datetime', {
		label: "DateTime",
		parameters: ["group", "instructions", "required", "label"],
		onRenderField: function(field, replaceAttr, value){
			if(replaceAttr == {}) replaceAttr = {format: "LLL z"};

			var dateTime = field.model.split("|");
			// console.log(dateTime[0]);
			// dateTime[0] = dateTime[0].replace(/\.[0-9]{3}\Z/gi, "Z");
			// console.log(dateTime[0],dateTime[1]);
			var dateTimeOutput = ($Moment(dateTime[0]));
			// console.log("DATE TIME" ,dateTimeOutput.toString());
			var output;
			var dateMoment = $Moment(dateTimeOutput);
			switch (replaceAttr.format) {
				case "UTC":
				// .tz(dateTime[1]).
				var getTimezone = $Moment().tz(dateTime[1]).utcOffset();
				console.log('timezone offset',getTimezone);
					output = dateMoment.add(getTimezone*-1, 'minutes').format('YYYYMMDD\THHmmss')+"Z";
					break;
				case "fullDate":
					output = dateMoment.format('dddd, MMMM D, YYYY');
					break;
				case "longDate":
					output = dateMoment.format('MMMM D, YYYY');
					break;
				case "shortTime":
					output = dateMoment.format('h:mm A');
					break;
				case "shortTime+ZZZ":
					output = dateMoment.format('h:mm A');
					output = output + " " + dateMoment.tz(dateTime[1]).format('z');
					break;
				case "optumTime":
					output = dateMoment.format('h:mm A');
					output = output.replace(new RegExp("AM", "g"), "a.m.").replace(new RegExp("PM", "g"), "p.m.");
					break;
				case "optumTime+ZZZ":
					output = dateMoment.format('h:mm A');
					output = output.replace(new RegExp("AM", "g"), "a.m.").replace(new RegExp("PM", "g"), "p.m.");
					output = output + " " + dateMoment.tz(dateTime[1]).format('z');
					break;

				default:
				output = dateMoment.tz(dateTime[1]).format(replaceAttr.format);
			}

			return output;
		}
	});
	new this.FieldComponent('textarea', {
		label:"Long Text",
		parameters: ["group","length", "instructions", "required", "label"],
		onRenderField: function(field, replaceAttr, value){
			return field.value;
		}
	});
	new this.FieldComponent('url', {
		label:"URL",
		actions: ["setQueryParam"],
		parameters: ["group","length", "instructions", "required", "label"],
		onRenderField: function(field, replaceAttr, value){

			var output = field.value;
			// var fieldProps = self.getFieldParameters(field.data_replace[0][0]);

			if(replaceAttr.format && replaceAttr.format == "uriencode"){
				 output = encodeURIComponent(field.value);
			}

			return output;
		}
	});
	new this.FieldComponent('repeat', { });

	this.FieldInstance = /**@class*/ (function(){
		function FieldInstance(raw, scope){
			this.scope = scope;
			this.model = "";
			this.group = "ungrouped";
			this.value = "";
			this.type = "text";
			this.name = "";
			this.__getFieldFromRaw(raw);
			console.log(this);
		}
		FieldInstance.prototype.updateFieldValue = function(model){
			if(model == "") return false;
			var FI = this;
			if(this.updateDebounce !== undefined) clearTimeout(this.updateDebounce);
			this.updateDebounce = setTimeout(function(){


				$PersistJS.set(FI.name, FI.model);
				FI.value = FI.model;
				console.log('ngupdate', FI.model);
				FI.scope.$apply();
				delete FI.updateDebounce;
			},500);

		};
		FieldInstance.prototype.isFieldComplete = function(){
			if(!this.hasOwnProperty('required')) return true;
			var output = true;
			if(this.__fieldTypeExists(this.type)){
				console.log('%cVALIDATE REQUIREDNESS', 'color:blue');
				output = self.FieldLibrary[this.type].onValidateCompleteness(this, this.scope);
			}
			return output;
		};
		FieldInstance.prototype.__getFieldParameters = function(){
			if(typeof raw ==="array") { raw = raw[0]; }
	    console.log(raw);
	    var fieldAttr = ((raw.replace(/{{/g, "")).replace(/}}/g, "")).trim().split("|");
	    fieldAttr = fieldAttr.map(function(item){return item.trim();});
	    var fieldName = fieldAttr.shift().trim();
	    var fieldActions = [];
	    return {name: fieldName, attr: fieldAttr, actions: fieldActions };

		};
		FieldInstance.prototype.__extendAttrParameters = function(section){
			console.log(section);

			var FI = this;

			for(var e in self.FieldAttributes){
			if(self.FieldAttributes.hasOwnProperty(e) && section[0]==e){

        switch (self.FieldAttributes[e]) {
          case self.FieldAttributeFormat.NUMERICAL:
            FI[e] = section[1]*1;
            break;
          case self.FieldAttributeFormat.BOOLEAN:
            if(!FI[e])  { FI[e] = true; }
            else if(FI[e]=="false") { FI[e] = false; }
            break;
          case self.FieldAttributeFormat.TEXT:
            FI[e] = section[1].trim().replace(/^"(.*)"$/, "$1");
            break;
          case self.FieldAttributeFormat.LIST:
            section[1] = section[1].trim();
            section[1] = section[1].substr(1,section[1].length-2);
            FI[e] = section[1];
            break;
          default:

        	}
      	}
			}
		};

		FieldInstance.prototype.__getFieldParameters = function(raw){
			if(typeof raw ==="array") {
				raw = raw[0]; }

			var fieldAttr = ((raw.replace(/{{/g, "")).replace(/}}/g, "")).trim().split("|");
			fieldAttr = fieldAttr.map(function(item){return item.trim();});
			var fieldActions = [];
			return {name: fieldAttr.shift().trim(), attr: fieldAttr, actions: fieldActions };

		};
		FieldInstance.prototype.__extractRepeatingField = function(raw){
			this.model = [];
			this.type = "repeat";

			//some function to extract the field;
			var content = raw.match(/\`([^\`]*|[\s\S]*)\`/g);
	    var output = {};
	    this.fields = [];
	    if(content.length>0){
	      this.content = content[0].replace(/^\`([^\`]*|[\s\S]*)\`$/g, "$1");
	      var fields = this.content.match(/~~([^~]*|[\s\S]*)~~/g);
	      var fieldObjs = [];
	      if(fields.length>0){
	        for(var i=0; i<fields.length; i++){
	          var f = this.__getFieldFromRaw(fields[i].replace(/~~/g,""), false);
	          f.data_replace = [fields[i], f.hasOwnProperty("format") ? {format: f.format} : {}];
	          this.fields.push(f);
	        }
	      }
	    }
		};
		FieldInstance.prototype.__fieldTypeExists = function(type){
			if(self.FieldLibrary[type] === undefined) return false;
	    else return true;
		};
		FieldInstance.prototype.__getFieldFromRaw = function(raw, loadLocal){
			if(loadLocal === undefined) loadLocal = true;

			var FC = this;
	    var fieldProps = FC.__getFieldParameters(raw);
			console.log('FIELD PROPS',fieldProps);
			FC.name = fieldProps.name;

	    if(fieldProps.attr.length>0){
	      var sections = fieldProps.attr;
	      if(sections[0].trim().substr(0,6)=="repeat"){
					this.__extractRepeatingField(raw);

	      } else {
					 //not repeating

					for(var n=0;n<sections.length;n++){
						var section = sections[n].trim();
						if(section.indexOf(":")>-1){
							//has semi colon
							section = section.split(":");
							for (var i = 0; i<section.length; i++){
							  section[i] = (section[i].replace(/^"(.*)"$/g, "$1")).trim();
							  }

							if(this.__fieldTypeExists(section[0])){
								this.type= section[0];
								this.format= section[1].replace(/^"(.*)"$/g, "$1");
							} else {

								FC.__extendAttrParameters(section);
							}
						} else {
							if(this.__fieldTypeExists(section)){
								this.type = section;

							} else {
								FC.__extendAttrParameters([section]);
							}

						}
					}
	        // sections.forEach(function(section){
	        //   section = section.trim();
	        //   if(section.indexOf(":")>-1){
	        //     section = section.split(":");
	        //     for (var i = 0; i<section.length; i++){
	        //       section[i] = (section[i].replace(/^"(.*)"$/g, "$1")).trim();
	        //     }
					//
	        //     if(self.typeExists(section[0])){
	        //       field.type = section[0];
	        //       field.format = section[1].replace(/^"(.*)"$/g, "$1");
	        //     } else {
	        //       field = self.extendAttrParameters(field, section);
					//
	        //     }
	        //   } else {
	        //     if(self.typeExists(section)){
	        //       field.type = section;
	        //     }
	        //     field = self.extendAttrParameters(field, [section, false]);
	        //   }
	        // });
	      }

	    }
	    this.clean = this.name;


	    if(this.default && this.default!=="") {
	      this.value = this.default;
	      this.model = this.default;
			}
			// console.log('loadFrom'$PersistJS.get(FC.name));
	    if(loadLocal && $PersistJS.get(FC.name)){
	      if(FC.type=="repeat"){
	        try {
	          FC.model = $PersistJS.get(FC.name) ? JSON.parse($PersistJS.get(FC.name)) : [];
	        } catch (e) {
	          $PersistJS.set(FC.name, JSON.stringify([]));
	          FC.model = [];
	        } finally {

	        }
	      } else {

	        FC.value = $PersistJS.get(FC.name) ? unescape($PersistJS.get(FC.name)) : "";
					console.log(FC.value);

					FC.model = (FC.value = FC.value.replace(/\/\/Q/g, '\"'));
	      }

	    }
			self.FieldLibrary[this.type].onInitializeField(this);
		};
		return FieldInstance;
	})();


  return this;
	}]);

angular.module('templateMaker').factory(
  "$UserManagement",
  ['$CryptoJS','$PersistJS',function $UserManagement($CryptoJS, $PersistJS){

      var self = this;

      this.SecureGateway = /**@class*/ (function(){
        function SecureGateway(loginCallback){
          //constructor
          // this.sessionEmailInput= "";
          var SG = this;
          this.loginCallback = loginCallback;
          this.loginTimer = null;
          this.sessionUserEmail = "";
          this.timerDelay = 1000;
          this.salt = "4f5ffc9746039bd823d0f05b0dbf4a66";
          this.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          this.sessionIdLocalStorageKey = "TemplateMaker.emlUserID";



          if(this.hasSavedSessionId()){
            if(this.isValidEmailAddress(this.sessionId)){
              this.sessionUserEmail = this.sessionId;
              // loginCallback();
              location.href="#/login";
              this.loginTimer = setTimeout(function(){
                location.href="#/main";
                SG.setCurrentUser(SG.sessionUserEmail);
              }, this.timerDelay);
            } else {
              location.href="#/login";
              this.sessionUserEmail = "";
              }
          } else {
            location.href="#/login";
            this.sessionUserEmail = "";
          }

          window.addEventListener('hashchange', function(){
            if( SG.sessionUserEmail == "" || !SG.hasSavedSessionId()) {
              location.href="#/login";
            }
          });

        }
        SecureGateway.prototype.logOut = function(){
          this.loginAsOther();
          this.sessionId = "";
          this.sessionUserEmail = "";
          $PersistJS.remove(this.sessionIdLocalStorageKey);
          if(location.hasOwnProperty("reload")){
            location.reload();
          } else {
            document.location.href = document.location.href;
          }
        };
        SecureGateway.prototype.loginAsOther = function(){
          clearTimeout(this.loginTimer);
          delete this.loginTimer;
        };

        SecureGateway.prototype.sessionUpdateUserEmail = function(){
          this.errorMessage = "";

          if(this.isValidEmailAddress(this.sessionUserEmail)) {
            this.setCurrentUser(this.sessionUserEmail);
            this.loginCallback();
            location.href = "#/main";
          } else {
            // Error message
            this.errorMessage = "Sorry! You have to enter a valid email address.";
          }
        };
        SecureGateway.prototype.hasSavedSessionId = function(){
          var savedEmailId = $PersistJS.get(this.sessionIdLocalStorageKey);
          // console.log(savedEmailId);
          if(savedEmailId){
            this.sessionId = savedEmailId;
            return true;
          } else {
            this.sessionId = "";
            return false;
          }
        };
        SecureGateway.prototype.setCurrentUser = function(email){
          var hash = $CryptoJS.MD5(email + this.salt).toString();
          $PersistJS.set(this.sessionIdLocalStorageKey, email);
          window.ga('set', 'userId', hash);
        };
        SecureGateway.prototype.isValidEmailAddress = function(email){
          if(this.emailRegex.test(email)){
            console.log(email, "is valid");
            return true;
          } else {
            console.log(email, "is not valid");
            return false;
          }
        };

        return SecureGateway;
      })();




      return this;

  }]);

angular.module('templateMaker').factory('$Export', [
  'saveAs','$Fields', function(saveAs,$Fields){
  var self = this;


  this.readCondition = function(value, fields){
    var output = true;
    var fValues = {};
    for(var i=0; i<fields.length; i++){
      fValues[fields[i].name] = fields[i].model;
    }

    var args = value.trim().split(/\|\||\&\&/);
    args.map(function(item){ return item.trim();});
    for(var i =0; i<args.length; i++){
      if(fValues.hasOwnProperty(args[i])){
        if(fValues[args[i]]=="") {
          output = false;
        }
      } else {
        output = false;
      }
    }

    return output;
  };
  this.finalizeExportedHTML = function(data, fields){
    data = data.replace(/\<!\-\-(\s)?(template_maker|templatemaker)([^\-\-\>]*|[\s\S]*)--\>/ig,"");
    //shall we compress style tags?

    function parseHTML(markup) {

        if (markup.toLowerCase().trim().indexOf('<!doctype') === 0) {
            var doc = document.implementation.createHTMLDocument("");
            doc.documentElement.innerHTML = markup;
            return doc;
        } else if ('content' in document.createElement('template')) {
           // Template tag exists!
           var el = document.createElement('template');
           el.innerHTML = markup;
           return el.content;
        } else {
           // Template tag doesn't exist!
           var docfrag = document.createDocumentFragment();
           var el = document.createElement('body');
           el.innerHTML = markup;
           for (i = 0; 0 < el.childNodes.length;) {
               docfrag.appendChild(el.childNodes[i]);
           }
           return docfrag;
        }
    }
    //conditional tags
    // var parser = new DOMParser();
    // var xhtml = parser.parseFromString("<div>" + data + "</div>", "text/xml");
    var doctype = data.match(/\<\!doctype([^>]|.*)\>/ig);

    var xhtml = parseHTML(data);
    console.log(xhtml);
    var conditionalTags = xhtml.querySelectorAll("[tpl-if]");
    console.log()
    if(conditionalTags && conditionalTags.length>0){
      for(var i=0; i<conditionalTags.length; i++){
        //need to read the arguments and determine whether (true/ false) to remove the element.
        if(!self.readCondition(conditionalTags[i].getAttribute("tpl-if"), $Fields.tranformFieldStructure(fields,$Fields.FieldStructure.UNGROUP))) {
          conditionalTags[i].parentNode.removeChild(conditionalTags[i]);
        } else {
          conditionalTags[i].removeAttribute("tpl-if");
        }

        console.log("conditionalTag Found", conditionalTags[i]);
      }
    }
    var output = [];

    for(var i =0; i<xhtml.children.length;i++){
      console.log(xhtml.children[i]);
      if(xhtml.children[i].outerHTML) {
        output.push(xhtml.children[i].outerHTML);
      }
    }


    // data = output.join("\n");
    // console.log(xhtml);
    console.log(output);
    console.log(data);
    data = output.join("\n");
    parser = null;
    xhtml = null;
    //var xml = doc.firstChild.outerHTML;
    if(doctype){
        data = doctype + "\n" + data;
    }
    return data;
  };




  return this;
}]);

angular.module("templateMaker")
.factory("$Fields", ['$filter','$PersistJS', function $Fields($filter, $PersistJS){
  var self = this;
  /*
  ------------------------------------
    allow only these field types */
    (function (FieldStructure) {
        FieldStructure[FieldStructure["GROUP"] = 0] = "GROUP";
        FieldStructure[FieldStructure["UNGROUP"] = 1] = "UNGROUP";
    })(self.FieldStructure || (self.FieldStructure = {}));



  var FieldAttributeFormat;
  (function (FieldAttributeFormat) {
      FieldAttributeFormat[FieldAttributeFormat["BOOLEAN"] = 0] = "BOOLEAN";
      FieldAttributeFormat[FieldAttributeFormat["TEXT"] = 1] = "TEXT";
      FieldAttributeFormat[FieldAttributeFormat["NUMERICAL"] = 2] = "NUMERICAL";
      FieldAttributeFormat[FieldAttributeFormat["LIST"] = 3] = "LIST";
  })(FieldAttributeFormat || (FieldAttributeFormat = {}));

  this.typeExists = function(type){
    if(self.fieldTypes[type] === undefined) return false;
    else return true;
  };
  // this.encodeURI = function(){};
  this.foundFields = [];
  this.foundFieldsProcessed = {};
  this.fieldPattern = /{{((\n|.)*?)}}/gi;
  this.fieldTypes = {
      "text": {
        label:"Text",
        parameters: ["group","length", "instructions", "required", "label","default"],
        renderField: function(field, replaceAttr, value){
          // console.log(field, replaceAttr, value);
          var output = field.value;
          if(replaceAttr.format && replaceAttr.format == "uriencode"){
             output = encodeURIComponent(field.value);
          }
          // console.log(field.data_replace);
          // console.log(field.name, self.getFieldParameters(field.data_replace[0][0]));

          return output;
        }
      },

      "date": {
        label:"Date Picker",
        parameters: ["group","dateFormat", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          console.log(field, replaceAttr, value);
          var date = field.value.split("-");
      		var date_js = new Date(date[0], (date[1]*1)-1, date[2]);
      		var date_replace = $filter('date')(date_js, replaceAttr== {} ? "longDate" : replaceAttr.format);

          return date_replace;
        }
      },
      "time": {
        label:"Time Picker",
        parameters: ["group","timeFormat", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          // 00:00 AM PST
          var clock = field.value.split(" ");
          var time = clock[0].split(":");
          var format = replaceAttr.format === undefined || replaceAttr.format=="" ? "shortTime" : replaceAttr.format;
          var originFormat = format;
          if(originFormat=="UTC"){
            console.log('time', (clock[1]=="PM" ? (time[0]*1 == 12 ? 12 : time[0]*1 + 12 )  : time[0]*1 ));
            var time_js = new Date(2017, 1, 1, (clock[1]=="PM" ?(time[0]*1 == 12 ? 12 : time[0]*1 + 12 ) : time[0]*1 )+4, time[1]*1, 0, 0);
          } else {
            var time_js = new Date(2017, 1, 1, (clock[1]=="PM" ? (time[0]*1 == 12 ? 12 : time[0]*1 + 12 ): time[0]*1 ), time[1]*1, 0, 0);
          }



          //add custom filter for timezone.
          //console.log(time);


          format = (format=="UTC") ? "'T'HHmmss'Z'" : format;


          format = (format=="shortTime+ZZZ") ? "h:mm '"+clock[1]+"' ZZZ" : format;
          format = (format=="shortTime") ? "h:mm '"+clock[1]+"'" : format;
          console.log("parts", clock);
          format = (format=="optumTime+ZZZ") ? "h:mm '"+(clock[1]=="AM"? "a.m." : "p.m.")+"' ZZZ" : format;
          format = (format=="optumTime") ? "h:mm '"+(clock[1]=="AM"? "a.m.":"p.m.")+"'" : format;

          format = format.replace(new RegExp("ZZZ", "g"), "'"+clock[2]+"'");

          if(originFormat=="UTC"){
            var time_replace = $filter('date')(time_js, format);
          } else {
            var time_replace = $filter('date')(time_js, format);
          }

          console.log(time_replace);
          return time_replace;
        }
      },
      "textarea": {
        label:"Long Text",
        parameters: ["group","length", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){
          return field.value;
        }
      },
      "url" : {
        label:"URL",
        actions: ["setQueryParam"],
        parameters: ["group","length", "instructions", "required", "label"],
        renderField: function(field, replaceAttr, value){

          var output = field.value;
          var fieldProps = self.getFieldParameters(field.data_replace[0][0]);

          if(replaceAttr.format && replaceAttr.format == "uriencode"){
             output = encodeURIComponent(field.value);
          }

          return output;
        }
      },

      "repeat" : {
        label:"Repeating Block",
        parameters: ["group", "label"],
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
      "group":FieldAttributeFormat.TEXT,
      "default": FieldAttributeFormat.TEXT,
      "length": FieldAttributeFormat.NUMERICAL,
      "required": FieldAttributeFormat.BOOLEAN,
      "instructions": FieldAttributeFormat.TEXT,
      "label": FieldAttributeFormat.TEXT,
      "delimiter": FieldAttributeFormat.TEXT
    };



  this.prepareHtml = function(str){
    //happens before html is read.
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

  this.getFieldParameters = function(raw){

    if(typeof raw ==="array") { raw = raw[0]; }
    console.log(raw);
    var fieldAttr = ((raw.replace(/{{/g, "")).replace(/}}/g, "")).trim().split("|");
    fieldAttr = fieldAttr.map(function(item){return item.trim();});
    var fieldName = fieldAttr.shift().trim();
    var fieldActions = [];
    return {name: fieldName, attr: fieldAttr, actions: fieldActions };

  };
  this.getFieldFromRaw = function(raw, loadLocal){
    if(loadLocal === null) loadLocal = true;

    var field = { model:"", value:"", type:"text" };
    var fieldProps = self.getFieldParameters(raw);
    field.name = fieldProps.name;

    if(fieldProps.attr.length>0){
      var sections = fieldProps.attr;
      if(sections[0].trim().substr(0,6)=="repeat"){
        field.model = [];
        field.type="repeat";
        // field.content = ;
        var a = self.extractRepeatingField(raw);
        field.content = a.content;
        field.fields = a.fields;

      } else { //not repeating

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


    if(field.default && field.default!=="") {
      field.value = field.default;
      field.model = field.default; }
    console.log("GET RAW", field);

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

    for(var e in self.fieldAttr){
      if(self.fieldAttr.hasOwnProperty(e) && section[0]==e){

        switch (self.fieldAttr[e]) {
          case FieldAttributeFormat.NUMERICAL:
            field[e] = section[1]*1;
            break;
          case FieldAttributeFormat.BOOLEAN:
            if(!field[e])  { field[e] = true; }
            else if(field[e]=="false") { field[e] = false; }
            break;
          case FieldAttributeFormat.TEXT:
            field[e] = section[1].trim().replace(/^"(.*)"$/, "$1");
            break;
          case FieldAttributeFormat.LIST:
            section[1] = section[1].trim();
            section[1] = section[1].substr(1,section[1].length-2);
            field[e] = section[1];
            break;
          default:

        }
      }
    }
    console.log("extendAttrParameters.field", field);
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

  this.tranformFieldStructure = function(fields, method){

    switch (method) {
      case self.FieldStructure.UNGROUP:
        var output = [];
    		for(var i in fields ){
    			if(fields.hasOwnProperty(i)){
    				for(y=0;y<fields[i].length;y++){
    					output.push(fields[i][y]);
    				}
    			}
    		}

        break;
      case self.FieldStructure.GROUP:
        var output = {"ungrouped": []};
        for(var i in fields){
          //console.log(items[i]);
          if(fields.hasOwnProperty(i)){
            if(!fields[i].group || fields[i].group==""){
              output["ungrouped"].push(fields[i]);
            } else {
              if(output[fields[i].group]===undefined){
                output[fields[i].group]=[];
              }
              output[fields[i].group].push(fields[i]);
            }
          }
        }
        break;
      default:
        console.warn('this does not have a method properly attached.');
        var ouptut = fields;
      break;
    }
    return output;
  }



  this.processFields = function(fields){

	  // fields.sort();
    // export with groupings.

    //nees to have default group for ungrouped.

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
      actions = "";
      self.foundFieldsProcessed[field.name].data_replace.push([raw, field.hasOwnProperty("format") ? {format: field.format} : {}, actions]);

    });


    var output = self.tranformFieldStructure(self.foundFieldsProcessed, self.FieldStructure.GROUP);
    //clear out fields
    self.foundFields = [];
    self.foundFieldsProcessed = [];
    // console.log("processing fields?", output);
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
