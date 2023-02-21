(function () {
  angular.module("rewire.gprsCommand").service("gprsCommandService", gprsCommandService);

  gprsCommandService.$inject = ["global", "$state", "utilService", "$ionicHistory", "$http", "toastr", "$q"];

  function gprsCommandService(global, $state, utilService, $ionicHistory, $http, toastr, $q) {
    var cache = [];

    var service = {
			getCommands: getCommands,
			getTemplates: getTemplates,
			sendCommand: sendCommand,
			deleteCommand: deleteCommand
    }

    return service;

    ///////////////////////////////////////////

		function makeQueryString(params) {
			var query = [];
			for (var key in params) {
				var value = params[key];
				query.push(key + "=" + encodeURIComponent(value));
			}

			return query.join("&");
		}

		function getCommands() {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					dst: user.dst,
					dst_start: user.dst_start,
					dst_end: user.dst_end,
					timezone: user.timezone,
					cmd: "load_cmd_exec_list",
					page: "1",
					rows: "2048",
					sidx: "dt_cmd",
					sord: "desc"
        };

        $http.post(global.baseUrl + "/api/mobilapp/cmd.php", request).then(function (response) {
					var result = [];
					var data = response.data;
					if (data.hasOwnProperty('rows') && data.rows.length) {
						for (var i in data.rows) {
              var row = data.rows[i];
              var asсii = ''
              for (var k = 0; k < row.cell[8].length; k += 2) {
                asсii += String.fromCharCode(parseInt(row.cell[8].substr(k, 2), 16));
              }
							result.push({
								id: row.id,
								datetime: row.cell[0],
								device: row.cell[1],
								template: row.cell[2],
								gateway: row.cell[3],
								type: row.cell[4],
								command: row.cell[5],
								status: row.cell[6],
								delete: row.cell[7],
								re_hex: row.cell[8],
                ascii: asсii
							});
						}
					}
          defer.resolve(result);
        });
      });

			return defer.promise;
		}

		function getTemplates() {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					dst: user.dst,
					dst_start: user.dst_start,
					dst_end: user.dst_end,
					timezone: user.timezone,
					cmd: "load_cmd_template_data"
        };

        $http.post(global.baseUrl + "/api/mobilapp/cmd.php", request).then(function (response) {
					var result = [];
					var data = response.data;

					for (var id in data) {
						var row = data[id];
						result.push({
							id: id,
							name: row.name,
							protocol: row.protocol,
							gateway: row.gateway,
							type: row.type,
							cmd: row.cmd
						});
					}

          defer.resolve(result);
        });
      });

			return defer.promise;
		}

		function sendCommand(cmd, gateway, imei, name, sim_number, type) {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					dst: user.dst,
					dst_start: user.dst_start,
					dst_end: user.dst_end,
					timezone: user.timezone,
					cmd: "exec_cmd",
					"cmd_": cmd,
					gateway: gateway,
					imei: imei,
					name: name,
					sim_number: sim_number,
					type: type
        };

        $http.post(global.baseUrl + "/api/mobilapp/cmd.php", request).then(function (response) {
					var result = [];
					var data = response.data;

          defer.resolve(data);
        });
      });

			return defer.promise;
		}

		function deleteCommand(id) {
			var defer = $q.defer();

      utilService.getItem("user", function (user) {
        var user = JSON.parse(user);
        var request = {
          user_id: user.id,
					manager_id: user.manager_id,
					privileges: JSON.parse(user.privileges),
					dst: user.dst,
					dst_start: user.dst_start,
					dst_end: user.dst_end,
					timezone: user.timezone,
					cmd: "delete_cmd_exec",
					cmd_id: id
        };

        $http.post(global.baseUrl + "/api/mobilapp/cmd.php", request).then(function (response) {
					var result = [];
					var data = response.data;

          defer.resolve(data);
        });
      });

			return defer.promise;
		}
  }

}())
