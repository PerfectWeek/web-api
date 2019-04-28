import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOauthProviders1556378693678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD "google_provider_payload" json`);
        await queryRunner.query(`ALTER TABLE "users" ADD "facebook_provider_payload" json`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ciphered_password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "ciphered_password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebook_provider_payload"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_provider_payload"`);
    }

}
