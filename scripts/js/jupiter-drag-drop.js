angular.module('JupiterDragDrop', [])
.service("$DragDrop", function $DragDrop(){
  var self = this;
  this.dragTarget = null;
  this.dragDestination = null;
  this.clearTargets = function(){
    this.dragTarget = null;
    this.dragDestination = null;
  };
  this.isDragging = false;
  this.completeDrag = function(){

    //verify that we're still good.
    self.isDragging = false;
    if(self.dragTarget === null || self.dragDestination=== null) return false;

    //find the element in the list and separate it.
    var move = jQuery.extend({}, self.dragTarget.parent[self.dragTarget.index]);
    self.dragTarget.parent.splice(self.dragTarget.index, 1);

    // console.log('removing', move.type, 'at ' + self.dragTarget.index);


    if(self.dragDestination.index==0){
      // console.log('unshifting', move.type, 'at '+self.dragDestination.index);
      self.dragDestination.parent.unshift(move);
    } else {
      // console.log('adding', move.type, 'at '+ self.dragDestination.index);
      self.dragDestination.parent.splice(self.dragDestination.index, 0, move);
    }
//console.log(self.dragDestination.parent);


  };
  this.setDragTarget = function(el){
    // console.log('set dt',el);
    self.dragTarget = el;
  };
  this.setDragDestination = function(el){
    // console.log('set dd',el);
    self.dragDestination = el;
  };
  return self;
});

angular.module('JupiterDragDrop')
.directive('jupiterDraggable', [
  '$timeout', '$DragDrop', function($timeout, $DragDrop){

  return {
    restrict: "E",
    // replace: true,
    // template: "<div class=\"draggable\"><div jupiter-drag-handle>Drag</div></div>",
    scope: {
      dragParent: "=",
      dragItem: "=",
      dragIndex: "=",
      dragItemOverride: "@"
    },
    link: function(scope,el,attr,ctrl,transclude){
      // console.log(scope);

      // jQuery(el).on()


    }
  };
}]);

angular.module('JupiterDragDrop')
.directive('jupiterDragHandle',
['$timeout','$DragDrop', function($timeout,$DragDrop){
  return {
    restrict: "A",
    scope:{},
    link: function(scope, el, attr){

      $timeout(function(){
        var target = false;
        // console.log(scope,attr);
        var handle = jQuery(el).hasClass('drag-handle') ? jQuery(el).get(0) : jQuery(el).find('.drag-handle').get(0);


        (function($){
          var timer = null;
          
          var dragParent = $(el).parents('.draggable').first();

          $(el).css("cursor", "move");
          $(el).on('mouseup', function(evt){
            dragParent.attr("draggable", "false");
            target = false;
          });

          $(el).on('mousedown', function(evt){

            if(!$DragDrop.isDragging){
              // console.log(dragParent);

              $DragDrop.clearTargets();
              dragParent.attr("draggable", "true");
              target = evt.target;
              // console.log('mousedown', evt.target);

              $DragDrop.setDragTarget({
                parent: scope.$$prevSibling.dragParent,
                index: scope.$$prevSibling.dragIndex
              });
            }
            evt.stopPropagation();

          });

          $(el).on('dragstart', function(evt){
            // console.log('dragstart', evt.target);

            if(handle==target && evt.dataTransfer.setData){
              $DragDrop.isDragging = true;
              evt.dataTransfer.setData('text/plain', 'handle');
            } else {
              evt.preventDefault();
            }
          });

          $(el).on('dragover', function(evt){
            evt.stopPropagation();
            dragParent.addClass("dropBefore");
            $DragDrop.setDragDestination({
              parent: scope.$$prevSibling.dragParent,
              index: scope.$$prevSibling.dragIndex
            });
            evt.preventDefault();
          });

          $(el).on('drop dragend', function(evt){

            // console.log('dropped', scope);
            $(el).removeClass("dropBefore");
            scope.$apply(function(){
              $DragDrop.completeDrag();

            });
            evt.stopPropagation();
            evt.preventDefault();

          });

          $(el).on('dragleave dragexit dragend', function(evt){
            evt.stopPropagation();
            clearTimeout(timer);
            timer = setTimeout(function(){
              dragParent.removeClass("dropBefore");
              $DragDrop.setDragDestination(null);

            }, 500);

            evt.preventDefault();
          });

        })(jQuery);

      });
    }
  };
}]);

angular.module('JupiterDragDrop')
.directive('jupiterDropzone', ['$timeout','$DragDrop', function($timeout,$DragDrop){
  return {
    restrict: "E",
    scope: {
      parent:"=",
      col:"=",
      hasChildren:"@",
      index:"="
    },
    template: '<div class="ju-drop"></div>',
    link: function(scope, el, attr){
      $timeout(function(){
        var timer = null;


        (function($){
          $(el).on('dragover dragenter', function(evt){
            evt.stopPropagation();
            evt.preventDefault();
            jQuery(el).addClass("active");
            console.log(scope);
            if(!scope.col){

              if(scope.hasChildren){
                console.log("HAS CHILDREN");
                if(scope.parent && !scope.parent.children){
                  scope.parent.children=[];
                }
                $DragDrop.setDragDestination({
                  parent: scope.parent.children,
                  index: scope.parent.children.length
                });
              } else {
                console.log("INDEX", scope.index);
                $DragDrop.setDragDestination({
                  parent: scope.parent,
                  index: scope.index ? Math.max(0, scope.index) : scope.parent.length
                });
              }


            } else {
              if(scope.parent && !scope.parent.children){

                if(scope.col){
                  scope.parent.children = {};
                  scope.parent.children[scope.col] = [];
                } else {
                  scope.parent.children = [];
                }
              }
              // if(scope.parentWithChildren && !scope.parentWithChildren.children){
              //   scope.parentWithChildren = {};
              // }
              // if(scope.col && scope.parentWithChildren && scope.parentWithChildren.children && !scope.parentWithChildren.children[scope.col]){
              //   scope.parentWithChildren.children[scope.col] = [];
              //


              if(scope.col !== undefined){
                if(!scope.parent.children[scope.col]){
                  scope.parent.children[scope.col] = [];
                }
                $DragDrop.setDragDestination({
                  parent: scope.parent.children[scope.col],
                  index: scope.parent.children[scope.col].length
                });

              } else {
                $DragDrop.setDragDestination({
                  parent: scope.parent.children,
                  index: scope.parent.children.length
                });
              }


            }


          });
          $(el).on('dragend dragleave', function(evt){
            evt.stopPropagation();
            console.log(scope);



          });
          // $(el).parent().on('drop dragdrop', function(){alert('alert')});

          $(el).on('drop dragdrop', function(evt){

            console.log("DRAG", $DragDrop);
            clearTimeout(timer);
            timer = setTimeout(function(){
              $(el).removeClass("active");

              scope.$apply(function(){
                $DragDrop.completeDrag();
              });
            },400);

            // evt.stopPropagation();
            // evt.preventDefault();
          });


        })(jQuery);




      });
    }
  };
}]);
