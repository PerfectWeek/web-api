import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEventType1554653238596 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" DROP CONSTRAINT "FK_2939cc6968b1d6477a6c4b4811d"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" ADD CONSTRAINT "FK_309ab9881c43c44aef8222cc9da" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" DROP CONSTRAINT "FK_309ab9881c43c44aef8222cc9da"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" ADD CONSTRAINT "FK_2939cc6968b1d6477a6c4b4811d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
