-- CreateEnum
CREATE TYPE "BurnType" AS ENUM ('REGCLEAN', 'PARTICULAR');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('APPROVED', 'PENDING', 'DENIED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('REGULAR', 'ICNF', 'CM');

-- CreateEnum
CREATE TYPE "StateUser" AS ENUM ('ENABLED', 'DISABLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nif" INTEGER,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "type" "UserType" NOT NULL DEFAULT 'REGULAR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "state" "StateUser" NOT NULL DEFAULT 'ENABLED',
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "burns" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "other_data" TEXT,
    "distrito" TEXT NOT NULL,
    "concelho" TEXT NOT NULL,
    "freguesia" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "BurnType" NOT NULL DEFAULT 'REGCLEAN',
    "state" "State" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "burns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tax_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'APPROVED',
    "responsible" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nif_key" ON "users"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_name_key" ON "municipalities"("name");

-- AddForeignKey
ALTER TABLE "burns" ADD CONSTRAINT "burns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_responsible_fkey" FOREIGN KEY ("responsible") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
