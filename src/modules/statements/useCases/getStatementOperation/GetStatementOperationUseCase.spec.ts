import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

interface IRequest {
    id: string;
    user_id: string;
}

describe("Get Statement Operation", () => {
    beforeEach(() => {
        statementsRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    });

    it("should be able to find a user and statement", async () => {
        const newUser = {
            name: "User name",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute(newUser);

        const user = await usersRepositoryInMemory.findByEmail(newUser.email) as User;

        const statement: ICreateStatementDTO = {
            user_id: user.id!,
            type: 'deposit' as OperationType,
            amount: 15,
            description: "Dividendos"
        }

        const { id, user_id } = await createStatementUseCase.execute(statement) as IRequest;

        const getStatement = await getStatementOperationUseCase.execute({ user_id: user_id!, statement_id: id });

        expect(getStatement).toHaveProperty("id");
        expect(getStatement).toHaveProperty("user_id");
        expect(getStatement.user_id).toEqual(user_id);
    });

    it("should not be able to find a user and statement if user do not exists", async () => {
        expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: 'IncorrectUser',
                type: 'deposit' as OperationType,
                amount: 15,
                description: "Dividendos"
            }
    
            const { id, user_id } = await createStatementUseCase.execute(statement) as IRequest;
    
            await getStatementOperationUseCase.execute({ user_id: user_id!, statement_id: id });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

    it("should not be able to find a user and statement if user do not exists", async () => {
        expect(async () => {
            const newUser = {
                name: "User name",
                email: "email@test.com",
                password: "1234"
            }
    
            await createUserUseCase.execute(newUser);
    
            const user = await usersRepositoryInMemory.findByEmail(newUser.email) as User;

            await getStatementOperationUseCase.execute({ user_id: user.id!, statement_id: 'Incorrect Statement' });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });
});