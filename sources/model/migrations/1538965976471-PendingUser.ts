import {MigrationInterface, QueryRunner} from "typeorm";

export class PendingUser1538965976471 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "PendingUser" ("id" SERIAL NOT NULL, "pseudo" character varying(31) NOT NULL, "email" character varying NOT NULL, "ciphered_password" character varying NOT NULL, "validationUuid" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_ce44b39decbd98b5b3db1dd70a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6cb224f341ab33245e843989a2" ON "PendingUser"("pseudo") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_17a6382c459fe83d76ca90659c" ON "PendingUser"("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4572554418f15853929ef20d26" ON "PendingUser"("validationUuid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_4572554418f15853929ef20d26"`);
        await queryRunner.query(`DROP INDEX "IDX_17a6382c459fe83d76ca90659c"`);
        await queryRunner.query(`DROP INDEX "IDX_6cb224f341ab33245e843989a2"`);
        await queryRunner.query(`DROP TABLE "PendingUser"`);
    }

}
