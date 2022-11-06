async function deleteData(id, item) {

    await fetch('http://localhost:3000/users/' + id + '?crop=' + item, {
        method: 'DELETE',
    });

    window.location = id;

}