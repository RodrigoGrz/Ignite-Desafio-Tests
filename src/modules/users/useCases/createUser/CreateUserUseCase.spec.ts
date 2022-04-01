import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    })

    it("Should be able to create a user", async () => {
        const user = {
            name: "Name Test",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute({
            name: user.name,
            email: user.email,
            password: user.password
        });

        const userCreated = await usersRepositoryInMemory.findByEmail(user.email);

        expect(userCreated).toHaveProperty("id");
    });

    it("should not be able to create a user that already exists", async () => {
       expect(async () => {
        const user = {
            name: "Name Test",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute({
            name: user.name,
            email: user.email,
            password: user.password
        });

        await createUserUseCase.execute({
            name: user.name,
            email: user.email,
            password: user.password
        });
       }).rejects.toBeInstanceOf(CreateUserError);
    });
});