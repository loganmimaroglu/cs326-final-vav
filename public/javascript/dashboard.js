const { session } = require("passport");

async function myFunction(id, item) {

    const sendPackage = {userID: id, crops: item === 'dashboard' ? 'all' : item};

    const response = await fetch(window.location.origin + '/model/deadlines', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendPackage)
    });

    const data = await response.json();

    if (data.length === 0) {
        renderWelcome();
    } else {
        // User has some crops, display charts
        renderGraph(id, item);
        renderDates(id, item, data);
    }

}

function renderWelcome() {
    document.getElementById('header-inner').innerText = 'Welcome to Haybal!';
    const parent = document.getElementById('welcome');

    parent.innerText = 'It doesn\'t look like you\'ve added any crops yet, let\'s get started!';

    const image = document.createElement('img');

    image.classList.add('image-fluid', 'rounded');

    image.setAttribute('alt','Go to the bottom left hand corner of the window, click on your email, and then click on add plant.');

    image.src = window.location.origin + '/images/add-plant-tutorial.gif';

    parent.appendChild(image);
}

function renderDates(id, item, data) {
    const parent = document.getElementById('card-group');

    for (let i = 0; i < data.length; i++) {

        const card = document.createElement('div');
        card.classList.add('card');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const header = document.createElement('h5');
        header.classList.add('card-title');
        const textNode = document.createElement('b');
        textNode.innerHTML = data[i].type;
        const nbsp = document.createTextNode('\u00A0');

        const icon = document.createElement('i');
        icon.classList.add('fa','fa-fw','fa-solid','fa-calendar-days','icon-cog','greeniconcolor');
        header.appendChild(icon);
        header.appendChild(nbsp);
        header.appendChild(textNode);

        cardBody.appendChild(header);

        for (let j = 0; j < data[i].dates.length; j++) {
            const body = document.createElement('p');
            body.innerHTML = data[i].dates[j].label + ': ' + data[i].dates[j].dayNumber;
            cardBody.appendChild(body);
        }

        card.appendChild(cardBody);

        parent.appendChild(card);
    }
}

async function renderGraph(id, item) {
    const sendPackage = {userID: id, crops: item === 'dashboard' ? 'all' : item};

    const response = await fetch(window.location.origin + '/model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendPackage)
    });

    const data = await response.json();

    const ctx = document.getElementById('myChart');
    // eslint-disable-next-line no-unused-vars
    const myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            plugins: {
                tooltip: {
                    yAlign: 'bottom',
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' GDD';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Accumulated Growing Degree Days'
                    },
                    display: true,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                }
            },
            legend: {
                display: true
            }
        }
    });
}

async function deleteData(id, item) {

    await fetch(window.location.origin + '/users/' + 'dashboard' + '?crop=' + item, {
        method: 'DELETE',
    });

    window.location = 'dashboard';

}