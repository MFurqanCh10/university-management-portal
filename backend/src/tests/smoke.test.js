import request from "supertest";
import app from "../app.js";

describe("Health API", () => {
  test("GET /api/health returns 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "University API is running",
    });
  });
});
