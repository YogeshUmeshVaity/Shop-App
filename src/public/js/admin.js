const deleteProduct = (button) => {
    // Extract the productId and csrf from the hidden inputs in admin/product-list.ejs
    const productId = button.parentNode.querySelector('[name=productId]').value
    const csrf = button.parentNode.querySelector('[name=_csrf]').value

    const productElement = button.closest('article')

    // Our csrf package not only automatically looks for the token in the body but also the headers.
    fetch('/admin/delete-product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then((result) => {
            return result.json()
        })
        .then((jsonData) => {
            console.log(jsonData)
            productElement.parentNode.removeChild(productElement)
        })
        .catch((error) => {
            console.log(error)
        })
}
