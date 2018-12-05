import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupsRefacto1544045424849 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS group_update ON groups");
        await queryRunner.query("DROP TRIGGER IF EXISTS group_members_update_count ON groups_to_users");
        await queryRunner.query("DROP FUNCTION IF EXISTS group_adjust_members_count");

        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "nb_members"`);
        await queryRunner.query(`ALTER TABLE "calendars" ADD "nb_owners" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "description" character varying NOT NULL`);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION calendar_adjust_owners_count()
            RETURNS TRIGGER AS
            $$
                DECLARE
                BEGIN
                IF TG_OP = 'INSERT' THEN
                    UPDATE "calendars" SET nb_owners = nb_owners + 1 WHERE id = NEW.calendar_id;
                    RETURN NEW;
                ELSIF TG_OP = 'DELETE' THEN
                    UPDATE "calendars" SET nb_owners = nb_owners - 1 WHERE id = OLD.calendar_id;
                    RETURN OLD;
                END IF;
                END;
            $$ LANGUAGE 'plpgsql';
        `);
        await queryRunner.query(`
            CREATE TRIGGER calendar_owners_update_count
                BEFORE INSERT OR DELETE ON calendars_to_owners
                    FOR EACH ROW EXECUTE PROCEDURE calendar_adjust_owners_count();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS calendar_owners_update_count");
        await queryRunner.query("DROP FUNCTION IF EXISTS calendar_adjust_owners_count");

        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "calendars" DROP COLUMN "nb_owners"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "nb_members" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "name" character varying NOT NULL`);

        await queryRunner.query( `
            CREATE TRIGGER group_update
                BEFORE UPDATE ON groups
                    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION group_adjust_members_count()
            RETURNS TRIGGER AS
            $$
                DECLARE
                BEGIN
                IF TG_OP = 'INSERT' THEN
                    UPDATE "groups" SET nb_members = nb_members + 1 WHERE id = NEW.group_id;
                    RETURN NEW;
                ELSIF TG_OP = 'DELETE' THEN
                    UPDATE "groups" SET nb_members = nb_members - 1 WHERE id = OLD.group_id;
                    RETURN OLD;
                END IF;
                END;
            $$ LANGUAGE 'plpgsql';
        `);
        await queryRunner.query(`
            CREATE TRIGGER group_members_update_count
                BEFORE INSERT OR DELETE ON groups_to_users
                    FOR EACH ROW EXECUTE PROCEDURE group_adjust_members_count();
        `);
    }

}
