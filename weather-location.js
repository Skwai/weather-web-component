// https://gist.github.com/tbranyen/62d974681dea8ee0caa1

const APP_ID = 'ded3d81681300110405496b8c6fd5ea3'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const TICK_RATE = 60* 1000

const style = `
  <style>
  .Wrap {
    padding: 1rem;
    box-shadow: rgba(0,0,0,.1) 0 0 0 1px, rgba(0,0,0,.1) 0 2px 10px;
    text-align: center;
    background: #fff;
    border-radius: 3px;
  }

  .Location {
    margin: 0 0;
  }

  .Country {
    text-transform: uppercase;
    opacity: 0.5;
    font-weight: 400;
  }

  .Conditions {
    margin-top: 0.5rem;
  }

  .Current {
    margin-top: 0.5rem;
    font-size: 2rem;
  }

  .Range {
    margin-top: 0.5rem;
    display: flex;
    justify-content: center;
  }

  .Min,
  .Max {
    margin: 0 0.25rem;
  }

  .Min {
    opacity: .5;
  }

  sup {
    font-size: 50%;
  }
  </style>
`

class WeatherLocation extends HTMLElement {
  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback () {
    const { city, country } = this.getAttributes('city', 'country')
    this.getWeatherData(city, country);
  }

  async getWeatherData(city, country) {
    const { name, main, weather, sys } = await this.fetchWeatherData(city, country)
    this.render({
      city: name,
      country: sys.country,
      currentTemp: main.temp,
      minTemp: main.temp_min,
      maxTemp: main.temp_max,
      conditions: weather[0].main
    })
    setTimeout(this.getWeatherData.bind(this, city, country), TICK_RATE)
  }

  getAttributes (...attributes) {
    return attributes.reduce((obj, attr) => ({
      ...obj,
      [attr]: this.getAttribute(attr)
    }), {})
  }
  
  async fetchWeatherData (city, country) {
    const params = new URLSearchParams({
      appid: APP_ID,
      q: [city,country].join(',')
    })
    const url = new URL([API_URL, params].join('?'))
    const response = await fetch(url)
    return response.json()
  }

  kelvinToCelcius (kelvin) {
    return (kelvin - 273.15).toFixed(0)
  }

  render ({
    city,
    country,
    currentTemp,
    minTemp,
    maxTemp,
    conditions
  }) {
    const template = `
      ${style}
      <div class="Wrap">
        <h3 class="Location">${city}, <span class="Country">${country}</span></h3>
        <div class="Conditions">${conditions}</div>
        <div class="Current" title="Current temperature">
          ${this.kelvinToCelcius(currentTemp)}<sup>&deg;C</sup>
        </div>
        <div class="Range">
          <span class="Max" title="Minimum temperature">${this.kelvinToCelcius(maxTemp)}<sup>&deg;C</sup></span>
          <span class="Min" title="Maximum temperature">${this.kelvinToCelcius(minTemp)}<sup>&deg;C</sup></span>
        </div>
      </div>
    `
    this.shadow.innerHTML = template
  }
}

window.customElements.define('weather-location', WeatherLocation)
