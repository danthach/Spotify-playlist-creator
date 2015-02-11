(function (window, angular, undefined) {
  'use strict';

  angular
    .module('spotify', [])
    .provider('Spotify', function () {

      // Module global settings.
      var settings = {};
      settings.clientId = null;
      settings.redirectUri = null;
      settings.scope = null;
      settings.accessToken = null;

      this.setClientId = function (clientId) {
        settings.clientId = clientId;
        return settings.clientId;
      };

      this.getClientId = function () {
        return settings.clientId;
      };

      this.setRedirectUri = function (redirectUri) {
        settings.redirectUri = redirectUri;
        return settings.redirectUri;
      };

      this.getRedirectUri = function () {
        return settings.redirectUri;
      };

      this.setScope = function (scope) {
        settings.scope = scope;
        return settings.scope;
      };

      var utils = {};
      utils.toQueryString = function (obj) {
        var parts = [];
        angular.forEach(obj, function (value, key) {
          this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }, parts);
        return parts.join('&');
      };

      /**
       * API Base URL
       */
      settings.apiBase = 'https://api.spotify.com/v1';

      this.$get = ['$q', '$http', '$window', function ($q, $http, $window) {

        function NgSpotify () {
          this.clientId = settings.clientId;
          this.redirectUri = settings.redirectUri;
          this.apiBase = settings.apiBase;
          this.scope = settings.scope;
          this.accessToken = null;
          this.toQueryString = utils.toQueryString;
        }

        NgSpotify.prototype.api = function (endpoint, method, params, data, headers) {
          var deferred = $q.defer();

          $http({
            url: this.apiBase + endpoint,
            method: method ? method : 'GET',
            params: params,
            data: data,
            headers: headers
          })
          .success(function (data) {
            deferred.resolve(data);
          })
          .error(function (data) {
            deferred.reject(data);
          });
          return deferred.promise;
        };

        /**
         * Search Spotify
         * q = search query
         * type = artist, album or track
         */
        NgSpotify.prototype.search = function (q, type, options) {
          options = options || {};
          options.q = q;
          options.type = type;

          return this.api('/search', 'GET', options);
        };

        

        /**
          ====================== Login =====================
         */
        NgSpotify.prototype.setAuthToken = function (authToken) {
          this.authToken = authToken;
          return this.authToken;
        };

        NgSpotify.prototype.login = function () {
          var deferred = $q.defer();
          var that = this;

          var w = 400,
              h = 500,
              left = (screen.width / 2) - (w / 2),
              top = (screen.height / 2) - (h / 2);

          var params = {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope || '',
            response_type: 'token'
          };

          var authWindow = window.open(
            'https://accounts.spotify.com/authorize?' + this.toQueryString(params),
            'Spotify',
            'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left
          );

          function storageChanged (e) {
            if (e.key === 'spotify-token') {
              if (authWindow) {
                authWindow.close();
              }

              that.setAuthToken(e.newValue);
              $window.removeEventListener('storage', storageChanged, false);
              //localStorage.removeItem('spotify-token');

              deferred.resolve(e.newValue);
            }
          }

          $window.addEventListener('storage', storageChanged, false);

          return deferred.promise;
        };

        return new NgSpotify();
      }];

    });

}(window, angular));
