angular.module('templateMaker').directive('tplDate', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",ngChange:"&"},
    template: [
      "<div class=\"ui left icon input\">",
      "<i class=\"calendar icon\"></i>",
      "<input type=\"text\" ng-model=\"ngModel\" readonly ng-change=\"ngChange()\"/>",

      "<div class=\"ui calendar popup\">",
      "<table class=\"ui celled center aligned unstackable table seven column day\">",
        "<thead>",
        "<tr ><th colspan=\"7\">",
        "<span class=\"next link\" ng-click=\"advanceMonth(1)\"><i class=\"right chevron icon\"></i></span>",
        "<span class=\"prev link\" ng-click=\"advanceMonth(-1)\"><i class=\"left chevron icon\"></i></span>",
        "<span class=\"link\">{{year}} {{nice_month}}</span> </th></tr>",
        "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>R</th><th>F</th><th>S</th></tr></thead>",
      "<tr ng-repeat=\"week in weeks\">",
        "<td class=\"link\" ng-click=\"setDate(n)\" ng-repeat=\"n in week track by $index\">{{n}}</td>",
      "</tr></table>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){
      scope.year = new Date().getFullYear();
      scope.day = new Date().getDate();
      scope.month = new Date().getMonth();




      var months = ["January","February","March", "April", "May", "June","July","August","September","October","November","December"];
      scope.nice_month = months[scope.month];
      scope.day_max = new Date(scope.year, scope.month).getDate();
      // scope.$apply();

      scope.getDates = function(){
        var startDate = new Date(scope.year, scope.month, 1).getDay();
        var endDate = new Date(scope.year, scope.month,0).getDate();
        var weeks = [[]];
        var pointer = 0;
        var day = 1;
        //first week
        for(var i=0; i<startDate; i++){
          weeks[pointer].push("");
        }
        // rest of the month
        for(var i=0; i<endDate; i++){
          weeks[pointer].push(day);
          if(((startDate + day) % 7) == 0 ){
            weeks.push([]);
            pointer++;
          }
          if(i < endDate) {day++;}
        }
        console.log('day',day);

        if((startDate + day) % 7 !== 0){
          console.log("has extra days at end of month",((7*(pointer+1))-day));
          for(var i =0; i< ((7*(pointer+1))-(startDate+day-1)); i++){
            weeks[pointer].push("");
          }
        }
        //scope.day_max;

        return weeks;

      };
      scope.weeks = scope.getDates();
      scope.setDate= function(n){
        scope.ngModel = scope.year + "-" + ((scope.month+1) < 10 ? "0"+ (scope.month+1) : scope.month+1 ) + "-" + (n < 10 ? "0"+ n : n);
        jQuery(el).find('input').popup("hide");
        console.log('change?');
        scope.ngChange();
      };
      scope.advanceMonth = function(inc){
        console.log(scope.month, scope.year);
        if ( inc<0 && scope.month-1 == -1 ) { scope.month = 11;}
        else if ( inc>0 && scope.month+1 == 12 ) { scope.month = 0;}
        else { scope.month += inc; }

        if(inc<0 && scope.month==11) scope.year-=1;
        if(inc>0 && scope.month==0 ) scope.year+=1;

        scope.nice_month = months[scope.month];
        scope.weeks = scope.getDates();

      };

      $timeout(function(){



        var popup = jQuery(el).find('.ui.popup');
        jQuery(el).find('input').popup({
          on: "click",
          closable: false,
          popup: popup
        });

      });
    }
  };
}]);

angular.module('templateMaker')
.directive('tplField', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<tpl-textarea ng-model=\"ngModel\" field=\"field\" ng-change=\"ngChange()\" ng-if=\"field.type=='textarea'\"></tpl-textarea>",
      "<tpl-textbox ng-model=\"ngModel\" field=\"field\" ng-change=\"ngChange()\" ng-if=\"field.type=='text'\"></tpl-textbox>",
      "<tpl-url ng-model=\"ngModel\" field=\"field\" ng-change=\"ngChange()\" ng-if=\"field.type=='url'\"></tpl-url>",
      "<tpl-date ng-model=\"ngModel\" field=\"field\" ng-change=\"ngChange()\" ng-if=\"field.type=='date'\"/></tpl-date>",
      "<tpl-repeat ng-model=\"ngModel\" field=\"field\" ng-change=\"ngChange()\" ng-if=\"field.type=='repeat'\"/></tpl-date>"
    ].join("")
  };
}]);

