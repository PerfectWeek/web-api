import {MigrationInterface, QueryRunner} from "typeorm";

export class EventImage1547576173091 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events" ADD "image" bytea`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "image"`);
    }

}
