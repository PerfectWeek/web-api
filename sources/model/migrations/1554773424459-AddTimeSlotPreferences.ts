import {MigrationInterface, QueryRunner} from "typeorm";
import { baseTimeslotPreferences } from "../../utils/baseTimeslotPreferences";

export class AddTimeSlotPreferences1554773424459 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "calendars" ADD "timeslotPreferences" text NOT NULL DEFAULT ('${JSON.stringify(baseTimeslotPreferences)}')`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "calendars" DROP COLUMN "timeslotPreferences"`);
    }

}