angular.module('templateMaker')
.directive('fileDropper', ['$timeout', function($timeout){
	return {
		restrict: "E",
		transclude: true,
		scope: {label: "@", ondrop:"&", dataTransferEvt:"="},
		template: "<div class=\"file-dropper\">{{label}}</div>",
		link: function(scope, el, attr){
			console.log(scope, el, attr);
			var fileDropper = el.find('.file-dropper');

			//reset
			var dropperReset = function(evt){
				evt.stopPropagation();
    			evt.preventDefault();
					fileDropper.hasClass("dragOver") && fileDropper.removeClass("dragOver");
				//fileDropper.css({border: "",color:"", background: ""});
				};


			$timeout(function(){

			fileDropper.get(0).addEventListener('drop', function(evt){
				evt.stopPropagation();
    			evt.preventDefault();
				scope.$parent[attr.ondrop.replace("()", "")](evt);
				dropperReset(evt);
				}, false);
			fileDropper.get(0).addEventListener('dragend', dropperReset, false);
			fileDropper.get(0).addEventListener('dragleave', dropperReset, false);
			fileDropper.get(0).addEventListener('dragover', function(evt){
				evt.dataTransfer.dropEffect = 'copy';
				!fileDropper.hasClass("dragOver") && fileDropper.addClass("dragOver");
				//fileDropper.css({border: "solid 3px blue", color:"blue", background: "lightblue"});
				evt.preventDefault();
				}, false);


				});

			}
		};
	}]);

angular.module('templateMaker')
.directive('magicHeader', ['$timeout',function($timeout){
  return {
    restrict: "E",
    template: [
      "<div style=\"padding-top: 1.5em;\">",
      "<div class=\"ui fluid ordered steps\">",
        "<div class=\"step\" ng-click=\"navigateTo('#/main')\" ng-class=\"{completed: templateList.length>0}\">",
          "<div class=\"content\">",
            "<div class=\"title\">Templates <span class=\"ui label\" ng-if=\"templateList.length>0\">{{templateList.length}}</span></div>",
            "</div>",
          "</div>",
        "<div class=\"step\" ng-click=\"templateLoaded()&&navigateTo('#/fields')\" ng-class=\"{completed:areAllFieldsCompleted()}\">",
          "<div class=\"content\">",
            "<div class=\"title\">Fields",
              "<span class=\"ui label\" ng-if=\"fields.length>0\">{{fields.length}}</span></div>",
            "</div>",
          "</div>",
        "<div class=\"step\" ng-click=\"areAllFieldsCompleted()&&navigateTo('#/export')\">",
          "<div class=\"content\">",
            "<div class=\"title\">Export</div>",
            "</div>",
          "</div>",
        "</div>",
      "</div>"
    ].join("")
  }
}]);

angular.module('templateMaker')
.directive('tplRepeat', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<div class=\"ui segment\">",
        "<jupiter-draggable class=\"draggable repeat\" drag-parent=\"field.model\" drag-index=\"$$index\" drag-item=\"field.model[$$index]\" ng-repeat=\"row in field.model track by $index\" ng-init=\"$$index = $index\" >",
          "<span class=\"close link\" ng-click=\"removeRow($index)\"><i class=\"close icon\"></i></span>",
          "<div ng-hide=\"field.model.length<=1\" jupiter-drag-handle class=\"drag-handle\"></div>",
          "<div ng-repeat=\"col in field.fields\" class=\"ui field\">",
            "<label>{{col.name}}</label>",
              "<tpl-textarea ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='textarea'\"></tpl-textarea>",
              "<tpl-textbox ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='text'\"></tpl-textbox>",
              "<tpl-date ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='date'\"></tpl-date>",
              "<tpl-url ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='url'\"></tpl-url>",
            "</div>",
          "</jupiter-draggable>",
        "<div><button class=\"ui button\" ng-click=\"addRow()\">Add</button></div>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){
      scope.removeRow = function(id){
        scope.ngModel.splice(id,1);
        scope.saveFields();
      };
      scope.saveFields = function(){
        localStorage.setItem(scope.field.name, JSON.stringify(scope.ngModel));
      };
      scope.updateField = function(){
        // console.log(value);
        // console.log(name,scope.field.fields[index][name]);

          scope.saveFields();
          console.log(scope.ngModel);


      };
      scope.addRow = function(){
        // scope.$apply(function(){

          if(scope.ngModel === null) scope.ngModel = [];
          if(typeof scope.ngModel === 'string' ) scope.ngModel = [];
          var output = {};
          scope.field.fields.forEach(function(f){
            output[f.name] = "";
          });
          scope.ngModel.push(output);
          scope.saveFields();
        // });
      };
      $timeout(function(){
        console.log("tpl-textbox");

      });
    }
  };
}]);

angular.module('templateMaker').directive('tplTextarea', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<textarea ng-model=\"ngModel\" ng-change=\"ngChange()\"></textarea>"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-textarea");
      });
    }
  };
}]);

angular.module('templateMaker').directive('tplTextbox', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [


      "<div class=\"ui input\" ng-class=\"{'right labeled': field.length,'error': ngModel.length>field.length}\">",
      "<input type=\"text\" ng-model=\"ngModel\" ng-change=\"ngChange()\" placeholder=\"\">",
      "<div ng-if=\"field.length\" class=\"ui label\" ng-class=\"{'red': ngModel.length>field.length}\"><i class=\"warning sign icon\" ng-if=\"field.length<ngModel.length\"></i> {{field.length - ngModel.length}}</div>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-textbox");
      });
    }
  };
}]);

angular.module('templateMaker').directive('tplUrl', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [
      "<input type=\"text\" ng-model=\"ngModel\" ng-change=\"ngChange()\">"
    ].join(""),
    link: function(scope, el, attr){
      $timeout(function(){
        console.log("tpl-url");
      });
    }
  };
}]);
