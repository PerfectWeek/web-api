import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEventStatus1557840926546 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events_to_attendees" ADD "status" character varying NOT NULL DEFAULT 'going'`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events_to_attendees" DROP COLUMN "status"`);
    }

}
