import {MigrationInterface, QueryRunner} from "typeorm";

export class GroupsRemoveOwner1543379836795 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_4d8d8897aef1c049336d8dde13f"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "groups" ALTER COLUMN "nb_members" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "groups" ALTER COLUMN "nb_members" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "groups_to_users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "groups" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_4d8d8897aef1c049336d8dde13f" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
