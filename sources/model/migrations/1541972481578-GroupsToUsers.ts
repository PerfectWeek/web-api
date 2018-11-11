import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupsToUsers1541972481578 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "groups_to_users" ("id" SERIAL NOT NULL, "user_id" integer, "group_id" integer, CONSTRAINT "PK_a8114e42d9e474a612ecfb77ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" ADD CONSTRAINT "FK_5846e520812656aee148e1f22ce" FOREIGN KEY ("user_id") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" ADD CONSTRAINT "FK_a4107fb390defd8294600e45bc8" FOREIGN KEY ("group_id") REFERENCES "groups"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups_to_users" DROP CONSTRAINT "FK_a4107fb390defd8294600e45bc8"`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" DROP CONSTRAINT "FK_5846e520812656aee148e1f22ce"`);
        await queryRunner.query(`DROP TABLE "groups_to_users"`);
    }

}
