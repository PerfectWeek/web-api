import {MigrationInterface, QueryRunner} from "typeorm";

export class PendingUser1539666286295 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "pending_users" ("id" SERIAL NOT NULL, "pseudo" character varying(31) NOT NULL, "email" character varying NOT NULL, "ciphered_password" character varying NOT NULL, "validation_uuid" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_4dcd5954b4aecb4d483a5c7e7d8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b4a73c1c9108d9290752567392" ON "pending_users"("pseudo") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_52d88bd887025f9814da7d2845" ON "pending_users"("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_59542ad5db934ba5364de29383" ON "pending_users"("validation_uuid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_59542ad5db934ba5364de29383"`);
        await queryRunner.query(`DROP INDEX "IDX_52d88bd887025f9814da7d2845"`);
        await queryRunner.query(`DROP INDEX "IDX_b4a73c1c9108d9290752567392"`);
        await queryRunner.query(`DROP TABLE "pending_users"`);
    }

}
