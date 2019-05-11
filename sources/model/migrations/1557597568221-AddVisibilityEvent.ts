import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVisibilityEvent1557597568221 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events" ADD "visibility" character varying NOT NULL DEFAULT 'private'`);
        await queryRunner.query("DROP TRIGGER IF EXISTS google_calendar_credentials_update ON google_calendar_credentials");
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" DROP CONSTRAINT "FK_309ab9881c43c44aef8222cc9da"`);
        await queryRunner.query(`DROP TABLE "google_calendar_credentials"`);

    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "visibility"`);
        await queryRunner.query(`CREATE TABLE "google_calendar_credentials" ("id" SERIAL NOT NULL, "access_token" character varying NOT NULL, "refresh_token" character varying NOT NULL, "scope" character varying NOT NULL, "token_type" character varying NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "user_id" integer, CONSTRAINT "REL_2939cc6968b1d6477a6c4b4811" UNIQUE ("user_id"), CONSTRAINT "PK_e7a93ef1fb32e6d881c2d614d7a" PRIMARY KEY ("id", "access_token"))`);
        await queryRunner.query(`ALTER TABLE "google_calendar_credentials" ADD CONSTRAINT "FK_309ab9881c43c44aef8222cc9da" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query( `CREATE TRIGGER google_calendar_credentials_update
            BEFORE UPDATE ON google_calendar_credentials
                FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();`);
    }

}
