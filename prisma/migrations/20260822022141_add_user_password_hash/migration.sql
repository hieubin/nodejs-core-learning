-- Existing users receive an unusable hash and must reset their password.
ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '$2b$12$TzHY6jfYgqEeprOm.tjQUuOJxToFP/eJQY3Qb2IDUml1RbI.t3XNu';

ALTER TABLE "User"
ALTER COLUMN "passwordHash" DROP DEFAULT;
