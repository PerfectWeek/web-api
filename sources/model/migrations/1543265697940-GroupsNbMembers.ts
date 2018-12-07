import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupsNbMembers1543265697940 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" ADD "nb_members" integer NOT NULL DEFAULT 0`);

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

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS group_adjust_members_count ON groups");
        await queryRunner.query("DROP FUNCTION IF EXISTS group_members_update_count");

        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "nb_members"`);
    }

}
