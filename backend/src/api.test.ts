import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import app from "./app";
import { prisma } from "./lib/prisma";

const testEmail = `api-test-${Date.now()}@example.com`;
let userId: number;
let branchId: number;
let token: string;
let checkInId: number;

describe("GymTrack API", () => {
  before(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        fullName: "API Test User",
        phone: `09${String(Date.now()).slice(-8)}`,
        address: "Test address",
        dateOfBirth: new Date("2000-01-01"),
      },
    });
    userId = user.id;

    const branch = await prisma.branch.create({
      data: {
        name: "API Test Branch",
        address: "Test branch address",
        qrCode: `api-test-${Date.now()}`,
      },
    });
    branchId = branch.id;

    await prisma.membership.create({
      data: {
        userId,
        packageName: "API Test Membership",
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        status: "ACTIVE",
      },
    });
  });

  it("logs in and returns a JWT", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "password123" });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data.token, "string");
    token = response.body.data.token;
  });

  it("gets the authenticated profile", async () => {
    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.id, userId);
    assert.equal(response.body.data.user.email, testEmail);
  });

  it("creates a check-in and blocks a duplicate active check-in", async () => {
    const response = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${token}`)
      .send({ branchId });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.checkIn.branchId, branchId);
    checkInId = response.body.data.checkIn.id;

    const duplicate = await request(app)
      .post("/api/check-ins")
      .set("Authorization", `Bearer ${token}`)
      .send({ branchId });

    assert.equal(duplicate.status, 409);
  });

  it("checks out and returns the history", async () => {
    const checkout = await request(app)
      .post(`/api/check-ins/${checkInId}/checkout`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(checkout.status, 200);
    assert.equal(typeof checkout.body.data.checkIn.checkedOutAt, "string");

    const history = await request(app)
      .get("/api/check-ins")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(history.status, 200);
    assert.equal(history.body.data.checkIns.length, 1);
  });

  after(async () => {
    await prisma.checkIn.deleteMany({ where: { userId } });
    await prisma.membership.deleteMany({ where: { userId } });
    await prisma.branch.delete({ where: { id: branchId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });
});
