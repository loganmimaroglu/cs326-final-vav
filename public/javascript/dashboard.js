const myChart = new Chart(document.getElementById('myChart'), {
    type: 'line',
    data: {},
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

async function myFunction(id, item) {
    document.getElementById('10y').addEventListener('click', () => renderGraph(id, item, 1));
    document.getElementById('20y').addEventListener('click', () => renderGraph(id, item, 2));
    document.getElementById('30y').addEventListener('click', () => renderGraph(id, item, 3));

    document.getElementById('10y').addEventListener('click', () => renderDates(id, item, null, 1));
    document.getElementById('20y').addEventListener('click', () => renderDates(id, item, null, 2));
    document.getElementById('30y').addEventListener('click', () => renderDates(id, item, null, 3));

    const sendPackage = {userID: id, crops: item === 'dashboard' ? 'all' : item, variance: 0};

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
        renderGraph(id, item, 0);
        renderDates(id, item, data, 0);
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

async function renderDates(id, item, data, variance) {
    if (data === null) {
        const sendPackage = {userID: id, crops: item === 'dashboard' ? 'all' : item, variance: variance};

        const response = await fetch(window.location.origin + '/model/deadlines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendPackage)
        });

        data = await response.json();
    }

    const parent = document.getElementById('card-group');
    parent.innerHTML = '';

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

async function renderGraph(id, item, variance) {
    const sendPackage = {userID: id, crops: item === 'dashboard' ? 'all' : item, variance: variance};

    const response = await fetch(window.location.origin + '/model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendPackage)
    });

    const data = await response.json();

    myChart.data = data;
    myChart.update();

    document.getElementById('10y').classList.toggle('active', variance === 1);
    document.getElementById('20y').classList.toggle('active', variance === 2);
    document.getElementById('30y').classList.toggle('active', variance === 3);
}

async function deleteData(id, item) {

    await fetch(window.location.origin + '/users/' + 'dashboard' + '?crop=' + item, {
        method: 'DELETE',
    });

    window.location = 'dashboard';

}