async function deleteData(id, item) {

    await fetch(window.location.origin + '/users/' + id + '?crop=' + item, {
        method: 'DELETE',
    });

    window.location = id;

}