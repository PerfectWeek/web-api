import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupUserRelationRemove1541780060535 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups_members_users" DROP CONSTRAINT "FK_85216effb9522043296472d5b8f"`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" DROP CONSTRAINT "FK_d4c0ebc8975c79db415dd697b6e"`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" DROP CONSTRAINT "FK_270e39efd76d142903fd6ed528f"`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" DROP CONSTRAINT "FK_1b46034fbd69664807cb4afb16f"`);
        await queryRunner.dropTable("groups_members_users");
        await queryRunner.dropTable("users_groups_groups");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "users_groups_groups" ("usersId" integer NOT NULL, "groupsId" integer NOT NULL, CONSTRAINT "PK_1cf09013aa7a345778eaeb5a421" PRIMARY KEY ("usersId", "groupsId"))`);
        await queryRunner.query(`CREATE TABLE "groups_members_users" ("groupsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_aacc8c398c958065d0fb9ade5f3" PRIMARY KEY ("groupsId", "usersId"))`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" ADD CONSTRAINT "FK_1b46034fbd69664807cb4afb16f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_groups_groups" ADD CONSTRAINT "FK_270e39efd76d142903fd6ed528f" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" ADD CONSTRAINT "FK_d4c0ebc8975c79db415dd697b6e" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_members_users" ADD CONSTRAINT "FK_85216effb9522043296472d5b8f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

}
