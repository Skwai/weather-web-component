// https://gist.github.com/tbranyen/62d974681dea8ee0caa1

const APP_ID = 'ded3d81681300110405496b8c6fd5ea3'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const TICK_RATE = 10 * 1000

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
  _get(name) {
    return this.getAttribute(name)
  }

  _set(name, val) {
    if (val) {
      this.setAttribute(name, val)
    }
    else {
      this.removeAttribute(name)
    }
    window.requestAnimationFrame(this.render)
  }

  data () {
    return {
      city: null,
      country: null,
      minTemp: null,
      maxTemp: null,
      conditions: null
    }
  }

  _bindData () {
    const data = this.data()
    const props = Object.entries(data).reduce((obj, [key, value]) => ({
      ...obj,
      [key]: {
        set: (v) => this._set(key, v),
        get: () => this._get(key)
      }
    }), {})
    Object.defineProperties(this, props)
  }

  constructor () {
    super()
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render = this.render.bind(this)
    this._bindData();
  }

  async connectedCallback () {
    this.getWeatherData();
  }

  async getWeatherData () {
    const { city, country } = this
    const data = await this.fetchWeatherData(city, country)
    Object.assign(this, {
      currentTemp: data.main.temp,
      minTemp: data.main.temp_min,
      maxTemp: data.main.temp_max,
      conditions: data.weather[0].main
    })
    window.requestAnimationFrame(this.render)
    setTimeout(this.getWeatherData.bind(this), TICK_RATE)
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

  render () {
    const {
      city,
      country,
      conditions,
      currentTemp,
      minTemp,
      maxTemp
    } = this

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
