'use strict';

angular.module('hopsWorksApp')
        .controller('RegCtrl', ['AuthService', '$location', '$scope', 'SecurityQuestions', '$routeParams', '$cookies',
          function (AuthService, $location, $scope, SecurityQuestions, $routeParams, $cookies) {
          
            var self = this;
            self.securityQuestions = SecurityQuestions.getQuestions();
            self.working = false;
            self.otp = $cookies.get('otp');
            self.newUser = {
              firstName: '',
              lastName: '',
              email: '',
              telephoneNum: '',
              chosenPassword: '',
              repeatedPassword: '',
              securityQuestion: '',
              securityAnswer: '',
              ToS: '',
              authType: 'Mobile',
              twoFactor: false,
              toursEnabled: true,
              orgName: '',
              dep: '',
              street: '',
              city: '',
              postCode: '',
              country: '',
              CaptchaInput: ''
            };
            
            self.userEmail ='';
            
            self.QR = $routeParams.QR;
            var empty = angular.copy(self.user);
            self.register = function () {
              self.successMessage = null;
              self.errorMessage = null;
              if ($scope.registerForm.$valid) {
                self.working = true;
                if (self.otp === 'false' || !self.newUser.twoFactor) {
                  AuthService.register(self.newUser).then(
                          function (success) {
                            self.user = angular.copy(empty);
                            $scope.registerForm.$setPristine();
                            self.successMessage = success.data.successMessage;
                            self.working = false;
                            //$location.path('/login');
                          }, function (error) {
                             self.working = false;
                             self.errorMessage = error.data.errorMsg;
                  });
                }else  if (self.newUser.authType === 'Mobile') {
                  AuthService.register(self.newUser).then(
                          function (success) {
                            self.user = angular.copy(empty);                         
                            $scope.registerForm.$setPristine();
                            self.successMessage = success.data.successMessage;
                            self.working = false;
                            $location.path("/qrCode/" + success.data.QRCode);
                            $location.replace();
                            //$location.path('/login');
                          }, function (error) {
                    self.working = false;
                    self.errorMessage = error.data.errorMsg;
                  });
                }else if (self.newUser.authType === 'Yubikey') {
                  AuthService.registerYubikey(self.newUser).then(
                          function (success) {
                            self.user = angular.copy(empty);
                            $scope.registerForm.$setPristine();
                            self.successMessage = success.data.successMessage;
                            self.working = false;
                            self.userEmail= success.data.userEmail;
                            $location.path("/yubikey");
                            $location.replace();
                            //$location.path('/login');
                          }, function (error) {
                    self.working = false;
                    self.errorMessage = error.data.errorMsg;
                  });
                }
                ;
              }
              ;

            };
            self.countries = getAllCountries(); 

    self.resetCaptcha = function () {    
    
        var no_acak = "";
        var possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
         var length = Math.floor((Math.random() * 3) + 6);
         //alert(length);
            for (var i = 0; i < length; i++) {
                no_acak += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            }
	var posisi_x = Math.floor((Math.random() * 50) + 1);
	var posisi_y = Math.floor((Math.random() * 50) + 10);
        var c = document.getElementById("CaptchaDiv");
        var canvas = c.getContext("2d");
        canvas.clearRect(0, 0, 150, 60);
        var gradient=canvas.createLinearGradient(0,0,c.width,0);
        gradient.addColorStop("0","blue");
        gradient.addColorStop("1","green");
        canvas.fillStyle=gradient;	
        canvas.beginPath();
        canvas.rect(0, 0, 150, 60);
        canvas.fill();	

        var ctx = c.getContext("2d");
        ctx.fillStyle="#000000";
        ctx.font = '18px serif';
        ctx.strokeText(no_acak, posisi_x, posisi_y);
        document.getElementById("CaptchaInput").setAttribute("c", no_acak); 
        document.getElementById("txtCaptcha").value = no_acak;      


}
     
            
            
          }]);
