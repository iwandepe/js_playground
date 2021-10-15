import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTest1634259494759 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE tests (id SERIAL NOT NULL, name varchar(100) NOT NULL, password varchar(255) NOT NULL, email varchar(200) NOT NULL, PRIMARY KEY (id));',
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tests');
  }
}
