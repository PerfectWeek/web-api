import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupImage1547504587598 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" ADD "image" bytea`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "image"`);
    }

}
