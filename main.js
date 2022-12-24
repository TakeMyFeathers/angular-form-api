import express from 'express';
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {Low} from 'lowdb'
import {JSONFile} from 'lowdb/node'
import _ from 'loadsh';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')

const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()

db.data ||= {users: []}

const app = express();
app.use(express.json())

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get('/api/user', (req, res, next) => {
    if (db.data.users.length === 0) {
        res.json([]);
    } else {
        res.json(db.data.users);
    }
    next();
})

app.post('/api/user', (req, res) => {
    let lastId = 0;
    if (db.data.users.length !== 0) {
        lastId = _.takeRight(db.data.users, 1)[0].id || 0;
    }

    db.data.users.push({id: lastId + 1, ...req.body})
    db.write().then(() => {
        res.json({id: lastId + 1, ...req.body})
    })
})

app.delete('/api/user/:id', (req, res) => {
    db.data.users = db.data.users.filter((user) => parseInt(user.id) !== parseInt(req.params.id));
    db.write().then(() => {
        res.json({id: req.params.id})
    })
})

app.put('/api/user/:id', (req, res) => {
    const index = db.data.users.findIndex((user) => parseInt(user.id) === parseInt(req.params.id));
    db.data.users[index] = req.body;
    db.write().then(() => {
        res.json({id: db.data.users[index].id})
    })
})
