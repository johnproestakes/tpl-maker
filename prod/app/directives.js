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
        "<span class=\"link\">{{nice_month | date: \"MMMM yyyy\"}}</span> </th></tr>",
        "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>R</th><th>F</th><th>S</th></tr></thead>",
      "<tr ng-repeat=\"week in weeks\">",
        "<td class=\"link\" ng-click=\"setDate(n)\" ng-class=\"{nextMonth: n[0]!==month, selected:n[0]==sel_month&&n[1]==sel_day }\" ng-repeat=\"n in week track by $index\">{{n[1]}}</td>",
      "</tr></table>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){

      if(scope.ngModel.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})/g)) {
        var d = scope.ngModel.split("-");
        scope.sel_year = d[0]*1;
        scope.sel_month = (d[1]*1)-1;
        scope.sel_day = d[2]*1;
        scope.year = d[0]*1;
        scope.month = (d[1]*1)-1;
        scope.day = d[2]*1;

      } else {
        scope.year = new Date().getFullYear();
        scope.day = new Date().getDate();
        scope.month = new Date().getMonth();
      }

      scope.nice_month = new Date(scope.year, scope.month);


      scope.getDates = function(){
        var startDate = new Date(scope.year, scope.month, 1).getDay();
        var endDate = new Date(scope.year, scope.month+1, 0).getDate();
        var weeks = [[]], pointer = 0, day = 1;

        //first week

        var prevMonthEnds = new Date((scope.month-1 ==-1 ? scope.year : scope.year-1), (scope.month-1 ==-1 ? 11 : scope.month-1), 0).getDate();
        var pday = 1;
        for(var i=prevMonthEnds; i>(prevMonthEnds-startDate); i--){
          weeks[pointer].unshift([
            (scope.month-1 ==-1 ? 11 : scope.month-1),
            i,
            (scope.month-1 ==-1 ? scope.year-1 : scope.year)]);
        }

        // rest of the month
        for(var i=0; i<(42-startDate); i++){
          weeks[pointer].push(day <= endDate ? [scope.month, day, scope.year] :
            [
              (scope.month+1 ==12 ? 0 : scope.month+1),
              day-endDate,
              (scope.month+1 ==12 ? scope.year+1 : scope.year)
            ]);
          if(((startDate + day) % 7) == 0 ){
            weeks.push([]);
            pointer++;
          }
          day++;

        }

        return weeks;

      };




      scope.weeks = scope.getDates();
      scope.setDate= function(n){
        scope.ngModel = n[2] + "-" + ((n[0]+1) < 10 ? "0"+ (n[0]+1) : n[0]+1 ) + "-" + (n[1] < 10 ? "0"+ n[1] : n[1]);

        scope.day = n[1];
        scope.month = n[0];
        scope.year = n[2];

        scope.sel_day = n[1];
        scope.sel_month = n[0];
        scope.sel_year = n[2];

        jQuery(el).find('input').popup("hide");
        console.log(scope.ngModel);
        scope.ngChange();
      };
      scope.advanceMonth = function(inc){
        console.log(scope.month, scope.year);
        if ( inc<0 && scope.month-1 == -1 ) { scope.month = 11;}
        else if ( inc>0 && scope.month+1 == 12 ) { scope.month = 0;}
        else { scope.month += inc; }

        if(inc<0 && scope.month==11) scope.year-=1;
        if(inc>0 && scope.month==0 ) scope.year+=1;

        scope.nice_month = new Date(scope.year, scope.month);
        scope.weeks = scope.getDates();

      };

      $timeout(function(){

        var popup = jQuery(el).find('.ui.popup');
        jQuery(el).find('input').popup({
          on: "click",
          boundary: document.body,
          jitter: 50,
          position: 'bottom left',
          closable: false,
          popup: popup
        });

      });
    }
  };
}]);

