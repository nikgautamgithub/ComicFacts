//access token for api
const access_token = '906287907192343';

//generates random number for character id (from 1 to 731(as there are 731 characters))
const random = () => Math.floor(Math.random() * 731) + 1;

//random color animation
const click = document.querySelector('#title');
click.style.transition = "all 2.8s";
setInterval(() => {
    let randomColor = Math.floor(Math.random() * 16777215).toString(16);
    click.style.color = "#" + randomColor;
}, 3000);

const superImage = document.querySelector('img');//grab the image element
const nameDiv = document.querySelector('.name');//grab the name div element
const statsDiv = document.querySelector('.info');//grab the stats info element
const searchName = document.querySelector('.input-name');//grab the input element

//create element function
const createElement = (string, tag) => {
    let element = document.createElement(tag);
    element.innerText = string;
    statsDiv.appendChild(element);
};

//display stats
const displayStats = json => {
    //About appearances
    let appearance = json.appearance;
    if (appearance.gender !== 'null' && appearance.gender !== '-') createElement(`Gender: ${appearance.gender}`, 'h4');
    if (appearance.race !== 'null' && appearance.race !== '-') createElement(`Race: ${appearance.race}`, 'h4');
    if (appearance.height[1] !== '0 cm') createElement(`Height:  ${appearance.height[0]}`, 'h4');
    if (appearance.weight[1] !== '0 kg') createElement(`Weight:  ${appearance.weight[0]}`, 'h4');

    //About biography
    let biography = json.biography;
    if (biography.aliases[0] !== 'null' && biography.aliases[0] !== '-') createElement(`Aliases: ${biography.aliases.slice(0, 3)}`, 'h4');
    if (biography.alignment !== 'null' && biography.alignment !== '-') createElement('Alignment: ' + (biography.alignment === 'bad' ? 'Evil' : (biography.alignment === 'neutral' ? 'Neutral' : 'Good')), 'h4');
    if (biography['first-appearance'] !== '-') createElement('First Appearance: ' + biography['first-appearance'].split(';').slice(0, 1), 'h4');
    if (biography.publisher !== 'null' && biography.publisher !== '-') createElement(`Publisher: ${biography.publisher}`, 'h4');

    //About Connection
    let connections = json.connections;
    if (connections['group-affiliation'] !== '-') createElement(`Groups: ${connections['group-affiliation'].split(/[,;]+/).slice(0, 2)}`, 'h4');
    if (connections.relatives !== '-') createElement(`Relatives: ${connections.relatives.split(/[,;]+/).slice(0, 3)})`, 'h4');

    //About Stats
    let stats = json.powerstats;
    Object.keys(stats).forEach(key => {
        if (stats[key] !== 'null') createElement(`${key}: ${stats[key]}`, 'p');
    });
};

//displayName
const displayName = json => {
    nameDiv.innerHTML = '';
    const name = document.createElement('h2');
    name.innerText = json.name;
    nameDiv.appendChild(name);

    if (json.biography['full-name'] !== null) {
        const fullName = document.createElement('h4');
        fullName.innerText = json.biography['full-name'];
        nameDiv.appendChild(fullName);
    }
    displayStats(json);
};

//fetch character 
const getCharacter = nameToSearch => {
    searchName.value = '';
    nameDiv.innerHTML = 'Did you know that?';
    statsDiv.innerHTML = '';
    let searchID = random();

    if (nameToSearch !== '') searchID = `search/${nameToSearch}`;
    fetch(`https://superheroapi.com/api.php/${access_token}/${searchID}`)
        .then(response => response.json())
        .then(json => {
            // if no response is found
            if (json.response === 'error') {
                superImage.src = 'https://media.tenor.com/FcVg5W9zZJQAAAAM/error.gif';
                nameDiv.innerHTML = '<h3>Not Found! Try with \"-\" between words.</h3><h5>For example, use \"spider-man\" instead of \"spiderman\"</h5>';
                return;
            }

            superImage.src = 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif';

            //if many respone is found display the one with exact name or else display the first one
            if ('results' in json){
                let ifMatchNotFound = true;
                let allResults = Object.keys(json.results);
                allResults.every(index => {
                    if(nameToSearch.toLowerCase()===json.results[index].name.toLowerCase()){
                        json = json.results[index];
                        ifMatchNotFound = false;
                        return false;
                    }
                    return true;
                });
                if(ifMatchNotFound) json = json.results[0];
            }
            
            //Lazy Load
            let tempImg = document.createElement('img');
            tempImg.onerror = () => {
                superImage.src = 'https://media.tenor.com/FcVg5W9zZJQAAAAM/error.gif';
            };
            tempImg.addEventListener('load', () => {
                superImage.src = tempImg.src;
            });
            tempImg.src = json.image.url;
            displayName(json);
        });
};

getCharacter('');

document.querySelector('.random').onclick = () => getCharacter('');
document.querySelector('.search').onclick = () => getCharacter(searchName.value);
searchName.addEventListener('keypress', e => {
    if (e.which == 13) getCharacter(searchName.value) //detect whether user have pressed ENTER keyword
});
