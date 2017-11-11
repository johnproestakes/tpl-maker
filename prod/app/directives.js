angular.module('templateMaker').directive('tplDatetime', ['$timeout','$filter','$Moment', function($timeout, $filter,$Moment){
  return {
    restrict: "E",
    scope:{ngModel:"=",ngChange:"&"},
    template: [

      "<div class=\"ui left icon input\">",
      "<i class=\"calendar icon\"></i>",
      "<input readonly type=\"text\" class=\"dateInput\" ng-model=\"DateTime.nice_fullDate\"/>",
      "</div>",
      "<div class=\"ui calendar popup\">",
      "<table class=\"ui celled center aligned unstackable table seven column day\" ng-if=\"DateTime.showUI=='calendar'\">",
        "<thead>",
        "<tr ><th colspan=\"7\">",
        "<span class=\"next link\" ng-click=\"DateTime.Calendar.advanceMonth(1)\"><i class=\"right chevron icon\"></i></span>",
        "<span class=\"prev link\" ng-click=\"DateTime.Calendar.advanceMonth(-1)\"><i class=\"left chevron icon\"></i></span>",
        "<span class=\"link\">{{DateTime.Calendar.nice_month | date: \"MMMM yyyy\"}}</span> </th></tr>",
        "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>R</th><th>F</th><th>S</th></tr></thead>",
      "<tr ng-repeat=\"week in DateTime.Calendar.weeks\">",
        "<td class=\"link\" ng-click=\"DateTime.setDate(n)\" ng-class=\"{nextMonth: n[0]!==DateTime.month, selected:n[0]==DateTime.sel_month&&n[1]==DateTime.sel_day }\" ng-repeat=\"n in week track by $index\">{{n[1]}}</td>",
      "</tr></table>",
      "<table style=\"width:333px\" ng-if=\"DateTime.showUI=='clock'\" class=\"ui celled center aligned unstackable table seven column day\" >",
      "<thead><tr><th colspan=\"4\">",
      "<span class=\"prev link\" ng-click=\"DateTime.showUI='calendar'\"><i class=\"left chevron icon\"></i></span>",
      "<span class=\"link\">{{DateTime.nice_date | date: \"longDate\"}}</span></td></tr></thead>",
      "<tr ng-repeat=\"timeRow in DateTime.timeOptions track by $index\">",
        "<td ng-repeat=\"timeCol in timeRow\" class=\"link\" ng-class=\"{selected:timeCol[1]==DateTime.hour}\"  ng-click=\"DateTime.setHour(timeCol[1]);DateTime.showUI='minutes'\">",
          "{{timeCol[0]}}",
        "</td>",
      "</tr>",
      "</table>",
      "<table style=\"width:340px\" ng-if=\"DateTime.showUI=='minutes'\" class=\"ui celled center aligned unstackable table seven column day\" >",
      "<thead><tr><th colspan=\"4\">",
      "<span class=\"prev link\" ng-click=\"DateTime.showUI='clock'\"><i class=\"left chevron icon\"></i></span>",
      "<span class=\"link\">{{DateTime.nice_date | date: \"longDate\"}}</span></td></tr></thead>",
      "<tr ng-repeat=\"timeRow in DateTime.minuteOptions track by $index\">",
        "<td ng-repeat=\"timeCol in timeRow\" class=\"link\" ng-class=\"{selected:timeCol[1]==DateTime.minute}\"  ng-click=\"DateTime.setMinutes(timeCol[1]);DateTime.showUI='timezone'\">",
          "{{timeCol[0]}}",
        "</td>",
      "</tr>",
      "</table>",

      "<table style=\"width:340px\" ng-if=\"DateTime.showUI=='timezone'\" class=\"ui celled center aligned unstackable table seven column day\" >",
      "<thead><tr><th colspan=\"2\">",
      "<span class=\"prev link\" ng-click=\"DateTime.showUI='minutes'\"><i class=\"left chevron icon\"></i></span>",
      "<span class=\"link\">{{DateTime.nice_date | date: \"longDate\"}}</span></td></tr></thead>",
      "<tr ng-repeat=\"timeRow in DateTime.timezones track by $index\">",
        "<td ng-repeat=\"timeCol in timeRow\" class=\"link\" ng-class=\"{selected:timeCol==DateTime.timezone}\"  ng-click=\"DateTime.setTimezone(timeCol);DateTime.hidePopup()\">",
          "{{timeCol}}",
        "</td>",
      "</tr>",
      "</table>",

              "</div>"
    ].join(""),
    link: function(scope, el, attr){



      var DateTimeInstance = /**@class*/ (function(){
        function DateTime(dateTimeStr, scope){
          this.scope = scope;
          var dateTimeFormat = dateTimeStr.split("|");
          var dateMoment = $Moment(dateTimeFormat[0]);

          if(dateMoment.isValid()) {

            this.setYear(dateMoment.year());
            this.setMonth(dateMoment.month());
            this.setDay(dateMoment.date());
            this.setHour(dateMoment.hour());
            this.setMinutes(dateMoment.minute());
            this.setTimezone(dateTimeFormat[1]);
            this.updateDateTimeStr();

          } else {
            var newDate = new Date();
            this.setYear(newDate.getFullYear());
            this.setMonth(newDate.getMonth());
            this.setDay(newDate.getDate());
            this.setHour(12);
            this.setMinutes("00");
            this.setTimezone("US/Eastern");
            this.updateDateTimeStr();

          }
          this.showUI = "calendar";
          this.timeOptions = [
            [["12:00 AM", 0],
            ["1:00 AM", 1],
            ["2:00 AM", 2],
            ["3:00 AM", 3]],
            [["4:00 AM", 4],
            ["5:00 AM", 5],
            ["6:00 AM", 6],
            ["7:00 AM", 7]],
            [["8:00 AM", 8],
            ["9:00 AM", 9],
            ["10:00 AM", 10],
            ["11:00 AM", 11]],
            [["12:00 PM", 12],
            ["1:00 PM", 13],
            ["2:00 PM", 14],
            ["3:00 PM", 15]],
            [["4:00 PM", 16],
            ["5:00 PM", 17],
            ["6:00 PM", 18],
            ["7:00 PM", 19]],
            [["8:00 PM", 20],
            ["9:00 PM", 21],
            ["10:00 PM", 22],
            ["11:00 PM", 23]]

          ]
          this.hourOptions = [1,2,3,4,5,6,7,8,9,10,11,12];
          this.minuteOptions = ["00",15,30,45];
          this.timezones = [["US/Eastern","US/Central"],["US/Mountain","US/Pacific"]];
          this.Calendar = new CalendarInstance(this);
        }
        DateTime.prototype.setDate = function(dateArray){
          console.log("DATEARRAY", dateArray);
          this.setYear(dateArray[2]);
          this.setMonth(dateArray[0]);
          this.setDay(dateArray[1]);
          this.showUI = "clock";
        };
        DateTime.prototype.setDay = function(n){
          this.sel_day = (this.day = n);
          this.updateDateTimeStr();
        };
        DateTime.prototype.setMonth = function(n){
          this.sel_month = (this.month = n);
          this.updateDateTimeStr();
        };
        DateTime.prototype.setYear = function(n){
          this.sel_year = (this.year = n);
          this.updateDateTimeStr();
        };
        DateTime.prototype.setMinutes = function(n){
          this.sel_minute = (this.minute = n);
          this.updateDateTimeStr();
        };
        DateTime.prototype.setHour = function(n){
          this.sel_hour = (this.hour = n);

          this.minuteOptions = [];
          for(var i=0;i<4;i++){
            console.log([this.hour+(i*15==0 ? "00" : i*15), i*15]);
            var a = new Date(this.year, this.month, this.day, this.hour, i*15);
            this.minuteOptions.push([$filter('date')(a, 'shortTime'), i*15]);
          }
          this.minuteOptions = [this.minuteOptions];
          this.updateDateTimeStr();
        };
        DateTime.prototype.setTimezone = function(n){
          this.sel_timezone = (this.timezone = n);
          this.updateDateTimeStr();
        };

        DateTime.prototype.hidePopup = function(){
          jQuery(el).find('.dateInput').popup("hide");
          setTimeout(function(){
            this.showUI = 'calendar';
          },1000);
        };
        DateTime.prototype.updateDateTimeStr = function(){
          var DT = this; var firstRun = 0;


            var tmpDate = new $Moment();
            var defaultDate = new Date();

            // .tmpDate.tz(this.timezone);
            tmpDate.year(this.year);
            tmpDate.month(this.month);
            tmpDate.date(this.day);
            tmpDate.hour(this.hour);
            tmpDate.minute(this.minute);
            tmpDate.milliseconds(0);
            tmpDate.seconds(0);





          // this.scope.$apply(function(){
            this.nice_date = $filter('date')(new Date(this.year, this.month, this.day), 'longDate');
            this.nice_fullDate = $Moment(tmpDate).format("dddd, MMMM D, YYYY, h:mm a") + " " + this.timezone;


            DT.scope.ngModel = tmpDate.toISOString()+ "|"+ this.timezone;
            if(DT.scope.ngModel!=="") {
              DT.scope.ngChange();
            }

          // });

          // jQuery(el).find('.dateInput').popup("hide");
          // $filter('date')(time_js, format);
          //scope.ngModel = this.year + "-" + ((n[0]+1) < 10 ? "0"+ (n[0]+1) : n[0]+1 ) + "-" + (n[1] < 10 ? "0"+ n[1] : n[1]);
        }

        return DateTime;
      })();




var ClockInstance = (function(){
  function ClockInstance(){

  }
  ClockInstance.prototype.setHour = function(n){

  };
})();
var CalendarInstance = /**@class*/ (function(){
  function CalendarInstance(_super){
    var CI = this;
    this._super = _super;
    this._super.scope.$apply(function(){
      CI.nice_month = new Date(CI._super.year, CI._super.month);
      CI.weeks = CI.getWeeks();
    });

  }
  CalendarInstance.prototype.updateDate = function(){

  };
  CalendarInstance.prototype.advanceMonth = function(inc){
    var CI = this;
    // console.log(CI.super.month, CI.super.year);
    if ( inc<0 && CI._super.month-1 == -1 ) { CI._super.month = 11;}
    else if ( inc>0 && CI._super.month+1 == 12 ) { CI._super.month = 0;}
    else { CI._super.month += inc; }

    if(inc<0 && CI._super.month==11) CI._super.year-=1;
    if(inc>0 && CI._super.month==0 ) CI._super.year+=1;

    CI.nice_month = new Date(CI._super.year, CI._super.month);
    CI.weeks = CI.getWeeks();
  };
  CalendarInstance.prototype.getWeeks = function(){
    var CI = this;
    var startDate = new Date(CI._super.year, CI._super.month, 1).getDay();
    var endDate = new Date(CI._super.year, CI._super.month+1, 0).getDate();
    var weeks = [[]], pointer = 0, day = 1;

    //first week
    var prevMonthEnds = new Date((CI._super.month-1 ==-1 ? CI._super.year : CI._super.year-1), (CI._super.month-1 ==-1 ? 11 : CI._super.month-1), 0).getDate();
    var pday = 1;
    for(var i=prevMonthEnds; i>(prevMonthEnds-startDate); i--){
      weeks[pointer].unshift([
        (CI._super.month-1 ==-1 ? 11 : CI._super.month-1),
        i,
        (CI._super.month-1 ==-1 ? CI._super.year-1 : CI._super.year)]);
    }

    // rest of the month
    for(var i=0; i<(42-startDate); i++){
      weeks[pointer].push(day <= endDate ? [CI._super.month, day, CI._super.year] :
        [
          (CI._super.month+1 ==12 ? 0 : CI._super.month+1),
          day-endDate,
          (CI._super.month+1 ==12 ? CI._super.year+1 : CI._super.year)
        ]);
      if(((startDate + day) % 7) == 0 ){
        weeks.push([]);
        pointer++;
      }
      day++;

    }

    return weeks;

  };
  return CalendarInstance;
})();








///init
      $timeout(function(){
        scope.DateTime = new DateTimeInstance(scope.ngModel, scope);
        var popup = jQuery(el).find('.ui.popup');
        jQuery(el).find('.dateInput').popup({
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
				// scope.$parent[attr.ondrop.replace("()", "")](evt);
				console.log('dropping', evt);
				scope.$apply(function(){
					scope.ondrop({ "evt": evt });
				});

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
