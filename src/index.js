const express = require("express");
const { v4: uuidV4 } = require("uuid")
const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ "error": "Customer not found" });
    }

    request.customer = customer;

    return next();
}

app.post("/account", (request, response) => {
    const { name, cpf } = request.body;

    const customerAlreadyExists = customers.some(
        custumer => custumer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }

    customers.push({
        id: uuidV4(),
        name,
        cpf,
        statement: []
    });

    return response.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.listen(3333, console.log("Server is live..."))