const key = "1796f304652d13845c9033187a13639b";
const url = "https://picsum.photos/1280/720"

// 위도와 경도로 찾는 방법
// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// 도시명으로 찾는 방법
// api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}

// 배경 이미지가 무작위로 변경된다
// 중앙에 시계가 동작한다 (실시간)
// 중앙 하단에 메모할 수 있는 공간이 존재한다
// 우측 상단에 날씨 데이터를 가져올 수 있다

async function setRenderBackground(){
  const result = await axios.get(url, {responseType : "blob"})
  const domURL = URL.createObjectURL(result.data);
  const body = document.querySelector("body");
  body.style.backgroundImage = `url(${domURL})`;
}

function setTime(){
  const timer = document.querySelector(".timer");
  const timerContent = document.querySelector(".timer-content");
  setInterval(() => {
    const date = new Date()
    let hour = "0" + date.getHours();
    let min = "0" + date.getMinutes();
    let sec = "0" + date.getSeconds();

    let greeting;
    if (hour < 12) greeting = "Good Morning";
    else greeting = "Good Evening";

    timer.textContent = `${hour.slice(-2)}:${min.slice(-2)}:${sec.slice(-2)}`;
    timerContent.textContent = greeting + ", SSAFY!";
  })
}

function setMemo(){
  const memoInput = document.querySelector(".memo-input");
  memoInput.addEventListener("keyup", event => {
    if (event.code === "Enter" && event.currentTarget.value !== "") {
      localStorage.setItem("todo", event.currentTarget.value);
      getMemo();
      memoInput.value = "";
    }
  })
}

function getMemo(){
  const memo = document.querySelector(".memo");
  const memoValue = localStorage.getItem("todo");
  memo.textContent = memoValue;
}

function deleteMemo(){
  document.addEventListener('click', e => {
    if (e.target.classList.contains("memo")) {
      localStorage.removeItem("todo");
      e.target.textContent = "";
    }
  })
}

function getPosition(options){
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

async function renderWeather() {
  try {
    const position = await getPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const weatherResponse = await getWeather(lat, lon);
    const weatherData = weatherResponse.data;


    const weatherList = weatherData.list.reduce((acc, cur) => {
      if (cur.dt_txt.indexOf("18:00:00") > 0) {
        acc.push(cur)
      }

      return acc; 
    }, [])

    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = weatherList.map(e => weatherWrapperComponent(e)).join("");
    
    const modalBtnImg = document.querySelector(".modal-button-img");
    modalBtnImg.setAttribute("src", matchIcon(weatherList[0].weather[0].main));
  }
  catch (error) {
    alert(error);
  }
  
}

async function getWeather(latitude, longitude) {
  if (latitude && longitude) {
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`);
    return data
  }
  else {
    const data = await axios.get(`api.openweathermap.org/data/2.5/forecast?q={Seoul}&appid=${key}`);
    return data
  }  
}

function weatherWrapperComponent(e) {
  console.log(e);
  return `
    <div class="card bg-transparent flex-grow-1 m-2">
      <div class="card-header text-center">
        ${e.dt_txt.split(" ")[0]}
      </div>
      <div class="card-body d-flex">
        <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <h5 class="card-title">${e.weather[0].main}</h5>
          <img class="weather-img" src="${matchIcon(e.weather[0].main)}">
          <p class="card-text">${changeTocelsius(e.main.temp)}</p>
        </div>
      </div>
    </div>`
}

function matchIcon(weather){
  if(weather === "Clouds") return "./images/001-cloud.png";
  if(weather === "Clear") return "./images/039-sun.png";
  if(weather === "Rain") return "./images/003-rainy.png";
  if(weather === "Snow") return "./images/006-snowy.png";
  if(weather === "Thunderstorm") return "./images/008-storm.png";
}

function changeTocelsius(temp) {
  return (temp - 273.15).toFixed(1);
}

(function () {
  setRenderBackground();
  setTime();
  setMemo();
  getMemo();
  deleteMemo();
  renderWeather();
  setInterval(() => setRenderBackground(), 10000);
})()