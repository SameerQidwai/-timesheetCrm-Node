import {MigrationInterface, QueryRunner} from "typeorm";

export class delegateContactPersonId1625560497646 implements MigrationInterface {
    name = 'delegateContactPersonId1625560497646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organizations` DROP FOREIGN KEY IF EXISTS `FK_ea7c37ea7af49ca216dfaf04eba`");
        await queryRunner.query("ALTER TABLE `organizations` CHANGE `delegate_contact_person_organization_id` `delegate_contact_person_id` int NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organizations` CHANGE `delegate_contact_person_id` `delegate_contact_person_organization_id` int NULL DEFAULT NULL");
        await queryRunner.query("ALTER TABLE `organizations` ADD CONSTRAINT `FK_ea7c37ea7af49ca216dfaf04eba` FOREIGN KEY (`delegate_contact_person_organization_id`) REFERENCES `contact_person_organizations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }
}
