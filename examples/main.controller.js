angular
  .module('exampleApp', ['spotify'])
  .config(function (SpotifyProvider) {
    SpotifyProvider.setClientId('593a15de0da3423e95953a074d281e9d');
    SpotifyProvider.setRedirectUri('http://example.com/callback.html');
    SpotifyProvider.setScope('playlist-read-private');
  })

  // .controller('myController', function($scope, userRepository) {
  //   $scope.formData = {};
  //   $scope.check = function (zip) {
  //     console.log(zip); 
  //     userRepository.getAllUsers(zip).success(function(weatherDesc) {
  //       console.log(weatherDesc);
  //       $scope.users = weatherDesc.query.results.channel.item.forecast[0].text;
  //     });
  //   }
  // })
    
  .factory('userRepository', function ($http) {  
    return {
      getAllUsers: function(zip) {
        //console.log(zip);
        return $http.get('http://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20weather.forecast%20WHERE%20location%3D%22' + zip + '%22&format=json&diagnostics=true&callback=');
      }
    };  
  })



  .controller('MainController', ['$scope', 'Spotify', 'userRepository', function ($scope, Spotify, userRepository) {

    $scope.login = function () {
      Spotify.login().then(function (data) {
        console.log(data);
        alert("You are now logged in");
      })
    };


    $scope.searchArtist = function (text) {
      Spotify.search(text, 'track').then(function (data){

        var length = data.tracks.items.length; 
        var removeRemixes = data.tracks.items.filter(function (value) {
          if(value.name.indexOf("Remix") >= 0) {
            return false;
          }
          return true;
        });

        $scope.artists = removeRemixes;
        console.log($scope.artists);
      });
    };

    $scope.check = function (zip) {
      console.log(zip); 
      userRepository.getAllUsers(zip).success(function(weatherDesc) {     
        $scope.users2 = weatherDesc.query.results.channel.item.forecast[0].text;
        console.log($scope.users2);
        $scope.searchArtist($scope.users2);
      });
    };
  }]);

