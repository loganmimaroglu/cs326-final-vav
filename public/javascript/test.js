const dataToSend = [{'type':'carrot','plantDate':'20221228','profitPerAcre':30,'acres':1},{'type':'wheat','plantDate':'20221228','profitPerAcre':30,'acres':1},{'type':'soybean','plantDate':'20221228','profitPerAcre':30,'acres':1}];

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}

postData('http://localhost:3000/model', dataToSend)
    .then((data) => {
        console.log(data);
    });
