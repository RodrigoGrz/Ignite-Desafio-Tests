import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

interface IRequest {
    id: string;
}

describe("Get Balance", () => {
    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    });

    it("should be able to list a user balance", async () => {
        const user = {
            name: "User name",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute(user);

        const { id } = await usersRepositoryInMemory.findByEmail(user.email) as IRequest;

        const statementDeposit: ICreateStatementDTO = {
            user_id: id,
            type: 'deposit' as OperationType,
            amount: 40,
            description: "Dividendo"
        }

        await createStatementUseCase.execute(statementDeposit);

        const statement = await getBalanceUseCase.execute({ user_id: id });

        expect(statement).toHaveProperty("balance");
        expect(statement.balance).toEqual(statementDeposit.amount);
    });

    it("should not be able to list a user balance if user do not exists", async () => {
        expect(async () => {
            await getBalanceUseCase.execute({ user_id: 'WrongId' });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });
});