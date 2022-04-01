import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { ICreateStatementDTO } from './ICreateStatementDTO';

let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    });

    it("should be able to create a statement deposit", async() => {
        const user = {
            name: "Name Test",
            email: "name@email.com",
            password: "1234"
        }

        await createUserUseCase.execute(user);

        const findUser = await usersRepositoryInMemory.findByEmail(user.email) as User;

        const statement: ICreateStatementDTO = {
            user_id: findUser.id!,
            type: 'deposit' as OperationType,
            amount: 15,
            description: "Dividendos"
        }

        const createStatement = await createStatementUseCase.execute(statement);

        expect(createStatement).toHaveProperty("id");
        expect(createStatement.type).toEqual("deposit");
    });

    it("should be able to create a statement withdraw", async () => {
        const user = {
            name: "Name Test",
            email: "name@email.com",
            password: "1234"
        }

        await createUserUseCase.execute(user);

        const findUser = await usersRepositoryInMemory.findByEmail(user.email) as User;

        const statementDeposit: ICreateStatementDTO = {
            user_id: findUser.id!,
            type: 'deposit' as OperationType,
            amount: 99,
            description: "Dividendos"
        }

        await createStatementUseCase.execute(statementDeposit);

        const statementWithdraw: ICreateStatementDTO = {
            user_id: findUser.id!,
            type: 'withdraw' as OperationType,
            amount: 40,
            description: "Pizza"
        }

        const createStatement = await createStatementUseCase.execute(statementWithdraw);

        expect(createStatement).toHaveProperty("id");
        expect(createStatement.type).toEqual("withdraw");
    });

    it("should not be able to create a statement withdraw if balance is less than amount", async () => {
        expect(async () => {
            const user = {
                name: "Name Test",
                email: "name@email.com",
                password: "1234"
            }
    
            await createUserUseCase.execute(user);
    
            const findUser = await usersRepositoryInMemory.findByEmail(user.email) as User;
    
            const statementDeposit: ICreateStatementDTO = {
                user_id: findUser.id!,
                type: 'deposit' as OperationType,
                amount: 10,
                description: "Dividendos"
            }
    
            await createStatementUseCase.execute(statementDeposit);
    
            const statementWithdraw: ICreateStatementDTO = {
                user_id: findUser.id!,
                type: 'withdraw' as OperationType,
                amount: 40,
                description: "Pizza"
            }
    
            await createStatementUseCase.execute(statementWithdraw);
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });
});