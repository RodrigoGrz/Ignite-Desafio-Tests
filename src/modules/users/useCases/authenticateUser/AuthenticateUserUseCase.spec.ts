import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    });

    it("should be able to authenticate an user", async () => {
        const user = {
            name: "Name Test",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute(user);

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        expect(result).toHaveProperty("token");
    });

    it("should not be able to authenticate an nonexistent user", async () => {
        await expect(authenticateUserUseCase.execute({
            email: "false@email.com",
            password: "1234"
        })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should not be able to authenticate with incorrect password", async () => {
        const user = {
            name: "Name Test",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute(user);

        await expect(authenticateUserUseCase.execute({
            email: user.email,
            password: "inccorectPassword"
        })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
});