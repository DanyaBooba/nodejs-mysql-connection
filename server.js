const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = process.env.PORT || 8000

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'usersdb',
    password: 'password'
})

connection.connect(err => {
    if (err) {
        return console.log(`Ошибка при подключении к БД MySQL: ${err}`)
    }

    console.log('Подключен к серверу MySQL')
})

// Производим выполнение SQL-запроса на получение всех полей
connection.execute('SELECT * FROM users', (err, res) => {
    console.log(err)
    console.log(res)
})

const addNewUser = {
    data: [4, 'Новый', 'Пользователь', 'newuser'],
    sql: `INSERT INTO users VALUE (?, ?, ?, ?)`,
}

connection.execute(addNewUser.sql, addNewUser.data, (err, res) => {
    if (err) {
        return console.log(`Ошибка при добавлении нового пользователя: ${err}`)
    }

    console.log(res)
})

// Сообщение о том, что сервер запущен и прослушивает указанный порт
app.listen(port, () => console.log(`Listening on port ${port}`))

// Создание GET маршрутов

app.get('/', (req, res) => {
    const data = {
        route: '/',
        routeName: 'Главная страница',
        data: 'Вы получили данные с главной страницы'
    }

    res.send(data)
})
