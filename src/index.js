const express = require("express");
const { v4: uuidV4 } = require("uuid")
const app = express();

app.use(express.json());

const custumers = [];

app.post("/account", (request, response) => {
    const { name, cpf } = request.body;

    const customerAlreadyExists = custumers.some(
        custumer => custumer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }

    custumers.push({
        id: uuidV4(),
        name,
        cpf,
        statement: []
    });

    return response.status(201).send();
});

app.listen(3333, console.log("Server is live..."))