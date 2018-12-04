import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCalendarsAndEvents1543881541232 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "events" ("id" SERIAL NOT NULL, "name" character varying(256) NOT NULL, "description" character varying NOT NULL, "location" character varying NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "calendarId" integer, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "calendars" ("id" SERIAL NOT NULL, "name" character varying(256) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_90dc0330e8ec9028e23c290dee8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "calendars_to_owners" ("calendar_id" integer NOT NULL, "owner_id" integer NOT NULL, CONSTRAINT "PK_3a6156255d3cb059af56a0e6eab" PRIMARY KEY ("calendar_id", "owner_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7970f061a912c523eb80ffafa5" ON "calendars_to_owners"  ("owner_id") `);
        await queryRunner.query(`CREATE TABLE "events_to_attendees" ("event_id" integer NOT NULL, "attendee_id" integer NOT NULL, CONSTRAINT "PK_01748c2cc74f300366636318243" PRIMARY KEY ("event_id", "attendee_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_58b1381d958d41f3d5d6316c5b" ON "events_to_attendees"  ("attendee_id") `);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_d34b052f17ba7e1af21ba110bb2" FOREIGN KEY ("calendarId") REFERENCES "calendars"("id")`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" ADD CONSTRAINT "FK_9344738a6644a3cefdeacb617b7" FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id")`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" ADD CONSTRAINT "FK_7970f061a912c523eb80ffafa54" FOREIGN KEY ("owner_id") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "events_to_attendees" ADD CONSTRAINT "FK_f75afdeda0f3a7ee0f2d5785bfa" FOREIGN KEY ("event_id") REFERENCES "events"("id")`);
        await queryRunner.query(`ALTER TABLE "events_to_attendees" ADD CONSTRAINT "FK_58b1381d958d41f3d5d6316c5b6" FOREIGN KEY ("attendee_id") REFERENCES "users"("id")`);

        await queryRunner.query( `CREATE TRIGGER calendar_update
            BEFORE UPDATE ON calendars
                FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();`);
        await queryRunner.query( `CREATE TRIGGER event_update
            BEFORE UPDATE ON events
                FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS calendar_update ON calendars");
        await queryRunner.query("DROP TRIGGER IF EXISTS event_update ON events");

        await queryRunner.query(`ALTER TABLE "events_to_attendees" DROP CONSTRAINT "FK_58b1381d958d41f3d5d6316c5b6"`);
        await queryRunner.query(`ALTER TABLE "events_to_attendees" DROP CONSTRAINT "FK_f75afdeda0f3a7ee0f2d5785bfa"`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" DROP CONSTRAINT "FK_7970f061a912c523eb80ffafa54"`);
        await queryRunner.query(`ALTER TABLE "calendars_to_owners" DROP CONSTRAINT "FK_9344738a6644a3cefdeacb617b7"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_d34b052f17ba7e1af21ba110bb2"`);
        await queryRunner.query(`DROP INDEX "IDX_58b1381d958d41f3d5d6316c5b"`);
        await queryRunner.query(`DROP TABLE "events_to_attendees"`);
        await queryRunner.query(`DROP INDEX "IDX_7970f061a912c523eb80ffafa5"`);
        await queryRunner.query(`DROP TABLE "calendars_to_owners"`);
        await queryRunner.query(`DROP TABLE "calendars"`);
        await queryRunner.query(`DROP TABLE "events"`);
    }

}
