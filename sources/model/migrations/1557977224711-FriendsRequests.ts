import {MigrationInterface, QueryRunner} from "typeorm";

export class FriendsRequests1557977224711 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "friend_relations" ("requesting_id" integer NOT NULL, "requested_id" integer NOT NULL, "confirmed" boolean NOT NULL, CONSTRAINT "PK_2fd18cab29affd122ebc5a1f8c1" PRIMARY KEY ("requesting_id", "requested_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b9d7db4e28852ed7ca12d575f" ON "friend_relations" ("requested_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_6b9d7db4e28852ed7ca12d575f"`);
        await queryRunner.query(`DROP TABLE "friend_relations"`);
    }

}
