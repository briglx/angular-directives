var app = angular.module('$strap.directives');

app.directive('blTypeahead', ['$parse',function($parse) {
    // return the directive link function. (compile function not needed)
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, controller)
        {


            var itemStr =  attrs.blTypeahead.replace(/\s+/g, '');
            var items = itemStr.split(",");
            var urnModel = $parse(items[0]);
            var urnLabel = $parse(items[1]);

            var getter = $parse(items[0]),
                setter = getter.assign,
                value = getter(scope);

            $(element).typeahead({
                source: function ( query, process ) {

                    //the "process" argument is a callback, expecting an array of values (strings) to display

                    //get the data to populate the typeahead (plus some)
                    //from your api, wherever that may be
                    $.get( '/services/knowledge/v1/solr/search?searchtype=suggest&concepttype=GLOSSEXTENDED_ONTOCHILD_LEV1', { searchtext: query }, function ( data ) {
                        //$.get( '/js/mock-solr.js', {searchtext: query }, function ( data ) {

                        //reset these containers
                        concepts = {};
                        conceptLabels = [];


                        //for each item returned, if the display name is already included
                        //(e.g. multiple "John Smith" records) then add a unique value to the end
                        //so that the user can tell them apart. Using underscore.js for a functional approach.
                        _.each( data.concepts, function( item, ix, list ){
                            if ( _.contains( concepts, item.label ) ){
                                item.label = item.label + ' #' + item.id;
                            }

                            //add the label to the display array
                            conceptLabels.push( item.label );

                            //also store a mapping to get from label back to ID
                            concepts[ item.label ] = item.id;
                        });

                        //return the display array
                        process( conceptLabels );
                    }, "json");
                }
                , updater: function (item) {

                    //save the id value into the hidden field
                    // $( "#conceptId" ).val( concepts[ item ] );

                    var urn = concepts[ item ];

                    scope.$apply(function(){
                        urnModel.assign(scope, urn);
                        urnLabel.assign(scope, item);

                    });

                    //return the string you want to go into the textbox (e.g. name)
                    return item;
                }
            });


        }
    }

}]);
