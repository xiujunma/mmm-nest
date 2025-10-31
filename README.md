# MMM-Nest

MagicMirror² module for displaying live data from Google Nest thermostats. It uses the `homebridge-nest` API client under the hood, giving you quick access to ambient temperature, humidity, operating mode, and HVAC status for every thermostat on your Nest account.

## Features

- Tracks multiple Nest thermostats in real time using Google's Smart Device Management API.
- Shows ambient temperature, target temperature (including range mode), humidity, HVAC mode, and current state.
- Built-in loading, empty, and error states to surface configuration issues quickly.
- Simple CSS and Nunjucks template for easy customization.

## Prerequisites

- A working MagicMirror² installation running on Node.js 16 or higher.
- Google Nest thermostat(s) linked to your Google account.
- The ability to obtain a Nest `issueToken` URL and `cookies` string (see [Authentication](#authentication) below).

## Installation

1. Change into your MagicMirror modules directory:
   ```sh
   cd ~/MagicMirror/modules
   ```
2. Clone this repository and install dependencies:
   ```sh
   git clone https://github.com/xiujunma/mmm-nest.git
   cd mmm-nest
   npm install
   ```
3. Restart MagicMirror so the new module is loaded.

> **Note:** If you prefer to copy the module manually, make sure the final folder name matches the module name `mmm-nest`.

## Configuration

Add the module to the `modules` array in your MagicMirror `config/config.js` file:

```js
{
  module: "mmm-nest",
  position: "top_right",
  config: {
    issueToken: "https://accounts.google.com/...",
    cookies: "NID=...; __Secure-3PAPISID=...; ...",
    temperatureUnit: "F"
  }
}
```

### Options

| Option           | Type   | Required | Description                                                                 |
| ---------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `issueToken`     | String | Yes      | Google Nest issue token URL produced during authentication.                 |
| `cookies`        | String | Yes      | Semicolon-separated cookie string for the same session used to get token.   |
| `temperatureUnit`| String | No       | Display hint (`"F"` or `"C"`). Conversion defaults to °F if omitted.        |

When configuration is incomplete, the module surface an on-screen error and logs the missing keys to the MagicMirror server console.

## Authentication

mmm-nest relies on the [homebridge-nest](https://github.com/chrisjshull/homebridge-nest) project for Google authentication. Follow its **"Using Google Accounts"** guide to obtain an `issueToken` URL and the associated `cookies` string:

1. Open a browser session where you are signed into the Google account linked to your Nest devices.
2. Use the developer tools Network tab to capture the `issueToken` endpoint call as described in the homebridge-nest documentation.
3. Copy the returned `issueToken` URL and the request cookies and paste them into your MagicMirror configuration.
4. Restart MagicMirror after updating the configuration.

Tokens and cookies can expire, especially after password changes or new logins. If the module stops updating, repeat the steps above to refresh the values.

## Display & Customization

- Styling lives in `mmm-nest.css`; adjust font sizes or colors to match your dashboard.
- The layout is rendered with `mmm-nest.njk`. You can add or remove fields (e.g., target temperature range) by editing the template.
- All thermostat data arrives through the socket interface—check the MagicMirror server logs for payload details when tweaking the UI.

## Troubleshooting

- `Missing configuration: issueToken, cookies`: At least one required token is empty; double-check your config.
- `Loading Nest data…` never disappears: Authentication likely failed; refresh tokens or inspect the MagicMirror logs for Nest API errors.
- No thermostats displayed: Ensure your Nest account has active devices and that they are shared with the Google profile used for authentication.

Logs appear in the MagicMirror server console; use them to confirm socket notifications or debug data parsing.

## License

MIT © Xiujun Ma
