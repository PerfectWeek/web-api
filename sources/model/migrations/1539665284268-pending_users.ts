import {MigrationInterface, QueryRunner} from "typeorm";

export class pendingUsers1539665284268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_0ebb74f2945e006bc771167ec6"`);
        await queryRunner.query(`ALTER TABLE "pending_users" RENAME COLUMN "validationUuid" TO "validation_uuid"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_59542ad5db934ba5364de29383" ON "pending_users"("validation_uuid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_59542ad5db934ba5364de29383"`);
        await queryRunner.query(`ALTER TABLE "pending_users" RENAME COLUMN "validation_uuid" TO "validationUuid"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0ebb74f2945e006bc771167ec6" ON "pending_users"("validationUuid") `);
    }

}
