import {MigrationInterface, QueryRunner} from "typeorm";

export class googleCalendarCredentials1547478763922 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "google_calendar_credentials" ("id" SERIAL NOT NULL, "access_token" character varying NOT NULL, "refresh_token" character varying NOT NULL, "scope" character varying NOT NULL, "token_type" character varying NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "user_id" integer, CONSTRAINT "REL_2939cc6968b1d6477a6c4b4811" UNIQUE ("user_id"), CONSTRAINT "PK_e7a93ef1fb32e6d881c2d614d7a" PRIMARY KEY ("id", "access_token"))`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "location" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" ADD CONSTRAINT "FK_2939cc6968b1d6477a6c4b4811d" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" DROP CONSTRAINT "FK_2939cc6968b1d6477a6c4b4811d"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "location" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "google_calendar_credentials"`);
    }

}
