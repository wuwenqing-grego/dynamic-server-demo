const $form = $('#signinForm')
$form.on('submit', (e) => {
    e.preventDefault()
    const name = $form.find('input[name=name]').val()
    const password = $form.find('input[name=password]').val()
    console.log(name, password)
    $.ajax({
        method: 'POST',
        url: '/signin',
        contentType: 'text/json;charset=utf-8',
        data: JSON.stringify({name, password})
    }).then(() => {
        alert('Successfully signed in!')
        location.href = '/home.html'
    }, () => {
        alert('Wrong name or password!')
    })
})