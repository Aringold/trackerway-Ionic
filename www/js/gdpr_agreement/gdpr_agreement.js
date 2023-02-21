(function () {
    angular.module("rewire.gdprAgreement", ['rewire.settings']);
    angular.module("rewire.gdprAgreement").controller("gdprAgreementController", gdprAgreementController);

    gdprAgreementController.$inject = ["$q", "gdprAgreementService", "$scope", "$rootScope", "userModel", "$ionicPopup"];

    function gdprAgreementController($q, gdprAgreementService, $scope, $rootScope, userModel, $ionicPopup) {

        var vm = this;

        vm.selectCountry = selectCountry;
        vm.formatCountry = formatCountry;
        vm.selectLanguage = selectLanguage;
        vm.formatLanguage = formatLanguage;
        vm.selectTimeZone = selectTimeZone;
        vm.formatTimeZone = formatTimeZone;
        vm.checkFields = checkFields;
        vm.acceptAgreement = acceptAgreement;
        vm.checkboxAgreement = false;
        vm.validPhoneNumber;

        vm.language = [
            { locale: "en", lang: "English" },
            { locale: "sq", lang: "Albanian" },
            { locale: "ar", lang: "Arabic" },
            { locale: "bg", lang: "Bulgarian" },
            { locale: "hr", lang: "Croatian" },
            { locale: "da", lang: "Danish" },
            { locale: "nl", lang: "Dutch" },
            { locale: "et", lang: "Estonian" },
            { locale: "fa", lang: "Farsi(Persian)" },
            { locale: "fr", lang: "French" },
            { locale: "de", lang: "German" },
            { locale: "el", lang: "Greek" },
            { locale: "hu", lang: "Hungarian" },
            { locale: "it", lang: "Italian" },
            { locale: "ja", lang: "Japanese" },
            { locale: "lt", lang: "Lithuanian" },
            { locale: "nb", lang: "Norsk" },
            { locale: "pl", lang: "Polish" },
            { locale: "pt", lang: "Portuguese" },
            { locale: "ro", lang: "Romanian" },
            { locale: "ru", lang: "Russian" },
            { locale: "sr", lang: "Serbian" },
            { locale: "sk", lang: "Slovak" },
            { locale: "es", lang: "Spanish" },
            { locale: "sv", lang: "Swedish" },
            { locale: "th", lang: "Thai" },
            { locale: "tr", lang: "Turkish" },
            { locale: "khm", lang: "Khmer" }
        ];

        function selectCountry() {
            if (vm.modalIsOpen) {
                return;
            }
  
            vm.modalIsOpen = true;

            $scope.countrys = vm.country;
  
            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }
  
            var popup = $ionicPopup.show({
                templateUrl: 'js/gdpr_agreement/select_country.html',
                cssClass: 'popup-with-search',
                title: 'Select Country',
                scope: $scope,
                buttons: [
                    {
                    text: 'Cancel' 
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            vm.userData.country = $scope.selectedItem;
							return vm.userData.country;
                        }
                    }
                ]
            });
  
            popup.then(function(res) {
                vm.modalIsOpen = false;
            });
        }

        function formatCountry() {
			return vm.country.find(function(country) {
				return country.country == vm.userData.country;
			}).country;
        }

        function selectLanguage() {
            if (vm.modalIsOpen) {
                return;
            }
  
            vm.modalIsOpen = true;

            $scope.language = vm.language;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/gdpr_agreement/select_language.html',
                cssClass: 'popup-with-search',
                title: 'Select Language',
                scope: $scope,
                buttons: [
                    {
                    text: 'Cancel' 
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            vm.userData.language = $scope.selectedItem;
							return vm.userData.language;
						}
                    }
                ]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
            });
        }

        function formatLanguage() {
			return vm.language.find(function(locale) {
				return locale.lang == vm.userData.language;
			}).lang;
        }
        
        function selectTimeZone() {
            if (vm.modalIsOpen) {
                return;
            }
  
            vm.modalIsOpen = true;

            $scope.timezone = vm.timeZone;

            $scope.selectItem = function(value) {
                $scope.selectedItem = value;
            }

            var popup = $ionicPopup.show({
                templateUrl: 'js/gdpr_agreement/select_timezone.html',
                cssClass: 'popup-with-search',
                title: 'Select Timezone',
                scope: $scope,
                buttons: [
                    {
                    text: 'Cancel' 
                    }, {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            vm.userData.timezone.title = $scope.selectedItem.title;
                            vm.userData.timezone.value = $scope.selectedItem.value;
                            return vm.userData.timezone;
						}
                    }
                ]
            });

            popup.then(function(res) {
                vm.modalIsOpen = false;
            });
        }

        function formatTimeZone() {
			return vm.timeZone.find(function(timezone) {
				return timezone.title == vm.userData.timezone.title;
			}).title;
        };
        
        vm.country = [
            {value: 'Afghanistan', country: 'Afghanistan'},
            {value: 'Albania', country: 'Albania'},
            {value: 'Algeria', country: 'Algeria'},
            {value: 'American Samoa', country: 'American Samoa'},
            {value: 'Andorra', country: 'Andorra'},
            {value: 'Angola', country: 'Angola'},
            {value: 'Anguilla', country: 'Anguilla'},
            {value: 'Antarctica', country: 'Antarctica'},
            {value: 'Antigua and Barbuda', country: 'Antigua and Barbuda'},
            {value: 'Argentina', country: 'Argentina'},
            {value: 'Armenia', country: 'Armenia'},
            {value: 'Aruba', country: 'Aruba'},
            {value: 'Australia', country: 'Australia'},
            {value: 'Austria', country: 'Austria'},
            {value: 'Azerbaijan', country: 'Azerbaijan'},
            {value: 'Bahamas', country: 'Bahamas'},
            {value: 'Bahrain', country: 'Bahrain'},
            {value: 'Bangladesh', country: 'Bangladesh'},
            {value: 'Barbados', country: 'Barbados'},
            {value: 'Belarus', country: 'Belarus'},
            {value: 'Belgium', country: 'Belgium'},
            {value: 'Belize', country: 'Belize'},
            {value: 'Benin', country: 'Benin'},
            {value: 'Bermuda', country: 'Bermuda'},
            {value: 'Bhutan', country: 'Bhutan'},
            {value: 'Bolivia', country: 'Bolivia'},
            {value: 'Bosnia and Herzegovina', country: 'Bosnia and Herzegovina'},
            {value: 'Botswana', country: 'Botswana'},
            {value: 'Bouvet Island', country: 'Bouvet Island'},
            {value: 'Brazil', country: 'Brazil'},
            {value: 'British Indian Ocean Territory', country: 'British Indian Ocean Territory'},
            {value: 'Brunei Darussalam', country: 'Brunei Darussalam'},
            {value: 'Bulgaria', country: 'Bulgaria'},
            {value: 'Burkina Faso', country: 'Burkina Faso'},
            {value: 'Burundi', country: 'Burundi'},
            {value: 'Cambodia', country: 'Cambodia'},
            {value: 'Cameroon', country: 'Cameroon'},
            {value: 'Canada', country: 'Canada'},
            {value: 'Cape Verde', country: 'Cape Verde'},
            {value: 'Cayman Islands', country: 'Cayman Islands'},
            {value: 'Central African Republic', country: 'Central African Republic'},
            {value: 'Chile', country: 'Chile'},
            {value: 'China', country: 'China'},
            {value: 'Christmas Island', country: 'Christmas Island'},
            {value: 'Cocos (Keeling) Islands', country: 'Cocos (Keeling) Islands'},
            {value: 'Colombia', country: 'Colombia'},
            {value: 'Comoros', country: 'Comoros'},
            {value: 'Democratic Republic of the Congo', country: 'Democratic Republic of the Congo'},
            {value: 'Republic of the Congo', country: 'Republic of the Congo'},
            {value: 'Cook Islands', country: 'Cook Islands'},
            {value: 'Costa Rica', country: 'Costa Rica'},
            {value: 'Croatia (Hrvatska)', country: 'Croatia (Hrvatska)'},
            {value: 'Cuba', country: 'Cuba'},
            {value: 'Cyprus', country: 'Cyprus'},
            {value: 'Czech Republic', country: 'Czech Republic'},
            {value: 'Denmark', country: 'Denmark'},
            {value: 'Djibouti', country: 'Djibouti'},
            {value: 'Dominica', country: 'Dominica'},
            {value: 'Dominican Republic', country: 'Dominican Republic'},
            {value: 'East Timor', country: 'East Timor'},
            {value: 'Ecuador', country: 'Ecuador'},
            {value: 'Egypt', country: 'Egypt'},
            {value: 'El Salvador', country: 'El Salvador'},
            {value: 'Equatorial Guinea', country: 'Equatorial Guinea'},
            {value: 'Eritrea', country: 'Eritrea'},
            {value: 'Estonia', country: 'Estonia'},
            {value: 'Ethiopia', country: 'Ethiopia'},
            {value: 'Falkland Islands (Malvinas)', country: 'Falkland Islands (Malvinas)'},
            {value: 'Faroe Islands', country: 'Faroe Islands'},
            {value: 'Fiji', country: 'Fiji'},
            {value: 'France', country: 'France'},
            {value: 'French Guiana', country: 'French Guiana'},
            {value: 'French Polynesia', country: 'French Polynesia'},
            {value: 'Gabon', country: 'Gabon'},
            {value: 'Gambia', country: 'Gambia'},
            {value: 'Georgia', country: 'Georgia'},
            {value: 'Germany', country: 'Germany'},
            {value: 'Ghana', country: 'Ghana'},
            {value: 'Gibraltar', country: 'Gibraltar'},
            {value: 'Guernsey', country: 'Guernsey'},
            {value: 'Greece', country: 'Greece'},
            {value: 'Greenland', country: 'Greenland'},
            {value: 'Grenada', country: 'Grenada'},
            {value: 'Guadeloupe', country: 'Guadeloupe'},
            {value: 'Guam', country: 'Guam'},
            {value: 'Guatemala', country: 'Guatemala'},
            {value: 'Guinea', country: 'Guinea'},
            {value: 'Guinea-Bissau', country: 'Guinea-Bissau'},
            {value: 'Guyana', country: 'Guyana'},
            {value: 'Haiti', country: 'Haiti'},
            {value: 'Heard and Mc Donald Islands', country: 'Heard and Mc Donald Islands'},
            {value: 'Honduras', country: 'Honduras'},
            {value: 'Hong Kong', country: 'Hong Kong'},
            {value: 'Hungary', country: 'Hungary'},
            {value: 'Iceland', country: 'Iceland'},
            {value: 'India', country: 'India'},
            {value: 'Isle of Man', country: 'Isle of Man'},
            {value: 'Indonesia', country: 'Indonesia'},
            {value: 'Iran (Islamic Republic of)', country: 'Iran (Islamic Republic of)'},
            {value: 'Iraq', country: 'Iraq'},
            {value: 'Ireland', country: 'Ireland'},
            {value: 'Israel', country: 'Israel'},
            {value: 'Italy', country: 'Italy'},
            {value: 'Ivory Coast', country: 'Ivory Coast'},
            {value: 'Jersey', country: 'Jersey'},
            {value: 'Jamaica', country: 'Jamaica'},
            {value: 'Japan', country: 'Japan'},
            {value: 'Jordan', country: 'Jordan'},
            {value: 'Kazakhstan', country: 'Kazakhstan'},
            {value: 'Kiribati', country: 'Kiribati'},
            {value: 'Korea, Democratic People\'s Republic of', country: 'Korea, Democratic People\'s Republic of'},
            {value: 'Korea, Republic of', country: 'Korea, Republic of'},
            {value: 'Kosovo', country: 'Kosovo'},
            {value: 'Kuwait', country: 'Kuwait'},
            {value: 'Kyrgyzstan', country: 'Kyrgyzstan'},
            {value: 'Lao People\'s Democratic Republic', country: 'Lao People\'s Democratic Republic'},
            {value: 'Latvia', country: 'Latvia'},
            {value: 'Lebanon', country: 'Lebanon'},
            {value: 'Lesotho', country: 'Lesotho'},
            {value: 'Liberia', country: 'Liberia'},
            {value: 'Libyan Arab Jamahiriya', country: 'Libyan Arab Jamahiriya'},
            {value: 'Liechtenstein', country: 'Liechtenstein'},
            {value: 'Lithuania', country: 'Lithuania'},
            {value: 'Luxembourg', country: 'Luxembourg'},
            {value: 'Macau', country: 'Macau'},
            {value: 'North Macedonia', country: 'North Macedonia'},
            {value: 'Madagascar', country: 'Madagascar'},
            {value: 'Malawi', country: 'Malawi'},
            {value: 'Malaysia', country: 'Malaysia'},
            {value: 'Maldives', country: 'Maldives'},
            {value: 'Mali', country: 'Mali'},
            {value: 'Malta', country: 'Malta'},
            {value: 'Marshall Islands', country: 'Marshall Islands'},
            {value: 'Martinique', country: 'Martinique'},
            {value: 'Mauritania', country: 'Mauritania'},
            {value: 'Mauritius', country: 'Mauritius'},
            {value: 'Mayotte', country: 'Mayotte'},
            {value: 'Mexico', country: 'Mexico'},
            {value: 'Micronesia, Federated States of', country: 'Micronesia, Federated States of'},
            {value: 'Moldova, Republic of', country: 'Moldova, Republic of'},
            {value: 'Monaco', country: 'Monaco'},
            {value: 'Mongolia', country: 'Mongolia'},
            {value: 'Montenegro', country: 'Montenegro'},
            {value: 'Montserrat', country: 'Montserrat'},
            {value: 'Morocco', country: 'Morocco'},
            {value: 'Mozambique', country: 'Mozambique'},
            {value: 'Myanmar', country: 'Myanmar'},
            {value: 'Namibia', country: 'Namibia'},
            {value: 'Nauru', country: 'Nauru'},
            {value: 'Nepal', country: 'Nepal'},
            {value: 'Netherlands', country: 'Netherlands'},
            {value: 'Netherlands Antilles', country: 'Netherlands Antilles'},
            {value: 'New Caledonia', country: 'New Caledonia'},
            {value: 'New Zealand', country: 'New Zealand'},
            {value: 'Nicaragua', country: 'Nicaragua'},
            {value: 'Niger', country: 'Niger'},
            {value: 'Nigeria', country: 'Nigeria'},
            {value: 'Niue', country: 'Niue'},
            {value: 'Norfolk Island', country: 'Norfolk Island'},
            {value: 'Northern Mariana Islands', country: 'Northern Mariana Islands'},
            {value: 'Norway', country: 'Norway'},
            {value: 'Oman', country: 'Oman'},
            {value: 'Pakistan', country: 'Pakistan'},
            {value: 'Palau', country: 'Palau'},
            {value: 'Palestine', country: 'Palestine'},
            {value: 'Panama', country: 'Panama'},
            {value: 'Papua New Guinea', country: 'Papua New Guinea'},
            {value: 'Paraguay', country: 'Paraguay'},
            {value: 'Peru', country: 'Peru'},
            {value: 'Philippines', country: 'Philippines'},
            {value: 'Pitcairn', country: 'Pitcairn'},
            {value: 'Poland', country: 'Poland'},
            {value: 'Portugal', country: 'Portugal'},
            {value: 'Puerto Rico', country: 'Puerto Rico'},
            {value: 'Qatar', country: 'Qatar'},
            {value: 'Reunion', country: 'Reunion'},
            {value: 'Romania', country: 'Romania'},
            {value: 'Russian Federation', country: 'Russian Federation'},
            {value: 'Rwanda', country: 'Rwanda'},
            {value: 'Saint Kitts and Nevis', country: 'Saint Kitts and Nevis'},
            {value: 'Saint Lucia', country: 'Saint Lucia'},
            {value: 'Saint Vincent and the Grenadines', country: 'Saint Vincent and the Grenadines'},
            {value: 'Samoa', country: 'Samoa'},
            {value: 'Sao Tome and Principe', country: 'Sao Tome and Principe'},
            {value: 'Saudi Arabia', country: 'Saudi Arabia'},
            {value: 'Senegal', country: 'Senegal'},
            {value: 'Serbia', country: 'Serbia'},
            {value: 'Seychelles', country: 'Seychelles'},
            {value: 'Sierra Leone', country: 'Sierra Leone'},
            {value: 'Singapore', country: 'Singapore'},
            {value: 'Slovakia', country: 'Slovakia'},
            {value: 'Slovenia', country: 'Slovenia'},
            {value: 'Solomon Islands', country: 'Solomon Islands'},
            {value: 'Somalia', country: 'Somalia'},
            {value: 'South Africa', country: 'South Africa'},
            {value: 'South Georgia South Sandwich Islands', country: 'South Georgia South Sandwich Islands'},
            {value: 'South Sudan', country: 'South Sudan'},
            {value: 'Spain', country: 'Spain'},
            {value: 'Sri Lanka', country: 'Sri Lanka'},
            {value: 'St. Helena', country: 'St. Helena'},
            {value: 'St. Pierre and Miquelon', country: 'St. Pierre and Miquelon'},
            {value: 'Sudan', country: 'Sudan'},
            {value: 'Suriname', country: 'Suriname'},
            {value: 'Svalbard and Jan Mayen Islands', country: 'Svalbard and Jan Mayen Islands'},
            {value: 'Swaziland', country: 'Swaziland'},
            {value: 'Sweden', country: 'Sweden'},
            {value: 'Switzerland', country: 'Switzerland'},
            {value: 'Syrian Arab Republic', country: 'Syrian Arab Republic'},
            {value: 'Taiwan', country: 'Taiwan'},
            {value: 'Tajikistan', country: 'Tajikistan'},
            {value: 'Tanzania, United Republic of', country: 'Tanzania, United Republic of'},
            {value: 'Thailand', country: 'Thailand'},
            {value: 'Togo', country: 'Togo'},
            {value: 'Tokelau', country: 'Tokelau'},
            {value: 'Trinidad and Tobago', country: 'Trinidad and Tobago'},
            {value: 'Tunisia', country: 'Tunisia'},
            {value: 'Turkey', country: 'Turkey'},
            {value: 'Turkmenistan', country: 'Turkmenistan'},
            {value: 'Turks and Caicos Islands', country: 'Turks and Caicos Islands'},
            {value: 'Tuvalu', country: 'Tuvalu'},
            {value: 'Uganda', country: 'Uganda'},
            {value: 'Ukraine', country: 'Ukraine'},
            {value: 'United Arab Emirates', country: 'United Arab Emirates'},
            {value: 'United Kingdom', country: 'United Kingdom'},
            {value: 'United States', country: 'United States'},
            {value: 'United States minor outlying islands', country: 'United States minor outlying islands'},
            {value: 'Uruguay', country: 'Uruguay'},
            {value: 'Uzbekistan', country: 'Uzbekistan'},
            {value: 'Vanuatu', country: 'Vanuatu'},
            {value: 'Vatican City State', country: 'Vatican City State'},
            {value: 'Venezuela', country: 'Venezuela'},
            {value: 'Vietnam', country: 'Vietnam'},
            {value: 'Virgin Islands (British)', country: 'Virgin Islands (British)'},
            {value: 'Virgin Islands (U.S.)', country: 'Virgin Islands (U.S.)'},
            {value: 'Wallis and Futuna Islands', country: 'Wallis and Futuna Islands'},
            {value: 'Western Sahara', country: 'Western Sahara'},
            {value: 'Yemen', country: 'Yemen'},
            {value: 'Zambia', country: 'Zambia'},
            {value: 'Zimbabwe', country: 'Zimbabwe'}
        ];

        vm.timeZone = [
            {value: "- 12 hour", title: '(UTC -12:00)'},
            {value: "- 11 hour", title: '(UTC -11:00)'},
            {value: "- 10 hour - 30 minutes", title: '(UTC -10:30)'},
            {value: "- 10 hour", title: '(UTC -10:00)'},
            {value: "- 9 hour", title: '(UTC -9:00)'},
            {value: "- 8 hour", title: '(UTC -8:00)'},
            {value: "- 7 hour", title: '(UTC -7:00)'},
            {value: "- 6 hour", title: '(UTC -6:00)'},
            {value: "- 5 hour", title: '(UTC -5:00)'},
            {value: "- 4 hour - 30 minutes", title: '(UTC -4:30)'},
            {value: "- 4 hour", title: '(UTC -4:00)'},
            {value: "- 3 hour - 30 minutes", title: '(UTC -3:30)'},
            {value: "- 3 hour", title: '(UTC -3:00)'},
            {value: "- 2 hour", title: '(UTC -2:00)'},
            {value: "- 1 hour", title: '(UTC -1:00)'},
            {value: "+ 0 hour", title: '(UTC 0:00)'},
            {value: "+ 1 hour", title: '(UTC +1:00)'},
            {value: "+ 2 hour", title: '(UTC +2:00)'},
            {value: "+ 3 hour", title: '(UTC +3:00)'},
            {value: "+ 3 hour + 30 minutes", title: '(UTC +3:30)'},
            {value: "+ 4 hour", title: '(UTC +4:00)'},
            {value: "+ 4 hour + 30 minutes", title: '(UTC +4:30)'},
            {value: "+ 4 hour + 45 minutes", title: '(UTC +4:45)'},
            {value: "+ 5 hour", title: '(UTC +5:00)'},
            {value: "+ 5 hour + 30 minutes", title: '(UTC +5:30)'},
            {value: "+ 5 hour + 45 minutes", title: '(UTC +5:45)'},
            {value: "+ 6 hour", title: '(UTC +6:00)'},
            {value: "+ 6 hour + 30 minutes", title: '(UTC +6:30)'},
            {value: "+ 7 hour", title: '(UTC +7:00)'},
            {value: "+ 8 hour", title: '(UTC +8:00)'},
            {value: "+ 9 hour", title: '(UTC +9:00)'},
            {value: "+ 9 hour + 30 minutes", title: '(UTC +9:30)'},
            {value: "+ 10 hour", title: '(UTC +10:00)'},
            {value: "+ 10 hour + 30 minutes", title: '(UTC +10:30)'},
            {value: "+ 11 hour", title: '(UTC +11:00)'},
            {value: "+ 12 hour", title: '(UTC +12:00)'},
            {value: "+ 12 hour + 45 minutes", title: '(UTC +12:45)'},
            {value: "+ 13 hour", title: '(UTC +13:00)'},
            {value: "+ 14 hour", title: '(UTC +14:00)'}
        ]

        vm.userData = {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            country: vm.country[224].value,
            language: vm.language[0].lang,
            timezone: {
                value: vm.timeZone[15].value,
                title: vm.timeZone[15].title
            }
        };

        $scope.$watch("gdprAgreement.userData.phoneNumber", function (newval, oldval) {
            if (newval != undefined) {
                var reg = /^[^a-zA-Z]+$/;
                vm.validPhoneNumber = newval.match(reg);
            } else {
                vm.validPhoneNumber = null;
            }
        });

        function checkFields() {
            if (vm.userData.firstName == '' || vm.userData.lastName == '' || vm.userData.phoneNumber == '' || vm.checkboxAgreement == false || vm.validPhoneNumber == null) {
                return true;
            } else {
                return false;
            }
        }

        function acceptAgreement() {
            var languageForTranslate = vm.language.find(function(locale) {
				return locale.lang == vm.userData.language;
			}).locale;

            var currentUserData = userModel.get().info.length ? JSON.parse(userModel.get().info) : {
                name: '',
                company: '',
                address: '',
                post_code: '',
                city: '',
                country: '',
                phone1: '',
                phone2: '',
                email: ''
            };
            
            var info = {
                name: vm.userData.firstName + ' ' + vm.userData.lastName,
                company: currentUserData.company,
                address: currentUserData.address,
                post_code: currentUserData.post_code,
                city: currentUserData.city,
                country: vm.userData.country,
                phone1: vm.userData.phoneNumber,
                phone2: currentUserData.phone2,
                email: currentUserData.email
            },
            info = JSON.stringify(info);
            var userData = {
                id: userModel.get().id,
                email: userModel.get().email,
                info: info,
                language: vm.userData.language[0].toLowerCase() + vm.userData.language.slice(1),
                timezone: vm.userData.timezone.value,
                dataAccept: moment().format('YYYY-MM-DD hh:mm:ss')
            }
            gdprAgreementService.saveUserData(userData, languageForTranslate);
        };
    }
}())
