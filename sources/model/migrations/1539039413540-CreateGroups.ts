import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateGroups1539039413540 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "owner_id" integer, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_groups_groups" ("usersId" integer NOT NULL, "groupsId" integer NOT NULL, CONSTRAINT "PK_1cf09013aa7a345778eaeb5a421" PRIMARY KEY ("usersId", "groupsId"))`);
        await queryRunner.query(`CREATE TABLE "groups_members_users" ("groupsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_aacc8c398c958065d0fb9ade5f3" PRIMARY KEY ("groupsId", "usersId"))`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_5d7af25843377def343ab0beaa8" FOREIGN KEY ("owner_id") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" ADD CONSTRAINT "FK_1b46034fbd69664807cb4afb16f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" ADD CONSTRAINT "FK_270e39efd76d142903fd6ed528f" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" ADD CONSTRAINT "FK_d4c0ebc8975c79db415dd697b6e" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" ADD CONSTRAINT "FK_85216effb9522043296472d5b8f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE`);

        await queryRunner.query( "CREATE TRIGGER group_update\n" +
            "BEFORE UPDATE ON groups\n" +
            "    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS group_update ON groups");

        await queryRunner.query(`ALTER TABLE "groups_members_users" DROP CONSTRAINT "FK_85216effb9522043296472d5b8f"`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" DROP CONSTRAINT "FK_d4c0ebc8975c79db415dd697b6e"`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" DROP CONSTRAINT "FK_270e39efd76d142903fd6ed528f"`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" DROP CONSTRAINT "FK_1b46034fbd69664807cb4afb16f"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_5d7af25843377def343ab0beaa8"`);
        await queryRunner.query(`DROP TABLE "groups_members_users"`);
        await queryRunner.query(`DROP TABLE "users_groups_groups"`);
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
