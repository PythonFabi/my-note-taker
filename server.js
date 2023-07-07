const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require('uniqid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error'});
        } else {
            const parsedData = JSON.parse(data);
            res.json(parsedData);
        }
    });
});

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a review`);

    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            noteId: uniqid()
        };

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if(err) {
                return;
            }

            const parsedData = JSON.parse(data);

            parsedData.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
            err
            ? console.error(err)
            : console.log(
                `New Note with the title ${newNote.title} has been added to Notes database.`
            )
        );
    });


    const response = {
        status: 'success',
        body: newNote,
    }; 

    console.log(response);
    res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting notes');
    }
});

app.get('/api/notes/:id', (req, res) => {
   console.info(`${req.method} request received to get complete note`);
   fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err,data) => {
    if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } else {
        const parsedData = JSON.parse(data);
        const noteId = req.params.id;
        const note = parsedData.find((note) => note.noteId === noteId);

        if (note) {
            res.json(note);
        } else {
            res.status(404).send('Note not found')
        }
    }
   });
});

app.delete('/api/notes/:id', (req, res) => {
    console.info(`${req.method} request received to delete a note`);
    const noteId = req.params.id;
    fs.readFile(path.join(__dirname, '/db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            let parsedData = JSON.parse(data); 
            const updatedData = parsedData.filter((note) => note.noteId !== noteId);

            fs.writeFile(path.join(__dirname, '/db/db.json'), JSON.stringify(updatedData, null, 4), (err) => {
                if(err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                } else {
                    res.status(204).end();
                }
            });
        }
    });
});


app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);