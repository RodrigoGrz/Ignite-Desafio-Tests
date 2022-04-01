import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("List User", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    });

    it("should be able to list a user", async () => {
        const createUser = {
            name: "User Name",
            email: "email@test.com",
            password: "1234"
        }

        await createUserUseCase.execute(createUser);

        const findUser = await usersRepositoryInMemory.findByEmail(createUser.email) as User;

        const user = await showUserProfileUseCase.execute(findUser.id!);

        expect(user).toHaveProperty("id");
        expect(user.name).toBe(createUser.name);
    });

    it("should not be able to list a user that do not exists", async () => {
        expect(async () => {
             await showUserProfileUseCase.execute('idFake');
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });
});