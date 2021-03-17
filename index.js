const express = require('express');

const app = express();

const { v4: uuidv4 } = require('uuid');

app.use(express.json());

const customers = [];

function verifyIfAlreadyExistsCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return response.json({ error: 'Customer not found'});
    }

    request.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        } else if(operation.type === 'debit'){
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return response.status(400).json({error: 'Customer already exists!'});
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();

});

app.get('/statement',  verifyIfAlreadyExistsCPF,(request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
})

app.post('/deposit', verifyIfAlreadyExistsCPF,(request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'

    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.post('/withDraw',  verifyIfAlreadyExistsCPF,(request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return response.status(400).json({ error: 'Insufficent funds'})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperation);

    return response.status(201).send()
})

app.get('/statement/date',  verifyIfAlreadyExistsCPF,(request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormatted = new Date(date + ' 00:00');
    
    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormatted).toDateString());

    return response.json(customer.statement);
})

app.put('/account',  verifyIfAlreadyExistsCPF,(request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;

    return response.status(201).send();
})

app.get('/account', verifyIfAlreadyExistsCPF, (request, response) => {
    const { customer } = request;

    return response.status(201).json(customer)
})

app.delete('/account',  verifyIfAlreadyExistsCPF, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers);
})

app.get('/balance', verifyIfAlreadyExistsCPF, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})

app.listen(3333)