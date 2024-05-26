var map = L.map('map').setView([52.2, 20.19], 7);
var selectedLayer;
var correctGuesses = 0;
var totalVoivodeships = 16;
var gameEnded = false;
var voi = [];

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 7,
    minZoom: 7,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function getData() {
    const response = await fetch("https://raw.githubusercontent.com/ppatrzyk/polska-geojson/master/wojewodztwa/wojewodztwa-max.geojson");
    const data = await response.json();
    
    data.features.forEach(feature => {
        const foundName = feature.properties.nazwa;
        if (foundName) {
            voi.push(foundName);
        }
    });

    L.geoJSON(data, {
        style: {
            color: 'black',
            weight: 2,
            fillOpacity: 1,
            fillColor: 'yellow',
        },
        onEachFeature: function(feature, layer) {
            layer.properties = { guessed: false };
            layer.on({
                click: onMapClick
            });
        }
    }).addTo(map);

    randomVoi();
    
}

function randomVoi() {
    const randIndex = Math.floor(Math.random() * voi.length);
    const randVoi = voi.splice(randIndex, 1)[0];
    document.getElementById('los').textContent = randVoi;
    if(gameEnded == true){
        if (correctGuesses === totalVoivodeships) {
            document.getElementById('los').textContent = "Koniec Gry! Wszystko zaznaczyłeś poprawnie";
        } else if (correctGuesses < totalVoivodeships) {
            document.getElementById('los').textContent = "Koniec Gry! Twój wynik to: " + correctGuesses + "/16";
        }
    }
};
    
let correctlyGuessedAreas = new Set()

function onMapClick(e) {
    if (gameEnded) return;

    if (selectedLayer && selectedLayer !== e.target) {
        resetHighlight(selectedLayer);
    }
    selectedLayer = e.target;
    const selectedVoi = selectedLayer.feature.properties.nazwa;
    const randVoi = document.getElementById('los').textContent;

    if (!selectedLayer.properties.guessed) {
        if (selectedVoi === randVoi) {
            selectedLayer.setStyle({ fillColor: 'green' });
            selectedLayer.properties.guessed = true;
            correctGuesses++;
        } else {
            selectedLayer.setStyle({ fillColor: 'red' });
            selectedLayer.properties.guessed = true;
        }
    }
    if (selectedLayer.properties.guessed && selectedLayer.feature.properties.nazwa === randVoi) {
        correctlyGuessedAreas.add(randVoi);
    }

    if (correctGuesses === totalVoivodeships) {
        gameEnded = true;
        if (correctGuesses === totalVoivodeships) {
            document.getElementById('los').textContent = "Koniec Gry! Wszystko zaznaczyłeś poprawnie";
        } else {
            document.getElementById('los').textContent = "Koniec Gry! Twój wynik to: " + correctGuesses + "/16";
        }
        map.off('click');
    }
    randomVoi();
}

function resetHighlight(layer) {
    if (layer.properties.guessed) {
        if (layer.feature.properties.nazwa === document.getElementById('los').textContent) {
            layer.setStyle({ fillColor: 'green' });
        } else {
            if (!correctlyGuessedAreas.has(layer.feature.properties.nazwa)) {
                layer.setStyle({ fillColor: 'red' });
            }
        }
    } else {
        layer.setStyle({ fillColor: 'yellow' });
    }
}

function resetGame() {
    gameEnded = false;
    correctGuesses = 0;
    voi = [];
    correctlyGuessedAreas = new Set();

    map.eachLayer(function (layer) {
        if (layer.feature) {
            layer.setStyle({ fillColor: 'yellow' });
            layer.properties.guessed = false;
        }
    });

    document.getElementById('los').textContent = '';

    getData();

    randomVoi();
}

getData();