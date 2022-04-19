import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to create a statement balance", async () => {
        await request(app).post("/api/v1/users").send({
            name: "Name supertest",
            email: "email@test.com",
            password: "1234"
        });

        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "email@test.com",
            password: "1234"
        });

        const { token } = responseToken.body;

        const response = await request(app).post("/api/v1/statements/deposit").send({
            amount: "15",
            description: "Salario"
        }).set({
            Authorization: `Bearer ${token}`
        });

        expect(response.status).toBe(201);
    });

    it("should be able to create a statement withdraw", async () => {
        await request(app).post("/api/v1/users").send({
            name: "Name supertest",
            email: "email@test.com",
            password: "1234"
        });

        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "email@test.com",
            password: "1234"
        });

        const { token } = responseToken.body;

        const response = await request(app).post("/api/v1/statements/deposit").send({
            amount: "10",
            description: "Pizza"
        }).set({
            Authorization: `Bearer ${token}`
        });

        expect(response.status).toBe(201);
    });
});