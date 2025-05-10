const express = require('express')
const pool = require('./db')
const app = express()
const port = process.env.PORT || 8000

async function getAllUsers() {
    try {
        const [rows] = await pool.query('SELECT * FROM users')
        return rows
    } catch (err) {
        console.error(`Ошибка при получении пользователей: ${err.message}`)
        throw err
    }
}

async function getUserById(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows.length == 0 ? {} : rows[0]
    } catch (err) {
        console.error(`Ошибка при поиске пользователя: ${err.message}`)
        throw err
    }
}

async function createUser(firstName, lastName, username) {
    try {
        const [result] = await pool.query(
            'INSERT INTO users (firstName, lastName, username) VALUES (?, ?, ?)',
            [firstName, lastName, username]
        );

        console.log('Пользователь создан, ID:', result.insertId);
        return result.insertId;
    } catch (err) {
        console.error(`Ошибка при создании пользователя: ${err.message}`);
        throw err;
    }
}

async function updateUserFull(id, newData) {
    try {
        const { firstName, lastName, username } = newData;
        const [result] = await pool.query(
            'UPDATE users SET firstName = ?, lastName = ?, username = ? WHERE id = ?',
            [firstName, lastName, username, id]
        );
        if (result.affectedRows === 0) {
            console.log('Пользователь не найден');
            return false;
        }
        console.log('Пользователь обновлён');
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении:', error.message);
        throw error;
    }
}

async function updateUser(id, newData) {
    try {
        const fields = Object.keys(newData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(newData);
        values.push(id);

        const [result] = await pool.query(
            `UPDATE users SET ${fields} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Ошибка при обновлении:', error.message);
        throw error;
    }
}

async function deleteUser(id) {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id])
        if (result.affectedRows === 0) {
            console.log('Пользователь не найден')
            return false
        }
        console.log('Пользователь удалён')
        return true
    } catch (error) {
        console.error('Ошибка при удалении:', error.message)
        throw error
    }
}

// Создание GET маршрутов

app.use(express.json())

app.get('/users', async (req, res) => {
    if (req.query.id) {
        try {
            const user = await getUserById(req.query.id)
            res.json(user)
        }
        catch (err) {
            console.error(`Ошибка: ${err}`)
            res.status(500).json({ error: 'Ошибка на стороне сервера' })
        }
    }

    try {
        const users = await getAllUsers()
        res.json(users)
    }
    catch (err) {
        console.err(`Ошибка: ${err}`)
        res.status(500).json({ error: 'Ошибка на стороне сервера' })
    }
})

app.post('/users', async (req, res) => {
    try {
        const { firstName, lastName, username } = req.body;
        const userId = await createUser(firstName, lastName, username);
        res.status(201).json({ id: userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.patch('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const userData = req.body
        const statusUpdate = await updateUser(userId, userData);
        res.status(201).json({ status: statusUpdate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.put('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const { firstName, lastName, username } = req.body
        const statusUpdate = await updateUserFull(userId, { firstName, lastName, username });
        res.status(201).json({ status: statusUpdate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id
        const statusDelete = await deleteUser(userId)
        res.status(201).json({ status: statusDelete });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

// Сообщение о том, что сервер запущен и прослушивает указанный порт
app.listen(port, () => console.log(`Listening on port ${port}`))

process.on('SIGINT', () => {
    pool.end();
    process.exit();
});
