import {MigrationInterface, QueryRunner} from "typeorm";

export class CalendarOwnerRole1557713856726 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" ADD "role" character varying NOT NULL DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" ADD "confirmed" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" DROP COLUMN "confirmed"`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" DROP COLUMN "role"`);
    }

}