angular.module('templateMaker').directive('uiDropdown', ['$timeout',function($timeout){
  return {
    restrict: "A",
    link: function(scope,el,attr){
      $timeout(function(){
        $(el).dropdown();


        scope.$on("$destroy", function(){
          $(el).dropdown("destroy");
        });
      });
    }
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
      "<div>",
      "<div class=\"ui inverted fluid ordered steps\">",
        "<div class=\"step\" ng-click=\"navigateTo('#/main')\" ng-class=\"{completed: templateList.length>0}\">",
          "<div class=\"content\">",
            "<div class=\"title\">Templates</div>",
            "</div>",
          "</div>",
        "<div class=\"step\" ng-click=\"templateLoaded()&&navigateTo('#/fields')\" ng-class=\"{completed:areAllFieldsCompleted(), disabled: !templateLoaded()}\">",
          "<div class=\"content\">",
            "<div class=\"title\">Fields</div>",
            "</div>",
          "</div>",
        "<div class=\"step\" ng-click=\"areAllFieldsCompleted()&&navigateTo('#/export')\" ng-class=\"{disabled: !areAllFieldsCompleted()}\">",
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
.directive('tplRepeat', ['$timeout','$PersistJS','$Export',
function($timeout,$PersistJS,$Export){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [
        "<p ng-if=\"field.instructions\">{{field.instructions}}</p>",

      "<div class=\"ui segment\">",
        "<jupiter-draggable class=\"draggable repeat\" drag-parent=\"field.model\" drag-index=\"$$index\" drag-item=\"field.model[$$index]\" ondragstart=\"jupiterDragStart(event)\" draggable=\"true\" ng-repeat=\"row in field.model track by $index\" ng-init=\"$$index = $index\" >",
          "<span class=\"close link\" ng-click=\"removeRow($index)\"><i class=\"close icon\"></i></span>",
          "<div ng-hide=\"field.model.length<=1\" jupiter-drag-handle class=\"drag-handle\"></div>",
          "<div ng-click=\"setVisible($index)\" class=\"cursor:hand;\"><i class=\"chevron\" ng-class=\"{'down icon': visible==$index, 'right icon': visible!==$index}\"></i><span class=\"ui header\" style=\"margin:0\">Item {{$index + 1}}</span></div>",
          "<div ng-show=\"$index==visible\" class=\"containedFields\">",
          "<div ng-repeat=\"col in field.fields\" class=\"ui field\">",
            "<label>{{col.label ? col.label : col.name }}</label>",
              "<p ng-if=\"col.instructions\">{{col.instructions}}</p>",
              "<tpl-textarea ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='textarea'\"></tpl-textarea>",
              "<tpl-textbox ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='text'\"></tpl-textbox>",
              "<tpl-date ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='date'\"></tpl-date>",
              "<tpl-time ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='time'\"></tpl-time>",
              "<tpl-url ng-model=\"field.model[$$index][col.name]\" field=\"col\" ng-change=\"updateField()\" ng-if=\"col.type=='url'\"></tpl-url>",

            "</div></div>",
          "</jupiter-draggable>",
        "<div><button class=\"ui button\" ng-click=\"addRow()\">Add item</button></div>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){

      scope.visible = 0;
      scope.setVisible = function(id){
        scope.visible = id;
      };
      scope.removeRow = function(id){
        scope.ngModel.splice(id,1);
        scope.saveFields();
      };
      scope.saveFields = function(){
        if(scope.$parent.livePreview !== ""){
          $Export.exportLivePreview(scope.$parent.templateList[0], scope.$parent);
        }
        $PersistJS.set(scope.field.name, JSON.stringify(scope.ngModel));
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
          console.log(scope.field);
          scope.field.fields.forEach(function(f){
            output[f.name] = "";
          });
          scope.visible = scope.ngModel.length;
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

angular.module('templateMaker').directive('tplTime', ['$timeout',function($timeout){
  return {
    restrict: "E",
    scope:{ngModel:"=",field:"=", ngModel:"=",ngChange:"&"},
    template: [

      "<div class=\"ui grid\">",

      "<div class=\"four wide column\">",
      "<input type=\"hidden\" ng-model=\"ngModel\">",
        "<div class=\"ui basic compact buttons\">",
        "<div class=\"ui scrolling dropdown button\" ui-dropdown>",
        "{{hour}}<i class=\"dropdown icon\"></i>",
        "<div class=\"menu\" >",
          "<div class=\"item\" ng-click=\"setHour(hour)\" ng-repeat=\"hour in hourOptions track by $index\">{{hour}}</div>",
          "</div>",
          "</div>",
          "<div class=\"ui scrolling dropdown button\" ui-dropdown>",
          "{{minute}}<i class=\"dropdown icon\"></i>",
          "<div class=\"menu\" >",
            "<div class=\"item\" ng-click=\"setMinutes(minute)\" ng-repeat=\"minute in minuteOptions track by $index\">{{minute}}</div>",
            "</div>",
            "</div>",

"</div>",
          "</div>",
          "<div class=\"three wide column\" style=\"padding-top:1.5em\">",
          "<div class=\"inline fields\">",
          "<div class=\"field\">",
            "<div class=\"ui radio checkbox\">",
              "<input type=\"radio\" ng-model=\"timeParts.p\" value=\"AM\"  tabindex=\"0\" >",
                "<label>AM</label>",
                "</div>",
                "</div>",
                "<div class=\"ui radio checkbox\">",
                  "<input type=\"radio\" ng-model=\"timeParts.p\" value=\"PM\" tabindex=\"0\">",
                    "<label>PM</label>",
                    "</div>",
                  "</div>",
                "</div>",

      "<div class=\"five wide column\">",
      "<div class=\"ui compact basic scrolling dropdown button\" ui-dropdown>",
      "{{timezones[timeParts.t]}} <i class=\"dropdown icon\"></i>",
      "<div class=\"menu\">",
        "<div class=\"item\" ng-repeat=\"(key,value) in timezones track by $index\" ng-click=\"setTimezone(key)\">{{value}}</div>",
        "</div>",
      "</div>",
      "</div>"
    ].join(""),
    link: function(scope, el, attr){

      scope.timeParts = {
        h: 12,
        m: "00",
        p: "PM",
        t: "EST"
      };
      var regex = /([0-9]{1,2})\:([0-9]{2}) (\A\M|\P\M) ([A-Z]{3})?/g;
      var b = scope.ngModel.match(regex);

      if(b) {
        var match = regex.exec(scope.ngModel);
        console.log(match);
        scope.timeParts.h = match[1]*1;
        scope.timeParts.m = match[2];
        scope.timeParts.p = match[3];
        if(match[4] !== null)
          scope.timeParts.t = match[4];

        console.log(scope.timeParts);
      } else {
        // scope.year = new Date().getFullYear();
        // scope.day = new Date().getDate();
        // scope.month = new Date().getMonth();
      }

      scope.setMinutes = function(min){
          scope.timeParts.m = min;
          scope.minute = scope.timeParts.m;
          scope.updateFieldValues();
          console.log(min);
      };
      scope.setHour = function(hour){
          scope.timeParts.h = (scope.timeParts.p == "PM") ? hour*1 + 12 : hour*1;
          scope.hour = hour;
          scope.updateFieldValues();
      };

      scope.setTimezone = function(timezone){
        scope.timeParts.t = timezone;
        scope.updateFieldValues();
      };
      scope.timezones = {
        "EST":"Eastern Standard Time (EST)",
        "EDT":"Eastern Daylight Time (EDT)",
        "ET":"Eastern Time (ET)",
        "CST":"Central Standard Time (CST)",
        "MST":"Mountain Standard Time (MST)",
        "PST":"Pacific Standard Time (CST)"
      };
      scope.getTimezones = function(){
        var output = [];
        for(i in scope.timezones){
          if(scope.timezones.hasOwnProperty(i)){

          }
        }
        return ["EST","EDT", "ET", "CST", "MST", "PST"];
      };
      scope.hourOptions = [];
      scope.minuteOptions = [];
      scope.timezoneOptions = scope.getTimezones();

      scope.updateFieldValues = function(){
        scope.ngModel = (scope.timeParts.h > 13 ? scope.timeParts.h*1 - 12 : scope.timeParts.h*1) + ":"+scope.timeParts.m+" "+scope.timeParts.p + " " + (scope.timezone===undefined ? "EST" : scope.timezone);
        console.log(scope.ngModel);
        scope.ngChange();
      };

      scope.getHours = function(){
        var output = [];
        for(i=1; i<=12; i++){
          output.push(i);
        }
          return output;

      };
      scope.getMinutes = function(){
        var output = [];
        output.push("00");
        for(i=1; i<4; i++){
          output.push(i*15);
        }
          return output;

      };
      scope.hourOptions = scope.getHours();
      scope.minuteOptions = scope.getMinutes();

      $timeout(function(){
        scope.updateFieldValues();
        // if(/[0-9]{1,2}:[0-9]{1,2}\s(AM|PM)\s[A-Z]{3}/.test(scope.ngModel)){
        //   var time_js = scope.ngModel.split(" ");
        //   scope.timeParts.h = time_js[0].split(":").shift();
        //   scope.timeParts.m = time_js[0].split(":").pop();
        //   scope.timeParts.p = time_js[1];
        //
        //   scope.updateFieldValues();
        //   scope.time = time_js[0] + " " + time_js[1];
        //   scope.timezone = time_js[2];
        // } else {
        //   scope.$apply(function(){
        //     scope.time = "12:00 PM";
        //     scope.timezone = "EST";
        //   });
        //
        // }

        scope.hour = scope.timeParts.h > 12 ? scope.timeParts.h - 12 : scope.timeParts.h;
        scope.minute = scope.timeParts.m;

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
