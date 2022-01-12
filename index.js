import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { parse } from "path";


console.log(chalk.bgBlueBright.black("Project Started"))

operation()

function operation(){

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que irá realizar ?',
        choices: [
            'Consultar Saldo',
            'Depositar',
            'Realizar Saque',
            'Criar Conta',
            'Sair'
        ]
    }])
    .then((answer) => {
        const action = answer['action']
        
        if (action == 'Criar Conta'){
            createAccount()
        } else if (action == 'Consultar Saldo'){
            getAccountBalance()
        } else if(action == 'Depositar'){
            deposit()
        } else if(action == 'Realizar Saque'){
            withdrawn()
        } else if(action == 'Sair'){
            console.log(chalk.bgWhite.black("Logoff realizado com sucesso, obrigado!"))
            process.exit()
        } else {
            console.log(err)
        }
    })
    .catch((err) => console.log(err))


}

function createAccount(){
    console.log(chalk.bgGrey.white("Obrigado por escolher o GeBanking !"))
    console.log("Defina as opções da sua conta abaixo:")
    buildAccount()
}


function buildAccount(){

    inquirer.prompt([
        {
            name: 'accountNumber',
            message: 'Digite o numero da sua conta:'
        }
    ]).then(answer => {
        const accNumber = answer['accountNumber']
        console.log(accNumber)

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${accNumber}.json`)){
            console.log(chalk.bgMagenta.black("Esta conta ja existe, escolha outro numero!"))
            buildAccount()
            return
        } 

        fs.writeFileSync(`accounts/${accNumber}.json`, '{"balance": 0}', function(err){
            console.log(err)
        })

        console.log(chalk.bgGreen.black("Bem-vindo(a) ao GeBanking, sua conta foi criada com sucesso!"))
        operation()

    }).catch((err) => console.log(err))
}


function deposit(){
    inquirer.prompt([
        {
            name: 'accountNum',
            message: 'Digite o numero da conta para deposito:'
        }
    ])
    .then((answer) => {
        const accNum = answer['accountNum']

        //verify account existance
        if(!checkAccount(accNum)){
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'depositAmount',
                message: 'Digite o valor que será depositado:'
            }
        ])
        .then((answer) => {
            const amount = answer['depositAmount']

            // add amount
            addAmount(accNum, amount)

            operation()
        })
        .catch(err => console.log(err))


    })
    .catch(err => console.log(err))

}

function checkAccount(accountNumber){
    
    if(!fs.existsSync(`accounts/${accountNumber}.json`)){
        console.log(chalk.bgRed.black("Essa conta não existe, tente novamente!"))
        return false
    }
        return true

}


function addAmount(accountNumber, amount){

    const account = getAccount(accountNumber)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!"))
        return deposit()
    }

    account.balance = parseFloat(amount) + parseFloat(account.balance)

    fs.writeFileSync(
        `accounts/${accountNumber}.json`,
        JSON.stringify(account),
        function(err) {
            console.log(err)
        }
        )

    console.log(chalk.green(`Deposito no valor de R$${amount} realizado com sucesso!`))

}


function getAccount(accountNumber){
    const accountJson = fs.readFileSync(`accounts/${accountNumber}.json`, {
    encoding: 'utf8',
    flag: 'r'
    })

    return JSON.parse(accountJson)
}


/**function checkBalance(accountNumber){
    const account = getAccount(accountNumber)

    if(!checkAccount(accountNumber)){
        return operation()
    }
    console.log(chalk.bgBlue(`Saldo da conta: ${account.balance}`))
    return operation()

}*/

function getAccountBalance(){
    inquirer.prompt([
        {
            name: 'accountNum',
            message: 'Digite o numero da conta para realizar consulta:'
        }
    ]).then((answer) => {
        const accNum = answer['accountNum']

        if(!checkAccount(accNum)){
            return getAccountBalance()
        }

        const account = getAccount(accNum)
        console.log(chalk.bgBlue(`Saldo da conta: ${account.balance}`))
        return operation()
    })
    .catch(err => console.log(err))
}

function withdrawn(){
    inquirer.prompt([
        {
            name: 'accountNum',
            message: 'Digite o numero da conta para realizar o saque:'
        }
    ])
    .then((answer) => {
        const accNum = answer['accountNum']

        //verify account existance
        if(!checkAccount(accNum)){
            return withdrawn()
        }

        inquirer.prompt([
            {
                name: 'withdrawnAmount',
                message: 'Digite o valor que deseja sacar:'
            }
        ])
        .then((answer) => {
            const amount = answer['withdrawnAmount']

            // add amount
            removeAmount(accNum, amount)

            
        })
        .catch(err => console.log(err))


    })
    .catch(err => console.log(err))

}


function removeAmount(accountNumber, amount){

    const account = getAccount(accountNumber)

    if(!amount){
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"))
        return operation()
    } else if(amount>account.balance){
        console.log(chalk.bgRed.black("Valor indisponível, tente novamente!"))
        return withdrawn()
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountNumber}.json`,
        JSON.stringify(account),
        function(err) {
            console.log(err)
        }
        )

    console.log(chalk.green(`Saque no valor de R$${amount} realizado com sucesso, retire o dinheiro abaixo!`))
    return operation()
}