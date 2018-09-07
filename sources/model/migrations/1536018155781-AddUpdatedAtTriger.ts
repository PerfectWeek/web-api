import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUpdatedAtTriger1536018155781 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE OR REPLACE FUNCTION trigger_set_updated_time()\n" +
            "RETURNS TRIGGER AS $func$\n" +
            "BEGIN\n" +
            "    NEW.updated_at = NOW();\n" +
            "    RETURN NEW;\n" +
            "END;" +
            "$func$ LANGUAGE plpgsql;");

        await queryRunner.query( "CREATE TRIGGER user_update\n" +
            "BEFORE UPDATE ON users\n" +
            "    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TRIGGER IF EXISTS user_update ON users");

        await queryRunner.query("DROP FUNCTION IF EXISTS trigger_set_updated_time");
    }

}
