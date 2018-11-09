import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupUserRelation1541780846647 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "groups_to_users" ("group_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_e5562e8b65a2a0671e1b7871ff9" PRIMARY KEY ("group_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "groups_to_users_user_id_idx" ON groups_to_users (user_id)`);
        await queryRunner.query(`CREATE INDEX "groups_to_users_group_id_idx" ON groups_to_users (group_id)`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" ADD CONSTRAINT "FK_a4107fb390defd8294600e45bc8" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" ADD CONSTRAINT "FK_5846e520812656aee148e1f22ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups_to_users" DROP CONSTRAINT "FK_5846e520812656aee148e1f22ce"`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" DROP CONSTRAINT "FK_a4107fb390defd8294600e45bc8"`);
        await queryRunner.query(`DROP INDEX "groups_to_users_user_id_idx"`);
        await queryRunner.query(`DROP INDEX "groups_to_users_group_id_idx"`);
        await queryRunner.query(`DROP TABLE "groups_to_users"`);
    }

}
