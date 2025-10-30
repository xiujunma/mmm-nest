Module.register("mmm-nest", {
  defaults: {
    issueToken: "",
    cookies: "",
    temperatureUnit: null,
  },
  getStyles() {
    return ["mmm-nest.css"];
  },

  start() {
    this.loaded = false;
    this.error = null;
    this.thermostats = [];
    const missing = [];
    if (!this.config.issueToken) missing.push("issueToken");
    if (!this.config.cookies) missing.push("cookies");
    if (missing.length > 0) {
      this.error = `Missing configuration: ${missing.join(", ")}`;
      this.loaded = true;
      Log.error(`[MMM-Nest] ${this.error}`);
      this.updateDom();
      return;
    }

    this.sendSocketNotification("MMM_NEST_CONFIG", {
      issueToken: this.config.issueToken,
      cookies: this.config.cookies,
      temperatureUnit: this.config.temperatureUnit,
    });
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "MMM_NEST_DATA") {
      const thermostats = (payload && payload.thermostats) || [];

      this.thermostats = thermostats.map((thermostat) => {
        return {
          id: thermostat.id,
          name: thermostat.name,
          ambientDisplay: thermostat.current_temperature,
          targetDisplay: thermostat.target_temperature,
          humidityDisplay:
            thermostat.current_humidity != null
              ? `${thermostat.current_humidity}`
              : "n/a",
          hvacState: thermostat.hvac_state || null,
          hvacMode: thermostat.hvac_mode || null,
        };
      });

      this.error = null;
      this.loaded = true;
      this.updateDom();
      return;
    }

    if (notification === "MMM_NEST_ERROR") {
      this.error = payload || "Unknown error";
      this.loaded = true;
      this.thermostats = [];
      Log.error(`[MMM-Nest] ${this.error}`);
      this.updateDom();
    }
  },

  getTemplate() {
    return "mmm-nest.njk";
  },

  getTemplateData() {
    return {
      thermostats: this.thermostats,
      error: this.error,
      isLoading: !this.loaded,
    };
  },
});
