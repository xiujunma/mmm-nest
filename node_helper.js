const NodeHelper = require("node_helper");
const Log = require("logger");
const NestConnection = require("homebridge-nest/lib/nest-connection");

if (typeof Promise.delay !== "function") {
  Promise.delay = function (time_ms) {
    return new Promise((resolve) => setTimeout(resolve, time_ms));
  };
}

module.exports = NodeHelper.create({
  start: function () {
    Log.info("Node Helper started...", NestConnection);
    this.nestConnection = null;
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === "MMM_NEST_CONFIG") {
      const onUpdate = (data) => {
        const thermos = this.logThermostats(data);
        Log.info("[MMM-Nest] Received update", thermos);
        this.sendSocketNotification("MMM_NEST_DATA", { thermostats: thermos });
      };

      this.nestConnection = new NestConnection(
        {
          googleAuth: {
            issueToken: payload.issueToken,
            cookies: payload.cookies,
          },
        },
        {
          info: Log.info,
          debug: Log.debug,
          warn: Log.warn,
          error: Log.error,
        },
        false,
        false
      );

      this.nestConnection.auth().then(() => {
        Log.info("Google Nest auth successful");
        Promise.all([
          this.nestConnection.subscribe(onUpdate),
          this.nestConnection.observe(onUpdate),
        ]).then(([restSnapshot]) => {
          const initialState = this.nestConnection.apiResponseToObjectTree(
            this.nestConnection.currentState
          );
          onUpdate(initialState || restSnapshot);
        });
      });
    }
  },

  logThermostats: function (data) {
    const thermostats =
      (data && data.devices && data.devices.thermostats) || {};
    const thermostatIds = Object.keys(thermostats);

    if (thermostatIds.length === 0) {
      Log.info("No thermostats found in payload.");
      return;
    }

    const thermos = [];

    thermostatIds.forEach((deviceId) => {
      const thermo = {};
      const thermostat = thermostats[deviceId];
      const toFahrenheit = (value) => {
        if (value === undefined || value === null) {
          return value;
        }
        return Math.round((value * 9) / 5 + 32);
      };
      const formatTemp = (value) =>
        value === undefined || value === null
          ? "n/a"
          : `${toFahrenheit(value)}°F`;
      thermo.id = deviceId;
      thermo.name = thermostat.name;
      thermo.current_temperature = formatTemp(thermostat.current_temperature);
      thermo.hvac_mode = thermostat.hvac_mode;

      if (thermostat.target_temperature !== undefined) {
        thermo.target_temperature = formatTemp(thermostat.target_temperature);
      } else {
        thermo.target_temperature_low = formatTemp(
          thermostat.target_temperature_low
        );
        thermo.target_temperature_high = formatTemp(
          thermostat.target_temperature_high
        );
      }
      if (thermostat.current_humidity !== undefined) {
        thermo.current_humidity = parseInt(thermostat.current_humidity) + "%";
      }
      thermo.hvac_state = thermostat.hvac_state;
      thermos.push(thermo);
    });
    return thermos;
  },
});
