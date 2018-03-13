function remove(arr, element) {
    arr.splice(arr.indexOf(element), 1);
    return arr.slice();
}

export {
    remove
}
