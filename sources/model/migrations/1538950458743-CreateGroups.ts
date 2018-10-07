import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateGroups1538950458743 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query( "CREATE TRIGGER group_update\n" +
            "BEFORE UPDATE ON groups\n" +
            "    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS user_update ON users");
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
