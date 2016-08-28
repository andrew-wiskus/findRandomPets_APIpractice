var myApp = angular.module('myApp', []);

myApp.filter('unique', function() {
    return function(arr, field) {
        return _.uniq(arr, function(a) {
            return a[field];
        });
    };
});

myApp.controller("petController", ["$scope", "$http", function($scope, $http) {
    //MARK:------INITS KEY + URL FOR API USE
    var key = 'b900e0d5e332753a460a64eaa8de00fd';
    var baseURL = 'http://api.petfinder.com/';
    //MARK:------INITS SCOPED VARIABLES FOR SHOW/HIDE AND DROP DOWNS
    initDOM();



    //MARK:------UPDATES DISPLAY TO SHOW FAVORITES WINDOW OR UPDATE WHEN FAVORITE FILTER'S VALUE CHANGES
    $scope.findFavorites = function(selected) {
        getFavoritesData(selected);
        $scope.showFavorite = false;
        $scope.showRandom = true;
        $scope.isfavorited = true;
    };

    //MARK:------CALLS API TO FIND A RANDOM PET BASED ON ANIMAL TYPE
    $scope.randomPet = function(animal_name) {
        //build unique query
        var query = buildQuery(animal_name);
        //call api to build scoped pet object
        makeAPICallForPetObject(query, animal_name);
    };

    //MARK:------POSTS TO DATABASE A NEW FAVORITED PET OBJECT
    $scope.addFavorite = function() {
        //hides favorite button to prevent dups.
        $scope.isfavorited = true;

        //builds then posts pet object to database, updates favorite list
        var favoritePet = buildPetObject();
        $http.post('/favorites', favoritePet).then(function() {
                      getFavoritesData("All");
            }


        );
    };

    //MARK:------BUILDS UNIQUE QUERY STRING FOR SPECIFIED ANIMAL
    function buildQuery(animal_name){
      var query = baseURL + 'pet.getRandom';
      query += '?key=' + key;
      query += '&animal=' + animal_name;
      query += '&output=basic';
      query += '&format=json';

      return query;
    }

    //MARK:------MAKES API CALL TO BUILD PET OBJECT
    function makeAPICallForPetObject(query, animal_name){
      var request = encodeURI(query) + '&callback=JSON_CALLBACK';
      $http.jsonp(request).then(function(response) {
          $scope.isfavorited = false;
          $scope.showRandom = false;
          $scope.showFavorite = true;
          $scope.pet = response.data.petfinder.pet;
          $scope.pet.animalType = animal_name;
      });
    }

    //MARK:------BUILDS PET OBJECT FOR POST REQUEST
    function buildPetObject(){
      var typeAnimal = $scope.pet.breeds.breed.$t;
      var petDescription = $scope.pet.description.$t;

      if (petDescription === undefined) {
          petDescription = "no description";
      } else if (petDescription.length > 100) {
          petDescription = petDescription.substring(0, 100);
          petDescription += "...";
      }

      if (typeAnimal === null) {
          typeAnimal = "no description";
      }


      var favoritePet = {
          pet_name: $scope.pet.name.$t,
          pet_age: $scope.pet.age.$t,
          pet_img: $scope.pet.media.photos.photo[2].$t,
          pet_description: petDescription,
          pet_type: typeAnimal,
          pet_id: $scope.pet.id.$t,
          pet_animal: $scope.pet.animalType
      };

      console.log(favoritePet);
      return favoritePet;

    }

    //MARK:------INITS ALL SCOPED VARIABLES NECESSARY AT DOC_LOAD
    function initDOM(){
      getFavoritesData();
      $scope.isfavorited = false;
      $scope.showFavorite = true;
      $scope.showRandom = true;
      $scope.showOptions = true;

      $scope.options = [{
          id: 1,
          name: 'bird'
      }, {
          id: 2,
          name: 'dog'
      }, {
          id: 3,
          name: 'cat'
      }, {
          id: 4,
          name: 'pig'
      }];

      $scope.animalTypes = [];


    }

    //MARK:------COUNTS AMOUNT OF FAVORITES BY ANIMAL TYPE
    function countFavorites() {
        $scope.favoriteCount = _.countBy($scope.animalTypes, function(animal) {
            var match = "";
            $scope.animalTypes.forEach(function(theType, i) {
                if (animal.name == theType.name) {
                    match = theType.name;
                }
            });
            // console.log(match);
            return match;
        });
        console.log("favoriteCount:", $scope.favoriteCount);
    }

    //MARK:------FILTERS FAVORITES OUTPUT BY SELECTION FROM DROPDOWN
    function changeFavoriteOutput(dataOf, selected) {
        $scope.favorites = dataOf.length;
        if (selected != "All" && selected !== undefined) {
            //MARK:------SHOW ONLY SELECTED ANIMAL TYPE IN FAVORITES
            $scope.currentFavorites = [];
            dataOf.forEach(function(pet, i) {
                if (pet.pet_animal == selected) {
                    $scope.currentFavorites.push(pet);
                }
            });
        } else {
            //MARK:------IF ALL NO SPECIFIC DROPDOWN WAS SELECTED -> SHOW ALL
            $scope.currentFavorites = dataOf;
        }


    }

    //MARK:------CALLS GET REQUEST TO BUILD FAVORITE LIST BY TYPE
    function getFavoritesData(selectedType) {
        $http.get('/favorites').then(
            function(response) {
                changeFavoriteOutput(response.data, selectedType);
                findTypes(response.data);
                countFavorites();

            }
        );
    }

    //MARK:------BUILDS ARRAY CONTAINING ALL ANIMAL TYPES
    function findTypes(theData) {
        $scope.animalTypes = [];
        theData.forEach(function(animal, i) {
            $scope.animalTypes.push({
                name: animal.pet_animal
            });
        });
    }



}]);
