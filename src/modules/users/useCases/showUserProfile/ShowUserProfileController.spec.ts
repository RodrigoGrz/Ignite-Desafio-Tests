import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to list user profile", async () => {
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

        const response = await request(app).get("/api/v1/profile").set({
            Authorization: token
        });

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
    });
});